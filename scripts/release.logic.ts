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

/** What `release tag` saw before creating any tag. */
export interface ReleaseState {
  /** `git status --porcelain`. */
  porcelain: string;
  /** `git rev-parse HEAD` and `git rev-parse origin/main`, after fetching origin. */
  head: string;
  originMain: string;
  /** Pending changeset file names in `.changeset/`. */
  pendingChangesets: readonly string[];
}

/** Why tagging must not start, each saying what it saw; empty when the checkout is the merged, versioned `main`. */
export function releasePreconditions({ porcelain, head, originMain, pendingChangesets }: ReleaseState): string[] {
  const errors: string[] = [];
  if (porcelain.trim() !== "") errors.push(`the working tree has changes:\n${porcelain.trimEnd()}\ntag a clean checkout of the merged version pull request`);
  if (head !== originMain) errors.push(`HEAD is ${head} but origin/main is ${originMain}; a tag names the merged commit, so check out origin/main`);
  if (pendingChangesets.length > 0) {
    errors.push(`pending changesets in .changeset/ (${pendingChangesets.join(", ")}): the version pull request that consumes them is not merged yet`);
  }
  return errors;
}
