// The pure rules behind release-notes.ts: a plugin's CHANGELOG.md in, one version's release notes out.

/** Where the full changelog lives at a release's tag. */
export const changelogUrl = (plugin: string, version: string): string =>
  `https://github.com/inbrace-tech/claude-skills/blob/${plugin}@${version}/plugins/${plugin}/CHANGELOG.md`;

/** A version as Changesets writes it: semver, with an optional prerelease or build suffix. */
export const VERSION = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.+-]+)?$/;

/**
 * Reads the version argument as `1.2.3`, `v1.2.3` or `<plugin>@1.2.3`. A plugin part must be one of
 * `plugins`, and equal `pluginFlag` when that is given; the result names the plugin when it is
 * certain: the flag, the tag's plugin, or the only plugin there is.
 */
export function parseVersionArg(arg: string, plugins: readonly string[], pluginFlag?: string): { plugin: string; version: string } | { error: string } {
  const at = arg.lastIndexOf("@");
  const tagged = at > 0 ? arg.slice(0, at) : undefined;
  const version = (at > 0 ? arg.slice(at + 1) : arg).replace(/^v/, "");
  if (!VERSION.test(version)) return { error: `"${arg}" is not a version like 1.2.3, v1.2.3 or <plugin>@1.2.3` };
  if (tagged !== undefined && pluginFlag !== undefined && tagged !== pluginFlag) return { error: `"${arg}" names ${tagged}, but --plugin is ${pluginFlag}` };
  const plugin = pluginFlag ?? tagged ?? (plugins.length === 1 ? plugins[0] : undefined);
  if (plugin === undefined) return { error: `several plugins here (${plugins.join(", ")}); pass --plugin or <plugin>@<version>` };
  if (!plugins.includes(plugin)) return { error: `no plugin "${plugin}" here (${plugins.join(", ")})` };
  return { plugin, version };
}

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
  const section = changelogSection(changelog, version);
  const path = `plugins/${plugin}/CHANGELOG.md`;
  if (section === null) return { error: `${path} has no "## ${version}" section; merge the version pull request first` };
  if (section === "") return { error: `${path}'s "## ${version}" section is empty` };
  return { notes: `${section}\n\nFull changelog: ${changelogUrl(plugin, version)}\n` };
}
