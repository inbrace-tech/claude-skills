// End-to-end tests: run release-notes against this repository and a throwaway two-plugin tree
// (`pnpm test`). The pure rules are tested with strings in release-notes.logic.spec.ts.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("release-notes, end to end", () => {
  const repo = join(import.meta.dirname, "..");
  const script = join(import.meta.dirname, "release-notes.ts");
  const run = (cwd: string, ...args: string[]) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });

  /** Plugins `p` (a 1.0.0 section, an empty 0.9.0 one) and `q` (no changelog). */
  function fixture(onTestFinished: (fn: () => void) => void): string {
    const root = mkdtempSync(join(tmpdir(), "release-notes-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(join(root, "plugins", "p"), { recursive: true });
    mkdirSync(join(root, "plugins", "q"), { recursive: true });
    writeFileSync(join(root, "plugins", "p", "CHANGELOG.md"), "# p\n\n## 1.0.0\n\n- First.\n\n## 0.9.0\n\n");
    return root;
  }

  it("prints this repository's 0.5.0 section and the link at its tag", () => {
    const result = run(repo, "0.5.0");
    expect(result.status, `release-notes failed:\n${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/^- New skill, `\/inbrace-config:audit-sonnet-5-5`/);
    expect(result.stdout).not.toMatch(/## 0\.4\.7/);
    expect(result.stdout).toMatch(/Full changelog: https:\/\/github\.com\/inbrace-tech\/claude-skills\/blob\/inbrace-config@0\.5\.0\/plugins\/inbrace-config\/CHANGELOG\.md\n$/);
  });

  it("reads the version as v0.5.0 and inbrace-config@0.5.0 too", () => {
    for (const arg of ["v0.5.0", "inbrace-config@0.5.0"]) expect(run(repo, arg).stdout).toMatch(/^- New skill/);
  });

  it("exits 1 on a version with no section, 2 without a version or with a malformed one", () => {
    expect(run(repo, "9.9.9").status).toBe(1);
    expect(run(repo).status).toBe(2);
    expect(run(repo, "0.5").status).toBe(2);
    expect(run(repo, "other@0.5.0").status).toBe(2);
  });

  it("with several plugins, takes the plugin from --plugin or the tag, and asks for one otherwise", ({ onTestFinished }) => {
    const root = fixture(onTestFinished);
    expect(run(root, "1.0.0", "--plugin", "p").stdout).toMatch(/^- First\.\n\nFull changelog: .*\/blob\/p@1\.0\.0\/plugins\/p\/CHANGELOG\.md\n$/);
    expect(run(root, "p@1.0.0").stdout).toMatch(/^- First\./);
    const ambiguous = run(root, "1.0.0");
    expect(ambiguous.status).toBe(2);
    expect(ambiguous.stderr).toMatch(/several plugins here \(p, q\)/);
    expect(run(root, "p@1.0.0", "--plugin", "q").status).toBe(2);
  });

  it("exits 1 on an empty section and on a plugin without a changelog", ({ onTestFinished }) => {
    const root = fixture(onTestFinished);
    const empty = run(root, "p@0.9.0");
    expect(empty.status).toBe(1);
    expect(empty.stderr).toMatch(/"## 0\.9\.0" section is empty/);
    const missing = run(root, "q@1.0.0");
    expect(missing.status).toBe(1);
    expect(missing.stderr).toMatch(/plugins\/q\/CHANGELOG\.md does not exist/);
  });
});
