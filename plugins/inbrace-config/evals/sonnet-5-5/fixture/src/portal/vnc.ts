import type { BetaToolResultBlockParam } from "@anthropic-ai/sdk/resources/beta/messages";

const VNC_BRIDGE = process.env.VNC_BRIDGE_URL ?? "http://127.0.0.1:6080";

/** Forwards one computer-use action to the headless browser bridge and returns its result blocks. */
export async function performAction(input: unknown): Promise<BetaToolResultBlockParam["content"]> {
  const res = await fetch(`${VNC_BRIDGE}/action`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return [{ type: "text", text: `action failed: ${res.status}` }];
  return (await res.json()) as BetaToolResultBlockParam["content"];
}
