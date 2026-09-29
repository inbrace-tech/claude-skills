// Tests for release-notes' pure rules, with strings and no file system (`pnpm test`).

import { changelogSection, changelogUrl, parseVersionArg, releaseNotes } from "./release-notes.logic.ts";

describe("release-notes rules", () => {
  const CHANGELOG = "# p\n\nIntro.\n\n## 0.6.0\n\n### Minor Changes\n\n- Add a skill.\n\n## 0.5.0\n\n- Older.\n\n## 0.4.0\n\n";

  it("changelogSection takes the body up to the next version", () => {
    expect(changelogSection(CHANGELOG, "0.6.0")).toBe("### Minor Changes\n\n- Add a skill.");
    expect(changelogSection(CHANGELOG, "0.5.0")).toBe("- Older.");
  });

  it("changelogSection matches the whole version, not a prefix", () => {
    expect(changelogSection("## 0.5.10\n\n- x.\n", "0.5.1")).toBeNull();
  });

  it("releaseNotes appends the link to the full changelog at the tag", () => {
    expect(releaseNotes("p", CHANGELOG, "0.6.0")).toEqual({
      notes: "### Minor Changes\n\n- Add a skill.\n\nFull changelog: https://github.com/inbrace-tech/claude-skills/blob/p@0.6.0/plugins/p/CHANGELOG.md\n",
    });
    expect(changelogUrl("p", "1.0.0")).toBe("https://github.com/inbrace-tech/claude-skills/blob/p@1.0.0/plugins/p/CHANGELOG.md");
  });

  it("releaseNotes fails on a missing section and an empty one", () => {
    expect(releaseNotes("p", CHANGELOG, "0.7.0")).toEqual({ error: expect.stringMatching(/has no "## 0\.7\.0" section/) });
    expect(releaseNotes("p", CHANGELOG, "0.4.0")).toEqual({ error: expect.stringMatching(/"## 0\.4\.0" section is empty/) });
  });

  describe("parseVersionArg", () => {
    it("reads 1.2.3, v1.2.3 and <plugin>@1.2.3 with one plugin", () => {
      for (const arg of ["1.2.3", "v1.2.3", "p@1.2.3", "p@v1.2.3"]) expect(parseVersionArg(arg, ["p"])).toEqual({ plugin: "p", version: "1.2.3" });
    });

    it("takes the plugin from the tag or the flag when there are several", () => {
      expect(parseVersionArg("q@1.0.0", ["p", "q"])).toEqual({ plugin: "q", version: "1.0.0" });
      expect(parseVersionArg("1.0.0", ["p", "q"], "q")).toEqual({ plugin: "q", version: "1.0.0" });
      expect(parseVersionArg("1.0.0", ["p", "q"])).toEqual({ error: expect.stringMatching(/several plugins here/) });
    });

    it("fails a plugin part that differs from --plugin or names no plugin here", () => {
      expect(parseVersionArg("p@1.0.0", ["p", "q"], "q")).toEqual({ error: '"p@1.0.0" names p, but --plugin is q' });
      expect(parseVersionArg("r@1.0.0", ["p"])).toEqual({ error: expect.stringMatching(/no plugin "r" here/) });
    });

    it("fails a malformed version", () => {
      for (const arg of ["1.2", "vv1.2.3", "p@", "latest", "1.2.3.4"]) expect(parseVersionArg(arg, ["p"])).toEqual({ error: expect.stringMatching(/is not a version/) });
    });
  });
});
