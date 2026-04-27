// ─────────────────────────────────────────────
// Tenmin — Preferences storage
// Persists user dietary rules, avoid list, and
// default budget to ~/.tenmin/preferences.json.
// Read at the start of every `ask` invocation.
// ─────────────────────────────────────────────

import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import type { UserPreferences } from '../types.js';

const TENMIN_DIR = join(homedir(), '.tenmin');
const PREFS_FILE = join(TENMIN_DIR, 'preferences.json');

export const DEFAULT_PREFS: UserPreferences = {
  dietary: [],
  avoid: [],
  defaultBudget: 300,
};

export function getPreferences(): UserPreferences {
  if (!existsSync(PREFS_FILE)) return { ...DEFAULT_PREFS, dietary: [], avoid: [] };
  try {
    const parsed = JSON.parse(readFileSync(PREFS_FILE, 'utf-8')) as UserPreferences;
    return {
      dietary: parsed.dietary ?? [],
      avoid: parsed.avoid ?? [],
      defaultBudget: parsed.defaultBudget ?? DEFAULT_PREFS.defaultBudget,
    };
  } catch {
    return { ...DEFAULT_PREFS, dietary: [], avoid: [] };
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (!existsSync(TENMIN_DIR)) mkdirSync(TENMIN_DIR, { recursive: true });
  writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2));
}
