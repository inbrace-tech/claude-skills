// End-to-end tests for the lockfile audit: they run the script itself against
// throwaway git repositories.
//   pnpm test
// The rules are tested with strings in `check-lockfile-release-age.logic.spec.ts`.
//
// None of these tests reaches the registry. Every run goes through a proxy on
// a closed local port (`NODE_USE_ENV_PROXY`), so a fetch fails at once with
// ECONNREFUSED: the cases that must not fetch prove it by passing, and the one
// that must fetch proves an unreachable registry fails the audit.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKSPACE = "minimumReleaseAge: 4320\nminimumReleaseAgeStrict: false\n";

const lockfile = (version: string): string =>
  ["lockfileVersion: '9.0'", "", "packages:", "", `  core-lib@${version}:`, "    resolution: {integrity: sha512-aaa}", ""].join("\n");

describe("check-lockfile-release-age, end to end", () => {
  const script = join(import.meta.dirname, "check-lockfile-release-age.ts");
  const DEAD_PROXY = "http://127.0.0.1:9";
  const run = (cwd: string, args: string[] = []) =>
    spawnSync(process.execPath, [script, ...args], {
      cwd,
      encoding: "utf8",
      // Both spellings, so a proxy variable already in the caller's environment
      // cannot take precedence over the dead one.
      env: {
        ...process.env,
        NODE_USE_ENV_PROXY: "1",
        HTTPS_PROXY: DEAD_PROXY,
        https_proxy: DEAD_PROXY,
        HTTP_PROXY: DEAD_PROXY,
        http_proxy: DEAD_PROXY,
        NO_PROXY: "",
        no_proxy: "",
      },
    });

  /** A git repository on `main` whose one commit holds the two pnpm files. */
  function repository(onTestFinished: (fn: () => void) => void, workspace: string = WORKSPACE): { root: string; git: (...args: string[]) => void } {
    const root = mkdtempSync(join(tmpdir(), "lockfile-audit-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const git = (...args: string[]): void => {
      execFileSync("git", ["-c", "user.name=test", "-c", "user.email=test@example.com", "-c", "commit.gpgsign=false", ...args], { cwd: root, stdio: "ignore" });
    };
    git("init", "--quiet", "--initial-branch=main");
    writeFileSync(join(root, "pnpm-lock.yaml"), lockfile("1.4.0"));
    writeFileSync(join(root, "pnpm-workspace.yaml"), workspace);
    git("add", ".");
    git("commit", "--quiet", "-m", "base");
    return { root, git };
  }

  it("end to end: an untouched lockfile passes without asking the registry", ({ onTestFinished }) => {
    const { root, git } = repository(onTestFinished);
    git("switch", "--quiet", "-c", "feature");

    const result = run(root, ["--base", "main"]);
    expect(result.status, `audit failed:\n${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/resolves nothing that its merge base with main did not/);
  });

  it("end to end: it diffs against the merge base, not the moved base branch", ({ onTestFinished }) => {
    // `main` moves 1.4.0 to 1.3.0 after the branch forked. Against `main`
    // itself, the branch's untouched 1.4.0 would read as an addition; against
    // the merge base it is nothing.
    const { root, git } = repository(onTestFinished);
    git("switch", "--quiet", "-c", "feature");
    git("switch", "--quiet", "main");
    writeFileSync(join(root, "pnpm-lock.yaml"), lockfile("1.3.0"));
    git("commit", "--quiet", "-am", "main moves on");
    git("switch", "--quiet", "feature");

    const result = run(root, ["--base", "main"]);
    expect(result.status, `audit failed:\n${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/resolves nothing/);
  });

  it("end to end: an unreachable registry fails the audit instead of passing it", ({ onTestFinished }) => {
    const { root, git } = repository(onTestFinished);
    git("switch", "--quiet", "-c", "feature");
    writeFileSync(join(root, "pnpm-lock.yaml"), lockfile("1.5.0"));

    const result = run(root, ["--base", "main"]);
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/Checking 1 newly resolved version\(s\), floor 3\.0d/);
    expect(result.stderr).toMatch(/could not reach the registry for 1 package\(s\): core-lib/);
    expect(result.stdout).not.toMatch(/OK/);
  });

  it("end to end: the sweep fails on an unreachable registry too", ({ onTestFinished }) => {
    const { root } = repository(onTestFinished);

    const result = run(root, ["--all"]);
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/all 1 resolved version\(s\), takedown check only/);
    expect(result.stderr).toMatch(/could not reach the registry/);
  });

  it("end to end: a workspace with no minimumReleaseAge fails instead of passing", ({ onTestFinished }) => {
    const { root, git } = repository(onTestFinished, "packages:\n  - .\n");
    git("switch", "--quiet", "-c", "feature");

    const result = run(root, ["--base", "main"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/found no `minimumReleaseAge` in pnpm-workspace\.yaml/);
  });

  it("end to end: a base ref the clone does not have fails instead of passing", ({ onTestFinished }) => {
    const { root } = repository(onTestFinished);

    const result = run(root, ["--base", "no-such-ref"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/could not read pnpm-lock\.yaml at the merge base with no-such-ref/);
  });

  it("end to end: --all and --base together are refused", ({ onTestFinished }) => {
    const { root } = repository(onTestFinished);

    const result = run(root, ["--all", "--base", "main"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/different scopes/);
  });
});
