// Unit tests for the lockfile audit's pure half: lockfile and workspace text
// in, violations out. No network: the registry is a function the specs pass.
//   pnpm test
// The entry point is tested end to end in `check-lockfile-release-age.spec.ts`.
//
// The `should-catch` cases are what make this audit more than a green tick: a
// check that never fires is indistinguishable from one whose subject moved
// away underneath it. The fixtures model the threat the audit was built for, a
// poisoned release published inside a short window and then taken down, with
// invented package names.
//
// The last describe block runs the parser against the LIVE `pnpm-lock.yaml`.
// Its job is not to re-assert what the fixtures prove but to establish that
// the lockfile still has the shape the parser looks for: a pnpm format change
// would leave every fixture case green while the audit parsed an empty set and
// reported a clean delta forever.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  addedResolvedVersions,
  allResolvedVersions,
  auditPackages,
  evaluatePackage,
  formatMinutes,
  formatViolations,
  parseMinimumReleaseAge,
  parseResolvedVersions,
  registryFactsFromPackument,
  splitResolvedKey,
} from "./check-lockfile-release-age.logic.ts";
import type { RegistryFact } from "./check-lockfile-release-age.logic.ts";

const BASE_LOCKFILE = [
  "lockfileVersion: '9.0'",
  "",
  "importers:",
  "",
  "  .:",
  "    dependencies:",
  "      core-lib:",
  "        specifier: 1.4.0",
  "        version: 1.4.0",
  "",
  "packages:",
  "",
  "  core-lib@1.4.0:",
  "    resolution: {integrity: sha512-aaa}",
  "",
  "  '@scope/plugin@2.1.0':",
  "    resolution: {integrity: sha512-bbb}",
  "",
  "snapshots:",
  "",
  "  '@scope/plugin@2.1.0(core-lib@1.4.0)':",
  "    dependencies:",
  "      core-lib: 1.4.0",
  "",
].join("\n");

/** The same tree after a bump to a version published inside a poisoned window. */
const HEAD_LOCKFILE = BASE_LOCKFILE.replace(/1\.4\.0/g, "1.5.0");

const MINUTES = 60_000;
const NOW = Date.parse("2026-01-10T12:00:00.000Z");

describe("parseResolvedVersions", () => {
  it("reads a plain entry and a scoped entry from the packages block", () => {
    const resolved = parseResolvedVersions(BASE_LOCKFILE);
    expect(resolved.has("core-lib@1.4.0")).toBe(true);
    expect(resolved.has("@scope/plugin@2.1.0")).toBe(true);
  });

  it("collapses a peer-suffixed snapshot key onto the published artifact", () => {
    // `'@scope/plugin@2.1.0(core-lib@1.4.0)'` and `@scope/plugin@2.1.0` are
    // one published tarball; counting them twice would double the registry
    // fan-out and report the same package twice in a violation list.
    const resolved = [...parseResolvedVersions(BASE_LOCKFILE)].filter((key) => key.startsWith("@scope/plugin@"));
    expect(resolved).toEqual(["@scope/plugin@2.1.0"]);
  });

  it("ignores the importers block, whose version lines sit deeper", () => {
    // `        version: 1.4.0` under `importers:` is a specifier echo, not a
    // resolution; matching it would make every importer entry a phantom
    // package named `version`.
    expect([...parseResolvedVersions(BASE_LOCKFILE)]).not.toContain("version@1.4.0");
  });
});

describe("splitResolvedKey", () => {
  it("splits a scoped name on the LAST separator, not the first", () => {
    expect(splitResolvedKey("@scope/plugin@2.1.0")).toEqual({ name: "@scope/plugin", version: "2.1.0" });
  });

  it("splits a prerelease version whole", () => {
    expect(splitResolvedKey("@scope/engine-build@7.9.0-1.e922089")).toEqual({ name: "@scope/engine-build", version: "7.9.0-1.e922089" });
  });
});

describe("allResolvedVersions", () => {
  it("returns every resolution, which is what the scheduled sweep walks", () => {
    // The sweep depends on no base ref by design: a version withdrawn from the
    // registry long after it merged is added by no pull request, so only a
    // full pass over the lockfile can observe it.
    expect(allResolvedVersions(BASE_LOCKFILE)).toEqual([
      { name: "@scope/plugin", version: "2.1.0" },
      { name: "core-lib", version: "1.4.0" },
    ]);
  });
});

describe("addedResolvedVersions", () => {
  it("reports only what the head adds", () => {
    const added = addedResolvedVersions(BASE_LOCKFILE, HEAD_LOCKFILE);
    expect(added).toContainEqual({ name: "core-lib", version: "1.5.0" });
    expect(added).not.toContainEqual({ name: "core-lib", version: "1.4.0" });
  });

  it("reports nothing when the lockfile is untouched", () => {
    expect(addedResolvedVersions(BASE_LOCKFILE, BASE_LOCKFILE)).toEqual([]);
  });

  it("does not report a REMOVED entry as a finding", () => {
    // Dropping a dependency cannot introduce an artifact this repository did
    // not already trust, so the delta is deliberately one-directional.
    expect(addedResolvedVersions(HEAD_LOCKFILE, BASE_LOCKFILE)).not.toContainEqual({ name: "core-lib", version: "1.5.0" });
  });
});

describe("evaluatePackage", () => {
  const floor = 4320;

  it("passes a version published well past the floor", () => {
    expect(
      evaluatePackage({
        pkg: { name: "core-lib", version: "1.4.0" },
        fact: { publishedAt: "2025-09-21T00:39:26.982Z", stillPublished: true },
        now: NOW,
        minimumReleaseAgeMinutes: floor,
      }),
    ).toBeUndefined();
  });

  it("should-catch: a version published inside the floor", () => {
    // Published 145 minutes before NOW.
    const violation = evaluatePackage({
      pkg: { name: "core-lib", version: "1.5.0" },
      fact: { publishedAt: "2026-01-10T09:35:00.763Z", stillPublished: true },
      now: NOW,
      minimumReleaseAgeMinutes: floor,
    });
    expect(violation?.code).toBe("version-too-fresh");
  });

  it("should-catch: a version the registry no longer lists", () => {
    // This is the question `minimumReleaseAge` cannot reach at all: a
    // taken-down version ages past any floor while staying uninstallable and
    // untrustworthy.
    const violation = evaluatePackage({
      pkg: { name: "cache-lib", version: "7.2.10" },
      fact: { publishedAt: "2026-01-10T10:14:41.662Z", stillPublished: false },
      now: Date.parse("2026-01-29T00:00:00.000Z"),
      minimumReleaseAgeMinutes: floor,
    });
    expect(violation?.code).toBe("version-absent-from-registry");
  });

  it("reports absence ahead of age when a version is both fresh and gone", () => {
    const violation = evaluatePackage({
      pkg: { name: "cache-lib", version: "7.2.10" },
      fact: { publishedAt: "2026-01-10T10:14:41.662Z", stillPublished: false },
      now: NOW,
      minimumReleaseAgeMinutes: floor,
    });
    expect(violation?.code).toBe("version-absent-from-registry");
  });

  it("should-catch: a published version the registry gives no date for", () => {
    const violation = evaluatePackage({
      pkg: { name: "thin-meta", version: "5.0.1" },
      fact: { publishedAt: undefined, stillPublished: true },
      now: NOW,
      minimumReleaseAgeMinutes: floor,
    });
    expect(violation?.code).toBe("publish-date-unknown");
  });

  it("should-catch: an unparseable publish date", () => {
    const violation = evaluatePackage({
      pkg: { name: "thin-meta", version: "5.0.1" },
      fact: { publishedAt: "not-a-date", stillPublished: true },
      now: NOW,
      minimumReleaseAgeMinutes: floor,
    });
    expect(violation?.code).toBe("publish-date-unknown");
  });

  it("sweep mode still reports a taken-down version", () => {
    // `minimumReleaseAgeMinutes: null` is what the `--all` sweep passes. The
    // takedown question is the one a per-PR delta cannot ask about an entry
    // that merged weeks ago, so it must survive the sweep's narrower scope.
    const violation = evaluatePackage({
      pkg: { name: "cache-lib", version: "7.2.10" },
      fact: { publishedAt: "2026-01-10T10:14:41.662Z", stillPublished: false },
      now: NOW,
      minimumReleaseAgeMinutes: null,
    });
    expect(violation?.code).toBe("version-absent-from-registry");
  });

  it("sweep mode does not flag a fresh version as too fresh", () => {
    // Every entry already on the branch passed the floor when it merged, so
    // flagging one that merged yesterday would make a daily job noisy.
    expect(
      evaluatePackage({
        pkg: { name: "core-lib", version: "1.5.0" },
        fact: { publishedAt: "2026-01-10T09:35:00.763Z", stillPublished: true },
        now: NOW,
        minimumReleaseAgeMinutes: null,
      }),
    ).toBeUndefined();
  });

  it("sweep mode tolerates a missing publish date", () => {
    // The date answers the age question alone, which the sweep does not ask,
    // so an old package with thin registry metadata must not fail it.
    expect(
      evaluatePackage({
        pkg: { name: "thin-meta", version: "5.0.1" },
        fact: { publishedAt: undefined, stillPublished: true },
        now: NOW,
        minimumReleaseAgeMinutes: null,
      }),
    ).toBeUndefined();
  });

  it("passes a version that clears the floor by a minute", () => {
    expect(
      evaluatePackage({
        pkg: { name: "core-lib", version: "1.5.0" },
        fact: { publishedAt: new Date(NOW - (floor + 1) * MINUTES).toISOString(), stillPublished: true },
        now: NOW,
        minimumReleaseAgeMinutes: floor,
      }),
    ).toBeUndefined();
  });
});

describe("parseMinimumReleaseAge", () => {
  it("reads the key from the workspace manifest", () => {
    expect(parseMinimumReleaseAge("minimumReleaseAge: 4320\n")).toBe(4320);
  });

  it("reads it past a trailing comment", () => {
    expect(parseMinimumReleaseAge("minimumReleaseAge: 4320 # 3 days\n")).toBe(4320);
  });

  it("does not mistake the Strict sibling for the floor", () => {
    // `minimumReleaseAgeStrict: false` sits next to the real key in
    // pnpm-workspace.yaml; a prefix match would read `false` as the floor.
    expect(parseMinimumReleaseAge("minimumReleaseAgeStrict: false\n")).toBeUndefined();
  });

  it("reports absence rather than defaulting to zero", () => {
    // A silent 0 would be a floor no version can fail: an audit that only
    // looks like it guards anything.
    expect(parseMinimumReleaseAge("packages:\n  - .\n")).toBeUndefined();
  });
});

describe("formatMinutes", () => {
  it("renders each unit at its own scale", () => {
    expect(formatMinutes(45)).toBe("45min");
    expect(formatMinutes(720)).toBe("12.0h");
    expect(formatMinutes(4320)).toBe("3.0d");
  });
});

describe("formatViolations", () => {
  it("names the code, the package and the reason on one line", () => {
    const rendered = formatViolations([{ code: "version-too-fresh", name: "core-lib", version: "1.5.0", detail: "too new." }]);
    expect(rendered).toContain("version-too-fresh");
    expect(rendered).toContain("core-lib@1.5.0");
    expect(rendered.split("\n")).toHaveLength(1);
  });
});

describe("registryFactsFromPackument", () => {
  it("dates every listed version and marks it published", () => {
    const facts = registryFactsFromPackument({
      time: { created: "2025-01-01T00:00:00.000Z", "1.4.0": "2025-09-21T00:39:26.982Z" },
      versions: { "1.4.0": {} },
    });
    expect(facts.get("1.4.0")).toEqual({ publishedAt: "2025-09-21T00:39:26.982Z", stillPublished: true });
  });

  it("marks a version the time map dates but the versions map dropped as unpublished", () => {
    // This is how a takedown shows in a packument: the publish is still dated,
    // the version is gone from `versions`.
    const facts = registryFactsFromPackument({
      time: { "7.2.10": "2026-01-10T10:14:41.662Z" },
      versions: { "7.2.9": {} },
    });
    expect(facts.get("7.2.10")).toEqual({ publishedAt: "2026-01-10T10:14:41.662Z", stillPublished: false });
  });

  it("keeps a listed version with no date as published and undated", () => {
    const facts = registryFactsFromPackument({ versions: { "5.0.1": {} } });
    expect(facts.get("5.0.1")).toEqual({ publishedAt: undefined, stillPublished: true });
  });

  it("reads a non-string date as no date", () => {
    const facts = registryFactsFromPackument({ time: { "5.0.1": 1_700_000_000 }, versions: { "5.0.1": {} } });
    expect(facts.get("5.0.1")?.publishedAt).toBeUndefined();
  });

  it("throws on a body that is not a JSON object, so the package is not counted as clean", () => {
    expect(() => registryFactsFromPackument(null)).toThrow(/not a JSON object/);
    expect(() => registryFactsFromPackument([])).toThrow(/not a JSON object/);
    expect(() => registryFactsFromPackument("<html>")).toThrow(/not a JSON object/);
  });
});

describe("auditPackages", () => {
  const floor = 4320;
  const old = "2025-09-21T00:00:00.000Z";
  const registry = (packuments: Record<string, unknown>) => (name: string) => {
    if (!(name in packuments)) return Promise.reject(new Error(`${name} responded 503`));
    return Promise.resolve(registryFactsFromPackument(packuments[name]));
  };

  it("passes versions the registry lists and dates past the floor", async () => {
    const result = await auditPackages({
      packages: [{ name: "core-lib", version: "1.4.0" }],
      fetchFacts: registry({ "core-lib": { time: { "1.4.0": old }, versions: { "1.4.0": {} } } }),
      now: NOW,
      minimumReleaseAgeMinutes: floor,
      concurrency: 8,
    });
    expect(result.violations).toEqual([]);
    expect(result.unreachable).toEqual([]);
    expect(result.checked).toHaveLength(1);
  });

  it("should-catch: an unreachable registry lands in unreachable, never in a clean result", async () => {
    // The entry point fails on a non-empty `unreachable`. Were a rejected fetch
    // swallowed here, a registry outage would pass the audit green.
    const result = await auditPackages({
      packages: [
        { name: "core-lib", version: "1.4.0" },
        { name: "@scope/plugin", version: "2.1.0" },
      ],
      fetchFacts: registry({ "core-lib": { time: { "1.4.0": old }, versions: { "1.4.0": {} } } }),
      now: NOW,
      minimumReleaseAgeMinutes: floor,
      concurrency: 8,
    });
    expect(result.unreachable).toEqual(["@scope/plugin (@scope/plugin responded 503)"]);
    expect(result.checked.map(({ pkg }) => pkg.name)).toEqual(["core-lib"]);
  });

  it("should-catch: a version the packument does not mention at all counts as unpublished", async () => {
    const result = await auditPackages({
      packages: [{ name: "core-lib", version: "9.9.9" }],
      fetchFacts: registry({ "core-lib": { time: { "1.4.0": old }, versions: { "1.4.0": {} } } }),
      now: NOW,
      minimumReleaseAgeMinutes: floor,
      concurrency: 8,
    });
    expect(result.violations.map((violation) => violation.code)).toEqual(["version-absent-from-registry"]);
  });

  it("fetches one packument per name and evaluates every version of it", async () => {
    const asked: string[] = [];
    const fetchFacts = (name: string): Promise<Map<string, RegistryFact>> => {
      asked.push(name);
      return registry({
        "core-lib": {
          time: { "1.4.0": old, "1.5.0": new Date(NOW - 145 * MINUTES).toISOString() },
          versions: { "1.4.0": {}, "1.5.0": {} },
        },
      })(name);
    };
    const result = await auditPackages({
      packages: [
        { name: "core-lib", version: "1.4.0" },
        { name: "core-lib", version: "1.5.0" },
      ],
      fetchFacts,
      now: NOW,
      minimumReleaseAgeMinutes: floor,
      concurrency: 8,
    });
    expect(asked).toEqual(["core-lib"]);
    expect(result.violations).toEqual([expect.objectContaining({ code: "version-too-fresh", version: "1.5.0" })]);
  });

  it("asks about every name even with fewer workers than names", async () => {
    const names = ["a", "b", "c", "d", "e"];
    const packuments = Object.fromEntries(names.map((name) => [name, { time: { "1.0.0": old }, versions: { "1.0.0": {} } }]));
    const result = await auditPackages({
      packages: names.map((name) => ({ name, version: "1.0.0" })),
      fetchFacts: registry(packuments),
      now: NOW,
      minimumReleaseAgeMinutes: floor,
      concurrency: 2,
    });
    expect(result.checked.map(({ pkg }) => pkg.name).sort()).toEqual(names);
  });

  it("asks nothing when there is nothing to ask about", async () => {
    const result = await auditPackages({
      packages: [],
      fetchFacts: () => Promise.reject(new Error("must not be called")),
      now: NOW,
      minimumReleaseAgeMinutes: floor,
      concurrency: 8,
    });
    expect(result).toEqual({ violations: [], unreachable: [], checked: [] });
  });
});

describe("against the live repository", () => {
  const repoRoot = join(import.meta.dirname, "..");

  it("parses the real lockfile into a non-trivial set of resolutions", () => {
    const resolved = parseResolvedVersions(readFileSync(join(repoRoot, "pnpm-lock.yaml"), "utf8"));
    // A pnpm lockfile-format change is the failure this guards: the parser
    // would match nothing, the delta would be empty forever, and the audit
    // would report clean on every pull request. The dev tools alone resolve
    // well over this many.
    expect(resolved.size).toBeGreaterThan(50);
    expect([...resolved].every((key) => key.includes("@"))).toBe(true);
  });

  it("finds the floor the workspace manifest actually declares", () => {
    const declared = parseMinimumReleaseAge(readFileSync(join(repoRoot, "pnpm-workspace.yaml"), "utf8"));
    expect(declared).toBeGreaterThan(0);
  });
});
