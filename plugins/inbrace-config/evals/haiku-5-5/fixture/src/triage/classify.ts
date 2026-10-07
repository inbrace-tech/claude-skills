import { client, FAST_MODEL } from "../lib/claude.js";

export type Sentiment = "positive" | "neutral" | "negative";

const SYSTEM = "You classify the sentiment of a help-desk ticket. Answer with one word.";

/** Classifies one ticket's sentiment. */
export async function classifySentiment(ticket: string): Promise<Sentiment> {
  const response = await client.messages.create({
    model: FAST_MODEL,
    max_tokens: 5,
    temperature: 0,
    system: SYSTEM,
    messages: [
      { role: "user", content: ticket },
      { role: "assistant", content: "Sentiment:" },
    ],
  });

  const first = response.content[0];
  const word = first.type === "text" ? first.text.trim().toLowerCase() : "neutral";
  return (["positive", "neutral", "negative"].includes(word) ? word : "neutral") as Sentiment;
}
