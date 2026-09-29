// Tests for release-tag's pure rules, with strings (`pnpm test`).

import { expectedTags, lsRemoteTags, planTags, releaseTag, signedTagEnv, unsignedRemedy } from "./release-tag.logic.ts";

describe("release-tag rules", () => {
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

  it("releaseTag is Changesets' workspace form, scoped names included", () => {
    expect(releaseTag("inbrace-config", "0.5.1")).toBe("inbrace-config@0.5.1");
    expect(releaseTag("@scope/p", "1.0.0")).toBe("@scope/p@1.0.0");
  });

  it("expectedTags reads each package and reports one it cannot", () => {
    const packages = [
      { path: "plugins/p/package.json", text: '{"name":"p","version":"1.0.0"}' },
      { path: "plugins/q/package.json", text: '{"name":"q"}' },
      { path: "plugins/r/package.json", text: "{" },
      { path: "plugins/s/package.json", text: "null" },
    ];
    expect(expectedTags(packages)).toEqual({
      tags: ["p@1.0.0"],
      errors: ['plugins/q/package.json: needs a "name" and a "version"', "plugins/r/package.json: not valid JSON", 'plugins/s/package.json: needs a "name" and a "version"'],
    });
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

  it("unsignedRemedy says how to delete and re-cut the tag", () => {
    expect(unsignedRemedy("p@1.0.0")).toBe(
      "p@1.0.0 is on origin but not a signed tag: delete it (`git push origin :refs/tags/p@1.0.0` and `git tag --delete p@1.0.0`), then run `pnpm run release` again",
    );
  });
});
