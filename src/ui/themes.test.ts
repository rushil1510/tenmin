// Tenmin — Theme System Tests
// Covers: THEME_NAMES registry, getTheme resolution, fallback,
// Theme interface field completeness, and icon set integrity.

import { describe, it, expect } from 'vitest';
import { THEMES, THEME_NAMES, getTheme } from './themes.js';
import type { ThemeName } from './themes.js';

const REQUIRED_COLORS = [
  'brand', 'brandText',
  'success', 'error', 'info', 'warn', 'hint',
  'primary', 'secondary', 'accent', 'price', 'priceStrike',
  'divider', 'muted',
] as const;

const REQUIRED_ICONS = [
  'cart', 'credits', 'order',
  'success', 'error', 'info', 'warn', 'hint',
  'bolt', 'done',
] as const;

describe('Theme registry — THEME_NAMES', () => {
  it('exports exactly 5 themes', () => {
    expect(THEME_NAMES).toHaveLength(5);
  });

  it('contains all expected theme identifiers', () => {
    const expected: ThemeName[] = ['default', 'light', 'dark', 'cyberpunk', 'ocean'];
    for (const name of expected) {
      expect(THEME_NAMES).toContain(name);
    }
  });

  it('THEMES record has an entry for every name in THEME_NAMES', () => {
    for (const name of THEME_NAMES) {
      expect(THEMES[name]).toBeDefined();
    }
  });
});

describe('getTheme', () => {
  it('returns the correct theme object for each registered name', () => {
    for (const name of THEME_NAMES) {
      const theme = getTheme(name);
      expect(theme.name).toBe(name);
    }
  });

  it('falls back to the default theme for an unknown name', () => {
    const theme = getTheme('nonexistent' as ThemeName);
    expect(theme.name).toBe('default');
  });

  it('returns a non-empty label for every theme', () => {
    for (const name of THEME_NAMES) {
      const theme = getTheme(name);
      expect(theme.label.length).toBeGreaterThan(0);
    }
  });

  it('returns a non-empty description for every theme', () => {
    for (const name of THEME_NAMES) {
      const theme = getTheme(name);
      expect(theme.description.length).toBeGreaterThan(0);
    }
  });
});

describe('Theme interface completeness', () => {
  for (const name of THEME_NAMES) {
    it(`theme "${name}" has all required color roles`, () => {
      const theme = getTheme(name);
      for (const colorKey of REQUIRED_COLORS) {
        expect(theme.colors[colorKey].length).toBeGreaterThan(0);
      }
    });

    it(`theme "${name}" has all required icon keys`, () => {
      const theme = getTheme(name);
      for (const iconKey of REQUIRED_ICONS) {
        expect(theme.icons[iconKey].length).toBeGreaterThan(0);
      }
    });
  }
});

describe('Default theme values', () => {
  it('has the Swiggy-inspired orange brand color', () => {
    expect(getTheme('default').colors.brand.toUpperCase()).toBe('#FF5722');
  });

  it('uses a bolt icon for the banner', () => {
    expect(getTheme('default').icons.bolt).toBeTruthy();
  });
});

describe('Cyberpunk theme values', () => {
  it('uses a neon pink brand color', () => {
    expect(getTheme('cyberpunk').colors.brand.toUpperCase()).toBe('#FF0080');
  });
});
