# inbrace-config

The plugin was named `claude-config` before 0.4.0.

## 0.7.0

### Minor Changes

- The audit reaches no network: it reads the change digest shipped with each transition, drops the drift stage and the docs-only mode, and the contribution invite only gives a link. ([#114](https://github.com/inbrace-tech/claude-skills/pull/114) by [@ropdias](https://github.com/ropdias))

### Patch Changes

- The Sonnet eval fixture's sample clients no longer read `ANTHROPIC_API_KEY` themselves and leave it to the SDK; the plugin directory's validation held that read for review. ([#103](https://github.com/inbrace-tech/claude-skills/pull/103) by [@ropdias](https://github.com/ropdias))

- Two known traps follow the docs as they read today: Opus P04's passage is re-recorded, and Sonnet P25 now says Opus 5.5 reads Sonnet 5.5 thinking blocks on the Claude API and Google Cloud. ([#112](https://github.com/inbrace-tech/claude-skills/pull/112) by [@ropdias](https://github.com/ropdias))

- Every passage the knowledge files quote was re-checked against Anthropic's docs on 2026-10-06 and still holds, so each `verified` date now reads 2026-10-06. ([#123](https://github.com/inbrace-tech/claude-skills/pull/123) by [@ropdias](https://github.com/ropdias))

- Each transition now ships a change digest beside its known traps: what changed between the two models, each item with its page and a short quoted passage. No skill reads it yet. ([#111](https://github.com/inbrace-tech/claude-skills/pull/111) by [@ropdias](https://github.com/ropdias))

- The README and descriptions say what the audit now does: it reads the docs as recorded and dated in the plugin, and fetches and sends nothing. The eval suite fails a run that reaches the network. ([#115](https://github.com/inbrace-tech/claude-skills/pull/115) by [@ropdias](https://github.com/ropdias))

## 0.6.3

### Patch Changes

- The plugin now ships a listing icon, which Anthropic's plugin directory reads when the plugin is first submitted. ([#97](https://github.com/inbrace-tech/claude-skills/pull/97) by [@ropdias](https://github.com/ropdias))

- The Sonnet eval fixture's sample help-desk client no longer reads a token from the environment, which the plugin directory's validation held for review. ([#98](https://github.com/inbrace-tech/claude-skills/pull/98) by [@ropdias](https://github.com/ropdias))

- The audits now flag a line in a rule, memory or command file that restates an agent's or skill's effort, such as a routing-table row, for re-test with the file it mirrors. ([#95](https://github.com/inbrace-tech/claude-skills/pull/95) by [@ropdias](https://github.com/ropdias))

- The plugin folder now has its own README: what the audit does, its commands, what it fetches and sends, troubleshooting, support and the privacy policy. ([#99](https://github.com/inbrace-tech/claude-skills/pull/99) by [@ropdias](https://github.com/ropdias))

## 0.6.2

### Patch Changes

- Transition audit: the plan warns when a reasoning-exposing line sits in always-loaded memory, and a refused agent's batches are then read in the session. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: a value the project keeps on purpose for a reason the docs bear out, such as a Sonnet 5 fallback variable, is already decided, not a change. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: re-anchored the Opus P07 source and re-recorded the Sonnet P04 passage from today's docs. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Eval suite: the key labels the reasoning-in-the-reply rows by trap id and never quotes them, and a Sonnet fixture docstring names the loop whose conversation it escalates. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: new known traps for the source model id in Sonnet API code (P44), and for Opus API code a max_tokens sized with thinking off (P29) and requests with no effort (P30). ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: Opus P20 also reads launch commands and CI workflows, and P23 fires for an agent already on Opus 5.5 that preloads an Opus 5 skill. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: Opus P07 recognises rules copied from the Opus 5 guide without naming a model, and P11 fires on a multi-app agent that writes records even with a specific brief. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: cites reasoning-exposing lines by number, never reading them, and recovers from a model refusal instead of stopping. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: two traps on one construct each keep their own line, and Sonnet's P03 effort re-test reads the memory, rules and hooks areas where P02 fires. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: a price in a skill's text shows its amount, not the invocation's argument, and `check-norms` rejects a dollar sign before a digit in a skill. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

- Transition audit: the verifier looks for a file with Glob before it calls one missing, and keeps a reference that could sit outside the project. ([#88](https://github.com/inbrace-tech/claude-skills/pull/88) by [@ropdias](https://github.com/ropdias))

## 0.6.1

### Patch Changes

- Without `AskUserQuestion`, the audit closes as a headless run naming `--scope` and `--mode` instead of listing its questions. ([#82](https://github.com/inbrace-tech/claude-skills/pull/82) by [@ropdias](https://github.com/ropdias))

- Known traps now cover the computer-use agent loop, unattended API agent loops, source-model rationales and capability claims, and model notes in memory files. ([#81](https://github.com/inbrace-tech/claude-skills/pull/81) by [@ropdias](https://github.com/ropdias))

- The Sonnet 5.5 audit flags instructions that message an agent while it works, a risk P27 covered only in Claude API code. ([#73](https://github.com/inbrace-tech/claude-skills/pull/73) by [@ropdias](https://github.com/ropdias))

- Adds a local `claude plugin eval` suite for the Sonnet 5.5 and Opus 5.5 audits: seeded fixtures and deterministic graders from their keys. ([#83](https://github.com/inbrace-tech/claude-skills/pull/83) by [@ropdias](https://github.com/ropdias))

- When a project refuses the close's cleanup, the audit leaves the working files, names them and never retries the deletion another way. ([#75](https://github.com/inbrace-tech/claude-skills/pull/75) by [@ropdias](https://github.com/ropdias))

- The Sonnet 5.5 audit proposes removing `MAX_THINKING_TOKENS=0` and a per-tool-call countdown hook instead of listing them as re-tests. ([#72](https://github.com/inbrace-tech/claude-skills/pull/72) by [@ropdias](https://github.com/ropdias))

- Findings no longer rest on the user's own settings, the verifier keeps documented requirements as changes, and older residue stays out of the final list. ([#80](https://github.com/inbrace-tech/claude-skills/pull/80) by [@ropdias](https://github.com/ropdias))

- The finding verifier checks and corrects every `file:line` a finding cites, in its notes as well as its anchor. ([#74](https://github.com/inbrace-tech/claude-skills/pull/74) by [@ropdias](https://github.com/ropdias))

## 0.6.0

### Minor Changes

- The audit checks every known trap's doc passage against the page as it reads today, and reports traps whose passage changed as possibly stale, quoting the current text. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

- When a run learns something the audit's knowledge lacks, the close invites you to contribute it: a generic, anonymised issue draft, shown first and sent only if you choose. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

- One audit for every model transition, `/inbrace-config:audit-model-transition <source> <target>`, reads today's docs, explores freely, then checks known traps; the Opus and Sonnet commands run it. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

### Patch Changes

- The plan's cost estimate counts every part of a run from measured runs — fixed load, docs, files, findings and verifiers — and states the cost in dollars. ([#60](https://github.com/inbrace-tech/claude-skills/pull/60) by [@ropdias](https://github.com/ropdias))

- The audit writes each run to `.model-audits/<target>-<date>/`, ignored by git, instead of the protected `.claude/`, so it runs without per-file prompts and headless. ([#58](https://github.com/inbrace-tech/claude-skills/pull/58) by [@ropdias](https://github.com/ropdias))

- Both audits now propose the exact-or-longest-prefix selector fix for prefix-delivered prompting (P05, P22) as a change you can apply; re-testing the delivered text stays a re-test. ([#33](https://github.com/inbrace-tech/claude-skills/pull/33) by [@ropdias](https://github.com/ropdias))

- Rewrite the plugin's norm and trap histories in the repository's one-line `refs` layout; no norm, trap or behaviour changes. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

- Add the discover stage of the coming transition-agnostic audit, which judges files against today's docs, and let batch-auditor work from its digest; the current audits are unchanged. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

- Add the orchestrator and plan stage of the coming transition-agnostic audit; no command starts them yet, so nothing changes for users. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

- Add the report and apply stages of the coming transition-agnostic audit; no command starts them yet. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

- Add the known-traps stage of the coming transition-agnostic audit, and let finding-verifier check each finding's doc passage and verify one shard of files. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

- Add the knowledge files the coming transition-agnostic audit reads, for Opus 5 → 5.5 and Sonnet 5 → 5.5: every pattern row, with the doc passages it rests on. ([#45](https://github.com/inbrace-tech/claude-skills/pull/45) by [@ropdias](https://github.com/ropdias))

- Known traps are checked in every area they apply to (a missed P13 in skills), and a run writes only inside its folder, reporting any file it left elsewhere. ([#62](https://github.com/inbrace-tech/claude-skills/pull/62) by [@ropdias](https://github.com/ropdias))

## 0.5.0

- New skill, `/inbrace-config:audit-sonnet-5-5`, audits a setup for the move from Claude Sonnet 5 to Sonnet 5.5 with the same stages and gates as the Opus audit; it proposes the model `claude-sonnet-5-5` without writing an effort level, and the `batch-auditor` and `finding-verifier` agents now serve both audits, reading the transition from the brief.
- Both audits find the old tier's prompting delivered to the new model by a prefix match in gate and check scripts as well as hooks, and read and count only the scripts that match; they keep recommending full scope when the skills carry the old model's tuning, estimate parallel time from the slowest auditor's batch count, and recommend showing the diff or stopping when the project binds a pin to other files.
- Both audits also read templates, triggers and a worktree's gitignored instruction files, find Claude API code by its SDK imports, anchor each finding on the line that carries it with one line per pattern, compute the total cost as fixed plus marginal, and recommend by a fixed ordered list; the verifier merges only exact duplicates.
- Both audits take `--scope`, `--mode` and `--stop-at-report` arguments that answer the plan gate and stop at the report, so they can run headless; no argument applies changes.
- Both audits also read model-dependent code and docs — price tables, prompting-guide indexes, model-id selectors and transcript parsers — and add rows for a source-model skill preloaded into a moving agent, the Claude Code version floor, content-based fallback, price tables, model docs and text-only parsers; a prefix selector's fix names exact or longest matching, project memory counts for a missing instruction unless the agent sets `omitClaudeMd`, every row states a confidence, and older residue takes the id `P00`.

## 0.4.7

- The audit no longer proposes a rule an agent already loads through a skill in its `skills:` frontmatter, records as P22 an Opus 5 prompting skill that a hook delivers to Opus 5.5 by matching the model id's prefix, and shows advice the guide only offers — P06, P09, P12, P13 — as optional, in its own table and outside "apply every change".

## 0.4.6

- The cost footer and the close no longer say the harness's per-agent token count includes cache re-reads or compare it with the estimate: they say the figures are tokens of context without the cache re-reads, which can multiply the tokens sent about 10× in an agent-heavy run, and point to `/usage` for the real volume and cost.

## 0.4.5

- P01 keeps a `[1m]` model suffix, the gate reads project hooks that require `model` before asking, the cost footer applies 3–5× only to this session, time and batch estimates follow the measured run, and the verifier cites a control rule without guessing where the file sits.

## 0.4.4

- The audit reads nothing outside the project, asks scope and run mode as two questions, runs one agent per area with a new `finding-verifier` checking every finding, estimates time from measured runs, and summarizes in the chat what it would change, why, what the verifier discarded and what it recommends.

## 0.4.3

- Audit subagents now run as the plugin's own read-only agent, `inbrace-config:batch-auditor`, on Opus 5.5 at `medium` effort instead of a cheaper tier, and the gate states that tier and its cost.

## 0.4.2

- The plan shows tables by area and by option and asks one question covering scope, run mode and a new quick sweep; the fixed cost counts the project memory; subagents run on an explicit cheaper tier; P01 counts a level saved under `modelSettings`; the close explains why the harness reports more tokens.

## 0.4.1

- Cost figures read "tokens of context (estimate)" and include verifying and closing; the shared-settings option warns on public repositories; P01 cites its source on the row; post-report approvals join the report's decision section; worktree sessions read the main checkout's memory.

## 0.4.0

- The plugin is renamed `inbrace-config`, so the audit is now `/inbrace-config:audit-opus-5-5`: reinstall with `/plugin uninstall claude-config@inbrace`, then `/plugin install inbrace-config@inbrace`. The audit asks before each costly stage with its cost, keeps the chat to what you need to decide, and puts the reference material in the report.

## 0.3.1

- P01 recommends Opus 5.5 at `medium` in project settings, shared or local as you choose; cost estimates include the skill's own and each subagent's base context; reports follow your language; an interrupted run resumes where it stopped.

## 0.3.0

- The audit shows its plan and token cost before reading, reports in the chat, and asks what to apply with a recommendation; P01 now matches how Claude Code sets effort for Opus 5.5, and P20 flags agents still pinned to Opus 5.

## 0.2.0

- Rename `/claude-config:audit` to `/claude-config:audit-opus-5-5` and scope it to the Opus 5 → 5.5 transition. It now audits in context-sized batches, writes a report file, asks what to change, and applies only the approved changes. Findings in Claude API code are handed off to `/claude-api migrate` instead of being edited.

## 0.1.0

- Add `/claude-config:audit`, which audits `CLAUDE.md`, rules, agents, skills and settings for instructions outdated by Claude Opus 5 and 5.5.
