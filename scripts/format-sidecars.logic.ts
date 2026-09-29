// The pure rules behind format-sidecars.ts: which files are sidecars, and what each becomes.

import { canonicalSidecar } from "./sidecar-layout.logic.ts";

/** A sidecar: a norm history (`*.norms.json`) or a knowledge file's trap history (`*.traps.json`). */
export const isSidecarPath = (path: string): boolean => path.endsWith(".norms.json") || path.endsWith(".traps.json");

/** One file, path relative to the repository root with `/`. */
export interface SidecarFile {
  path: string;
  text: string;
}

/** What format-sidecars does: the files to rewrite with their new text, and the ones it cannot parse. */
export interface SidecarPlan {
  rewrites: SidecarFile[];
  invalid: string[];
}

/** The sidecars whose text is not canonical, with their canonical text; invalid JSON is left alone and listed. */
export function planRewrites(files: readonly SidecarFile[]): SidecarPlan {
  const rewrites: SidecarFile[] = [];
  const invalid: string[] = [];
  for (const { path, text } of [...files].sort((left, right) => left.path.localeCompare(right.path))) {
    const canonical = canonicalSidecar(text);
    if (canonical === null) invalid.push(path);
    else if (canonical !== text) rewrites.push({ path, text: canonical });
  }
  return { rewrites, invalid };
}
