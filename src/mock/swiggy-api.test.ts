import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';

vi.mock('node:os', () => ({
  homedir: () => '/tmp/tenmin-test-home-api'
}));

const mockHomedir = '/tmp/tenmin-test-home-api';

import { searchProducts, addToCart, getCart, removeFromCart, clearCart, checkout, getCredits } from './swiggy-api.js';
import { resetState } from '../store/index.js';

describe('Swiggy API Mock', () => {
  const testTenminDir = join(mockHomedir, '.tenmin');

  beforeEach(async () => {
    if (existsSync(testTenminDir)) {
      rmSync(testTenminDir, { recursive: true, force: true });
    }
    resetState();
    await clearCart();
  });

  afterEach(() => {
    if (existsSync(testTenminDir)) {
      rmSync(testTenminDir, { recursive: true, force: true });
    }
  });

  describe('searchProducts', () => {
    it('should return products matching the query', async () => {
      const result = await searchProducts('milk');
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products[0].name.toLowerCase()).toContain('milk');
      expect(result.query).toBe('milk');
    });

    it('should return empty when query is empty', async () => {
      const result = await searchProducts('   ');
      expect(result.products.length).toBe(0);
      expect(result.totalResults).toBe(0);
    });
  });

  describe('Cart Management', () => {
    it('should add to cart and return it', async () => {
      const searchResult = await searchProducts('coke');
      const product = searchResult.products[0];
      
      const cart = await addToCart(product.id, 2);
      expect(cart.length).toBe(1);
      expect(cart[0].product.id).toBe(product.id);
      expect(cart[0].qty).toBe(2);
    });

    it('should throw error when adding invalid product', async () => {
      await expect(addToCart('invalid-id', 1)).rejects.toThrow(/Product not found/);
    });

    it('should increment quantity if already in cart', async () => {
      const searchResult = await searchProducts('bread');
      const product = searchResult.products[0];
      
      await addToCart(product.id, 1);
      const cart = await addToCart(product.id, 2);
      expect(cart[0].qty).toBe(3);
    });

    it('should remove item from cart', async () => {
      const searchResult = await searchProducts('bread');
      const product = searchResult.products[0];
      
      await addToCart(product.id, 1);
      let cart = await getCart();
      expect(cart.length).toBe(1);

      cart = await removeFromCart(product.id);
      expect(cart.length).toBe(0);
    });
  });

  describe('Checkout', () => {
    it('should process checkout successfully if credits are sufficient', async () => {
      const searchResult = await searchProducts('bread');
      const product = searchResult.products[0];
      
      await addToCart(product.id, 1);
      
      const creditsBefore = (await getCredits()).balance;
      
      const result = await checkout();
      
      expect(result.items.length).toBe(1);
      expect(result.subtotal).toBe(product.price);
      
      const creditsAfter = (await getCredits()).balance;
      expect(creditsAfter).toBe(creditsBefore - result.total);
      
      const cartAfter = await getCart();
      expect(cartAfter.length).toBe(0);
    });

    it('should fail checkout if cart is empty', async () => {
      await expect(checkout()).rejects.toThrow(/Cart is empty/);
    });

    it('should fail checkout if credits are insufficient', async () => {
      // Find an expensive item and add many to exceed 500 default credits
      const searchResult = await searchProducts('paneer');
      const product = searchResult.products[0];
      
      await addToCart(product.id, 100);
      
      await expect(checkout()).rejects.toThrow(/Insufficient credits/);
    });
  });
});
