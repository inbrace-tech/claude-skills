import type { BetaMessageParam, BetaToolResultBlockParam } from "@anthropic-ai/sdk/resources/beta/messages";
import { MODEL, streamBetaMessage } from "../lib/claude.js";
import { performAction } from "./vnc.js";

const PORTAL = process.env.BILLING_ADMIN_URL ?? "https://billing-admin.example.com";

/**
 * Reads a customer's invoice history from the legacy billing admin portal, which has no API.
 * Runs against the portal's read-only support role.
 */
export async function readInvoiceHistory(accountId: string): Promise<string> {
  const messages: BetaMessageParam[] = [
    {
      role: "user",
      content: `Open ${PORTAL}/accounts/${accountId}/invoices and list every invoice with its date, amount and status. Do not click any button that changes the account.`,
    },
  ];

  for (let step = 0; step < 30; step++) {
    const res = await streamBetaMessage({
      model: MODEL,
      max_tokens: 32000,
      betas: ["computer-use-2025-11-24", "fine-grained-tool-streaming-2025-05-14"],
      tools: [{ type: "computer_20251124", name: "computer", display_width_px: 1440, display_height_px: 900 }],
      tool_choice: { type: "auto" },
      thinking: { type: "adaptive" },
      messages,
    });
    messages.push({ role: "assistant", content: res.content });

    if (res.stop_reason !== "tool_use") {
      return res.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
    }

    const results: BetaToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      results.push({ type: "tool_result", tool_use_id: block.id, content: await performAction(block.input) });
    }
    messages.push({ role: "user", content: results });
  }
  throw new Error(`invoice history for ${accountId} not read within 30 steps`);
}
