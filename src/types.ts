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
  credits: number;
  orders: OrderRecord[];
  address: string;
  theme: string;
}

export interface OrderRecord {
  orderId: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  timestamp: string;
}
