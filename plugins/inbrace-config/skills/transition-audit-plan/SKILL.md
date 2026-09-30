---
name: transition-audit-plan
description: Stage 1 of the model-transition audit. Use only when that audit's run file names this stage next.
user-invocable: false
allowed-tools: Skill(inbrace-config:transition-audit) Read Grep Glob
metadata:
  max-bytes: 28000
---

# Plan the audit: list, measure, check the docs, confirm

**This stage builds the plan and asks before anything costly is read.** It lists what shapes model behaviour under the audit root, measures it, checks that the docs can be reached, and shows the options with their cost. Everything about the transition — the models, their ids, the docs — comes from the knowledge file the run file names.

## Before anything

- [N01] Run only when the run file in the run's folder under `.model-audits/` names this stage as next, and otherwise stop at once, saying this skill runs only inside the model-transition audit.
- [N02] Where the orchestrator's norms are no longer in context, as after a compaction, invoke `transition-audit` with `--resume` and stop.
- [N03] Read the knowledge file only down to its `<traps>` line, which holds all this stage needs: the transition, the docs, `<source_id_match>` and `<api_signals>`; in a bootstrap, find the target's prompting guide, migration guide and what's-new page in `https://platform.claude.com/llms.txt` and use them as the docs, for the user to confirm at the gate.
- [N04] Take the audit root from the arguments, or the current project root when none is given, and state it in the plan without asking.

## List

- [N05] List every file that shapes model behaviour under the root, area by area as `<map>` says, marking each area as found or absent; find Claude API code as `<api_signals>` says, and list with it any code file whose strings that code sends as `system` or as messages. When the root is a git worktree, find the main checkout with `git rev-parse --path-format=absolute --git-common-dir`, list from it the gitignored instruction files the worktree lacks — `CLAUDE.local.md`, `.claude/settings.local.json`, a generated rules, agents or skills tree — and name them as read from there. List every nested worktree — `.claude/worktrees/*/` and any other path `git worktree list` shows under the root — as not audited, since it copies files the audit already reads.

<map>

| Area | Id | What to list |
|---|---|---|
| Memory | `memory` | `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md` and every file they import through `@path` |
| Rules | `rules` | the Markdown under `.claude/rules/` |
| Agents | `agents` | the Markdown under `.claude/agents/` |
| Skills | `skills` | the Markdown under `.claude/skills/` |
| Commands | `commands` | the Markdown under `.claude/commands/`, `.claude/templates/` and `.claude/triggers/`, and any Markdown a listed file tells the model to read or copy, such as a brief or dispatch template |
| Settings | `settings` | `.claude/settings.json` and `.claude/settings.local.json` |
| Hooks and scripts | `hooks` | the scripts the settings' `hooks` run, and gate or check scripts that pick instruction text or check a model id, per [N12] |
| CI and automation | `ci` | workflow files that run `claude`, pass `--model` or `--effort`, set model variables, or run evals |
| Claude API code | `api-code` | code that calls the Claude API, per `<api_signals>` |
| Model-dependent code and docs | `model-dependent` | code naming the source id as a string literal, such as a price table or a model selector; docs that name the source guide or id, such as a guide index or per-model notes; code that parses model output or a session transcript |
| Setup and dependencies | `setup` | the README and setup scripts that state the Claude Code version the project needs, and manifests pinning the Anthropic SDK or Claude Code |
| Plugin and eval config | `plugin-config` | a plugin manifest, marketplace or eval suite of the project that names a model |

</map>

- [N06] Leave out what is not instruction text — data files beside a skill, third-party reference material and licences, scripts and hooks outside `<map>` — and name each group with its size under "Not audited (not instructions for the model)", never "excluded"; never put there a file that calls the Claude API, which only the scope the user picks leaves out; and state that the files audited and not audited add up to the files `git ls-files` tracks under the root, with that count.
- [N07] Read the user's `~/.claude/settings.json` as context for the traps whose `context` is `user-settings`, never as a file to audit or edit, since it sits outside the root.
- [N08] Name `.claude` explicitly in every search, or pass `--hidden` to `rg`, because `rg` skips dot-directories when it walks from `.` and returns nothing without an error.
- [N09] Mark as read-only every listed file that is gitignored — except the root's own `.claude/settings.local.json`, personal by design — installed by a plugin, read from the main checkout, or reached through a symlink leading outside the root, since an edit there is overwritten or lands in another project; list a file reached through a symlink inside the root once, under its real path.
- [N10] Search the listed files and the project's decision records — `docs/adrs/`, `docs/**/decisions/`, `docs/audits/` and similar — for an existing evaluation of the target model, a section, record or rule saying what the project kept, changed or declined for it; read the project's auto memory too, as context — `~/.claude/projects/<project>/memory/` or the directory `autoMemoryDirectory` names, under the main checkout's key in a worktree — and never state that no record exists without having searched these places.
- [N11] Check whether the root is a git repository and its `git status`, and state it in the plan, since an audit's edits are easiest to review and revert as one change on a clean branch.
- [N12] Before measuring, search the scripts the settings' `hooks` run and the code under the root for the source id used as a prefix or pattern, as `<source_id_match>` lists, and put the matching files in the hooks area, since a hook, a gate or check script or a rule condition can pick instruction text by matching the model id, and a `PreToolUse` or `PostToolUse` hook can add text beside a tool call.
- [N27] Before measuring, run the pattern of each item of the knowledge file's `<unquoted>` over every listed file, `.claude` named explicitly, only as `grep -n -i -E -- '<pattern>' <files> | cut -d: -f1,2`, so no matched line reaches the context, and write each match to `unquoted.md` in the run's folder as `<file>:<line> | <id> | <label>`, or the line `none`; state in the plan how many lines, per id, the run will cite by number only and never read, and that a refusal costs at most one batch, per [transition-audit#N21].
- [N28] For each file `unquoted.md` lists, take it as always loaded when it is `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md` or a file they import through `@path`, or a file under `.claude/rules/` whose count from `grep -c -E -- '^paths:' <file>` is 0, and append ` | always loaded` to its lines in `unquoted.md`; state at the gate that those lines sit in memory every session and every subagent of the project loads, so agents in agents mode are likely refused on their first request, before reading any file, and that the run then reads those batches in this session, per [transition-audit#N21].
- [N13] Before the gate, read the `PreToolUse` entries whose matcher covers `Agent` in the project's settings, with the scripts they run, and note whether any may require `model` in an Agent call, so the gate states it per [transition-audit#N18].

## Measure

- [N14] Measure the listed files and the groups not audited before reading any of them, estimate tokens as bytes divided by three, since files like these measured about 2.85 bytes per token, and count the fixed load apart, in two parts shown summed, as in "fixed: ~75–85k for the audit + ~38k from the project memory": the fixed row of `<estimate>`, and the project memory the session loaded, measured the same way:

<measure>

```bash
wc -c <every file from the inventory>
wc -c <every file in each group not audited> | tail -n 1
wc -c CLAUDE.md CLAUDE.local.md AGENTS.md <every file they import through @path>
```

</measure>

- [N15] Plan batches of at most 30,000 estimated tokens within one area, keeping together files that belong together — a `CLAUDE.md` with its imports, one agent with the skills it names — splitting a larger group into consecutive batches, and reading a single larger file in line ranges.
- [N16] Count the batches per area, never over the whole inventory: split each area into contiguous parts of about 150,000 estimated tokens, one auditor each in agents mode, and count each part's batches as its tokens divided by 30,000, rounded up.
- [N17] Probe each page of the docs with `curl -fsI <url>.md` before the gate, and state whether they can be reached, the domains to allow, and their reading cost — the pages and sections the docs table names, measured the same way; where `curl` cannot reach them but WebFetch can, say that discovery will read them through WebFetch and that nothing can be re-verified; where neither can, say that the run can only use the knowledge file's recorded passages, each marked not re-verified since its date, and in a bootstrap that the run stops here.
- [N18] Set an expansion budget, 25% of the inventory's estimated tokens, for the files discovery finds worth reading outside the inventory, and include it in every reading estimate.

- [N25] Estimate each option as the sum of the rows of `<estimate>`, low and high, for this session and for the agents apart, never as a multiple of the inventory alone, since the docs, the findings and the verifier's own reading are most of what a run spends; measure `S` and `K` as the bytes of the audit's skills and of the knowledge file divided by three:

<estimate>

| Row | Low | High | What it counts |
|---|---|---|---|
| Fixed load | 40k + S + K | 50k + S + K | the harness and the round trips of the questions, the audit's skills as they load (`S`), the knowledge file (`K`); the project memory is added apart |
| Docs | D | 1.5 × D | the pages and sections `<docs>` names, as [N17] measured them (`D`) |
| Inventory | 2 × I | 3 × I | the files the option reads plus the expansion budget (`I`): discover reads them, the known-traps stage reads its areas again |
| Batches | 2k × B | 3k × B | per batch (`B`): reasoning, progress, the lines appended |
| Findings | 0.5k × F | 0.8k × F | each raw finding written, relabelled, verified and reported; `F` is 8 plus 1 per 1,000 tokens of `I` for the low end and 4 for the high end |
| Verifier agents | 10k + 0.3k × F + 0.8 × D | V × (12k + 1.5 × D) + 0.3k × F + I | each verifier's base context and the brief, its lines, the files they cite and the cached pages it opens to check passages; `V` is the high `F` divided by 25, rounded up |
| Auditor agents | A × 15k + I | A × 15k + 2 × I | agents mode only, with `A` auditors, each loading the brief and the digest and reading its part; the session's inventory row then counts only the known-traps stage, `I` to 1.5 × `I` |

</estimate>

## Show the plan and ask

- [N19] Show the plan in one short message before the gate: the checklist, the root, the git state, the docs line of [N17], and the two tables of `<plan_tables>`, translated. The first has one row per area found, with its batch count, and a last row for what is not audited, with its total and reason; its Audited column reads yes, "full scope only" for an area the reduced scope leaves out, or no. The second has one row per option the gate offers, marks the recommended one with ★, writes each batch count as "~N or more", since grouping packs fewer tokens into a batch than the estimate assumes, and gives each option's time per [N22]:

<plan_tables>

```markdown
| Area | Files | Tokens* | Batches | Audited |
|---|---|---|---|---|
| <area> | <n> | ~<k> | ~<n> | yes |
| Not audited (not instructions for the model) | <n> | ~<k> | — | no — <reason> |

| Option | Batches | Cost* | Estimated time | Left out |
|---|---|---|---|---|
| ★ <scope>, <run mode> | ~<n> or more | ~<k>–<k> | ~<minutes> | <what it does not read, or nothing> |

★ recommended: <reason>
\* tokens of context, estimate per `<estimate>`, session and agents; fixed: ~<k> for the audit + ~<k> from the project memory. The cache re-reads of every round trip make the tokens actually sent 15–19× these figures, about USD 14–17 per million tokens of context on Opus 5.5 in measured runs; `/usage` (also `/cost`) shows the real volume and cost.
```

</plan_tables>

- [N20] Always ask before reading the first batch, even for one batch, in one `AskUserQuestion` call with two questions. The first is the scope, offering only what applies: full scope; reduced scope — every area but skills, commands and Claude API code — only when it saves at least one batch, warning that skills are where most text tuned for the source model lives; the quick sweep of [N23]; and cancel, which goes to the close. The second is the run mode — in this session, or in parallel `batch-auditor` agents, one per area part, in waves under the concurrent limit — asked only when the plan has more than one batch and the agent is listed, and saying that the quick sweep runs in this session. Each option names what it reads, its marginal cost and the total to the end, per [N25], for this session and for the agents, with the total in dollars at the measured USD 14–17 per million tokens of context on Opus 5.5; the agents option states the number of auditors and waves, that they and the verifier run on Opus 5.5 at `medium` effort, and what each loads on start — the brief, and the project memory only on Claude Code older than v2.1.271; where [N28] marked lines, it also says the agents are likely refused before their first file and their batches are then read in this session. Where the arguments gave `--scope` or `--mode`, answer those questions with them, still show the plan, mark the chosen row "pre-approved by argument", and ask only what they leave open; where an argument names an option this gate would not offer, stop with the reason and never substitute another.
- [N21] Recommend one option per question, with its reason in the option's description: full scope up to ten batches, and above that the reduced scope when it saves a batch, unless the skills area holds a skill written for the source model — its name or title names it, or [N12] finds it delivered by a prefix match — or holds more than half of the batches; agents mode when the recommended scope still has more than ten batches, this session otherwise; never the quick sweep at ten batches or fewer.
- [N22] Estimate time from measured runs: in this session one to two minutes per batch; in agents, per wave, the slowest auditor's batch count times one to two minutes; plus about two to three minutes for the verifier and one for the docs.
- [N23] Offer the quick sweep as a scope, estimated per [N25] with its fixed load, its findings and its verifier, and the lines around the matches as its inventory, stating its limit: it runs in this session with no discovery, checks the known traps against today's docs, searches the root for the signals of the traps whose `sweep` is `yes` and reads only the lines around each match, so it misses what needs the surrounding context and anything no trap names.
- [N26] Before the first gate, record the root's `git status --porcelain --untracked-files=all` in `status-before.txt` in the run's folder — or, outside a git repository, the sorted list of files under the root — so the close can tell which files the run created or changed.
- [N24] Record the plan and the gate's answers, with every option's estimate, in the report file and the run file, and set the next stage.

## Sources

- The documentation index a bootstrap reads: https://platform.claude.com/llms.txt
- Raw Markdown and WebFetch: https://code.claude.com/docs/en/tools-reference#webfetch-tool-behavior
- Memory files and imports: https://code.claude.com/docs/en/memory
- Subagents, what loads at startup: https://code.claude.com/docs/en/sub-agents#what-loads-at-startup
- Hooks, `PreToolUse` and `PostToolUse`: https://code.claude.com/docs/en/hooks#pretooluse and https://code.claude.com/docs/en/hooks#posttooluse
- The concurrent subagent limit: https://code.claude.com/docs/en/sub-agents#concurrent-subagent-limit

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
