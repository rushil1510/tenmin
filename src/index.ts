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
import { reorderCommand } from './commands/reorder.js';
import { trackCommand } from './commands/track.js';
import { listCommand } from './commands/list.js';
import { budgetCommand } from './commands/budget.js';
import { askCommand } from './commands/ask.js';
import { themeCommand } from './commands/theme.js';
import { prefsCommand } from './commands/prefs.js';

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

// ── tenmin reorder ────────────────────────────
program
  .command('reorder')
  .description('Reorder items from a past order')
  .action(async () => {
    await reorderCommand();
  });

// ── tenmin track ──────────────────────────────
program
  .command('track')
  .description('Live track your active order')
  .action(async () => {
    await trackCommand();
  });

// ── tenmin list [sub] [name] ───────────────────
program
  .command('list')
  .description('Manage saved grocery lists (save, run, delete)')
  .argument('[action]', 'save | run | delete — or omit to view all lists')
  .argument('[name]', 'list name')
  .action(async (action?: string, name?: string) => {
    await listCommand(action, name);
  });

// ── tenmin budget ────────────────────────────
program
  .command('budget')
  .description('View spending summary and trends from order history')
  .action(async () => {
    await budgetCommand();
  });

// ── tenmin ask <query> ────────────────────────
program
  .command('ask')
  .description('Natural language grocery request — powered by Gemini')
  .argument('<query...>', 'what you want, in plain English (e.g. "ingredients for biryani")')
  .action(async (queryParts: string[]) => {
    await askCommand(queryParts.join(' '));
  });

// ── tenmin theme [name] ──────────────────────
program
  .command('theme')
  .description('Switch UI theme (default, light, dark, cyberpunk, ocean)')
  .argument('[name]', 'theme name — or omit to pick interactively')
  .action(async (name?: string) => {
    await themeCommand(name);
  });

// ── tenmin prefs ─────────────────────────────
program
  .command('prefs')
  .description('View and edit preferences used by `ask`')
  .action(async () => {
    await prefsCommand();
  });

// ── Parse and run ─────────────────────────────
program.parse();
