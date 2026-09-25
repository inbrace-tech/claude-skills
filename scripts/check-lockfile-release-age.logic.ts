// The pure rules of the lockfile audit: lockfile text and a registry fetcher in, violations out.
// pnpm's `minimumReleaseAge` already refuses too-fresh versions, so the age check is a cheap backstop
// for a lockfile pnpm never vetted (an old pnpm, a hand-edited or hand-merged lockfile). The check that
// earns the audit its place is registry absence, the mark of a takedown, which can come long after merge:
// a pull request asks both questions of what it adds, the scheduled sweep asks absence of the whole lockfile.

/** One resolved dependency, as the lockfile names it. */
export interface ResolvedPackage {
  readonly name: string;
  readonly version: string;
}

/** What the registry says about one resolved version. */
export interface RegistryFact {
  /** ISO-8601 publish timestamp, or `undefined` when the registry has none. */
  readonly publishedAt: string | undefined;
  /** Whether the version is still listed in the packument's `versions` map. */
  readonly stillPublished: boolean;
}

/** Which assertion failed. Each maps to one branch of `evaluatePackage`. */
export type ViolationCode = "version-absent-from-registry" | "version-too-fresh" | "publish-date-unknown";

export interface Violation {
  readonly code: ViolationCode;
  readonly name: string;
  readonly version: string;
  readonly detail: string;
}

// A top-level `packages:`/`snapshots:` entry, `name@version:` or `'name@version(peer@version)':`.
// The exact two-space indent keeps the deeper `version:` lines of `importers:` out.
const LOCKFILE_ENTRY = /^ {2}'?((?:@[^@'\s/]+\/)?[^@'\s/][^@'\s]*)@([0-9][^'():\s]*)'?(?:\(|:)/;

/** Every `name@version` a lockfile resolves; a peer-suffixed snapshot key is the same artifact as its package. */
export function parseResolvedVersions(lockfileText: string): Set<string> {
  const resolved = new Set<string>();
  for (const line of lockfileText.split("\n")) {
    const match = LOCKFILE_ENTRY.exec(line);
    if (match !== null) resolved.add(`${match[1]}@${match[2]}`);
  }
  return resolved;
}

/** Splits a `name@version` key back into its parts, on the LAST `@`. */
export function splitResolvedKey(key: string): ResolvedPackage {
  const separator = key.lastIndexOf("@");
  return { name: key.slice(0, separator), version: key.slice(separator + 1) };
}

/** The entries `headText` resolves that `baseText` did not, sorted; a removal cannot add untrusted code. */
export function addedResolvedVersions(baseText: string, headText: string): ResolvedPackage[] {
  const base = parseResolvedVersions(baseText);
  return [...parseResolvedVersions(headText)]
    .filter((key) => !base.has(key))
    .sort()
    .map(splitResolvedKey);
}

/** Every entry a lockfile resolves, sorted for a stable report. */
export function allResolvedVersions(lockfileText: string): ResolvedPackage[] {
  return [...parseResolvedVersions(lockfileText)].sort().map(splitResolvedKey);
}

export interface EvaluateInput {
  readonly pkg: ResolvedPackage;
  readonly fact: RegistryFact;
  /** Milliseconds since the epoch, injected so the spec can pin it. */
  readonly now: number;
  /** The age floor, or `null` to ask only the takedown question, as the whole-lockfile sweep does. */
  readonly minimumReleaseAgeMinutes: number | null;
}

/**
 * The package's violation, or `undefined` when clean. Absence is checked before age: it is the graver
 * state, and a surviving publish date would describe a version nobody can install.
 */
export function evaluatePackage(input: EvaluateInput): Violation | undefined {
  const { pkg, fact, now, minimumReleaseAgeMinutes } = input;

  if (!fact.stillPublished) {
    return {
      code: "version-absent-from-registry",
      name: pkg.name,
      version: pkg.version,
      detail:
        "the registry no longer lists this version. A version that disappears " +
        "after being resolved is the signature of a takedown; treat it as " +
        "compromised until the registry or the maintainer says otherwise.",
    };
  }

  if (minimumReleaseAgeMinutes === null) return undefined;

  if (fact.publishedAt === undefined) {
    return {
      code: "publish-date-unknown",
      name: pkg.name,
      version: pkg.version,
      detail:
        "the registry reports no publish date for this version, so its age " +
        "cannot be established. The audit does not pass what it could not check.",
    };
  }

  const publishedAtMs = Date.parse(fact.publishedAt);
  if (Number.isNaN(publishedAtMs)) {
    return {
      code: "publish-date-unknown",
      name: pkg.name,
      version: pkg.version,
      detail: `the registry's publish date (${fact.publishedAt}) is unparseable.`,
    };
  }

  const ageMinutes = (now - publishedAtMs) / 60_000;
  if (ageMinutes < minimumReleaseAgeMinutes) {
    return {
      code: "version-too-fresh",
      name: pkg.name,
      version: pkg.version,
      detail:
        `published ${formatMinutes(ageMinutes)} ago, under the ` +
        `${formatMinutes(minimumReleaseAgeMinutes)} floor this repository sets ` +
        "in pnpm-workspace.yaml.",
    };
  }

  return undefined;
}

/** Renders a minute count as the largest unit that stays readable. */
export function formatMinutes(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded < 60) return `${rounded}min`;
  if (rounded < 1440) return `${(rounded / 60).toFixed(1)}h`;
  return `${(rounded / 1440).toFixed(1)}d`;
}

/**
 * `minimumReleaseAge` read from pnpm-workspace.yaml, so the audit and pnpm share one floor; `undefined`
 * when absent, which the caller treats as a failure, not a clean tree.
 */
export function parseMinimumReleaseAge(workspaceText: string): number | undefined {
  for (const line of workspaceText.split("\n")) {
    const match = /^minimumReleaseAge:\s*(\d+)\s*(?:#.*)?$/.exec(line);
    if (match !== null) return Number(match[1]);
  }
  return undefined;
}

/** One line per violation, in the shape the entry point prints. */
export function formatViolations(violations: readonly Violation[]): string {
  return violations.map((violation) => `  [${violation.code}] ${violation.name}@${violation.version} — ${violation.detail}`).join("\n");
}

/** A parsed JSON value whose fields have not been checked yet. */
type Unchecked = Record<string, unknown>;

const isUnchecked = (value: unknown): value is Unchecked => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Registry facts per version from a packument's `time` and `versions` maps; a version only in `time`
 * was published and later removed. Throws on a non-object body, so the package counts as unreachable.
 */
export function registryFactsFromPackument(packument: unknown): Map<string, RegistryFact> {
  if (!isUnchecked(packument)) throw new Error("the packument is not a JSON object");
  const time = isUnchecked(packument.time) ? packument.time : {};
  const published = new Set(Object.keys(isUnchecked(packument.versions) ? packument.versions : {}));
  const facts = new Map<string, RegistryFact>();
  for (const version of new Set([...Object.keys(time), ...published])) {
    const publishedAt = time[version];
    facts.set(version, {
      publishedAt: typeof publishedAt === "string" ? publishedAt : undefined,
      stillPublished: published.has(version),
    });
  }
  return facts;
}

export interface AuditInput {
  readonly packages: readonly ResolvedPackage[];
  /** One packument's facts per package name; rejects when it cannot answer. */
  readonly fetchFacts: (name: string) => Promise<Map<string, RegistryFact>>;
  readonly now: number;
  readonly minimumReleaseAgeMinutes: number | null;
  /** How many packuments to have in flight at once. */
  readonly concurrency: number;
}

export interface AuditResult {
  readonly violations: Violation[];
  /** `name (reason)` for every package the registry did not answer for. */
  readonly unreachable: string[];
  /** Every version asked about, with what the registry said, for `--verbose`. */
  readonly checked: Array<{ readonly pkg: ResolvedPackage; readonly fact: RegistryFact }>;
}

/**
 * Evaluates every package, fetching one packument per name. A version the packument omits counts as
 * unpublished, and a rejected fetch goes to `unreachable`, which the caller fails on.
 */
export async function auditPackages(input: AuditInput): Promise<AuditResult> {
  const { packages, fetchFacts, now, minimumReleaseAgeMinutes, concurrency } = input;
  const byName = new Map<string, ResolvedPackage[]>();
  for (const pkg of packages) {
    const bucket = byName.get(pkg.name);
    if (bucket === undefined) byName.set(pkg.name, [pkg]);
    else bucket.push(pkg);
  }

  const names = [...byName.keys()];
  const result: AuditResult = { violations: [], unreachable: [], checked: [] };
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < names.length) {
      const name = names[cursor++];
      if (name === undefined) return;

      let facts: Map<string, RegistryFact>;
      try {
        facts = await fetchFacts(name);
      } catch (error) {
        result.unreachable.push(`${name} (${error instanceof Error ? error.message : String(error)})`);
        continue;
      }

      for (const pkg of byName.get(name) ?? []) {
        const fact = facts.get(pkg.version) ?? { publishedAt: undefined, stillPublished: false };
        result.checked.push({ pkg, fact });
        const violation = evaluatePackage({ pkg, fact, now, minimumReleaseAgeMinutes });
        if (violation !== undefined) result.violations.push(violation);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), names.length) }, worker));
  return result;
}
