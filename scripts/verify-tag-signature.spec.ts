// End-to-end tests: run verify-tag-signature in a throwaway repository whose git config signs with a
// throwaway SSH key, never the maintainer's (`pnpm test`). The pure rules are tested with strings in
// verify-tag-signature.logic.spec.ts.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("verify-tag-signature, end to end", () => {
  const script = join(import.meta.dirname, "verify-tag-signature.ts");

  /**
   * A repository with one commit and four tags: lightweight `p@1.0.0`, unsigned annotated `p@1.1.0`,
   * signed `p@1.2.0`, and signed `p@1.3.0` by a key the allowed-signers file does not list.
   */
  function fixture(onTestFinished: (fn: () => void) => void) {
    const root = mkdtempSync(join(tmpdir(), "verify-tag-signature-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const work = join(root, "work");
    mkdirSync(work);
    for (const key of ["key", "stranger"]) execFileSync("ssh-keygen", ["-q", "-t", "ed25519", "-N", "", "-C", key, "-f", join(root, key)]);
    const publicKey = execFileSync("ssh-keygen", ["-y", "-f", join(root, "key")], { encoding: "utf8" }).trim();
    writeFileSync(join(root, "allowed_signers"), `t@example.com ${publicKey}\n`);
    writeFileSync(
      join(root, "gitconfig"),
      `[user]\n\tname = T\n\temail = t@example.com\n\tsigningkey = ${join(root, "key")}\n[gpg]\n\tformat = ssh\n[gpg "ssh"]\n\tallowedSignersFile = ${join(root, "allowed_signers")}\n[commit]\n\tgpgSign = false\n`,
    );
    // Only this fixture's config: no system or user config, and no GIT_CONFIG_* inherited from the caller.
    const env: NodeJS.ProcessEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")));
    Object.assign(env, { GIT_CONFIG_GLOBAL: join(root, "gitconfig"), GIT_CONFIG_NOSYSTEM: "1" });

    const git = (...args: string[]) => execFileSync("git", args, { cwd: work, env, stdio: "ignore" });
    git("init", "--quiet");
    git("commit", "--quiet", "--allow-empty", "--message", "c");
    git("tag", "p@1.0.0");
    git("tag", "--annotate", "--no-sign", "--message", "p@1.1.0", "p@1.1.0");
    git("tag", "--sign", "--message", "p@1.2.0", "p@1.2.0");
    git("-c", `user.signingkey=${join(root, "stranger")}`, "tag", "--sign", "--message", "p@1.3.0", "p@1.3.0");
    return (...args: string[]) => spawnSync(process.execPath, [script, ...args], { cwd: work, env, encoding: "utf8" });
  }

  it("passes a signed tag, and verifies its signature with --verify-signature", ({ onTestFinished }) => {
    const run = fixture(onTestFinished);
    const presence = run("p@1.2.0");
    expect(presence.status, `verify-tag-signature failed:\n${presence.stderr}`).toBe(0);
    expect(presence.stdout).toMatch(/p@1\.2\.0 is annotated and signed \(presence only\)/);
    const verified = run("p@1.2.0", "--verify-signature");
    expect(verified.status, `verify-tag-signature failed:\n${verified.stderr}`).toBe(0);
    expect(verified.stdout).toMatch(/and the signature verifies/);
  });

  it("with --verify-signature, fails a signature by a key it does not trust; presence alone passes it", ({ onTestFinished }) => {
    const run = fixture(onTestFinished);
    expect(run("p@1.3.0").status).toBe(0);
    const verified = run("p@1.3.0", "--verify-signature");
    expect(verified.status).toBe(1);
    expect(verified.stderr).toMatch(/`git tag -v` could not verify the signature/);
  });

  it("refuses a lightweight tag, an unsigned one and a missing one", ({ onTestFinished }) => {
    const run = fixture(onTestFinished);
    const lightweight = run("p@1.0.0");
    expect(lightweight.status).toBe(1);
    expect(lightweight.stderr).toMatch(/p@1\.0\.0 is a lightweight tag/);
    const unsigned = run("p@1.1.0");
    expect(unsigned.status).toBe(1);
    expect(unsigned.stderr).toMatch(/p@1\.1\.0 is annotated but not signed/);
    expect(run("p@2.0.0").stderr).toMatch(/no such tag in this clone/);
  });

  it("exits 2 without a tag or with two", ({ onTestFinished }) => {
    const run = fixture(onTestFinished);
    expect(run().status).toBe(2);
    expect(run("p@1.0.0", "p@1.1.0").status).toBe(2);
  });
});
