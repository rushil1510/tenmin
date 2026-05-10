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

The project uses `vitest` for unit tests. The full suite currently contains **135 tests across 12 files**.

## Shared testing pattern

Most suites test filesystem-backed state. To avoid touching a real developer machine, they mock `node:os.homedir()` to point at a temporary path under `/tmp`. That means calls that normally write to `~/.tenmin` write into an isolated test directory instead.

Most suites also clean that directory in `beforeEach` and `afterEach`, then call `resetState()` when they need a known default app state. In practice, this means each test starts from a fresh Tenmin install unless the test deliberately seeds data first.

## What is covered

The current unit tests focus on:

- local state persistence (cart, foodCart, credits, orders, savedLists, theme)
- config persistence and environment-variable precedence
- user preferences persistence, migration, and error recovery
- saved list CRUD behavior
- mock Swiggy Instamart API cart and checkout flows
- mock Swiggy Food API: `addFoodToCart`, `applyFoodCoupon`, `placeFoodOrder`
- mock order tracking state transitions
- track command dismissal behavior
- pure budget calculations (period filtering, summing, top-item ranking)
- context builder: `buildContext` shape, recent-item deduplication, `formatContextForPrompt`
- all 10 LangChain agent tools (success + error paths)
- all 5 UI themes (registry completeness, `getTheme` resolution, interface field integrity)

They do not currently cover CLI rendering in detail, interactive prompts, or full end-to-end command flows.

---

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

---

### `src/store/config.test.ts`

This suite verifies the separate config store in `~/.tenmin/config.json`.

- `getGeminiKey should return null if not set`
  Confirms the absence case is explicit. New code should expect `null`, not an empty string.

- `saveGeminiKey should persist the key`
  Confirms the saved API key can be read back from config storage.

- `getGeminiKey should prioritize process.env.GEMINI_API_KEY`
  Confirms environment configuration wins over the saved config file. This is important for local development, CI, and secret management.

If this suite fails, it usually points to a regression in key lookup order or config-file reads/writes.

---

### `src/store/preferences.test.ts`

This suite verifies the user preferences store in `~/.tenmin/preferences.json`. Preferences include dietary rules, an avoid list, and a default budget. They are read by `tenmin ask` on every invocation.

- `returns default preferences when no file exists`
  Confirms new installs start with empty dietary/avoid lists and a ₹300 default budget.

- `DEFAULT_PREFS exports the canonical defaults`
  Confirms the exported constant matches what `getPreferences()` returns before any writes.

- `savePreferences persists full preferences to disk`
  Confirms a full write-then-read cycle returns the same values.

- `savePreferences creates the .tenmin directory if it does not exist`
  Confirms the function is safe to call before any other store initialization has created the directory.

- `getPreferences round-trips multiple dietary flags`
  Confirms arrays of arbitrary length survive the JSON round-trip correctly.

- `getPreferences falls back to empty arrays when fields are missing (migration)`
  Confirms older preference files that lack `dietary` or `avoid` do not break the reader.

- `getPreferences falls back to default budget when field is missing`
  Confirms partial preference files are handled gracefully.

- `getPreferences returns defaults when file is corrupted JSON`
  Confirms a corrupted file is treated as "no preferences", not a crash.

- `overwriting preferences replaces previous values`
  Confirms a second save completely replaces the first.

If this suite fails, it usually means the preference schema changed or the migration fallbacks were removed.

---

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

---

### `src/mock/swiggy-api.test.ts`

This suite verifies the Instamart mock API layer used before real Swiggy integrations exist.

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

#### `Instamart: yourGoToItems`

- `should return default go-to items`
  Confirms the go-to items endpoint returns the expected hardcoded product IDs (bev_009, etc.).

#### `Food API`

- `should search restaurants`
  Confirms empty query returns all restaurants and a keyword query filters correctly.

- `should get restaurant menu`
  Confirms the menu for a valid restaurant ID is returned with IDs on each item.

- `should fetch food coupons`
  Confirms the coupon list for a restaurant is returned (may be empty or non-empty depending on restaurant).

If this suite fails, it usually means cart mutation, credits math, or checkout validation drifted from the intended mock behavior.

---

### `src/mock/food-api.test.ts`

This suite covers the Food API functions that power the LangChain copilot agent: `addFoodToCart`, `applyFoodCoupon`, and `placeFoodOrder`.

#### `Food API — addFoodToCart`

- `creates a new food cart when adding to an empty state`
  Confirms first-add creates the foodCart with correct restaurant ID, item, subtotal, and zero discount.

- `accumulates quantity when adding the same menu item twice`
  Confirms duplicate adds merge into the same cart line rather than creating a new entry.

- `adds multiple different items to the same restaurant cart`
  Confirms a cart can hold items from the same restaurant and subtotal is accurate.

- `clears the cart when switching to a different restaurant`
  Confirms the one-restaurant-per-cart rule: adding from a new restaurant automatically discards the old cart.

- `throws when restaurant does not exist`
  Confirms invalid restaurant IDs throw a descriptive error.

- `throws when menu item does not exist at the restaurant`
  Confirms invalid menu item IDs throw a descriptive error.

- `persists the food cart to state after adding`
  Confirms `addFoodToCart` writes the updated foodCart to `state.json`.

#### `Food API — applyFoodCoupon`

- `applies a valid coupon and updates cart discount + total`
  Confirms PUNJAB50 reduces the total by ₹50 when the cart meets the minimum order value.

- `coupon codes are case-insensitive`
  Confirms both `PUNJAB50` and `punjab50` are accepted.

- `throws when coupon code is invalid`
  Confirms unknown codes throw "Invalid coupon code".

- `throws when cart total is below coupon minimum order value`
  Confirms under-minimum carts are rejected with a clear minimum-value message.

- `throws when the food cart is empty`
  Confirms coupons cannot be applied to an empty food cart.

- `applies a zero-minimum coupon successfully`
  Confirms PIZZA20 (which has `minOrderValue: 0`) works on any non-empty cart.

- `persists the updated discount and coupon code to state`
  Confirms `applyFoodCoupon` writes the coupon and discount to `state.json`.

#### `Food API — placeFoodOrder`

- `places a food order successfully and returns an OrderResult`
  Confirms the happy path: returns a valid order ID, correct subtotal, ₹40 delivery fee, and 30-min ETA.

- `deducts the grand total (subtotal + ₹40 delivery) from credits`
  Confirms credits are reduced by exactly `subtotal + 40` after order placement.

- `clears the food cart after a successful order`
  Confirms `state.foodCart` is `null` after a successful order.

- `adds the completed food order to order history`
  Confirms the order appears in `state.orders` with the food order ID format and the correct item names.

- `throws when the food cart is empty`
  Confirms guard clause is enforced.

- `throws when credits are insufficient for the food order`
  Confirms orders cannot be placed when credits would go negative.

- `applies coupon discount before charging credits`
  Confirms the coupon discount is honoured in the grand total charged to credits.

If this suite fails, it usually means the Food API cart logic, coupon math, or order-placement flow changed.

---

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

---

### `src/commands/track.test.ts`

This suite verifies the UX behavior of `tenmin track` itself rather than the mock delivery-state math.

- `stops live tracking when the user presses "q"`
  Confirms the command stops the spinner, removes its input listener, restores terminal raw mode, and prints the dismissal hint when the user presses `q`.

- `stops live tracking when the user presses Enter`
  Confirms the same quick-exit behavior works for Enter, which is the more discoverable key for users who just want their prompt back.

If this suite fails, it usually means the track command no longer exits cleanly after user input or it is leaving terminal state behind.

---

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

---

### `src/lib/context.test.ts`

This suite verifies `buildContext` and `formatContextForPrompt`, which assemble the situational context passed to Gemini in every `tenmin ask` invocation.

#### `buildContext`

- `returns a valid context shape with all required fields`
  Confirms the returned object has `timeOfDay`, `dayOfWeek`, `recentItems`, and `preferences` fields.

- `timeOfDay is one of the four valid time slots`
  Confirms the function maps the current hour to one of `morning`, `lunch`, `evening`, or `night`.

- `dayOfWeek is a non-empty string`
  Confirms the day-of-week field is always populated.

- `recentItems is empty when there are no orders`
  Confirms first-run behavior: no history → no recent items.

- `recentItems pulls from the latest 3 orders`
  Confirms the function only looks back at the 3 most recent orders, ignoring older history.

- `recentItems deduplicates the same item appearing across multiple orders`
  Confirms an item that appears in two different orders is listed only once.

- `recentItems deduplication is case-insensitive`
  Confirms `"Diet Coke"` and `"diet coke"` are treated as the same item.

- `preferences defaults are correct when no preferences file exists`
  Confirms `buildContext()` works without a preferences file and returns the zero-state defaults.

#### `formatContextForPrompt`

- `always includes time information`
  Confirms the formatted prompt always begins with a `Time:` line.

- `includes default budget when set`
  Confirms the budget value appears with ₹ formatting.

- `includes dietary restrictions when present`
  Confirms non-empty dietary arrays are rendered as a comma-separated list.

- `includes avoid list when present`
  Confirms non-empty avoid arrays are rendered.

- `omits dietary/avoid lines when those arrays are empty`
  Confirms the prompt is not cluttered with empty labels.

- `shows "nothing yet" for recent items when order history is empty`
  Confirms the prompt always has a `Recently ordered:` line even for new users.

- `shows comma-separated recent items when present`
  Confirms items appear in the order they were deduped.

- `returns a multi-line string`
  Confirms the output has at least two lines.

If this suite fails, it usually means the context shape changed or the prompt formatting drifted.

---

### `src/agent/tools.test.ts`

This suite verifies all 10 LangChain tools exported from `src/agent/tools.ts`. The underlying Swiggy API functions are mocked so these tests run instantly without delays.

#### `allTools export`

- `contains exactly 10 tools`
  Confirms no tools were accidentally added or removed from the `allTools` array.

- `every tool has a non-empty name and description`
  Confirms every tool is correctly annotated for the agent.

#### Food API tools

Tests for `searchRestaurantsTool`, `getRestaurantMenuTool`, `fetchFoodCouponsTool`, `applyFoodCouponTool`, `addFoodToCartTool`, `placeFoodOrderTool`:

Each tool has two tests:
1. **Success path** — the mock returns a value, the tool returns the correctly formatted string (JSON or a human-readable confirmation with ₹ amounts and order IDs).
2. **Error path** — the mock throws an Error, the tool returns a string matching `Error: <message>` instead of propagating the throw.

#### Instamart tools

Tests for `searchProductsTool`, `yourGoToItemsTool`, `addToInstamartCartTool`, `checkoutInstamartTool` follow the same pattern: one success test and one error test each.

If this suite fails, it usually means a tool's invoke signature changed, the error-handling wrapper was removed, or the tool was removed from `allTools`.

---

### `src/ui/themes.test.ts`

This suite verifies the theme registry, `getTheme` lookup, and the structural completeness of all five themes.

#### `Theme registry — THEME_NAMES`

- `exports exactly 5 themes`
  Confirms no theme was added or removed without updating the registry.

- `contains all expected theme identifiers`
  Confirms `default`, `light`, `dark`, `cyberpunk`, and `ocean` are all present.

- `THEMES record has an entry for every name in THEME_NAMES`
  Confirms the `THEMES` map is consistent with the `THEME_NAMES` array.

#### `getTheme`

- `returns the correct theme object for each registered name`
  Confirms `getTheme(name).name === name` for all five themes.

- `falls back to the default theme for an unknown name`
  Confirms `getTheme('nonexistent')` returns the `default` theme rather than `undefined`.

- `returns a non-empty label for every theme`
  Confirms the label string (shown in `tenmin theme` picker) is populated.

- `returns a non-empty description for every theme`
  Confirms the description string is populated.

#### `Theme interface completeness`

For each of the 5 themes:

- `has all required color roles`
  Confirms every color key defined in the `Theme` interface (`brand`, `brandText`, `success`, `error`, etc.) is present and non-empty.

- `has all required icon keys`
  Confirms every icon key (`cart`, `credits`, `order`, `success`, etc.) is present and non-empty.

#### Theme-specific value tests

- Default theme brand color is the Swiggy-inspired `#FF5722`.
- Cyberpunk theme brand color is the neon `#FF0080`.

If this suite fails, it usually means a new theme was added without all required fields, a color/icon key was renamed, or a theme was accidentally set to an empty string.

---

## Notes for future contributors

- When adding persistence features, keep the mocked-home-directory pattern. It prevents tests from polluting real user state.
- When evolving the state shape, add migration-oriented tests like the `savedLists` compatibility case.
- When adding CLI features, prefer separating pure computation from terminal rendering. The budget tests are a good example of how that makes logic easier to verify.
- When adding new LangChain tools to `tools.ts`, add them to `allTools` and add corresponding success + error tests to `tools.test.ts`.
- When adding a new theme, add it to `THEME_NAMES` and verify the completeness tests still pass — they will catch any missing color or icon keys automatically.
