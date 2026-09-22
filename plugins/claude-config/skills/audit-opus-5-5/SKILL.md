---
name: audit-opus-5-5
description: Audit a project's Claude Code instruction surface (CLAUDE.md, rules, agents, skills, settings, and any Claude API code) for what changes when moving from Claude Opus 5 to Claude Opus 5.5 — instructions that no longer help, instructions that now backfire, and gaps the new model's behavior opens. Audits in context-sized batches, writes a full report, asks what to change, then applies only what was approved.
argument-hint: "[path]"
disable-model-invocation: true
---

# Audit a Claude Code setup for the move from Opus 5 to Opus 5.5

**This skill covers one model transition, Claude Opus 5 → Claude Opus 5.5, and nothing older.** Every pattern it flags comes from Anthropic's official guide for that transition, cited in [Sources](#sources). An instruction that was already outdated on Opus 5 is reported as older residue and left alone.

**It runs in five stages, and it changes no file until the user approves a set of changes.** Inventory and measure → audit in batches → report → ask → apply and verify.

## Stage 1 — Inventory and measure

- [N01] Take the path argument as the audit root, or the current project root when none is given, and state it at the top of the report without stopping to ask.
- [N02] List every file that shapes model behavior under the root: `CLAUDE.md`, `CLAUDE.local.md` and `AGENTS.md` with every file they import through `@path`; everything under `.claude/rules/`, `.claude/agents/`, `.claude/skills/` and `.claude/commands/`; `.claude/settings.json` and `.claude/settings.local.json`; and any source file that calls the Claude API, found by searching for `output_config`, `thinking`, `budget_tokens` and `tool_choice`.
- [N03] Name `.claude` explicitly in every search, or pass `--hidden` to `rg`, because `rg` skips dot-directories when it walks from `.` and returns zero results with no error.
- [N04] Mark as read-only every listed file that is gitignored, installed by a plugin, or reached through a symlink leading outside the root, since an edit to such a file is overwritten by the tool that produced it or lands in another project.
- [N05] Measure the inventory before reading any of it, and estimate its tokens as bytes divided by four:

<measure>

```bash
wc -c <every file from the inventory>
```

</measure>

- [N06] Plan the audit as batches of at most 30,000 estimated tokens, grouping files that belong together — a `CLAUDE.md` with its imports, one agent with the skills it names — and read a single file larger than one batch in line ranges.
- [N07] State the file count, the estimated tokens and the batch plan in one short message before reading the first batch, so the user sees the size of the run before it starts.

## Stage 2 — Audit in batches

- [N08] Audit one batch at a time, and after each batch append its findings to the findings file before reading the next one, so no finding depends on file contents still sitting in context.
- [N09] Write the findings file at `.claude/audits/opus-5-5-<YYYY-MM-DD>.findings.md` under the root, one line per finding carrying `file:line`, the pattern id from the table below, the quoted text, and a confidence of high, medium or low.
- [N10] Check every batch against each row of the pattern table below, and record a finding only where the row's signal is present and its "applies when" condition holds for that file.
- [N11] Record an instruction that belongs to a transition older than Opus 5 — explicit verification steps, "delegate more" guidance, severity filters in review prompts — as a single line under "Older residue", with no proposed change, since this audit's evidence covers the Opus 5 → 5.5 transition alone.
- [N12] Never propose removing a safety rule, a confirmation step for a destructive or irreversible action, a permission boundary, a project fact, or an instruction the file says exists because of a measured failure; record anything whose purpose you cannot determine as "unclear" rather than proposing a deletion.

<patterns>

| Id | Pattern | Signal | Applies when | Proposed change |
|---|---|---|---|---|
| P01 | Effort left at the old default | no explicit effort, or one carried over from Opus 5 | always | Set effort explicitly. Opus 5.5 defaults to `medium` where Opus 5 defaulted to `high`, and its `medium` matches or beats Opus 5 at `high`. Re-test neighboring levels; keep `xhigh` and `max` for measured gains. |
| P02 | Thinking disabled or budgeted | `thinking: {type: "disabled"}`, `budget_tokens` | API code | Remove. Both return a 400 on Opus 5.5 at every effort level. Use `low` effort where latency matters. |
| P03 | "Don't think" rules | "do not think", "don't reason", "skip thinking" | any instruction file | Remove. Thinking is always on, and such rules increase internal-tag leakage. |
| P04 | Reasoning written into the response | "show your reasoning in the answer", "write out your chain of thought" | any instruction file | Remove. It can be declined with the `reasoning_extraction` refusal. Read summarized thinking blocks instead. |
| P05 | Thinking-disabled mitigation | "you may say a brief sentence first… do not include internal or system XML tags" | the project ran Opus 5 with thinking off | Re-test, then remove if nothing regresses. It addressed artifacts that appear only with thinking disabled. |
| P06 | "Think carefully" in chat prompts | "think carefully before answering", "take your time" | chat applications | Consider removing. Effort is the control, and removing the line made replies start sooner without a quality drop in Anthropic's testing. |
| P07 | Opus 5 tuning instructions | conciseness, over-verification, scope, narration-cadence or correction-narration instructions written for Opus 5 | any instruction file | Keep as the starting point and mark for re-testing. They may no longer be needed; do not delete them on this audit's word alone. |
| P08 | Silent agentic turns | a client or harness that renders only `text` blocks | API code, custom harnesses | Set `thinking.display: "updates"`. On Opus 5.5 notes between tool calls arrive as thinking blocks, empty by default. |
| P09 | No update cadence | long human-in-the-loop agentic work with no guidance on updates | agent and orchestrator prompts | Add a cadence, for example a one-line intent before the first tool call and a short recap at the end. |
| P10 | Unattended runs without a continuation plan | background or headless agents, no to-do tracking | unattended agents only | Add a checklist the model updates, auto-continue only when items are open and no blocker is stated, and cap continuations at 2–3. Opus 5.5 sometimes ends a turn with a text update instead of a tool call. |
| P11 | Multi-app agents that act without looking | workflows across email, documents, spreadsheets or CRM | multi-app automation | Add the guide's instruction to explore the relevant sources before acting. |
| P12 | Multi-agent runs without time signals | a lead agent delegating to subagents | multi-agent harnesses | Consider an elapsed-time line against a budget in each message back to the model. |
| P13 | Chat that re-examines settled answers | multi-turn chat with slow follow-ups | chat, not agentic work | Consider the guide's two-sentence "treat that answer as done" instruction. |
| P14 | Unmarked pasted content | an application forwarding text users pasted | applications you build | Wrap pasted blocks in `<pasted_content id="…">` tags and add the guide's system-prompt note. |
| P15 | Visual-input scaffolding | forced cropping, OCR passes, "zoom before reading the chart" | vision workloads | Re-test. Opus 5.5 reads charts and diagrams natively; crop tools still help on the densest inputs. |
| P16 | Vague design direction | "avoid a generic AI look", "make it modern" | frontend work | Replace with the specific default patterns to avoid. |
| P17 | Forced tool use | `tool_choice` of type `any` or `tool` | API code | Replace with `auto`, `strict: true` and a check that the call happened, or with structured outputs. Forced tool use returns a 400. |
| P18 | Old computer-use tool | `computer_20251124` | API code | Move to `computer_toolset_20260801`. The old tool returns a 400. |
| P19 | History edited between requests | code that rewrites `system`, `tools` or earlier messages mid-session | API code that builds `messages` itself | Keep history append-only. Edits before a thinking block invalidate it, and for newer accounts return a 400. |

</patterns>

## Stage 3 — Report

- [N13] Write the full report to `.claude/audits/opus-5-5-<YYYY-MM-DD>.md` under the root, opening with the scope, the files read, the files marked read-only, the batch plan, and the counts by pattern and by confidence, followed by every finding grouped by pattern and the older residue.
- [N14] Publish the report as an artifact too where this session holds a tool that publishes one, and give its link beside the file path.
- [N15] Keep the chat summary to the counts and the five highest-impact findings, and point to the report for the rest, since a large setup produces more findings than a chat message can carry.
- [N16] Propose no diff at this stage: the report names each proposed change in words, and the diff is written in Stage 5 for the changes the user approved.

## Stage 4 — Ask

- [N17] Ask the user what to change through `AskUserQuestion`, offering: apply every high-confidence change; choose by pattern; show the diff for review before applying anything; stop here with the report. Recommend the first option only when every high-confidence finding is a removal or an addition the guide states verbatim.
- [N18] Where `AskUserQuestion` is not available, as in a headless run, end the turn with the same four options as a numbered question, and change nothing.

## Stage 5 — Apply and verify

- [N19] Before the first edit, check `git status` and ask to proceed on a dirty tree or outside a git repository, since an audit's edits are easiest to review and revert as one change on a clean branch.
- [N20] Apply exactly the approved set and nothing beside it, and edit no file Stage 1 marked read-only — name it and its proposed change for the user to make where it is produced.
- [N21] Show the diff of every edited file once the edits are done, when the user chose to review it first, and apply nothing until they confirm.
- [N22] Re-scan every edited file against the pattern table after applying, and confirm that no instruction protected by [N12] was removed.
- [N23] Close by listing every file edited, every approved change not applied and why, and one recommended next step: re-run the project's own evals or a short effort sweep at `low`, `medium` and `high`, since the guide's advice is a starting point that the project's own measurements confirm.
- [N24] Append the applied changes and the verification result to the report file, so the report records what the audit changed and not only what it found.

## Sources

- Prompting Claude Opus 5.5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
- Migration guide, Opus 5 → Opus 5.5: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-5
- Prompting Claude Opus 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
