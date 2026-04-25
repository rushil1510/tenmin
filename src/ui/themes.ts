// ─────────────────────────────────────────────
// Tenmin — Theme Definitions
// Color palettes for different terminal looks
// ─────────────────────────────────────────────

export type ThemeName = 'default' | 'light' | 'dark' | 'cyberpunk' | 'ocean';

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  colors: {
    // Branding
    brand: string;          // Main brand color (banner, logo)
    brandText: string;      // Tagline / subtitle text

    // Status
    success: string;        // ✔ messages
    error: string;          // ✖ messages
    info: string;           // ℹ messages
    warn: string;           // ⚠ messages
    hint: string;           // 💡 dim helper text

    // Content
    primary: string;        // Bold headings, product names
    secondary: string;      // Dim text, labels
    accent: string;         // Numbered items, quantities, ETA
    price: string;          // Prices in green
    priceStrike: string;    // Strikethrough MRP

    // Structure
    divider: string;        // Separator lines
    muted: string;          // Very dim / subtle text
  };
  icons: {
    cart: string;
    credits: string;
    order: string;
    success: string;
    error: string;
    info: string;
    warn: string;
    hint: string;
    bolt: string;
    done: string;
  };
}

// ── Default Theme (Swiggy-inspired) ───────────
const defaultTheme: Theme = {
  name: 'default',
  label: '🍊 Default',
  description: 'Warm Swiggy-inspired palette',
  colors: {
    brand: '#FF5722',
    brandText: '#888888',
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warn: '#FFC107',
    hint: '#888888',
    primary: '#FFFFFF',
    secondary: '#888888',
    accent: '#00BCD4',
    price: '#4CAF50',
    priceStrike: '#888888',
    divider: '#555555',
    muted: '#666666',
  },
  icons: {
    cart: '🛒',
    credits: '💳',
    order: '📋',
    success: '✔',
    error: '✖',
    info: 'ℹ',
    warn: '⚠',
    hint: '💡',
    bolt: '⚡',
    done: '🎉',
  },
};

// ── Light Theme ───────────────────────────────
const lightTheme: Theme = {
  name: 'light',
  label: '☀️  Light',
  description: 'Clean, bright — great for light terminals',
  colors: {
    brand: '#E65100',
    brandText: '#666666',
    success: '#2E7D32',
    error: '#C62828',
    info: '#1565C0',
    warn: '#F9A825',
    hint: '#9E9E9E',
    primary: '#212121',
    secondary: '#757575',
    accent: '#00838F',
    price: '#2E7D32',
    priceStrike: '#BDBDBD',
    divider: '#BDBDBD',
    muted: '#9E9E9E',
  },
  icons: {
    cart: '🛒',
    credits: '💰',
    order: '📝',
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warn: '⚠',
    hint: '→',
    bolt: '●',
    done: '✓',
  },
};

// ── Dark Theme ────────────────────────────────
const darkTheme: Theme = {
  name: 'dark',
  label: '🌙 Dark',
  description: 'Moody and sleek — easy on the eyes',
  colors: {
    brand: '#BB86FC',
    brandText: '#6B6B6B',
    success: '#03DAC6',
    error: '#CF6679',
    info: '#8AB4F8',
    warn: '#FFB74D',
    hint: '#6B6B6B',
    primary: '#E1E1E1',
    secondary: '#6B6B6B',
    accent: '#BB86FC',
    price: '#03DAC6',
    priceStrike: '#555555',
    divider: '#333333',
    muted: '#4A4A4A',
  },
  icons: {
    cart: '🛒',
    credits: '💎',
    order: '📋',
    success: '◆',
    error: '◆',
    info: '◆',
    warn: '◆',
    hint: '›',
    bolt: '◈',
    done: '★',
  },
};

// ── Cyberpunk Theme ───────────────────────────
const cyberpunkTheme: Theme = {
  name: 'cyberpunk',
  label: '🔮 Cyberpunk',
  description: 'Neon glow — terminal hacker vibes',
  colors: {
    brand: '#FF0080',
    brandText: '#666666',
    success: '#00FF41',
    error: '#FF073A',
    info: '#00D4FF',
    warn: '#FFE500',
    hint: '#666666',
    primary: '#F0F0F0',
    secondary: '#777777',
    accent: '#00FFFF',
    price: '#00FF41',
    priceStrike: '#555555',
    divider: '#444444',
    muted: '#555555',
  },
  icons: {
    cart: '▸',
    credits: '◉',
    order: '▹',
    success: '▶',
    error: '▶',
    info: '▶',
    warn: '▶',
    hint: '»',
    bolt: '⟐',
    done: '⚑',
  },
};

// ── Ocean Theme ───────────────────────────────
const oceanTheme: Theme = {
  name: 'ocean',
  label: '🌊 Ocean',
  description: 'Cool blues and teals — calm and focused',
  colors: {
    brand: '#0097A7',
    brandText: '#78909C',
    success: '#00C853',
    error: '#FF5252',
    info: '#40C4FF',
    warn: '#FFD740',
    hint: '#78909C',
    primary: '#ECEFF1',
    secondary: '#78909C',
    accent: '#18FFFF',
    price: '#00E676',
    priceStrike: '#546E7A',
    divider: '#37474F',
    muted: '#546E7A',
  },
  icons: {
    cart: '≡',
    credits: '◎',
    order: '≡',
    success: '~',
    error: '×',
    info: '○',
    warn: '△',
    hint: '·',
    bolt: '◇',
    done: '◈',
  },
};

// ── Theme registry ────────────────────────────

export const THEMES: Record<ThemeName, Theme> = {
  default: defaultTheme,
  light: lightTheme,
  dark: darkTheme,
  cyberpunk: cyberpunkTheme,
  ocean: oceanTheme,
};

export const THEME_NAMES: ThemeName[] = ['default', 'light', 'dark', 'cyberpunk', 'ocean'];

export function getTheme(name: ThemeName): Theme {
  return THEMES[name] ?? defaultTheme;
}
