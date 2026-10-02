#!/usr/bin/env node
// Checks every passage the knowledge files quote — the traps of `<slug>.md` and the changes of
// `<slug>.digest.md`, under each skill's `transitions/` — against its documentation page as it reads
// today. It needs the network, so the doc-drift workflow runs it, never `pnpm test` or ci.yml.
// The rules live in check-doc-drift.logic.ts; this file finds the files, fetches the pages and reports.
//   node scripts/check-doc-drift.ts [--report <file>] [--verbose]
// Exit codes: 0 every passage holds, 1 a passage changed or vanished or a page could not be fetched,
// 2 not run from the repository root.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { toRepoPath } from "./check-norms.logic.ts";
import { formatReport, formatTally, isPdf, judge, needsAttention, sourcesOf, splitUrl } from "./check-doc-drift.logic.ts";
import type { PageFacts, SourceRef } from "./check-doc-drift.logic.ts";

/** Pages in flight at once. */
const CONCURRENCY = 4;

/** Per-request ceiling, so a hung socket fails the job instead of its timeout. */
const REQUEST_TIMEOUT_MS = 30_000;

const root = process.cwd();
const plugins = join(root, "plugins");

if (!existsSync(plugins)) {
  console.error("check-doc-drift: no plugins/ directory here; run it from the repository root");
  process.exit(2);
}

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

const verbose = process.argv.includes("--verbose");
const reportPath = argValue("--report");

/** Every Markdown file under a skill's `transitions/`: the knowledge files and their digests. */
function transitionFiles(): string[] {
  const found: string[] = [];
  for (const plugin of readdirSync(plugins, { withFileTypes: true })) {
    if (!plugin.isDirectory()) continue;
    const skills = join(plugins, plugin.name, "skills");
    if (!existsSync(skills)) continue;
    for (const skill of readdirSync(skills, { withFileTypes: true })) {
      const transitions = join(skills, skill.name, "transitions");
      if (!skill.isDirectory() || !existsSync(transitions)) continue;
      for (const entry of readdirSync(transitions, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith(".md")) found.push(join(transitions, entry.name));
      }
    }
  }
  return found.sort();
}

/** The body of a URL, null on a network failure; `gone` is a 404 or a 410. */
async function fetchText(url: string): Promise<{ text: string | null; gone: boolean }> {
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (response.status === 404 || response.status === 410) return { text: null, gone: true };
    if (!response.ok) return { text: null, gone: false };
    return { text: await response.text(), gone: false };
  } catch {
    return { text: null, gone: false };
  }
}

/** A page's raw Markdown, which the docs serve at `<page>.md`, and its HTML, which carries the anchors. */
async function fetchPage(page: string): Promise<PageFacts> {
  const [markdown, html] = await Promise.all([fetchText(`${page}.md`), fetchText(page)]);
  if (markdown.gone) return { status: "gone", markdown: null, html: null };
  if (markdown.text === null) return { status: "unreachable", markdown: null, html: null };
  return { status: "ok", markdown: markdown.text, html: html.text };
}

const sources: SourceRef[] = transitionFiles().flatMap((path) => sourcesOf(toRepoPath(relative(root, path), sep), readFileSync(path, "utf8")));
const pages = [...new Set(sources.filter((source) => source.passage).map((source) => splitUrl(source.url).page))].filter((page) => !isPdf(page));

const facts = new Map<string, PageFacts>();
const queue = [...pages];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let page = queue.shift(); page !== undefined; page = queue.shift()) facts.set(page, await fetchPage(page));
  }),
);

const results = sources.map((source) => judge(source, facts.get(splitUrl(source.url).page)));
const attention = needsAttention(results);

if (verbose) for (const result of results) console.log(`${result.file} ${result.id} source ${result.index}: ${result.verdict} ${result.url}`);
if (reportPath !== undefined) writeFileSync(reportPath, formatReport(results, new Date().toISOString().slice(0, 10)));

for (const result of attention) {
  const verdict = result.reason === "unreachable" ? "unverified, page not fetched" : result.verdict;
  console.error(`error: ${result.file}: ${result.id} source ${result.index}: ${verdict} ${result.url}`);
}
const summary = `check-doc-drift: ${pages.length} page(s), ${formatTally(results)}`;
if (attention.length > 0) {
  console.error(summary);
  process.exit(1);
}
console.log(summary);
