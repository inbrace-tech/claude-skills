// The pure rules behind release.ts: git state, environment and tag lists in, decisions out.

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

/** Which release step is about to run: `version` consumes changesets, `tag` tags what a merged version pull request set. */
export type Stage = "version" | "tag";

/** What a release step saw before changing anything. */
export interface ReleaseState {
  /** `git status --porcelain`. */
  porcelain: string;
  /** `git rev-parse HEAD` and `git rev-parse origin/main`, after fetching origin. */
  head: string;
  originMain: string;
  /** Pending changeset file names in `.changeset/`. */
  pendingChangesets: readonly string[];
}

/**
 * Why `stage` must not start, each saying what it saw; empty when the checkout is an up-to-date,
 * clean `main` with changesets to consume (`version`) or none left (`tag`).
 */
export function releasePreconditions(stage: Stage, { porcelain, head, originMain, pendingChangesets }: ReleaseState): string[] {
  const errors: string[] = [];
  if (porcelain.trim() !== "") errors.push(`the working tree has changes:\n${porcelain.trimEnd()}\nrun it on a clean checkout`);
  if (head !== originMain) {
    const why = stage === "tag" ? "a tag names the merged commit" : "the version pull request starts from the latest main";
    errors.push(`HEAD is ${head} but origin/main is ${originMain}; ${why}, so check out origin/main`);
  }
  if (stage === "tag" && pendingChangesets.length > 0) {
    errors.push(`pending changesets in .changeset/ (${pendingChangesets.join(", ")}): the version pull request that consumes them is not merged yet`);
  }
  if (stage === "version" && pendingChangesets.length === 0) errors.push("no pending changeset in .changeset/: there is nothing to release");
  return errors;
}

/** The tag Changesets gives a workspace package's version (not the `v<version>` of a single-package repository). */
export const releaseTag = (name: string, version: string): string => `${name}@${version}`;

/** Tag names in `git ls-remote --tags` output, peeled `^{}` lines folded into their tag. */
export function lsRemoteTags(output: string): Set<string> {
  const tags = new Set<string>();
  for (const line of output.split("\n")) {
    const ref = line.split("\t")[1]?.trim();
    if (ref?.startsWith("refs/tags/") === true) tags.add(ref.slice("refs/tags/".length).replace(/\^\{\}$/, ""));
  }
  return tags;
}

/** What `release tag` does with each expected tag. */
export interface TagPlan {
  /** On origin already: fetch it and check it is annotated and signed. */
  published: string[];
  /** Local only: verify its signature, then push it. A failed earlier push lands here again. */
  push: string[];
  /** Neither local nor on origin after `changeset git-tag`: something went wrong creating it. */
  missing: string[];
}

/** Sorts every expected tag by where it is; nothing is left to do only when all are `published`. */
export function planTags(expected: readonly string[], remote: ReadonlySet<string>, local: ReadonlySet<string>): TagPlan {
  const plan: TagPlan = { published: [], push: [], missing: [] };
  for (const tag of expected) {
    if (remote.has(tag)) plan.published.push(tag);
    else if (local.has(tag)) plan.push.push(tag);
    else plan.missing.push(tag);
  }
  return plan;
}
