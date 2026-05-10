// ─────────────────────────────────────────────────────────────
// Tenmin — Context Builder Tests
// Covers: getTimeOfDay (via buildContext), buildContext field
// shape, formatContextForPrompt output, and recent-item
// deduplication logic.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home-context',
}));

const mockHomedir = '/tmp/tenmin-test-home-context';

import { buildContext, formatContextForPrompt } from './context.js';
import { getState, saveState, resetState } from '../store/index.js';
import type { OrderRecord } from '../types.js';

// Helper: seed orders into state
function seedOrders(records: Partial<OrderRecord>[]): void {
  const state = getState();
  state.orders = records.map((r, i) => ({
    orderId: `TM-TEST-${i}`,
    items: r.items ?? [],
    total: r.total ?? 0,
    timestamp: r.timestamp ?? new Date().toISOString(),
  }));
  saveState(state);
}

describe('buildContext', () => {
  const testDir = join(mockHomedir, '.tenmin');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    resetState();
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('returns a valid context shape with all required fields', () => {
    const ctx = buildContext();

    expect(ctx).toHaveProperty('timeOfDay');
    expect(ctx).toHaveProperty('dayOfWeek');
    expect(ctx).toHaveProperty('recentItems');
    expect(ctx).toHaveProperty('preferences');
    expect(Array.isArray(ctx.recentItems)).toBe(true);
  });

  it('timeOfDay is one of the four valid time slots', () => {
    const ctx = buildContext();
    expect(['morning', 'lunch', 'evening', 'night']).toContain(ctx.timeOfDay);
  });

  it('dayOfWeek is a non-empty string', () => {
    const ctx = buildContext();
    expect(typeof ctx.dayOfWeek).toBe('string');
    expect(ctx.dayOfWeek.length).toBeGreaterThan(0);
  });

  it('recentItems is empty when there are no orders', () => {
    const ctx = buildContext();
    expect(ctx.recentItems).toEqual([]);
  });

  it('recentItems pulls from the latest 3 orders', () => {
    const now = Date.now();
    seedOrders([
      { items: [{ id: 'a', name: 'Diet Coke', qty: 1, price: 40 }],  total: 40,  timestamp: new Date(now - 1 * 60_000).toISOString() },
      { items: [{ id: 'b', name: 'Milk',      qty: 2, price: 27 }],  total: 54,  timestamp: new Date(now - 2 * 60_000).toISOString() },
      { items: [{ id: 'c', name: 'Eggs',      qty: 1, price: 78 }],  total: 78,  timestamp: new Date(now - 3 * 60_000).toISOString() },
      { items: [{ id: 'd', name: 'Bread',     qty: 1, price: 42 }],  total: 42,  timestamp: new Date(now - 4 * 60_000).toISOString() },
    ]);

    const ctx = buildContext();
    // Only items from the 3 most recent orders should appear
    expect(ctx.recentItems).toContain('Diet Coke');
    expect(ctx.recentItems).toContain('Milk');
    expect(ctx.recentItems).toContain('Eggs');
    expect(ctx.recentItems).not.toContain('Bread'); // 4th order excluded
  });

  it('recentItems deduplicates the same item appearing across multiple orders', () => {
    const now = Date.now();
    seedOrders([
      { items: [{ id: 'a', name: 'Diet Coke', qty: 1, price: 40 }], total: 40, timestamp: new Date(now - 1 * 60_000).toISOString() },
      { items: [{ id: 'a', name: 'Diet Coke', qty: 2, price: 40 }], total: 80, timestamp: new Date(now - 2 * 60_000).toISOString() },
      { items: [{ id: 'b', name: 'Milk',      qty: 1, price: 27 }], total: 27, timestamp: new Date(now - 3 * 60_000).toISOString() },
    ]);

    const ctx = buildContext();
    // Diet Coke appears in two orders but should only be in recentItems once
    const cokeMentions = ctx.recentItems.filter(
      (name) => name.toLowerCase() === 'diet coke',
    );
    expect(cokeMentions).toHaveLength(1);
  });

  it('recentItems deduplication is case-insensitive', () => {
    const now = Date.now();
    seedOrders([
      { items: [{ id: 'a', name: 'Diet Coke', qty: 1, price: 40 }], total: 40, timestamp: new Date(now - 1 * 60_000).toISOString() },
      { items: [{ id: 'a', name: 'diet coke', qty: 1, price: 40 }], total: 40, timestamp: new Date(now - 2 * 60_000).toISOString() },
    ]);

    const ctx = buildContext();
    const cokeCount = ctx.recentItems.filter(
      (name) => name.toLowerCase() === 'diet coke',
    );
    expect(cokeCount).toHaveLength(1);
  });

  it('preferences defaults are correct when no preferences file exists', () => {
    const ctx = buildContext();
    expect(ctx.preferences.dietary).toEqual([]);
    expect(ctx.preferences.avoid).toEqual([]);
    expect(ctx.preferences.defaultBudget).toBe(300);
  });
});

describe('formatContextForPrompt', () => {
  it('always includes time information', () => {
    const ctx = buildContext();
    const output = formatContextForPrompt(ctx);
    expect(output).toMatch(/^Time:/m);
  });

  it('includes default budget when set', () => {
    const ctx = buildContext();
    ctx.preferences.defaultBudget = 500;
    const output = formatContextForPrompt(ctx);
    expect(output).toContain('Default budget: ₹500');
  });

  it('includes dietary restrictions when present', () => {
    const ctx = buildContext();
    ctx.preferences.dietary = ['vegetarian', 'gluten-free'];
    const output = formatContextForPrompt(ctx);
    expect(output).toContain('Dietary: vegetarian, gluten-free');
  });

  it('includes avoid list when present', () => {
    const ctx = buildContext();
    ctx.preferences.avoid = ['energy drinks', 'spicy'];
    const output = formatContextForPrompt(ctx);
    expect(output).toContain('Avoid: energy drinks, spicy');
  });

  it('omits dietary/avoid lines when those arrays are empty', () => {
    const ctx = buildContext();
    ctx.preferences.dietary = [];
    ctx.preferences.avoid = [];
    const output = formatContextForPrompt(ctx);
    expect(output).not.toContain('Dietary:');
    expect(output).not.toContain('Avoid:');
  });

  it('shows "nothing yet" for recent items when order history is empty', () => {
    const ctx = buildContext();
    ctx.recentItems = [];
    const output = formatContextForPrompt(ctx);
    expect(output).toContain('Recently ordered: nothing yet');
  });

  it('shows comma-separated recent items when present', () => {
    const ctx = buildContext();
    ctx.recentItems = ['Diet Coke', 'Milk', 'Eggs'];
    const output = formatContextForPrompt(ctx);
    expect(output).toContain('Recently ordered: Diet Coke, Milk, Eggs');
  });

  it('returns a multi-line string', () => {
    const ctx = buildContext();
    const output = formatContextForPrompt(ctx);
    expect(output.split('\n').length).toBeGreaterThan(1);
  });
});
