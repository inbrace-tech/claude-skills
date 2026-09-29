// End-to-end tests: run `release.ts tag` in a throwaway one-plugin repository whose origin is a
// throwaway bare repository, signing with a throwaway SSH key (`pnpm test`). Never touches this
// repository's origin or the maintainer's keys. The pure rules are tested in release.logic.spec.ts.

import { execFileSync, spawnSync } from "node:child_process";
import type { SpawnSyncReturns } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = join(import.meta.dirname, "release.ts");

interface Fixture {
  work: string;
  env: NodeJS.ProcessEnv;
  git: (...args: string[]) => string;
  release: (...args: string[]) => SpawnSyncReturns<string>;
  remoteTags: () => string;
}

/** A repository with plugin `p` at 1.0.0 pushed to a bare origin, and a git config that signs tags with a fresh SSH key. */
function fixture(onTestFinished: (fn: () => void) => void): Fixture {
  const root = mkdtempSync(join(tmpdir(), "release-"));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  const work = join(root, "work");
  const remote = join(root, "remote.git");
  const key = join(root, "key");

  execFileSync("ssh-keygen", ["-q", "-t", "ed25519", "-N", "", "-C", "t@example.com", "-f", key]);
  const publicKey = execFileSync("ssh-keygen", ["-y", "-f", key], { encoding: "utf8" }).trim();
  writeFileSync(join(root, "allowed_signers"), `t@example.com ${publicKey}\n`);
  writeFileSync(
    join(root, "gitconfig"),
    `[user]\n\tname = T\n\temail = t@example.com\n\tsigningkey = ${key}\n[gpg]\n\tformat = ssh\n[gpg "ssh"]\n\tallowedSignersFile = ${join(root, "allowed_signers")}\n[commit]\n\tgpgSign = false\n[init]\n\tdefaultBranch = main\n`,
  );
  // Only this fixture's config: no system or user config, and no GIT_CONFIG_* inherited from the caller.
  const env: NodeJS.ProcessEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")));
  Object.assign(env, { GIT_CONFIG_GLOBAL: join(root, "gitconfig"), GIT_CONFIG_NOSYSTEM: "1" });

  const files: Record<string, string> = {
    "package.json": JSON.stringify({ private: true }),
    "pnpm-workspace.yaml": "packages:\n  - plugins/*\n",
    ".changeset/config.json": JSON.stringify({ changelog: false, commit: false, baseBranch: "main", fixed: [], linked: [], ignore: [], privatePackages: { version: true, tag: true } }),
    ".claude-plugin/marketplace.json": JSON.stringify({ name: "m", plugins: [{ name: "p", source: "./plugins/p" }] }),
    "plugins/p/package.json": JSON.stringify({ name: "p", version: "1.0.0", private: true }),
    "plugins/p/.claude-plugin/plugin.json": '{\n  "name": "p",\n  "version": "1.0.0"\n}\n',
  };
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(work, path, ".."), { recursive: true });
    writeFileSync(join(work, path), text);
  }

  const gitIn = (cwd: string, ...args: string[]): string => execFileSync("git", args, { cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  execFileSync("git", ["init", "--quiet", "--bare", remote], { env });
  const git = (...args: string[]): string => gitIn(work, ...args);
  git("init", "--quiet");
  git("add", ".");
  git("commit", "--quiet", "--message", "init");
  git("remote", "add", "origin", remote);
  git("push", "--quiet", "origin", "main");

  return {
    work,
    env,
    git,
    release: (...args: string[]) => spawnSync(process.execPath, [script, ...args], { cwd: work, env, encoding: "utf8" }),
    remoteTags: () => gitIn(work, "ls-remote", "--tags", "origin"),
  };
}

describe("release tag, end to end", () => {
  it("creates, verifies and pushes the expected tag, then has nothing to do", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    const first = f.release("tag");
    expect(first.status, `release tag failed:\n${first.stdout}\n${first.stderr}`).toBe(0);
    expect(first.stdout).toMatch(/pushed p@1\.0\.0/);
    expect(f.remoteTags()).toMatch(/refs\/tags\/p@1\.0\.0\n/);

    const second = f.release("tag");
    expect(second.status, `second release tag failed:\n${second.stderr}`).toBe(0);
    expect(second.stdout).toMatch(/every expected tag is on origin and signed \(p@1\.0\.0\); nothing to do/);
  });

  it("pushes a tag an earlier run created but never pushed, instead of reporting nothing to do", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    f.git("tag", "--sign", "--message", "p@1.0.0", "p@1.0.0");
    expect(f.remoteTags()).toBe("");

    const result = f.release("tag");
    expect(result.status, `release tag failed:\n${result.stdout}\n${result.stderr}`).toBe(0);
    expect(result.stdout).not.toMatch(/nothing to do/);
    expect(result.stdout).toMatch(/pushed p@1\.0\.0/);
    expect(f.remoteTags()).toMatch(/refs\/tags\/p@1\.0\.0\n/);
  });

  it("fails on an unsigned tag already on origin, with the remedy", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    f.git("tag", "--annotate", "--no-sign", "--message", "p@1.0.0", "p@1.0.0");
    f.git("push", "--quiet", "origin", "refs/tags/p@1.0.0");

    const result = f.release("tag");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/p@1\.0\.0 is annotated but not signed/);
    expect(result.stderr).toMatch(/p@1\.0\.0 is on origin but not a signed tag: delete it/);
  });

  it("refuses to tag a commit that is not origin/main, and a pending changeset, listing both", { timeout: 60_000 }, ({ onTestFinished }) => {
    const f = fixture(onTestFinished);
    writeFileSync(join(f.work, ".changeset", "a.md"), '---\n"p": patch\n---\n\nFix.\n');
    f.git("add", ".");
    f.git("commit", "--quiet", "--message", "local only");

    const result = f.release("tag");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not running `tag`:\n- HEAD is [0-9a-f]{40} but origin\/main is [0-9a-f]{40}/);
    expect(result.stderr).toMatch(/- pending changesets in \.changeset\/ \(a\.md\)/);
    expect(f.remoteTags()).toBe("");
  });

  it("refuses version with no pending changeset before running Changesets", { timeout: 60_000 }, ({ onTestFinished }) => {
    const result = fixture(onTestFinished).release("version");
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/not running `version`:\n- no pending changeset/);
  });

  it("exits 2 on an extra argument or an unknown command", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "release-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const run = (...args: string[]) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8" });
    expect(run("tag", "--dry-run").status).toBe(2);
    expect(run("tag", "--dry-run").stderr).toMatch(/unexpected argument\(s\): --dry-run/);
    expect(run("publish").status).toBe(2);
    expect(run().status).toBe(2);
  });
});
