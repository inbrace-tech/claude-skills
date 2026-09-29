import Anthropic from "@anthropic-ai/sdk";
import { client, MODEL } from "../lib/anthropic.js";

const LABEL_TOOL: Anthropic.Tool = {
  name: "set_intake_label",
  description: "Record the intake label and priority of a new contract.",
  input_schema: {
    type: "object",
    properties: {
      label: { type: "string", enum: ["nda", "msa", "sow", "renewal", "amendment", "other"] },
      priority: { type: "string", enum: ["low", "normal", "urgent"] },
    },
    required: ["label", "priority"],
  },
};

export async function classifyIntake(coverSheet: string) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    thinking: { type: "disabled" },
    system: "You label incoming vendor contracts for the procurement intake queue.",
    output_config: { effort: "low" },
    tools: [LABEL_TOOL],
    tool_choice: { type: "tool", name: "set_intake_label" },
    messages: [{ role: "user", content: coverSheet }],
  });

  const call = response.content.find((block) => block.type === "tool_use");
  if (!call) throw new Error("intake label missing");
  return call.input as { label: string; priority: string };
}
