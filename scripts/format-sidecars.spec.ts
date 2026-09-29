// End-to-end tests: run format-sidecars in throwaway fixture trees (`pnpm test`).
// The pure rules are tested with strings in format-sidecars.logic.spec.ts and sidecar-layout.logic.spec.ts.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("format-sidecars, end to end", () => {
  const script = join(import.meta.dirname, "format-sidecars.ts");
  const checkNorms = join(import.meta.dirname, "check-norms.ts");
  const run = (file: string, cwd: string) => spawnSync(process.execPath, [file], { cwd, encoding: "utf8" });

  const sidecar = {
    surface: "plugins/p/skills/s/SKILL.md",
    norms: [{ id: "N01", where: "Stage 1", refs: { "o/r": [1, 2] }, what: "Why it exists (#1, #2)." }],
  };

  function fixture(onTestFinished: (fn: () => void) => void): string {
    const root = mkdtempSync(join(tmpdir(), "format-sidecars-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const dir = join(root, "plugins", "p", "skills", "s");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), "# S\n\n## Stage 1\n\n- [N01] Do one thing.\n");
    writeFileSync(join(dir, "SKILL.norms.json"), `${JSON.stringify(sidecar, null, 2)}\n`);
    return root;
  }

  it("check-norms fails an expanded sidecar; format-sidecars rewrites it with the same content; check-norms then passes", ({ onTestFinished }) => {
    const root = fixture(onTestFinished);
    const path = join(root, "plugins", "p", "skills", "s", "SKILL.norms.json");

    const before = run(checkNorms, root);
    expect(before.status).toBe(1);
    expect(before.stderr).toMatch(/SKILL\.norms\.json: not in the sidecar layout; run `pnpm run format:sidecars`/);

    const formatted = run(script, root);
    expect(formatted.status).toBe(0);
    expect(formatted.stdout).toMatch(/1 of 1 sidecar\(s\) rewritten/);
    const text = readFileSync(path, "utf8");
    expect(text).toMatch(/"refs": \{ "o\/r": \[1, 2\] \},/);
    expect(JSON.parse(text)).toStrictEqual(sidecar);

    expect(run(checkNorms, root).status).toBe(0);
    expect(run(script, root).stdout).toMatch(/0 of 1 sidecar\(s\) rewritten/);
  });

  it("leaves invalid JSON alone and exits 1", ({ onTestFinished }) => {
    const root = fixture(onTestFinished);
    const path = join(root, "plugins", "p", "skills", "s", "SKILL.norms.json");
    writeFileSync(path, "{ broken");

    const result = run(script, root);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/SKILL\.norms\.json is not valid JSON/);
    expect(readFileSync(path, "utf8")).toBe("{ broken");
  });

  it("refuses to run outside the repository root", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "format-sidecars-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const result = run(script, root);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/run it from the repository root/);
  });
});
