import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { MODEL, createMessage } from "../lib/claude.js";

const CLASSIFY_TOOL: Tool = {
  name: "record_classification",
  description: "Record the ticket's category and priority.",
  input_schema: {
    type: "object",
    properties: {
      category: { type: "string", enum: ["billing", "bug", "how-to", "account", "other"] },
      priority: { type: "string", enum: ["p1", "p2", "p3"] },
    },
    required: ["category", "priority"],
    additionalProperties: false,
  },
};

const CLASSIFY_SYSTEM = `Classify the support ticket.
p1: the customer cannot use the product at all, or was charged in error.
p2: a feature is broken or a billing question blocks a purchase.
p3: everything else.`;

export async function classifyTicket(subject: string, body: string) {
  const res = await createMessage({
    model: MODEL,
    max_tokens: 512,
    temperature: 0,
    system: CLASSIFY_SYSTEM,
    tools: [CLASSIFY_TOOL],
    tool_choice: { type: "tool", name: "record_classification" },
    messages: [{ role: "user", content: `Subject: ${subject}\n\n${body}` }],
  });
  const call = res.content.find((block) => block.type === "tool_use");
  if (!call || call.type !== "tool_use") throw new Error("classification missing from the response");
  return call.input as { category: string; priority: string };
}
