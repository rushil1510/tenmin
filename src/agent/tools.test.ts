// Tenmin — LangChain Agent Tools Tests
// Covers: all 11 tools in src/agent/tools.ts
// The underlying API functions are mocked so tests run
// instantly without real network calls or delays.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchResult } from '../types.js';

// ── Mock the entire swiggy-api module ─────────────────────────
vi.mock('../mock/swiggy-api.js', () => ({
  getAddresses: vi.fn(),
  searchRestaurants: vi.fn(),
  getRestaurantMenu: vi.fn(),
  fetchFoodCoupons: vi.fn(),
  applyFoodCoupon: vi.fn(),
  addFoodToCart: vi.fn(),
  placeFoodOrder: vi.fn(),
  searchProducts: vi.fn(),
  addToCart: vi.fn(),
  checkout: vi.fn(),
  yourGoToItems: vi.fn(),
}));

import {
  getAddressesTool,
  searchRestaurantsTool,
  getRestaurantMenuTool,
  fetchFoodCouponsTool,
  applyFoodCouponTool,
  addFoodToCartTool,
  placeFoodOrderTool,
  searchProductsTool,
  yourGoToItemsTool,
  addToInstamartCartTool,
  checkoutInstamartTool,
  allTools,
} from './tools.js';

import {
  getAddresses,
  searchRestaurants,
  getRestaurantMenu,
  fetchFoodCoupons,
  applyFoodCoupon,
  addFoodToCart,
  placeFoodOrder,
  searchProducts,
  addToCart,
  checkout,
  yourGoToItems,
} from '../mock/swiggy-api.js';

// typed mock helpers
const mockGetAddresses = vi.mocked(getAddresses);
const mockSearchRestaurants = vi.mocked(searchRestaurants);
const mockGetMenu = vi.mocked(getRestaurantMenu);
const mockFetchCoupons = vi.mocked(fetchFoodCoupons);
const mockApplyCoupon = vi.mocked(applyFoodCoupon);
const mockAddFood = vi.mocked(addFoodToCart);
const mockPlaceFood = vi.mocked(placeFoodOrder);
const mockSearchProducts = vi.mocked(searchProducts);
const mockAddToCart = vi.mocked(addToCart);
const mockCheckout = vi.mocked(checkout);
const mockGoToItems = vi.mocked(yourGoToItems);

describe('allTools export', () => {
  it('contains exactly 11 tools', () => {
    expect(allTools).toHaveLength(11);
  });

  it('every tool has a non-empty name and description', () => {
    for (const t of allTools) {
      expect((t as any).name.length).toBeGreaterThan(0);
      expect((t as any).description.length).toBeGreaterThan(0);
    }
  });
});

// ── Address tool ──────────────────────────────────────────────

describe('getAddressesTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns JSON-stringified addresses on success', async () => {
    const addresses = [{ id: 'addr_001', label: 'Home', displayText: 'Koramangala, Bangalore' }];
    mockGetAddresses.mockResolvedValue(addresses as any);

    const result = await getAddressesTool.invoke({});
    expect(result).toBe(JSON.stringify(addresses));
    expect(mockGetAddresses).toHaveBeenCalled();
  });

  it('returns an error string when addresses cannot be fetched', async () => {
    mockGetAddresses.mockRejectedValue(new Error('Auth token expired'));

    const result = await getAddressesTool.invoke({});
    expect(result).toMatch(/Error: Auth token expired/);
  });
});

// ── Food API tools ────────────────────────────────────────────

describe('searchRestaurantsTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns JSON-stringified restaurants on success', async () => {
    const restaurants = [{ id: 'rest_001', name: 'Punjab Grill' }];
    mockSearchRestaurants.mockResolvedValue(restaurants as any);

    const result = await searchRestaurantsTool.invoke({ query: 'biryani' });
    expect(result).toBe(JSON.stringify(restaurants));
    expect(mockSearchRestaurants).toHaveBeenCalledWith('biryani');
  });

  it('returns an error string when the API throws', async () => {
    mockSearchRestaurants.mockRejectedValue(new Error('Network error'));

    const result = await searchRestaurantsTool.invoke({ query: 'pizza' });
    expect(result).toMatch(/Error: Network error/);
  });
});

describe('getRestaurantMenuTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns JSON-stringified menu on success', async () => {
    const menu = [{ id: 'm_001', name: 'Butter Chicken' }];
    mockGetMenu.mockResolvedValue(menu as any);

    const result = await getRestaurantMenuTool.invoke({ restaurantId: 'rest_001' });
    expect(result).toBe(JSON.stringify(menu));
    expect(mockGetMenu).toHaveBeenCalledWith('rest_001');
  });

  it('returns an error string when restaurant not found', async () => {
    mockGetMenu.mockRejectedValue(new Error('Restaurant rest_999 not found'));

    const result = await getRestaurantMenuTool.invoke({ restaurantId: 'rest_999' });
    expect(result).toMatch(/Error:.*rest_999/);
  });
});

describe('fetchFoodCouponsTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns JSON-stringified coupons on success', async () => {
    const coupons = [{ code: 'PUNJAB50', discountAmount: 50 }];
    mockFetchCoupons.mockResolvedValue(coupons as any);

    const result = await fetchFoodCouponsTool.invoke({ restaurantId: 'rest_001' });
    expect(result).toBe(JSON.stringify(coupons));
    expect(mockFetchCoupons).toHaveBeenCalledWith('rest_001');
  });

  it('returns an error string on failure', async () => {
    mockFetchCoupons.mockRejectedValue(new Error('API down'));

    const result = await fetchFoodCouponsTool.invoke({ restaurantId: 'rest_001' });
    expect(result).toMatch(/Error: API down/);
  });
});

describe('applyFoodCouponTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a confirmation string with discount and total', async () => {
    mockApplyCoupon.mockResolvedValue({ total: 300, discount: 50 } as any);

    const result = await applyFoodCouponTool.invoke({
      couponCode: 'PUNJAB50',
      restaurantId: 'rest_001',
    });
    expect(result).toContain('₹300');
    expect(result).toContain('₹50');
    expect(mockApplyCoupon).toHaveBeenCalledWith('PUNJAB50', 'rest_001');
  });

  it('returns an error string when coupon is invalid', async () => {
    mockApplyCoupon.mockRejectedValue(new Error('Invalid coupon code'));

    const result = await applyFoodCouponTool.invoke({
      couponCode: 'BAD',
      restaurantId: 'rest_001',
    });
    expect(result).toMatch(/Error: Invalid coupon code/);
  });
});

describe('addFoodToCartTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a success message with subtotal', async () => {
    mockAddFood.mockResolvedValue({ subtotal: 350, total: 350 } as any);

    const result = await addFoodToCartTool.invoke({
      restaurantId: 'rest_001',
      menuItemId: 'm_001',
      quantity: 1,
    });
    expect(result).toContain('₹350');
    expect(mockAddFood).toHaveBeenCalledWith('rest_001', 'm_001', 1);
  });

  it('returns an error string when item not found', async () => {
    mockAddFood.mockRejectedValue(new Error('Menu item bad_item not found'));

    const result = await addFoodToCartTool.invoke({
      restaurantId: 'rest_001',
      menuItemId: 'bad_item',
      quantity: 1,
    });
    expect(result).toMatch(/Error:.*bad_item/);
  });
});

describe('placeFoodOrderTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns order confirmation with ID and total', async () => {
    mockPlaceFood.mockResolvedValue({
      orderId: 'TM-FOOD-1234',
      total: 390,
      estimatedDelivery: '30 min',
    } as any);

    const result = await placeFoodOrderTool.invoke({});
    expect(result).toContain('TM-FOOD-1234');
    expect(result).toContain('₹390');
    expect(result).toContain('30 min');
  });

  it('returns an error string when cart is empty', async () => {
    mockPlaceFood.mockRejectedValue(new Error('Food cart is empty.'));

    const result = await placeFoodOrderTool.invoke({});
    expect(result).toMatch(/Error: Food cart is empty/);
  });
});

// ── Instamart tools ───────────────────────────────────────────

describe('searchProductsTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns JSON-stringified products on success', async () => {
    // Cast as SearchResult so the stub satisfies the typed mock signature
    const mockResult: SearchResult = {
      products: [] as any,
      query: 'coke',
      totalResults: 1,
    };
    mockSearchProducts.mockResolvedValue(mockResult);

    const result = await searchProductsTool.invoke({ query: 'coke' });
    expect(result).toBe(JSON.stringify(mockResult.products));
    expect(mockSearchProducts).toHaveBeenCalledWith('coke');
  });

  it('returns an error string on failure', async () => {
    mockSearchProducts.mockRejectedValue(new Error('Search failed'));

    const result = await searchProductsTool.invoke({ query: 'coke' });
    expect(result).toMatch(/Error: Search failed/);
  });
});

describe('yourGoToItemsTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns JSON-stringified go-to products on success', async () => {
    const mockResult: SearchResult = {
      products: [] as any,
      query: '',
      totalResults: 1,
    };
    mockGoToItems.mockResolvedValue(mockResult);

    const result = await yourGoToItemsTool.invoke({});
    expect(result).toBe(JSON.stringify(mockResult.products));
    expect(mockGoToItems).toHaveBeenCalled();
  });

  it('returns an error string on failure', async () => {
    mockGoToItems.mockRejectedValue(new Error('Go-to items unavailable'));

    const result = await yourGoToItemsTool.invoke({});
    expect(result).toMatch(/Error: Go-to items unavailable/);
  });
});

describe('addToInstamartCartTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a success message with cart size', async () => {
    const cartItems = [{ product: { id: 'bev_001' }, qty: 2 }];
    mockAddToCart.mockResolvedValue(cartItems as any);

    const result = await addToInstamartCartTool.invoke({ productId: 'bev_001', quantity: 2 });
    expect(result).toContain('1 items');
    expect(mockAddToCart).toHaveBeenCalledWith('bev_001', 2);
  });

  it('returns an error string when product not found', async () => {
    mockAddToCart.mockRejectedValue(new Error('Product not found: bad_id'));

    const result = await addToInstamartCartTool.invoke({ productId: 'bad_id', quantity: 1 });
    expect(result).toMatch(/Error:.*bad_id/);
  });
});

describe('checkoutInstamartTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns success message with order ID and total', async () => {
    mockCheckout.mockResolvedValue({
      orderId: 'TM-2026-5555',
      total: 120,
    } as any);

    const result = await checkoutInstamartTool.invoke({});
    expect(result).toContain('TM-2026-5555');
    expect(result).toContain('₹120');
  });

  it('returns an error string when cart is empty', async () => {
    mockCheckout.mockRejectedValue(new Error('Cart is empty. Add some items first!'));

    const result = await checkoutInstamartTool.invoke({});
    expect(result).toMatch(/Error: Cart is empty/);
  });
});
