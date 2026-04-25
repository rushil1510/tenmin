// ─────────────────────────────────────────────
// Tenmin — Local State Management
// Persists cart, credits, and order history
// to ~/.tenmin/state.json
// ─────────────────────────────────────────────

import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import type { AppState, SavedList } from '../types.js';
import type { ThemeName } from '../ui/themes.js';

const TENMIN_DIR = join(homedir(), '.tenmin');
const STATE_FILE = join(TENMIN_DIR, 'state.json');

const DEFAULT_STATE: AppState = {
  cart: [],
  credits: 500,
  orders: [],
  address: 'Home — Koramangala, Bangalore 560034',
  theme: 'default' as ThemeName,
  savedLists: [],
};

// ── Directory setup ───────────────────────────

function ensureDir(): void {
  if (!existsSync(TENMIN_DIR)) {
    mkdirSync(TENMIN_DIR, { recursive: true });
  }
}

// ── Read state ────────────────────────────────

export function getState(): AppState {
  ensureDir();

  if (!existsSync(STATE_FILE)) {
    writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    return { ...DEFAULT_STATE, cart: [], orders: [] };
  }

  try {
    const raw = readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as AppState;

    // Ensure all fields exist (handle state file from older version)
    return {
      cart: parsed.cart ?? [],
      credits: parsed.credits ?? DEFAULT_STATE.credits,
      orders: parsed.orders ?? [],
      address: parsed.address ?? DEFAULT_STATE.address,
      theme: parsed.theme ?? DEFAULT_STATE.theme,
      savedLists: parsed.savedLists ?? [],
    };
  } catch {
    // Corrupted state file → reset
    writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    return { ...DEFAULT_STATE, cart: [], orders: [] };
  }
}

// ── Write state ───────────────────────────────

export function saveState(state: AppState): void {
  ensureDir();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── Reset state (useful for testing) ──────────

export function resetState(): void {
  ensureDir();
  writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
}

// ── Theme preference ──────────────────────────

export function getThemeName(): ThemeName {
  const state = getState();
  return (state.theme ?? 'default') as ThemeName;
}

export function setThemeName(theme: ThemeName): void {
  const state = getState();
  state.theme = theme;
  saveState(state);
}

// ── Saved lists helpers ────────────────────────

export function getSavedLists(): SavedList[] {
  return getState().savedLists ?? [];
}

export function getSavedList(name: string): SavedList | undefined {
  return getSavedLists().find((l) => l.name === name);
}

export function saveList(list: SavedList): void {
  const state = getState();
  const idx = state.savedLists.findIndex((l) => l.name === list.name);
  if (idx !== -1) {
    state.savedLists[idx] = list;
  } else {
    state.savedLists.push(list);
  }
  saveState(state);
}

export function deleteList(name: string): boolean {
  const state = getState();
  const before = state.savedLists.length;
  state.savedLists = state.savedLists.filter((l) => l.name !== name);
  saveState(state);
  return state.savedLists.length < before;
}
