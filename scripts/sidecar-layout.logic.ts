// The canonical layout of a sidecar (`*.norms.json`, `*.traps.json`), shared by check-norms, which
// fails a sidecar not in it, and format-sidecars, which writes it. The file's structure — the top-level
// object, its arrays and each entry — is indented by two spaces; every value inside an entry, such as
// `refs`, sits on one line: `{ "k": v }` and `[a, b]`. That is how the sidecars have been written by hand.

/** The depth from which every value is written on one line: inside an entry of a top-level array. */
const INLINE_DEPTH = 3;

/** One value on one line: objects as `{ "k": v }`, arrays as `[a, b]`, empty ones as `{}` and `[]`. */
function inline(value: unknown): string {
  if (Array.isArray(value)) return value.length === 0 ? "[]" : `[${value.map(inline).join(", ")}]`;
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value);
    return entries.length === 0 ? "{}" : `{ ${entries.map(([key, item]) => `${JSON.stringify(key)}: ${inline(item)}`).join(", ")} }`;
  }
  return JSON.stringify(value) ?? "null";
}

/** One value at `depth`, expanded over lines while shallower than INLINE_DEPTH. */
function layout(value: unknown, depth: number): string {
  if (depth >= INLINE_DEPTH) return inline(value);
  const pad = "  ".repeat(depth + 1);
  const close = "  ".repeat(depth);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((item) => `${pad}${layout(item, depth + 1)}`).join(",\n")}\n${close}]`;
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{\n${entries.map(([key, item]) => `${pad}${JSON.stringify(key)}: ${layout(item, depth + 1)}`).join(",\n")}\n${close}}`;
  }
  return inline(value);
}

/** A parsed sidecar in the canonical layout, ending with a newline. */
export function serialiseSidecar(value: unknown): string {
  return `${layout(value, 0)}\n`;
}

/** The canonical text of a sidecar's text, or null when it is not valid JSON (check-norms reports that apart). */
export function canonicalSidecar(text: string): string | null {
  try {
    return serialiseSidecar(JSON.parse(text));
  } catch {
    return null;
  }
}

/**
 * Whether a sidecar's text is in the canonical layout. Only a JSON object is judged: invalid JSON and
 * any other value are the other rules' to report, so one mistake is never reported twice.
 */
export function inSidecarLayout(text: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return true;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return true;
  return serialiseSidecar(parsed) === text;
}
