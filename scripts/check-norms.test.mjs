// Tests for check-norms. Node's built-in runner, no dependencies:
//   node --test "scripts/*.test.mjs"
// The pure rules are tested with strings; two end-to-end tests run the script
// itself, against this repository and against a throwaway fixture tree.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkSkill, definedNorms } from "./check-norms.logic.mjs";

const SURFACE_PATH = "plugins/p/skills/s/SKILL.md";
const SIDECAR_PATH = "plugins/p/skills/s/SKILL.norms.json";

const entry = (id, overrides = {}) => ({ id, where: "Stage 1", refs: {}, what: "Why it exists.", ...overrides });

/** A consistent two-norm skill; each test breaks exactly one thing. */
function skill({ surface, sidecar, sidecarText } = {}) {
  return {
    surfacePath: SURFACE_PATH,
    sidecarPath: SIDECAR_PATH,
    surface: surface ?? "# Skill\n\n- [N01] Do one thing.\n- [N02] Do another, after [N01].\n",
    sidecarText:
      sidecarText !== undefined
        ? sidecarText
        : JSON.stringify(sidecar ?? { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02")] }),
  };
}

const errorsOf = (input) => checkSkill(input).errors;

test("a consistent skill passes", () => {
  assert.deepEqual(checkSkill(skill()), { inFormat: true, errors: [] });
});

test("a skill with no norm and no sidecar is skipped", () => {
  assert.deepEqual(checkSkill(skill({ surface: "# Plain skill\n\nNo norms here.\n", sidecarText: null })), {
    inFormat: false,
    errors: [],
  });
});

test("definedNorms reads only list items led by an id", () => {
  assert.deepEqual(definedNorms("- [N01] a\nText citing [N02].\n  - [N03] nested\n- [N04] b\n"), ["N01", "N04"]);
});

test("norms without a sidecar", () => {
  assert.deepEqual(errorsOf(skill({ sidecarText: null })), [`${SURFACE_PATH}: defines norms but has no SKILL.norms.json`]);
});

test("a sidecar that is not JSON", () => {
  const [error] = errorsOf(skill({ sidecarText: "{ not json" }));
  assert.match(error, /: invalid JSON \(/);
});

for (const [label, text] of [["null", "null"], ["a string", '"text"'], ["an array", "[]"], ["a number", "7"]]) {
  test(`a sidecar whose root is ${label} is reported, not thrown`, () => {
    assert.deepEqual(errorsOf(skill({ sidecarText: text })), [`${SIDECAR_PATH}: must be a JSON object`]);
  });
}

test("a surface field naming another file", () => {
  const errors = errorsOf(skill({ sidecar: { surface: "elsewhere/SKILL.md", norms: [entry("N01"), entry("N02")] } }));
  assert.deepEqual(errors, [`${SIDECAR_PATH}: surface is "elsewhere/SKILL.md", expected "${SURFACE_PATH}"`]);
});

test("a norm defined twice", () => {
  const errors = errorsOf(skill({ surface: "- [N01] a\n- [N01] b\n", sidecar: { surface: SURFACE_PATH, norms: [entry("N01")] } }));
  assert.deepEqual(errors, [`${SURFACE_PATH}: norm N01 is defined more than once`]);
});

test("norms that is not an array", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: {} } }));
  assert.ok(errors.includes(`${SIDECAR_PATH}: "norms" must be an array`));
});

test("an entry with an invalid id", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02"), entry("N1")] } }));
  assert.deepEqual(errors, [`${SIDECAR_PATH}: entry with invalid id "N1"`]);
});

test("an entry recorded twice", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N02"), entry("N02")] } }));
  assert.deepEqual(errors, [`${SIDECAR_PATH}: N02 is recorded more than once`]);
});

test("an entry with an empty where, an empty what and array refs", () => {
  const bad = entry("N02", { where: " ", what: "", refs: [] });
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), bad] } }));
  assert.deepEqual(errors, [
    `${SIDECAR_PATH}: N02 has no "where"`,
    `${SIDECAR_PATH}: N02 has no "what"`,
    `${SIDECAR_PATH}: N02 "refs" must be an object`,
  ]);
});

test("a norm with no entry, and an entry with no norm", () => {
  const errors = errorsOf(skill({ sidecar: { surface: SURFACE_PATH, norms: [entry("N01"), entry("N03")] } }));
  assert.deepEqual(errors, [`${SURFACE_PATH}: N02 has no entry in SKILL.norms.json`, `${SIDECAR_PATH}: N03 matches no norm in SKILL.md`]);
});

test("a cross-reference to an undefined norm", () => {
  const errors = errorsOf(skill({ surface: "- [N01] a, unlike [N09].\n- [N02] b\n" }));
  assert.deepEqual(errors, [`${SURFACE_PATH}: cross-reference [N09] names no norm defined here`]);
});

const script = join(import.meta.dirname, "check-norms.mjs");
const run = (cwd) => spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });

test("this repository passes", () => {
  const result = run(join(import.meta.dirname, ".."));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /all consistent/);
  // A tree with no skill in the norm format also exits 0; require at least one.
  assert.doesNotMatch(result.stdout, /check-norms: 0 skill/);
});

test("end to end: stray files are skipped and a null sidecar fails cleanly", (t) => {
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
  assert.match(result.stderr, /1 error\(s\) across 1 skill\(s\)/);
});
