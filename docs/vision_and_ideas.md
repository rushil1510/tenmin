# Tenmin: Vision and Future Ideas

This document distills the remaining unbuilt concepts from our initial product vision (`application.md`). These features represent the roadmap to evolve Tenmin from an MVP CLI tool into a fully context-aware, proactive ordering copilot for developers.

## 1. Advanced AI & Smart Recommendations
- **Context-Aware Suggestions:** The AI agent should proactively suggest orders based on the time of day, current weather, and the user's historical order patterns (e.g., suggesting a hot coffee on a cold morning or reordering a favorite lunch at 1 PM).
- **Dietary & Nutritional Filtering:** Automatically respect strict calorie, macro, and dietary preferences (e.g., vegan, gluten-free) seamlessly when executing `tenmin ask` without the user needing to specify them every time.

## 2. Expanded Workflow Capabilities (Beyond the Individual)
- **Team Mode (Group Orders):** Integrate with Slack or Discord to collect lunch orders from an entire development team in a channel, optimize the cart, and place a single group order.
- **Pomodoro/Focus Integration:** Connect with focus timers (or system state) to prompt or automatically place food orders right before a focus session begins.
- **Calendar Awareness:** Read the developer's calendar to pre-schedule or suggest lunch deliveries precisely during meeting gaps to avoid interruptions.

## 3. Deep IDE Integrations (Phase 4)
- **Claude Code MCP Tool Server:** Expose Tenmin's capabilities as an active MCP server, allowing native copilots (like Claude Code) to invoke it directly within terminal chats.
- **VS Code & Cursor Extensions:** Build native extensions providing a sidebar widget, command palette actions, and seamless editor immersion.
- **Slash Commands:** Support native slash commands (e.g., `/order`, `/track`, `/reorder`) directly in the IDE chat interfaces.

## 4. MCP Platform Integration & Real Auth
- **Real Swiggy API Switch:** Swap out the current `src/mock/swiggy-api.ts` mock implementation for the live Swiggy Food and Instamart MCP servers once official API access is granted by the Builders Club.
- **OAuth 2.0 PKCE Flow:** Implement secure, real-world OAuth flow spinning up a local callback server (`http://localhost:9876/callback`) to securely persist Swiggy tokens in the OS keychain.

## 5. Granular Quality of Life Features
- **Out-of-Stock Watchers:** Implement a `tenmin watch <item>` command to notify developers via desktop notification when a highly-desired item comes back in stock.
