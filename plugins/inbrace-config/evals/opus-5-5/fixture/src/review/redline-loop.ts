import { readFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import { client, MODEL } from "../lib/anthropic.js";

async function playbookPosition(clauseType: string): Promise<string> {
  const positions = JSON.parse(await readFile("playbook/positions.json", "utf8")) as Record<string, string>;
  return positions[clauseType] ?? `No playbook position for ${clauseType}.`;
}

async function detectDocumentType(contractId: string): Promise<string> {
  const meta = JSON.parse(await readFile(`contracts/${contractId}/meta.json`, "utf8")) as { kind: string };
  return meta.kind;
}

export interface ReviewerSocket {
  send(event: { kind: "progress" | "done"; text: string }): void;
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "playbook_position",
    description: "Return the playbook position for a clause type.",
    input_schema: { type: "object", properties: { clause_type: { type: "string" } }, required: ["clause_type"] },
  },
  {
    name: "detect_document_type",
    description: "Classify the contract as a framework agreement, a standalone agreement or an order form.",
    input_schema: { type: "object", properties: { contract_id: { type: "string" } }, required: ["contract_id"] },
  },
];

const BASE_SYSTEM = "You draft redlines on vendor contracts for the reviewer on duty, using the playbook tools.";

// Streams the model's notes to the reviewer's live view while it drafts.
export async function draftRedline(contractId: string, socket: ReviewerSocket) {
  let system = BASE_SYSTEM;
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Draft the redline for contract ${contractId}.` },
  ];

  for (let step = 0; step < 25; step++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system,
      tools: TOOLS,
      messages,
    });

    for (const block of response.content) {
      if (block.type === "text") socket.send({ kind: "progress", text: block.text });
    }

    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "tool_use") break;

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const input = block.input as Record<string, string>;
      if (block.name === "detect_document_type") {
        const docType = await detectDocumentType(input.contract_id);
        if (docType === "framework") {
          system = `${BASE_SYSTEM}\nThis is a framework agreement: apply the framework playbook to every clause.`;
        }
        results.push({ type: "tool_result", tool_use_id: block.id, content: docType });
      } else {
        const position = await playbookPosition(input.clause_type);
        results.push({ type: "tool_result", tool_use_id: block.id, content: position });
      }
    }
    messages.push({ role: "user", content: results });
  }

  socket.send({ kind: "done", text: "" });
}
