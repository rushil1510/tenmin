// ─────────────────────────────────────────────
// Tenmin — `history` command
// Show past orders from local state
// ─────────────────────────────────────────────

import { getState } from '../store/index.js';
import { banner, printOrderHistory } from '../ui/format.js';

export async function historyCommand(): Promise<void> {
  banner();
  const state = getState();
  printOrderHistory(state.orders);
}
