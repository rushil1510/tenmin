// ─────────────────────────────────────────────
// Tenmin — `list` command
// Save named carts and run them on demand
// ─────────────────────────────────────────────

import ora from 'ora';
import chalk from 'chalk';
import { select, confirm, input } from '@inquirer/prompts';
import {
  getSavedLists,
  getSavedList,
  saveList,
  deleteList,
  getState,
} from '../store/index.js';
import { addToCart, getCart } from '../mock/swiggy-api.js';
import { PRODUCTS } from '../mock/products.js';
import type { SavedList } from '../types.js';
import {
  banner,
  success,
  warn,
  error,
  hint,
  info,
  divider,
} from '../ui/format.js';

// ── Sub-command dispatcher ─────────────────────

export async function listCommand(sub?: string, listName?: string): Promise<void> {
  banner();

  if (!sub || sub === 'ls' || sub === 'show') {
    await showAllLists();
    return;
  }

  if (sub === 'save') {
    await saveCurrentCart(listName);
    return;
  }

  if (sub === 'run') {
    await runList(listName);
    return;
  }

  if (sub === 'delete' || sub === 'rm') {
    await deleteListCmd(listName);
    return;
  }

  warn(`Unknown list action: "${sub}"`);
  console.log();
  hint('Usage:');
  hint('  tenmin list               — show all saved lists');
  hint('  tenmin list save [name]   — save current cart as a list');
  hint('  tenmin list run <name>    — add all items from a list to cart');
  hint('  tenmin list delete <name> — delete a saved list');
  console.log();
}

// ── Show all saved lists ───────────────────────

async function showAllLists(): Promise<void> {
  const lists = getSavedLists();

  console.log(chalk.bold.white('  📋 Saved Lists'));
  divider();

  if (lists.length === 0) {
    console.log(chalk.dim('  No saved lists yet.'));
    divider();
    console.log();
    hint('Run `tenmin list save <name>` to save your current cart as a list.');
    console.log();
    return;
  }

  for (const list of lists) {
    const totalItems = list.items.reduce((sum, i) => sum + i.qty, 0);
    const updated = new Date(list.updatedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });

    console.log(
      `  ${chalk.bold.cyan(list.name)}` +
      chalk.dim(`  ${totalItems} item(s)  ·  updated ${updated}`),
    );

    for (const item of list.items) {
      console.log(chalk.dim(`    × ${item.qty}  ${item.name}`));
    }
    console.log();
  }

  divider();
  console.log();
  hint('Run `tenmin list run <name>` to add a list to your cart.');
  hint('Run `tenmin list delete <name>` to remove a list.');
  console.log();
}

// ── Save current cart as a named list ─────────

async function saveCurrentCart(nameArg?: string): Promise<void> {
  const items = await getCart();

  if (items.length === 0) {
    warn('Your cart is empty — nothing to save.');
    hint('Add items with `tenmin order <item>` first.');
    console.log();
    return;
  }

  let name = nameArg?.trim();

  if (!name) {
    try {
      name = await input({
        message: 'Name for this list:',
        validate: (v) =>
          v.trim().length >= 1 ? true : 'Please enter a name.',
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'ExitPromptError') {
        console.log(chalk.dim('\n  Cancelled.'));
        return;
      }
      throw err;
    }
  }

  const existing = getSavedList(name);
  if (existing) {
    let overwrite: boolean;
    try {
      overwrite = await confirm({
        message: `A list named "${name}" already exists. Overwrite?`,
        default: false,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'ExitPromptError') {
        console.log(chalk.dim('\n  Cancelled.'));
        return;
      }
      throw err;
    }
    if (!overwrite) {
      console.log(chalk.dim('  Cancelled.'));
      return;
    }
  }

  const list: SavedList = {
    name,
    items: items.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      qty: i.qty,
    })),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveList(list);

  console.log();
  success(`Saved ${chalk.bold(String(items.length))} items as list "${chalk.bold.cyan(name)}".`);
  divider();
  console.log();
  hint(`Run \`tenmin list run ${name}\` to re-add these items any time.`);
  console.log();
}

// ── Run a saved list → add items to cart ──────

async function runList(nameArg?: string): Promise<void> {
  const lists = getSavedLists();

  if (lists.length === 0) {
    warn('You have no saved lists yet.');
    hint('Save one with `tenmin list save <name>`.');
    console.log();
    return;
  }

  let name = nameArg?.trim();

  if (!name) {
    try {
      const choices = lists.map((l) => ({
        name: `${chalk.bold(l.name)}  ${chalk.dim(`(${l.items.reduce((s, i) => s + i.qty, 0)} items)`)}`,
        value: l.name,
      }));
      choices.push({ name: chalk.dim('← Cancel'), value: '' });

      name = await select({ message: 'Which list?', choices });
      if (!name) {
        console.log(chalk.dim('\n  Cancelled.'));
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'ExitPromptError') {
        console.log(chalk.dim('\n  Cancelled.'));
        return;
      }
      throw err;
    }
  }

  const list = getSavedList(name);
  if (!list) {
    error(`No list found named "${name}".`);
    console.log();
    return;
  }

  divider();
  console.log(chalk.bold.white(`  Running list: ${chalk.cyan(list.name)}`));
  console.log();

  let available = 0;
  let unavailable = 0;

  for (const item of list.items) {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (product && product.inStock) {
      console.log(
        chalk.dim(`    ${product.name} (${product.unit})  ×${item.qty}`) +
        chalk.green(`  ₹${product.price * item.qty}`),
      );
      available++;
    } else {
      console.log(chalk.red(`    ✖ ${item.name}`) + chalk.dim(' (unavailable)'));
      unavailable++;
    }
  }

  console.log();

  if (available === 0) {
    error('None of the items in this list are currently available.');
    console.log();
    return;
  }

  if (unavailable > 0) {
    warn(`${unavailable} item(s) unavailable — will be skipped.`);
    console.log();
  }

  let confirmed: boolean;
  try {
    confirmed = await confirm({
      message: `Add ${available} available item(s) to cart?`,
      default: true,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }
    throw err;
  }

  if (!confirmed) {
    console.log(chalk.dim('\n  Cancelled.'));
    return;
  }

  const spinner = ora({ text: chalk.dim('Adding to cart...'), indent: 2 }).start();
  let addedCount = 0;
  let addedTotal = 0;

  for (const item of list.items) {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (product && product.inStock) {
      await addToCart(product.id, item.qty);
      addedCount++;
      addedTotal += product.price * item.qty;
    }
  }

  spinner.stop();

  console.log();
  success(`Added ${chalk.bold(String(addedCount))} items to cart — ${chalk.green.bold(`₹${addedTotal}`)}`);
  divider();
  console.log();
  hint('Run `tenmin cart` to review your cart.');
  hint('Run `tenmin checkout` to place your order.');
  console.log();
}

// ── Delete a saved list ───────────────────────

async function deleteListCmd(nameArg?: string): Promise<void> {
  const lists = getSavedLists();

  if (lists.length === 0) {
    warn('You have no saved lists.');
    console.log();
    return;
  }

  let name = nameArg?.trim();

  if (!name) {
    try {
      const choices = lists.map((l) => ({ name: l.name, value: l.name }));
      choices.push({ name: chalk.dim('← Cancel'), value: '' });
      name = await select({ message: 'Which list to delete?', choices });
      if (!name) {
        console.log(chalk.dim('\n  Cancelled.'));
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'ExitPromptError') {
        console.log(chalk.dim('\n  Cancelled.'));
        return;
      }
      throw err;
    }
  }

  let confirmed: boolean;
  try {
    confirmed = await confirm({
      message: `Delete list "${name}"?`,
      default: false,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }
    throw err;
  }

  if (!confirmed) {
    console.log(chalk.dim('\n  Cancelled.'));
    return;
  }

  const deleted = deleteList(name);
  if (deleted) {
    console.log();
    success(`Deleted list "${chalk.bold(name)}".`);
  } else {
    error(`No list found named "${name}".`);
  }
  console.log();
}
