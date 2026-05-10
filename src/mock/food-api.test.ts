// ─────────────────────────────────────────────────────────────
// Tenmin — Food API Tests
// Covers: addFoodToCart, applyFoodCoupon, placeFoodOrder
// These functions power the LangChain copilot agent's
// restaurant-ordering workflow.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home-food-api',
}));

const mockHomedir = '/tmp/tenmin-test-home-food-api';

import {
  addFoodToCart,
  applyFoodCoupon,
  placeFoodOrder,
  searchRestaurants,
} from './swiggy-api.js';
import { getState, resetState } from '../store/index.js';

describe('Food API — addFoodToCart', () => {
  const testDir = join(mockHomedir, '.tenmin');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    resetState();
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('creates a new food cart when adding to an empty state', async () => {
    // rest_001 → Punjab Grill, m_001 → Butter Chicken
    const cart = await addFoodToCart('rest_001', 'm_001', 1);

    expect(cart.restaurantId).toBe('rest_001');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].menuItem.id).toBe('m_001');
    expect(cart.items[0].qty).toBe(1);
    expect(cart.subtotal).toBe(350); // Butter Chicken price
    expect(cart.discount).toBe(0);
    expect(cart.appliedCoupon).toBeNull();
    expect(cart.total).toBe(350);
  });

  it('accumulates quantity when adding the same menu item twice', async () => {
    await addFoodToCart('rest_001', 'm_001', 1);
    const cart = await addFoodToCart('rest_001', 'm_001', 2);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(3);
    expect(cart.subtotal).toBe(350 * 3);
    expect(cart.total).toBe(350 * 3);
  });

  it('adds multiple different items to the same restaurant cart', async () => {
    await addFoodToCart('rest_001', 'm_001', 1); // Butter Chicken ₹350
    const cart = await addFoodToCart('rest_001', 'm_003', 2); // Garlic Naan ₹60

    expect(cart.items).toHaveLength(2);
    expect(cart.subtotal).toBe(350 + 60 * 2);
    expect(cart.total).toBe(cart.subtotal);
  });

  it('clears the cart when switching to a different restaurant', async () => {
    await addFoodToCart('rest_001', 'm_001', 1); // Punjab Grill

    // Switch to Pizza Express
    const cart = await addFoodToCart('rest_002', 'm_004', 1);

    expect(cart.restaurantId).toBe('rest_002');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].menuItem.id).toBe('m_004');
  });

  it('throws when restaurant does not exist', async () => {
    await expect(addFoodToCart('rest_999', 'm_001', 1)).rejects.toThrow(
      /Restaurant rest_999 not found/,
    );
  });

  it('throws when menu item does not exist at the restaurant', async () => {
    await expect(addFoodToCart('rest_001', 'bad_item', 1)).rejects.toThrow(
      /Menu item bad_item not found/,
    );
  });

  it('persists the food cart to state after adding', async () => {
    await addFoodToCart('rest_001', 'm_001', 1);
    const state = getState();
    expect(state.foodCart).not.toBeNull();
    expect(state.foodCart!.restaurantId).toBe('rest_001');
  });
});

describe('Food API — applyFoodCoupon', () => {
  const testDir = join(mockHomedir, '.tenmin');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    resetState();
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('applies a valid coupon and updates cart discount + total', async () => {
    // Build a cart above the ₹400 minimum for PUNJAB50
    await addFoodToCart('rest_001', 'm_001', 2); // 2× Butter Chicken = ₹700

    const cart = await applyFoodCoupon('PUNJAB50', 'rest_001');

    expect(cart.appliedCoupon).toBe('PUNJAB50');
    expect(cart.discount).toBe(50);
    expect(cart.subtotal).toBe(700);
    expect(cart.total).toBe(650); // 700 - 50
  });

  it('coupon codes are case-insensitive', async () => {
    await addFoodToCart('rest_001', 'm_001', 2); // ₹700
    const cart = await applyFoodCoupon('punjab50', 'rest_001');
    expect(cart.appliedCoupon).toBe('PUNJAB50');
    expect(cart.discount).toBe(50);
  });

  it('throws when coupon code is invalid', async () => {
    await addFoodToCart('rest_001', 'm_001', 1);
    await expect(applyFoodCoupon('FAKECODE', 'rest_001')).rejects.toThrow(
      /Invalid coupon code/,
    );
  });

  it('throws when cart total is below coupon minimum order value', async () => {
    // PUNJAB50 requires ₹400 minimum; Butter Chicken alone is ₹350
    await addFoodToCart('rest_001', 'm_001', 1); // ₹350 < ₹400 minimum

    await expect(applyFoodCoupon('PUNJAB50', 'rest_001')).rejects.toThrow(
      /at least ₹400/,
    );
  });

  it('throws when the food cart is empty', async () => {
    await expect(applyFoodCoupon('PUNJAB50', 'rest_001')).rejects.toThrow(
      /Food cart is empty/,
    );
  });

  it('applies a zero-minimum coupon successfully', async () => {
    // PIZZA20 has minOrderValue: 0
    await addFoodToCart('rest_002', 'm_004', 1); // Margherita ₹300

    const cart = await applyFoodCoupon('PIZZA20', 'rest_002');

    expect(cart.appliedCoupon).toBe('PIZZA20');
    expect(cart.discount).toBe(20);
    expect(cart.total).toBe(280);
  });

  it('persists the updated discount and coupon code to state', async () => {
    await addFoodToCart('rest_003', 'm_007', 2); // 2× Chicken Biryani = ₹640
    await applyFoodCoupon('BIRYANI60', 'rest_003');

    const state = getState();
    expect(state.foodCart!.appliedCoupon).toBe('BIRYANI60');
    expect(state.foodCart!.discount).toBe(60);
  });
});

describe('Food API — placeFoodOrder', () => {
  const testDir = join(mockHomedir, '.tenmin');

  beforeEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    resetState();
  });

  afterEach(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
  });

  it('places a food order successfully and returns an OrderResult', async () => {
    await addFoodToCart('rest_001', 'm_003', 1); // Garlic Naan ₹60

    const result = await placeFoodOrder();

    expect(result.orderId).toMatch(/TM-FOOD-\d{4}/);
    expect(result.subtotal).toBe(60);
    expect(result.deliveryFee).toBe(40);
    expect(result.total).toBe(100);
    expect(result.estimatedDelivery).toBe('30 min');
    expect(result.items).toHaveLength(1);
  });

  it('deducts the grand total (subtotal + ₹40 delivery) from credits', async () => {
    const stateBefore = getState();
    const creditsBefore = stateBefore.credits; // 500

    await addFoodToCart('rest_002', 'm_004', 1); // Margherita ₹300
    const result = await placeFoodOrder();

    const stateAfter = getState();
    const expectedTotal = 300 + 40; // subtotal + fixed delivery fee
    expect(result.total).toBe(expectedTotal);
    expect(stateAfter.credits).toBe(creditsBefore - expectedTotal);
  });

  it('clears the food cart after a successful order', async () => {
    await addFoodToCart('rest_001', 'm_002', 1); // Dal Makhani ₹280
    await placeFoodOrder();

    const state = getState();
    expect(state.foodCart).toBeNull();
  });

  it('adds the completed food order to order history', async () => {
    await addFoodToCart('rest_001', 'm_002', 1); // Dal Makhani ₹280
    await placeFoodOrder();

    const state = getState();
    expect(state.orders).toHaveLength(1);
    expect(state.orders[0].orderId).toMatch(/TM-FOOD-\d{4}/);
    expect(state.orders[0].items[0].name).toBe('Dal Makhani');
  });

  it('throws when the food cart is empty', async () => {
    await expect(placeFoodOrder()).rejects.toThrow(/Food cart is empty/);
  });

  it('throws when credits are insufficient for the food order', async () => {
    // Adjust state so we have barely no credits
    const state = getState();
    state.credits = 10; // Way below minimum order cost
    const { saveState } = await import('../store/index.js');
    saveState(state);

    await addFoodToCart('rest_001', 'm_001', 1); // Butter Chicken ₹350 + ₹40 delivery
    await expect(placeFoodOrder()).rejects.toThrow(/Insufficient credits/);
  });

  it('applies coupon discount before charging credits', async () => {
    // Biryani Blues: m_007 Chicken Biryani ₹320 → BIRYANI60 = ₹60 off
    // So cart.total = 260, grand total = 260 + 40 = 300
    await addFoodToCart('rest_003', 'm_007', 1);
    await applyFoodCoupon('BIRYANI60', 'rest_003');

    const stateBefore = getState();
    const creditsBefore = stateBefore.credits;

    const result = await placeFoodOrder();

    expect(result.subtotal).toBe(320);
    expect(result.total).toBe(300); // 260 (after coupon) + 40 delivery
    expect(getState().credits).toBe(creditsBefore - 300);
  });
});
