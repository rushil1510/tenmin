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
  p('bev_018', 'Coca-Cola Can',                'Coca-Cola',      40,  45,  '330ml',  'Beverages'),
  p('bev_019', 'Sprite Can',                   'Coca-Cola',      40,  45,  '330ml',  'Beverages'),
  p('bev_020', 'Pepsi Black',                  'PepsiCo',        45,  50,  '330ml',  'Beverages'),
  p('bev_021', '7UP',                          'PepsiCo',        40,  42,  '750ml',  'Beverages'),
  p('bev_022', 'Fanta Orange',                 'Coca-Cola',      40,  42,  '750ml',  'Beverages'),
  p('bev_023', 'Maaza Mango Drink',            'Coca-Cola',      45,  50,  '600ml',  'Beverages'),
  p('bev_024', 'Limca',                        'Coca-Cola',      40,  42,  '750ml',  'Beverages'),
  p('bev_025', 'Appy Fizz',                    'Parle Agro',     35,  40,  '250ml',  'Beverages'),
  p('bev_026', 'Slice Mango Drink',            'PepsiCo',        35,  40,  '600ml',  'Beverages'),
  p('bev_027', 'Minute Maid Pulpy Orange',     'Coca-Cola',      40,  45,  '400ml',  'Beverages'),
  p('bev_028', 'B Natural Guava Juice',        'ITC',            70,  75,  '1L',     'Beverages'),
  p('bev_029', 'Real Mosambi Juice',           'Dabur',          99, 110,  '1L',     'Beverages'),
  p('bev_030', 'Tender Coconut Water',         'Paper Boat',     50,  55,  '200ml',  'Beverages'),
  p('bev_031', 'Amul Buttermilk',              'Amul',           20,  22,  '200ml',  'Beverages'),
  p('bev_032', 'Yakult Probiotic Drink',       'Yakult',         80,  90,  '5 pack', 'Beverages'),
  p('bev_033', 'Bisleri Soda',                 'Bisleri',        20,  22,  '750ml',  'Beverages'),
  p('bev_034', 'Kinley Water',                 'Coca-Cola',      20,  20,  '1L',     'Beverages'),
  p('bev_035', 'Aquafina Water',               'PepsiCo',        20,  20,  '1L',     'Beverages'),
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
  p('snk_013', "Lay's American Style Cream",   "Lay's",          20,  20,  '52g',    'Snacks'),
  p('snk_014', "Lay's Chile Limon",            "Lay's",          20,  20,  '52g',    'Snacks'),
  p('snk_015', 'Kurkure Chilli Chatka',        'Kurkure',        20,  20,  '90g',    'Snacks'),
  p('snk_016', 'Bingo Tedhe Medhe',            'ITC',            20,  20,  '90g',    'Snacks'),
  p('snk_017', 'Doritos Nacho Cheese',         'PepsiCo',        50,  55,  '72g',    'Snacks'),
  p('snk_018', 'Pringles Sour Cream',          'Pringles',      149, 155,  '107g',   'Snacks'),
  p('snk_019', 'Haldiram Bhujia Sev',          'Haldiram',       65,  70,  '200g',   'Snacks'),
  p('snk_020', 'Unibic Choco Chip Cookies',    'Unibic',         35,  40,  '75g',    'Snacks'),
  p('snk_021', 'Sunfeast Dark Fantasy Bourbon','ITC',            35,  40,  '100g',   'Snacks'),
  p('snk_022', 'Parle-G Biscuit',              'Parle',          10,  10,  '80g',    'Snacks'),
  p('snk_023', 'Good Day Cashew Cookies',      'Britannia',      35,  40,  '200g',   'Snacks'),
  p('snk_024', 'Marie Gold Biscuit',           'Britannia',      35,  40,  '250g',   'Snacks'),
  p('snk_025', 'Hide and Seek Biscuit',        'Parle',          35,  40,  '120g',   'Snacks'),
  p('snk_026', 'Monaco Salted Biscuits',       'Parle',          35,  40,  '200g',   'Snacks'),
  p('snk_027', 'Treat Jim Jam Biscuit',        'Britannia',      30,  35,  '100g',   'Snacks'),
  p('snk_028', 'NutriChoice Digestive Biscuit','Britannia',      40,  45,  '200g',   'Snacks'),
  p('snk_029', 'Cadbury Fuse',                 'Cadbury',        35,  40,  '25g',    'Snacks'),
  p('snk_030', 'Snickers Chocolate Bar',       'Mars',           30,  35,  '45g',    'Snacks'),
  p('snk_031', 'Perk Chocolate',               'Cadbury',        10,  10,  '22g',    'Snacks'),
  p('snk_032', 'Balaji Wafers',                'Balaji',         25,  30,  '90g',    'Snacks'),
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
  p('dry_010', 'Amul Cow Milk',                'Amul',           29,  30,  '500ml',  'Dairy'),
  p('dry_011', 'Nandini Toned Milk',           'Nandini',        27,  28,  '500ml',  'Dairy'),
  p('dry_012', 'Amul Paneer',                  'Amul',           95, 100,  '200g',   'Dairy'),
  p('dry_013', 'Milky Mist Paneer',            'Milky Mist',    105, 110,  '200g',   'Dairy'),
  p('dry_014', 'Amul Curd',                    'Amul',           35,  38,  '400g',   'Dairy'),
  p('dry_015', 'Mother Dairy Curd',            'Mother Dairy',   35,  38,  '400g',   'Dairy'),
  p('dry_016', 'Amul Cheese Cubes',            'Amul',          135, 140,  '200g',   'Dairy'),
  p('dry_017', 'Britannia Cheese Slice',       'Britannia',      99, 105,  '5 slices','Dairy'),
  p('dry_018', 'Amul Mozzarella Cheese',       'Amul',          125, 130,  '200g',   'Dairy'),
  p('dry_019', 'Greek Yogurt Strawberry',      'Epigamia',       50,  55,  '90g',    'Dairy'),
  p('dry_020', 'Table White Eggs',             'Eggoz',          90,  95,  '12 pack','Dairy'),
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
  p('ess_009', 'Daawat Basmati Rice',          'Daawat',        145, 155,  '1kg',    'Essentials'),
  p('ess_010', 'Fortune Basmati Rice',         'Fortune',       125, 135,  '1kg',    'Essentials'),
  p('ess_011', 'Sona Masoori Rice',            'Local',          90, 100,  '1kg',    'Essentials'),
  p('ess_012', 'Brown Rice',                   'Daawat',        130, 140,  '1kg',    'Essentials'),
  p('ess_013', 'Fortune Rice Bran Oil',        'Fortune',       165, 175,  '1L',     'Essentials'),
  p('ess_014', 'Saffola Gold Oil',             'Saffola',       190, 205,  '1L',     'Essentials'),
  p('ess_015', 'Dhara Mustard Oil',            'Dhara',         180, 190,  '1L',     'Essentials'),
  p('ess_016', 'Figaro Olive Oil',             'Figaro',        335, 360,  '500ml',  'Essentials'),
  p('ess_017', 'Aashirvaad Select Atta',       'ITC',           320, 335,  '5kg',    'Essentials'),
  p('ess_018', 'Pillsbury Chakki Fresh Atta',  'Pillsbury',     275, 290,  '5kg',    'Essentials'),
  p('ess_019', 'Jaggery Powder',               'Organic India',  75,  80,  '500g',   'Essentials'),
  p('ess_020', 'Toor Dal',                     'Tata Sampann',  170, 180,  '1kg',    'Essentials'),
  p('ess_021', 'Moong Dal',                    'Tata Sampann',  145, 155,  '1kg',    'Essentials'),
  p('ess_022', 'Chana Dal',                    'Tata Sampann',   95, 105,  '1kg',    'Essentials'),
  p('ess_023', 'Kabuli Chana',                 'Tata Sampann',  130, 140,  '1kg',    'Essentials'),
  p('ess_024', 'Rajma Chitra',                 'Tata Sampann',  145, 155,  '1kg',    'Essentials'),
  p('ess_025', 'Turmeric Powder',              'Everest',        35,  40,  '100g',   'Essentials'),
  p('ess_026', 'Red Chilli Powder',            'Everest',        40,  45,  '100g',   'Essentials'),
  p('ess_027', 'Coriander Powder',             'Everest',        35,  40,  '100g',   'Essentials'),
  p('ess_028', 'Garam Masala',                 'Everest',        45,  50,  '100g',   'Essentials'),
  p('ess_029', 'Biryani Masala',               'Shan',           60,  65,  '50g',    'Essentials'),
  p('ess_030', 'Ghee',                         'Amul',          180, 195,  '500ml',  'Essentials'),
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
  p('ins_009', 'Maggi Cuppa Noodles',          'Nestlé',         50,  55,  '75g',    'Instant'),
  p('ins_010', 'Knorr Sweet Corn Soup',        'HUL',            55,  60,  '51g',    'Instant'),
  p('ins_011', 'MTR Ready To Eat Pav Bhaji',   'MTR',           120, 130,  '300g',   'Instant'),
  p('ins_012', 'MTR Ready To Eat Rajma Chawal','MTR',           130, 140,  '300g',   'Instant'),
  p('ins_013', 'Top Ramen Atta Noodles',       'Nissin',         20,  22,  '70g',    'Instant'),
  p('ins_014', 'Yippee Korean Noodles',        'ITC',            55,  60,  '75g',    'Instant'),
];

// ── Fruits & Vegetables ──────────────────────

const produce: Product[] = [
  p('prd_001', 'Banana',                       'Fresh',          45,  50,  '6 pcs',   'Produce'),
  p('prd_002', 'Apple',                        'Fresh',         160, 175,  '1kg',     'Produce'),
  p('prd_003', 'Orange',                       'Fresh',         110, 120,  '1kg',     'Produce'),
  p('prd_004', 'Pomegranate',                  'Fresh',         180, 195,  '1kg',     'Produce'),
  p('prd_005', 'Papaya',                       'Fresh',          70,  80,  '1 pc',    'Produce'),
  p('prd_006', 'Watermelon',                   'Fresh',          90, 100,  '1 pc',    'Produce'),
  p('prd_007', 'Muskmelon',                    'Fresh',          75,  85,  '1 pc',    'Produce'),
  p('prd_008', 'Grapes Green',                 'Fresh',          95, 105,  '500g',    'Produce'),
  p('prd_009', 'Mango',                        'Fresh',         180, 200,  '1kg',     'Produce'),
  p('prd_010', 'Pineapple',                    'Fresh',          85,  95,  '1 pc',    'Produce'),
  p('prd_011', 'Potato',                       'Fresh',          35,  40,  '1kg',     'Produce'),
  p('prd_012', 'Onion',                        'Fresh',          40,  45,  '1kg',     'Produce'),
  p('prd_013', 'Tomato',                       'Fresh',          30,  35,  '500g',    'Produce'),
  p('prd_014', 'Cucumber',                     'Fresh',          35,  40,  '500g',    'Produce'),
  p('prd_015', 'Carrot',                       'Fresh',          45,  50,  '500g',    'Produce'),
  p('prd_016', 'Beans',                        'Fresh',          40,  45,  '250g',    'Produce'),
  p('prd_017', 'Capsicum',                     'Fresh',          35,  40,  '250g',    'Produce'),
  p('prd_018', 'Green Chilli',                 'Fresh',          15,  20,  '100g',    'Produce'),
  p('prd_019', 'Ginger',                       'Fresh',          25,  30,  '100g',    'Produce'),
  p('prd_020', 'Garlic',                       'Fresh',          35,  40,  '200g',    'Produce'),
  p('prd_021', 'Coriander Leaves',             'Fresh',          10,  12,  '100g',    'Produce'),
  p('prd_022', 'Mint Leaves',                  'Fresh',          10,  12,  '100g',    'Produce'),
  p('prd_023', 'Lemon',                        'Fresh',          30,  35,  '6 pcs',   'Produce'),
  p('prd_024', 'Cauliflower',                  'Fresh',          35,  40,  '1 pc',    'Produce'),
  p('prd_025', 'Cabbage',                      'Fresh',          30,  35,  '1 pc',    'Produce'),
  p('prd_026', 'Spinach',                      'Fresh',          25,  30,  '1 bunch', 'Produce'),
  p('prd_027', 'Mushroom',                     'Fresh',          55,  60,  '200g',    'Produce'),
  p('prd_028', 'Broccoli',                     'Fresh',          75,  85,  '250g',    'Produce'),
];

// ── Frozen & Ice Cream ───────────────────────

const frozen: Product[] = [
  p('frz_001', 'Amul Vanilla Ice Cream',       'Amul',          140, 150,  '700ml',  'Frozen'),
  p('frz_002', 'Amul Chocolate Ice Cream',     'Amul',          150, 160,  '700ml',  'Frozen'),
  p('frz_003', 'Kwality Walls Cornetto',       'Kwality Walls',  60,  65,  '120ml',  'Frozen'),
  p('frz_004', 'Magnum Almond Ice Cream',      'Kwality Walls',  99, 105,  '80ml',   'Frozen'),
  p('frz_005', 'Vadilal Butterscotch Ice Cream','Vadilal',      155, 165,  '700ml',  'Frozen'),
  p('frz_006', 'Havmor Cookies Cream Ice Cream','Havmor',       160, 170,  '700ml',  'Frozen'),
  p('frz_007', 'Amul Kulfi',                   'Amul',           30,  35,  '1 pc',   'Frozen'),
  p('frz_008', 'Mother Dairy Chocolate Cone',  'Mother Dairy',   45,  50,  '1 pc',   'Frozen'),
  p('frz_009', 'Frozen Green Peas',            'Safal',          65,  70,  '500g',   'Frozen'),
  p('frz_010', 'Frozen Sweet Corn',            'Safal',          70,  75,  '500g',   'Frozen'),
];

// ── Full catalogue ────────────────────────────

export const PRODUCTS: Product[] = [
  ...beverages,
  ...snacks,
  ...dairy,
  ...essentials,
  ...instant,
  ...produce,
  ...frozen,
];

export const STORE = {
  id: STORE_ID,
  name: STORE_NAME,
  deliveryTime: DELIVERY_TIME,
};
