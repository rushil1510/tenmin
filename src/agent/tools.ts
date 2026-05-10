import { tool } from '@langchain/core/tools';
import { z } from 'zod';
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

// ── Constants ───────────────────────────────────────

// Swiggy Builders Club v1 imposes a hard ₹1000 cap on food orders
const FOOD_ORDER_CAP = 1000;

// ── Address Tool (Step 0 of every real MCP flow) ──────────────
// The real MCP flow starts with get_addresses. All search_restaurants
// and search_products calls require an addressId from this tool.

export const getAddressesTool = tool(
  async () => {
    try {
      const addresses = await getAddresses();
      return JSON.stringify(addresses);
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'getAddresses',
    description:
      'Fetch the user\'s saved delivery addresses. ALWAYS call this first before searching ' +
      'restaurants or products. Use the returned addressId with subsequent search calls.',
    schema: z.object({}),
  }
);

// ── Food API Tools ───────────────────────────────────────

export const searchRestaurantsTool = tool(
  async ({ query }) => {
    try {
      const results = await searchRestaurants(query);
      return JSON.stringify(results);
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'searchRestaurants',
    description: 'Search and order food from restaurants for delivery. Call this to find restaurants or cuisines. ALWAYS check "availabilityStatus" before recommending.',
    schema: z.object({
      query: z.string().describe('Search query (restaurant name or cuisine)'),
    }),
  }
);

export const getRestaurantMenuTool = tool(
  async ({ restaurantId }) => {
    try {
      const menu = await getRestaurantMenu(restaurantId);
      return JSON.stringify(menu);
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'getRestaurantMenu',
    description: 'Get the complete menu of a restaurant. Use this to BROWSE a restaurant menu after a user has selected a restaurant.',
    schema: z.object({
      restaurantId: z.string().describe('ID of the restaurant'),
    }),
  }
);

export const fetchFoodCouponsTool = tool(
  async ({ restaurantId }) => {
    try {
      const coupons = await fetchFoodCoupons(restaurantId);
      return JSON.stringify(coupons);
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'fetchFoodCoupons',
    description: 'Get available coupons and offers for food delivery at a specific restaurant.',
    schema: z.object({
      restaurantId: z.string().describe('ID of the restaurant'),
    }),
  }
);

export const applyFoodCouponTool = tool(
  async ({ couponCode, restaurantId }) => {
    try {
      const cart = await applyFoodCoupon(couponCode, restaurantId);
      return `Coupon applied successfully! New total: ₹${cart.total}. Discount: ₹${cart.discount}`;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'applyFoodCoupon',
    description: 'Apply coupon code or discount to food delivery order. Only call this AFTER items have been added to the cart.',
    schema: z.object({
      couponCode: z.string().describe('Coupon code to apply'),
      restaurantId: z.string().describe('ID of the restaurant'),
    }),
  }
);

export const addFoodToCartTool = tool(
  async ({ restaurantId, menuItemId, quantity }) => {
    try {
      const cart = await addFoodToCart(restaurantId, menuItemId, quantity);
      return `Added to cart successfully. Subtotal: ₹${cart.subtotal}`;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'addFoodToCart',
    description: 'Add items to food delivery cart. Provide the exact restaurant ID and menu item ID.',
    schema: z.object({
      restaurantId: z.string().describe('ID of the restaurant'),
      menuItemId: z.string().describe('ID of the menu item'),
      quantity: z.number().int().positive().describe('Quantity of the item to add'),
    }),
  }
);

export const placeFoodOrderTool = tool(
  async () => {
    try {
      // Swiggy Builders Club v1: hard ₹1000 cap — check before placing
      const { getState } = await import('../store/index.js');
      const state = getState();
      if (state.foodCart && state.foodCart.total > FOOD_ORDER_CAP) {
        return `Error: Cart total ₹${state.foodCart.total} exceeds the ₹${FOOD_ORDER_CAP} Builders Club cap. Please remove some items before placing the order.`;
      }

      const result = await placeFoodOrder();
      return `Order placed successfully (COD)! Order ID: ${result.orderId}. Total: ₹${result.total}. ETA: ${result.estimatedDelivery}`;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'placeFoodOrder',
    description:
      'Place food delivery order via Cash on Delivery (COD). ' +
      'Only use this when the user EXPLICITLY confirms they want to place the order. ' +
      'This is NOT idempotent — if it fails with a 5xx, check order history before retrying.',
    schema: z.object({}),
  }
);

// ── Instamart Tools ──────────────────────────────────────────

export const searchProductsTool = tool(
  async ({ query }) => {
    try {
      const results = await searchProducts(query);
      return JSON.stringify(results.products);
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'searchProducts',
    description: 'Search for groceries and essential products on Swiggy Instamart.',
    schema: z.object({
      query: z.string().describe('Search query (e.g. "milk", "diet coke")'),
    }),
  }
);

export const yourGoToItemsTool = tool(
  async () => {
    try {
      const results = await yourGoToItems();
      return JSON.stringify(results.products);
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'yourGoToItems',
    description: 'Fetch the user\'s frequently or recently ordered grocery items.',
    schema: z.object({}),
  }
);

export const addToInstamartCartTool = tool(
  async ({ productId, quantity }) => {
    try {
      const cart = await addToCart(productId, quantity);
      return `Added to Instamart cart successfully. Current cart size: ${cart.length} items.`;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'addToInstamartCart',
    description: 'Add an item to the Instamart grocery cart.',
    schema: z.object({
      productId: z.string().describe('ID of the product'),
      quantity: z.number().int().positive().describe('Quantity to add'),
    }),
  }
);

export const checkoutInstamartTool = tool(
  async () => {
    try {
      const result = await checkout();
      // Instamart v1 is also COD-only in Builders Club
      return `Instamart order placed successfully (COD)! Order ID: ${result.orderId}. Total: ₹${result.total}.`;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'checkoutInstamart',
    description:
      'Checkout the current Instamart grocery cart via Cash on Delivery (COD). ' +
      'Minimum cart value is ₹99. Only use this when the user explicitly confirms.',
    schema: z.object({}),
  }
);

export const allTools = [
  // Step 0: always call this first to resolve the delivery address
  getAddressesTool,
  // Food API
  searchRestaurantsTool,
  getRestaurantMenuTool,
  fetchFoodCouponsTool,
  applyFoodCouponTool,
  addFoodToCartTool,
  placeFoodOrderTool,
  // Instamart
  searchProductsTool,
  yourGoToItemsTool,
  addToInstamartCartTool,
  checkoutInstamartTool,
];
