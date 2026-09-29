import Anthropic from "@anthropic-ai/sdk";
import { client } from "../lib/anthropic.js";
import type { ReviewerSocket } from "./redline-loop.js";

// The live view of the Opus 5.5 trial: the risk review streams its progress updates to the reviewer.
const TRIAL_MODEL = "claude-opus-5-5";

export async function streamRiskReview(contractText: string, socket: ReviewerSocket) {
  const stream = client.beta.messages.stream({
    model: TRIAL_MODEL,
    max_tokens: 32000,
    betas: ["thinking-display-updates-2026-08-18"],
    thinking: { type: "adaptive", display: "updates" },
    output_config: { effort: "medium" },
    system: "You review vendor contracts for commercial and legal risk against the procurement risk matrix.",
    messages: [{ role: "user", content: contractText }],
  });

  for await (const event of stream) {
    if (event.type !== "content_block_delta") continue;
    if (event.delta.type === "thinking_delta" && event.delta.thinking) {
      socket.send({ kind: "progress", text: event.delta.thinking });
    } else if (event.delta.type === "text_delta") {
      socket.send({ kind: "progress", text: event.delta.text });
    }
  }

  const final: Anthropic.Beta.BetaMessage = await stream.finalMessage();
  socket.send({ kind: "done", text: final.stop_reason ?? "" });
}
