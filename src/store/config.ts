// ─────────────────────────────────────────────
// Tenmin — Config storage (~/.tenmin/config.json)
// Holds API keys and user preferences separately
// from cart/order state.
// ─────────────────────────────────────────────

import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const TENMIN_DIR = join(homedir(), '.tenmin');
const CONFIG_FILE = join(TENMIN_DIR, 'config.json');

interface TenminConfig {
  geminiApiKey?: string;
}

function readConfig(): TenminConfig {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as TenminConfig;
  } catch {
    return {};
  }
}

function writeConfig(config: TenminConfig): void {
  if (!existsSync(TENMIN_DIR)) mkdirSync(TENMIN_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? readConfig().geminiApiKey ?? null;
}

export function saveGeminiKey(key: string): void {
  const config = readConfig();
  config.geminiApiKey = key.trim();
  writeConfig(config);
}
