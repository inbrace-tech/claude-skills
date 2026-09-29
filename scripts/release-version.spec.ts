// End-to-end tests: run release-version in a throwaway one-plugin repository whose origin is a
// throwaway bare repository (`pnpm test`). No network and no real token: the fixture's changelog is
// Changesets' `false`, so `changeset version` never asks GitHub, and the token tests stop before it.
// The pure rules are tested in release-version.logic.spec.ts and release-preconditions.logic.spec.ts.

import { execFileSync, spawnSync } from "node:child_process";
import type { SpawnSyncReturns } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = join(import.meta.dirname, "release-version.ts");

interface Fixture {
  root: string;
  work: string;
  git: (...args: string[]) => string;
  /** Runs release-version; `token` sets GITHUB_TOKEN, and gh always reads an empty config, so it has no token of its own. */
  release: (options?: { token?: string; args?: string[] }) => SpawnSyncReturns<string>;
  version: (file: "package.json" | ".claude-plugin/plugin.json") => unknown;
}

/** A repository with plugin `p` at 1.0.0, pushed to a bare origin, with a patch changeset pending unless `pending` is false. */
function fixture(onTestFinished: (fn: () => void) => void, pending = true): Fixture {
  const root = mkdtempSync(join(tmpdir(), "release-version-"));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  const work = join(root, "work");
  const remote = join(root, "remote.git");
  mkdirSync(join(root, "gh"));
  writeFileSync(join(root, "gitconfig"), "[user]\n\tname = T\n\temail = t@example.com\n[commit]\n\tgpgSign = false\n[init]\n\tdefaultBranch = main\n");
  // Only this fixture's git config, and no token from the caller's environment or gh login.
  const env: NodeJS.ProcessEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_") && name !== "GITHUB_TOKEN" && name !== "GH_TOKEN"));
  Object.assign(env, { GIT_CONFIG_GLOBAL: join(root, "gitconfig"), GIT_CONFIG_NOSYSTEM: "1", GH_CONFIG_DIR: join(root, "gh") });

  const files: Record<string, string> = {
    "package.json": JSON.stringify({ private: true }),
    "pnpm-workspace.yaml": "packages:\n  - plugins/*\n",
    ".changeset/config.json": JSON.stringify({ changelog: false, commit: false, baseBranch: "main", fixed: [], linked: [], ignore: [], privatePackages: { version: true, tag: true } }),
    ".changeset/README.md": "Not a changeset.\n",
    ".claude-plugin/marketplace.json": JSON.stringify({ name: "m", plugins: [{ name: "p", source: "./plugins/p" }] }),
    "plugins/p/package.json": JSON.stringify({ name: "p", version: "1.0.0", private: true }),
    "plugins/p/.claude-plugin/plugin.json": '{\n  "name": "p",\n  "version": "1.0.0"\n}\n',
    ...(pending ? { ".changeset/brave-owls.md": '---\n"p": patch\n---\n\nFix a rule.\n' } : {}),
  };
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(work, path, ".."), { recursive: true });
    writeFileSync(join(work, path), text);
  }

  execFileSync("git", ["init", "--quiet", "--bare", remote], { env });
  const git = (...args: string[]): string => execFileSync("git", args, { cwd: work, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  git("init", "--quiet");
  git("add", ".");
  git("commit", "--quiet", "--message", "init");
  git("remote", "add", "origin", remote);
  git("push", "--quiet", "origin", "main");

  return {
    root,
    work,
    git,
    release: ({ token, args = [] } = {}) =>
      spawnSync(process.execPath, [script, ...args], { cwd: work, env: token === undefined ? env : { ...env, GITHUB_TOKEN: token }, encoding: "utf8" }),
    version: (file) => (JSON.parse(readFileSync(join(work, "plugins", "p", file), "utf8")) as { version?: unknown }).version,
  };
}

describe("release-version, end to end", () => {
  it("moves the version in package.json and plugin.json and consumes the changeset", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    const result = f.release({ token: "unused-by-a-false-changelog" });
    expect(result.status, `release-version failed:\n${result.stdout}\n${result.stderr}`).toBe(0);
    expect(f.version("package.json")).toBe("1.0.1");
    expect(f.version(".claude-plugin/plugin.json")).toBe("1.0.1");
    expect(f.git("status", "--porcelain")).toMatch(/ D \.changeset\/brave-owls\.md/);
    expect(result.stdout).not.toMatch(/unused-by-a-false-changelog/);
    expect(result.stderr).not.toMatch(/unused-by-a-false-changelog/);
  });

  it("without GITHUB_TOKEN or a gh login, fails before Changesets runs", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    const result = f.release();
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/the changelog needs a GitHub token: export GITHUB_TOKEN, or sign in with `gh auth login`/);
    expect(f.version("package.json")).toBe("1.0.0");
  });

  it("refuses with no pending changeset", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished, false);
    const result = f.release({ token: "t" });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not running `version`:\n- no pending changeset in \.changeset\/: there is nothing to release/);
  });

  it("refuses a dirty tree and a HEAD that is not origin/main, listing both, and changes nothing", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    f.git("commit", "--quiet", "--allow-empty", "--message", "local only");
    writeFileSync(join(f.work, "stray.txt"), "");
    const result = f.release({ token: "t" });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not running `version`:\n- the working tree has changes:\n\?\? stray\.txt/);
    expect(result.stderr).toMatch(/- HEAD is [0-9a-f]{40} but origin\/main is [0-9a-f]{40}; the version pull request starts from the latest main/);
    expect(f.version("package.json")).toBe("1.0.0");
  });

  it("fails when origin cannot be reached, instead of passing", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    f.git("remote", "set-url", "origin", join(f.root, "gone.git"));
    const result = f.release({ token: "t" });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/git fetch origin main exited/);
  });

  it("exits 2 on any argument", ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    const result = f.release({ args: ["--dry-run"] });
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/unexpected argument\(s\): --dry-run/);
  });
});
