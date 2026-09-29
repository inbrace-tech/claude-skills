import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaMessage,
  MessageCreateParamsNonStreaming as BetaParams,
} from "@anthropic-ai/sdk/resources/beta/messages";
import type { Message, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";

export const MODEL = "claude-sonnet-5";
export const ESCALATION_MODEL = "claude-opus-5-5";

export const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class RefusalError extends Error {
  constructor(readonly category: string | undefined) {
    super(`Request declined (${category ?? "no category"})`);
  }
}

function refusalCategory(res: { stop_details?: { category?: string } }): string | undefined {
  return res.stop_details?.category;
}

export async function createMessage(params: MessageCreateParamsNonStreaming): Promise<Message> {
  const res = await client.messages.create(params);
  if (res.stop_reason === "refusal") {
    throw new RefusalError(refusalCategory(res as never));
  }
  return res;
}

export async function streamBetaMessage(params: BetaParams): Promise<BetaMessage> {
  const res = await client.beta.messages.stream(params).finalMessage();
  if (res.stop_reason === "refusal") {
    throw new RefusalError(refusalCategory(res as never));
  }
  return res;
}
