import { client, FAST_MODEL } from "../lib/claude.js";

const QUEUES = ["billing", "bugs", "accounts", "other"] as const;
export type Queue = (typeof QUEUES)[number];

/** Routes a ticket to a queue, with thinking off: routing is a lookup, and latency matters here. */
export async function routeTicket(ticket: string): Promise<Queue> {
  const response = await client.messages.create({
    model: FAST_MODEL,
    max_tokens: 1024,
    thinking: { type: "disabled" },
    output_config: {
      effort: "low",
      format: {
        type: "json_schema",
        schema: { type: "object", properties: { queue: { enum: [...QUEUES] } }, required: ["queue"] },
      },
    },
    messages: [{ role: "user", content: `Route this ticket to a queue:\n\n${ticket}` }],
  });

  for (const block of response.content) {
    if (block.type === "text") return (JSON.parse(block.text) as { queue: Queue }).queue;
  }
  return "other";
}
