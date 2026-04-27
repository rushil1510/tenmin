// ─────────────────────────────────────────────
// Tenmin — Gemini grocery intent parser
// Converts a plain-English request into a list
// of Swiggy search terms. Returns [] for anything
// that isn't a food/grocery request.
// ─────────────────────────────────────────────

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

const SYSTEM_PROMPT = `You are a grocery intent parser for Swiggy Instamart India.
Your job is to convert a user's natural-language shopping request into a short JSON array of search terms that will work well in a simple grocery product search.

The search engine is literal. It matches short product-style phrases better than descriptive sentences.
You are not writing recommendations for a human. You are generating search queries for a store catalogue.

Return format:
- Return ONLY a JSON array of strings.
- No markdown, no explanation, no extra keys, no prose.

Core behavior:
- If the request is unrelated to food, drinks, groceries, kitchen staples, or ingredients, return [].
- Produce 1 to 8 search terms.
- Each term should usually be 1 to 3 words. Use 4 words only when needed for a very common grocery phrase.
- Prefer concrete, searchable grocery nouns over abstract ideas.
- Prefer broad product terms that are likely to exist in a grocery catalogue.
- Preserve important modifiers only when they materially change the item: diet coke, basmati rice, greek yogurt, energy drink.
- Avoid overly narrow flavor, brand, recipe, or lifestyle wording unless the user explicitly asked for it.

How to interpret requests:
- For direct product requests, return that item or a close grocery search phrase.
- For meal or recipe requests, return the core ingredients someone would shop for.
- For vague requests like "breakfast essentials" or "healthy snacks", return a small sensible basket of common grocery items, not a full meal plan.
- For budget-sensitive requests, prefer affordable/common items.
- For count/serving-size requests like "for 4", use that only to decide whether multiple ingredients are needed. Do not return quantities.
- If the user asks for something unavailable in groceries, return the nearest grocery equivalent only when it is obvious. Otherwise return [].

Search-term quality rules:
- Good: "milk", "eggs", "bread", "basmati rice", "diet coke", "maggi noodles", "butter", "yogurt"
- Bad: "things for breakfast", "something healthy", "best snacks", "items for a party", "refreshing beverages for guests"
- Bad: "organic farm fresh premium low fat milk" because it is too narrow.

Examples:
- "diet coke" -> ["diet coke"]
- "ingredients for pasta" -> ["pasta", "tomato sauce", "cheese", "butter"]
- "breakfast essentials" -> ["bread", "milk", "eggs", "butter"]
- "healthy snacks under 100" -> ["greek yogurt", "juice", "biscuits"]
- "movie night" -> ["chips", "soft drink", "chocolate"]
- "book me a cab" -> []

Output only the JSON array.`;

// ── Stage 1: Intent extraction ────────────────
// Turns a vague query + context into a structured
// intent object. Gives Stage 2 what it needs.

export interface AskIntent {
  budget: number;
  constraints: string[];
  searchTerms: string[];
}

const INTENT_SYSTEM_PROMPT = `You are a grocery intent parser for Swiggy Instamart India.
Given a user's query and their context, extract their shopping intent.

Return a JSON object with exactly:
- "budget": number — max spend in rupees. Infer from query ("under ₹300", "cheap") or fall back to the default budget in context.
- "constraints": string[] — dietary and vibe constraints. Combine from query and user preferences. Examples: ["vegetarian", "light", "no dairy", "quick"].
- "searchTerms": string[] — 3 to 6 concrete, searchable grocery product terms for Swiggy Instamart. Short (1–3 words), product-style phrases.

Rules for searchTerms:
- Return product types, not meal descriptions.
- Good: "noodles", "juice", "yogurt", "biscuits", "bread", "milk"
- Bad: "something light", "healthy snack ideas", "quick meal"
- Respect constraints when choosing terms (e.g. if vegetarian, don't suggest chicken).
- If the query mentions specific items, include those.`;

export async function parseIntent(
  query: string,
  contextBlock: string,
  apiKey: string,
): Promise<AskIntent> {
  const userMessage = `User query: "${query}"\n\nContext:\n${contextBlock}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: INTENT_SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            budget: { type: 'number' },
            constraints: { type: 'array', items: { type: 'string' } },
            searchTerms: { type: 'array', items: { type: 'string' } },
          },
          required: ['budget', 'constraints', 'searchTerms'],
        },
        temperature: 0,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${body}`);
  }

  const data = await response.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  const parsed = JSON.parse(text) as Partial<AskIntent>;

  return {
    budget: typeof parsed.budget === 'number' && parsed.budget > 0 ? parsed.budget : 300,
    constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
    searchTerms: Array.isArray(parsed.searchTerms)
      ? parsed.searchTerms.filter((t): t is string => typeof t === 'string').slice(0, 6)
      : [],
  };
}

// ── Stage 2: Bundle generation ────────────────
// Takes real products (with IDs + prices) and
// packs them into 2–3 coherent bundles.
// Budget enforcement happens in code after.

export interface Bundle {
  label: string;
  rationale: string;
  productIds: string[];
}

const BUNDLE_SYSTEM_PROMPT = `You are a grocery bundle curator for Swiggy Instamart India.
Given available products and a user's intent, create 2 to 3 distinct, coherent order bundles.

Each bundle should:
- Make sense as a single occasion (one snack, one meal, one drink run — not a mix)
- Stay within the stated budget
- Respect all constraints
- Use product IDs exactly as given — do not invent IDs
- Have 2 to 4 items

Return a JSON array of bundles. Each bundle:
- "label": short name (2–4 words, e.g. "Quick & Light", "Comfort Snack", "Your Usual")
- "rationale": one sentence on why this fits the request
- "productIds": array of product ID strings from the catalogue below

Make the bundles feel different from each other — one fast/cheap, one more satisfying, one based on recent history if relevant.`;

export async function buildBundles(
  intent: AskIntent,
  searchResults: { term: string; products: { id: string; name: string; unit: string; price: number }[] }[],
  recentItems: string[],
  apiKey: string,
): Promise<Bundle[]> {
  // Build the product catalogue block for the prompt
  const catalogueLines: string[] = [];
  for (const { term, products } of searchResults) {
    catalogueLines.push(`[${term}]`);
    for (const p of products.slice(0, 4)) {
      catalogueLines.push(`  ${p.name} (${p.unit})  ₹${p.price}  ID:${p.id}`);
    }
  }

  const userMessage = [
    `Intent: ${intent.constraints.length > 0 ? intent.constraints.join(', ') + ' — ' : ''}${searchResults.map(r => r.term).join(', ')}`,
    `Budget: ₹${intent.budget}`,
    intent.constraints.length > 0 ? `Constraints: ${intent.constraints.join(', ')}` : '',
    recentItems.length > 0 ? `User recently ordered: ${recentItems.join(', ')}` : '',
    '',
    'Available products:',
    catalogueLines.join('\n'),
  ].filter(Boolean).join('\n');

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: BUNDLE_SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              rationale: { type: 'string' },
              productIds: { type: 'array', items: { type: 'string' } },
            },
            required: ['label', 'rationale', 'productIds'],
          },
        },
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${body}`);
  }

  const data = await response.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((b): b is Bundle =>
      typeof b.label === 'string' &&
      typeof b.rationale === 'string' &&
      Array.isArray(b.productIds),
    )
    .slice(0, 3);
}

// ── Original single-stage parser (kept for order command compat) ──

export async function parseGroceryIntent(query: string, apiKey: string): Promise<string[]> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: `User request: ${query}` }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: { type: 'string' },
        },
        temperature: 0,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${body}`);
  }

  const data = await response.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();

    return parsed
      .filter((t): t is string => typeof t === 'string')
      .map((term) => term.trim().replace(/\s+/g, ' ').toLowerCase())
      .filter((term) => term.length > 0 && term.length <= 40)
      .filter((term) => {
        if (seen.has(term)) return false;
        seen.add(term);
        return true;
      })
      .slice(0, 8);
  } catch {
    return [];
  }
}
