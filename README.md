# tenmin ⚡

> Order food & groceries from Swiggy without leaving your terminal.

**Tenmin** is an AI-native CLI tool that lets developers order from Swiggy Instamart without ever picking up their phone. Stay in flow state — type a command, food arrives.

Built for the [Swiggy Builders Club](https://mcp.swiggy.com/builders/) Developer Program.

---

## The Problem

Developers lose ~23 minutes of focus after each context switch ([UC Irvine research](https://www.ics.uci.edu/~gmark/chi2005.pdf)). Ordering food is one of the most common ones:

1. You unlock your phone
2. You see 14 notifications
3. You open Instagram "for a second"
4. 20 minutes later, you forgot to order food
5. You're hungry **AND** you lost your flow

**Tenmin fixes this.** Stay in the terminal. Type a command. Food arrives.

---

## Features

### ✅ Currently Implemented

| Feature | Command | Description |
|---|---|---|
| **Search & Order** | `tenmin order <query>` | Search Instamart products, select interactively, add to cart |
| **AI-Powered Ordering** | `tenmin ask "<request>"` | Natural language → Gemini parses intent → auto-searches & adds to cart |
| **Cart Management** | `tenmin cart` | View cart with pricing, delivery fee, totals |
| **Clear Cart** | `tenmin cart clear` | Empty your cart with confirmation |
| **Checkout** | `tenmin checkout` | Review order, confirm, pay with credits |
| **Credit Balance** | `tenmin credits` | Check remaining credit balance |
| **Order History** | `tenmin history` | View past orders with dates, items, and spend totals |
| **UI Themes** | `tenmin theme` | Switch between 5 terminal color themes |

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/rushil1510/tenmin.git
cd tenmin

# Install dependencies
npm install

# Run in dev mode
npm run dev -- order "diet coke"

# Or build + link for global usage
npm run build
npm link
tenmin order "diet coke"
```

---

## Usage

### Search & Order

```bash
tenmin order diet coke
tenmin order "maggi noodles"
tenmin order eggs
```

Interactive flow:
1. See numbered search results with prices, units, and brands
2. Select the item you want
3. Choose quantity (1–10)
4. Item added to cart!
5. Option to keep adding from the same results

### AI-Powered Smart Ordering ✨

The flagship feature — plain English grocery ordering powered by Gemini.

```bash
# Ask in natural language
tenmin ask "ingredients for biryani for 4"
tenmin ask "breakfast essentials"
tenmin ask "I'm hosting dinner, what do I need?"
tenmin ask "healthy snacks under 100"
```

**How it works:**

```
tenmin ask "ingredients for biryani for 4"
          │
          ▼
  Gemini API call (Google AI)
  Prompt: "user wants to make biryani for 4.
           return a JSON array of grocery
           search terms, keep them simple"
          │
          ▼
  ["basmati rice", "chicken", "yogurt",
   "onion", "biryani masala", "ghee", "mint"]
          │
          ▼
  for each term → searchProducts() via Swiggy MCP
          │
          ▼
  show matches, user picks one per term → addToCart()
```

**First-time setup:** You'll be prompted to paste a Gemini API key (free from [aistudio.google.com](https://aistudio.google.com)). The key is saved to `~/.tenmin/config.json`. Alternatively, set `GEMINI_API_KEY` in your environment.

> **Cost:** Essentially free — one `ask` query costs ~₹0.05 on Gemini Flash.

### Cart Management

```bash
# View current cart with pricing breakdown
tenmin cart

# Clear your cart
tenmin cart clear
```

The cart displays:
- Item names, units, and quantities
- Per-line totals
- Subtotal, delivery fee (free over ₹199), and grand total

### Checkout

```bash
tenmin checkout
```

Shows a full order summary, checks your credit balance, and asks for confirmation before placing the order. After checkout:
- Credits are deducted
- Order is saved to history
- Cart is cleared
- ETA is displayed

### Order History

```bash
tenmin history
```

Shows your past 10 orders sorted by date, with:
- Order ID, date (with "Today" / "Yesterday" smart formatting)
- Item breakdown
- Total spend summary across all orders

### Credits

```bash
tenmin credits
```

Check your current credit balance. New users start with ₹500.

### UI Themes

```bash
# Interactive picker
tenmin theme

# Set directly
tenmin theme dark
tenmin theme cyberpunk
tenmin theme ocean
tenmin theme light
tenmin theme default
```

5 built-in themes, each with a unique color palette and icon set:

| Theme | Style | Best For |
|---|---|---|
| 🍊 **Default** | Warm Swiggy-inspired orange | Dark terminals (standard) |
| ☀️ **Light** | Clean, muted tones | Light terminal backgrounds |
| 🌙 **Dark** | Purple/teal Material You | Dark terminals, OLED |
| 🔮 **Cyberpunk** | Neon pink/green/cyan | Terminal hacker vibes |
| 🌊 **Ocean** | Cool blues and teals | Calm, focused work |

Theme preference persists across sessions.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                Developer Terminal                │
├─────────────────────────────────────────────────┤
│  tenmin CLI (Commander.js + Inquirer)            │
│  ┌────────────────┐  ┌────────────────────────┐ │
│  │ Commands        │  │ Terminal UI             │ │
│  │ order / cart /  │  │ chalk + ora             │ │
│  │ checkout / ask  │  │ themed formatting       │ │
│  │ history / theme │  │ 5 color palettes        │ │
│  └───────┬────────┘  └────────────────────────┘ │
│          │                                       │
│  ┌───────▼────────────────────────────────────┐  │
│  │ AI Layer (Gemini Flash)                    │  │
│  │ natural language → search terms            │  │
│  └───────┬────────────────────────────────────┘  │
│          │                                       │
│  ┌───────▼────────────────────────────────────┐  │
│  │ Swiggy MCP Client (Mock → Real)            │  │
│  │ search / cart / checkout / credits          │  │
│  └───────┬────────────────────────────────────┘  │
│          │                                       │
│  ┌───────▼────────────────────────────────────┐  │
│  │ Local Store (~/.tenmin/)                   │  │
│  │ state.json  — cart, credits, orders, theme │  │
│  │ config.json — API keys                     │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── index.ts              # CLI entry point — command registration
├── types.ts              # Shared TypeScript interfaces
├── commands/
│   ├── order.ts          # tenmin order — search + interactive add-to-cart
│   ├── ask.ts            # tenmin ask — AI-powered natural language ordering
│   ├── cart.ts           # tenmin cart — view/clear cart
│   ├── checkout.ts       # tenmin checkout — review + place order
│   ├── credits.ts        # tenmin credits — check balance
│   ├── history.ts        # tenmin history — past orders
│   └── theme.ts          # tenmin theme — switch UI theme
├── lib/
│   └── gemini.ts         # Gemini Flash API — intent parsing
├── mock/
│   ├── products.ts       # Mock Instamart product catalogue (55+ products)
│   └── swiggy-api.ts     # Mock MCP API — will be swapped for real MCP client
├── store/
│   ├── index.ts          # State management (cart, credits, orders, theme)
│   └── config.ts         # Config management (API keys)
└── ui/
    ├── format.ts         # Theme-aware terminal formatting functions
    └── themes.ts         # 5 theme definitions (colors + icons)
```

### Key Design Decisions

- **Mock-first API layer** — The entire Swiggy MCP API is abstracted behind `src/mock/swiggy-api.ts`. Once real MCP access is granted, only this file needs to change. Every command uses the same interface regardless of whether the backend is mocked or live.
- **Local-first state** — Everything persists to `~/.tenmin/state.json` (cart, credits, orders, theme) and `~/.tenmin/config.json` (API keys). No server, no database, no account required.
- **Gemini for intent, MCP for execution** — The AI layer (Gemini Flash) only does one thing: convert "ingredients for biryani for 4" into `["basmati rice", "chicken", "yogurt", ...]`. All actual product search, cart, and checkout operations go through Swiggy's MCP.
- **Theme system via semantic color roles** — Instead of hardcoding `chalk.green()`, all UI functions use `theme.colors.price`, `theme.colors.accent`, etc. This makes it trivial to add new themes.

---

## Roadmap

### ✅ Shipped

- [x] CLI framework with Commander.js
- [x] Mock Swiggy Instamart API (55+ products across 5 categories)
- [x] Product search with scored fuzzy matching
- [x] Interactive item selection with quantity picker
- [x] Cart management (add, view, clear)
- [x] Checkout with credit-based payment system
- [x] Order history with smart date formatting
- [x] AI-powered natural language ordering via Gemini Flash
- [x] 5 switchable UI themes (Default, Light, Dark, Cyberpunk, Ocean)
- [x] Persistent config for API keys and theme preference

---

### 🔜 Tier 1 — High Impact (Directly Showcases MCP)

These are the next features to build. They directly demonstrate why MCP integration matters.

#### `tenmin reorder`
Re-order from your history in one shot. Weekly grocery run becomes one command.

```bash
# Pick from your past orders, re-add everything to cart
tenmin reorder
```

Already have the order history data — this is ~30 lines of implementation.

#### `tenmin track`
Live order status in the terminal. Poll the MCP order-status endpoint, show ETA + status updates with a spinner.

```bash
tenmin track
# ◌ Order #TM-2026-4821
# ├─ Packed ✓
# ├─ Rider assigned ✓
# ├─ Out for delivery...  🛵
# └─ ETA: 7 minutes
```

The thing developers actually want after placing an order — check status without touching their phone.

---

### 📋 Tier 2 — Power User Features

#### `tenmin list`
Saved grocery lists — create named carts and execute them on demand.

```bash
# Save current cart as a named list
tenmin list save weekly-groceries

# Run a saved list (adds all items to cart)
tenmin list run weekly-groceries

# View all saved lists
tenmin list
```

For people who order the same stuff repeatedly — this becomes their primary workflow.

#### `tenmin budget`
Monthly/weekly spend tracking from order history.

```bash
tenmin budget
# 📊 Spending Summary
# ──────────────────────────────────────────────
# This week     ₹450  (3 orders)
# This month    ₹1,820  (12 orders)
# Top category  Beverages (₹620)
```

Already have all the data, just needs grouping by week/month and a nice table.

---

### 🔮 Tier 3 — Future Ideas

| Feature | Description |
|---|---|
| **Out-of-stock watch** | `tenmin watch "amul milk"` — get notified when an item is back in stock |
| **Price history** | Track price changes over time (if MCP exposes historical data) |
| **Nearby store discovery** | Find and switch between available Instamart stores |
| **Real Swiggy MCP integration** | Swap mock API for live MCP client (pending API access) |
| **OAuth 2.0 PKCE authentication** | Real Swiggy account login flow |
| **VS Code / Cursor extension** | Sidebar widget + command palette integration |
| **Claude Code MCP tool server** | Expose tenmin as an MCP server so AI copilots can order food |

---

## MCP Integration Strategy

Tenmin is designed to be **MCP-ready from day one**. The mock API layer (`src/mock/swiggy-api.ts`) mirrors the expected interface of Swiggy's MCP servers:

| Mock Function | Expected MCP Tool | Status |
|---|---|---|
| `searchProducts(query)` | `search_products` | Mocked ✅ |
| `addToCart(productId, qty)` | `add_to_cart` | Mocked ✅ |
| `getCart()` | `get_cart` | Mocked ✅ |
| `clearCart()` | `clear_cart` | Mocked ✅ |
| `checkout()` | `checkout` / `place_order` | Mocked ✅ |
| `getCredits()` | `get_balance` | Mocked ✅ |
| — | `track_order` | Planned 🔜 |
| — | `get_order_status` | Planned 🔜 |

Once Swiggy Builders Club grants API access, the migration path is:
1. Replace `src/mock/swiggy-api.ts` with real MCP client calls
2. Add OAuth 2.0 PKCE auth flow
3. Everything else stays the same — commands, UI, themes, state management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Language | TypeScript 5.7 |
| CLI Framework | [Commander.js](https://github.com/tj/commander.js) |
| Interactive Prompts | [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js) |
| Terminal Styling | [chalk](https://github.com/chalk/chalk) |
| Spinners | [ora](https://github.com/sindresorhus/ora) |
| AI / NLP | [Gemini Flash](https://ai.google.dev/) (via REST API) |
| Build Tool | [tsup](https://github.com/egoist/tsup) |
| Dev Runner | [tsx](https://github.com/privatenumber/tsx) |

---

## Development

```bash
# Clone
git clone https://github.com/rushil1510/tenmin.git
cd tenmin

# Install
npm install

# Dev mode (runs TypeScript directly)
npm run dev -- order "diet coke"
npm run dev -- ask "ingredients for pasta"
npm run dev -- theme cyberpunk
npm run dev -- cart
npm run dev -- checkout
npm run dev -- history

# Type check
npm run lint

# Build for production
npm run build

# Link globally
npm link
tenmin order "diet coke"
```

### Local State

All data is stored in `~/.tenmin/`:

```
~/.tenmin/
├── state.json    # Cart, credits (₹500 default), order history, theme preference
└── config.json   # Gemini API key
```

To reset everything: delete `~/.tenmin/` and start fresh.

---

## Contributing

This project is actively developed as part of the Swiggy Builders Club submission. Contributions welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## Built For

[Swiggy Builders Club](https://mcp.swiggy.com/builders/) — Developer Program

> *"Build something impressive and send us a demo. Standout projects get featured — and yes, we actively hire from this program."*

---

## Team

- **Rushil Mital** — [GitHub](https://github.com/rushil1510) · [Email](mailto:rushilmital003@gmail.com)
- **Aditya Prasad** — [GitHub](https://github.com/adityaprasad275) · [Email](mailto:adityanprasad275@gmail.com)

---

## License

MIT © [Rushil Mital](https://github.com/rushil1510)
