// ─────────────────────────────────────────────────────────────
// Tenmin — Preferences Store Tests
// Covers: getPreferences, savePreferences, default values,
// field-level merging, and corruption recovery.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home-prefs',
}));

const mockHomedir = '/tmp/tenmin-test-home-prefs';

import { getPreferences, savePreferences, DEFAULT_PREFS } from './preferences.js';

describe('Preferences Store', () => {
  const testDir = join(mockHomedir, '.tenmin');
  const prefsFile = join(testDir, 'preferences.json');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('returns default preferences when no file exists', () => {
    const prefs = getPreferences();

    expect(prefs.dietary).toEqual([]);
    expect(prefs.avoid).toEqual([]);
    expect(prefs.defaultBudget).toBe(300);
  });

  it('DEFAULT_PREFS exports the canonical defaults', () => {
    expect(DEFAULT_PREFS.dietary).toEqual([]);
    expect(DEFAULT_PREFS.avoid).toEqual([]);
    expect(DEFAULT_PREFS.defaultBudget).toBe(300);
  });

  it('savePreferences persists full preferences to disk', () => {
    savePreferences({
      dietary: ['vegetarian'],
      avoid: ['energy drinks'],
      defaultBudget: 500,
    });

    const prefs = getPreferences();
    expect(prefs.dietary).toEqual(['vegetarian']);
    expect(prefs.avoid).toEqual(['energy drinks']);
    expect(prefs.defaultBudget).toBe(500);
  });

  it('savePreferences creates the .tenmin directory if it does not exist', () => {
    expect(existsSync(testDir)).toBe(false);

    savePreferences({ dietary: [], avoid: [], defaultBudget: 300 });

    expect(existsSync(prefsFile)).toBe(true);
  });

  it('getPreferences round-trips multiple dietary flags', () => {
    savePreferences({
      dietary: ['vegan', 'gluten-free'],
      avoid: ['peanuts', 'soy'],
      defaultBudget: 200,
    });

    const prefs = getPreferences();
    expect(prefs.dietary).toEqual(['vegan', 'gluten-free']);
    expect(prefs.avoid).toEqual(['peanuts', 'soy']);
  });

  it('getPreferences falls back to empty arrays when fields are missing (migration)', () => {
    // Simulate an older preferences file without `dietary` and `avoid`
    mkdirSync(testDir, { recursive: true });
    writeFileSync(prefsFile, JSON.stringify({ defaultBudget: 400 }));

    const prefs = getPreferences();
    expect(prefs.dietary).toEqual([]);
    expect(prefs.avoid).toEqual([]);
    expect(prefs.defaultBudget).toBe(400);
  });

  it('getPreferences falls back to default budget when field is missing', () => {
    mkdirSync(testDir, { recursive: true });
    writeFileSync(prefsFile, JSON.stringify({ dietary: ['vegetarian'], avoid: [] }));

    const prefs = getPreferences();
    expect(prefs.defaultBudget).toBe(DEFAULT_PREFS.defaultBudget);
  });

  it('getPreferences returns defaults when file is corrupted JSON', () => {
    mkdirSync(testDir, { recursive: true });
    writeFileSync(prefsFile, '{ this is not valid json !!!');

    const prefs = getPreferences();
    expect(prefs.dietary).toEqual([]);
    expect(prefs.avoid).toEqual([]);
    expect(prefs.defaultBudget).toBe(300);
  });

  it('overwriting preferences replaces previous values', () => {
    savePreferences({ dietary: ['vegetarian'], avoid: [], defaultBudget: 300 });
    savePreferences({ dietary: ['vegan'], avoid: ['mushrooms'], defaultBudget: 150 });

    const prefs = getPreferences();
    expect(prefs.dietary).toEqual(['vegan']);
    expect(prefs.avoid).toEqual(['mushrooms']);
    expect(prefs.defaultBudget).toBe(150);
  });
});
