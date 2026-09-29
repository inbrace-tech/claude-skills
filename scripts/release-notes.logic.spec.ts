// Tests for release-notes' pure rules, with strings and no file system (`pnpm test`).

import { changelogSection, changelogUrl, releaseNotes } from "./release-notes.logic.ts";

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

  it("releaseNotes fails on a missing section, an empty one and a malformed version", () => {
    expect(releaseNotes("p", CHANGELOG, "0.7.0")).toEqual({ error: expect.stringMatching(/has no "## 0\.7\.0" section/) });
    expect(releaseNotes("p", CHANGELOG, "0.4.0")).toEqual({ error: expect.stringMatching(/"## 0\.4\.0" section is empty/) });
    expect(releaseNotes("p", CHANGELOG, "v0.6.0")).toEqual({ error: expect.stringMatching(/is not a version/) });
  });
});
