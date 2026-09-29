import { execFile } from "node:child_process";
import { promisify } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { client, MODEL } from "../lib/anthropic.js";

const run = promisify(execFile);

// The headless browser in the service's container (display :1, 1280x800).
async function screenshot(): Promise<string> {
  const { stdout } = await run("xdotool-shot", ["--display", ":1", "--base64"]);
  return stdout.trim();
}

async function perform(action: unknown): Promise<void> {
  await run("xdotool-act", ["--display", ":1", "--json", JSON.stringify(action)]);
}

// Downloads the signed PDF from a vendor's own portal when the vendor will not email it.
// Runs against the Claude API from the service's container.
export async function fetchSignedCopy(portalUrl: string, contractRef: string) {
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: `Log in at ${portalUrl} with the stored credentials and download the signed copy of ${contractRef}.` },
  ];

  for (let step = 0; step < 40; step++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ["computer-use-2025-11-24"],
      tools: [{ type: "computer_20251124", name: "computer", display_width_px: 1280, display_height_px: 800 }],
      messages,
    });

    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason !== "tool_use") return;

    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      await perform(block.input);
      results.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: [{ type: "image", source: { type: "base64", media_type: "image/png", data: await screenshot() } }],
      });
    }
    messages.push({ role: "user", content: results });
  }
}
