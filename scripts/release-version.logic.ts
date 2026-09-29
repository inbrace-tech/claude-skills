// The pure rules behind release-version.ts: where the changelog generator's GitHub token comes from.

/** An environment as `process.env` holds it. */
type Env = Readonly<Record<string, string | undefined>>;

/**
 * GITHUB_TOKEN when exported and not empty, else what `gh auth token` printed (`null` when it failed
 * or printed nothing), else the error to report. `readGh` runs only when needed, so an exported token
 * never starts gh.
 */
export function resolveToken(env: Env, readGh: () => string | null): { token: string } | { error: string } {
  const exported = env["GITHUB_TOKEN"];
  if (exported !== undefined && exported !== "") return { token: exported };
  const fromGh = readGh()?.trim();
  if (fromGh !== undefined && fromGh !== "") return { token: fromGh };
  return { error: "the changelog needs a GitHub token: export GITHUB_TOKEN, or sign in with `gh auth login`" };
}
