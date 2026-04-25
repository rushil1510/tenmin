// ─────────────────────────────────────────────
// Tenmin — Terminal UI Formatting
// Pretty output for products, cart, orders
// ─────────────────────────────────────────────

import chalk from 'chalk';
import type { Product, CartItem, OrderResult } from '../types.js';
import { getTheme, type Theme } from './themes.js';
import { getThemeName } from '../store/index.js';

// ── Active theme accessor ─────────────────────

function t(): Theme {
  return getTheme(getThemeName());
}

// ── Branding ──────────────────────────────────

export function banner(): void {
  const theme = t();
  console.log();
  console.log(
    chalk.bold.hex(theme.colors.brand)(`  ${theme.icons.bolt} tenmin`) +
    chalk.hex(theme.colors.brandText)(' — order from Swiggy, stay in flow'),
  );
  console.log();
}

// ── Status messages ───────────────────────────

export function success(msg: string): void {
  const theme = t();
  console.log(chalk.hex(theme.colors.success)(`  ${theme.icons.success} `) + msg);
}

export function error(msg: string): void {
  const theme = t();
  console.log(chalk.hex(theme.colors.error)(`  ${theme.icons.error} `) + msg);
}

export function info(msg: string): void {
  const theme = t();
  console.log(chalk.hex(theme.colors.info)(`  ${theme.icons.info} `) + msg);
}

export function hint(msg: string): void {
  const theme = t();
  console.log(chalk.hex(theme.colors.hint)(`  ${theme.icons.hint} ` + msg));
}

export function warn(msg: string): void {
  const theme = t();
  console.log(chalk.hex(theme.colors.warn)(`  ${theme.icons.warn} `) + msg);
}

// ── Divider ───────────────────────────────────

export function divider(): void {
  const theme = t();
  console.log(chalk.hex(theme.colors.divider)('  ' + '─'.repeat(46)));
}

// ── Product display ───────────────────────────

export function formatProductChoice(product: Product, index: number): string {
  const theme = t();

  const num = chalk.bold.hex(theme.colors.accent)(`${index + 1}.`);
  const name = chalk.hex(theme.colors.primary).bold(product.name);
  const unit = chalk.hex(theme.colors.secondary)(`(${product.unit})`);
  const brand = chalk.hex(theme.colors.secondary)(`— ${product.brand}`);

  const price = chalk.hex(theme.colors.price).bold(`₹${product.price}`);
  const mrpDiff = product.mrp > product.price
    ? chalk.hex(theme.colors.priceStrike).strikethrough(` ₹${product.mrp}`)
    : '';

  return `  ${num} ${name} ${unit}  ${price}${mrpDiff}  ${brand}`;
}

export function printSearchResults(products: Product[], query: string): void {
  const theme = t();

  console.log();
  console.log(
    chalk.hex(theme.colors.primary)(`  Found ${chalk.bold.hex(theme.colors.accent)(String(products.length))} results for `) +
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
  const theme = t();

  console.log();
  console.log(chalk.bold.hex(theme.colors.primary)(`  ${theme.icons.cart} Your Cart`));
  divider();

  if (items.length === 0) {
    console.log(chalk.hex(theme.colors.muted)('  Cart is empty'));
    divider();
    hint('Run `tenmin order <item>` to add something.');
    console.log();
    return;
  }

  let subtotal = 0;

  for (const item of items) {
    const name = chalk.hex(theme.colors.primary)(item.product.name);
    const unit = chalk.hex(theme.colors.secondary)(`(${item.product.unit})`);
    const qty = chalk.hex(theme.colors.accent)(`${item.qty}x`);
    const lineTotal = item.product.price * item.qty;
    const price = chalk.hex(theme.colors.price)(`₹${lineTotal}`);
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

  const subtotalLabel = chalk.hex(theme.colors.secondary)('  Subtotal');
  console.log(`${subtotalLabel}${' '.repeat(Math.max(2, 38 - 10))}${chalk.hex(theme.colors.primary)(`₹${subtotal}`)}`);

  if (deliveryFee === 0) {
    console.log(`${chalk.hex(theme.colors.secondary)('  Delivery')}${' '.repeat(Math.max(2, 38 - 10))}${chalk.hex(theme.colors.success)('FREE')}`);
  } else {
    console.log(`${chalk.hex(theme.colors.secondary)('  Delivery')}${' '.repeat(Math.max(2, 38 - 10))}${chalk.hex(theme.colors.primary)(`₹${deliveryFee}`)}`);
    info(`Add ₹${199 - subtotal} more for free delivery`);
  }

  divider();
  console.log(`${chalk.bold.hex(theme.colors.primary)('  Total')}${' '.repeat(Math.max(2, 38 - 7))}${chalk.bold.hex(theme.colors.price)(`₹${total}`)}`);
  divider();
  console.log();
}

// ── Credits display ───────────────────────────

export function printCredits(balance: number): void {
  const theme = t();

  console.log();
  console.log(
    chalk.bold.hex(theme.colors.primary)(`  ${theme.icons.credits} Credits Balance: `) +
    chalk.bold.hex(theme.colors.price)(`₹${balance}`),
  );
  console.log();
}

// ── Order confirmation ────────────────────────

export function printOrderConfirmation(order: OrderResult): void {
  const theme = t();

  console.log();
  console.log(chalk.bold.hex(theme.colors.success)(`  ${theme.icons.done} Order placed successfully!`));
  divider();
  console.log(`  ${chalk.hex(theme.colors.secondary)('Order ID')}        ${chalk.bold.hex(theme.colors.primary)(`#${order.orderId}`)}`);
  console.log(`  ${chalk.hex(theme.colors.secondary)('Items')}           ${chalk.hex(theme.colors.primary)(String(order.items.length))}`);
  console.log(`  ${chalk.hex(theme.colors.secondary)('Subtotal')}        ${chalk.hex(theme.colors.primary)(`₹${order.subtotal}`)}`);

  if (order.deliveryFee === 0) {
    console.log(`  ${chalk.hex(theme.colors.secondary)('Delivery')}        ${chalk.hex(theme.colors.success)('FREE')}`);
  } else {
    console.log(`  ${chalk.hex(theme.colors.secondary)('Delivery')}        ${chalk.hex(theme.colors.primary)(`₹${order.deliveryFee}`)}`);
  }

  console.log(`  ${chalk.hex(theme.colors.secondary)('Total Paid')}      ${chalk.bold.hex(theme.colors.price)(`₹${order.total}`)}`);
  console.log(`  ${chalk.hex(theme.colors.secondary)('ETA')}             ${chalk.hex(theme.colors.accent)(order.estimatedDelivery)}`);
  console.log(`  ${chalk.hex(theme.colors.secondary)('Credits Left')}    ${chalk.hex(theme.colors.primary)(`₹${order.creditsRemaining}`)}`);
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
