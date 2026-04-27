// ─────────────────────────────────────────────
// Tenmin — `track` command
// Live tracking for your active order
// ─────────────────────────────────────────────

import ora from 'ora';
import chalk from 'chalk';
import readline from 'node:readline';
import { getState } from '../store/index.js';
import { getOrderStatus, type OrderTracking } from '../mock/swiggy-api.js';
import { banner, warn, error, hint, divider } from '../ui/format.js';
import { getTheme } from '../ui/themes.js';
import { getThemeName } from '../store/index.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type DismissListener = {
  isDismissed(): boolean;
  cleanup(): void;
};

function createDismissListener(): DismissListener {
  let dismissed = false;

  const onData = (chunk: string | Buffer): void => {
    const input = chunk.toString();

    if (input === 'q' || input === 'Q' || input === '\r' || input === '\n') {
      dismissed = true;
    }
  };

  const stdin = process.stdin;

  if (!stdin.isTTY) {
    return {
      isDismissed: () => dismissed,
      cleanup: () => {},
    };
  }

  readline.emitKeypressEvents(stdin);
  const shouldRestoreRawMode = !stdin.isRaw;

  if (shouldRestoreRawMode && typeof stdin.setRawMode === 'function') {
    stdin.setRawMode(true);
  }

  stdin.resume();
  stdin.on('data', onData);

  return {
    isDismissed: () => dismissed,
    cleanup: () => {
      stdin.off('data', onData);

      if (shouldRestoreRawMode && typeof stdin.setRawMode === 'function') {
        stdin.setRawMode(false);
      }
    },
  };
}

export async function trackCommand(): Promise<void> {
  banner();

  const state = getState();
  if (state.orders.length === 0) {
    warn('You have no past or active orders to track.');
    hint('Run `tenmin order <item>` to place an order.');
    console.log();
    return;
  }

  // Get the most recent order
  const latestOrder = [...state.orders].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];

  const orderTime = new Date(latestOrder.timestamp).getTime();
  const now = Date.now();
  const elapsedMinutes = (now - orderTime) / 60000;

  console.log(chalk.bold.white(`  Tracking Order #${latestOrder.orderId}`));
  console.log();
  hint('Press `q` or Enter to stop live tracking.');
  console.log();

  if (elapsedMinutes > 30) {
    warn('This order was placed a while ago and has already been delivered.');
    console.log();
    return;
  }

  const theme = getTheme(getThemeName());
  
  const spinner = ora({
    text: chalk.dim('Fetching order status...'),
    indent: 2,
    color: 'cyan',
  }).start();

  let lastStatus = '';
  const dismissListener = createDismissListener();

  try {
    // Poll until delivered
    while (true) {
      const tracking = await getOrderStatus(latestOrder.orderId);

      if (tracking.status !== lastStatus) {
        lastStatus = tracking.status;

        // Visual progress bar
        const totalBlocks = 20;
        const filledBlocks = Math.round(tracking.progress * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
        
        const bar = 
          chalk.hex(theme.colors.accent)('█'.repeat(filledBlocks)) + 
          chalk.hex(theme.colors.divider)('░'.repeat(emptyBlocks));

        const icon = tracking.status === 'DELIVERED' ? theme.icons.done :
                     tracking.status === 'ON_THE_WAY' ? '🛵' :
                     tracking.status === 'PACKED' ? '🛍️ ' : '🍳';

        spinner.text = 
          `[${bar}] ${Math.round(tracking.progress * 100)}%\n` +
          `    ${icon} ${chalk.bold.white(tracking.statusText)}\n` +
          `    ${theme.icons.hint} ETA: ${chalk.hex(theme.colors.accent)(tracking.eta)}`;

        if (tracking.status === 'DELIVERED') {
          spinner.succeed(
            `[${bar}] 100%\n` +
            `    ${icon} ${chalk.bold.hex(theme.colors.success)(tracking.statusText)}\n` +
            `    ${theme.icons.success} Arrived!`
          );
          break;
        }
      }

      if (dismissListener.isDismissed()) {
        spinner.stop();
        hint('Stopped live tracking. Run `tenmin track` again anytime.');
        break;
      }

      // Keep the 3-second poll cadence, but let the user dismiss immediately.
      for (let i = 0; i < 30; i++) {
        await delay(100);

        if (dismissListener.isDismissed()) {
          break;
        }
      }
    }
  } catch (err) {
    spinner.stop();
    error(err instanceof Error ? err.message : 'Failed to fetch tracking data.');
  } finally {
    dismissListener.cleanup();
  }

  console.log();
  divider();
  console.log();
}
