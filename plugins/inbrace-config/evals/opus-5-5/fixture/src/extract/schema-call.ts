import Anthropic from "@anthropic-ai/sdk";
import { client, MODEL } from "../lib/anthropic.js";

// Reads the parties block of a contract into a schema-valid record.
const PARTIES_TOOL: Anthropic.Tool = {
  name: "record_parties",
  description: "Record the parties of the contract. Call it once, with every party.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      parties: {
        type: "array",
        items: {
          type: "object",
          properties: {
            legal_name: { type: "string" },
            role: { type: "string", enum: ["buyer", "vendor", "guarantor"] },
          },
          required: ["legal_name", "role"],
          additionalProperties: false,
        },
      },
    },
    required: ["parties"],
    additionalProperties: false,
  },
};

export async function extractParties(partiesBlock: string) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: "You read the parties block of vendor contracts. Always answer by calling record_parties.",
    tools: [PARTIES_TOOL],
    tool_choice: { type: "auto" },
    messages: [{ role: "user", content: partiesBlock }],
  });

  const call = response.content.find((block) => block.type === "tool_use" && block.name === "record_parties");
  if (!call || call.type !== "tool_use") throw new Error("record_parties was not called");
  return call.input as { parties: { legal_name: string; role: string }[] };
}
