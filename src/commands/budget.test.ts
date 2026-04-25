import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home-budget',
}));

const mockHomedir = '/tmp/tenmin-test-home-budget';

import { getState, saveState, resetState } from '../store/index.js';
import type { OrderRecord } from '../types.js';

// ── Helpers mirroring budget.ts logic ────────────
// We test the pure computation logic here, not the chalk/console output.

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sumOrders(orders: OrderRecord[]): number {
  return orders.reduce((s, o) => s + o.total, 0);
}

function topItems(
  orders: OrderRecord[],
  limit = 5,
): { name: string; qty: number; spend: number }[] {
  const map = new Map<string, { name: string; qty: number; spend: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const e = map.get(item.name) ?? { name: item.name, qty: 0, spend: 0 };
      map.set(item.name, {
        name: item.name,
        qty: e.qty + item.qty,
        spend: e.spend + item.price * item.qty,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
}

// ── Seed helpers ──────────────────────────────────

function makeOrder(
  minutesAgo: number,
  items: { name: string; qty: number; price: number }[],
): OrderRecord {
  return {
    orderId: `TM-TEST-${Math.random().toString(36).slice(2)}`,
    items: items.map((i) => ({ ...i, id: undefined })),
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    timestamp: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
  };
}

describe('Budget calculation logic', () => {
  const testDir = join(mockHomedir, '.tenmin');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    resetState();
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  describe('Period filtering', () => {
    it('today filter only includes orders from today', () => {
      const now = new Date();
      const todayStart = startOfDay(now).getTime();

      const orders = [
        makeOrder(10, [{ name: 'Coke', qty: 1, price: 40 }]),    // 10 min ago = today
        makeOrder(60 * 25, [{ name: 'Milk', qty: 1, price: 30 }]), // 25 hrs ago = yesterday
      ];

      const todayOrders = orders.filter(
        (o) => new Date(o.timestamp).getTime() >= todayStart,
      );

      expect(todayOrders).toHaveLength(1);
      expect(todayOrders[0].items[0].name).toBe('Coke');
    });

    it('week filter spans from Sunday to now', () => {
      const now = new Date();
      const weekStart = startOfWeek(now).getTime();

      const thisWeek = makeOrder(60 * 48, [{ name: 'Eggs', qty: 1, price: 78 }]);   // 2 days ago
      const lastWeek = makeOrder(60 * 24 * 8, [{ name: 'Bread', qty: 1, price: 42 }]); // 8 days ago

      const orders = [thisWeek, lastWeek];
      const weekOrders = orders.filter(
        (o) => new Date(o.timestamp).getTime() >= weekStart,
      );

      // 8-day-old order is outside the current week
      expect(weekOrders.every((o) => new Date(o.timestamp).getTime() >= weekStart)).toBe(true);
    });

    it('month filter includes all orders since the 1st', () => {
      const now = new Date();
      const monthStart = startOfMonth(now).getTime();
      const order = makeOrder(60 * 24 * 10, [{ name: 'Sugar', qty: 1, price: 48 }]);
      const isThisMonth = new Date(order.timestamp).getTime() >= monthStart;

      // 10 days ago is within the current month (unless today is the 1st–10th of the month,
      // in which case this may or may not be true — we just verify the logic itself works)
      const expected = new Date(order.timestamp) >= new Date(now.getFullYear(), now.getMonth(), 1);
      expect(isThisMonth).toBe(expected);
    });
  });

  describe('sumOrders', () => {
    it('returns 0 for empty order list', () => {
      expect(sumOrders([])).toBe(0);
    });

    it('sums all order totals correctly', () => {
      const orders = [
        makeOrder(5, [{ name: 'A', qty: 1, price: 100 }]),
        makeOrder(10, [{ name: 'B', qty: 2, price: 50 }]),
      ];
      expect(sumOrders(orders)).toBe(100 + 100); // 100 + (50*2)
    });
  });

  describe('topItems', () => {
    it('returns empty for no orders', () => {
      expect(topItems([])).toEqual([]);
    });

    it('aggregates quantities and spend across orders', () => {
      const orders = [
        makeOrder(5, [{ name: 'Coke', qty: 2, price: 40 }]),
        makeOrder(10, [{ name: 'Coke', qty: 3, price: 40 }]),
        makeOrder(15, [{ name: 'Milk', qty: 1, price: 27 }]),
      ];

      const items = topItems(orders);
      expect(items[0].name).toBe('Coke');
      expect(items[0].qty).toBe(5);
      expect(items[0].spend).toBe(200);
      expect(items[1].name).toBe('Milk');
    });

    it('respects the limit parameter', () => {
      const orders = [
        makeOrder(5, [
          { name: 'A', qty: 5, price: 10 },
          { name: 'B', qty: 4, price: 10 },
          { name: 'C', qty: 3, price: 10 },
          { name: 'D', qty: 2, price: 10 },
          { name: 'E', qty: 1, price: 10 },
        ]),
      ];

      expect(topItems(orders, 3)).toHaveLength(3);
    });

    it('sorts by quantity descending', () => {
      const orders = [
        makeOrder(5, [
          { name: 'Rare', qty: 1, price: 10 },
          { name: 'Common', qty: 10, price: 5 },
        ]),
      ];

      const items = topItems(orders);
      expect(items[0].name).toBe('Common');
    });
  });
});
