import Anthropic from "@anthropic-ai/sdk";

export const client = new Anthropic();

/** The model every bulk call uses. */
export const FAST_MODEL = "claude-haiku-4-5";

/** The model for planning and long replies. */
export const DEEP_MODEL = "claude-opus-5-5";
