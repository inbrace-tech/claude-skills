// The pure rules behind sync-plugin-version.ts: text in, text and errors out, so every rule is tested
// with strings. A plugin's version lives in its package.json, where Changesets moves it; Claude Code
// reads it from .claude-plugin/plugin.json, and the marketplace entry must not contradict it.

/** One plugin as read from disk: repository paths and file text, `null` when the file is missing. */
export interface PluginInput {
  /** The plugin directory, e.g. `plugins/inbrace-config`. */
  dir: string;
  packageText: string | null;
  pluginText: string | null;
}

/** What syncing one plugin found: the plugin.json text it should hold, and why it cannot be synced. */
export interface PluginSync {
  dir: string;
  /** The package's version, when it could be read. */
  version: string | null;
  /** plugin.json with the package's version; equal to the input when already in sync. */
  pluginText: string | null;
  errors: string[];
}

/** A JSON object whose fields have not been checked yet. */
type Unchecked = Record<string, unknown>;

const isObject = (value: unknown): value is Unchecked => typeof value === "object" && value !== null && !Array.isArray(value);

/** A top-level `"version": "…"` line, the only form this script rewrites. */
const VERSION_LINE = /^( {2}"version"\s*:\s*)"[^"\n]*"/m;

/** Parses JSON text into an object, or returns the error naming `path`. */
function parseObject(path: string, text: string): Unchecked | string {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    return `${path}: not valid JSON (${error instanceof Error ? error.message : String(error)})`;
  }
  return isObject(value) ? value : `${path}: must be a JSON object`;
}

/** plugin.json with its top-level `version` set, keeping every other byte; an error when there is no such line. */
export function setVersion(pluginText: string, version: string): string | null {
  if (!VERSION_LINE.test(pluginText)) return null;
  return pluginText.replace(VERSION_LINE, (_line, prefix: string) => `${prefix}${JSON.stringify(version)}`);
}

/** Reads one plugin's package.json and plugin.json and computes the plugin.json it should hold. */
export function syncPlugin({ dir, packageText, pluginText }: PluginInput): PluginSync {
  const packagePath = `${dir}/package.json`;
  const pluginPath = `${dir}/.claude-plugin/plugin.json`;
  const result: PluginSync = { dir, version: null, pluginText, errors: [] };

  if (packageText === null) {
    result.errors.push(`${packagePath}: missing; every plugin is a private package Changesets versions (see CONTRIBUTING.md › Versions)`);
    return result;
  }
  if (pluginText === null) {
    result.errors.push(`${pluginPath}: missing`);
    return result;
  }
  const pkg = parseObject(packagePath, packageText);
  const plugin = parseObject(pluginPath, pluginText);
  if (typeof pkg === "string") result.errors.push(pkg);
  if (typeof plugin === "string") result.errors.push(plugin);
  if (typeof pkg === "string" || typeof plugin === "string") return result;

  if (typeof pkg["version"] !== "string" || pkg["version"] === "") {
    result.errors.push(`${packagePath}: needs a "version" string`);
    return result;
  }
  if (pkg["private"] !== true) result.errors.push(`${packagePath}: must set "private": true, so nothing publishes it to npm`);
  if (pkg["name"] !== plugin["name"]) {
    result.errors.push(`${packagePath}: "name" is ${JSON.stringify(pkg["name"])} but ${pluginPath} says ${JSON.stringify(plugin["name"])}; they must match`);
  }

  const version = pkg["version"];
  result.version = version;
  const synced = setVersion(pluginText, version);
  if (synced === null) {
    result.errors.push(`${pluginPath}: needs a top-level "version" line, indented two spaces, for the version to be written into`);
    return result;
  }
  result.pluginText = synced;
  return result;
}

/**
 * Errors for marketplace entries that set a `version` other than their plugin's. Claude Code reads
 * plugin.json's version first, so a different entry version is dead text that misleads a reader.
 * `versions` maps a plugin directory (`plugins/<name>`) to its package version.
 */
export function checkMarketplace(marketplaceText: string, versions: ReadonlyMap<string, string>): string[] {
  const path = ".claude-plugin/marketplace.json";
  const marketplace = parseObject(path, marketplaceText);
  if (typeof marketplace === "string") return [marketplace];
  const plugins = marketplace["plugins"];
  if (!Array.isArray(plugins)) return [`${path}: needs a "plugins" array`];

  const errors: string[] = [];
  for (const entry of plugins) {
    if (!isObject(entry) || !("version" in entry)) continue;
    const source = entry["source"];
    const dir = typeof source === "string" ? source.replace(/^\.\//, "").replace(/\/$/, "") : null;
    const expected = dir === null ? undefined : versions.get(dir);
    if (expected === undefined) continue;
    if (entry["version"] !== expected) {
      errors.push(
        `${path}: the "${String(entry["name"])}" entry sets version ${JSON.stringify(entry["version"])} but its plugin is at ${expected}; remove the entry's version, plugin.json carries it`,
      );
    }
  }
  return errors;
}
