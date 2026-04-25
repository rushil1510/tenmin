// ─────────────────────────────────────────────
// Tenmin — Local State Management
// Persists cart, credits, and order history
// to ~/.tenmin/state.json
// ─────────────────────────────────────────────

import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import type { AppState } from '../types.js';

const TENMIN_DIR = join(homedir(), '.tenmin');
const STATE_FILE = join(TENMIN_DIR, 'state.json');

const DEFAULT_STATE: AppState = {
  cart: [],
  credits: 500,
  orders: [],
  address: 'Home — Koramangala, Bangalore 560034',
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
