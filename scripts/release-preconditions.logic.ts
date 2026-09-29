// The preconditions both release steps check before changing anything: git state in, reasons to
// refuse out. release-version.ts and release-tag.ts fetch origin, read the state through
// readReleaseState and refuse on any reason releasePreconditions returns.

import { isChangesetFile } from "./check-changeset-size.logic.ts";

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

/** Runs git with these arguments and returns its standard output. */
export type GitReader = (args: string[]) => string;

/** The state from git, after the caller fetched origin, and the entries of `.changeset/` (empty when it is missing). */
export function readReleaseState(git: GitReader, changesetEntries: readonly string[]): ReleaseState {
  return {
    porcelain: git(["status", "--porcelain"]),
    head: git(["rev-parse", "HEAD"]).trim(),
    originMain: git(["rev-parse", "origin/main"]).trim(),
    pendingChangesets: changesetEntries.filter(isChangesetFile),
  };
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

/** The refusal message for `stage`, one reason per line; null when there is none. */
export function refusal(stage: Stage, errors: readonly string[]): string | null {
  return errors.length === 0 ? null : `not running \`${stage}\`:\n${errors.map((error) => `- ${error}`).join("\n")}`;
}
