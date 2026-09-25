// End-to-end tests for check-norms: they run the script itself, against this
// repository and against throwaway fixture trees.
//   pnpm test
// The pure rules are tested with strings in `check-norms.logic.spec.ts`.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
    writeFileSync(join(dir, "a.norms.json"), JSON.stringify({ surface: "plugins/p/agents/a.md", norms: [entry("N01")] }));
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
