// The pure rules behind check-changeset-size.ts: a changeset's text in, errors out. A changeset's
// summary becomes one line of the plugin's public CHANGELOG.md and of its GitHub Release, so it
// stays one short line; the reasoning belongs in the pull request the changelog links to.

/**
 * The summary ceiling, in characters (`.length`, UTF-16 code units). 200 is about two lines of a
 * rendered GitHub Release: enough to say what changed for users, too short to carry the why.
 */
export const MAX_SUMMARY_CHARACTERS = 200;

/** The bumps a changeset may declare. */
export const BUMPS = ["patch", "minor", "major"] as const;

/** One `"<package>": <bump>` frontmatter line; the name may be bare, single- or double-quoted. */
const RELEASE_LINE = /^(["']?)([^"':\s]+)\1\s*:\s*(\S+)\s*$/;

/** Whether a `.changeset/` entry is a changeset rather than its README or config. */
export const isChangesetFile = (name: string): boolean => name.endsWith(".md") && name.toLowerCase() !== "readme.md";

/** Errors for one changeset; `packages` are the names Changesets may bump. */
export function checkChangeset(path: string, text: string, packages: ReadonlySet<string>): string[] {
  const match = /^---\r?\n([\s\S]*?)^---[ \t]*(?:\r?\n|$)([\s\S]*)$/m.exec(text);
  if (match === null || !text.startsWith("---")) return [`${path}: needs frontmatter between two \`---\` lines`];
  const [, frontmatter = "", body = ""] = match;

  const errors: string[] = [];
  const named = new Set<string>();
  for (const line of frontmatter.split(/\r?\n/)) {
    if (line.trim() === "") continue;
    const release = RELEASE_LINE.exec(line.trim());
    if (release === null) {
      errors.push(`${path}: frontmatter line ${JSON.stringify(line)} is not \`"<package>": <bump>\``);
      continue;
    }
    const [, , name = "", bump = ""] = release;
    if (!packages.has(name)) errors.push(`${path}: names "${name}", which is not a plugin package here (${[...packages].join(", ")})`);
    if (!(BUMPS as readonly string[]).includes(bump)) errors.push(`${path}: bump "${bump}" for "${name}" is not one of ${BUMPS.join(", ")}`);
    if (named.has(name)) errors.push(`${path}: names "${name}" twice`);
    named.add(name);
  }
  if (named.size === 0 && errors.length === 0) errors.push(`${path}: names no package; every changeset bumps at least one plugin`);

  const summary = body.trim();
  if (summary === "") errors.push(`${path}: has no summary; write one line saying what changed for users`);
  else if (/\r?\n/.test(summary)) errors.push(`${path}: the summary spans ${summary.split(/\r?\n/).length} lines; keep it to one and put the reasoning in the pull request`);
  else if (summary.length > MAX_SUMMARY_CHARACTERS) {
    errors.push(`${path}: the summary is ${summary.length} characters, over the ${MAX_SUMMARY_CHARACTERS}-character ceiling; say what changed for users and put the reasoning in the pull request`);
  }
  return errors;
}
