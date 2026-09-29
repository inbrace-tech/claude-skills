// End-to-end tests: run sync-plugin-version against this repository and throwaway fixture trees
// (`pnpm test`). The pure rules are tested with strings in sync-plugin-version.logic.spec.ts.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("sync-plugin-version, end to end", () => {
  const script = join(import.meta.dirname, "sync-plugin-version.ts");
  const run = (cwd: string, ...args: string[]) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });

  /** A one-plugin tree with plugin.json at 0.1.0 and package.json at `packageVersion`. */
  function fixture(onTestFinished: (fn: () => void) => void, packageVersion: string, entryVersion?: string): string {
    const root = mkdtempSync(join(tmpdir(), "sync-plugin-version-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const dir = join(root, "plugins", "p");
    mkdirSync(join(dir, ".claude-plugin"), { recursive: true });
    mkdirSync(join(root, ".claude-plugin"));
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "p", version: packageVersion, private: true }));
    writeFileSync(join(dir, ".claude-plugin", "plugin.json"), '{\n  "name": "p",\n  "version": "0.1.0"\n}\n');
    const entry = { name: "p", source: "./plugins/p", ...(entryVersion === undefined ? {} : { version: entryVersion }) };
    writeFileSync(join(root, ".claude-plugin", "marketplace.json"), JSON.stringify({ name: "m", plugins: [entry] }));
    return root;
  }

  const pluginJson = (root: string): string => readFileSync(join(root, "plugins", "p", ".claude-plugin", "plugin.json"), "utf8");

  it("this repository is in sync", () => {
    const result = run(join(import.meta.dirname, ".."), "--check");
    expect(result.status, `check-version failed:\n${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/in sync: plugins\//);
  });

  it("--check fails on a difference and writes nothing", ({ onTestFinished }) => {
    const root = fixture(onTestFinished, "0.2.0");
    const result = run(root, "--check");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/plugins\/p\/\.claude-plugin\/plugin\.json: version differs from plugins\/p\/package\.json \(0\.2\.0\)/);
    expect(pluginJson(root)).toMatch(/"0\.1\.0"/);
  });

  it("without --check writes the package's version, then --check passes", ({ onTestFinished }) => {
    const root = fixture(onTestFinished, "0.2.0");
    expect(run(root).status).toBe(0);
    expect(pluginJson(root)).toBe('{\n  "name": "p",\n  "version": "0.2.0"\n}\n');
    expect(run(root, "--check").status).toBe(0);
  });

  it("fails when a marketplace entry sets another version", ({ onTestFinished }) => {
    const root = fixture(onTestFinished, "0.1.0", "0.0.9");
    const result = run(root, "--check");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/"p" entry sets version "0\.0\.9"/);
  });

  it("exits 2 outside the repository root", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "sync-plugin-version-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    expect(run(root, "--check").status).toBe(2);
  });
});
