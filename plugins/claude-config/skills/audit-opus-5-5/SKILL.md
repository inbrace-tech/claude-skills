---
name: audit-opus-5-5
description: Audit a project's Claude Code instruction surface (CLAUDE.md, rules, agents, skills, settings, and any Claude API code) for what changes when moving from Claude Opus 5 to Claude Opus 5.5 — instructions that no longer help, instructions that now backfire, and gaps the new model's behavior opens. Shows its plan and cost before reading, reports in the chat, asks what to change with a recommendation, then applies only what was approved.
argument-hint: "[path]"
disable-model-invocation: true
---

# Audit a Claude Code setup for the move from Opus 5 to Opus 5.5

**This skill covers one model transition, Claude Opus 5 → Claude Opus 5.5, and nothing older.** Every pattern it flags comes from Anthropic's official guides for that transition, cited in [Sources](#sources). An instruction that was already outdated on Opus 5 is reported as older residue and left alone.

**It has three jobs, and every stage below serves one of them.** Be transparent before spending anything: show the plan, the cost and the options, and let the user choose. Explain what it found in the chat, plainly enough that the user understands each change without opening a file. Ask what to do, with a recommendation, and change nothing the user did not approve.

## Throughout the run

- [N32] Before the first tool call, show the run's checklist in the chat as plain text, and show it again, updated, at the start of every stage, so the user always sees where the run is and what comes next. Use this form, translated per [N34], marking each stage `[x]` done, `[>]` current, `[ ]` pending or `[-]` skipped, and never depend on a task-list tool, which not every session has:

<checklist>

```text
Opus 5 → 5.5 audit
  [x] 1. Plan: list the files, estimate the cost, confirm if large
  [>] 2. Audit: read in batches, record findings
  [ ] 3. Report: explain the findings here in the chat
  [ ] 4. Decide: you choose what to change
  [ ] 5. Apply: edit, verify, close
```

</checklist>

- [N33] Ask every question the run needs through `AskUserQuestion`, with a recommended option first; where that tool is not available, write the same question in the chat as a numbered list of options with the recommendation marked, end the turn, and change nothing until the user answers.
- [N34] Write the chat, every question and both files under `.claude/audits/` in the user's language — the language of their messages, or the session's configured language — translating the headings of every template here, and keep quoted text, file paths, pattern ids and commands exactly as they are.
- [N35] Report progress in the chat as the audit advances, counted in batches whatever the run mode: one line when each batch finishes, or when a subagent returns with the batches it covered, naming how many batches of the total are done and how many findings they added.
- [N47] After an interruption — an API error, a resumed or compacted session — read the findings file and the report file on disk, reprint the checklist with the stage the run was in, say where it stopped, and continue from the last batch the findings file records or the last edit the report records, without redoing finished work.

## Stage 1 — Plan: list, estimate, confirm if large

- [N01] Take the path argument as the audit root, or the current project root when none is given, and state it in the plan without stopping to ask.
- [N02] List every file that shapes model behavior under the root: `CLAUDE.md`, `CLAUDE.local.md` and `AGENTS.md` with every file they import through `@path`; the Markdown files under `.claude/rules/`, `.claude/agents/`, `.claude/skills/` and `.claude/commands/`; `.claude/settings.json` and `.claude/settings.local.json`; and any source file that calls the Claude API, found by searching code files — not prose — for `output_config`, `budget_tokens`, `tool_choice` and a `thinking` request parameter.
- [N36] Leave out of the audit what is not instruction text — JSON or YAML data beside a skill, third-party reference material and licenses, scripts and hooks that do not call the Claude API — and name each excluded group with its size in the plan.
- [N37] Read the user's `~/.claude/settings.json` as context for explaining pattern P01 only, never as an audit target or a file to edit, since it sits outside the root.
- [N03] Name `.claude` explicitly in every search, or pass `--hidden` to `rg`, because `rg` skips dot-directories when it walks from `.` and returns zero results with no error.
- [N04] Mark as read-only every listed file that is gitignored — except `.claude/settings.local.json`, which is personal by design — installed by a plugin, or reached through a symlink leading outside the root, since an edit to such a file is overwritten by the tool that produced it or lands in another project; list a file reached through a symlink inside the root once, under its real path, and name the link beside it.
- [N38] Search the listed files, and the project's decision records outside the inventory — `docs/adrs/`, `docs/**/decisions/`, `docs/audits/` and similar — for an existing Opus 5.5 evaluation: a section, skill, decision record or rule that says what the project kept, changed or declined for Opus 5.5. Note where it is, since [N31] depends on it, and never state that no record exists without having searched those places.
- [N19] Check `git status` and whether the root is a git repository, and state the result in the plan, since an audit's edits are easiest to review and revert as one change on a clean branch.
- [N05] Measure the listed files and the excluded groups before reading any of them, estimate the listed files' tokens as bytes divided by four, and state the run's cost in tokens, labelled an estimate, as a range from about 12,000 plus that figure to about 12,000 plus three times it, since the skill and its messages cost about 12,000 tokens on their own and reading adds overhead to what the files weigh:

<measure>

```bash
wc -c <every file from the inventory>
wc -c <every file in each excluded group> | tail -n 1
```

</measure>

- [N06] Plan the audit as batches of at most 30,000 estimated tokens, grouping files that belong together — a `CLAUDE.md` with its imports, one agent with the skills it names — split a group larger than one batch into consecutive batches and say so in the plan, and read a single file larger than one batch in line ranges small enough for one read each.
- [N07] Show the plan in one message before reading the first batch: the updated checklist, the root, the file count by area, what was excluded and why, the git state, the batch count, the estimated cost range, and how the audit will run.
- [N39] Where the plan has more than one batch, ask how to proceed per [N33], with these options: audit in this session, batch by batch; audit a reduced scope — memory files and their imports, rules, agents and settings — with its own estimate and a warning that it leaves out the skills, where most text tuned for Opus 5 usually lives; audit in parallel subagents, which finishes sooner, with its own estimate: the in-session range plus, for each subagent, the base context it loads on start — the project's memory files with their imports and the rules injected with them, as measured in [N05] — times the number of subagents; or cancel, which goes straight to the close in [N45]. Recommend this session up to ten batches and the reduced scope above that, and state the reason in the recommended option. Where the plan has a single batch, show it and continue without asking.
- [N40] Give each subagent, when the user chose them, its list of files, the pattern table, the Stage 2 norms and the project facts they depend on — the evaluation from [N38], the model pins, the read-only files — inline or in one shared file under `.claude/audits/` that each subagent reads, and have it return its findings as text in the [N09] line format and write no file; this session writes the findings file.
- [N46] When the user chose the reduced scope and its plan still has more than ten batches, show the new plan and ask again per [N33], offering: audit in this session, audit in parallel subagents, or cancel; recommend this session up to ten batches and subagents above that, with their extra cost from [N39] stated in the option.

## Stage 2 — Audit in batches

- [N08] Audit one batch at a time, and after each batch — or each subagent's return — append its findings to the findings file under a line naming the batch, or that line alone when the batch was clean, before reading the next one, so no finding depends on file contents still sitting in context and [N47] can tell which batches are done.
- [N09] Write the findings file at `.claude/audits/opus-5-5-<YYYY-MM-DD>.findings.md` under the root, one line per finding carrying `file:line`, the pattern id from the table below, the quoted text, and a confidence of high, medium or low.
- [N10] Check every batch against each row of the pattern table below, and record a finding only where the row's signal is present and its "applies when" condition holds for that file; a file pinned to a model other than Opus 5 or Opus 5.5 gets no finding from any row about model behavior.
- [N41] Record a finding only where the matched text instructs the model how to behave, and skip a signal word that appears in project prose about something else — a PR's scope, a delegation in the architecture, a checklist in a runbook.
- [N11] Record an instruction that belongs to a transition older than Opus 5 — explicit verification steps, "delegate more" guidance, severity filters in review prompts — as a single line under "Older residue", with no proposed change, since this audit's evidence covers the Opus 5 → 5.5 transition alone.
- [N12] Never propose removing a safety rule, a confirmation step for a destructive or irreversible action, a permission boundary, a project fact, or an instruction the file says exists because of a measured failure; record anything whose purpose you cannot determine as "unclear" rather than proposing a deletion.
- [N25] Record every finding in Claude API code — the rows whose "applies when" is API code — with the hand-off `/claude-api migrate <files> to claude-opus-5-5` as its proposed change, and keep it out of the set this skill edits, since Anthropic's `claude-api` skill migrates request code with the right syntax for each SDK language and platform.
- [N26] Treat the `description` in a skill's or agent's frontmatter as routing text, where calibrated urgency is legitimate, and apply the rows about wording only to text that shapes behavior.
- [N27] Grade confidence high when the guide or the Claude Code documentation states the change or the old form fails, medium when the guide says to consider or re-test it, and low when the finding rests on your own inference.
- [N28] Report a batch, or the whole audit, as clean when no row applies, and never stretch a row to fill the report.
- [N31] Record as "already decided", with no proposed change, any finding the project states it already evaluated for Opus 5.5 — using the evaluation [N38] found — citing where it says so; record a decision the project made once for every file as one line naming the files it covers, and prefer "already decided" over "older residue" when both fit.

<patterns>

| Id | Pattern | Signal | Applies when | Proposed change |
|---|---|---|---|---|
| P01 | Project not set to Opus 5.5 at `medium` | the project, local and managed settings leave `model` or a top-level `effortLevel` unset | the project runs on Opus 5 or Opus 5.5, and no settings file already pins `claude-opus-5-5` with an effort level; record it once per project, on `.claude/settings.json` | Add `"model": "claude-opus-5-5"` and `"effortLevel": "medium"` to the project settings, in the file the user picks per [N48]. This is the skill's recommendation, not the guide's rule: Opus 5.5's `medium` matches or beats Opus 5 at `high` and costs less, and a top-level `effortLevel` in project settings applies to every model. Explain from [N37] what the user's own settings do today: a top-level `effortLevel` in `~/.claude/settings.json` does not count for Opus 5.5. Type setting. High confidence when the user's settings hold only that ignored key, medium otherwise. |
| P02 | Thinking disabled or budgeted | `thinking: {type: "disabled"}`, `budget_tokens` | API code | Hand off per [N25]. Both return a 400 on Opus 5.5 at every effort level; remove them and use `low` effort where latency matters. |
| P03 | "Don't think" rules | "do not think", "don't reason", "skip thinking" | any instruction file | Remove. Thinking is always on, and such rules increase internal-tag leakage. |
| P04 | Reasoning written into the response | "show your reasoning in the answer", "write out your chain of thought" | any instruction file | Remove. It can be declined with the `reasoning_extraction` refusal. Read summarized thinking blocks instead. |
| P05 | Thinking-disabled mitigation | "you may say a brief sentence first… do not include internal or system XML tags" | the project ran Opus 5 with thinking off | Re-test, then remove if nothing regresses. It addressed artifacts that appear only with thinking disabled. |
| P06 | "Think carefully" in chat prompts | "think carefully before answering", "take your time" | chat applications | Consider removing. Effort is the control, and removing the line made replies start sooner without a quality drop in Anthropic's testing. |
| P07 | Opus 5 tuning instructions | conciseness, over-verification, scope, narration-cadence or correction-narration instructions written for Opus 5 | any instruction file | Keep as the starting point and mark for re-testing. They may no longer be needed; do not delete them on this audit's word alone. |
| P08 | Silent agentic turns | a client or harness that renders only `text` blocks | API code, custom harnesses | Set `thinking.display: "updates"`. On Opus 5.5 notes between tool calls arrive as thinking blocks, empty by default. |
| P09 | No update cadence | long human-in-the-loop agentic work with no guidance on updates | agent and orchestrator prompts, unless the file points to where the project states its update guidance | Add a cadence, for example a one-line intent before the first tool call and a short recap at the end. |
| P10 | Unattended runs without a continuation plan | background or headless agents, no to-do tracking | unattended agents only | Add a checklist the model updates, auto-continue only when items are open and no blocker is stated, and cap continuations at 2–3. Opus 5.5 sometimes ends a turn with a text update instead of a tool call. |
| P11 | Multi-app agents that act without looking | workflows across email, documents, spreadsheets or CRM | multi-app automation | Add the guide's instruction to explore the relevant sources before acting. |
| P12 | Multi-agent runs without time signals | a lead agent delegating to subagents | multi-agent harnesses | Consider an elapsed-time line against a budget in each message back to the model. |
| P13 | Chat that re-examines settled answers | multi-turn chat with slow follow-ups | chat, not agentic work | Consider the guide's two-sentence "treat that answer as done" instruction. |
| P14 | Unmarked pasted content | an application forwarding text users pasted | applications you build | Wrap pasted blocks in `<pasted_content id="…">` tags and add the guide's system-prompt note. |
| P15 | Visual-input scaffolding | forced cropping, OCR passes, "zoom before reading the chart" | vision workloads | Re-test. Opus 5.5 reads charts and diagrams natively; crop tools still help on the densest inputs. |
| P16 | Vague design direction | "avoid a generic AI look", "make it modern" | frontend work | Replace with the specific default patterns to avoid. |
| P17 | Forced tool use | `tool_choice` of type `any` or `tool` | API code | Hand off per [N25]. Forced tool use returns a 400; the fix is `auto` with `strict: true` and a check that the call happened, or structured outputs. |
| P18 | Old computer-use tool | `computer_20251124` | API code on the Claude API or Google Cloud | Hand off per [N25]. There the old tool returns a 400 and the fix is `computer_toolset_20260801`; on Amazon Bedrock it still works, so record no finding for Bedrock-only code. |
| P19 | History edited between requests | code that rewrites `system`, `tools` or earlier messages mid-session | API code that builds `messages` itself | Hand off per [N25]. Keep history append-only: edits before a thinking block invalidate it, and for accounts created on or after 2026-08-31 return a 400. |
| P20 | Agent still pinned to Opus 5 | `model: claude-opus-5` in an agent's or skill's frontmatter, or in settings | instruction files, unless the project records the pin as deliberate per [N31] | Move the pin to `claude-opus-5-5` and set its effort per P21, or record why it stays. Medium confidence, since a pin can be deliberate. |
| P21 | Agent or skill on Opus 5.5 with no effort of its own | `model: claude-opus-5-5` in an agent's or skill's frontmatter, with no `effort:` | agent and skill files | Add `effort: medium` to the frontmatter, so the file keeps its level whatever effort the session runs at; without it the file inherits the session's. Type setting. Medium confidence. |

</patterns>

## Stage 3 — Report: explain it in the chat

- [N13] Write the full report to `.claude/audits/opus-5-5-<YYYY-MM-DD>.md` under the root, opening with the scope, the files read, the files excluded or marked read-only, the batch plan, and the counts by pattern and by confidence, followed by every finding grouped by pattern and the older residue.
- [N15] Present the report in the chat in this form, rendered as Markdown rather than inside a code block, before any question, so the user can decide from the chat alone: a header line with the scope and cost; a table of every proposed change, numbered, in plain words, each typed as remove, add, setting or rewrite; one line per pattern found saying what changed in Opus 5.5 and why it matters for this project; then the sections that change nothing, one line per item, each written as "none" when empty rather than left out. Where more than fifteen changes are proposed, show the fifteen highest-impact in the table and the count per pattern for the rest, and point to the report file:

<chat_report>

```markdown
## Opus 5 → 5.5 audit — <project>
<files> files · <batches> batches · ~<tokens> tokens · <clean> batches clean

### What would change (<n>)
| # | File | Pattern | Today | Change | Type | Confidence |
|---|---|---|---|---|---|---|
| 1 | <file:line> | <Pnn> | <what it says, in a few words> | <what it becomes> | <remove/add/setting/rewrite> | <high/medium/low> |

### Why
- <Pnn>: <what changed in Opus 5.5, in one plain sentence, and what it means here>

### Re-test only, no edit (<n>)
- <file:line> · <Pnn> · <what to re-test>
### Already decided by the project (<n>)
- <files> · <Pnn> · <where the project says so>
### Unclear (<n>)
- <file:line> · <why its purpose is unclear>
### Out of scope
- Claude API code: <files, or none> → /claude-api migrate <files> to claude-opus-5-5
- Older residue: <count, or none> → /claude-api prompt-audit
### Coverage
- <what was excluded, and any file read only in part>

Full report: .claude/audits/opus-5-5-<date>.md
```

</chat_report>

- [N29] Close the report's older-residue section by recommending Anthropic's model-general audit, `/claude-api prompt-audit`, for instructions written for models before Opus 5, and close the API-code section with the `/claude-api migrate` command covering every file it lists.
- [N16] Propose no diff at this stage: the table names each proposed change in words, and the diff is written in Stage 5 for the changes the user approved.

## Stage 4 — Decide

- [N17] Ask what to change per [N33], with these options: apply every proposed change, its label carrying the count by confidence; choose by type of change, offered only when the table holds more than one type; show the diff first; stop here with the report. Recommend applying every change when none is low confidence, and showing the diff first otherwise; where the dirty tree or missing repository from [N19] applies, say so in each applying option's description, so picking it is the go-ahead to edit anyway. Where the table holds a P01 row, ask [N48]'s question in the same call.
- [N48] For a P01 row, ask where to write the project's model and effort, saying that `claude-opus-5-5` at `medium` is this skill's recommendation and the choice is the user's: shared, in `.claude/settings.json`, which applies to everyone who opens the project and so fixes the model and effort for the whole team — recommended; or only for me, in `.claude/settings.local.json`. Cite https://code.claude.com/docs/en/model-config#adjust-effort-level in the question, and apply P01 only to the file chosen.
- [N42] Count as "every proposed change" only what this skill edits — the numbered table — and never the re-test-only, already-decided, unclear, out-of-scope or older-residue items.
- [N43] When the user chooses by type, ask one multi-select question per [N33] listing only the types present — remove, add, setting (the project's model and effort, an agent's or skill's effort, or a model pin), rewrite — each with its count and the table numbers it covers; a P01 row in the chosen set goes to the file picked per [N48].
- [N44] When the table is empty, skip the question and go to the close in [N45], since there is nothing to decide.
- [N18] In a headless run, where no one can answer, change nothing: end with the report and the close in [N45], with Stages 4 and 5 marked skipped.

## Stage 5 — Apply, verify, close

- [N30] Before removing any text, search the root for the exact string, and where a test, hook or script matches it, leave the text and name that dependency in the closing message.
- [N20] Apply exactly the approved set and nothing beside it, and edit no file Stage 1 marked read-only — name it and its proposed change for the user to make where it is produced.
- [N21] When the user chose to see the diff first, show the diff of every proposed change in the chat without editing any file, then ask per [N33] whether to apply all of it, choose by type, or stop.
- [N22] Re-scan every edited file against the pattern table after applying, and confirm that no instruction protected by [N12] was removed.
- [N24] Append the decision to the report file before the first edit, then each change as it is applied and the verification result, so the report records what the audit changed and not only what it found, and [N47] can resume from the last recorded edit.
- [N45] Close every run the same way, whether it was cancelled at the plan, stopped at the report, or applied changes: the final checklist with each stage marked done or skipped; the files edited and every approved change not applied, with the reason; where the audit wrote report files under `.claude/audits/`, that they are untracked and whether to keep, commit or delete them is the user's call; and one recommended next step.
- [N23] Where the audit ran, make that next step re-running the project's own evals, or a short effort sweep at `low`, `medium` and `high`, since the guide's advice is a starting point that the project's own measurements confirm.
- [N14] Where this session can publish an artifact, offer in the close to publish the report as one for sharing, and publish only if the user accepts.

## Sources

- Prompting Claude Opus 5.5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
- Migration guide, Opus 5 → Opus 5.5: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-5
- Prompting Claude Opus 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
- Claude Code effort levels: https://code.claude.com/docs/en/model-config#adjust-effort-level
- Anthropic's Claude API skill, whose `migrate` and `prompt-audit` subcommands this audit hands off to: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
