// ─────────────────────────────────────────────
// Tenmin — Mock Product Database
// Simulates Swiggy Instamart product catalog
// ─────────────────────────────────────────────

import type { Product } from '../types.js';

const STORE_ID = 'store_krm_001';
const STORE_NAME = 'Instamart — Koramangala';
const DELIVERY_TIME = '10-15 min';

function p(
  id: string,
  name: string,
  brand: string,
  price: number,
  mrp: number,
  unit: string,
  category: string,
  inStock = true,
): Product {
  return {
    id,
    name,
    brand,
    price,
    mrp,
    unit,
    category,
    inStock,
    storeId: STORE_ID,
    storeName: STORE_NAME,
    deliveryTime: DELIVERY_TIME,
  };
}

// ── Beverages ─────────────────────────────────

const beverages: Product[] = [
  p('bev_001', 'Diet Coke',                   'Coca-Cola',      40,  42,  '300ml',  'Beverages'),
  p('bev_002', 'Diet Coke',                   'Coca-Cola',      80,  85,  '750ml',  'Beverages'),
  p('bev_003', 'Diet Coke Can',               'Coca-Cola',      45,  45,  '330ml',  'Beverages'),
  p('bev_004', 'Diet Coke Zero Sugar',        'Coca-Cola',      55,  60,  '500ml',  'Beverages'),
  p('bev_005', 'Coca-Cola Original',           'Coca-Cola',      40,  42,  '750ml',  'Beverages'),
  p('bev_006', 'Sprite',                       'Coca-Cola',      40,  42,  '750ml',  'Beverages'),
  p('bev_007', 'Pepsi',                        'PepsiCo',        40,  42,  '750ml',  'Beverages'),
  p('bev_008', 'Thums Up',                     'Coca-Cola',      40,  42,  '750ml',  'Beverages'),
  p('bev_009', 'Red Bull Energy Drink',        'Red Bull',      125, 130,  '250ml',  'Beverages'),
  p('bev_010', 'Monster Energy',               'Monster',       160, 165,  '350ml',  'Beverages'),
  p('bev_011', 'Sting Energy Drink',           'PepsiCo',        20,  20,  '250ml',  'Beverages'),
  p('bev_012', 'Paper Boat Aam Panna',         'Paper Boat',     30,  35,  '200ml',  'Beverages'),
  p('bev_013', 'Real Mixed Fruit Juice',       'Dabur',          99, 110,  '1L',     'Beverages'),
  p('bev_014', 'Bisleri Water',                'Bisleri',        20,  20,  '1L',     'Beverages'),
  p('bev_015', 'Amul Lassi',                   'Amul',           25,  28,  '200ml',  'Beverages'),
  p('bev_016', 'Raw Pressery Cold Coffee',     'Raw Pressery',   99, 110,  '200ml',  'Beverages'),
  p('bev_017', 'Tropicana Orange Juice',       'PepsiCo',        70,  75,  '200ml',  'Beverages'),
];

// ── Snacks ────────────────────────────────────

const snacks: Product[] = [
  p('snk_001', "Lay's Classic Salted",         "Lay's",          20,  20,  '52g',    'Snacks'),
  p('snk_002', "Lay's Magic Masala",           "Lay's",          20,  20,  '52g',    'Snacks'),
  p('snk_003', 'Kurkure Masala Munch',         'Kurkure',        20,  20,  '94g',    'Snacks'),
  p('snk_004', 'Bingo Mad Angles',             'ITC',            20,  20,  '72g',    'Snacks'),
  p('snk_005', 'Doritos Sweet Chilli',         'PepsiCo',        50,  55,  '72g',    'Snacks'),
  p('snk_006', 'Pringles Original',            'Pringles',      149, 155,  '107g',   'Snacks'),
  p('snk_007', 'Oreo Original Biscuit',        'Cadbury',        30,  30,  '120g',   'Snacks'),
  p('snk_008', 'Hide & Seek Dark Fantasy',     'ITC',            40,  45,  '75g',    'Snacks'),
  p('snk_009', 'Dark Fantasy Choco Fills',     'ITC',            40,  45,  '75g',    'Snacks'),
  p('snk_010', "Haldiram's Aloo Bhujia",       "Haldiram's",     70,  75,  '200g',   'Snacks'),
  p('snk_011', 'Cadbury Dairy Milk Silk',      'Cadbury',        85,  85,  '60g',    'Snacks'),
  p('snk_012', 'KitKat',                       'Nestlé',         40,  40,  '37.3g',  'Snacks'),
];

// ── Dairy & Eggs ──────────────────────────────

const dairy: Product[] = [
  p('dry_001', 'Amul Taaza Toned Milk',        'Amul',           27,  28,  '500ml',  'Dairy'),
  p('dry_002', 'Amul Gold Full Cream Milk',    'Amul',           33,  35,  '500ml',  'Dairy'),
  p('dry_003', 'Mother Dairy Toned Milk',      'Mother Dairy',   28,  28,  '500ml',  'Dairy'),
  p('dry_004', 'Amul Butter',                  'Amul',           52,  55,  '100g',   'Dairy'),
  p('dry_005', 'Amul Cheese Slices',           'Amul',           95, 100,  '5 slices','Dairy'),
  p('dry_006', 'Amul Fresh Cream',             'Amul',           65,  70,  '200ml',  'Dairy'),
  p('dry_007', 'Epigamia Greek Yogurt',        'Epigamia',       45,  50,  '90g',    'Dairy'),
  p('dry_008', 'Farm Fresh Eggs',              'Local',          42,  45,  '6 pack', 'Dairy'),
  p('dry_009', 'Farm Fresh Eggs',              'Local',          78,  82,  '12 pack','Dairy'),
];

// ── Essentials ────────────────────────────────

const essentials: Product[] = [
  p('ess_001', 'Britannia White Bread',        'Britannia',      42,  45,  '400g',   'Essentials'),
  p('ess_002', 'Aashirvaad Whole Wheat Atta',  'ITC',           289, 305,  '5kg',    'Essentials'),
  p('ess_003', 'India Gate Basmati Rice',      'India Gate',    135, 145,  '1kg',    'Essentials'),
  p('ess_004', 'Fortune Sunflower Oil',        'Adani Wilmar',  145, 155,  '1L',     'Essentials'),
  p('ess_005', 'Tata Salt',                    'Tata',           28,  28,  '1kg',    'Essentials'),
  p('ess_006', 'Sugar',                        'Local',          48,  50,  '1kg',    'Essentials'),
  p('ess_007', 'Tata Tea Gold',                'Tata',          195, 210,  '500g',   'Essentials'),
  p('ess_008', 'Nescafé Classic Coffee',       'Nestlé',        210, 225,  '100g',   'Essentials'),
];

// ── Instant Food ──────────────────────────────

const instant: Product[] = [
  p('ins_001', 'Maggi 2-Min Masala Noodles',   'Nestlé',         14,  14,  '70g',    'Instant'),
  p('ins_002', 'Maggi 2-Min Noodles',          'Nestlé',         56,  60,  '4-pack', 'Instant'),
  p('ins_003', 'Yippee Magic Masala Noodles',  'ITC',            56,  60,  '4-pack', 'Instant'),
  p('ins_004', 'Top Ramen Curry Noodles',      'Nissin',         15,  15,  '70g',    'Instant'),
  p('ins_005', 'Knorr Classic Tomato Soup',    'HUL',            55,  60,  '53g',    'Instant'),
  p('ins_006', 'Cup Noodles Mazedaar Masala',  'Nissin',         45,  50,  '70g',    'Instant'),
  p('ins_007', 'MTR Ready To Eat Poha',        'MTR',            72,  80,  '180g',   'Instant'),
  p('ins_008', 'MTR Ready To Eat Upma',        'MTR',            72,  80,  '180g',   'Instant'),
];

// ── Full catalogue ────────────────────────────

export const PRODUCTS: Product[] = [
  ...beverages,
  ...snacks,
  ...dairy,
  ...essentials,
  ...instant,
];

export const STORE = {
  id: STORE_ID,
  name: STORE_NAME,
  deliveryTime: DELIVERY_TIME,
};
