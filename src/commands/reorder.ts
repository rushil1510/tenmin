// ─────────────────────────────────────────────
// Tenmin — `reorder` command
// Pick a past order and re-add all items to cart
// ─────────────────────────────────────────────

import ora from 'ora';
import chalk from 'chalk';
import { select, confirm } from '@inquirer/prompts';
import { getState } from '../store/index.js';
import { addToCart } from '../mock/swiggy-api.js';
import { PRODUCTS } from '../mock/products.js';
import {
  banner,
  success,
  warn,
  error,
  hint,
  divider,
  info,
} from '../ui/format.js';

export async function reorderCommand(): Promise<void> {
  banner();

  const state = getState();
  const orders = state.orders;

  if (orders.length === 0) {
    warn('No past orders found.');
    hint('Run `tenmin order <item>` to place your first order.');
    console.log();
    return;
  }

  // Sort by newest first
  const sorted = [...orders].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  console.log(chalk.bold.white('  ↺ Reorder from History'));
  console.log();

  try {
    const choices = sorted.slice(0, 10).map((order) => {
      const date = new Date(order.timestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
      const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
      const itemsPreview = order.items.slice(0, 2).map((i) => i.name).join(', ') +
        (order.items.length > 2 ? '...' : '');

      return {
        name: `${date}  —  ₹${order.total}  [${itemCount} items: ${itemsPreview}]`,
        value: order,
      };
    });

    choices.push({
      name: chalk.dim('← Cancel'),
      value: null as any,
    });

    const selectedOrder = await select({
      message: 'Select an order to repeat:',
      choices,
    });

    if (!selectedOrder) {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }

    divider();
    console.log(chalk.bold.white(`  Order #${selectedOrder.orderId}`));
    console.log();

    const toAdd = [];
    let missedCount = 0;

    for (const item of selectedOrder.items) {
      // Find the product in the current catalog
      let product = null;
      if (item.id) {
        product = PRODUCTS.find((p) => p.id === item.id);
      } else {
        // Fallback for older orders without ID
        product = PRODUCTS.find((p) => p.name === item.name);
      }

      if (product && product.inStock) {
        toAdd.push({ product, qty: item.qty });
        console.log(
          chalk.dim(`    ${product.name} (${product.unit})  ×${item.qty}`) +
          chalk.green(`  ₹${product.price * item.qty}`),
        );
      } else {
        missedCount++;
        console.log(
          chalk.red(`    ✖ ${item.name} `) + chalk.dim(`(Currently unavailable)`),
        );
      }
    }

    console.log();

    if (toAdd.length === 0) {
      error('None of the items from this order are currently available.');
      console.log();
      return;
    }

    if (missedCount > 0) {
      warn(`${missedCount} item(s) are no longer available and will be skipped.`);
      console.log();
    }

    const addConfirmed = await confirm({
      message: `Add these ${toAdd.length} items to your cart?`,
      default: true,
    });

    if (!addConfirmed) {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }

    const spinner = ora({ text: chalk.dim('Adding to cart...'), indent: 2 }).start();

    for (const { product, qty } of toAdd) {
      await addToCart(product.id, qty);
    }

    spinner.stop();

    const addedTotal = toAdd.reduce((sum, i) => sum + (i.product.price * i.qty), 0);

    console.log();
    success(`Added ${chalk.bold(String(toAdd.length))} items to cart — ${chalk.green.bold(`₹${addedTotal}`)}`);
    divider();
    console.log();
    hint('Run `tenmin cart` to review your cart.');
    hint('Run `tenmin checkout` to place your order.');
    console.log();

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }
    throw err;
  }
}
