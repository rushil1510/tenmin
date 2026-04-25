import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync, readFileSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home'
}));

const mockHomedir = '/tmp/tenmin-test-home';

import { getState, saveState, resetState, getThemeName, setThemeName } from './index.js';
import type { ThemeName } from '../ui/themes.js';

describe('Store Management', () => {
  const testTenminDir = join(mockHomedir, '.tenmin');
  const testStateFile = join(testTenminDir, 'state.json');

  beforeEach(() => {
    // Clean up test state before each test
    if (existsSync(testTenminDir)) {
      rmSync(testTenminDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after
    if (existsSync(testTenminDir)) {
      rmSync(testTenminDir, { recursive: true, force: true });
    }
  });

  it('getState should create default state if it does not exist', () => {
    const state = getState();
    expect(state).toBeDefined();
    expect(state.credits).toBe(500);
    expect(state.cart).toEqual([]);
    expect(state.orders).toEqual([]);
    expect(existsSync(testStateFile)).toBe(true);
  });

  it('saveState should persist state changes', () => {
    const state = getState();
    state.credits = 1000;
    saveState(state);

    const savedRaw = readFileSync(testStateFile, 'utf-8');
    const savedState = JSON.parse(savedRaw);
    expect(savedState.credits).toBe(1000);
    
    // Test that getState reads the new state
    const newState = getState();
    expect(newState.credits).toBe(1000);
  });

  it('resetState should restore default state', () => {
    const state = getState();
    state.credits = 1000;
    saveState(state);

    resetState();
    const newState = getState();
    expect(newState.credits).toBe(500); // Back to default
  });

  it('theme preferences should work correctly', () => {
    const initialTheme = getThemeName();
    expect(initialTheme).toBe('default');

    setThemeName('monokai' as ThemeName);
    expect(getThemeName()).toBe('monokai');
  });
});
