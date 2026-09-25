// The pure half of check-norms: given one skill's SKILL.md text and its
// SKILL.norms.json text, report every way the two disagree. No file system
// access here, so every rule can be tested with plain strings; discovery,
// printing and the exit code live in check-norms.mjs.

/** A norm definition: a list item led by its id, `- [N01] ...`. */
export const DEFINITION = /^- \[(N\d{2})\] /;

/** Any `[Nxx]` in the text: a definition or a cross-reference. */
export const REFERENCE = /\[(N\d{2})\]/g;

const ID = /^N\d{2}$/;

/**
 * The norm ids a SKILL.md defines, in order, duplicates included.
 * @param {string} surface
 * @returns {string[]}
 */
export function definedNorms(surface) {
  const ids = [];
  for (const line of surface.split("\n")) {
    const match = line.match(DEFINITION);
    if (match) ids.push(match[1]);
  }
  return ids;
}

/**
 * Checks one skill against its sidecar.
 * @param {object} skill
 * @param {string} skill.surfacePath  SKILL.md path relative to the repository root, as the sidecar's `surface` must spell it
 * @param {string} skill.sidecarPath  SKILL.norms.json path relative to the repository root, used in messages
 * @param {string} skill.surface      SKILL.md contents
 * @param {string | null} skill.sidecarText  SKILL.norms.json contents, or null when the file does not exist
 * @returns {{ inFormat: boolean, errors: string[] }} inFormat is false for a skill with no norm and no sidecar, which is skipped
 */
export function checkSkill({ surfacePath, sidecarPath, surface, sidecarText }) {
  const defined = definedNorms(surface);
  if (defined.length === 0 && sidecarText === null) return { inFormat: false, errors: [] };

  const errors = [];
  if (sidecarText === null) {
    errors.push(`${surfacePath}: defines norms but has no SKILL.norms.json`);
    return { inFormat: true, errors };
  }

  let sidecar;
  try {
    sidecar = JSON.parse(sidecarText);
  } catch (error) {
    errors.push(`${sidecarPath}: invalid JSON (${error.message})`);
    return { inFormat: true, errors };
  }
  if (typeof sidecar !== "object" || sidecar === null || Array.isArray(sidecar)) {
    errors.push(`${sidecarPath}: must be a JSON object`);
    return { inFormat: true, errors };
  }

  if (sidecar.surface !== surfacePath) {
    errors.push(`${sidecarPath}: surface is "${sidecar.surface}", expected "${surfacePath}"`);
  }

  const seen = new Set();
  for (const id of defined) {
    if (seen.has(id)) errors.push(`${surfacePath}: norm ${id} is defined more than once`);
    seen.add(id);
  }

  if (!Array.isArray(sidecar.norms)) errors.push(`${sidecarPath}: "norms" must be an array`);
  const entries = Array.isArray(sidecar.norms) ? sidecar.norms : [];
  const recorded = new Set();
  for (const entry of entries) {
    const id = entry?.id;
    if (typeof id !== "string" || !ID.test(id)) {
      errors.push(`${sidecarPath}: entry with invalid id ${JSON.stringify(id)}`);
      continue;
    }
    if (recorded.has(id)) errors.push(`${sidecarPath}: ${id} is recorded more than once`);
    recorded.add(id);
    if (typeof entry.where !== "string" || entry.where.trim() === "") errors.push(`${sidecarPath}: ${id} has no "where"`);
    if (typeof entry.what !== "string" || entry.what.trim() === "") errors.push(`${sidecarPath}: ${id} has no "what"`);
    if (typeof entry.refs !== "object" || entry.refs === null || Array.isArray(entry.refs)) errors.push(`${sidecarPath}: ${id} "refs" must be an object`);
  }

  for (const id of seen) if (!recorded.has(id)) errors.push(`${surfacePath}: ${id} has no entry in SKILL.norms.json`);
  for (const id of recorded) if (!seen.has(id)) errors.push(`${sidecarPath}: ${id} matches no norm in SKILL.md`);

  for (const match of surface.matchAll(REFERENCE)) {
    if (!seen.has(match[1])) errors.push(`${surfacePath}: cross-reference [${match[1]}] names no norm defined here`);
  }

  return { inFormat: true, errors };
}
