// ─────────────────────────────────────────────
// Tenmin — `prefs` command
// View and set user preferences used by `ask`
// ─────────────────────────────────────────────

import chalk from 'chalk';
import { checkbox, number as numberPrompt, input, confirm } from '@inquirer/prompts';
import { getPreferences, savePreferences, DEFAULT_PREFS } from '../store/preferences.js';
import { banner, success, divider, hint } from '../ui/format.js';

const DIETARY_OPTIONS = [
  { value: 'vegetarian',  name: 'Vegetarian' },
  { value: 'vegan',       name: 'Vegan' },
  { value: 'no dairy',    name: 'No dairy' },
  { value: 'no eggs',     name: 'No eggs' },
  { value: 'no gluten',   name: 'No gluten' },
  { value: 'everything works', name: 'Everything works'}
];

export async function prefsCommand(): Promise<void> {
  banner();

  const prefs = getPreferences();

  // ── Show current preferences ─────────────
  console.log(chalk.bold.white('  ⚙  Your Preferences'));
  divider();
  console.log(
    chalk.dim('  Default budget   ') +
    chalk.green.bold(`₹${prefs.defaultBudget}`),
  );
  console.log(
    chalk.dim('  Dietary          ') +
    (prefs.dietary.length > 0 ? chalk.white(prefs.dietary.join(', ')) : chalk.dim('none set')),
  );
  console.log(
    chalk.dim('  Avoid            ') +
    (prefs.avoid.length > 0 ? chalk.white(prefs.avoid.join(', ')) : chalk.dim('none set')),
  );
  divider();
  console.log();

  if (prefs.dietary.length === 0 && prefs.avoid.length === 0) {
    hint('These preferences are used by `tenmin ask` to personalise suggestions.');
    console.log();
  }

  // ── Offer to edit ─────────────────────────
  let edit: boolean;
  try {
    edit = await confirm({ message: 'Edit preferences?', default: false });
  } catch {
    return;
  }

  if (!edit) return;

  console.log();

  try {
    // Budget
    const budget = await numberPrompt({
      message: 'Default budget (₹):',
      default: prefs.defaultBudget,
      min: 50,
      max: 5000,
    });

    // Dietary
    const dietary = await checkbox({
      message: 'Dietary restrictions (space to select):',
      choices: DIETARY_OPTIONS.map((o) => ({
        ...o,
        checked: prefs.dietary.includes(o.value),
      })),
    });

    // Avoid
    const avoidRaw = await input({
      message: 'Items to avoid (comma-separated, or leave blank):',
      default: prefs.avoid.join(', '),
    });

    const avoid = avoidRaw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    savePreferences({
      defaultBudget: budget ?? DEFAULT_PREFS.defaultBudget,
      dietary,
      avoid,
    });

    console.log();
    success('Preferences saved.');
    console.log();

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled — preferences unchanged.'));
      return;
    }
    throw err;
  }
}
