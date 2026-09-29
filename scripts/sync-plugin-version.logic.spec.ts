// Tests for sync-plugin-version's pure rules, with strings and no file system (`pnpm test`).

import { checkMarketplace, setVersion, syncPlugin } from "./sync-plugin-version.logic.ts";
import type { PluginInput } from "./sync-plugin-version.logic.ts";

describe("sync-plugin-version rules", () => {
  const PLUGIN = '{\n  "name": "p",\n  "description": "A plugin.",\n  "version": "0.1.0",\n  "keywords": ["a", "b"]\n}\n';
  const pkg = (fields: Record<string, unknown> = {}): string => JSON.stringify({ name: "p", version: "0.2.0", private: true, ...fields });

  /** An out-of-sync plugin; each test changes one thing. */
  const plugin = (overrides: Partial<PluginInput> = {}): PluginInput => ({ dir: "plugins/p", packageText: pkg(), pluginText: PLUGIN, ...overrides });

  describe("setVersion", () => {
    it("rewrites only the top-level version, keeping every other byte", () => {
      expect(setVersion(PLUGIN, "1.0.0")).toBe(PLUGIN.replace('"0.1.0"', '"1.0.0"'));
    });

    it("leaves a nested version alone", () => {
      const nested = '{\n  "name": "p",\n  "version": "0.1.0",\n  "author": {\n    "version": "9"\n  }\n}\n';
      expect(setVersion(nested, "1.0.0")).toBe(nested.replace('"0.1.0"', '"1.0.0"'));
    });

    it("returns null when there is no top-level version line", () => {
      expect(setVersion('{\n  "name": "p"\n}\n', "1.0.0")).toBeNull();
    });
  });

  describe("syncPlugin", () => {
    it("writes the package's version into plugin.json", () => {
      const result = syncPlugin(plugin());
      expect(result.errors).toEqual([]);
      expect(result.version).toBe("0.2.0");
      expect(result.pluginText).toBe(PLUGIN.replace('"0.1.0"', '"0.2.0"'));
    });

    it("returns plugin.json unchanged when already in sync", () => {
      const result = syncPlugin(plugin({ packageText: pkg({ version: "0.1.0" }) }));
      expect(result.errors).toEqual([]);
      expect(result.pluginText).toBe(PLUGIN);
    });

    it("fails when the plugin has no package.json", () => {
      expect(syncPlugin(plugin({ packageText: null })).errors).toEqual([expect.stringMatching(/^plugins\/p\/package\.json: missing/)]);
    });

    it("fails when the plugin has no plugin.json", () => {
      expect(syncPlugin(plugin({ pluginText: null })).errors).toEqual(["plugins/p/.claude-plugin/plugin.json: missing"]);
    });

    it("fails on invalid JSON without throwing", () => {
      expect(syncPlugin(plugin({ packageText: "{" })).errors).toEqual([expect.stringMatching(/^plugins\/p\/package\.json: not valid JSON/)]);
      expect(syncPlugin(plugin({ pluginText: "[]" })).errors).toEqual(["plugins/p/.claude-plugin/plugin.json: must be a JSON object"]);
    });

    it("fails when the package has no version", () => {
      expect(syncPlugin(plugin({ packageText: pkg({ version: undefined }) })).errors).toEqual(['plugins/p/package.json: needs a "version" string']);
    });

    it("fails when the package is not private", () => {
      expect(syncPlugin(plugin({ packageText: pkg({ private: false }) })).errors).toEqual([expect.stringMatching(/must set "private": true/)]);
    });

    it("fails when the package and plugin names differ", () => {
      expect(syncPlugin(plugin({ packageText: pkg({ name: "q" }) })).errors).toEqual([expect.stringMatching(/"name" is "q" but .* says "p"/)]);
    });

    it("fails when plugin.json has no version line to write into", () => {
      const result = syncPlugin(plugin({ pluginText: '{\n  "name": "p"\n}\n' }));
      expect(result.errors).toEqual([expect.stringMatching(/needs a top-level "version" line/)]);
    });
  });

  describe("checkMarketplace", () => {
    const versions = new Map([["plugins/p", "0.2.0"]]);
    const marketplace = (entry: Record<string, unknown>): string => JSON.stringify({ name: "m", plugins: [{ name: "p", source: "./plugins/p", ...entry }] });

    it("passes an entry without a version", () => {
      expect(checkMarketplace(marketplace({}), versions)).toEqual([]);
    });

    it("passes an entry whose version matches", () => {
      expect(checkMarketplace(marketplace({ version: "0.2.0" }), versions)).toEqual([]);
    });

    it("fails an entry whose version differs", () => {
      expect(checkMarketplace(marketplace({ version: "0.1.0" }), versions)).toEqual([expect.stringMatching(/"p" entry sets version "0\.1\.0" but its plugin is at 0\.2\.0/)]);
    });

    it("matches a source with a trailing slash", () => {
      expect(checkMarketplace(marketplace({ source: "./plugins/p/", version: "0.1.0" }), versions)).toHaveLength(1);
    });

    it("skips an entry whose source is not a plugin here", () => {
      expect(checkMarketplace(marketplace({ source: { source: "github", repo: "o/r" }, version: "9.9.9" }), versions)).toEqual([]);
    });

    it("fails on a marketplace without a plugins array", () => {
      expect(checkMarketplace("{}", versions)).toEqual(['.claude-plugin/marketplace.json: needs a "plugins" array']);
    });
  });
});
