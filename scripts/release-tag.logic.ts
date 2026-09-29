// The pure rules behind release-tag.ts: plugin packages, tag lists and the environment in, the tags
// to check or push and the environment that signs them out.

/** An environment as `process.env` holds it. */
export type Env = Readonly<Record<string, string | undefined>>;

/**
 * The environment with `tag.gpgSign=true` appended through git's `GIT_CONFIG_*` variables, so every
 * tag the child creates is signed without touching any git config file. Entries already there are kept.
 */
export function signedTagEnv(env: Env): Record<string, string | undefined> {
  const count = Number.parseInt(env["GIT_CONFIG_COUNT"] ?? "0", 10);
  const index = Number.isNaN(count) || count < 0 ? 0 : count;
  return {
    ...env,
    GIT_CONFIG_COUNT: String(index + 1),
    [`GIT_CONFIG_KEY_${index}`]: "tag.gpgSign",
    [`GIT_CONFIG_VALUE_${index}`]: "true",
  };
}

/** The tag Changesets gives a workspace package's version (not the `v<version>` of a single-package repository). */
export const releaseTag = (name: string, version: string): string => `${name}@${version}`;

/** One plugin's package.json: its repository path and text. */
export interface PackageFile {
  path: string;
  text: string;
}

/** `<name>@<version>` for each plugin package, the tags a release must have on origin, or why one cannot be read. */
export function expectedTags(packages: readonly PackageFile[]): { tags: string[]; errors: string[] } {
  const tags: string[] = [];
  const errors: string[] = [];
  for (const { path, text } of packages) {
    let pkg: unknown;
    try {
      pkg = JSON.parse(text);
    } catch {
      errors.push(`${path}: not valid JSON`);
      continue;
    }
    const { name, version } = (typeof pkg === "object" && pkg !== null ? pkg : {}) as { name?: unknown; version?: unknown };
    if (typeof name === "string" && name !== "" && typeof version === "string" && version !== "") tags.push(releaseTag(name, version));
    else errors.push(`${path}: needs a "name" and a "version"`);
  }
  return { tags, errors };
}

/** Tag names in `git ls-remote --tags` output, peeled `^{}` lines folded into their tag. */
export function lsRemoteTags(output: string): Set<string> {
  const tags = new Set<string>();
  for (const line of output.split("\n")) {
    const ref = line.split("\t")[1]?.trim();
    if (ref?.startsWith("refs/tags/") === true) tags.add(ref.slice("refs/tags/".length).replace(/\^\{\}$/, ""));
  }
  return tags;
}

/** What release-tag does with each expected tag. */
export interface TagPlan {
  /** On origin already: fetch it and check it is annotated and signed. */
  published: string[];
  /** Local only: verify its signature, then push it. A failed earlier push lands here again. */
  push: string[];
  /** Neither local nor on origin after `changeset git-tag`: something went wrong creating it. */
  missing: string[];
}

/** Sorts every expected tag by where it is; nothing is left to do only when all are `published`. */
export function planTags(expected: readonly string[], remote: ReadonlySet<string>, local: ReadonlySet<string>): TagPlan {
  const plan: TagPlan = { published: [], push: [], missing: [] };
  for (const tag of expected) {
    if (remote.has(tag)) plan.published.push(tag);
    else if (local.has(tag)) plan.push.push(tag);
    else plan.missing.push(tag);
  }
  return plan;
}

/** What to do about a tag on origin that is not signed. */
export const unsignedRemedy = (tag: string): string =>
  `${tag} is on origin but not a signed tag: delete it (\`git push origin :refs/tags/${tag}\` and \`git tag --delete ${tag}\`), then run \`pnpm run release\` again`;
