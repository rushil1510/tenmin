// ─────────────────────────────────────────────
// Tenmin — Ask context builder
// Assembles everything Gemini needs to make
// good decisions: time of day, recent orders,
// and user preferences. Called once per `ask`.
// ─────────────────────────────────────────────

import { getState } from '../store/index.js';
import { getPreferences } from '../store/preferences.js';
import type { UserPreferences } from '../types.js';

export type TimeOfDay = 'morning' | 'lunch' | 'evening' | 'night';

export interface AskContext {
  timeOfDay: TimeOfDay;
  dayOfWeek: string;
  recentItems: string[];    // deduplicated item names from last 3 orders
  preferences: UserPreferences;
}

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 21) return 'evening';
  return 'night';
}

export function buildContext(): AskContext {
  const state = getState();
  const preferences = getPreferences();

  const recentOrders = [...state.orders]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  // Flatten items across the 3 orders, deduplicate by name
  const seen = new Set<string>();
  const recentItems: string[] = [];
  for (const order of recentOrders) {
    for (const item of order.items) {
      const key = item.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        recentItems.push(item.name);
      }
    }
  }

  return {
    timeOfDay: getTimeOfDay(),
    dayOfWeek: new Date().toLocaleDateString('en-IN', { weekday: 'long' }),
    recentItems,
    preferences,
  };
}

// Formats context into a readable block for the Gemini prompt
export function formatContextForPrompt(ctx: AskContext): string {
  const lines: string[] = [
    `Time: ${ctx.timeOfDay} (${ctx.dayOfWeek})`,
  ];

  if (ctx.preferences.defaultBudget) {
    lines.push(`Default budget: ₹${ctx.preferences.defaultBudget}`);
  }
  if (ctx.preferences.dietary.length > 0) {
    lines.push(`Dietary: ${ctx.preferences.dietary.join(', ')}`);
  }
  if (ctx.preferences.avoid.length > 0) {
    lines.push(`Avoid: ${ctx.preferences.avoid.join(', ')}`);
  }
  if (ctx.recentItems.length > 0) {
    lines.push(`Recently ordered: ${ctx.recentItems.join(', ')}`);
  } else {
    lines.push('Recently ordered: nothing yet');
  }

  return lines.join('\n');
}
