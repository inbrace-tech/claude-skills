---
name: transition-audit
description: Runs the stages of a model-transition audit. Use only when an inbrace-config audit command starts it, or to resume one.
user-invocable: false
allowed-tools: Skill(inbrace-config:transition-audit-plan) Skill(inbrace-config:transition-audit-discover) Skill(inbrace-config:transition-audit-drift) Skill(inbrace-config:transition-audit-traps) Skill(inbrace-config:transition-audit-report) Skill(inbrace-config:transition-audit-apply)
metadata:
  max-bytes: 14000
---

# Run a model-transition audit

**This skill runs an audit of a project's Claude Code setup for one model transition, named by its knowledge file, and hands each stage to its own skill.** The knowledge file, `transitions/<slug>.md` beside this skill, holds everything that belongs to the transition — its models, docs and known traps — so nothing below names a model.

**The audit has three jobs.** Be transparent before spending anything. Explain what it found plainly enough that the user needs no file to understand it. Change nothing the user did not approve.

## Start

- [N01] Start only when the arguments below begin with `--transition <slug>` or are `--resume`, and otherwise stop at once with one line saying this skill runs only from `/inbrace-config:audit-model-transition`, `/inbrace-config:audit-opus-5-5` or `/inbrace-config:audit-sonnet-5-5`, since Claude can invoke it unasked.
- [N02] Before the first tool call, read the arguments after `--transition <slug>`, in any order and each flag once, as `--flag value` or `--flag=value`: the first token that is not a flag is the audit root; `--scope` takes `full`, `reduced` or `quick`; `--mode` takes `session` or `agents`; `--stop-at-report` stops the run at the report. No argument approves applying changes. Where a second token is not a flag, a flag is unknown, a value is outside these, or a flag repeats with another value, stop before any tool call and show `<source> <target> [path] [--scope full|reduced|quick] [--mode session|agents] [--stop-at-report]` with the token at fault:

<arguments>

```text
$ARGUMENTS
```

</arguments>

- [N03] Take the knowledge file as `${CLAUDE_SKILL_DIR}/transitions/<slug>.md`; where none exists, run a bootstrap, which the plan states: its docs come from the index at `https://platform.claude.com/llms.txt`, confirmed by the user at the first gate, and it has no known-traps stage.
- [N04] Keep every file of the run in its own folder, `.model-audits/<target>-<YYYY-MM-DD>/` under the audit root, where `<target>` is the target model id without `claude-`, and `-2`, `-3`, … added when that folder holds another run — never under `.claude/`, which Claude Code protects from writes in every permission mode but bypass; when creating `.model-audits/` for the first time, write in it a `.gitignore` holding the single line `*`, so nothing of the audit shows in `git status`, and never edit the project's own `.gitignore` or `.git/info/exclude`. Keep the run file, `run.md` in that folder: write it before the plan with the slug, the knowledge file's absolute path or "bootstrap", the root and the arguments, and after every stage record the stage finished, the stage next and each gate answered, since each stage reads it to know it may run.
- [N05] Run the stages in the order of `<stages>`, invoking each through the Skill tool by the name it lists — `inbrace-config:transition-audit-plan` from the plugin, `transition-audit-plan` when copied — after setting it as next in the run file; a quick sweep skips discover, a bootstrap skips drift and known traps, and a run cancelled at the plan, stopped at the report or headless goes straight to apply for its close.

<stages>

| # | Stage | Skill, or agent |
|---|---|---|
| 1 | Plan: list, measure, check the docs, confirm | `transition-audit-plan` |
| 2 | Discover: read the docs and the files | `transition-audit-discover` |
| 3 | Drift: check the known traps against today's docs | `transition-audit-drift` |
| 4 | Known traps: add what discovery missed | `transition-audit-traps` |
| 5 | Verify: an agent tries to refute every finding | `finding-verifier`, per [N17] |
| 6 | Report and decide | `transition-audit-report` |
| 7 | Apply, verify, close | `transition-audit-apply` |

</stages>

- [N06] With `--resume`, or after an interruption or a compaction, read the run file, the findings file and the report on disk, reprint the checklist, say where the run stopped, and continue from the next stage, the last batch the findings file records or the last edit the report records, redoing nothing finished.
- [N07] Never resume the files an older version of this audit left in the project, in another format and folder: say they are there, for the user to keep or delete, and start the run in its own folder.

## Throughout the run

- [N19] Write every file of the run by its absolute path under the run's folder — a `curl -o` or `>` target included — never by a path relative to the working directory, which a `cd` moves: a run once left a 107 KB doc page and its normalised copy at the audited project's root.

- [N08] Before the first tool call and at the start of every stage, show the checklist as plain text, titled `<title> audit` from the knowledge file, one line per row of `<stages>`, each marked `[x]` done, `[>]` current, `[ ]` pending or `[-]` skipped, never depending on a task-list tool.
- [N09] Ask every question through `AskUserQuestion`, recommended option first, at most four options per question, splitting a larger choice into several questions of one call; where the tool is not available, or a call to it is denied, follow [N15] and never write the questions as a list.
- [N10] Write the chat, every question and every file in the run's folder in the user's language — that of their messages, or the session's configured one — translating every template's headings and keeping quoted text, paths, ids and commands as they are.
- [N11] Report progress in batches: one line when a batch finishes or an auditor returns, with the batches done of the total and the findings they added.
- [N12] Ask for approval before each costly step — reading the first batch, starting any agent, applying changes — showing the fixed cost already paid, the step's marginal cost and the total to the end, each labelled "tokens of context (estimate)", the total being the fixed cost plus every step still ahead; and say in the first gate's footer that these figures leave out the cache re-reads of every round trip, which make the tokens actually sent 15–19× larger across session and agents, about US$14–17 per million tokens of context on Opus 5.5 (measured on two runs of this audit: US$2.16 for ~156k, US$7.90 for ~490k), and that `/usage`, also `/cost`, shows the real volume and cost.
- [N13] Record every approved gate in the report file with the estimate of each option offered, marking a gate the arguments answered as "pre-approved by argument", and put the gates approved after the report into its decision section.
- [N14] Offer at every gate only the options the stages define, never improvising another.
- [N15] Treat the run as headless where `AskUserQuestion` is not available or a call to it is denied, since no one can answer: change nothing, run through the report when the arguments gave the scope and the run mode it needs, and otherwise stop at the plan and close there, naming the `--scope` and `--mode` arguments that would have reached the report.

## Findings file

- [N16] Record findings in `findings.md` in the run's folder, one line each in the `<line_format>` below, which every stage and agent of the run uses and the brief carries:

<line_format>

Seven fields separated by ` | `:

`<file>:<line> | <id> | <status> | "<quoted text>" | <confidence> | <doc> | <note>`

- `<file>` is relative to the audit root, and `<line>` is the line that carries the signal where the quoted text starts, never a function head or a nearby setting; a `file:line` the note cites follows the same rule, pointing at the line of the construct it names.
- `<id>` is a trap id of the knowledge file, `P00` for older residue, or `D01`, `D02`, … in order for a discovery finding no trap names.
- `<status>` is `change`, `already decided`, `older residue` or `unclear` in a batch's lines; the final list may also use `re-test`, `optional` and `discarded`.
- `<quoted text>` is the file's text exactly, trimmed to the words that matter.
- `<confidence>` is `high`, `medium` or `low`.
- `<doc>` is `<url>#<anchor> "<passage>"`, the doc passage behind the finding, at most 30 words, or `trap` when the trap's recorded passage is the source.
- `<note>` is the proposed change for `change`, `re-test` and `optional`, where the project records the decision for `already decided`, the reason for `unclear` and `discarded`, and `-` for `older residue`.

One line per id per `file:line`; a batch with no finding is the line `clean`.

</line_format>

## Verify

- [N17] Once the traps stage ends with at least one raw finding, start the `finding-verifier` agent — `inbrace-config:finding-verifier` from the plugin, `finding-verifier` when copied — passing no `model`, with the run's brief — which discovery writes, or the traps stage in a quick sweep — and the raw lines, as one agent up to 40 lines and above that one agent per group of files of about 40 lines, never splitting a file, all at once below the concurrent subagent limit; append the returned lines under "Final list", except the `older residue` lines, which go under "Older residue", and build the report from them without redoing their triage, or, where the agent is not listed or the project forbids it, make that adversarial pass in this session and say in the report that no verifier ran.
- [N18] Where the project's hooks refuse an Agent call that passes no `model`, pass `model: "opus"`, and say before retrying that `opus` resolves to the session's Opus model and that the agent's `medium` effort may not be kept.

## Sources

- Skills, who invokes them and their arguments: https://code.claude.com/docs/en/skills#control-who-invokes-a-skill and https://code.claude.com/docs/en/skills#pass-arguments-to-skills
- A skill's content after compaction: https://code.claude.com/docs/en/skills#skill-content-lifecycle
- The concurrent subagent limit: https://code.claude.com/docs/en/sub-agents#concurrent-subagent-limit
- Headless runs: https://code.claude.com/docs/en/headless
- `/usage` and costs: https://code.claude.com/docs/en/costs#track-your-costs and https://code.claude.com/docs/en/prompt-caching#how-the-cache-is-organized

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
