// Pure rules of the documentation drift check: which passages the knowledge files quote, how a page
// and a passage are normalised before they are compared, and the verdict each source gets. No network
// and no file system, so `pnpm test` covers it.

import { parseItems } from "./check-norms.logic.ts";

/**
 * What a quoted passage is, against its page as it reads today.
 * - `holds`: every fragment occurs, in order, and the anchor exists.
 * - `changed`: the page is there, but a fragment is missing or out of order, or the anchor is gone while the fragments remain.
 * - `vanished`: the page is gone, or its anchor is gone and no fragment occurs.
 * - `unverified`: the page could not be compared — a PDF, or a page that could not be fetched.
 * - `basis`: the source rests on a stated inference and quotes nothing.
 */
export type Verdict = "holds" | "changed" | "vanished" | "unverified" | "basis";

/** One `- source:` of a trap or of a change. */
export interface SourceRef {
  /** Repository path of the file that quotes it. */
  file: string;
  /** The trap or change id, such as `P07` or `C12`. */
  id: string;
  /** 1-indexed position among that item's sources. */
  index: number;
  url: string;
  /** Null when the source states a basis instead. */
  passage: string | null;
}

/** What was fetched for one page: its raw Markdown and its HTML, or why there is none. */
export interface PageFacts {
  status: "ok" | "gone" | "unreachable";
  markdown: string | null;
  html: string | null;
}

/** One source with its verdict, and the reason when the verdict is `unverified`. */
export interface SourceResult extends SourceRef {
  verdict: Verdict;
  reason: "pdf" | "unreachable" | null;
}

/** The blocks whose items quote a page: a knowledge file's traps, and a digest's changes and older residue. */
const QUOTING_BLOCKS = ["traps", "changes", "older_residue"] as const;

/** Every source of every item of the quoting blocks in one file. */
export function sourcesOf(file: string, text: string): SourceRef[] {
  const items = QUOTING_BLOCKS.flatMap((block) => parseItems(text, block) ?? []);
  return items.flatMap((item) => item.sources.map((source, index) => ({ file, id: item.id, index: index + 1, url: source.url, passage: source.passage })));
}

/** A URL split into its page and its anchor, the anchor null when there is none. */
export function splitUrl(url: string): { page: string; anchor: string | null } {
  const at = url.indexOf("#");
  return at === -1 ? { page: url, anchor: null } : { page: url.slice(0, at), anchor: url.slice(at + 1) || null };
}

/** Whether a page is a PDF, which is not compared. */
export function isPdf(page: string): boolean {
  return /\.pdf$/i.test(page);
}

/**
 * The text both sides are compared in, as the audit's drift stage defined it: whitespace runs become
 * one space, a `[text](url)` link becomes its text, `*` marks go, curly quotes become straight, and
 * case is folded.
 */
export function normalise(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replaceAll("*", "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .trim()
    .toLowerCase();
}

/** The fragments of a passage: its parts around each `…`, normalised, empty ones dropped. */
export function fragmentsOf(passage: string): string[] {
  return passage
    .split("…")
    .map((part) => normalise(part))
    .filter((part) => part !== "");
}

/** How many fragments occur in the normalised page, and whether all of them do in order. */
export function matchFragments(normalisedPage: string, fragments: readonly string[]): { found: number; inOrder: boolean } {
  let found = 0;
  let from = 0;
  let inOrder = true;
  for (const fragment of fragments) {
    if (normalisedPage.includes(fragment)) found += 1;
    const at = normalisedPage.indexOf(fragment, from);
    if (at === -1) inOrder = false;
    else from = at + fragment.length;
  }
  return { found, inOrder };
}

/** Whether the page's HTML still carries the anchor as an element id. */
export function hasAnchor(html: string, anchor: string): boolean {
  return html.includes(`id="${anchor}"`);
}

/** The verdict of one source against what was fetched for its page. */
export function judge(source: SourceRef, facts: PageFacts | undefined): SourceResult {
  const result = (verdict: Verdict, reason: SourceResult["reason"] = null): SourceResult => ({ ...source, verdict, reason });
  if (source.passage === null || source.passage === "") return result("basis");
  const { page, anchor } = splitUrl(source.url);
  if (isPdf(page)) return result("unverified", "pdf");
  if (facts?.status === "gone") return result("vanished");
  if (facts === undefined || facts.status === "unreachable" || facts.markdown === null) return result("unverified", "unreachable");

  const fragments = fragmentsOf(source.passage);
  const { found, inOrder } = matchFragments(normalise(facts.markdown), fragments);
  if (anchor !== null && facts.html === null) return result("unverified", "unreachable");
  const anchorGone = anchor !== null && facts.html !== null && !hasAnchor(facts.html, anchor);
  if (anchorGone && found === 0) return result("vanished");
  if (anchorGone || !inOrder) return result("changed");
  return result("holds");
}

/** How many sources got each verdict. */
export function tally(results: readonly SourceResult[]): Record<Verdict, number> {
  const counts: Record<Verdict, number> = { holds: 0, changed: 0, vanished: 0, unverified: 0, basis: 0 };
  for (const result of results) counts[result.verdict] += 1;
  return counts;
}

/** The sources a maintainer has to look at: changed, vanished, or on a page that could not be fetched. */
export function needsAttention(results: readonly SourceResult[]): SourceResult[] {
  return results.filter((result) => result.verdict === "changed" || result.verdict === "vanished" || result.reason === "unreachable");
}

/** One line of the summary: the counts, in a fixed order. */
export function formatTally(results: readonly SourceResult[]): string {
  const counts = tally(results);
  return `${results.length} source(s): ${counts.holds} hold, ${counts.changed} changed, ${counts.vanished} vanished, ${counts.unverified} unverified, ${counts.basis} with a basis only`;
}

/** The Markdown report a maintainer reads: the summary, then one item per source that needs attention, grouped by file. */
export function formatReport(results: readonly SourceResult[], checkedOn: string): string {
  const lines = [`Checked on ${checkedOn}. ${formatTally(results)}.`, ""];
  const attention = needsAttention(results);
  if (attention.length === 0) return [...lines, "Every quoted passage still occurs on its page.", ""].join("\n");

  lines.push("A passage below no longer matches its page. Open the page, re-verify the trap or the change it supports, and update the passage and its `verified` date, or the item itself when the documentation changed what it says.", "");
  for (const file of new Set(attention.map((result) => result.file))) {
    lines.push(`### \`${file}\``, "");
    for (const result of attention.filter((item) => item.file === file)) {
      const verdict = result.reason === "unreachable" ? "unverified (the page could not be fetched)" : result.verdict;
      lines.push(`- **${result.id}** source ${result.index}: ${verdict} — ${result.url}`, `  - recorded passage: \`${(result.passage ?? "").replaceAll("`", "'")}\``);
    }
    lines.push("");
  }
  return lines.join("\n");
}
