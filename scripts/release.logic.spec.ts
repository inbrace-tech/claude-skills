// Tests for release's pure rules (`pnpm test`). release.ts itself runs against a throwaway remote in release.spec.ts.

import { lsRemoteTags, planTags, releasePreconditions, releaseTag, signedTagEnv } from "./release.logic.ts";

describe("release rules", () => {
  describe("signedTagEnv", () => {
    it("adds tag.gpgSign=true as the first git config entry", () => {
      expect(signedTagEnv({ HOME: "/h" })).toEqual({ HOME: "/h", GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "tag.gpgSign", GIT_CONFIG_VALUE_0: "true" });
    });

    it("appends after entries already in the environment", () => {
      const env = signedTagEnv({ GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "a.b", GIT_CONFIG_VALUE_0: "c" });
      expect(env).toMatchObject({ GIT_CONFIG_COUNT: "2", GIT_CONFIG_KEY_0: "a.b", GIT_CONFIG_KEY_1: "tag.gpgSign", GIT_CONFIG_VALUE_1: "true" });
    });

    it("starts over from an unreadable count", () => {
      expect(signedTagEnv({ GIT_CONFIG_COUNT: "x" })).toMatchObject({ GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "tag.gpgSign" });
    });
  });

  describe("releasePreconditions", () => {
    const ready = { porcelain: "", head: "abc", originMain: "abc", pendingChangesets: [] };
    const pending = { ...ready, pendingChangesets: ["brave-owls.md"] };

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
  });

  it("releaseTag is Changesets' workspace form, scoped names included", () => {
    expect(releaseTag("inbrace-config", "0.5.1")).toBe("inbrace-config@0.5.1");
    expect(releaseTag("@scope/p", "1.0.0")).toBe("@scope/p@1.0.0");
  });

  it("lsRemoteTags reads tag names and folds peeled lines", () => {
    const output = "aaa\trefs/tags/p@1.0.0\nbbb\trefs/tags/p@1.0.0^{}\nccc\trefs/tags/@s/q@2.0.0\nddd\trefs/heads/main\n";
    expect([...lsRemoteTags(output)]).toEqual(["p@1.0.0", "@s/q@2.0.0"]);
    expect(lsRemoteTags("").size).toBe(0);
  });

  describe("planTags", () => {
    it("pushes a tag that exists here but not on origin, as after a failed push", () => {
      expect(planTags(["p@1.0.0"], new Set(), new Set(["p@1.0.0"]))).toEqual({ published: [], push: ["p@1.0.0"], missing: [] });
    });

    it("checks a tag already on origin instead of passing it silently", () => {
      expect(planTags(["p@1.0.0"], new Set(["p@1.0.0"]), new Set(["p@1.0.0"]))).toEqual({ published: ["p@1.0.0"], push: [], missing: [] });
    });

    it("reports a tag that is nowhere", () => {
      expect(planTags(["p@1.0.0", "q@2.0.0"], new Set(["q@2.0.0"]), new Set())).toEqual({ published: ["q@2.0.0"], push: [], missing: ["p@1.0.0"] });
    });
  });
});
