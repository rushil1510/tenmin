// ─────────────────────────────────────────────
// Tenmin — `order` command
// Search products and add to cart interactively
// ─────────────────────────────────────────────

import ora from 'ora';
import { select, number as numberPrompt, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { searchProducts, addToCart, getCart } from '../mock/swiggy-api.js';
import {
  banner,
  printSearchResults,
  printNoResults,
  formatProductChoice,
  success,
  hint,
  info,
  divider,
} from '../ui/format.js';

const DONE = -1;

export async function orderCommand(query: string): Promise<void> {
  banner();

  // ── Search ────────────────────────────────
  const spinner = ora({
    text: chalk.dim(`Searching for "${query}"...`),
    indent: 2,
  }).start();

  const results = await searchProducts(query);

  spinner.stop();

  if (results.products.length === 0) {
    printNoResults(query);
    return;
  }

  printSearchResults(results.products, query);

  // ── Interactive selection loop ─────────────
  try {
    while (true) {
      const choices = [
        ...results.products.map((product, i) => ({
          name: `${product.name} (${product.unit})  —  ₹${product.price}  [${product.brand}]`,
          value: i,
        })),
        { name: chalk.dim('← Done, go to cart'), value: DONE },
      ];

      const selectedIndex = await select({
        message: 'Select an item to add to cart:',
        choices,
      });

      if (selectedIndex === DONE) break;

      const selectedProduct = results.products[selectedIndex];

      // ── Quantity ───────────────────────────────
      const qty = await numberPrompt({
        message: `Quantity for ${chalk.bold(selectedProduct.name)}:`,
        default: 1,
        min: 1,
        max: 10,
      });

      const quantity = qty ?? 1;

      // ── Add to cart ────────────────────────────
      const lineTotal = selectedProduct.price * quantity;
      await addToCart(selectedProduct.id, quantity);

      success(
        `Added ${chalk.bold(`${quantity}x ${selectedProduct.name}`)} ` +
        chalk.dim(`(${selectedProduct.unit})`) + ' to cart — ' +
        chalk.green.bold(`₹${lineTotal}`),
      );

      const addMore = await confirm({
        message: 'Add another item from these results?',
        default: false,
      });

      if (!addMore) break;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }
    throw err;
  }

  // ── Cart summary ────────────────────────────
  const cart = await getCart();
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  console.log();
  divider();
  info(
    `Cart: ${chalk.bold(`${itemCount} item${itemCount === 1 ? '' : 's'}`)} — ` +
    chalk.green.bold(`₹${cartTotal}`),
  );
  divider();

  console.log();
  hint('Run `tenmin cart` to view full cart.');
  hint('Run `tenmin checkout` to place your order.');
  hint('Run `tenmin order <item>` to search for more items.');
  console.log();
}
