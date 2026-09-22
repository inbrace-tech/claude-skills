---
name: audit
description: Audit a project's Claude Code instruction surface (CLAUDE.md, .claude/rules, agents, skills, settings) for instructions written for older Claude models that current models no longer need or that now backfire, and propose a diff. Run it after a model upgrade, or when turns feel slow, verbose or over-delegated.
argument-hint: "[path] [--target <model>] [--apply]"
disable-model-invocation: true
---

# Audit Claude Code configuration for outdated instructions

Prompts and rules written for an older model keep running after every upgrade. Some become dead weight, and some now work against the model: an instruction that fixed a weakness of Claude Opus 4.8 can make Claude Opus 5 or 5.5 slower, more expensive or less accurate. This skill finds those instructions and proposes what to change.

## Scope and defaults

- **Path:** the argument, or the current project root when none is given.
- **Target model:** `--target <model>`, or else the model this session runs on. State the target in the report.
- **Apply:** propose only. Edit files only when the invocation carries `--apply` or the user asks for it after reading the report.

Do not stop to ask about scope. State your assumptions at the top of the report instead.

## Step 1: Inventory

List every file that shapes model behavior, and read each one whole:

- `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md`, and every file they import with `@path`.
- `.claude/rules/**/*.md`, `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`, `.claude/commands/*.md`.
- `.claude/settings.json` and `.claude/settings.local.json`: look at `env`, `model`, and hook commands that inject text.
- Any application code in the repository that calls the Claude API: search for `thinking`, `budget_tokens`, `effort`, `tool_choice`.

`rg` skips dot-directories when it walks from `.`, so name `.claude` explicitly or pass `--hidden`.

## Step 2: Scan for these patterns

Each row names the model where the change began. A row applies when the target is that model or newer.

| # | Pattern | Signal to search for | Since | What to do |
|---|---|---|---|---|
| 1 | Explicit verification steps | "final verification step", "double-check", "re-verify", "use a subagent to verify" | Opus 5 | Remove. The model verifies its own work, and these instructions cause over-verification with no quality gain. |
| 2 | Instructions to delegate more | "use subagents liberally", "parallelize with subagents" | Opus 5 | Remove. Opus 5 and later delegate readily. Add a guard instead (row 3). |
| 3 | No delegation guard | subagents available, no rule on when to use them | Opus 5 | Add: "Delegate to a subagent only for large, independent tasks. Do not use subagents to verify your own work." Mention the env caps `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` and `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`. |
| 4 | Severity filters in review prompts | "only report high-severity", "be conservative" | Opus 5 | Replace with "report everything, with confidence and severity" and filter in a separate pass. The model follows the filter literally and reports less. |
| 5 | Thinking disabled or budgeted | `thinking: {type: "disabled"}`, `budget_tokens`, "do not think", "don't reason" | Opus 5.5 | Remove. Thinking is always on and these return a 400. Control depth with `effort`. "Don't think" rules also increase tag leakage. |
| 6 | Reasoning written into the response | "explain your reasoning step by step in the answer", "show your chain of thought" | Opus 5.5 | Remove. This can be declined with the `reasoning_extraction` refusal. Read summarized thinking blocks instead. |
| 7 | "Think carefully before answering" in chat prompts | "think carefully", "take your time", "think step by step" | Opus 5.5 | Consider removing. Effort is the control, and removing the line made replies start sooner without a quality drop in Anthropic's testing. |
| 8 | Visual-input scaffolding | forced cropping, OCR passes, "zoom into the chart before reading" | Opus 5.5 | Re-test. The model reads charts and diagrams natively. Crop tools still help on the densest inputs, so keep them where evals show a gain. |
| 9 | Vague design direction | "avoid a generic AI look", "make it modern" | Opus 5.5 | Replace with a list of the specific default patterns to avoid. |
| 10 | No progress-update guidance in agentic setups | long agentic runs, no instruction on updates | Opus 5.5 | Ask for the cadence: a one-line intent before the first tool call and a short recap at the end. |
| 11 | Unattended agents without a continuation plan | background or headless runs, no to-do tracking | Opus 5.5 | Add a checklist the model updates, and an auto-continue message capped at 2-3 continuations. Some turns end with a text update rather than a tool call. |
| 12 | Scope drift | narrow tasks, no scope rule | Opus 5 | Add a scope instruction: deliver what was asked, finish the whole task, and say so in a sentence when a better approach exists. |
| 13 | Unmarked pasted content | user messages carrying pasted emails or web pages, handled by an app you build | Opus 5.5 | Wrap pasted blocks in `<pasted_content id="…">` tags and add the matching system-prompt note. |

## Keep list: never propose removing these

- Safety rules, confirmation steps for destructive or irreversible actions, and permission boundaries.
- Project facts: stack, commands, directory layout, naming conventions, domain vocabulary.
- Instructions that exist because of a measured failure in this project, when the file says so.
- Anything whose purpose you cannot determine. Flag it as "unclear" rather than proposing a deletion.

## Step 3: Report

Lead with a one-line verdict, then:

1. **Assumptions:** path, target model, files read.
2. **Findings,** ordered by impact: `file:line`, the pattern number, the quoted text, why it is outdated for the target, and confidence (high, medium, low).
3. **Proposed diff:** a unified diff per file. Replace a finding only with an instruction the table names. When the fix is a deletion, delete.
4. **Not changed:** instructions you considered and kept, with one line each on why.

When `--apply` is set, apply the diff after printing the report, then list every file you edited.

## Sources

- Prompting Claude Opus 5.5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
- Prompting Claude Opus 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
- Prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
