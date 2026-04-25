// ─────────────────────────────────────────────
// Tenmin — `checkout` command
// Review cart and place order using credits
// ─────────────────────────────────────────────

import ora from 'ora';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { getCart, getCredits, checkout } from '../mock/swiggy-api.js';
import {
  banner,
  printCart,
  printEmptyCart,
  printOrderConfirmation,
  error,
  divider,
} from '../ui/format.js';

export async function checkoutCommand(): Promise<void> {
  banner();

  // ── Load cart ───────────────────────────────
  const items = await getCart();

  if (items.length === 0) {
    printEmptyCart();
    return;
  }

  // ── Show order summary ──────────────────────
  console.log(chalk.bold.white('  📋 Order Summary'));
  printCart(items);

  // ── Show payment method ─────────────────────
  const { balance } = await getCredits();
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );
  const deliveryFee = subtotal >= 199 ? 0 : 25;
  const total = subtotal + deliveryFee;

  console.log(
    chalk.dim('  Paying with ') +
    chalk.bold('Credits') +
    chalk.dim(' — Balance: ') +
    chalk.green.bold(`₹${balance}`),
  );

  if (balance < total) {
    console.log();
    error(
      `Insufficient credits. Need ${chalk.bold(`₹${total}`)} but only ` +
      chalk.bold(`₹${balance}`) + ' available.',
    );
    console.log();
    return;
  }

  console.log();

  // ── Confirm ─────────────────────────────────
  let confirmed: boolean;
  try {
    confirmed = await confirm({
      message: `Place order for ${chalk.bold.green(`₹${total}`)}?`,
      default: true,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled. Your cart is still saved.'));
      return;
    }
    throw err;
  }

  if (!confirmed) {
    console.log();
    console.log(chalk.dim('  Order cancelled. Your cart is still saved.'));
    console.log();
    return;
  }

  // ── Place order ─────────────────────────────
  const spinner = ora({
    text: chalk.dim('Placing your order...'),
    indent: 2,
  }).start();

  try {
    const order = await checkout();
    spinner.stop();
    printOrderConfirmation(order);
  } catch (err) {
    spinner.stop();
    error(err instanceof Error ? err.message : 'Something went wrong.');
    console.log();
  }
}
