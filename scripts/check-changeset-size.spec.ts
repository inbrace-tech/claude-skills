// End-to-end tests: run check-changeset-size against this repository and throwaway fixture trees
// (`pnpm test`). The pure rules are tested with strings in check-changeset-size.logic.spec.ts.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("check-changeset-size, end to end", () => {
  const script = join(import.meta.dirname, "check-changeset-size.ts");
  const run = (cwd: string) => spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });

  /** A tree with plugin `p` and the given `.changeset/` files beside a README that is not a changeset. */
  function fixture(onTestFinished: (fn: () => void) => void, changesets: Record<string, string>): string {
    const root = mkdtempSync(join(tmpdir(), "check-changeset-size-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(join(root, "plugins", "p"), { recursive: true });
    mkdirSync(join(root, ".changeset"));
    writeFileSync(join(root, "plugins", "p", "package.json"), JSON.stringify({ name: "p", version: "1.0.0", private: true }));
    writeFileSync(join(root, ".changeset", "README.md"), "Not a changeset.\nIt has two lines.\n");
    for (const [name, text] of Object.entries(changesets)) writeFileSync(join(root, ".changeset", name), text);
    return root;
  }

  it("this repository's pending changesets pass", () => {
    const result = run(join(import.meta.dirname, ".."));
    expect(result.status, `check-changeset-size failed:\n${result.stderr}`).toBe(0);
  });

  it("passes one-line changesets, one with changelog-github's override lines", ({ onTestFinished }) => {
    const result = run(fixture(onTestFinished, { "a.md": '---\n"p": patch\n---\n\nFix.\n', "b.md": '---\n"p": minor\n---\n\npr: #1\nauthor: @a\nAdd.\n' }));
    expect(result.status, `check-changeset-size failed:\n${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/2 changeset\(s\), all one line within the ceiling/);
  });

  it("fails a changeset whose summary runs over two lines", ({ onTestFinished }) => {
    const result = run(fixture(onTestFinished, { "a.md": '---\n"p": patch\n---\n\nOne.\nTwo.\n' }));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/\.changeset\/a\.md: the summary spans 2 lines/);
    expect(result.stderr).toMatch(/1 error\(s\) across 1 changeset\(s\)/);
  });

  it("fails a changeset naming a package that is not a plugin here", ({ onTestFinished }) => {
    const result = run(fixture(onTestFinished, { "a.md": '---\n"q": patch\n---\n\nFix.\n' }));
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/names "q", which is not a plugin package here \(p\)/);
  });

  it("exits 2 outside the repository root", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "check-changeset-size-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    expect(run(root).status).toBe(2);
  });
});
