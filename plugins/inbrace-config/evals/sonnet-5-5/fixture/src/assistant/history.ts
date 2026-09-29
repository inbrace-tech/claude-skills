import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { ESCALATION_MODEL, createMessage } from "../lib/claude.js";

export type SavedTurn =
  | { kind: "message"; role: "user" | "assistant"; content: string }
  | {
      kind: "tool";
      toolUseId: string;
      /** Tool output exactly as captured: stdout and stderr, terminal colour codes and debug lines included. */
      rawLog: string;
    };

const ESCALATION_SYSTEM = `You are the senior support reviewer. The conversation below is a draft the assistant could not finish.
Decide what the reply should say, list what the agent on shift must check before sending it, and flag anything that needs a supervisor.`;

/** Rebuilds a conversation after the agent's browser reconnects. */
export function resumeConversation(saved: SavedTurn[]): MessageParam[] {
  const messages: MessageParam[] = saved.map((turn) =>
    turn.kind === "tool"
      ? { role: "user", content: [{ type: "tool_result", tool_use_id: turn.toolUseId, content: turn.rawLog }] }
      : { role: turn.role, content: turn.content },
  );
  // Re-anchor the model on the ticket before the agent's next message.
  messages.push({
    role: "assistant",
    content: "I have the ticket and the customer's account open and will continue from here.",
  });
  return messages;
}

/** Hands a conversation the assistant could not resolve to the senior reviewer model. */
export async function escalate(messages: MessageParam[]) {
  return createMessage({
    model: ESCALATION_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: ESCALATION_SYSTEM,
    messages,
  });
}
