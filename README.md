# tenmin ⚡

> Order food & groceries from Swiggy without leaving your terminal.

**Tenmin** is a CLI tool that lets developers order from Swiggy Instamart (and soon Swiggy Food) without ever picking up their phone. Stay in flow state — your AI copilot handles the rest.

Built on [Swiggy's MCP Platform](https://mcp.swiggy.com/builders/) as part of the Swiggy Builders Club.

---

## Why?

Developers lose ~23 minutes of focus after each context switch. Picking up your phone to order food is one of the most common ones:

1. You unlock your phone
2. You see 14 notifications  
3. You open Instagram "for a second"
4. 20 minutes later, you forgot to order food
5. You're hungry AND you lost your flow

**Tenmin fixes this.** Stay in the terminal. Type a command. Food arrives.

---

## Quick Start

```bash
# Install
npm install -g tenmin

# Search & add to cart
tenmin order diet coke

# View your cart
tenmin cart

# Place the order
tenmin checkout

# Check your credits
tenmin credits
```

---

## Usage

### Search & Order

```bash
# Search for products
tenmin order diet coke
tenmin order "maggi noodles"
tenmin order eggs

# Interactive flow:
# 1. See numbered search results
# 2. Select the item you want
# 3. Choose quantity
# 4. Added to cart!
```

### Cart Management

```bash
# View current cart
tenmin cart

# Clear your cart
tenmin cart clear
```

### Checkout

```bash
# Review & place your order
tenmin checkout

# You'll see:
# - Order summary
# - Total with delivery fee
# - Credit balance
# - Confirmation prompt
```

### Credits

```bash
# Check your credit balance
tenmin credits
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                Developer Terminal            │
├─────────────────────────────────────────────┤
│  tenmin CLI (Commander.js + Inquirer)        │
│  ┌───────────────┐  ┌───────────────────┐   │
│  │ Commands       │  │ Terminal UI        │   │
│  │ order/cart/    │  │ chalk + ora        │   │
│  │ checkout       │  │ pretty formatting  │   │
│  └───────┬───────┘  └───────────────────┘   │
│          │                                   │
│  ┌───────▼───────────────────────────────┐   │
│  │ Swiggy MCP Client (Mock for now)      │   │
│  │ search / cart / checkout / track       │   │
│  └───────┬───────────────────────────────┘   │
│          │                                   │
│  ┌───────▼───────────────────────────────┐   │
│  │ Local Store (~/.tenmin/state.json)    │   │
│  │ cart, credits, order history           │   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Development

```bash
# Clone the repo
git clone https://github.com/rushil1510/tenmin.git
cd tenmin

# Install dependencies
npm install

# Run in dev mode
npm run dev -- order "diet coke"

# Build
npm run build

# Link for global usage
npm link
```

---

## Roadmap

- [x] CLI framework with Commander.js
- [x] Mock Swiggy Instamart API
- [x] Product search with fuzzy matching
- [x] Interactive item selection
- [x] Cart management (add, view, clear)
- [x] Checkout with credit system
- [ ] Real Swiggy MCP integration (pending API access)
- [ ] OAuth 2.0 PKCE authentication
- [ ] Order tracking
- [ ] AI-powered natural language ordering
- [ ] Quick reorder from history
- [ ] VS Code / Cursor extension
- [ ] Claude Code MCP tool server

---

## Built For

[Swiggy Builders Club](https://mcp.swiggy.com/builders/) — Developer Program

---

## License

MIT © [Rushil Mital](https://github.com/rushil1510)
