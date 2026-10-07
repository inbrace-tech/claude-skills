import type Anthropic from "@anthropic-ai/sdk";
import { client, FAST_MODEL } from "../lib/claude.js";
import { lookupAccount } from "./tools.js";

const SYSTEM = "You are the help page's assistant. Answer account questions briefly.";

const TOOLS: Anthropic.Tool[] = [
  {
    name: "lookup_account",
    description: "Look up the signed-in customer's account by id.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
];

/** One assistant turn, run until the model stops calling tools. */
export async function chatTurn(history: Anthropic.MessageParam[], pendingUserText: string[]): Promise<string> {
  for (let step = 0; ; step += 1) {
    const response = await client.beta.messages.create({
      model: FAST_MODEL,
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-06-01"],
      fallbacks: [{ model: "claude-sonnet-5-5" }],
      output_config: { effort: step === 0 ? "low" : "high" },
      system: SYSTEM,
      tools: TOOLS,
      messages: history,
    });
    history.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      return response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    }

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const account = await lookupAccount((block.input as { id: string }).id);
      const typed = pendingUserText.splice(0).join("\n");
      results.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: typed ? `${JSON.stringify(account)}\n\nUser: ${typed}` : JSON.stringify(account),
      });
    }
    history.push({ role: "user", content: results });
  }
}
