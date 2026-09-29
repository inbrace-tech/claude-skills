# Contributing

Thanks for your interest in improving these skills. This is a small, curated collection, so every skill has to earn its place.

## Ground rules

- **One plugin per theme, under `plugins/<plugin>/`, named `inbrace-<theme>`.** A plugin holds one or more skills in `skills/<skill>/SKILL.md` and is listed in `.claude-plugin/marketplace.json`, whose marketplace is `inbrace`. The shared prefix groups every Inbrace skill under `/inbrace` in the slash-command list.
- **Choose who starts each skill, and say so in the README's Skills table.** Set `disable-model-invocation: true` for a skill with side effects or one a user runs once in a while, such as an audit: only the user can start it, and nothing about it sits in context until then. Leave it unset for a skill Claude should reach for on its own when a task matches, and write its `description` so Claude can tell when that is.
- **Ground every claim about model behavior in a source.** Cite the official Anthropic documentation page in the skill's `Sources` section. A tip that only one person has seen work does not belong here.
- **The repository's scripts are TypeScript, and it accepts no JavaScript.** Node 24 runs them as they are, with no build step; `pnpm run typecheck` checks them and `pnpm run lint` runs oxlint over them. The `tsconfig.json` is strict — `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters` and `noImplicitOverride` — and a `!` or an `as` that only silences the compiler is not accepted: guard or narrow the value instead.
- **No executable code without discussion first.** Open an issue before adding a script or a hook to a plugin.
- **Nothing private.** No internal repository names, URLs, credentials or customer data, including in examples.

## Writing a skill

Skills here follow one format, so every rule can be found, cited and traced to the reason it exists.

- **One norm per list item, led by its id:** `- [N07] Measure the inventory before reading any of it, …`. A norm is one direct, imperative sentence stating what to do, and it may add the reason in one clause.
- **Ids are stable.** Number new norms after the highest id in the skill. Never renumber or reuse an id: issues, pull requests and other skills cite them, as in `[N04]`.
- **The history goes in `SKILL.norms.json`, beside the `SKILL.md`.** Give each norm an entry with its `id`, `where` (the section it sits in), `refs` (sources such as `{"docs": ["<url>"], "inbrace-tech/claude-skills": [<pr>]}`) and `what` (why the norm exists, what went wrong without it, what was measured). Claude never loads this file on its own, so the history costs no context. `pnpm run check-norms` holds `where` to a real heading of the surface, and every `refs` key to `owner/repo` with issue or pull request numbers, or `docs` with https URLs. Every sidecar uses one layout: two-space indentation for the file's structure, and every value inside an entry — `refs` above all — on one line, as `{ "docs": ["https://…"], "inbrace-tech/claude-skills": [12, 21] }`. `pnpm run format:sidecars` writes that layout, and `check-norms` fails a sidecar that is not in it.
- **Cite another surface's norm with its name**, as in `[transition-audit-plan#N05]`, from prose, a sidecar or another Markdown file; the check resolves it against that surface's sidecar. A bare id outside its own surface and sidecar fails unless it sits in backticks.
- **The surface states the final behavior.** How a rule changed, and why an alternative was rejected, belongs in the sidecar and the pull request, not in `SKILL.md`.
- **Wrap content Claude executes verbatim** — a command, a template, a table it checks against — in a structural tag such as `<measure>` or `<patterns>`, so it reads as material to use rather than prose to paraphrase.
- **Keep the context small.** A skill that reads a user's files states how it bounds what it reads, for example by measuring first and working in batches.
- **Declare a size ceiling where the skill must stay small**, as `max-bytes` under the `metadata` frontmatter map, which Claude Code leaves to your own tooling ([Frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference)). `check-norms` fails a skill larger than the ceiling it declares, an agent over 8,192 bytes and a knowledge file over 57,000 bytes. The ceilings are in bytes because files like these run about 2.85 bytes per token, and after compaction a skill keeps only its first 5,000 tokens ([Skill content lifecycle](https://code.claude.com/docs/en/skills#skill-content-lifecycle)).
- **Knowledge a skill applies per model transition lives in a knowledge file**, `skills/<skill>/transitions/<slug>.md`, where the slug reads `<source>-to-<target>`, such as `sonnet-5-to-5-5`.
  - Its frontmatter sets `transition` (equal to the slug), `title`, `source`, `target`, `claude-code-floor` and `verified`, a `YYYY-MM-DD` date.
  - Each trap sits in its `<traps>` block under a `### Pnn — <title>` heading, with the list items `kind` (`change`, `re-test`, `optional`, `hand-off` or `setting`), `area`, `signal`, `applies when`, `change`, `confidence` (`high`, `medium` or `low`) and `sweep` (`yes` or `no`).
  - A trap has one or more `- source:` https URLs. Under each goes either a `passage:`, quoted verbatim from the page, with the `verified:` date, or a `basis:` stating the inference or the system-card page it rests on.
  - Where each trap was learned goes in `<slug>.traps.json` beside the file, which nothing loads at runtime: `{"transition": "<path of the .md>", "traps": [{"id": "P01", "learned": "…", "refs": {…}}]}`, with `refs` shaped as in `SKILL.norms.json`.
  - `check-norms` holds the file and its sidecar to each other, and trap ids follow the norm-id rule: never renumbered or reused.
- **Agents follow the same format.** A plugin agent at `agents/<name>.md` states its behavior as `- [Nxx]` norms under `##` sections, with their history in `<name>.norms.json` beside it, whose `surface` is the agent's path. Its ids are its own: an agent never cites another surface's norms, since the skill or session that starts it is not in its context.
- **An agent's return contract lives in the agent**, wrapped in its own tag such as `<return_contract>`, with the exact format of what it returns. A skill that starts the agent points to that contract instead of restating it; where the skill owns a format the agent returns, such as a finding line, the skill passes it in the agent's brief and the contract says to use the format the brief gives.

## Checking your change

CI runs these on every pull request. Run them locally first:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run check-norms
pnpm run check-version
pnpm exec changeset status --since=origin/main
pnpm run release:check-changesets
pnpm audit --audit-level=high
pnpm run audit:lockfile
pnpm run audit:lockfile:all
claude plugin validate --strict .
claude plugin validate --strict plugins/<plugin>
claude plugin validate --strict plugins/<plugin>/skills
claude plugin validate --strict plugins/<plugin>/agents   # when the plugin ships agents
```

The scripts' tests are Vitest specs, `scripts/**/*.spec.ts`; `pnpm run test:watch` reruns them as you edit. Each script is four files: `X.ts`, the entrypoint that reads git and files and sets the exit code; `X.logic.ts`, its pure rules; `X.logic.spec.ts`, unit tests of those rules with strings only; and `X.spec.ts`, which runs `X.ts` end to end in a throwaway fixture, with no network. Rules two entrypoints share live in one logic module named for what it holds, such as `release-preconditions.logic.ts`, with its own `.logic.spec.ts`.

`pnpm run audit:lockfile` asks the npm registry whether every version your change adds to `pnpm-lock.yaml` is still published and past the `minimumReleaseAge` floor in `pnpm-workspace.yaml`, comparing against the merge base with `origin/main`; `pnpm run audit:lockfile:all` asks the whole lockfile whether any version has been taken down. Both need the network and fail, rather than pass, when the registry cannot be reached. The pull-request workflow runs the first, and a daily workflow runs the second.

`check-norms` covers every `plugins/*/skills/*/SKILL.md` and every `plugins/*/agents/*.md`, each with its sidecar and its size ceiling, and every `plugins/*/skills/*/transitions/*.md` knowledge file with its `.traps.json`.

Then install your branch locally and run the skill on a real project:

```text
/plugin marketplace add ./path/to/your/clone
/plugin install <plugin>@inbrace
```

A skill with `disable-model-invocation: true` starts only from its typed slash command, so test it end to end in an interactive session (`claude --plugin-dir <plugin>`, then type the command), not with `claude -p` and a request in plain words.

## Versions

Claude Code gives an installed plugin a new copy only when its version changes, so a change pushed without a bump leaves existing users on their cached copy ([Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugins/host-marketplace)). Versions move with [Changesets](https://github.com/changesets/changesets): each plugin is a private workspace package whose `package.json` holds the version, and a release moves it once for everything merged since the last one.

Every pull request that changes a file under `plugins/<plugin>/` adds a changeset: run `pnpm changeset`, pick the plugin and its bump, and write one line saying what changed for its users. It lands in `.changeset/` and is committed with the change. CI fails the pull request when:

- a plugin changed without a changeset (`changeset status` against the base branch); the files a release writes — the plugin's `package.json`, `CHANGELOG.md` and `.claude-plugin/plugin.json` — do not count, so the version pull request passes;
- a changeset names no plugin, or its summary is not one line of at most 200 characters (`pnpm run release:check-changesets`). The summary becomes a line of the public changelog and of the GitHub Release; the reasoning belongs in the pull request, which the changelog links to;
- a plugin's `package.json` and `.claude-plugin/plugin.json` disagree on the version (`pnpm run check-version`). Never edit a version or a plugin's `CHANGELOG.md` by hand.

### Which bump

The version is per plugin: the marketplace holds several plugins, each versioned on its own, and has no version of its own that drives updates. Pick the bump by what the plugin's users get:

- `patch` — a fix or refinement of an existing skill or agent that adds no capability and breaks nothing: wording, a corrected rule or pattern row, a verifier fix.
- `minor` — a new skill, agent, argument or pattern family, or a noticeably wider audit.
- `major` — removing or renaming a skill or agent, changing its invocation or arguments incompatibly, or raising the Claude Code version the plugin needs.

While a plugin is `0.x`, a breaking change is a `minor`: Changesets turns a `major` on `0.x` into `1.0.0`, and a plugin reaches `1.0.0` only by the maintainer's decision. From `1.0.0` on, a breaking change is a `major`.

### Cutting a release

The maintainer cuts releases:

1. `pnpm run release:version` (`scripts/release-version.ts`) on an up-to-date checkout of `main`. It fetches `origin` and refuses, listing every reason, unless `HEAD` is `origin/main`, the tree is clean and at least one changeset is pending. Changesets then consumes the pending changesets, moves each plugin's version and writes `plugins/<plugin>/CHANGELOG.md`, and the version is copied into `plugin.json`. It needs a GitHub token for the changelog's links, taken from `GITHUB_TOKEN` or else `gh auth token`, and passed only to Changesets' environment.
2. Branch from there (`git switch -c release/<date>`), commit the diff, open it as the version pull request and merge it.
3. On the merged `main`, `pnpm run release` (`scripts/release-tag.ts`) fetches `origin` and refuses unless `HEAD` is `origin/main`, the tree is clean, no changeset is pending and `check-version` passes. It creates a signed `<plugin>@<version>` tag for each plugin that has none, then works from each plugin's `package.json`: a tag already on `origin` is fetched and must be annotated and signed, and a tag only in this clone — just created, or left by a run whose push failed — is checked with `pnpm run release:verify-tag <tag> --verify-signature` and pushed. It reports nothing to do only when every expected tag is on `origin`. The Release tag signature workflow then checks each pushed tag carries a signature; when a check fails, delete the tag locally and on `origin` and cut it again.
4. Publish a GitHub Release for each tag, its notes the version's section of the plugin's `CHANGELOG.md`. Write them to a file, never a pipe, so a missing section stops the release instead of publishing empty notes:

   ```bash
   pnpm --silent run release:notes 0.6.0 > release-notes.md
   gh release create inbrace-config@0.6.0 --verify-tag --title "inbrace-config 0.6.0" --notes-file release-notes.md
   ```

   `release-notes.md` is gitignored. The version is always passed, never read from `package.json`, so running it before the version pull request merges fails instead of printing the previous release.

## Opening a pull request

1. Fork and branch from `main`.
2. Make your change and run the checks above.
3. Use a conventional-commit title with a lowercase subject, such as `feat: add a review skill`.
4. Describe what changed and how you tested it.

Pull requests are reviewed and merged by the maintainers. Thank you for contributing.
