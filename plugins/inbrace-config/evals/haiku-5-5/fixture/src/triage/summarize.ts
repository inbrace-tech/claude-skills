import { client, FAST_MODEL } from "../lib/claude.js";

const SUMMARY_PROMPT = "Summarize the ticket thread for the agent who picks it up next.";

/** Rough token estimate: four characters per token. */
const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

/** Summarizes a long ticket thread, caching the thread when it is large enough to cache. */
export async function summarizeThread(thread: string): Promise<string> {
  const cacheable = estimateTokens(thread) >= 4096;
  const response = await client.messages.create({
    model: FAST_MODEL,
    max_tokens: 8000,
    thinking: { type: "enabled", budget_tokens: 2048 },
    system: SUMMARY_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          cacheable
            ? { type: "text", text: thread, cache_control: { type: "ephemeral" } }
            : { type: "text", text: thread },
        ],
      },
    ],
  });

  return response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("\n");
}
