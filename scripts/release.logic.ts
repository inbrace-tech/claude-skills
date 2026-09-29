// The pure rules behind release.ts: environment and tag lists in, environment and tag lists out.

/** An environment as `process.env` holds it. */
export type Env = Readonly<Record<string, string | undefined>>;

/**
 * The environment with `tag.gpgSign=true` appended through git's `GIT_CONFIG_*` variables, so every
 * tag the child creates is signed without touching any git config file. Entries already there are kept.
 */
export function signedTagEnv(env: Env): Record<string, string | undefined> {
  const count = Number.parseInt(env["GIT_CONFIG_COUNT"] ?? "0", 10);
  const index = Number.isNaN(count) || count < 0 ? 0 : count;
  return {
    ...env,
    GIT_CONFIG_COUNT: String(index + 1),
    [`GIT_CONFIG_KEY_${index}`]: "tag.gpgSign",
    [`GIT_CONFIG_VALUE_${index}`]: "true",
  };
}

/** Tags present after a run and not before it, in the order `after` lists them. */
export function newTags(before: readonly string[], after: readonly string[]): string[] {
  const seen = new Set(before);
  return after.filter((tag) => tag !== "" && !seen.has(tag));
}
