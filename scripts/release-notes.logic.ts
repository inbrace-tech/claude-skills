// The pure rules behind release-notes.ts: a plugin's CHANGELOG.md in, one version's release notes out.

/** Where the full changelog lives at a release's tag. */
export const changelogUrl = (plugin: string, version: string): string =>
  `https://github.com/inbrace-tech/claude-skills/blob/${plugin}@${version}/plugins/${plugin}/CHANGELOG.md`;

/** A version as Changesets writes it: semver, with an optional prerelease or build suffix. */
export const VERSION = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.+-]+)?$/;

/** The body under `## <version>`, up to the next `## ` heading; null when the heading is missing. */
export function changelogSection(changelog: string, version: string): string | null {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trimEnd() === `## ${version}`);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
}

/** The release notes for `version`, or the error saying why there are none. */
export function releaseNotes(plugin: string, changelog: string, version: string): { notes: string } | { error: string } {
  if (!VERSION.test(version)) return { error: `"${version}" is not a version like 1.2.3` };
  const section = changelogSection(changelog, version);
  const path = `plugins/${plugin}/CHANGELOG.md`;
  if (section === null) return { error: `${path} has no "## ${version}" section; merge the version pull request first` };
  if (section === "") return { error: `${path}'s "## ${version}" section is empty` };
  return { notes: `${section}\n\nFull changelog: ${changelogUrl(plugin, version)}\n` };
}
