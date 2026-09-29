// Tests for the canonical sidecar layout, with strings and no file system (`pnpm test`).

import { canonicalSidecar, inSidecarLayout, serialiseSidecar } from "./sidecar-layout.logic.ts";

describe("sidecar layout", () => {
  const CANONICAL = [
    "{",
    '  "surface": "plugins/p/skills/s/SKILL.md",',
    '  "norms": [',
    "    {",
    '      "id": "N01",',
    '      "where": "Stage 1",',
    '      "refs": { "docs": ["https://example.com/a", "https://example.com/b"], "inbrace-tech/claude-skills": [12, 21] },',
    '      "what": "Why — it exists."',
    "    },",
    "    {",
    '      "id": "N02",',
    '      "where": "Stage 1",',
    '      "refs": {},',
    '      "what": "Why."',
    "    }",
    "  ]",
    "}",
    "",
  ].join("\n");

  it("writes the structure over lines and every value inside an entry on one line", () => {
    expect(serialiseSidecar(JSON.parse(CANONICAL))).toBe(CANONICAL);
  });

  it("puts an expanded refs back on one line, keeping the content and key order", () => {
    const expanded = JSON.stringify(JSON.parse(CANONICAL), null, 2);
    expect(canonicalSidecar(expanded)).toBe(CANONICAL);
    expect(JSON.parse(canonicalSidecar(expanded) ?? "")).toStrictEqual(JSON.parse(expanded));
  });

  it("writes empty arrays and objects as [] and {}, and a nested object inline", () => {
    expect(serialiseSidecar({ transition: "x.md", traps: [] })).toBe('{\n  "transition": "x.md",\n  "traps": []\n}\n');
    expect(serialiseSidecar({ traps: [{ id: "P01", refs: { a: { b: [1] } } }] })).toBe(
      '{\n  "traps": [\n    {\n      "id": "P01",\n      "refs": { "a": { "b": [1] } }\n    }\n  ]\n}\n',
    );
  });

  it("escapes strings as JSON does, and keeps non-ASCII text as it is", () => {
    expect(serialiseSidecar({ what: 'a "quote" — \\ and\nline' })).toBe('{\n  "what": "a \\"quote\\" — \\\\ and\\nline"\n}\n');
  });

  it("is idempotent", () => {
    expect(canonicalSidecar(CANONICAL)).toBe(CANONICAL);
  });

  it("inSidecarLayout accepts only the canonical text, and leaves invalid JSON to the other rules", () => {
    expect(inSidecarLayout(CANONICAL)).toBe(true);
    expect(inSidecarLayout(CANONICAL.trimEnd())).toBe(false);
    expect(inSidecarLayout(JSON.stringify(JSON.parse(CANONICAL), null, 2))).toBe(false);
    expect(inSidecarLayout("{ not json")).toBe(true);
    expect(inSidecarLayout("null")).toBe(true);
    expect(inSidecarLayout("[]")).toBe(true);
    expect(canonicalSidecar("{ not json")).toBeNull();
  });
});
