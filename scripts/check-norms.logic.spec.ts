// Tests for the pure rules of check-norms, with strings and no file system:
//   pnpm test
// `check-norms.spec.ts` runs the script itself.

import {
  agentNames,
  blankCodeRegions,
  checkCorpus,
  checkSurface,
  definedNorms,
  extractCitations,
  extractHeadings,
  normaliseWhere,
  sidecarPathFor,
  surfaceQualifiers,
  toRepoPath,
  uncitedRefNumbers,
  unlistedBareRefs,
  whereResolves,
} from "./check-norms.logic.ts";
import type { CorpusInput, MarkdownFile, SurfaceInput } from "./check-norms.logic.ts";

describe("check-norms rules", () => {
  const SURFACE_PATH = "plugins/p/skills/s/SKILL.md";
  const SIDECAR_PATH = "plugins/p/skills/s/SKILL.norms.json";

  const entry = (id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({ id, where: "Stage 1", refs: {}, what: "Why it exists.", ...overrides });

  interface SkillOverrides {
    surface?: string | null;
    sidecar?: object;
    sidecarText?: string | null;
  }

  /** A consistent two-norm skill; each test breaks exactly one thing. */
  function skill({ surface, sidecar, sidecarText }: SkillOverrides = {}): SurfaceInput {
    return {
      surfacePath: SURFACE_PATH,
      sidecarPath: SIDECAR_PATH,
      surface: surface !== undefined ? surface : "# Skill\n\n- [N01] Do one thing.\n- [N02] Do another, after [N01].\n",
      sidecarText:
        sidecarText !== undefined
          ? sidecarText
          : JSON.stringify(sidecar ?? { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02")] }),
    };
  }

  const errorsOf = (input: SurfaceInput): string[] => checkSurface(input).errors;

  it("a consistent skill passes", () => {
    expect(checkSurface(skill())).toStrictEqual({ inFormat: true, errors: [] });
  });

  it("a skill with no norm and no sidecar is skipped", () => {
    expect(checkSurface(skill({ surface: "# Plain skill\n\nNo norms here.\n", sidecarText: null }))).toStrictEqual({
      inFormat: false,
      errors: [],
    });
  });

  it("definedNorms reads only list items led by an id", () => {
    expect(definedNorms("- [N01] a\nText citing [N02].\n  - [N03] nested\n- [N04] b\n")).toStrictEqual(["N01", "N04"]);
  });

  it("definedNorms keeps malformed ids so they can be reported", () => {
    expect(definedNorms("- [N1] a\n- [N100] b\n- [NEW] not a norm\n")).toStrictEqual(["N1", "N100"]);
  });

  it("a malformed norm id is reported, not read as prose", () => {
    expect(errorsOf(skill({ surface: "- [N1] a\n", sidecarText: null }))).toStrictEqual([
      `${SURFACE_PATH}: norm id N1 is not N followed by two digits`,
      `${SURFACE_PATH}: defines norms but has no SKILL.norms.json`,
    ]);
  });

  it("a malformed id beside valid norms is reported alone", () => {
    const errors = errorsOf(skill({ surface: "- [N01] a\n- [N02] b\n- [N100] c\n" }));
    expect(errors).toStrictEqual([`${SURFACE_PATH}: norm id N100 is not N followed by two digits`]);
  });

  it("a list item led by a bracketed word is not a norm", () => {
    expect(checkSurface(skill({ surface: "- [NEW] Added a skill.\n", sidecarText: null }))).toStrictEqual({
      inFormat: false,
      errors: [],
    });
  });

  it("a sidecar with no SKILL.md beside it", () => {
    expect(checkSurface(skill({ surface: null }))).toStrictEqual({
      inFormat: true,
      errors: [`${SIDECAR_PATH}: has no SKILL.md beside it`],
    });
  });

  it("a directory with neither file is skipped", () => {
    expect(checkSurface(skill({ surface: null, sidecarText: null }))).toStrictEqual({ inFormat: false, errors: [] });
  });

  it("toRepoPath spells a Windows relative path with /", () => {
    expect(toRepoPath("plugins\\p\\skills\\s\\SKILL.md", "\\")).toBe("plugins/p/skills/s/SKILL.md");
    expect(toRepoPath("plugins/p/skills/s/SKILL.md", "/")).toBe("plugins/p/skills/s/SKILL.md");
  });

  it("norms without a sidecar", () => {
    expect(errorsOf(skill({ sidecarText: null }))).toStrictEqual([`${SURFACE_PATH}: defines norms but has no SKILL.norms.json`]);
  });

  it("a sidecar that is not JSON", () => {
    const [error] = errorsOf(skill({ sidecarText: "{ not json" }));
    expect(error, "expected an invalid JSON error").toBeDefined();
    expect(error).toMatch(/: invalid JSON \(/);
  });

  const NON_OBJECT_ROOTS: [label: string, text: string][] = [["null", "null"], ["a string", '"text"'], ["an array", "[]"], ["a number", "7"]];
  it.each(NON_OBJECT_ROOTS)("a sidecar whose root is %s is reported, not thrown", (_label, text) => {
    expect(errorsOf(skill({ sidecarText: text }))).toStrictEqual([`${SIDECAR_PATH}: must be a JSON object`]);
  });

  it("a surface field naming another file", () => {
    const errors = errorsOf(skill({ sidecar: { surface: "elsewhere/SKILL.md", norms: [entry("N01"), entry("N02")] } }));
    expect(errors).toStrictEqual([`${SIDECAR_PATH}: surface is "elsewhere/SKILL.md", expected "${SURFACE_PATH}"`]);
  });

  it("a norm defined twice", () => {
    const errors = errorsOf(skill({ surface: "- [N01] a\n- [N01] b\n", sidecar: { surface: SURFACE_PATH, norms: [entry("N01")] } }));
    expect(errors).toStrictEqual([`${SURFACE_PATH}: norm N01 is defined more than once`]);
  });

  it("norms that is not an array", () => {
    const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: {} } }));
    expect(errors).toContain(`${SIDECAR_PATH}: "norms" must be an array`);
  });

  it("an entry with an invalid id", () => {
    const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02"), entry("N1")] } }));
    expect(errors).toStrictEqual([`${SIDECAR_PATH}: entry with invalid id "N1"`]);
  });

  it("an entry that is not an object is reported, not thrown", () => {
    const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02"), null, "N03", ["N04"]] } }));
    expect(errors).toStrictEqual([
      `${SIDECAR_PATH}: entry with invalid id undefined`,
      `${SIDECAR_PATH}: entry with invalid id undefined`,
      `${SIDECAR_PATH}: entry with invalid id undefined`,
    ]);
  });

  it("an entry recorded twice", () => {
    const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02"), entry("N02")] } }));
    expect(errors).toStrictEqual([`${SIDECAR_PATH}: N02 is recorded more than once`]);
  });

  it("an entry with an empty where, an empty what and array refs", () => {
    const bad = entry("N02", { where: " ", what: "", refs: [] });
    const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), bad] } }));
    expect(errors).toStrictEqual([
      `${SIDECAR_PATH}: N02 has no "where"`,
      `${SIDECAR_PATH}: N02 has no "what"`,
      `${SIDECAR_PATH}: N02 "refs" must be an object`,
    ]);
  });

  it("a norm with no entry, and an entry with no norm", () => {
    const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N03")] } }));
    expect(errors).toStrictEqual([`${SURFACE_PATH}: N02 has no entry in SKILL.norms.json`, `${SIDECAR_PATH}: N03 matches no norm in SKILL.md`]);
  });

  it("a cross-reference to an undefined norm", () => {
    const errors = errorsOf(skill({ surface: "- [N01] a, unlike [N09].\n- [N02] b\n" }));
    expect(errors).toStrictEqual([`${SURFACE_PATH}: cross-reference [N09] names no norm defined here`]);
  });

  it("a dangling cross-reference is reported once however often it appears", () => {
    const errors = errorsOf(skill({ surface: "- [N01] a, see [N09].\n- [N02] b, and [N09] again.\n" }));
    expect(errors).toStrictEqual([`${SURFACE_PATH}: cross-reference [N09] names no norm defined here`]);
  });

  it("sidecarPathFor names the sidecar of a skill and of an agent", () => {
    expect(sidecarPathFor("plugins/p/skills/s/SKILL.md")).toBe("plugins/p/skills/s/SKILL.norms.json");
    expect(sidecarPathFor("plugins/p/agents/a.md")).toBe("plugins/p/agents/a.norms.json");
  });

  it("agentNames finds agents by their .md or their sidecar, and skips other files", () => {
    expect(agentNames(["b.md", "a.md", "a.norms.json", "orphan.norms.json", ".DS_Store", "notes.txt"])).toStrictEqual([
      "a",
      "b",
      "orphan",
    ]);
  });

  const AGENT_PATH = "plugins/p/agents/a.md";
  const AGENT_SIDECAR_PATH = "plugins/p/agents/a.norms.json";
  const agent = (sidecar: object): SurfaceInput => ({
    surfacePath: AGENT_PATH,
    sidecarPath: AGENT_SIDECAR_PATH,
    surface: "---\nname: a\n---\n\n## Return\n\n- [N01] Return one line.\n\n<return_contract>\n`clean`\n</return_contract>\n",
    sidecarText: JSON.stringify(sidecar),
  });

  it("a consistent agent passes", () => {
    expect(checkSurface(agent({ surface: AGENT_PATH, norms: [entry("N01", { where: "Return" })] }))).toStrictEqual({ inFormat: true, errors: [] });
  });

  it("an inconsistent agent is reported with the agent's own file names", () => {
    const errors = errorsOf(agent({ surface: "plugins/p/agents/b.md", norms: [entry("N02", { where: "Return" })] }));
    expect(errors).toStrictEqual([
      `${AGENT_SIDECAR_PATH}: surface is "plugins/p/agents/b.md", expected "${AGENT_PATH}"`,
      `${AGENT_PATH}: N01 has no entry in a.norms.json`,
      `${AGENT_SIDECAR_PATH}: N02 matches no norm in a.md`,
    ]);
  });


  // ─── Ported from the harness's norm-provenance checker ───────────────────────

  // (a) `where` resolves to a real heading of the surface.

  const SECTIONED = "# Skill\n\n## Plan\n\n- [N01] Do one thing.\n\n## Audit\n\n- [N02] Do another.\n";
  const sectioned = (n01: Record<string, unknown>): SurfaceInput =>
    skill({ surface: SECTIONED, sidecar: { surface: SURFACE_PATH, norms: [entry("N01", n01), entry("N02", { where: "Audit" })] } });

  it("a where naming a heading of the surface passes", () => {
    expect(errorsOf(sectioned({ where: "Plan" }))).toStrictEqual([]);
  });

  it("a where naming a section the surface does not carry is reported", () => {
    expect(errorsOf(sectioned({ where: "Report" }))).toStrictEqual([`${SIDECAR_PATH}: N01 "where" "Report" names no heading in SKILL.md`]);
  });

  it("a where resolves by prefix in both directions, since prose shortens a heading", () => {
    const surface = "## Stage 1 — Plan: list, estimate\n\n## Audit\n";
    expect(whereResolves("Stage 1", surface)).toBe(true);
    expect(whereResolves("Audit in batches", surface)).toBe(true);
    expect(whereResolves("Stage 2", surface)).toBe(false);
  });

  it("a heading-shaped line inside a fenced block is not a heading a where can name", () => {
    const surface = "## Plan\n\n```md\n## Hidden\n```\n";
    expect(extractHeadings(surface)).toStrictEqual(["Plan"]);
    expect(whereResolves("Hidden", surface)).toBe(false);
  });

  it("a where quoting a heading verbatim resolves wherever its inline-code span sits", () => {
    const surface = "## `x` leads\n\n## run `pnpm` now\n\n## ends in `y`\n";
    expect(whereResolves("`x` leads", surface)).toBe(true);
    expect(whereResolves("run `pnpm` now", surface)).toBe(true);
    expect(whereResolves("ends in `y`", surface)).toBe(true);
    expect(whereResolves("`x` trails", surface)).toBe(false);
  });

  it("a where that is entirely one inline-code span names nothing and is reported", () => {
    expect(normaliseWhere("`x`")).toBe("");
    expect(errorsOf(sectioned({ where: "`Plan`" }))).toStrictEqual([`${SIDECAR_PATH}: N01 "where" "\`Plan\`" names no heading in SKILL.md`]);
  });

  it("on a surface with no heading, any where resolves", () => {
    expect(whereResolves("Anything", "- [N01] a\n")).toBe(true);
  });

  // (b) `refs` keys are owner/repo with integer arrays, or docs with https URLs.

  it("refs keyed by owner/repo with issue numbers, and docs with https URLs, pass", () => {
    expect(errorsOf(sectioned({ where: "Plan", refs: { "owner/repo": [1, 2], docs: ["https://example.com/page"] } }))).toStrictEqual([]);
  });

  it("a refs key that is not owner/repo or docs is reported", () => {
    expect(errorsOf(sectioned({ where: "Plan", refs: { issues: [1], "owner/repo": [2] } }))).toStrictEqual([
      `${SIDECAR_PATH}: N01 "refs" key "issues" is not owner/repo or "docs"`,
    ]);
  });

  it("a refs repository whose value is not an array is reported", () => {
    expect(errorsOf(sectioned({ where: "Plan", refs: { "owner/repo": 3 } }))).toStrictEqual([
      `${SIDECAR_PATH}: N01 "refs" owner/repo must be an array of issue or pull request numbers`,
    ]);
  });

  it("a ref that is not a positive integer is reported", () => {
    expect(errorsOf(sectioned({ where: "Plan", refs: { "owner/repo": [0, 1.5, "7", 4] } }))).toStrictEqual([
      `${SIDECAR_PATH}: N01 "refs" owner/repo holds 0, 1.5, "7", not a positive integer`,
    ]);
  });

  it("a docs ref that is not an https URL is reported", () => {
    expect(errorsOf(sectioned({ where: "Plan", refs: { docs: ["http://example.com", 3] } }))).toStrictEqual([
      `${SIDECAR_PATH}: N01 "refs.docs" must be an array of https URLs`,
    ]);
  });

  // (c) Issue numbers the prose and `refs` disagree on: reported, never failed.

  it("unlistedBareRefs reports a bare number refs does not list, and is silent on one it does", () => {
    expect(unlistedBareRefs("Came from #12 and #7.", new Set([7]))).toStrictEqual([12]);
    expect(unlistedBareRefs("Came from #7.", new Set([7]))).toStrictEqual([]);
  });

  it("unlistedBareRefs ignores owner/repo#N, and still sees a bare number beside it", () => {
    expect(unlistedBareRefs("owner/repo#12", new Set())).toStrictEqual([]);
    expect(unlistedBareRefs("owner/repo#12 and #13", new Set())).toStrictEqual([13]);
  });

  it("unlistedBareRefs does not read a heading or a norm id as an issue, and deduplicates and sorts", () => {
    expect(unlistedBareRefs("## Section, [N12], a#4", new Set())).toStrictEqual([]);
    expect(unlistedBareRefs("#9, #3 and #9 again", new Set())).toStrictEqual([3, 9]);
  });

  it("uncitedRefNumbers reports a ref the prose never writes, and accepts it bare or qualified", () => {
    expect(uncitedRefNumbers("Fixed in #12.", [12, 13])).toStrictEqual([13]);
    expect(uncitedRefNumbers("owner/repo#13 and #12", [12, 13])).toStrictEqual([]);
  });

  it("uncitedRefNumbers does not read a longer number as citing its prefix", () => {
    expect(uncitedRefNumbers("See #123.", [12])).toStrictEqual([12]);
  });

  // (d) and (e) need the whole corpus.

  const SKILL_TEXT = "# Skill\n\n- [N01] Do one thing.\n- [N02] Do another, after [N01].\n";
  const AGENT_TEXT = "## Return\n\n- [N01] Return one line.\n";

  interface CorpusOverrides {
    skillSurface?: string;
    skillSidecar?: string;
    skillNorms?: Record<string, unknown>[];
    markdown?: MarkdownFile[];
  }

  /** A consistent skill and a consistent agent; each test adds one thing. */
  function corpus({ skillSurface = SKILL_TEXT, skillSidecar, skillNorms = [entry("N01"), entry("N02")], markdown = [] }: CorpusOverrides = {}): CorpusInput {
    return {
      surfaces: [
        {
          surfacePath: SURFACE_PATH,
          sidecarPath: SIDECAR_PATH,
          surface: skillSurface,
          sidecarText: skillSidecar ?? JSON.stringify({ surface: SURFACE_PATH, norms: skillNorms }),
        },
        {
          surfacePath: AGENT_PATH,
          sidecarPath: AGENT_SIDECAR_PATH,
          surface: AGENT_TEXT,
          sidecarText: JSON.stringify({ surface: AGENT_PATH, norms: [entry("N01", { where: "Return" })] }),
        },
      ],
      markdown,
    };
  }

  it("a consistent corpus reports nothing", () => {
    expect(checkCorpus(corpus())).toStrictEqual({ errors: [], notes: [] });
  });

  it("surfaceQualifiers names a surface by each path segment and by its basename", () => {
    expect(surfaceQualifiers(SURFACE_PATH)).toStrictEqual(["plugins", "p", "skills", "s", "SKILL.md", "SKILL"]);
    expect(surfaceQualifiers(AGENT_PATH)).toStrictEqual(["plugins", "p", "agents", "a.md", "a"]);
  });

  it("a qualified citation on a surface resolves to a norm another surface declares", () => {
    const skillSurface = `${SKILL_TEXT}- [N03] Use the agent's line, per [a#N01].\n`;
    expect(checkCorpus(corpus({ skillSurface, skillNorms: [entry("N01"), entry("N02"), entry("N03")] })).errors).toStrictEqual([]);
  });

  it("a qualified citation whose surface has no such norm is reported", () => {
    const skillSurface = `${SKILL_TEXT}- [N03] Use the agent's line, per [a#N07].\n`;
    expect(checkCorpus(corpus({ skillSurface, skillNorms: [entry("N01"), entry("N02"), entry("N03")] })).errors).toStrictEqual([
      `${SURFACE_PATH}:5: [a#N07] names ${AGENT_PATH}, whose a.norms.json has no entry N07`,
    ]);
  });

  it("a qualified citation naming no surface, or several, is reported", () => {
    const skillSurface = `${SKILL_TEXT}- [N03] See [nope#N01] and [p#N01].\n`;
    expect(checkCorpus(corpus({ skillSurface, skillNorms: [entry("N01"), entry("N02"), entry("N03")] })).errors).toStrictEqual([
      `${SURFACE_PATH}:5: [nope#N01] names no surface in the norm format`,
      `${SURFACE_PATH}:5: [p#N01] names 2 surfaces: ${AGENT_PATH}, ${SURFACE_PATH}`,
    ]);
  });

  it("a qualified citation in a sidecar's what is checked, and one that resolves passes", () => {
    const resolving = checkCorpus(corpus({ skillNorms: [entry("N01", { what: "Mirrors [a#N01]." }), entry("N02")] }));
    expect(resolving.errors).toStrictEqual([]);
    const dangling = checkCorpus(corpus({ skillNorms: [entry("N01", { what: "Mirrors [a#N07]." }), entry("N02")] }));
    expect(dangling.errors).toStrictEqual([`${SIDECAR_PATH}: N01.what: [a#N07] names ${AGENT_PATH}, whose a.norms.json has no entry N07`]);
  });

  it("a bare id in sidecar prose that the sidecar does not declare is a note, not an error", () => {
    const result = checkCorpus(corpus({ skillNorms: [entry("N01", { what: "Once [N09], twice [N09]; `[N08]` is prose." }), entry("N02")] }));
    expect(result).toStrictEqual({ errors: [], notes: [`${SIDECAR_PATH}: N01.what cites [N09], which this sidecar has no entry for`] });
  });

  it("issue numbers the prose and refs disagree on are notes, not errors", () => {
    const result = checkCorpus(corpus({ skillNorms: [entry("N01", { what: "Came from #6.", refs: { "owner/repo": [5] } }), entry("N02")] }));
    expect(result).toStrictEqual({
      errors: [],
      notes: [`${SIDECAR_PATH}: N01 lists owner/repo #5 in "refs", but its prose never cites it`, `${SIDECAR_PATH}: N01.what cites #6, which "refs" does not list`],
    });
  });

  it("a bare id in Markdown no sidecar serves fails", () => {
    const markdown = [{ path: "README.md", source: "# Readme\n\nFollow [N01].\n" }];
    expect(checkCorpus(corpus({ markdown })).errors).toStrictEqual([
      "README.md:3: [N01] cites a norm, but no sidecar serves this file; qualify it as [<skill-or-agent>#N01], or write it in backticks where the text is about the format",
    ]);
  });

  it("an id in an inline-code span or a fenced block of such Markdown is prose about the format", () => {
    const markdown = [{ path: "CONTRIBUTING.md", source: "Write `- [N07] Do it`.\n\n```md\n- [N01] Example\n```\n" }];
    expect(checkCorpus(corpus({ markdown })).errors).toStrictEqual([]);
  });

  it("a qualified citation in Markdown no sidecar serves is resolved, not reported as ungoverned", () => {
    const passes = checkCorpus(corpus({ markdown: [{ path: "README.md", source: "See [a#N01].\n" }] }));
    expect(passes.errors).toStrictEqual([]);
    const fails = checkCorpus(corpus({ markdown: [{ path: "README.md", source: "See [a#N07].\n" }] }));
    expect(fails.errors).toStrictEqual([`README.md:1: [a#N07] names ${AGENT_PATH}, whose a.norms.json has no entry N07`]);
  });

  it("a governed surface is not swept as ungoverned, even when its sidecar fails to parse", () => {
    const markdown = [{ path: SURFACE_PATH, source: SKILL_TEXT }];
    expect(checkCorpus(corpus({ markdown })).errors).toStrictEqual([]);
    expect(checkCorpus(corpus({ markdown, skillSidecar: "{ not json" })).errors).toStrictEqual([]);
  });

  it("extractCitations reads both spellings with their lines, skipping code", () => {
    expect(extractCitations("a [N01] b [s#N02]\n`[N03]`\n```\n[N04]\n```\n[N5]")).toStrictEqual([
      { id: "N01", qualifier: null, line: 1 },
      { id: "N02", qualifier: "s", line: 1 },
      { id: "N5", qualifier: null, line: 6 },
    ]);
  });

  it("blankCodeRegions keeps lines and columns, and leaves an unterminated backtick as prose", () => {
    expect(blankCodeRegions("a `b` c\n``` x")).toBe("a     c\n     ");
    expect(blankCodeRegions("a `b c")).toBe("a `b c");
  });
});
