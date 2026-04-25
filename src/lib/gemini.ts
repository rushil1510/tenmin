// ─────────────────────────────────────────────
// Tenmin — Gemini grocery intent parser
// Converts a plain-English request into a list
// of Swiggy search terms. Returns [] for anything
// that isn't a food/grocery request.
// ─────────────────────────────────────────────

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are a grocery search assistant for Swiggy Instamart India.
Your only job is to convert food or grocery requests into short search terms.
Rules:
- Return ONLY a JSON array of strings (search terms).
- Keep each term short and searchable — 1 to 3 words.
- If the request is not about food, drinks, groceries, or cooking, return an empty array [].
- Do not explain anything. No extra text. Only the JSON array.`;

export async function parseGroceryIntent(query: string, apiKey: string): Promise<string[]> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: query }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: { type: 'string' },
        },
        temperature: 0.1,
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
    return parsed.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);
  } catch {
    return [];
  }
}
