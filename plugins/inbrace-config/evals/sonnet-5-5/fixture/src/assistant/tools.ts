import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import type { Ticket } from "../tickets/types.js";
import { helpdesk } from "../helpdesk/client.js";

export const BASE_TOOLS: Tool[] = [
  {
    name: "read_thread",
    description: "Read every message in the current ticket's thread, oldest first.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "search_kb",
    description: "Search the help-center articles. Returns titles, anchors and excerpts.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
      additionalProperties: false,
    },
  },
];

export const REFUND_LOOKUP_TOOL: Tool = {
  name: "lookup_refunds",
  description: "List the refunds and credits already issued on the customer's account.",
  input_schema: { type: "object", properties: {}, additionalProperties: false },
};

type Handler = (input: unknown, ticket: Ticket) => Promise<string>;

export const TOOL_HANDLERS: Record<string, Handler> = {
  read_thread: async (_input, ticket) => JSON.stringify(await helpdesk.thread(ticket.id)),
  search_kb: async (input) => JSON.stringify(await helpdesk.searchKb((input as { query: string }).query)),
  lookup_refunds: async (_input, ticket) => JSON.stringify(await helpdesk.refunds(ticket.customerId)),
};
