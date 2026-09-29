import type { MessageParam, Tool, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";
import type { WebSocket } from "ws";
import { MODEL, createMessage } from "../lib/claude.js";
import type { Ticket } from "../tickets/types.js";
import { buildSystemPrompt } from "./prompts.js";
import { BASE_TOOLS, REFUND_LOOKUP_TOOL, TOOL_HANDLERS } from "./tools.js";

const MAX_STEPS = 12;

export interface LoopState {
  ticket: Ticket;
  messages: MessageParam[];
  /** Messages the customer typed while the assistant was still working. */
  pendingCustomerText: string[];
  /** Set once the agent on shift has verified the customer's identity. */
  refundLookupUnlocked: boolean;
}

export async function runReplyLoop(state: LoopState, socket: WebSocket): Promise<void> {
  for (let step = 0; step < MAX_STEPS; step++) {
    const tools: Tool[] = state.refundLookupUnlocked ? [...BASE_TOOLS, REFUND_LOOKUP_TOOL] : BASE_TOOLS;

    const res = await createMessage({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(state.ticket),
      thinking: { type: "adaptive" },
      // First draft fast; later steps are follow-ups that need more care.
      output_config: { effort: step === 0 ? "low" : "high" },
      tools,
      tool_choice: { type: "auto" },
      messages: state.messages,
    });

    state.messages.push({ role: "assistant", content: res.content });

    for (const block of res.content) {
      if (block.type === "text") {
        socket.send(JSON.stringify({ kind: "draft", text: block.text }));
      }
    }

    if (res.stop_reason !== "tool_use") return;

    const results: ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      const handler = TOOL_HANDLERS[block.name];
      if (!handler) throw new Error(`Unknown tool: ${block.name}`);
      const output = await handler(block.input, state.ticket);
      const customerFollowUps = state.pendingCustomerText.splice(0);
      results.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: [
          { type: "text", text: output },
          ...customerFollowUps.map((text) => ({ type: "text" as const, text: `Customer (new message): ${text}` })),
        ],
      });
    }
    state.messages.push({ role: "user", content: results });
  }
}
