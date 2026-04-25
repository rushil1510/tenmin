import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home-track',
}));

const mockHomedir = '/tmp/tenmin-test-home-track';

import { getOrderStatus } from './swiggy-api.js';
import { getState, saveState, resetState } from '../store/index.js';

describe('getOrderStatus', () => {
  const testDir = join(mockHomedir, '.tenmin');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    resetState();
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  // Helper: inject an order with a timestamp offset by `minutesAgo`
  function seedOrder(minutesAgo: number): string {
    const state = getState();
    const orderId = `TM-TEST-${Date.now()}`;
    const timestamp = new Date(Date.now() - minutesAgo * 60_000).toISOString();
    state.orders.push({
      orderId,
      items: [{ id: 'bev_001', name: 'Diet Coke', qty: 1, price: 40 }],
      total: 65,
      timestamp,
    });
    saveState(state);
    return orderId;
  }

  it('throws for an unknown order ID', async () => {
    await expect(getOrderStatus('TM-NOPE-0000')).rejects.toThrow(/not found/);
  });

  it('returns PREPARING status for a very fresh order (< 2 min old)', async () => {
    const orderId = seedOrder(0.5); // 30 seconds ago
    const status = await getOrderStatus(orderId);

    expect(status.orderId).toBe(orderId);
    expect(status.status).toBe('PREPARING');
    expect(status.progress).toBe(0.25);
    expect(status.eta).toMatch(/\d+ mins/);
  });

  it('returns PACKED status for an order 2–5 minutes old', async () => {
    const orderId = seedOrder(3);
    const status = await getOrderStatus(orderId);

    expect(status.status).toBe('PACKED');
    expect(status.progress).toBe(0.5);
  });

  it('returns ON_THE_WAY status for an order 5–10 minutes old', async () => {
    const orderId = seedOrder(7);
    const status = await getOrderStatus(orderId);

    expect(status.status).toBe('ON_THE_WAY');
    expect(status.progress).toBe(0.75);
    expect(status.statusText).toMatch(/rider/i);
  });

  it('returns DELIVERED status for an order > 10 minutes old', async () => {
    const orderId = seedOrder(12);
    const status = await getOrderStatus(orderId);

    expect(status.status).toBe('DELIVERED');
    expect(status.progress).toBe(1);
    expect(status.eta).toBe('Arrived');
  });

  it('progress values are monotonically ordered across status buckets', async () => {
    // Seed all four orders into state in one batch BEFORE any getOrderStatus calls.
    const now = Date.now();
    const ids = {
      preparing: `TM-P-${now}`,
      packed:    `TM-K-${now}`,
      onWay:     `TM-O-${now}`,
      delivered: `TM-D-${now}`,
    };

    const state = getState();
    state.orders.push(
      { orderId: ids.preparing, items: [], total: 0, timestamp: new Date(now - 0.5 * 60_000).toISOString() },
      { orderId: ids.packed,    items: [], total: 0, timestamp: new Date(now - 4   * 60_000).toISOString() },
      { orderId: ids.onWay,     items: [], total: 0, timestamp: new Date(now - 8   * 60_000).toISOString() },
      { orderId: ids.delivered, items: [], total: 0, timestamp: new Date(now - 15  * 60_000).toISOString() },
    );
    saveState(state);

    const s1 = await getOrderStatus(ids.preparing);
    const s2 = await getOrderStatus(ids.packed);
    const s3 = await getOrderStatus(ids.onWay);
    const s4 = await getOrderStatus(ids.delivered);

    expect(s1.progress).toBe(0.25);
    expect(s2.progress).toBe(0.50);
    expect(s3.progress).toBe(0.75);
    expect(s4.progress).toBe(1.00);

    expect(s1.progress).toBeLessThan(s2.progress);
    expect(s2.progress).toBeLessThan(s3.progress);
    expect(s3.progress).toBeLessThan(s4.progress);
  });
});
