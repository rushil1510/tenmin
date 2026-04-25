// ─────────────────────────────────────────────
// Tenmin — Mock Swiggy MCP API
// Simulates the responses that Swiggy's MCP
// servers would return. Will be swapped out for
// real MCP client calls once API access is granted.
// ─────────────────────────────────────────────

import type { SearchResult, CartItem, OrderResult } from '../types.js';
import { PRODUCTS, STORE } from './products.js';
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
  const words = queryLower.split(/\s+/);

  const scored = PRODUCTS
    .filter((p) => p.inStock)
    .map((product) => {
      const nameLower = product.name.toLowerCase();
      const brandLower = product.brand.toLowerCase();
      const catLower = product.category.toLowerCase();

      let score = 0;

      // Full query found in product name → strong match
      if (nameLower.includes(queryLower)) score += 10;

      // Individual word matches
      for (const word of words) {
        if (word.length < 2) continue;
        if (nameLower.includes(word)) score += 5;
        if (brandLower.includes(word)) score += 3;
        if (catLower.includes(word)) score += 2;
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
