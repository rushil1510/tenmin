// ─────────────────────────────────────────────
// Tenmin — Shared Type Definitions
// ─────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  unit: string; // e.g., "300ml", "1kg", "6 pack"
  category: string;
  inStock: boolean;
  storeId: string;
  storeName: string;
  deliveryTime: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Cart {
  items: CartItem[];
  storeId: string | null;
  storeName: string | null;
}

export interface SearchResult {
  products: Product[];
  query: string;
  totalResults: number;
}

export interface OrderResult {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  estimatedDelivery: string;
  creditsRemaining: number;
}

export interface AppState {
  cart: CartItem[];
  foodCart: FoodCart | null;
  credits: number;
  orders: OrderRecord[];
  address: string;
  theme: string;
  savedLists: SavedList[];
}

export interface OrderRecord {
  orderId: string;
  items: { id?: string; name: string; qty: number; price: number }[];
  total: number;
  timestamp: string;
}

export interface SavedList {
  name: string;
  items: { id: string; name: string; qty: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  dietary: string[];   // e.g. ["vegetarian", "no dairy"]
  avoid: string[];     // e.g. ["energy drinks", "spicy"]
  defaultBudget: number;
}

// ── Food API Types ────────────────────────────

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  category: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisines: string[];
  rating: number;
  distanceKm: number;
  deliveryTime: string;
  costForTwo: number;
  availabilityStatus: 'OPEN' | 'CLOSED' | 'UNAVAILABLE';
  menu: MenuItem[];
}

export interface Coupon {
  code: string;
  description: string;
  discountAmount: number;
  minOrderValue: number;
  validForCod: boolean;
}

export interface FoodCartItem {
  menuItem: MenuItem;
  qty: number;
}

export interface FoodCart {
  restaurantId: string | null;
  items: FoodCartItem[];
  subtotal: number;
  discount: number;
  appliedCoupon: string | null;
  total: number;
}
