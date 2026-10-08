// List prices in USD per million tokens, used by the nightly cost report.
export interface Rate {
  input: number;
  output: number;
  cacheRead: number;
}

export const PRICES: Record<string, Rate> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheRead: 0.1 },
};

/** The rate for a model id, matching a dated id by its undated stem. */
export function rateFor(model: string): Rate | undefined {
  return PRICES[model] ?? PRICES[model.replace(/-\d{8}$/, "")];
}
