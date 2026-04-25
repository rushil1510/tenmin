// ─────────────────────────────────────────────
// Tenmin — `track` command
// Live tracking for your active order
// ─────────────────────────────────────────────

import ora from 'ora';
import chalk from 'chalk';
import { getState } from '../store/index.js';
import { getOrderStatus, type OrderTracking } from '../mock/swiggy-api.js';
import { banner, warn, error, hint, divider } from '../ui/format.js';
import { getTheme } from '../ui/themes.js';
import { getThemeName } from '../store/index.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

      await delay(3000); // Poll every 3 seconds
    }
  } catch (err) {
    spinner.stop();
    error(err instanceof Error ? err.message : 'Failed to fetch tracking data.');
  }

  console.log();
  divider();
  console.log();
}
