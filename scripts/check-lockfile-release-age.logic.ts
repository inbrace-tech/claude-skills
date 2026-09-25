// The pure half of the lockfile audit: two questions about the `name@version`
// entries `pnpm-lock.yaml` resolves. Is the version still published in the
// registry, and is it older than `minimumReleaseAge` minutes? Which entries are
// asked, and which of the two questions, depends on the scope; see below.
//
// PORTED from the lockfile release-age gate of Inbrace's internal agent
// harness, where it runs as a pull-request gate and a daily sweep. What came
// across, under the harness's own names: the lockfile parser
// (`parseResolvedVersions`, `splitResolvedKey`, `addedResolvedVersions`,
// `allResolvedVersions`), the single-package decision (`evaluatePackage`) and
// its three violation codes, `parseMinimumReleaseAge`, `formatMinutes` and
// `formatViolations`. What differs, and why:
//   - `registryFactsFromPackument` reads a packument the harness read inline in
//     its entry point with a type assertion. Here it narrows `unknown` instead,
//     since this repository accepts no `as`, and it lives on this side so the
//     narrowing is tested.
//   - `auditPackages` is the harness's fan-out loop, moved out of the entry
//     point with the registry fetch injected, so that "an unreachable registry
//     fails the audit" is proven by a spec that never touches the network.
//
// WHY THIS EXISTS WHEN `minimumReleaseAge` ALREADY DOES
//
// `pnpm-workspace.yaml` carries `minimumReleaseAge`, and that setting is the
// primary control against a poisoned release: pnpm does not merely prefer an
// aged version, it refuses to resolve one under the floor and falls back to an
// older compliant version. `minimumReleaseAgeStrict`, off here, decides only
// what happens when NO version satisfies the floor: fail, or fall back. The
// file is committed, so every contributor and every CI run already reads it.
//
// So the age question here is a BACKSTOP for a narrow residue: a lockfile that
// floor never saw. A pnpm predating the setting, a hand-resolved merge
// conflict, or a hand-edited lockfile. It is worth asking because it is nearly
// free once the registry is being queried anyway, and not worth building for
// on its own.
//
// THE QUESTION THAT EARNS THIS AUDIT ITS PLACE is registry absence, which no
// local setting can observe at all. A malicious release is taken down rather
// than aged out, so a lockfile pinning a version that has DISAPPEARED from the
// registry is reporting a takedown. A takedown can also happen long AFTER a
// version merged, which no per-PR delta can see: nothing about the lockfile
// changes when the registry removes something. That is why the scheduled sweep
// asks this question of the whole lockfile; see `evaluatePackage`'s
// `minimumReleaseAgeMinutes: null` mode.
//
// TWO SCOPES, BECAUSE THE TWO QUESTIONS HAVE DIFFERENT NATURAL ONES
//
// On a pull request the audit evaluates only the entries a change ADDS, both
// questions. An entry already on the base branch was evaluated when it landed
// and has only aged since, so re-checking it costs one registry round-trip per
// package to re-derive a known answer.
//
// The scheduled sweep evaluates the WHOLE lockfile, takedown question only.
// Age is not asked again there: every entry passed the floor when it merged,
// so flagging one again would make a daily job noisy.
//
// No `node:fs`, no `fetch` and no `git` here: this file takes lockfile TEXT and
// a registry fetcher as arguments, so every branch is provable from a spec
// without a network or a repository. The I/O lives in
// check-lockfile-release-age.ts.

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

// A lockfile entry at the top of the `packages:` / `snapshots:` blocks sits at
// exactly two spaces of indent and is spelled either `name@version:` or, when
// peers take part in the resolution, `'name@version(peer@version)':`. Matching
// the two-space indent is what keeps the `importers:` block, whose `version:`
// lines sit deeper, out of the result.
const LOCKFILE_ENTRY = /^ {2}'?((?:@[^@'\s/]+\/)?[^@'\s/][^@'\s]*)@([0-9][^'():\s]*)'?(?:\(|:)/;

/**
 * Every `name@version` a pnpm lockfile resolves, keyed as `name@version`.
 *
 * Peer-suffixed snapshot keys collapse onto the same identity as their
 * `packages:` entry, which is the intent: `@scope/plugin@2.1.0(core@1.4.0)`
 * and `@scope/plugin@2.1.0` are one published artifact.
 */
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

/**
 * The entries `headText` resolves that `baseText` did not, sorted for a stable
 * report. An entry removed by the change is not a finding: only additions can
 * introduce an artifact this repository did not already trust.
 */
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
  /**
   * The age floor to enforce, or `null` to ask the takedown question alone:
   * what the scheduled whole-lockfile sweep passes, since every entry already
   * on the branch has aged since it merged.
   */
  readonly minimumReleaseAgeMinutes: number | null;
}

/**
 * The single-package decision. Returns `undefined` when the package is clean.
 *
 * Absence is reported ahead of age because a taken-down version is the more
 * serious state, and its publish date, if the registry still carries one,
 * would otherwise describe a version nobody can install.
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
 * The `minimumReleaseAge` this repository declares, read from the text of
 * `pnpm-workspace.yaml` so the audit and pnpm cannot drift to two floors.
 *
 * Returns `undefined` when the key is absent. The caller decides what that
 * means, because an audit with no floor to enforce is a configuration failure
 * rather than a clean tree.
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
 * The registry facts one packument carries, keyed by version: every version
 * the `time` map dates or the `versions` map lists. A version found only in
 * `time` is one the registry published and no longer lists.
 *
 * Throws when the body is not a JSON object, so the caller counts the package
 * as unreachable rather than as clean. A missing `time` or `versions` map
 * reads as empty, and a `time` entry that is not a string as no date.
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
 * Asks the registry about every package and evaluates each version.
 *
 * One packument answers every version of a package, so the fan-out is over
 * distinct NAMES while the evaluation stays per version. A version the
 * packument does not mention at all counts as no longer published. A package
 * whose fetch rejects goes to `unreachable`, never to a clean result: the
 * caller fails the audit on it.
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
