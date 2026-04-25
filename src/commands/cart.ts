// ─────────────────────────────────────────────
// Tenmin — `cart` command
// View and manage the cart
// ─────────────────────────────────────────────

import ora from 'ora';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { getCart, clearCart } from '../mock/swiggy-api.js';
import { getState } from '../store/index.js';
import {
  banner,
  printCart,
  printCredits,
  success,
  hint,
} from '../ui/format.js';

export async function cartCommand(action?: string): Promise<void> {
  banner();

  // ── Clear cart ──────────────────────────────
  if (action === 'clear') {
    const items = await getCart();

    if (items.length === 0) {
      printCart(items);
      return;
    }

    const confirmed = await confirm({
      message: `Clear all ${items.length} item(s) from cart?`,
      default: false,
    });

    if (confirmed) {
      const spinner = ora({
        text: chalk.dim('Clearing cart...'),
        indent: 2,
      }).start();

      await clearCart();
      spinner.stop();

      success('Cart cleared.');
      console.log();
    }

    return;
  }

  // ── Show cart ───────────────────────────────
  const spinner = ora({
    text: chalk.dim('Loading cart...'),
    indent: 2,
  }).start();

  const items = await getCart();
  const state = getState();

  spinner.stop();

  printCart(items);

  if (items.length > 0) {
    printCredits(state.credits);
    hint('Run `tenmin checkout` to place your order.');
    hint('Run `tenmin cart clear` to empty your cart.');
    hint('Run `tenmin order <item>` to add more items.');
    console.log();
  }
}
