// ─────────────────────────────────────────────
// Tenmin — `credits` command
// Check credit balance
// ─────────────────────────────────────────────

import { getCredits } from '../mock/swiggy-api.js';
import { banner, printCredits } from '../ui/format.js';

export async function creditsCommand(): Promise<void> {
  banner();

  const { balance } = await getCredits();
  printCredits(balance);
}
