# Unit Test Guide

This directory explains the current unit tests in Tenmin so new contributors can quickly understand what each suite is verifying.

## How to run the tests

```bash
npm test
```

For local iteration:

```bash
npm run test:watch
```

The project uses `vitest` for unit tests.

## Shared testing pattern

Most suites test filesystem-backed state. To avoid touching a real developer machine, they mock `node:os.homedir()` to point at a temporary path under `/tmp`. That means calls that normally write to `~/.tenmin` write into an isolated test directory instead.

Most suites also clean that directory in `beforeEach` and `afterEach`, then call `resetState()` when they need a known default app state. In practice, this means each test starts from a fresh Tenmin install unless the test deliberately seeds data first.

## What is covered

The current unit tests focus on:

- local state persistence
- config persistence and environment-variable precedence
- saved list CRUD behavior
- mock Swiggy API cart and checkout flows
- mock order tracking state transitions
- pure budget calculations

They do not currently cover CLI rendering in detail, interactive prompts, or full end-to-end command flows.

## Suite-by-suite breakdown

### `src/store/index.test.ts`

This suite verifies the core app state stored in `~/.tenmin/state.json`.

- `getState should create default state if it does not exist`
  Confirms first-run behavior. The test expects `getState()` to create a state file and return the default credits (`500`), empty cart, and empty order history.

- `saveState should persist state changes`
  Confirms state is written to disk, not just kept in memory. The test mutates credits, saves, reads the raw JSON file, and then calls `getState()` again to make sure the persisted value is loaded back.

- `resetState should restore default state`
  Confirms `resetState()` overwrites modified state with the project defaults.

- `theme preferences should work correctly`
  Confirms theme settings live inside persisted app state. It expects the initial theme to be `default`, then checks that `setThemeName('monokai')` is reflected by `getThemeName()`.

If this suite fails, it usually means the shape of `AppState`, default values, or disk persistence behavior changed.

### `src/store/config.test.ts`

This suite verifies the separate config store in `~/.tenmin/config.json`.

- `getGeminiKey should return null if not set`
  Confirms the absence case is explicit. New code should expect `null`, not an empty string.

- `saveGeminiKey should persist the key`
  Confirms the saved API key can be read back from config storage.

- `getGeminiKey should prioritize process.env.GEMINI_API_KEY`
  Confirms environment configuration wins over the saved config file. This is important for local development, CI, and secret management.

If this suite fails, it usually points to a regression in key lookup order or config-file reads/writes.

### `src/store/lists.test.ts`

This suite verifies saved shopping-list behavior stored inside app state.

- `getSavedLists returns empty array by default`
  Confirms new state starts with no saved lists.

- `saveList persists a new list`
  Confirms a new list is added and stored with its items.

- `saveList updates an existing list with the same name`
  Confirms list names are treated as unique identifiers. Saving the same name twice should overwrite the existing list instead of creating duplicates.

- `saveList stores multiple distinct lists`
  Confirms different list names can coexist.

- `getSavedList returns the correct list by name`
  Confirms lookup by exact name returns the matching list.

- `getSavedList returns undefined for a non-existent name`
  Confirms callers should handle a missing list with `undefined`.

- `deleteList removes the correct list and returns true`
  Confirms delete behavior is selective and signals success with `true`.

- `deleteList returns false when the list does not exist`
  Confirms delete failures are non-throwing and signaled with `false`.

- `saved lists survive a getState round-trip (persistence)`
  Confirms saved lists remain intact when state is read back from disk.

- `state migration: old state without savedLists gets empty array`
  Confirms backward compatibility with older `state.json` files that predate the `savedLists` field. The expectation is graceful migration, not a crash.

If this suite fails, it often means saved-list migration or overwrite semantics changed.

### `src/mock/swiggy-api.test.ts`

This suite verifies the mock API layer used before real Swiggy integrations exist.

#### `searchProducts`

- `should return products matching the query`
  Confirms text search returns at least one relevant product and preserves the original query string in the response.

- `should return empty when query is empty`
  Confirms blank input is treated as no search and returns zero results.

#### `Cart Management`

- `should add to cart and return it`
  Confirms `addToCart` creates a cart entry with the requested quantity.

- `should throw error when adding invalid product`
  Confirms invalid product IDs are rejected with an error.

- `should increment quantity if already in cart`
  Confirms adding the same product twice accumulates quantity instead of creating duplicate cart lines.

- `should remove item from cart`
  Confirms cart removal deletes the requested item and leaves the cart empty when that was the only line.

#### `Checkout`

- `should process checkout successfully if credits are sufficient`
  Confirms the happy path: checkout creates an order result, computes subtotal, deducts credits, and clears the cart afterward.

- `should fail checkout if cart is empty`
  Confirms checkout has a guard clause for empty carts.

- `should fail checkout if credits are insufficient`
  Confirms checkout refuses purchases when the total exceeds available credits.

If this suite fails, it usually means cart mutation, credits math, or checkout validation drifted from the intended mock behavior.

### `src/mock/track.test.ts`

This suite verifies `getOrderStatus`, which derives a mock delivery status from how old an order is.

The helper `seedOrder(minutesAgo)` injects an order directly into saved state with a synthetic timestamp. The tests then ask `getOrderStatus()` to translate elapsed time into a tracking status.

- `throws for an unknown order ID`
  Confirms missing orders produce an error instead of a fake status.

- `returns PREPARING status for a very fresh order (< 2 min old)`
  Expects status `PREPARING`, progress `0.25`, and an ETA string like `9 mins`.

- `returns PACKED status for an order 2–5 minutes old`
  Expects status `PACKED` and progress `0.5`.

- `returns ON_THE_WAY status for an order 5–10 minutes old`
  Expects status `ON_THE_WAY`, progress `0.75`, and rider-related status text.

- `returns DELIVERED status for an order > 10 minutes old`
  Expects status `DELIVERED`, progress `1`, and ETA `Arrived`.

- `progress values are monotonically ordered across status buckets`
  Confirms the four status buckets produce strictly increasing progress values. This protects the visual progress model from going backward.

If this suite fails, it usually means the time thresholds or progress mapping changed.

### `src/commands/budget.test.ts`

This suite is slightly different from the others. It does not call the CLI command directly. Instead, it recreates the pure date and aggregation logic behind `tenmin budget` so that the tests stay focused on calculations rather than terminal formatting.

#### `Period filtering`

- `today filter only includes orders from today`
  Confirms orders older than the current day boundary are excluded.

- `week filter spans from Sunday to now`
  Confirms the current week begins on Sunday, matching the implementation in `budget.ts`.

- `month filter includes all orders since the 1st`
  Confirms the month boundary logic uses the first day of the current month.

#### `sumOrders`

- `returns 0 for empty order list`
  Confirms the total spend helper has a safe zero case.

- `sums all order totals correctly`
  Confirms total spend is the sum of each order's `total`.

#### `topItems`

- `returns empty for no orders`
  Confirms no history produces no ranked items.

- `aggregates quantities and spend across orders`
  Confirms repeated items across multiple orders are merged by name, with both quantity and rupee spend accumulated.

- `respects the limit parameter`
  Confirms only the requested number of top items is returned.

- `sorts by quantity descending`
  Confirms ranking is based on quantity, with the most frequently ordered items first.

If this suite fails, it usually means budget summaries and rankings no longer match the command's intended business logic.

## Notes for future contributors

- When adding persistence features, keep the mocked-home-directory pattern. It prevents tests from polluting real user state.
- When evolving the state shape, add migration-oriented tests like the `savedLists` compatibility case.
- When adding CLI features, prefer separating pure computation from terminal rendering. The budget tests are a good example of how that makes logic easier to verify.
