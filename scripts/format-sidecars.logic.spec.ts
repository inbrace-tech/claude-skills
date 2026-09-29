// Tests for format-sidecars' pure rules, with strings and no file system (`pnpm test`).

import { isSidecarPath, planRewrites } from "./format-sidecars.logic.ts";

describe("format-sidecars rules", () => {
  const canonical = '{\n  "norms": [\n    {\n      "id": "N01",\n      "refs": { "o/r": [1] }\n    }\n  ]\n}\n';
  const expanded = JSON.stringify(JSON.parse(canonical), null, 2);

  it("isSidecarPath matches norm and trap histories only", () => {
    expect(isSidecarPath("plugins/p/skills/s/SKILL.norms.json")).toBe(true);
    expect(isSidecarPath("plugins/p/skills/t/transitions/a-to-b.traps.json")).toBe(true);
    expect(isSidecarPath("plugins/p/package.json")).toBe(false);
    expect(isSidecarPath("plugins/p/.claude-plugin/plugin.json")).toBe(false);
  });

  it("rewrites only what is not canonical, sorted by path, and lists invalid JSON apart", () => {
    const plan = planRewrites([
      { path: "b.norms.json", text: expanded },
      { path: "a.norms.json", text: canonical },
      { path: "c.traps.json", text: "{ broken" },
      { path: "a2.traps.json", text: expanded },
    ]);
    expect(plan.rewrites).toStrictEqual([
      { path: "a2.traps.json", text: canonical },
      { path: "b.norms.json", text: canonical },
    ]);
    expect(plan.invalid).toStrictEqual(["c.traps.json"]);
  });

  it("plans nothing when every sidecar is canonical", () => {
    expect(planRewrites([{ path: "a.norms.json", text: canonical }])).toStrictEqual({ rewrites: [], invalid: [] });
  });
});
