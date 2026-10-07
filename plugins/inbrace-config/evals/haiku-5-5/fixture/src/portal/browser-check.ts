import { client, FAST_MODEL } from "../lib/claude.js";

/** Asks the model to click through the help page in a sandboxed browser and report what breaks. */
export async function checkHelpPage(screenshot: string): Promise<unknown> {
  return client.beta.messages.create({
    model: FAST_MODEL,
    max_tokens: 4096,
    betas: ["computer-use-2025-01-24"],
    tools: [{ type: "computer_20250124", name: "computer", display_width_px: 1280, display_height_px: 800 }],
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: screenshot } },
          { type: "text", text: "Open the help page, try the search box, and report anything that fails." },
        ],
      },
    ],
  });
}
