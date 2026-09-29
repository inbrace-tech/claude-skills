import { MODEL, createMessage } from "../lib/claude.js";
import type { TicketLike } from "../tickets/types.js";
import { CONTRACT_RULES } from "./contract-rules.js";

const SLA_SYSTEM = `You compute the first-response deadline for a support ticket under the customer's contract.
Apply the rules below in order: plan tier, business hours in the customer's time zone, holidays, reopen rule, escalation credit.

${CONTRACT_RULES}

Reply with a JSON object: {"deadline": "<ISO 8601>", "rule_applied": "<rule id>", "business_hours_counted": <number>}`;

export interface SlaEstimate {
  deadline: string;
  rule_applied: string;
  business_hours_counted: number;
}

export async function estimateDeadline(ticket: TicketLike): Promise<SlaEstimate> {
  const res = await createMessage({
    model: MODEL,
    max_tokens: 2048,
    output_config: { effort: "low" },
    system: SLA_SYSTEM,
    messages: [{ role: "user", content: JSON.stringify(ticket) }],
  });
  const text = res.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as SlaEstimate;
}
