// The pure rules behind check-norms.ts: text in, errors out, so every rule is tested with strings.
// Ported from Inbrace's internal norm checker and narrowed: an id is N plus exactly two digits in a
// top-level `- ` item, and `refs` also takes a `docs` key of https URLs (required by CONTRIBUTING.md).
// Per-surface definitions and cross-references are read line by line, fences included, so a surface
// never shows a norm id in an example; the corpus checks blank code first.

/** A line that tries to define a norm; any digit count matches, so `[N1]` is reported, not read as prose. */
export const DEFINITION = /^- \[(N\d+)\] /;

/** Any `[Nxx]` in the text: a definition or a cross-reference. */
export const REFERENCE = /\[(N\d{2})\]/g;

/** A valid norm id: N followed by exactly two digits. */
export const ID = /^N\d{2}$/;

/** A JSON object whose fields have not been checked yet. */
type Unchecked = Record<string, unknown>;

/** Narrows parsed JSON to a readable object; an array passes, its fields reading as undefined. */
const isUnchecked = (value: unknown): value is Unchecked => typeof value === "object" && value !== null;

/** `owner/repo`, anchored: GitHub's name charset, one slash. */
export const REPO_KEY_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

/** The one `refs` key that is not `owner/repo`: official documentation URLs. */
export const DOCS_KEY = "docs";

/** A `#12` in prose that names no repository. */
export const BARE_ISSUE_CITATION = /(?<![\w/#-])#(\d{1,6})\b/g;

/** `owner/repo#12`, the unambiguous spelling, removed before the bare scan. */
export const QUALIFIED_ISSUE_CITATION = /[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+#(\d{1,6})\b/g;

/** The bare `[N01]` or the qualified `[<qualifier>#N01]`; any digit count, so `[N7]` is read and reported. */
const CITATION_PATTERN = /\[(?:([A-Za-z0-9._-]+)#)?N(\d+)\]/g;

/** Visits each line with whether it is in a fenced block; a fence closes on the same character, at least as long. */
function forEachLine(source: string, visit: (line: string, insideFence: boolean) => void): void {
  let fenceChar: string | null = null;
  let fenceLength = 0;
  for (const line of source.split("\n")) {
    const fence = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (fenceChar === null) {
      if (fence !== undefined) {
        fenceChar = fence.charAt(0);
        fenceLength = fence.length;
        visit(line, true);
        continue;
      }
      visit(line, false);
      continue;
    }
    if (fence !== undefined && fence.charAt(0) === fenceChar && fence.length >= fenceLength) {
      fenceChar = null;
      fenceLength = 0;
    }
    visit(line, true);
  }
}

/**
 * Blanks inline-code spans on one line, per CommonMark: a run of N backticks
 * closes on the next run of exactly N. An unterminated run is prose, left alone.
 */
function blankInlineCode(line: string): string {
  const chars = line.split("");
  let i = 0;
  while (i < chars.length) {
    if (chars[i] !== "`") {
      i += 1;
      continue;
    }
    const openStart = i;
    while (i < chars.length && chars[i] === "`") i += 1;
    const runLength = i - openStart;
    let cursor = i;
    let closeStart = -1;
    while (cursor < chars.length) {
      if (chars[cursor] !== "`") {
        cursor += 1;
        continue;
      }
      const candidateStart = cursor;
      while (cursor < chars.length && chars[cursor] === "`") cursor += 1;
      if (cursor - candidateStart === runLength) {
        closeStart = candidateStart;
        break;
      }
    }
    if (closeStart === -1) return chars.join("");
    for (let k = openStart; k < closeStart + runLength; k += 1) chars[k] = " ";
    i = closeStart + runLength;
  }
  return chars.join("");
}

/**
 * Replaces every fenced block and inline-code span with spaces, keeping lines
 * and columns, so prose about the format is not read as a citation or heading.
 */
export function blankCodeRegions(source: string): string {
  const out: string[] = [];
  forEachLine(source, (line, insideFence) => {
    out.push(insideFence ? " ".repeat(line.length) : blankInlineCode(line));
  });
  return out.join("\n");
}

/** Every `##`–`######` heading text of a source, code regions blanked first. */
export function extractHeadings(source: string): string[] {
  const headings: string[] = [];
  for (const line of blankCodeRegions(source).split("\n")) {
    const heading = /^#{2,6}\s+(.+?)\s*$/.exec(line)?.[1];
    if (heading !== undefined) headings.push(heading);
  }
  return headings;
}

/** `where` normalised like `extractHeadings` output, so a heading quoted with its backticks compares equal. */
export function normaliseWhere(where: string): string {
  return blankCodeRegions(where).replace(/^\s+|\s+$/g, "");
}

/**
 * Whether `where` prefixes a heading of `surface`, or a heading prefixes it. Any `where` resolves on a
 * surface with no heading; one that is all code span normalises to "" and never resolves.
 */
export function whereResolves(where: string, surface: string): boolean {
  const normalised = normaliseWhere(where);
  if (normalised === "") return false;
  const headings = extractHeadings(surface);
  return headings.length === 0 || headings.some((heading) => heading.startsWith(normalised) || normalised.startsWith(heading));
}

/** One `[N01]` or `[<qualifier>#N01]` and the 1-indexed line it sits on. */
export interface Citation {
  id: string;
  /** The surface a qualified citation names; null for the bare form. */
  qualifier: string | null;
  line: number;
}

/** Every citation in a source, code regions blanked first. */
export function extractCitations(source: string): Citation[] {
  const citations: Citation[] = [];
  blankCodeRegions(source)
    .split("\n")
    .forEach((line, index) => {
      for (const [, qualifier, digits] of line.matchAll(CITATION_PATTERN)) {
        if (digits !== undefined) citations.push({ id: `N${digits}`, qualifier: qualifier ?? null, line: index + 1 });
      }
    });
  return citations;
}

/** The names a qualified citation reaches a surface by: a skill by its directory, an agent by its basename. */
export function surfaceQualifiers(surfacePath: string): string[] {
  const segments = surfacePath.split("/");
  const basename = segments.at(-1) ?? "";
  return [...segments, basename.replace(/\.md$/, "")];
}

/** The bare `#12` numbers in `text` that `known` lacks, sorted; `owner/repo#12` is not bare. */
export function unlistedBareRefs(text: string, known: ReadonlySet<number>): number[] {
  const bare = new Set<number>();
  for (const [, digits] of text.replace(QUALIFIED_ISSUE_CITATION, " ").matchAll(BARE_ISSUE_CITATION)) {
    const value = Number(digits);
    if (Number.isInteger(value) && value > 0 && !known.has(value)) bare.add(value);
  }
  return [...bare].sort((left, right) => left - right);
}

/** The `refs` numbers `text` never writes as `#N`, sorted: an attribution no reader can trace. */
export function uncitedRefNumbers(text: string, numbers: readonly number[]): number[] {
  const cited = new Set<number>();
  for (const [, digits] of text.matchAll(/#(\d{1,6})(?!\d)/g)) cited.add(Number(digits));
  return [...new Set(numbers)].filter((value) => !cited.has(value)).sort((left, right) => left - right);
}

const isPositiveInteger = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value > 0;

/** What is wrong with one entry's `refs` object: its keys and its values. */
function refsErrors(sidecarPath: string, id: string, refs: Unchecked): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(refs)) {
    if (key === DOCS_KEY) {
      if (!Array.isArray(value) || !value.every((url) => typeof url === "string" && url.startsWith("https://"))) {
        errors.push(`${sidecarPath}: ${id} "refs.${DOCS_KEY}" must be an array of https URLs`);
      }
      continue;
    }
    if (!REPO_KEY_PATTERN.test(key)) {
      errors.push(`${sidecarPath}: ${id} "refs" key ${JSON.stringify(key)} is not owner/repo or "${DOCS_KEY}"`);
      continue;
    }
    if (!Array.isArray(value)) {
      errors.push(`${sidecarPath}: ${id} "refs" ${key} must be an array of issue or pull request numbers`);
      continue;
    }
    const malformed = value.filter((ref) => !isPositiveInteger(ref));
    if (malformed.length > 0) {
      errors.push(`${sidecarPath}: ${id} "refs" ${key} holds ${malformed.map((ref) => JSON.stringify(ref)).join(", ")}, not a positive integer`);
    }
  }
  return errors;
}

/** What `checkSurface` reads: one surface and its sidecar. */
export interface SurfaceInput {
  /** Surface path relative to the repository root, spelled with `/`. */
  surfacePath: string;
  /** Sidecar path relative to the repository root, spelled with `/`. */
  sidecarPath: string;
  /** Surface contents, or null when the file does not exist. */
  surface: string | null;
  /** Sidecar contents, or null when the file does not exist. */
  sidecarText: string | null;
}

/** What `checkSurface` reports about one surface. */
export interface SurfaceResult {
  /** False for a surface with no norm and no sidecar, which is skipped. */
  inFormat: boolean;
  errors: string[];
}

/** The norm ids a surface tries to define, in order, duplicates and malformed ids included. */
export function definedNorms(surface: string): string[] {
  const ids: string[] = [];
  for (const line of surface.split("\n")) {
    // The group is not optional; the guard is for the compiler.
    const id = line.match(DEFINITION)?.[1];
    if (id !== undefined) ids.push(id);
  }
  return ids;
}

/** A relative path spelled with `/` whatever `separator` (`path.sep`) is, to match a sidecar's `surface`. */
export function toRepoPath(path: string, separator: string): string {
  return path.split(separator).join("/");
}

/**
 * The sidecar path for a surface: `SKILL.md` → `SKILL.norms.json`,
 * `agents/<name>.md` → `agents/<name>.norms.json`.
 */
export function sidecarPathFor(surfacePath: string): string {
  return surfacePath.replace(/\.md$/, ".norms.json");
}

/** The agent names in an `agents/` directory, from each `.md` and `.norms.json` so an orphan sidecar counts; sorted. */
export function agentNames(fileNames: string[]): string[] {
  const names = new Set<string>();
  for (const file of fileNames) {
    const name = file.match(/^(.+?)(\.norms\.json|\.md)$/)?.[1];
    if (name !== undefined) names.add(name);
  }
  return [...names].sort();
}

const baseName = (path: string): string => path.slice(path.lastIndexOf("/") + 1);

/** Checks one surface against its sidecar. */
export function checkSurface({ surfacePath, sidecarPath, surface, sidecarText }: SurfaceInput): SurfaceResult {
  const surfaceName = baseName(surfacePath);
  const sidecarName = baseName(sidecarPath);
  if (surface === null) {
    if (sidecarText === null) return { inFormat: false, errors: [] };
    return { inFormat: true, errors: [`${sidecarPath}: has no ${surfaceName} beside it`] };
  }

  const defined = definedNorms(surface);
  if (defined.length === 0 && sidecarText === null) return { inFormat: false, errors: [] };

  const errors: string[] = [];
  for (const id of defined) {
    if (!ID.test(id)) errors.push(`${surfacePath}: norm id ${id} is not N followed by two digits`);
  }
  const valid = defined.filter((id) => ID.test(id));

  if (sidecarText === null) {
    errors.push(`${surfacePath}: defines norms but has no ${sidecarName}`);
    return { inFormat: true, errors };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(sidecarText);
  } catch (error) {
    errors.push(`${sidecarPath}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    return { inFormat: true, errors };
  }
  if (!isUnchecked(parsed) || Array.isArray(parsed)) {
    errors.push(`${sidecarPath}: must be a JSON object`);
    return { inFormat: true, errors };
  }
  const sidecar = parsed;

  if (sidecar.surface !== surfacePath) {
    errors.push(`${sidecarPath}: surface is "${String(sidecar.surface)}", expected "${surfacePath}"`);
  }

  const seen = new Set<string>();
  for (const id of valid) {
    if (seen.has(id)) errors.push(`${surfacePath}: norm ${id} is defined more than once`);
    seen.add(id);
  }

  if (!Array.isArray(sidecar.norms)) errors.push(`${sidecarPath}: "norms" must be an array`);
  const entries: unknown[] = Array.isArray(sidecar.norms) ? sidecar.norms : [];
  const recorded = new Set<string>();
  for (const item of entries) {
    const entry: Unchecked = isUnchecked(item) ? item : {};
    const id = entry.id;
    if (typeof id !== "string" || !ID.test(id)) {
      errors.push(`${sidecarPath}: entry with invalid id ${JSON.stringify(id)}`);
      continue;
    }
    if (recorded.has(id)) errors.push(`${sidecarPath}: ${id} is recorded more than once`);
    recorded.add(id);
    if (typeof entry.where !== "string" || entry.where.trim() === "") errors.push(`${sidecarPath}: ${id} has no "where"`);
    else if (!whereResolves(entry.where, surface)) {
      errors.push(`${sidecarPath}: ${id} "where" ${JSON.stringify(entry.where.trim())} names no heading in ${surfaceName}`);
    }
    if (typeof entry.what !== "string" || entry.what.trim() === "") errors.push(`${sidecarPath}: ${id} has no "what"`);
    if (!isUnchecked(entry.refs) || Array.isArray(entry.refs)) errors.push(`${sidecarPath}: ${id} "refs" must be an object`);
    else errors.push(...refsErrors(sidecarPath, id, entry.refs));
  }

  for (const id of seen) if (!recorded.has(id)) errors.push(`${surfacePath}: ${id} has no entry in ${sidecarName}`);
  for (const id of recorded) if (!seen.has(id)) errors.push(`${sidecarPath}: ${id} matches no norm in ${surfaceName}`);

  const dangling = new Set<string>();
  for (const [, id] of surface.matchAll(REFERENCE)) {
    if (id !== undefined && !seen.has(id)) dangling.add(id);
  }
  for (const id of dangling) errors.push(`${surfacePath}: cross-reference [${id}] names no norm defined here`);

  return { inFormat: true, errors };
}

/** One Markdown file of the repository, path relative to the root with `/`. */
export interface MarkdownFile {
  path: string;
  source: string;
}

/** What `checkCorpus` reads: every surface found and every Markdown file. */
export interface CorpusInput {
  surfaces: SurfaceInput[];
  markdown: MarkdownFile[];
}

/** What `checkCorpus` reports: errors fail the run, notes are printed only. */
export interface CorpusResult {
  errors: string[];
  notes: string[];
}

/** A surface in the norm format, and the ids its sidecar declares. */
interface Governed {
  sidecarPath: string;
  declared: Set<string>;
}

/** A sidecar's entries, or none where it is missing or malformed. */
function sidecarEntries(sidecarText: string | null): Unchecked[] {
  if (sidecarText === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(sidecarText);
  } catch {
    return [];
  }
  if (!isUnchecked(parsed) || !Array.isArray(parsed.norms)) return [];
  return parsed.norms.filter((entry): entry is Unchecked => isUnchecked(entry) && !Array.isArray(entry));
}

/**
 * The error one qualified citation earns, or null where it names exactly one
 * surface in the norm format and that surface's sidecar declares its id.
 */
function resolveQualified(citation: Citation, qualifier: string, location: string, governed: ReadonlyMap<string, Governed>): string | null {
  const cited = `[${qualifier}#${citation.id}]`;
  const matched = [...governed.entries()]
    .filter(([surfacePath]) => surfaceQualifiers(surfacePath).includes(qualifier))
    .sort(([left], [right]) => left.localeCompare(right));
  const [only] = matched;
  if (only === undefined) return `${location}: ${cited} names no surface in the norm format`;
  if (matched.length > 1) return `${location}: ${cited} names ${matched.length} surfaces: ${matched.map(([surfacePath]) => surfacePath).join(", ")}`;
  const [surfacePath, target] = only;
  if (target.declared.has(citation.id)) return null;
  return `${location}: ${cited} names ${surfacePath}, whose ${baseName(target.sidecarPath)} has no entry ${citation.id}`;
}

/**
 * The checks only the whole corpus can make: qualified citations on surfaces,
 * in sidecar prose and in other Markdown; bare citations in Markdown no sidecar
 * serves; and, as notes, issue numbers the prose and `refs` disagree on.
 */
export function checkCorpus({ surfaces, markdown }: CorpusInput): CorpusResult {
  const errors: string[] = [];
  const notes: string[] = [];
  const inFormat = surfaces
    .filter((input) => checkSurface(input).inFormat)
    .sort((left, right) => left.surfacePath.localeCompare(right.surfacePath));

  const governed = new Map<string, Governed>();
  for (const { surfacePath, sidecarPath, sidecarText } of inFormat) {
    const declared = new Set<string>();
    for (const entry of sidecarEntries(sidecarText)) if (typeof entry.id === "string" && ID.test(entry.id)) declared.add(entry.id);
    governed.set(surfacePath, { sidecarPath, declared });
  }

  for (const { surfacePath, sidecarPath, surface, sidecarText } of inFormat) {
    if (surface !== null) {
      for (const citation of extractCitations(surface)) {
        if (citation.qualifier === null) continue;
        const error = resolveQualified(citation, citation.qualifier, `${surfacePath}:${citation.line}`, governed);
        if (error !== null) errors.push(error);
      }
    }

    const declared = governed.get(surfacePath)?.declared ?? new Set<string>();
    sidecarEntries(sidecarText).forEach((entry, index) => {
      const id = typeof entry.id === "string" && entry.id.trim() !== "" ? entry.id.trim() : `norms[${index}]`;
      const prose: string[] = [];
      for (const field of ["what", "where"] as const) {
        const text = entry[field];
        if (typeof text !== "string") continue;
        prose.push(text);
        for (const citation of extractCitations(text)) {
          if (citation.qualifier !== null) {
            const error = resolveQualified(citation, citation.qualifier, `${sidecarPath}: ${id}.${field}`, governed);
            if (error !== null) errors.push(error);
          } else if (!declared.has(citation.id)) {
            notes.push(`${sidecarPath}: ${id}.${field} cites [${citation.id}], which this sidecar has no entry for`);
          }
        }
      }

      const refs = entry.refs;
      if (!isUnchecked(refs) || Array.isArray(refs)) return;
      const known = new Set<number>();
      for (const [key, value] of Object.entries(refs)) {
        if (key === DOCS_KEY || !Array.isArray(value)) continue;
        const numbers = value.filter(isPositiveInteger);
        for (const number of numbers) known.add(number);
        const uncited = uncitedRefNumbers(prose.join("\n"), numbers);
        if (uncited.length > 0) notes.push(`${sidecarPath}: ${id} lists ${key} ${uncited.map((n) => `#${n}`).join(", ")} in "refs", but its prose never cites it`);
      }
      for (const field of ["what", "where"] as const) {
        const text = entry[field];
        if (typeof text !== "string") continue;
        const unlisted = unlistedBareRefs(text, known);
        if (unlisted.length > 0) notes.push(`${sidecarPath}: ${id}.${field} cites ${unlisted.map((n) => `#${n}`).join(", ")}, which "refs" does not list`);
      }
    });
  }

  for (const file of [...markdown].sort((left, right) => left.path.localeCompare(right.path))) {
    if (governed.has(file.path)) continue;
    for (const citation of extractCitations(file.source)) {
      const location = `${file.path}:${citation.line}`;
      if (citation.qualifier !== null) {
        const error = resolveQualified(citation, citation.qualifier, location, governed);
        if (error !== null) errors.push(error);
        continue;
      }
      errors.push(
        `${location}: [${citation.id}] cites a norm, but no sidecar serves this file; qualify it as [<skill-or-agent>#${citation.id}], or write it in backticks where the text is about the format`,
      );
    }
  }

  // A bare id cited twice in one field is one note, not two.
  return { errors, notes: [...new Set(notes)] };
}
