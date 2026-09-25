// Tests for check-norms. Node's built-in runner, no dependencies:
//   pnpm test, or node --test "scripts/*.test.ts"
// The pure rules are tested with strings; end-to-end tests run the script
// itself, against this repository and against throwaway fixture trees.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

void test("a consistent skill passes", () => {
  assert.deepEqual(checkSurface(skill()), { inFormat: true, errors: [] });
});

void test("a skill with no norm and no sidecar is skipped", () => {
  assert.deepEqual(checkSurface(skill({ surface: "# Plain skill\n\nNo norms here.\n", sidecarText: null })), {
    inFormat: false,
    errors: [],
  });
});

void test("definedNorms reads only list items led by an id", () => {
  assert.deepEqual(definedNorms("- [N01] a\nText citing [N02].\n  - [N03] nested\n- [N04] b\n"), ["N01", "N04"]);
});

void test("definedNorms keeps malformed ids so they can be reported", () => {
  assert.deepEqual(definedNorms("- [N1] a\n- [N100] b\n- [NEW] not a norm\n"), ["N1", "N100"]);
});

void test("a malformed norm id is reported, not read as prose", () => {
  assert.deepEqual(errorsOf(skill({ surface: "- [N1] a\n", sidecarText: null })), [
    `${SURFACE_PATH}: norm id N1 is not N followed by two digits`,
    `${SURFACE_PATH}: defines norms but has no SKILL.norms.json`,
  ]);
});

void test("a malformed id beside valid norms is reported alone", () => {
  const errors = errorsOf(skill({ surface: "- [N01] a\n- [N02] b\n- [N100] c\n" }));
  assert.deepEqual(errors, [`${SURFACE_PATH}: norm id N100 is not N followed by two digits`]);
});

void test("a list item led by a bracketed word is not a norm", () => {
  assert.deepEqual(checkSurface(skill({ surface: "- [NEW] Added a skill.\n", sidecarText: null })), {
    inFormat: false,
    errors: [],
  });
});

void test("a sidecar with no SKILL.md beside it", () => {
  assert.deepEqual(checkSurface(skill({ surface: null })), {
    inFormat: true,
    errors: [`${SIDECAR_PATH}: has no SKILL.md beside it`],
  });
});

void test("a directory with neither file is skipped", () => {
  assert.deepEqual(checkSurface(skill({ surface: null, sidecarText: null })), { inFormat: false, errors: [] });
});

void test("toRepoPath spells a Windows relative path with /", () => {
  assert.equal(toRepoPath("plugins\\p\\skills\\s\\SKILL.md", "\\"), "plugins/p/skills/s/SKILL.md");
  assert.equal(toRepoPath("plugins/p/skills/s/SKILL.md", "/"), "plugins/p/skills/s/SKILL.md");
});

void test("norms without a sidecar", () => {
  assert.deepEqual(errorsOf(skill({ sidecarText: null })), [`${SURFACE_PATH}: defines norms but has no SKILL.norms.json`]);
});

void test("a sidecar that is not JSON", () => {
  const [error] = errorsOf(skill({ sidecarText: "{ not json" }));
  assert.ok(error !== undefined, "expected an invalid JSON error");
  assert.match(error, /: invalid JSON \(/);
});

const NON_OBJECT_ROOTS: [label: string, text: string][] = [["null", "null"], ["a string", '"text"'], ["an array", "[]"], ["a number", "7"]];
for (const [label, text] of NON_OBJECT_ROOTS) {
  void test(`a sidecar whose root is ${label} is reported, not thrown`, () => {
    assert.deepEqual(errorsOf(skill({ sidecarText: text })), [`${SIDECAR_PATH}: must be a JSON object`]);
  });
}

void test("a surface field naming another file", () => {
  const errors = errorsOf(skill({ sidecar: { surface: "elsewhere/SKILL.md", norms: [entry("N01"), entry("N02")] } }));
  assert.deepEqual(errors, [`${SIDECAR_PATH}: surface is "elsewhere/SKILL.md", expected "${SURFACE_PATH}"`]);
});

void test("a norm defined twice", () => {
  const errors = errorsOf(skill({ surface: "- [N01] a\n- [N01] b\n", sidecar: { surface: SURFACE_PATH, norms: [entry("N01")] } }));
  assert.deepEqual(errors, [`${SURFACE_PATH}: norm N01 is defined more than once`]);
});

void test("norms that is not an array", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: {} } }));
  assert.ok(errors.includes(`${SIDECAR_PATH}: "norms" must be an array`));
});

void test("an entry with an invalid id", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02"), entry("N1")] } }));
  assert.deepEqual(errors, [`${SIDECAR_PATH}: entry with invalid id "N1"`]);
});

void test("an entry that is not an object is reported, not thrown", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02"), null, "N03", ["N04"]] } }));
  assert.deepEqual(errors, [
    `${SIDECAR_PATH}: entry with invalid id undefined`,
    `${SIDECAR_PATH}: entry with invalid id undefined`,
    `${SIDECAR_PATH}: entry with invalid id undefined`,
  ]);
});

void test("an entry recorded twice", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02"), entry("N02")] } }));
  assert.deepEqual(errors, [`${SIDECAR_PATH}: N02 is recorded more than once`]);
});

void test("an entry with an empty where, an empty what and array refs", () => {
  const bad = entry("N02", { where: " ", what: "", refs: [] });
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), bad] } }));
  assert.deepEqual(errors, [
    `${SIDECAR_PATH}: N02 has no "where"`,
    `${SIDECAR_PATH}: N02 has no "what"`,
    `${SIDECAR_PATH}: N02 "refs" must be an object`,
  ]);
});

void test("a norm with no entry, and an entry with no norm", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N03")] } }));
  assert.deepEqual(errors, [`${SURFACE_PATH}: N02 has no entry in SKILL.norms.json`, `${SIDECAR_PATH}: N03 matches no norm in SKILL.md`]);
});

void test("a cross-reference to an undefined norm", () => {
  const errors = errorsOf(skill({ surface: "- [N01] a, unlike [N09].\n- [N02] b\n" }));
  assert.deepEqual(errors, [`${SURFACE_PATH}: cross-reference [N09] names no norm defined here`]);
});

void test("a dangling cross-reference is reported once however often it appears", () => {
  const errors = errorsOf(skill({ surface: "- [N01] a, see [N09].\n- [N02] b, and [N09] again.\n" }));
  assert.deepEqual(errors, [`${SURFACE_PATH}: cross-reference [N09] names no norm defined here`]);
});

void test("sidecarPathFor names the sidecar of a skill and of an agent", () => {
  assert.equal(sidecarPathFor("plugins/p/skills/s/SKILL.md"), "plugins/p/skills/s/SKILL.norms.json");
  assert.equal(sidecarPathFor("plugins/p/agents/a.md"), "plugins/p/agents/a.norms.json");
});

void test("agentNames finds agents by their .md or their sidecar, and skips other files", () => {
  assert.deepEqual(agentNames(["b.md", "a.md", "a.norms.json", "orphan.norms.json", ".DS_Store", "notes.txt"]), [
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

void test("a consistent agent passes", () => {
  assert.deepEqual(checkSurface(agent({ surface: AGENT_PATH, norms: [entry("N01", { where: "Return" })] })), { inFormat: true, errors: [] });
});

void test("an inconsistent agent is reported with the agent's own file names", () => {
  const errors = errorsOf(agent({ surface: "plugins/p/agents/b.md", norms: [entry("N02", { where: "Return" })] }));
  assert.deepEqual(errors, [
    `${AGENT_SIDECAR_PATH}: surface is "plugins/p/agents/b.md", expected "${AGENT_PATH}"`,
    `${AGENT_PATH}: N01 has no entry in a.norms.json`,
    `${AGENT_SIDECAR_PATH}: N02 matches no norm in a.md`,
  ]);
});

const script = join(import.meta.dirname, "check-norms.ts");
const run = (cwd: string) => spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });

void test("this repository passes", () => {
  const result = run(join(import.meta.dirname, ".."));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /all consistent/);
  // A tree with no skill in the norm format also exits 0; require at least one.
  assert.doesNotMatch(result.stdout, /check-norms: 0 skill/);
  assert.doesNotMatch(result.stdout, / 0 agent/);
});

void test("end to end: stray files are skipped and a null sidecar fails cleanly", (t) => {
  const root = mkdtempSync(join(tmpdir(), "check-norms-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dir = join(root, "plugins", "p", "skills", "s");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(root, "plugins", ".DS_Store"), "");
  writeFileSync(join(root, "plugins", "p", "skills", "README.md"), "");
  writeFileSync(join(dir, "SKILL.md"), "- [N01] a\n");
  writeFileSync(join(dir, "SKILL.norms.json"), "null");

  const result = run(root);
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stderr, /TypeError/);
  assert.match(result.stderr, /SKILL\.norms\.json: must be a JSON object/);
  assert.match(result.stderr, /1 error\(s\) across 1 skill\(s\) and 0 agent\(s\)/);
});

void test("end to end: an orphan sidecar fails", (t) => {
  const root = mkdtempSync(join(tmpdir(), "check-norms-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dir = join(root, "plugins", "p", "skills", "s");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.norms.json"), "{}");

  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /plugins\/p\/skills\/s\/SKILL\.norms\.json: has no SKILL\.md beside it/);
});

void test("end to end: an agent and an orphan agent sidecar are found", (t) => {
  const root = mkdtempSync(join(tmpdir(), "check-norms-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dir = join(root, "plugins", "p", "agents");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "a.md"), "- [N01] a\n");
  writeFileSync(join(dir, "a.norms.json"), JSON.stringify({ surface: "plugins/p/agents/a.md", norms: [entry("N01")] }));
  writeFileSync(join(dir, "orphan.norms.json"), "{}");

  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /plugins\/p\/agents\/orphan\.norms\.json: has no orphan\.md beside it/);
  assert.match(result.stderr, /1 error\(s\) across 0 skill\(s\) and 2 agent\(s\)/);
});

void test("end to end: run outside the repository root, it refuses instead of passing", (t) => {
  const root = mkdtempSync(join(tmpdir(), "check-norms-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const result = run(root);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /run it from the repository root/);
  assert.equal(result.stdout, "");
});

void test("end to end: a bare id in a README no sidecar serves fails", (t) => {
  const root = mkdtempSync(join(tmpdir(), "check-norms-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "plugins"), { recursive: true });
  writeFileSync(join(root, "README.md"), "# Readme\n\nFollow [N01].\n");

  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /README\.md:3: \[N01\] cites a norm, but no sidecar serves this file/);
});

// ─── Ported from the harness's norm-provenance checker ───────────────────────

// (a) `where` resolves to a real heading of the surface.

const SECTIONED = "# Skill\n\n## Plan\n\n- [N01] Do one thing.\n\n## Audit\n\n- [N02] Do another.\n";
const sectioned = (n01: Record<string, unknown>): SurfaceInput =>
  skill({ surface: SECTIONED, sidecar: { surface: SURFACE_PATH, norms: [entry("N01", n01), entry("N02", { where: "Audit" })] } });

void test("a where naming a heading of the surface passes", () => {
  assert.deepEqual(errorsOf(sectioned({ where: "Plan" })), []);
});

void test("a where naming a section the surface does not carry is reported", () => {
  assert.deepEqual(errorsOf(sectioned({ where: "Report" })), [`${SIDECAR_PATH}: N01 "where" "Report" names no heading in SKILL.md`]);
});

void test("a where resolves by prefix in both directions, since prose shortens a heading", () => {
  const surface = "## Stage 1 — Plan: list, estimate\n\n## Audit\n";
  assert.equal(whereResolves("Stage 1", surface), true);
  assert.equal(whereResolves("Audit in batches", surface), true);
  assert.equal(whereResolves("Stage 2", surface), false);
});

void test("a heading-shaped line inside a fenced block is not a heading a where can name", () => {
  const surface = "## Plan\n\n```md\n## Hidden\n```\n";
  assert.deepEqual(extractHeadings(surface), ["Plan"]);
  assert.equal(whereResolves("Hidden", surface), false);
});

void test("a where quoting a heading verbatim resolves wherever its inline-code span sits", () => {
  const surface = "## `x` leads\n\n## run `pnpm` now\n\n## ends in `y`\n";
  assert.equal(whereResolves("`x` leads", surface), true);
  assert.equal(whereResolves("run `pnpm` now", surface), true);
  assert.equal(whereResolves("ends in `y`", surface), true);
  assert.equal(whereResolves("`x` trails", surface), false);
});

void test("a where that is entirely one inline-code span names nothing and is reported", () => {
  assert.equal(normaliseWhere("`x`"), "");
  assert.deepEqual(errorsOf(sectioned({ where: "`Plan`" })), [`${SIDECAR_PATH}: N01 "where" "\`Plan\`" names no heading in SKILL.md`]);
});

void test("on a surface with no heading, any where resolves", () => {
  assert.equal(whereResolves("Anything", "- [N01] a\n"), true);
});

// (b) `refs` keys are owner/repo with integer arrays, or docs with https URLs.

void test("refs keyed by owner/repo with issue numbers, and docs with https URLs, pass", () => {
  assert.deepEqual(errorsOf(sectioned({ where: "Plan", refs: { "owner/repo": [1, 2], docs: ["https://example.com/page"] } })), []);
});

void test("a refs key that is not owner/repo or docs is reported", () => {
  assert.deepEqual(errorsOf(sectioned({ where: "Plan", refs: { issues: [1], "owner/repo": [2] } })), [
    `${SIDECAR_PATH}: N01 "refs" key "issues" is not owner/repo or "docs"`,
  ]);
});

void test("a refs repository whose value is not an array is reported", () => {
  assert.deepEqual(errorsOf(sectioned({ where: "Plan", refs: { "owner/repo": 3 } })), [
    `${SIDECAR_PATH}: N01 "refs" owner/repo must be an array of issue or pull request numbers`,
  ]);
});

void test("a ref that is not a positive integer is reported", () => {
  assert.deepEqual(errorsOf(sectioned({ where: "Plan", refs: { "owner/repo": [0, 1.5, "7", 4] } })), [
    `${SIDECAR_PATH}: N01 "refs" owner/repo holds 0, 1.5, "7", not a positive integer`,
  ]);
});

void test("a docs ref that is not an https URL is reported", () => {
  assert.deepEqual(errorsOf(sectioned({ where: "Plan", refs: { docs: ["http://example.com", 3] } })), [
    `${SIDECAR_PATH}: N01 "refs.docs" must be an array of https URLs`,
  ]);
});

// (c) Issue numbers the prose and `refs` disagree on: reported, never failed.

void test("unlistedBareRefs reports a bare number refs does not list, and is silent on one it does", () => {
  assert.deepEqual(unlistedBareRefs("Came from #12 and #7.", new Set([7])), [12]);
  assert.deepEqual(unlistedBareRefs("Came from #7.", new Set([7])), []);
});

void test("unlistedBareRefs ignores owner/repo#N, and still sees a bare number beside it", () => {
  assert.deepEqual(unlistedBareRefs("owner/repo#12", new Set()), []);
  assert.deepEqual(unlistedBareRefs("owner/repo#12 and #13", new Set()), [13]);
});

void test("unlistedBareRefs does not read a heading or a norm id as an issue, and deduplicates and sorts", () => {
  assert.deepEqual(unlistedBareRefs("## Section, [N12], a#4", new Set()), []);
  assert.deepEqual(unlistedBareRefs("#9, #3 and #9 again", new Set()), [3, 9]);
});

void test("uncitedRefNumbers reports a ref the prose never writes, and accepts it bare or qualified", () => {
  assert.deepEqual(uncitedRefNumbers("Fixed in #12.", [12, 13]), [13]);
  assert.deepEqual(uncitedRefNumbers("owner/repo#13 and #12", [12, 13]), []);
});

void test("uncitedRefNumbers does not read a longer number as citing its prefix", () => {
  assert.deepEqual(uncitedRefNumbers("See #123.", [12]), [12]);
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

void test("a consistent corpus reports nothing", () => {
  assert.deepEqual(checkCorpus(corpus()), { errors: [], notes: [] });
});

void test("surfaceQualifiers names a surface by each path segment and by its basename", () => {
  assert.deepEqual(surfaceQualifiers(SURFACE_PATH), ["plugins", "p", "skills", "s", "SKILL.md", "SKILL"]);
  assert.deepEqual(surfaceQualifiers(AGENT_PATH), ["plugins", "p", "agents", "a.md", "a"]);
});

void test("a qualified citation on a surface resolves to a norm another surface declares", () => {
  const skillSurface = `${SKILL_TEXT}- [N03] Use the agent's line, per [a#N01].\n`;
  assert.deepEqual(checkCorpus(corpus({ skillSurface, skillNorms: [entry("N01"), entry("N02"), entry("N03")] })).errors, []);
});

void test("a qualified citation whose surface has no such norm is reported", () => {
  const skillSurface = `${SKILL_TEXT}- [N03] Use the agent's line, per [a#N07].\n`;
  assert.deepEqual(checkCorpus(corpus({ skillSurface, skillNorms: [entry("N01"), entry("N02"), entry("N03")] })).errors, [
    `${SURFACE_PATH}:5: [a#N07] names ${AGENT_PATH}, whose a.norms.json has no entry N07`,
  ]);
});

void test("a qualified citation naming no surface, or several, is reported", () => {
  const skillSurface = `${SKILL_TEXT}- [N03] See [nope#N01] and [p#N01].\n`;
  assert.deepEqual(checkCorpus(corpus({ skillSurface, skillNorms: [entry("N01"), entry("N02"), entry("N03")] })).errors, [
    `${SURFACE_PATH}:5: [nope#N01] names no surface in the norm format`,
    `${SURFACE_PATH}:5: [p#N01] names 2 surfaces: ${AGENT_PATH}, ${SURFACE_PATH}`,
  ]);
});

void test("a qualified citation in a sidecar's what is checked, and one that resolves passes", () => {
  const resolving = checkCorpus(corpus({ skillNorms: [entry("N01", { what: "Mirrors [a#N01]." }), entry("N02")] }));
  assert.deepEqual(resolving.errors, []);
  const dangling = checkCorpus(corpus({ skillNorms: [entry("N01", { what: "Mirrors [a#N07]." }), entry("N02")] }));
  assert.deepEqual(dangling.errors, [`${SIDECAR_PATH}: N01.what: [a#N07] names ${AGENT_PATH}, whose a.norms.json has no entry N07`]);
});

void test("a bare id in sidecar prose that the sidecar does not declare is a note, not an error", () => {
  const result = checkCorpus(corpus({ skillNorms: [entry("N01", { what: "Once [N09], twice [N09]; `[N08]` is prose." }), entry("N02")] }));
  assert.deepEqual(result, { errors: [], notes: [`${SIDECAR_PATH}: N01.what cites [N09], which this sidecar has no entry for`] });
});

void test("issue numbers the prose and refs disagree on are notes, not errors", () => {
  const result = checkCorpus(corpus({ skillNorms: [entry("N01", { what: "Came from #6.", refs: { "owner/repo": [5] } }), entry("N02")] }));
  assert.deepEqual(result, {
    errors: [],
    notes: [`${SIDECAR_PATH}: N01 lists owner/repo #5 in "refs", but its prose never cites it`, `${SIDECAR_PATH}: N01.what cites #6, which "refs" does not list`],
  });
});

void test("a bare id in Markdown no sidecar serves fails", () => {
  const markdown = [{ path: "README.md", source: "# Readme\n\nFollow [N01].\n" }];
  assert.deepEqual(checkCorpus(corpus({ markdown })).errors, [
    "README.md:3: [N01] cites a norm, but no sidecar serves this file; qualify it as [<skill-or-agent>#N01], or write it in backticks where the text is about the format",
  ]);
});

void test("an id in an inline-code span or a fenced block of such Markdown is prose about the format", () => {
  const markdown = [{ path: "CONTRIBUTING.md", source: "Write `- [N07] Do it`.\n\n```md\n- [N01] Example\n```\n" }];
  assert.deepEqual(checkCorpus(corpus({ markdown })).errors, []);
});

void test("a qualified citation in Markdown no sidecar serves is resolved, not reported as ungoverned", () => {
  const passes = checkCorpus(corpus({ markdown: [{ path: "README.md", source: "See [a#N01].\n" }] }));
  assert.deepEqual(passes.errors, []);
  const fails = checkCorpus(corpus({ markdown: [{ path: "README.md", source: "See [a#N07].\n" }] }));
  assert.deepEqual(fails.errors, [`README.md:1: [a#N07] names ${AGENT_PATH}, whose a.norms.json has no entry N07`]);
});

void test("a governed surface is not swept as ungoverned, even when its sidecar fails to parse", () => {
  const markdown = [{ path: SURFACE_PATH, source: SKILL_TEXT }];
  assert.deepEqual(checkCorpus(corpus({ markdown })).errors, []);
  assert.deepEqual(checkCorpus(corpus({ markdown, skillSidecar: "{ not json" })).errors, []);
});

void test("extractCitations reads both spellings with their lines, skipping code", () => {
  assert.deepEqual(extractCitations("a [N01] b [s#N02]\n`[N03]`\n```\n[N04]\n```\n[N5]"), [
    { id: "N01", qualifier: null, line: 1 },
    { id: "N02", qualifier: "s", line: 1 },
    { id: "N5", qualifier: null, line: 6 },
  ]);
});

void test("blankCodeRegions keeps lines and columns, and leaves an unterminated backtick as prose", () => {
  assert.equal(blankCodeRegions("a `b` c\n``` x"), "a     c\n     ");
  assert.equal(blankCodeRegions("a `b c"), "a `b c");
});
