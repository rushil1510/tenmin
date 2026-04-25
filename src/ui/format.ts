// ─────────────────────────────────────────────
// Tenmin — Terminal UI Formatting
// Pretty output for products, cart, orders
// ─────────────────────────────────────────────

import chalk from 'chalk';
import type { Product, CartItem, OrderResult } from '../types.js';

// ── Branding ──────────────────────────────────

export function banner(): void {
  console.log();
  console.log(
    chalk.bold.hex('#FF5722')('  ⚡ tenmin') +
    chalk.dim(' — order from Swiggy, stay in flow'),
  );
  console.log();
}

// ── Status messages ───────────────────────────

export function success(msg: string): void {
  console.log(chalk.green('  ✔ ') + msg);
}

export function error(msg: string): void {
  console.log(chalk.red('  ✖ ') + msg);
}

export function info(msg: string): void {
  console.log(chalk.blue('  ℹ ') + msg);
}

export function hint(msg: string): void {
  console.log(chalk.dim('  💡 ' + msg));
}

export function warn(msg: string): void {
  console.log(chalk.yellow('  ⚠ ') + msg);
}

// ── Divider ───────────────────────────────────

export function divider(): void {
  console.log(chalk.dim('  ' + '─'.repeat(46)));
}

// ── Product display ───────────────────────────

export function formatProductChoice(product: Product, index: number): string {
  const num = chalk.bold.cyan(`${index + 1}.`);
  const name = chalk.white.bold(product.name);
  const unit = chalk.dim(`(${product.unit})`);
  const brand = chalk.dim(`— ${product.brand}`);

  const price = chalk.green.bold(`₹${product.price}`);
  const mrpDiff = product.mrp > product.price
    ? chalk.dim.strikethrough(` ₹${product.mrp}`)
    : '';

  return `  ${num} ${name} ${unit}  ${price}${mrpDiff}  ${brand}`;
}

export function printSearchResults(products: Product[], query: string): void {
  console.log();
  console.log(
    chalk.white(`  Found ${chalk.bold.cyan(String(products.length))} results for `) +
    chalk.bold(`"${query}"`),
  );
  console.log();

  for (let i = 0; i < products.length; i++) {
    console.log(formatProductChoice(products[i], i));
  }

  console.log();
}

// ── Cart display ──────────────────────────────

export function printCart(items: CartItem[]): void {
  console.log();
  console.log(chalk.bold.white('  🛒 Your Cart'));
  divider();

  if (items.length === 0) {
    console.log(chalk.dim('  Cart is empty'));
    divider();
    hint('Run `tenmin order <item>` to add something.');
    console.log();
    return;
  }

  let subtotal = 0;

  for (const item of items) {
    const name = chalk.white(item.product.name);
    const unit = chalk.dim(`(${item.product.unit})`);
    const qty = chalk.cyan(`${item.qty}x`);
    const lineTotal = item.product.price * item.qty;
    const price = chalk.green(`₹${lineTotal}`);
    subtotal += lineTotal;

    // Right-align the price
    const leftPart = `  ${name} ${unit}`;
    const rightPart = `${qty}  ${price}`;
    const padding = Math.max(2, 48 - leftPart.length - rightPart.length);

    console.log(`${leftPart}${' '.repeat(padding)}${rightPart}`);
  }

  divider();

  const deliveryFee = subtotal >= 199 ? 0 : 25;
  const total = subtotal + deliveryFee;

  const subtotalLabel = chalk.dim('  Subtotal');
  console.log(`${subtotalLabel}${' '.repeat(Math.max(2, 38 - 10))}${chalk.white(`₹${subtotal}`)}`);

  if (deliveryFee === 0) {
    console.log(`${chalk.dim('  Delivery')}${' '.repeat(Math.max(2, 38 - 10))}${chalk.green('FREE')}`);
  } else {
    console.log(`${chalk.dim('  Delivery')}${' '.repeat(Math.max(2, 38 - 10))}${chalk.white(`₹${deliveryFee}`)}`);
    info(`Add ₹${199 - subtotal} more for free delivery`);
  }

  divider();
  console.log(`${chalk.bold.white('  Total')}${' '.repeat(Math.max(2, 38 - 7))}${chalk.bold.green(`₹${total}`)}`);
  divider();
  console.log();
}

// ── Credits display ───────────────────────────

export function printCredits(balance: number): void {
  console.log();
  console.log(
    chalk.bold.white('  💳 Credits Balance: ') +
    chalk.bold.green(`₹${balance}`),
  );
  console.log();
}

// ── Order confirmation ────────────────────────

export function printOrderConfirmation(order: OrderResult): void {
  console.log();
  console.log(chalk.bold.green('  🎉 Order placed successfully!'));
  divider();
  console.log(`  ${chalk.dim('Order ID')}        ${chalk.bold.white(`#${order.orderId}`)}`);
  console.log(`  ${chalk.dim('Items')}           ${chalk.white(String(order.items.length))}`);
  console.log(`  ${chalk.dim('Subtotal')}        ${chalk.white(`₹${order.subtotal}`)}`);

  if (order.deliveryFee === 0) {
    console.log(`  ${chalk.dim('Delivery')}        ${chalk.green('FREE')}`);
  } else {
    console.log(`  ${chalk.dim('Delivery')}        ${chalk.white(`₹${order.deliveryFee}`)}`);
  }

  console.log(`  ${chalk.dim('Total Paid')}      ${chalk.bold.green(`₹${order.total}`)}`);
  console.log(`  ${chalk.dim('ETA')}             ${chalk.cyan(order.estimatedDelivery)}`);
  console.log(`  ${chalk.dim('Credits Left')}    ${chalk.white(`₹${order.creditsRemaining}`)}`);
  divider();
  console.log();
  hint('Run `tenmin order <item>` to order more.');
  console.log();
}

// ── Empty state messages ──────────────────────

export function printNoResults(query: string): void {
  console.log();
  warn(`No products found for "${query}"`);
  hint('Try a different search term.');
  console.log();
}

export function printEmptyCart(): void {
  console.log();
  warn('Cart is empty — nothing to checkout.');
  hint('Run `tenmin order <item>` to add something first.');
  console.log();
}
