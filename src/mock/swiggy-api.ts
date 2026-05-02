// ─────────────────────────────────────────────
// Tenmin — Mock Swiggy MCP API
// Simulates the responses that Swiggy's MCP
// servers would return. Will be swapped out for
// real MCP client calls once API access is granted.
// ─────────────────────────────────────────────

import type { SearchResult, CartItem, OrderResult, Restaurant, MenuItem, Coupon, FoodCart } from '../types.js';
import { PRODUCTS, STORE } from './products.js';
import { RESTAURANTS, COUPONS } from './restaurants.js';
import { getState, saveState } from '../store/index.js';

// ── Helpers ───────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(600 + Math.random() * 800);
}

function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `TM-${y}-${seq}`;
}

// ── Search Products ───────────────────────────
// Simulates: Swiggy Instamart MCP → search_products

export async function searchProducts(query: string): Promise<SearchResult> {
  await randomDelay();

  const queryLower = query.toLowerCase().trim();

  if (!queryLower) {
    return { products: [], query, totalResults: 0 };
  }

  const words = queryLower.split(/\s+/).filter((w) => w.length >= 2);

  if (words.length === 0) {
    return { products: [], query, totalResults: 0 };
  }

  const scored = PRODUCTS
    .filter((p) => p.inStock)
    .map((product) => {
      const nameLower = product.name.toLowerCase();
      const brandLower = product.brand.toLowerCase();
      const catLower = product.category.toLowerCase();

      const nameWords = nameLower.split(/\s+/);
      const nameWordSet = new Set(nameWords);
      const brandWordSet = new Set(brandLower.split(/\s+/));
      const catWordSet = new Set(catLower.split(/\s+/));
      const lastNameWord = nameWords[nameWords.length - 1];

      let score = 0;

      // Full query at start of name → strongest match
      if (nameLower.startsWith(queryLower)) score += 15;
      // Full query anywhere in name → strong match
      else if (nameLower.includes(queryLower)) score += 10;

      for (const word of words) {
        if (nameWordSet.has(word)) {
          score += 5;
          // Last word in product name is typically the primary category (e.g. "Milk", "Coke")
          if (lastNameWord === word) score += 4;
        } else if (nameLower.includes(word)) {
          score += 2;
        }

        if (brandWordSet.has(word)) score += 3;
        else if (brandLower.includes(word)) score += 1;

        if (catWordSet.has(word)) score += 2;
        else if (catLower.includes(word)) score += 1;
      }

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ product }) => product);

  return {
    products: scored,
    query,
    totalResults: scored.length,
  };
}

// ── Add to Cart ───────────────────────────────
// Simulates: Swiggy Instamart MCP → add_to_cart

export async function addToCart(productId: string, quantity: number): Promise<CartItem[]> {
  await delay(300);

  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const state = getState();

  // Check if product already in cart → update qty
  const existing = state.cart.find((item) => item.product.id === productId);
  if (existing) {
    existing.qty += quantity;
  } else {
    state.cart.push({ product, qty: quantity });
  }

  saveState(state);
  return state.cart;
}

// ── Get Cart ──────────────────────────────────
// Simulates: Swiggy Instamart MCP → get_cart

export async function getCart(): Promise<CartItem[]> {
  await delay(200);
  const state = getState();
  return state.cart;
}

// ── Remove from Cart ──────────────────────────

export async function removeFromCart(productId: string): Promise<CartItem[]> {
  await delay(200);
  const state = getState();
  state.cart = state.cart.filter((item) => item.product.id !== productId);
  saveState(state);
  return state.cart;
}

// ── Clear Cart ────────────────────────────────
// Simulates: Swiggy Instamart MCP → clear_cart

export async function clearCart(): Promise<void> {
  await delay(200);
  const state = getState();
  state.cart = [];
  saveState(state);
}

// ── Checkout ──────────────────────────────────
// Simulates: Swiggy Instamart MCP → checkout
// Uses credits for payment

export async function checkout(): Promise<OrderResult> {
  await randomDelay();

  const state = getState();

  if (state.cart.length === 0) {
    throw new Error('Cart is empty. Add some items first!');
  }

  const subtotal = state.cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );

  const deliveryFee = subtotal >= 199 ? 0 : 25;
  const total = subtotal + deliveryFee;

  if (state.credits < total) {
    throw new Error(
      `Insufficient credits. Need ₹${total} but only ₹${state.credits} available. Top up your credits and try again.`,
    );
  }

  // Deduct credits and create order
  state.credits -= total;

  const orderId = generateOrderId();

  state.orders.push({
    orderId,
    items: state.cart.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      qty: item.qty,
      price: item.product.price,
    })),
    total,
    timestamp: new Date().toISOString(),
  });

  const result: OrderResult = {
    orderId,
    items: [...state.cart],
    subtotal,
    deliveryFee,
    total,
    estimatedDelivery: STORE.deliveryTime,
    creditsRemaining: state.credits,
  };

  // Clear cart after checkout
  state.cart = [];
  saveState(state);

  return result;
}

// ── Get Credits Balance ───────────────────────

export async function getCredits(): Promise<{ balance: number }> {
  await delay(200);
  const state = getState();
  return { balance: state.credits };
}

// ── Track Order ───────────────────────────────

export interface OrderTracking {
  orderId: string;
  status: 'PREPARING' | 'PACKED' | 'ON_THE_WAY' | 'DELIVERED';
  statusText: string;
  eta: string;
  progress: number; // 0 to 1
}

export async function getOrderStatus(orderId: string): Promise<OrderTracking> {
  await delay(400);

  const state = getState();
  const order = state.orders.find((o) => o.orderId === orderId);

  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  const orderTime = new Date(order.timestamp).getTime();
  const now = Date.now();
  const elapsedMinutes = (now - orderTime) / 60000;

  // Simulate progress based on time since order
  if (elapsedMinutes > 10) {
    return {
      orderId,
      status: 'DELIVERED',
      statusText: 'Delivered',
      eta: 'Arrived',
      progress: 1,
    };
  } else if (elapsedMinutes > 5) {
    return {
      orderId,
      status: 'ON_THE_WAY',
      statusText: 'Rider is on the way',
      eta: `${Math.ceil(10 - elapsedMinutes)} mins`,
      progress: 0.75,
    };
  } else if (elapsedMinutes > 2) {
    return {
      orderId,
      status: 'PACKED',
      statusText: 'Order packed and waiting for rider',
      eta: `${Math.ceil(10 - elapsedMinutes)} mins`,
      progress: 0.5,
    };
  } else {
    return {
      orderId,
      status: 'PREPARING',
      statusText: 'Packing your items',
      eta: `${Math.ceil(10 - elapsedMinutes)} mins`,
      progress: 0.25,
    };
  }
}

// ── Instamart: Your Go-To Items ────────────────

export async function yourGoToItems(): Promise<SearchResult> {
  await randomDelay();
  // Mock: Return Red Bull, Milk, and Bread
  const goTos = PRODUCTS.filter((p) => 
    ['bev_009', 'dry_001', 'ess_001', 'snk_001'].includes(p.id)
  );
  return {
    products: goTos,
    query: '',
    totalResults: goTos.length,
  };
}

// ── Food API ──────────────────────────────────

export async function searchRestaurants(query: string): Promise<Restaurant[]> {
  await randomDelay();
  const lower = query.toLowerCase().trim();
  if (!lower) return RESTAURANTS;
  
  return RESTAURANTS.filter(r => 
    r.name.toLowerCase().includes(lower) || 
    r.cuisines.some(c => c.toLowerCase().includes(lower)) ||
    r.menu.some(m => m.name.toLowerCase().includes(lower))
  );
}

export async function getRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
  await delay(200);
  const r = RESTAURANTS.find(x => x.id === restaurantId);
  if (!r) throw new Error(`Restaurant ${restaurantId} not found`);
  return r.menu;
}

export async function fetchFoodCoupons(restaurantId: string): Promise<Coupon[]> {
  await delay(200);
  return COUPONS[restaurantId] || [];
}

export async function applyFoodCoupon(couponCode: string, restaurantId: string): Promise<FoodCart> {
  await delay(300);
  const state = getState();
  const cart = state.foodCart;
  if (!cart || cart.items.length === 0) {
    throw new Error('Food cart is empty.');
  }

  const coupons = COUPONS[restaurantId] || [];
  const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
  
  if (!coupon) throw new Error('Invalid coupon code');
  if (cart.subtotal < coupon.minOrderValue) {
    throw new Error(`Cart value must be at least ₹${coupon.minOrderValue} to apply this coupon`);
  }

  cart.discount = coupon.discountAmount;
  cart.appliedCoupon = coupon.code;
  cart.total = cart.subtotal - cart.discount;

  saveState(state);
  return cart;
}
