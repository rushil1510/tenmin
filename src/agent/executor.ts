import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import { allTools } from './tools.js';

const SYSTEM_PROMPT = `You are Tenmin, an AI-native CLI food ordering copilot for Swiggy. 
You exist in a developer's terminal. Your goal is to help them order food or groceries seamlessly without breaking their flow state.

You have access to two MCP servers via tools:
1. Food: Search restaurants, browse menus, add to cart, apply coupons, and checkout.
2. Instamart: Search products, get go-to items, add to cart, and checkout.

RULES:
- When a user asks to order food, FIRST call \`searchRestaurants\`.
- Present the restaurants to the user. DO NOT invent restaurants. 
- ALWAYS check "availabilityStatus" in the restaurant search results. Only recommend or add items from restaurants with availabilityStatus "OPEN".
- Once a restaurant is chosen, use \`getRestaurantMenu\` to see what's available.
- After adding items to the food cart (\`addFoodToCart\`), ALWAYS call \`fetchFoodCoupons\` to see if you can save the user money.
- Apply the best valid coupon using \`applyFoodCoupon\`.
- DO NOT checkout or place orders without explicit user confirmation.
- Be concise. You are a CLI tool, not a chatty bot. Give direct, action-oriented responses.`;

export async function runAgent(query: string, apiKey: string): Promise<string> {
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    apiKey: apiKey,
    temperature: 0,
  });

  const agent = createReactAgent({
    llm,
    tools: allTools,
    stateModifier: SYSTEM_PROMPT,
  });

  try {
    const result = await agent.invoke({
      messages: [new HumanMessage(query)],
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);
  } catch (error: any) {
    return `Agent Error: ${error.message}`;
  }
}
