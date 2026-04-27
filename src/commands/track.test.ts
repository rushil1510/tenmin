import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';

const spinner = {
  start: vi.fn(),
  stop: vi.fn(),
  succeed: vi.fn(),
  text: '',
};

const hint = vi.fn();
const banner = vi.fn();
const warn = vi.fn();
const error = vi.fn();
const divider = vi.fn();
const getOrderStatus = vi.fn();

vi.mock('ora', () => ({
  default: vi.fn(() => spinner),
}));

vi.mock('../store/index.js', () => ({
  getState: vi.fn(() => ({
    orders: [
      {
        orderId: 'TM-2026-1234',
        items: [],
        total: 65,
        timestamp: new Date().toISOString(),
      },
    ],
  })),
  getThemeName: vi.fn(() => 'default'),
}));

vi.mock('../mock/swiggy-api.js', () => ({
  getOrderStatus,
}));

vi.mock('../ui/format.js', () => ({
  banner,
  warn,
  error,
  hint,
  divider,
}));

vi.mock('../ui/themes.js', () => ({
  getTheme: vi.fn(() => ({
    colors: {
      accent: '#f97316',
      divider: '#94a3b8',
      success: '#22c55e',
    },
    icons: {
      done: 'OK',
      hint: 'HINT',
      success: 'YES',
    },
  })),
}));

class FakeStdin extends EventEmitter {
  isTTY = true;
  isRaw = false;
  resume = vi.fn();
  setRawMode = vi.fn((value: boolean) => {
    this.isRaw = value;
  });
}

describe('trackCommand', () => {
  const originalStdin = process.stdin;
  const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    vi.useFakeTimers();
    spinner.start.mockReturnValue(spinner);
    spinner.stop.mockReset();
    spinner.succeed.mockReset();
    hint.mockReset();
    banner.mockReset();
    warn.mockReset();
    error.mockReset();
    divider.mockReset();
    getOrderStatus.mockReset();
    consoleLog.mockClear();
  });

  afterEach(() => {
    Object.defineProperty(process, 'stdin', {
      value: originalStdin,
      configurable: true,
    });
    vi.useRealTimers();
  });

  it.each(['q', '\r'])('stops live tracking when the user presses %j', async (key) => {
    const fakeStdin = new FakeStdin();
    Object.defineProperty(process, 'stdin', {
      value: fakeStdin,
      configurable: true,
    });

    getOrderStatus.mockResolvedValue({
      status: 'PREPARING',
      progress: 0.25,
      eta: '9 mins',
      statusText: 'Preparing your order',
    });

    const { trackCommand } = await import('./track.js');

    const run = trackCommand();
    await Promise.resolve();

    fakeStdin.emit('data', key);
    await vi.runAllTimersAsync();
    await run;

    expect(spinner.stop).toHaveBeenCalledTimes(1);
    expect(hint).toHaveBeenCalledWith('Stopped live tracking. Run `tenmin track` again anytime.');
    expect(fakeStdin.setRawMode).toHaveBeenCalledWith(true);
    expect(fakeStdin.setRawMode).toHaveBeenCalledWith(false);
    expect(fakeStdin.listenerCount('data')).toBe(0);
  });
});
