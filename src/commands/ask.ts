// ─────────────────────────────────────────────
// Tenmin — `ask` command
// Natural language → search → cart
// ─────────────────────────────────────────────

import ora from 'ora';
import chalk from 'chalk';
import { select, confirm, password } from '@inquirer/prompts';
import { parseGroceryIntent } from '../lib/gemini.js';
import { getGeminiKey, saveGeminiKey } from '../store/config.js';
import { searchProducts, addToCart } from '../mock/swiggy-api.js';
import {
  banner,
  success,
  warn,
  error,
  hint,
  divider,
  info,
} from '../ui/format.js';
import type { Product } from '../types.js';

async function resolveApiKey(): Promise<string | null> {
  const existing = getGeminiKey();
  if (existing) return existing;

  console.log();
  console.log(chalk.dim('  tenmin ask uses Gemini to understand your request.'));
  console.log(
    chalk.dim('  Get a free API key at ') +
    chalk.cyan('aistudio.google.com') +
    chalk.dim(' → "Get API key"'),
  );
  console.log();

  let key: string;
  try {
    key = await password({ message: 'Paste your Gemini API key:' });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') return null;
    throw err;
  }

  if (!key.trim()) return null;

  saveGeminiKey(key);
  console.log();
  success('API key saved to ~/.tenmin/config.json');
  console.log();

  return key.trim();
}

export async function askCommand(query: string): Promise<void> {
  banner();

  // ── Resolve API key ───────────────────────
  const apiKey = await resolveApiKey();
  if (!apiKey) {
    warn('No API key provided. Run `tenmin ask` again to set one.');
    console.log();
    return;
  }

  // ── Parse intent ──────────────────────────
  const intentSpinner = ora({
    text: chalk.dim(`Figuring out what you need for "${query}"...`),
    indent: 2,
  }).start();

  let terms: string[];
  try {
    terms = await parseGroceryIntent(query, apiKey);
  } catch (err) {
    intentSpinner.stop();
    error(err instanceof Error ? err.message : 'Failed to reach Gemini API.');
    return;
  }

  intentSpinner.stop();

  if (terms.length === 0) {
    warn(`That doesn't look like a grocery request.`);
    hint('Try something like: tenmin ask "ingredients for pasta"');
    console.log();
    return;
  }

  console.log();
  console.log(
    chalk.dim('  Found ') +
    chalk.bold.cyan(String(terms.length)) +
    chalk.dim(` item${terms.length === 1 ? '' : 's'} to look up: `) +
    chalk.white(terms.join(', ')),
  );
  console.log();

  // ── Search each term ──────────────────────
  const searchSpinner = ora({
    text: chalk.dim('Searching Instamart...'),
    indent: 2,
  }).start();

  const termResults: { term: string; products: Product[] }[] = [];

  for (const term of terms) {
    const result = await searchProducts(term);
    if (result.products.length > 0) {
      termResults.push({ term, products: result.products });
    }
  }

  searchSpinner.stop();

  const found = termResults.length;
  const missed = terms.length - found;

  if (found === 0) {
    warn('Nothing found for any of those items.');
    hint('Try `tenmin order <item>` to search manually.');
    console.log();
    return;
  }

  info(
    `Found products for ${chalk.bold(String(found))} of ${terms.length} items` +
    (missed > 0 ? chalk.dim(` (${missed} not available)`) : ''),
  );
  console.log();

  // ── Pick one product per term ─────────────
  const toAdd: { product: Product; qty: number }[] = [];

  try {
    for (const { term, products } of termResults) {
      divider();
      console.log(chalk.dim(`  ${term}`));
      console.log();

      const choices = [
        ...products.slice(0, 5).map((p, i) => ({
          name: `${p.name} (${p.unit})  —  ₹${p.price}  [${p.brand}]`,
          value: i,
        })),
        { name: chalk.dim('← Skip this item'), value: -1 },
      ];

      const picked = await select({
        message: 'Pick one:',
        choices,
      });

      if (picked !== -1) {
        toAdd.push({ product: products[picked], qty: 1 });
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }
    throw err;
  }

  if (toAdd.length === 0) {
    console.log();
    console.log(chalk.dim('  Nothing added to cart.'));
    console.log();
    return;
  }

  // ── Confirm and add ───────────────────────
  console.log();
  divider();
  console.log(chalk.bold.white('  Adding to cart:'));
  console.log();

  for (const { product, qty } of toAdd) {
    console.log(
      chalk.dim(`    ${product.name} (${product.unit})`) +
      chalk.green(` ₹${product.price * qty}`),
    );
  }

  console.log();

  let confirmed: boolean;
  try {
    confirmed = await confirm({ message: 'Add all to cart?', default: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }
    throw err;
  }

  if (!confirmed) {
    console.log(chalk.dim('\n  Nothing added.'));
    return;
  }

  const addSpinner = ora({ text: chalk.dim('Adding to cart...'), indent: 2 }).start();

  for (const { product, qty } of toAdd) {
    await addToCart(product.id, qty);
  }

  addSpinner.stop();

  const cartTotal = toAdd.reduce((sum, { product, qty }) => sum + product.price * qty, 0);

  console.log();
  success(`Added ${chalk.bold(String(toAdd.length))} items to cart — ${chalk.green.bold(`₹${cartTotal}`)}`);
  divider();
  console.log();
  hint('Run `tenmin cart` to review your cart.');
  hint('Run `tenmin checkout` to place your order.');
  console.log();
}
