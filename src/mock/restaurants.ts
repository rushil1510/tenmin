import type { Restaurant, Coupon } from '../types.js';

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_001',
    name: 'Punjab Grill',
    cuisines: ['North Indian', 'Mughlai'],
    rating: 4.5,
    distanceKm: 2.1,
    deliveryTime: '25-30 min',
    costForTwo: 800,
    availabilityStatus: 'OPEN',
    menu: [
      { id: 'm_001', name: 'Butter Chicken', description: 'Rich tomato gravy with tandoori chicken', price: 350, isVeg: false, category: 'Mains' },
      { id: 'm_002', name: 'Dal Makhani', description: 'Slow-cooked black lentils', price: 280, isVeg: true, category: 'Mains' },
      { id: 'm_003', name: 'Garlic Naan', description: 'Soft bread with garlic and butter', price: 60, isVeg: true, category: 'Breads' }
    ]
  },
  {
    id: 'rest_002',
    name: 'Pizza Express',
    cuisines: ['Italian', 'Pizzas'],
    rating: 4.2,
    distanceKm: 3.5,
    deliveryTime: '35-40 min',
    costForTwo: 600,
    availabilityStatus: 'OPEN',
    menu: [
      { id: 'm_004', name: 'Margherita Pizza', description: 'Classic cheese and tomato', price: 300, isVeg: true, category: 'Pizzas' },
      { id: 'm_005', name: 'Pepperoni Pizza', description: 'Spicy pepperoni with mozzarella', price: 450, isVeg: false, category: 'Pizzas' },
      { id: 'm_006', name: 'Garlic Bread', description: 'Oven baked bread with garlic butter', price: 150, isVeg: true, category: 'Sides' }
    ]
  },
  {
    id: 'rest_003',
    name: 'Biryani Blues',
    cuisines: ['Biryani', 'Hyderabadi'],
    rating: 4.4,
    distanceKm: 1.2,
    deliveryTime: '20-25 min',
    costForTwo: 500,
    availabilityStatus: 'OPEN',
    menu: [
      { id: 'm_007', name: 'Chicken Dum Biryani', description: 'Aromatic rice with slow-cooked chicken', price: 320, isVeg: false, category: 'Biryani' },
      { id: 'm_008', name: 'Paneer Biryani', description: 'Fragrant rice with spiced paneer', price: 290, isVeg: true, category: 'Biryani' },
      { id: 'm_009', name: 'Mirchi Ka Salan', description: 'Spicy peanut and chilli curry', price: 100, isVeg: true, category: 'Sides' }
    ]
  }
];

export const COUPONS: Record<string, Coupon[]> = {
  'rest_001': [
    { code: 'PUNJAB50', description: 'Flat ₹50 off on orders above ₹400', discountAmount: 50, minOrderValue: 400, validForCod: true },
    { code: 'PARTY100', description: 'Flat ₹100 off on orders above ₹1000', discountAmount: 100, minOrderValue: 1000, validForCod: false }
  ],
  'rest_002': [
    { code: 'PIZZA20', description: 'Flat ₹20 off on all orders', discountAmount: 20, minOrderValue: 0, validForCod: true }
  ],
  'rest_003': [
    { code: 'BIRYANI60', description: 'Flat ₹60 off on orders above ₹300', discountAmount: 60, minOrderValue: 300, validForCod: true }
  ]
};
