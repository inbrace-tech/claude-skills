import { MODEL, createMessage } from "../lib/claude.js";
import { FAQ_ENTRIES } from "../kb/faq.js";

const FAQ_SYSTEM = `Answer the customer's question from the FAQ entries below. If none of them covers it, reply exactly NO_MATCH.

${FAQ_ENTRIES.map((e) => `Q: ${e.q}\nA: ${e.a}`).join("\n\n")}`;

export async function answerFromFaq(question: string): Promise<string | null> {
  const res = await createMessage({
    model: MODEL,
    max_tokens: 600,
    // FAQ answers are lookups; keep them fast.
    thinking: { type: "disabled" },
    system: FAQ_SYSTEM,
    messages: [{ role: "user", content: question }],
  });
  const text = res.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();
  return text === "NO_MATCH" ? null : text;
}
