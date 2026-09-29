// Tests for check-changeset-size's pure rules, with strings and no file system (`pnpm test`).

import { checkChangeset, isChangesetFile, MAX_SUMMARY_CHARACTERS, renderedSummary } from "./check-changeset-size.logic.ts";

describe("check-changeset-size rules", () => {
  const PATH = ".changeset/x.md";
  const packages = new Set(["p", "q"]);
  const changeset = (frontmatter: string, summary: string): string => `---\n${frontmatter}\n---\n\n${summary}\n`;
  const check = (text: string): string[] => checkChangeset(PATH, text, packages);

  it("passes one package, one bump and a one-line summary", () => {
    expect(check(changeset('"p": patch', "Fix a rule."))).toEqual([]);
  });

  it("reads bare, single- and double-quoted names, several packages", () => {
    expect(check(changeset("p: minor\n'q': major", "Add a skill."))).toEqual([]);
  });

  it("passes a summary exactly at the ceiling and fails one character over", () => {
    expect(check(changeset('"p": patch', "a".repeat(MAX_SUMMARY_CHARACTERS)))).toEqual([]);
    expect(check(changeset('"p": patch', "a".repeat(MAX_SUMMARY_CHARACTERS + 1)))).toEqual([
      expect.stringMatching(new RegExp(`is ${MAX_SUMMARY_CHARACTERS + 1} characters, over the ${MAX_SUMMARY_CHARACTERS}-character ceiling`)),
    ]);
  });

  it("counts UTF-16 code units", () => {
    const astral = "😀".repeat(MAX_SUMMARY_CHARACTERS / 2);
    expect(check(changeset('"p": patch', astral))).toEqual([]);
    expect(check(changeset('"p": patch', `${astral}a`))).toHaveLength(1);
  });

  it("fails a summary over two lines", () => {
    expect(check(changeset('"p": patch', "One.\n\nTwo."))).toEqual([expect.stringMatching(/spans 3 lines/)]);
  });

  it("drops changelog-github's override lines before counting, as that package does before rendering", () => {
    expect(check(changeset('"p": patch', "pr: #28\ncommit: abc1234\nauthor: @a\nuser: b\nFix a rule."))).toEqual([]);
    expect(check(changeset('"p": patch', `pull request: 28\n${"a".repeat(MAX_SUMMARY_CHARACTERS)}`))).toEqual([]);
    expect(renderedSummary("PR: #1\nFix.")).toBe("Fix.");
  });

  it("still fails a two-line summary that carries an override", () => {
    expect(check(changeset('"p": patch', "pr: #28\nOne.\nTwo."))).toEqual([expect.stringMatching(/spans 2 lines/)]);
  });

  it("strips only the forms changelog-github parses: a second pr: line stays", () => {
    expect(check(changeset('"p": patch', "pr: #1\npr: #2\nFix."))).toEqual([expect.stringMatching(/spans 2 lines/)]);
  });

  it("fails an empty summary", () => {
    expect(check(changeset('"p": patch', ""))).toEqual([expect.stringMatching(/has no summary/)]);
  });

  it("fails an unknown package, a bad bump and a repeated name", () => {
    expect(check(changeset('"r": patch', "Fix."))).toEqual([expect.stringMatching(/names "r", which is not a plugin package here \(p, q\)/)]);
    expect(check(changeset('"p": huge', "Fix."))).toEqual([expect.stringMatching(/bump "huge" for "p" is not one of patch, minor, major/)]);
    expect(check(changeset('"p": patch\n"p": minor', "Fix."))).toEqual([expect.stringMatching(/names "p" twice/)]);
  });

  it("fails an empty changeset, which names no package", () => {
    expect(check("---\n---\n\n")).toEqual([expect.stringMatching(/names no package/), expect.stringMatching(/has no summary/)]);
  });

  it("fails text without frontmatter and a line that is not a release", () => {
    expect(check("Fix.\n")).toEqual([`${PATH}: needs frontmatter between two \`---\` lines`]);
    expect(check(changeset("p patch", "Fix."))).toEqual([expect.stringMatching(/frontmatter line "p patch" is not/)]);
  });

  it("isChangesetFile skips the README in any case", () => {
    expect(isChangesetFile("brave-owls-sing.md")).toBe(true);
    expect(isChangesetFile("README.md")).toBe(false);
    expect(isChangesetFile("readme.md")).toBe(false);
    expect(isChangesetFile("config.json")).toBe(false);
  });
});
