// USD per million tokens, for the cost dashboard.
export const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

// Model ids can carry a suffix (a date, a region), so match on the known stem.
export function priceFor(model: string) {
  const stem = Object.keys(PRICES).find((key) => model.startsWith(key));
  if (!stem) throw new Error(`no price for ${model}`);
  return PRICES[stem];
}

export function costUsd(model: string, inputTokens: number, outputTokens: number) {
  const price = priceFor(model);
  return (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
}
