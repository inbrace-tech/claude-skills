// End-to-end tests for the release helpers: check-changeset-size, release-notes and
// verify-tag-signature, run against this repository and throwaway fixtures (`pnpm test`).
// Their pure rules are tested with strings in the matching *.logic.spec.ts.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repo = join(import.meta.dirname, "..");
const run = (script: string, cwd: string, ...args: string[]) => spawnSync(process.execPath, [join(import.meta.dirname, script), ...args], { cwd, encoding: "utf8" });

function tempDir(onTestFinished: (fn: () => void) => void): string {
  const root = mkdtempSync(join(tmpdir(), "release-checks-"));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

describe("check-changeset-size, end to end", () => {
  it("this repository's pending changesets pass", () => {
    const result = run("check-changeset-size.ts", repo);
    expect(result.status, `check-changeset-size failed:\n${result.stderr}`).toBe(0);
  });

  it("fails a changeset whose summary runs over two lines", ({ onTestFinished }) => {
    const root = tempDir(onTestFinished);
    mkdirSync(join(root, "plugins", "p"), { recursive: true });
    mkdirSync(join(root, ".changeset"));
    writeFileSync(join(root, "plugins", "p", "package.json"), JSON.stringify({ name: "p", version: "1.0.0", private: true }));
    writeFileSync(join(root, ".changeset", "README.md"), "Not a changeset.\n");
    writeFileSync(join(root, ".changeset", "a.md"), '---\n"p": patch\n---\n\nOne.\nTwo.\n');
    const result = run("check-changeset-size.ts", root);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/\.changeset\/a\.md: the summary spans 2 lines/);
    expect(result.stderr).toMatch(/1 error\(s\) across 1 changeset\(s\)/);
  });
});

describe("release-notes, end to end", () => {
  it("prints this repository's 0.5.0 section and the link at its tag", () => {
    const result = run("release-notes.ts", repo, "0.5.0");
    expect(result.status, `release-notes failed:\n${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/^- New skill, `\/inbrace-config:audit-sonnet-5-5`/);
    expect(result.stdout).not.toMatch(/## 0\.4\.7/);
    expect(result.stdout).toMatch(/Full changelog: https:\/\/github\.com\/inbrace-tech\/claude-skills\/blob\/inbrace-config@0\.5\.0\/plugins\/inbrace-config\/CHANGELOG\.md\n$/);
  });

  it("fails on a version with no section, and without a version", () => {
    expect(run("release-notes.ts", repo, "9.9.9").status).toBe(1);
    expect(run("release-notes.ts", repo).status).toBe(2);
  });
});

describe("verify-tag-signature, end to end", () => {
  /** A repository with one commit, a lightweight tag and an unsigned annotated one. */
  function fixture(onTestFinished: (fn: () => void) => void): string {
    const root = tempDir(onTestFinished);
    const git = (...args: string[]) => execFileSync("git", ["-c", "user.name=T", "-c", "user.email=t@example.com", "-c", "tag.gpgSign=false", "-c", "commit.gpgSign=false", ...args], { cwd: root, stdio: "ignore" });
    git("init", "--quiet");
    git("commit", "--quiet", "--allow-empty", "--message", "c");
    git("tag", "p@1.0.0");
    git("tag", "--annotate", "--message", "p@1.1.0", "p@1.1.0");
    return root;
  }

  it("refuses a lightweight tag, an unsigned one and a missing one", ({ onTestFinished }) => {
    const root = fixture(onTestFinished);
    const lightweight = run("verify-tag-signature.ts", root, "p@1.0.0");
    expect(lightweight.status).toBe(1);
    expect(lightweight.stderr).toMatch(/p@1\.0\.0 is a lightweight tag/);
    const unsigned = run("verify-tag-signature.ts", root, "p@1.1.0");
    expect(unsigned.status).toBe(1);
    expect(unsigned.stderr).toMatch(/p@1\.1\.0 is annotated but not signed/);
    expect(run("verify-tag-signature.ts", root, "p@2.0.0").stderr).toMatch(/no such tag in this clone/);
  });

  it("exits 2 without a tag", ({ onTestFinished }) => {
    expect(run("verify-tag-signature.ts", fixture(onTestFinished)).status).toBe(2);
  });
});
