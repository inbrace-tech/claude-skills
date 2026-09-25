// The pure half of check-norms: given one surface's text — a skill's SKILL.md
// or an agent's <name>.md — and its sidecar's text, report every way the two
// disagree. No file system access here, so every rule can be tested with plain
// strings; reading directories, printing and the exit code live in
// check-norms.ts.
//
// The parser reads lines, not Markdown: a `- [N01] ` line inside a fenced
// block defines a norm, and a `[N01]` anywhere is a reference. Surfaces in this
// repository therefore never show a norm id inside an example.

/**
 * A line that tries to define a norm: a list item led by `[N` and digits.
 * Matching any digit count, not just two, is what lets a malformed id such as
 * `[N1]` or `[N100]` be reported instead of silently read as prose.
 */
export const DEFINITION = /^- \[(N\d+)\] /;

/** Any `[Nxx]` in the text: a definition or a cross-reference. */
export const REFERENCE = /\[(N\d{2})\]/g;

/** A valid norm id: N followed by exactly two digits. */
export const ID = /^N\d{2}$/;

/** A JSON object whose fields have not been checked yet. */
type Unchecked = Record<string, unknown>;

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

/**
 * The norm ids a surface tries to define, in order, duplicates and malformed
 * ids included.
 */
export function definedNorms(surface: string): string[] {
  const ids: string[] = [];
  for (const line of surface.split("\n")) {
    const match = line.match(DEFINITION);
    if (match) ids.push(match[1]);
  }
  return ids;
}

/**
 * A relative path spelled with `/`, whatever the platform's separator, so it
 * compares equal to the `surface` field a sidecar records. `separator` is the
 * platform separator, `path.sep`.
 */
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

/**
 * The agent names an `agents/` directory holds, given its file names: the stem
 * of every `<name>.md` and every `<name>.norms.json`, so an orphan sidecar is
 * found too. Other files are skipped. Sorted, each name once.
 */
export function agentNames(fileNames: string[]): string[] {
  const names = new Set<string>();
  for (const file of fileNames) {
    const match = file.match(/^(.+?)(\.norms\.json|\.md)$/);
    if (match) names.add(match[1]);
  }
  return [...names].sort();
}

const baseName = (path: string): string => path.slice(path.lastIndexOf("/") + 1);

/**
 * Checks one surface — a skill's SKILL.md or an agent's <name>.md — against
 * its sidecar.
 */
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
    errors.push(`${sidecarPath}: invalid JSON (${(error as Error).message})`);
    return { inFormat: true, errors };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    errors.push(`${sidecarPath}: must be a JSON object`);
    return { inFormat: true, errors };
  }
  const sidecar = parsed as Unchecked;

  if (sidecar.surface !== surfacePath) {
    errors.push(`${sidecarPath}: surface is "${sidecar.surface}", expected "${surfacePath}"`);
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
    const entry = (typeof item === "object" && item !== null ? item : {}) as Unchecked;
    const id = entry.id;
    if (typeof id !== "string" || !ID.test(id)) {
      errors.push(`${sidecarPath}: entry with invalid id ${JSON.stringify(id)}`);
      continue;
    }
    if (recorded.has(id)) errors.push(`${sidecarPath}: ${id} is recorded more than once`);
    recorded.add(id);
    if (typeof entry.where !== "string" || entry.where.trim() === "") errors.push(`${sidecarPath}: ${id} has no "where"`);
    if (typeof entry.what !== "string" || entry.what.trim() === "") errors.push(`${sidecarPath}: ${id} has no "what"`);
    if (typeof entry.refs !== "object" || entry.refs === null || Array.isArray(entry.refs)) errors.push(`${sidecarPath}: ${id} "refs" must be an object`);
  }

  for (const id of seen) if (!recorded.has(id)) errors.push(`${surfacePath}: ${id} has no entry in ${sidecarName}`);
  for (const id of recorded) if (!seen.has(id)) errors.push(`${sidecarPath}: ${id} matches no norm in ${surfaceName}`);

  const dangling = new Set<string>();
  for (const match of surface.matchAll(REFERENCE)) {
    if (!seen.has(match[1])) dangling.add(match[1]);
  }
  for (const id of dangling) errors.push(`${surfacePath}: cross-reference [${id}] names no norm defined here`);

  return { inFormat: true, errors };
}
