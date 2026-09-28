# Changelog

## inbrace-config (formerly claude-config)

### 0.5.0

- New skill, `/inbrace-config:audit-sonnet-5-5`, audits a setup for the move from Claude Sonnet 5 to Sonnet 5.5 with the same stages and gates as the Opus audit; it proposes the model `claude-sonnet-5-5` without writing an effort level, and the `batch-auditor` and `finding-verifier` agents now serve both audits, reading the transition from the brief.
- Both audits find the old tier's prompting delivered to the new model by a prefix match in gate and check scripts as well as hooks, and read and count only the scripts that match; they keep recommending full scope when the skills carry the old model's tuning, estimate parallel time from the slowest auditor's batch count, and recommend showing the diff or stopping when the project binds a pin to other files.
- Both audits also read templates, triggers and a worktree's gitignored instruction files, find Claude API code by its SDK imports, anchor each finding on the line that carries it with one line per pattern, compute the total cost as fixed plus marginal, and recommend by a fixed ordered list; the verifier merges only exact duplicates.

### 0.4.7

- The audit no longer proposes a rule an agent already loads through a skill in its `skills:` frontmatter, records as P22 an Opus 5 prompting skill that a hook delivers to Opus 5.5 by matching the model id's prefix, and shows advice the guide only offers — P06, P09, P12, P13 — as optional, in its own table and outside "apply every change".

### 0.4.6

- The cost footer and the close no longer say the harness's per-agent token count includes cache re-reads or compare it with the estimate: they say the figures are tokens of context without the cache re-reads, which can multiply the tokens sent about 10× in an agent-heavy run, and point to `/usage` for the real volume and cost.

### 0.4.5

- P01 keeps a `[1m]` model suffix, the gate reads project hooks that require `model` before asking, the cost footer applies 3–5× only to this session, time and batch estimates follow the measured run, and the verifier cites a control rule without guessing where the file sits.

### 0.4.4

- The audit reads nothing outside the project, asks scope and run mode as two questions, runs one agent per area with a new `finding-verifier` checking every finding, estimates time from measured runs, and summarizes in the chat what it would change, why, what the verifier discarded and what it recommends.

### 0.4.3

- Audit subagents now run as the plugin's own read-only agent, `inbrace-config:batch-auditor`, on Opus 5.5 at `medium` effort instead of a cheaper tier, and the gate states that tier and its cost.

### 0.4.2

- The plan shows tables by area and by option and asks one question covering scope, run mode and a new quick sweep; the fixed cost counts the project memory; subagents run on an explicit cheaper tier; P01 counts a level saved under `modelSettings`; the close explains why the harness reports more tokens.

### 0.4.1

- Cost figures read "tokens of context (estimate)" and include verifying and closing; the shared-settings option warns on public repositories; P01 cites its source on the row; post-report approvals join the report's decision section; worktree sessions read the main checkout's memory.

### 0.4.0

- The plugin is renamed `inbrace-config`, so the audit is now `/inbrace-config:audit-opus-5-5`: reinstall with `/plugin uninstall claude-config@inbrace`, then `/plugin install inbrace-config@inbrace`. The audit asks before each costly stage with its cost, keeps the chat to what you need to decide, and puts the reference material in the report.

### 0.3.1

- P01 recommends Opus 5.5 at `medium` in project settings, shared or local as you choose; cost estimates include the skill's own and each subagent's base context; reports follow your language; an interrupted run resumes where it stopped.

### 0.3.0

- The audit shows its plan and token cost before reading, reports in the chat, and asks what to apply with a recommendation; P01 now matches how Claude Code sets effort for Opus 5.5, and P20 flags agents still pinned to Opus 5.

### 0.2.0

- Rename `/claude-config:audit` to `/claude-config:audit-opus-5-5` and scope it to the Opus 5 → 5.5 transition. It now audits in context-sized batches, writes a report file, asks what to change, and applies only the approved changes. Findings in Claude API code are handed off to `/claude-api migrate` instead of being edited.

### 0.1.0

- Add `/claude-config:audit`, which audits `CLAUDE.md`, rules, agents, skills and settings for instructions outdated by Claude Opus 5 and 5.5.
