// End-to-end tests: run check-norms against this repository and throwaway fixture trees (`pnpm test`).
// The pure rules are tested with strings in check-norms.logic.spec.ts.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serialiseSidecar } from "./sidecar-layout.logic.ts";

describe("check-norms, end to end", () => {
  const entry = (id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({ id, where: "Stage 1", refs: {}, what: "Why it exists.", ...overrides });

  const script = join(import.meta.dirname, "check-norms.ts");
  const run = (cwd: string) => spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });

  it("this repository passes", () => {
    const result = run(join(import.meta.dirname, ".."));
    expect(result.status, `check-norms failed:\n${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/all consistent/);
    // A tree with no skill in the norm format also exits 0; require at least one.
    expect(result.stdout).not.toMatch(/check-norms: 0 skill/);
    expect(result.stdout).not.toMatch(/ 0 agent/);
  });

  it("end to end: stray files are skipped and a null sidecar fails cleanly", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-norms-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const dir = join(root, "plugins", "p", "skills", "s");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(root, "plugins", ".DS_Store"), "");
    writeFileSync(join(root, "plugins", "p", "skills", "README.md"), "");
    writeFileSync(join(dir, "SKILL.md"), "- [N01] a\n");
    writeFileSync(join(dir, "SKILL.norms.json"), "null");

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).not.toMatch(/TypeError/);
    expect(result.stderr).toMatch(/SKILL\.norms\.json: must be a JSON object/);
    expect(result.stderr).toMatch(/1 error\(s\) across 1 skill\(s\) and 0 agent\(s\)/);
  });

  it("end to end: a positional argument in a skill fails, in an agent it does not", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-norms-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const skill = join(root, "plugins", "p", "skills", "s");
    const agents = join(root, "plugins", "p", "agents");
    mkdirSync(skill, { recursive: true });
    mkdirSync(agents, { recursive: true });
    writeFileSync(join(skill, "SKILL.md"), "- [N01] It costs US$2 a run.\n");
    writeFileSync(join(skill, "SKILL.norms.json"), serialiseSidecar({ surface: "plugins/p/skills/s/SKILL.md", norms: [entry("N01")] }));
    writeFileSync(join(agents, "a.md"), "- [N01] It costs US$2 a run.\n");
    writeFileSync(join(agents, "a.norms.json"), serialiseSidecar({ surface: "plugins/p/agents/a.md", norms: [entry("N01")] }));

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/plugins\/p\/skills\/s\/SKILL\.md:1: `\$2` is replaced by an argument/);
    expect(result.stderr).not.toMatch(/agents\/a\.md:1/);
  });

  it("end to end: an orphan sidecar fails", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-norms-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const dir = join(root, "plugins", "p", "skills", "s");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.norms.json"), "{}");

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/plugins\/p\/skills\/s\/SKILL\.norms\.json: has no SKILL\.md beside it/);
  });

  it("end to end: an agent and an orphan agent sidecar are found", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-norms-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const dir = join(root, "plugins", "p", "agents");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "a.md"), "- [N01] a\n");
    writeFileSync(join(dir, "a.norms.json"), serialiseSidecar({ surface: "plugins/p/agents/a.md", norms: [entry("N01")] }));
    writeFileSync(join(dir, "orphan.norms.json"), "{}");

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/plugins\/p\/agents\/orphan\.norms\.json: has no orphan\.md beside it/);
    expect(result.stderr).toMatch(/1 error\(s\) across 0 skill\(s\) and 2 agent\(s\)/);
  });

  it("end to end: run outside the repository root, it refuses instead of passing", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-norms-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));

    const result = run(root);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/run it from the repository root/);
    expect(result.stdout).toBe("");
  });

  it("end to end: a knowledge file is found and checked with its sidecar and its digest, and an orphan sidecar fails", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-norms-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const dir = join(root, "plugins", "p", "skills", "t", "transitions");
    mkdirSync(dir, { recursive: true });
    const front = "---\ntransition: a-to-b\ntitle: A → B\nsource: { name: A }\ntarget: { name: B }\nclaude-code-floor: v2.1.0\nverified: 2026-09-29\n---\n";
    const trap = "### P01 — A trap\n\n- kind: change\n- area: settings\n- signal: x\n- applies when: always\n- change: y\n- confidence: high\n- sweep: no\n- source: https://example.com\n  basis: inference: a reason\n";
    writeFileSync(join(dir, "a-to-b.md"), `${front}\n<traps>\n\n${trap}\n</traps>\n`);
    writeFileSync(join(dir, "a-to-b.traps.json"), serialiseSidecar({ transition: "plugins/p/skills/t/transitions/a-to-b.md", traps: [{ id: "P01", learned: "Why.", refs: {} }] }));

    const withoutDigest = run(root);
    expect(withoutDigest.status).toBe(1);
    expect(withoutDigest.stderr).toMatch(/transitions\/a-to-b\.md: has no a-to-b\.digest\.md/);

    const change = '### C01 — A change\n\n- change: y\n- source: https://example.com\n  passage: "the doc says so"\n  verified: 2026-10-02\n';
    writeFileSync(join(dir, "a-to-b.digest.md"), `---\ntransition: a-to-b\nverified: 2026-10-02\n---\n\n<changes>\n\n${change}\n</changes>\n`);

    const passing = run(root);
    expect(passing.stderr).toBe("");
    expect(passing.status).toBe(0);
    expect(passing.stdout).toMatch(/and 1 knowledge file\(s\), all consistent/);

    writeFileSync(join(dir, "c-to-d.traps.json"), "{}");
    const failing = run(root);
    expect(failing.status).toBe(1);
    expect(failing.stderr).toMatch(/transitions\/c-to-d\.traps\.json: has no c-to-d\.md beside it/);
  });

  it("end to end: a skill over its declared ceiling fails, even with no norm", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-norms-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const dir = join(root, "plugins", "p", "skills", "s");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), `---\nname: s\nmetadata:\n  max-bytes: 64\n---\n\n${"x".repeat(100)}\n`);

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/plugins\/p\/skills\/s\/SKILL\.md: \d+ bytes, over its metadata\.max-bytes of 64/);
  });

  it("end to end: a bare id in a README no sidecar serves fails", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-norms-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(join(root, "plugins"), { recursive: true });
    writeFileSync(join(root, "README.md"), "# Readme\n\nFollow [N01].\n");

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/README\.md:3: \[N01\] cites a norm, but no sidecar serves this file/);
  });
});
