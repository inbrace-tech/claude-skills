// Tests for the documentation drift check's pure rules, with strings and no network (`pnpm test`).

import { formatReport, formatTally, fragmentsOf, hasAnchor, isPdf, judge, matchFragments, needsAttention, normalise, sourcesOf, splitUrl, tally } from "./check-doc-drift.logic.ts";
import type { PageFacts, SourceRef } from "./check-doc-drift.logic.ts";

const source = (overrides: Partial<SourceRef> = {}): SourceRef => ({
  file: "plugins/p/skills/t/transitions/a-to-b.md",
  id: "P01",
  index: 1,
  url: "https://example.com/doc#section",
  passage: "the model thinks first",
  ...overrides,
});

const page = (markdown: string, html: string | null = '<h2 id="section">Section</h2>'): PageFacts => ({ status: "ok", markdown, html });

describe("check-doc-drift rules", () => {
  it("sourcesOf reads the sources of traps and of changes, numbering them per item", () => {
    const knowledge = ["<traps>", "", "### P01 — A trap", "", "- kind: change", "- source: https://example.com/a", '  passage: "one"', "- source: https://example.com/b", "  basis: inference", "", "</traps>"].join("\n");
    expect(sourcesOf("k.md", knowledge)).toStrictEqual([
      { file: "k.md", id: "P01", index: 1, url: "https://example.com/a", passage: "one" },
      { file: "k.md", id: "P01", index: 2, url: "https://example.com/b", passage: null },
    ]);
    const digest = ["<changes>", "", "### C01 — A change", "", "- change: y", "- source: https://example.com/c#x", '  passage: "two"', "", "</changes>"].join("\n");
    expect(sourcesOf("d.md", digest)).toStrictEqual([{ file: "d.md", id: "C01", index: 1, url: "https://example.com/c#x", passage: "two" }]);
    const residue = ["<older_residue>", "", "### R01 — An old instruction", "", "- residue: z", "- source: https://example.com/old", '  passage: "three"', "", "</older_residue>"].join("\n");
    expect(sourcesOf("d.md", `${digest}\n${residue}`).map((source) => source.id)).toStrictEqual(["C01", "R01"]);
    expect(sourcesOf("k.md", "<older_residue>\n\nProse naming items, with no heading.\n\n</older_residue>")).toStrictEqual([]);
    expect(sourcesOf("n.md", "no block")).toStrictEqual([]);
  });

  it("splitUrl separates the page from its anchor", () => {
    expect(splitUrl("https://example.com/doc#a-b")).toStrictEqual({ page: "https://example.com/doc", anchor: "a-b" });
    expect(splitUrl("https://example.com/doc")).toStrictEqual({ page: "https://example.com/doc", anchor: null });
    expect(splitUrl("https://example.com/doc#")).toStrictEqual({ page: "https://example.com/doc", anchor: null });
  });

  it("isPdf recognises a PDF by its extension, in any case", () => {
    expect(isPdf("https://example.com/Card.PDF")).toBe(true);
    expect(isPdf("https://example.com/pdf-support")).toBe(false);
  });

  it("normalise folds whitespace, links, emphasis marks, curly quotes and case", () => {
    expect(normalise("  The **model**\n[thinks](https://example.com/x)  “first”, it’s said ")).toBe('the model thinks "first", it\'s said');
  });

  it("fragmentsOf splits on the ellipsis and drops empty parts", () => {
    expect(fragmentsOf("One thing … another THING…")).toStrictEqual(["one thing", "another thing"]);
  });

  it("matchFragments counts what occurs and requires the order", () => {
    expect(matchFragments("a then b then c", ["a", "c"])).toStrictEqual({ found: 2, inOrder: true });
    expect(matchFragments("a then b then c", ["c", "a"])).toStrictEqual({ found: 2, inOrder: false });
    expect(matchFragments("a then b then c", ["a", "z"])).toStrictEqual({ found: 1, inOrder: false });
  });

  it("hasAnchor looks for the element id", () => {
    expect(hasAnchor('<h2 id="calibrate-effort">', "calibrate-effort")).toBe(true);
    expect(hasAnchor('<h2 id="calibrate">', "calibrate-effort")).toBe(false);
  });
});

describe("check-doc-drift verdicts", () => {
  it("a passage that occurs, with its anchor present, holds", () => {
    expect(judge(source(), page("Before. The model **thinks** first. After.")).verdict).toBe("holds");
    expect(judge(source({ url: "https://example.com/doc" }), page("the model thinks first", null)).verdict).toBe("holds");
  });

  it("a source with a basis and no passage is not compared", () => {
    expect(judge(source({ passage: null }), undefined)).toMatchObject({ verdict: "basis", reason: null });
  });

  it("a PDF, or a page that could not be fetched, is unverified with its reason", () => {
    expect(judge(source({ url: "https://example.com/card.pdf" }), undefined)).toMatchObject({ verdict: "unverified", reason: "pdf" });
    expect(judge(source(), undefined)).toMatchObject({ verdict: "unverified", reason: "unreachable" });
    expect(judge(source(), { status: "unreachable", markdown: null, html: null })).toMatchObject({ verdict: "unverified", reason: "unreachable" });
    expect(judge(source(), page("the model thinks first", null))).toMatchObject({ verdict: "unverified", reason: "unreachable" });
  });

  it("a page that is gone, or an anchor gone with no fragment left, has vanished", () => {
    expect(judge(source(), { status: "gone", markdown: null, html: null }).verdict).toBe("vanished");
    expect(judge(source(), page("Nothing of it remains.", "<h2>Other</h2>")).verdict).toBe("vanished");
  });

  it("a missing or reordered fragment, or an anchor gone while the text remains, has changed", () => {
    expect(judge(source(), page("The model thinks later.")).verdict).toBe("changed");
    expect(judge(source({ passage: "second part … first part" }), page("first part, then the second part")).verdict).toBe("changed");
    expect(judge(source(), page("the model thinks first", "<h2>Other</h2>")).verdict).toBe("changed");
  });
});

describe("check-doc-drift report", () => {
  const results = [
    judge(source(), page("the model thinks first")),
    judge(source({ id: "P02" }), page("something else")),
    judge(source({ id: "C01", file: "plugins/p/skills/t/transitions/a-to-b.digest.md" }), { status: "gone", markdown: null, html: null }),
    judge(source({ id: "P03" }), undefined),
    judge(source({ id: "P04", url: "https://example.com/card.pdf" }), undefined),
    judge(source({ id: "P05", passage: null }), undefined),
  ];

  it("tally counts each verdict, and the summary line states them in a fixed order", () => {
    expect(tally(results)).toStrictEqual({ holds: 1, changed: 1, vanished: 1, unverified: 2, basis: 1 });
    expect(formatTally(results)).toBe("6 source(s): 1 hold, 1 changed, 1 vanished, 2 unverified, 1 with a basis only");
  });

  it("needsAttention keeps what changed, vanished or could not be fetched, and leaves a PDF out", () => {
    expect(needsAttention(results).map((result) => result.id)).toStrictEqual(["P02", "C01", "P03"]);
  });

  it("the report groups the sources that need attention by file, with the recorded passage", () => {
    const report = formatReport(results, "2026-10-02");
    expect(report).toContain("Checked on 2026-10-02. 6 source(s): 1 hold, 1 changed, 1 vanished, 2 unverified, 1 with a basis only.");
    expect(report).toContain("### `plugins/p/skills/t/transitions/a-to-b.md`");
    expect(report).toContain("- **P02** source 1: changed — https://example.com/doc#section");
    expect(report).toContain("- **P03** source 1: unverified (the page could not be fetched) — https://example.com/doc#section");
    expect(report).toContain("### `plugins/p/skills/t/transitions/a-to-b.digest.md`");
    expect(report).toContain("  - recorded passage: `the model thinks first`");
    expect(report).not.toContain("P04");
  });

  it("the report says so when every passage holds", () => {
    expect(formatReport([results[0]!], "2026-10-02")).toContain("Every quoted passage still occurs on its page.");
  });
});
