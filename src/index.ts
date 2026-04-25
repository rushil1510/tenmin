#!/usr/bin/env node
// ─────────────────────────────────────────────
// Tenmin — CLI Entry Point
// Order food & groceries from Swiggy without
// leaving your terminal.
// ─────────────────────────────────────────────

import { Command } from 'commander';
import chalk from 'chalk';
import { orderCommand } from './commands/order.js';
import { cartCommand } from './commands/cart.js';
import { checkoutCommand } from './commands/checkout.js';
import { creditsCommand } from './commands/credits.js';
import { historyCommand } from './commands/history.js';

const program = new Command();

program
  .name('tenmin')
  .description(
    chalk.dim('Order food & groceries from Swiggy without leaving your terminal.'),
  )
  .version('0.1.0');

// ── tenmin order <query> ──────────────────────
program
  .command('order')
  .description('Search products and add to cart')
  .argument('<query...>', 'what to search for (e.g. "diet coke", "maggi", "eggs")')
  .action(async (queryParts: string[]) => {
    const query = queryParts.join(' ');
    await orderCommand(query);
  });

// ── tenmin cart [action] ──────────────────────
program
  .command('cart')
  .description('View or manage your cart')
  .argument('[action]', 'optional: "clear" to empty cart')
  .action(async (action?: string) => {
    await cartCommand(action);
  });

// ── tenmin checkout ───────────────────────────
program
  .command('checkout')
  .description('Review and place your order')
  .action(async () => {
    await checkoutCommand();
  });

// ── tenmin credits ────────────────────────────
program
  .command('credits')
  .description('Check your credit balance')
  .action(async () => {
    await creditsCommand();
  });

// ── tenmin history ────────────────────────────
program
  .command('history')
  .description('View your past orders')
  .action(async () => {
    await historyCommand();
  });

// ── Parse and run ─────────────────────────────
program.parse();
