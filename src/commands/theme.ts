// ─────────────────────────────────────────────
// Tenmin — `theme` command
// Switch between UI themes interactively
// ─────────────────────────────────────────────

import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import { getThemeName, setThemeName } from '../store/index.js';
import { THEMES, THEME_NAMES, getTheme, type ThemeName } from '../ui/themes.js';
import { banner, success, info, divider } from '../ui/format.js';

export async function themeCommand(themeName?: string): Promise<void> {
  banner();

  const current = getThemeName();

  // ── Direct set (non-interactive) ────────────
  if (themeName) {
    const name = themeName.toLowerCase() as ThemeName;

    if (!THEME_NAMES.includes(name)) {
      console.log();
      console.log(
        chalk.red(`  ✖ Unknown theme: "${themeName}"`),
      );
      console.log();
      console.log(chalk.dim('  Available themes:'));
      for (const t of THEME_NAMES) {
        const theme = THEMES[t];
        const marker = t === current ? chalk.green(' ●') : '  ';
        console.log(`${marker} ${theme.label}  ${chalk.dim(theme.description)}`);
      }
      console.log();
      return;
    }

    if (name === current) {
      info(`Already using the ${chalk.bold(THEMES[name].label)} theme.`);
      console.log();
      return;
    }

    setThemeName(name);

    // Re-render banner with new theme
    banner();
    success(`Switched to ${chalk.bold(THEMES[name].label)} theme.`);
    console.log();

    // Show a preview
    printThemePreview(name);
    return;
  }

  // ── Interactive picker ──────────────────────
  console.log(
    chalk.bold.white('  🎨 Theme Selector'),
  );
  console.log(
    chalk.dim(`  Currently using: `) +
    chalk.bold(THEMES[current].label),
  );
  console.log();

  try {
    const choices = THEME_NAMES.map((name) => {
      const theme = THEMES[name];
      const active = name === current ? chalk.green(' (active)') : '';
      return {
        name: `${theme.label}  ${chalk.dim(theme.description)}${active}`,
        value: name,
      };
    });

    const selected = await select({
      message: 'Choose a theme:',
      choices,
    });

    if (selected === current) {
      info(`Already using the ${chalk.bold(THEMES[selected].label)} theme.`);
      console.log();
      return;
    }

    setThemeName(selected);

    // Re-render with new theme
    banner();
    success(`Switched to ${chalk.bold(THEMES[selected].label)} theme.`);
    console.log();

    printThemePreview(selected);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(chalk.dim('\n  Cancelled.'));
      return;
    }
    throw err;
  }
}

// ── Preview the selected theme ────────────────

function printThemePreview(themeName: ThemeName): void {
  const theme = getTheme(themeName);

  console.log(chalk.hex(theme.colors.secondary)('  Preview:'));
  console.log();

  // Brand
  console.log(
    chalk.bold.hex(theme.colors.brand)(`  ${theme.icons.bolt} tenmin`) +
    chalk.hex(theme.colors.brandText)(' — order from Swiggy, stay in flow'),
  );
  console.log();

  // Status messages
  console.log(chalk.hex(theme.colors.success)(`  ${theme.icons.success} `) + 'Added 2x Diet Coke to cart');
  console.log(chalk.hex(theme.colors.info)(`  ${theme.icons.info} `) + `Cart: ${chalk.bold('3 items')} — ${chalk.hex(theme.colors.price).bold('₹185')}`);
  console.log(chalk.hex(theme.colors.warn)(`  ${theme.icons.warn} `) + 'Add ₹14 more for free delivery');
  console.log(chalk.hex(theme.colors.hint)(`  ${theme.icons.hint} Run \`tenmin order <item>\` to search`));

  // Divider
  console.log(chalk.hex(theme.colors.divider)('  ' + '─'.repeat(46)));

  // Product line
  const num = chalk.bold.hex(theme.colors.accent)('1.');
  const name = chalk.hex(theme.colors.primary).bold('Diet Coke');
  const unit = chalk.hex(theme.colors.secondary)('(300ml)');
  const price = chalk.hex(theme.colors.price).bold('₹40');
  const mrp = chalk.hex(theme.colors.priceStrike).strikethrough(' ₹42');
  const brand = chalk.hex(theme.colors.secondary)('— Coca-Cola');

  console.log(`  ${num} ${name} ${unit}  ${price}${mrp}  ${brand}`);
  console.log();
}
