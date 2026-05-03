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
| **AI Copilot** | `tenmin copilot "<request>"` | **Multi-turn ReAct agent** powered by LangChain + Gemini — searches restaurants, browses menus, auto-applies coupons, builds your cart |
| **Reorder** | `tenmin reorder` | Pick a past order from your history and instantly re-add available items to cart |
| **Live Tracking** | `tenmin track` | Live order status polling with a visual progress bar, ETA, and quick dismiss via `q` or Enter |
| **Saved Lists** | `tenmin list` | Save named carts and run them on demand — one command weekly grocery run |
| **Budget** | `tenmin budget` | Spending summary with bar charts — today, weekly, monthly, all-time, top items |
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

### AI Copilot (LangChain ReAct Agent) 🤖

The next-gen ordering experience — a multi-turn autonomous agent that reasons, searches, browses menus, applies coupons, and builds your cart.

```bash
tenmin copilot "order me butter chicken under 500"
tenmin copilot "find a pizza place and get me a margherita"
tenmin copilot "get me a cheap biryani and apply a coupon"
```

**How the ReAct loop works:**

```
tenmin copilot "butter chicken under 500"
          │
          ▼
  LangChain ReAct Agent (Gemini 1.5 Flash)
  ┌───────────────────────────────────────┐
  │ Thought: I need to search restaurants │
  │ Action:  searchRestaurants("butter    │
  │          chicken")                    │
  │ Observation: [Punjab Grill, ...]      │
  │                                       │
  │ Thought: Let me check the menu        │
  │ Action:  getRestaurantMenu("rest_001")│
  │ Observation: [Butter Chicken ₹350]    │
  │                                       │
  │ Thought: Let me find a coupon         │
  │ Action:  fetchFoodCoupons("rest_001") │
  │ Observation: [PUNJAB50: ₹50 off]     │
  │                                       │
  │ Thought: I should apply the coupon    │
  │ Action:  applyFoodCoupon("PUNJAB50")  │
  │ Observation: Cart total: ₹300         │
  └───────────────────────────────────────┘
          │
          ▼
  "Found Butter Chicken (₹350) at Punjab Grill.
   Applied PUNJAB50 coupon — you save ₹50!
   Ready to order?"
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

### Live Tracking

```bash
tenmin track
```

Tracks your latest active order with a progress bar and ETA. If you only wanted a quick glance, press `q` or Enter to dismiss the live tracking screen and get your terminal prompt back immediately.

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
┌──────────────────────────────────────────────────────────────┐
│                     Developer Terminal                       │
├──────────────────────────────────────────────────────────────┤
│  tenmin CLI (Commander.js + Inquirer)                        │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ Commands          │  │ Terminal UI                      │ │
│  │ order / cart /    │  │ chalk + ora                      │ │
│  │ checkout / ask /  │  │ themed formatting                │ │
│  │ copilot / history │  │ 5 color palettes                 │ │
│  │ theme / budget    │  │                                  │ │
│  └────────┬─────────┘  └──────────────────────────────────┘ │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────────────┐   │
│  │ AI Agent Layer                                        │   │
│  │ ┌──────────────────┐  ┌─────────────────────────────┐ │   │
│  │ │ Gemini (ask cmd)  │  │ LangChain ReAct (copilot)  │ │   │
│  │ │ intent → terms    │  │ reason → act → observe     │ │   │
│  │ └──────────────────┘  └──────────┬──────────────────┘ │   │
│  └──────────────────────────────────┼────────────────────┘   │
│                                     │                        │
│  ┌──────────────────────────────────▼────────────────────┐   │
│  │ Swiggy MCP Client (Mock → Real)                       │   │
│  │ ┌─────────────────────┐  ┌──────────────────────────┐ │   │
│  │ │ Food MCP             │  │ Instamart MCP            │ │   │
│  │ │ searchRestaurants    │  │ searchProducts           │ │   │
│  │ │ getRestaurantMenu    │  │ yourGoToItems            │ │   │
│  │ │ addFoodToCart         │  │ addToCart                │ │   │
│  │ │ fetchFoodCoupons     │  │ checkout                 │ │   │
│  │ │ applyFoodCoupon      │  │                          │ │   │
│  │ │ placeFoodOrder       │  │                          │ │   │
│  │ └─────────────────────┘  └──────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ Local Store (~/.tenmin/)                               │   │
│  │ state.json  — cart, foodCart, credits, orders, theme   │   │
│  │ config.json — API keys                                 │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── index.ts              # CLI entry point — command registration
├── types.ts              # Shared TypeScript interfaces (Instamart + Food)
├── agent/
│   ├── tools.ts          # LangChain tool definitions (10 tools w/ zod schemas)
│   └── executor.ts       # LangGraph ReAct agent orchestration
├── commands/
│   ├── order.ts          # tenmin order — search + interactive add-to-cart
│   ├── ask.ts            # tenmin ask — AI-powered natural language ordering
│   ├── copilot.ts        # tenmin copilot — multi-turn LangChain ReAct agent
│   ├── cart.ts           # tenmin cart — view/clear cart
│   ├── checkout.ts       # tenmin checkout — review + place order
│   ├── credits.ts        # tenmin credits — check balance
│   ├── history.ts        # tenmin history — past orders
│   ├── reorder.ts        # tenmin reorder — re-add past order items
│   ├── track.ts          # tenmin track — live order tracking
│   ├── list.ts           # tenmin list — saved grocery lists
│   ├── budget.ts         # tenmin budget — spending trends
│   ├── theme.ts          # tenmin theme — switch UI theme
│   └── prefs.ts          # tenmin prefs — edit dietary/budget preferences
├── lib/
│   ├── gemini.ts         # Gemini Flash API — intent parsing + bundle curation
│   └── context.ts        # Context builder (history, time, prefs)
├── mock/
│   ├── products.ts       # Mock Instamart product catalogue (150+ products)
│   ├── restaurants.ts    # Mock Food restaurant catalogue (3 restaurants + menus + coupons)
│   └── swiggy-api.ts     # Mock MCP API — will be swapped for real MCP client
├── store/
│   ├── index.ts          # State management (cart, foodCart, credits, orders, theme)
│   └── config.ts         # Config management (API keys)
└── ui/
    ├── format.ts         # Theme-aware terminal formatting functions
    └── themes.ts         # 5 theme definitions (colors + icons)
```

### Key Design Decisions

- **Mock-first API layer** — The entire Swiggy MCP API is abstracted behind `src/mock/swiggy-api.ts`. Once real MCP access is granted, only this file needs to change. Every command uses the same interface regardless of whether the backend is mocked or live.
- **Dual AI architecture** — `tenmin ask` uses a lightweight two-pass Gemini pipeline (intent → bundles) for groceries. `tenmin copilot` uses a full LangChain ReAct agent with tool-calling for complex multi-step food ordering (restaurant → menu → coupon → cart).
- **Local-first state** — Everything persists to `~/.tenmin/state.json` (cart, foodCart, credits, orders, theme) and `~/.tenmin/config.json` (API keys). No server, no database, no account required.
- **Theme system via semantic color roles** — Instead of hardcoding `chalk.green()`, all UI functions use `theme.colors.price`, `theme.colors.accent`, etc. This makes it trivial to add new themes.

---

## Roadmap

### ✅ Shipped

- [x] CLI framework with Commander.js
- [x] Mock Swiggy Instamart API (150+ products across 7 categories)
- [x] Mock Swiggy Food API (3 restaurants with menus + coupons)
- [x] Product search with scored fuzzy matching
- [x] Interactive item selection with quantity picker
- [x] Cart management (add, view, clear) for both Instamart and Food
- [x] Checkout with credit-based payment system
- [x] Order history with smart date formatting
- [x] AI-powered natural language ordering via Gemini Flash (`ask`)
- [x] Multi-turn LangChain ReAct agent with tool-calling (`copilot`)
- [x] 10 LangChain tools covering Food + Instamart APIs
- [x] Auto-coupon discovery and application in agent flow
- [x] `yourGoToItems` integration for Instamart recommendations
- [x] 5 switchable UI themes (Default, Light, Dark, Cyberpunk, Ocean)
- [x] Persistent config for API keys and theme preference
- [x] Saved grocery lists with save/run/delete
- [x] Budget/spending trends with bar charts
- [x] Live order tracking with progress bar
- [x] Reorder from past orders

---

### 🔜 Next Up

| Feature | Description |
|---|---|
| **Interactive copilot confirmation** | Agent presents cart to user and waits for explicit Y/N before placing order |
| **Streaming agent output** | Show the agent's reasoning steps in real-time as it works |
| **Multi-restaurant comparison** | Agent compares prices across restaurants for the same dish |

---

### 🔮 Tier 3 — Future Ideas

| Feature | Description |
|---|---|
| **Out-of-stock watch** | `tenmin watch "amul milk"` — get notified when an item is back in stock |
| **Price history** | Track price changes over time (if MCP exposes historical data) |
| **Real Swiggy MCP integration** | Swap mock API for live MCP client (pending API access) |
| **OAuth 2.0 PKCE authentication** | Real Swiggy account login flow |
| **VS Code / Cursor extension** | Sidebar widget + command palette integration |
| **Claude Code MCP tool server** | Expose tenmin as an MCP server so AI copilots can order food |
| **Dineout team dinner** | Book a table for sprint celebrations via Dineout MCP |

---

## MCP Integration Strategy

Tenmin is designed to be **MCP-ready from day one**. The mock API layer (`src/mock/swiggy-api.ts`) mirrors the expected interface of Swiggy's MCP servers:

### Food MCP Server

| Mock Function | Expected MCP Tool | Status |
|---|---|---|
| `searchRestaurants(query)` | `search_restaurants` | Mocked ✅ |
| `getRestaurantMenu(id)` | `get_restaurant_menu` | Mocked ✅ |
| `addFoodToCart(restId, itemId, qty)` | `update_food_cart` | Mocked ✅ |
| `fetchFoodCoupons(restId)` | `fetch_food_coupons` | Mocked ✅ |
| `applyFoodCoupon(code, restId)` | `apply_food_coupon` | Mocked ✅ |
| `placeFoodOrder()` | `place_food_order` | Mocked ✅ |
| `getOrderStatus(id)` | `track_food_order` | Mocked ✅ |

### Instamart MCP Server

| Mock Function | Expected MCP Tool | Status |
|---|---|---|
| `searchProducts(query)` | `search_products` | Mocked ✅ |
| `yourGoToItems()` | `your_go_to_items` | Mocked ✅ |
| `addToCart(productId, qty)` | `update_cart` | Mocked ✅ |
| `getCart()` | `get_cart` | Mocked ✅ |
| `clearCart()` | `clear_cart` | Mocked ✅ |
| `checkout()` | `checkout` | Mocked ✅ |

Once Swiggy Builders Club grants API access, the migration path is:
1. Replace `src/mock/swiggy-api.ts` with real MCP client calls
2. Add OAuth 2.0 PKCE auth flow
3. Everything else stays the same — agent, commands, UI, themes, state management

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
| AI Agent | [LangChain](https://js.langchain.com/) + [LangGraph](https://langchain-ai.github.io/langgraphjs/) (ReAct agent) |
| LLM | [Gemini 1.5 Flash](https://ai.google.dev/) (via `@langchain/google-genai`) |
| Schema Validation | [zod](https://zod.dev/) |
| Build Tool | [tsup](https://github.com/egoist/tsup) |
| Dev Runner | [tsx](https://github.com/privatenumber/tsx) |
| Testing | [Vitest](https://vitest.dev/) |

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
npm run dev -- copilot "order me butter chicken under 500"
npm run dev -- theme cyberpunk
npm run dev -- cart
npm run dev -- checkout
npm run dev -- history

# Type check
npm run lint

# Run unit tests (47 tests)
npm test

# Build for production
npm run build

# Link globally
npm link
tenmin copilot "find me a cheap biryani"
```

### Local State

All data is stored in `~/.tenmin/`:

```
~/.tenmin/
├── state.json    # Cart, credits (₹500 default), order history, theme preference
└── config.json   # Gemini API key
```

To reset everything: delete `~/.tenmin/` and start fresh.

### Test Documentation

The unit test guide lives at [docs/tests/README.md](/Users/rushilmital/Documents/VibeCoding/Swiggy/tenmin/docs/tests/README.md). It walks through each current suite, what behavior it protects, and the shared test patterns used across the repo.

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
