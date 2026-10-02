// End-to-end tests: run the documentation drift check against throwaway trees (`pnpm test`).
// Every run goes through a dead proxy (`NODE_USE_ENV_PROXY`), so a page fetch fails at once: the
// cases that must not fetch prove it by passing, and one proves an unreachable page fails the check.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("check-doc-drift, end to end", () => {
  const script = join(import.meta.dirname, "check-doc-drift.ts");
  const DEAD_PROXY = "http://127.0.0.1:9";
  const run = (cwd: string, args: string[] = []) =>
    spawnSync(process.execPath, [script, ...args], {
      cwd,
      encoding: "utf8",
      // Both spellings, so a proxy already in the caller's environment cannot win.
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

  /** A tree with one knowledge file whose single trap has the given source lines. */
  function tree(onTestFinished: (fn: () => void) => void, sourceLines: string[]): string {
    const root = mkdtempSync(join(tmpdir(), "doc-drift-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));
    const dir = join(root, "plugins", "p", "skills", "t", "transitions");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "a-to-b.md"), ["<traps>", "", "### P01 — A trap", "", "- kind: change", ...sourceLines, "", "</traps>", ""].join("\n"));
    return root;
  }

  it("run outside the repository root, it refuses instead of passing", ({ onTestFinished }) => {
    const root = mkdtempSync(join(tmpdir(), "doc-drift-"));
    onTestFinished(() => rmSync(root, { recursive: true, force: true }));

    const result = run(root);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/run it from the repository root/);
  });

  it("a source with a basis only, or on a PDF, is not fetched and passes", ({ onTestFinished }) => {
    const root = tree(onTestFinished, ["- source: https://example.com/doc", "  basis: inference: a reason", "- source: https://example.com/card.pdf", '  passage: "quoted from the card"', "  verified: 2026-10-02"]);

    const result = run(root);
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/0 page\(s\), 2 source\(s\): 0 hold, 0 changed, 0 vanished, 1 unverified, 1 with a basis only/);
  });

  it("a page that cannot be fetched fails the check and is named in the report", ({ onTestFinished }) => {
    const root = tree(onTestFinished, ["- source: https://example.com/doc#section", '  passage: "the doc says so"', "  verified: 2026-10-02"]);
    const report = join(root, "report.md");

    const result = run(root, ["--report", report]);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/transitions\/a-to-b\.md: P01 source 1: unverified, page not fetched https:\/\/example\.com\/doc#section/);
    expect(existsSync(report)).toBe(true);
    expect(readFileSync(report, "utf8")).toContain("- **P01** source 1: unverified (the page could not be fetched) — https://example.com/doc#section");
  });
});
