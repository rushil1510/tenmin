// ─────────────────────────────────────────────
// Tenmin — `ask` command
// Vague natural language → curated bundles → cart
// Flow: context → intent → search → bundles → pick one → done
// ─────────────────────────────────────────────

import ora from 'ora';
import chalk from 'chalk';
import { select, confirm, password } from '@inquirer/prompts';
import { parseIntent, buildBundles } from '../lib/gemini.js';
import { buildContext, formatContextForPrompt } from '../lib/context.js';
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
import { PRODUCTS } from '../mock/products.js';

// ── API key resolution ────────────────────────

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

// ── Main command ──────────────────────────────

export async function askCommand(query: string): Promise<void> {
  banner();

  const apiKey = await resolveApiKey();
  if (!apiKey) {
    warn('No API key provided. Run `tenmin ask` again to set one.');
    console.log();
    return;
  }

  // ── Build context (history + prefs + time) ─
  const ctx = buildContext();
  const contextBlock = formatContextForPrompt(ctx);

  // ── Stage 1: Understand intent ────────────
  const intentSpinner = ora({
    text: chalk.dim('Understanding what you need...'),
    indent: 2,
  }).start();

  let intent: Awaited<ReturnType<typeof parseIntent>>;
  try {
    intent = await parseIntent(query, contextBlock, apiKey);
  } catch (err) {
    intentSpinner.stop();
    error(err instanceof Error ? err.message : 'Failed to reach Gemini.');
    return;
  }

  intentSpinner.stop();

  if (intent.searchTerms.length === 0) {
    warn(`That doesn't look like a grocery request.`);
    hint('Try: tenmin ask "light lunch under ₹300" or "ingredients for pasta"');
    console.log();
    return;
  }

  // ── Search all terms in parallel ──────────
  const searchSpinner = ora({
    text: chalk.dim(`Searching for ${intent.searchTerms.join(', ')}...`),
    indent: 2,
  }).start();

  const searchResults = await Promise.all(
    intent.searchTerms.map(async (term) => {
      const result = await searchProducts(term);
      return { term, products: result.products };
    }),
  );

  const foundResults = searchResults.filter((r) => r.products.length > 0);
  searchSpinner.stop();

  if (foundResults.length === 0) {
    warn('Nothing found on Instamart for those items.');
    hint('Try `tenmin order <item>` to search manually.');
    console.log();
    return;
  }

  // ── Stage 2: Build bundles ────────────────
  const bundleSpinner = ora({
    text: chalk.dim('Putting together some options...'),
    indent: 2,
  }).start();

  let rawBundles: Awaited<ReturnType<typeof buildBundles>>;
  try {
    rawBundles = await buildBundles(
      intent,
      foundResults.map((r) => ({
        term: r.term,
        products: r.products.map((p) => ({
          id: p.id,
          name: p.name,
          unit: p.unit,
          price: p.price,
        })),
      })),
      ctx.recentItems,
      apiKey,
    );
  } catch (err) {
    bundleSpinner.stop();
    error(err instanceof Error ? err.message : 'Failed to build bundles.');
    return;
  }

  bundleSpinner.stop();

  // Resolve product IDs to real Product objects and calculate totals
  const allFoundIds = new Set(foundResults.flatMap((r) => r.products.map((p) => p.id)));

  const bundles = rawBundles
    .map((bundle) => {
      const products = bundle.productIds
        .filter((id) => allFoundIds.has(id))           // only real IDs from search
        .map((id) => PRODUCTS.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);

      const total = products.reduce((sum, p) => sum + p.price, 0);
      return { ...bundle, products, total };
    })
    .filter((b) => b.products.length > 0 && b.total <= intent.budget);

  if (bundles.length === 0) {
    warn(`Couldn't build any bundles within ₹${intent.budget}.`);
    hint(`Try: tenmin ask "${query}" with a higher budget, or tenmin order <item>.`);
    console.log();
    return;
  }

  // ── Show bundles ──────────────────────────
  console.log();
  info(
    `Budget ₹${intent.budget}` +
    (intent.constraints.length > 0 ? chalk.dim(`  ·  ${intent.constraints.join(', ')}`) : ''),
  );
  console.log();

  const labels = ['A', 'B', 'C'];

  for (let i = 0; i < bundles.length; i++) {
    const b = bundles[i];
    const label = labels[i];

    console.log(
      `  ${chalk.bold.cyan(label)}  ` +
      chalk.bold.white(b.label) +
      chalk.dim('  ·  ') +
      chalk.green.bold(`₹${b.total}`),
    );
    console.log(chalk.dim(`     ${b.rationale}`));

    for (const p of b.products) {
      console.log(chalk.dim(`     • ${p.name} (${p.unit})  ₹${p.price}`));
    }
    console.log();
  }

  divider();

  // ── Single pick ───────────────────────────
  try {
    const choices = [
      ...bundles.map((b, i) => ({
        name: `${labels[i]}  ${b.label}  — ₹${b.total}`,
        value: i,
      })),
      { name: chalk.dim('← None of these'), value: -1 },
    ];

    const picked = await select({
      message: 'Pick one:',
      choices,
    });

    if (picked === -1) {
      console.log(chalk.dim('\n  No problem. Try a different request.'));
      console.log();
      return;
    }

    const chosen = bundles[picked];

    // ── Add all items ─────────────────────
    const addSpinner = ora({ text: chalk.dim('Adding to cart...'), indent: 2 }).start();
    for (const product of chosen.products) {
      await addToCart(product.id, 1);
    }
    addSpinner.stop();

    console.log();
    success(
      `Added ${chalk.bold(String(chosen.products.length))} items to cart — ` +
      chalk.green.bold(`₹${chosen.total}`),
    );
    divider();
    console.log();

    // ── Straight-to-checkout prompt ───────
    let goCheckout: boolean;
    try {
      goCheckout = await confirm({ message: 'Place order now?', default: true });
    } catch {
      goCheckout = false;
    }

    if (goCheckout) {
      const { checkoutCommand } = await import('./checkout.js');
      await checkoutCommand();
    } else {
      hint('Run `tenmin checkout` whenever you\'re ready.');
      console.log();
    }

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }
    throw err;
  }
}
