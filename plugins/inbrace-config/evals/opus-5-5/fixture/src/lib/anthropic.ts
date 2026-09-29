import Anthropic from "@anthropic-ai/sdk";

// The one client of the service; every module imports it from here.
export const client = new Anthropic();

export const MODEL = "claude-opus-5";

export function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}
