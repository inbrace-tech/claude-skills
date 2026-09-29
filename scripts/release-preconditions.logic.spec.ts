// Tests for the release preconditions, with strings and a fake git (`pnpm test`). The steps that
// check them run end to end in release-version.spec.ts and release-tag.spec.ts.

import { readReleaseState, refusal, releasePreconditions } from "./release-preconditions.logic.ts";

describe("release preconditions", () => {
  const ready = { porcelain: "", head: "abc", originMain: "abc", pendingChangesets: [] };
  const pending = { ...ready, pendingChangesets: ["brave-owls.md"] };

  it("readReleaseState reads git and keeps only changeset files", () => {
    const answers: Record<string, string> = { "status --porcelain": " M a.ts\n", "rev-parse HEAD": "abc\n", "rev-parse origin/main": "def\n" };
    const git = (args: string[]): string => answers[args.join(" ")] ?? "";
    expect(readReleaseState(git, ["README.md", "config.json", "a.md"])).toEqual({ porcelain: " M a.ts\n", head: "abc", originMain: "def", pendingChangesets: ["a.md"] });
  });

  it("passes tag on a clean origin/main with no pending changeset, version with one", () => {
    expect(releasePreconditions("tag", ready)).toEqual([]);
    expect(releasePreconditions("version", pending)).toEqual([]);
  });

  it("fails a dirty tree, naming what changed", () => {
    expect(releasePreconditions("tag", { ...ready, porcelain: " M a.ts\n" })).toEqual([expect.stringMatching(/working tree has changes:\n M a\.ts\n/)]);
    expect(releasePreconditions("version", { ...pending, porcelain: "?? x\n" })).toEqual([expect.stringMatching(/working tree has changes:\n\?\? x\n/)]);
  });

  it("fails when HEAD is not origin/main, naming both", () => {
    expect(releasePreconditions("tag", { ...ready, head: "def" })).toEqual(["HEAD is def but origin/main is abc; a tag names the merged commit, so check out origin/main"]);
    expect(releasePreconditions("version", { ...pending, head: "def" })).toEqual([expect.stringMatching(/^HEAD is def but origin\/main is abc; the version pull request starts from the latest main/)]);
  });

  it("tag fails on a pending changeset, naming it", () => {
    expect(releasePreconditions("tag", pending)).toEqual([expect.stringMatching(/\(brave-owls\.md\): the version pull request .* not merged yet/)]);
  });

  it("version fails with no pending changeset", () => {
    expect(releasePreconditions("version", ready)).toEqual(["no pending changeset in .changeset/: there is nothing to release"]);
  });

  it("reports every failure at once", () => {
    expect(releasePreconditions("tag", { porcelain: "?? x", head: "def", originMain: "abc", pendingChangesets: ["a.md"] })).toHaveLength(3);
    expect(releasePreconditions("version", { porcelain: "?? x", head: "def", originMain: "abc", pendingChangesets: [] })).toHaveLength(3);
  });

  it("refusal lists one reason per line, and is null with none", () => {
    expect(refusal("tag", ["a", "b"])).toBe("not running `tag`:\n- a\n- b");
    expect(refusal("version", [])).toBeNull();
  });
});
