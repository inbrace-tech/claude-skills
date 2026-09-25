---
name: audit-opus-5-5
description: Audit a project's Claude Code instruction surface (CLAUDE.md, rules, agents, skills, settings, and any Claude API code) for what changes when moving from Claude Opus 5 to Claude Opus 5.5 — instructions that no longer help, instructions that now backfire, and gaps the new model's behavior opens. Asks before each costly stage with its estimated cost, reports in the chat, asks what to change with a recommendation, then applies only what was approved.
argument-hint: "[path]"
disable-model-invocation: true
---

# Audit a Claude Code setup for the move from Opus 5 to Opus 5.5

**This skill covers one model transition, Claude Opus 5 → Claude Opus 5.5, and nothing older.** Every pattern it flags comes from Anthropic's official guides for that transition, cited in [Sources](#sources). An instruction that was already outdated on Opus 5 is reported as older residue and left alone.

**It has three jobs, and every stage below serves one of them.** Be transparent before spending anything: show the plan, the cost and the options, and let the user choose. Explain what it found in the chat, plainly enough that the user understands each change without opening a file. Ask what to do, with a recommendation, and change nothing the user did not approve.

**While it runs, the chat carries only progress and the decisions taken with the user, who should read as little as possible to decide.** Reference material — coverage, what was not audited, older residue, counts by confidence — goes to the report file and the close.

## Throughout the run

- [N32] Before the first tool call, show the run's checklist in the chat as plain text, and show it again, updated, at the start of every stage, so the user always sees where the run is and what comes next. Use this form, translated per [N34], marking each stage `[x]` done, `[>]` current, `[ ]` pending or `[-]` skipped, and never depend on a task-list tool, which not every session has:

<checklist>

```text
Opus 5 → 5.5 audit
  [x] 1. Plan: list the files, estimate the cost, confirm
  [>] 2. Audit: read in batches, record and verify findings
  [ ] 3. Report: explain the findings here in the chat
  [ ] 4. Decide: you choose what to change
  [ ] 5. Apply: edit, verify, close
```

</checklist>

- [N33] Ask every question the run needs through `AskUserQuestion`, with a recommended option first and at most four options per question, splitting a choice with more into several questions of the same call; where that tool is not available, write the same question in the chat as a numbered list of options with the recommendation marked, end the turn, and change nothing until the user answers.
- [N34] Write the chat, every question and every file under `.claude/audits/` — the findings file, the report and the brief shared with the agents per [N40] and [N53] — in the user's language — the language of their messages, or the session's configured language — translating the headings of every template here, and keep quoted text, file paths, pattern ids and commands exactly as they are.
- [N35] Report progress in the chat as the audit advances, counted in batches whatever the run mode: one line when each batch finishes, or when an auditor returns with the batches it covered, naming how many batches of the total are done and how many findings they added.
- [N49] Ask for approval per [N33] before each costly step, even for a single batch: before reading the first batch ([N39]), before applying changes ([N17]) and before any agent is started — the auditors of [N40] and the verifier of [N53] are approved with the [N39] answers whose estimate includes them. In each question, separate the fixed cost already paid when the skill loaded from the step's marginal cost and the total expected to the end of the run, each labelled "tokens of context (estimate)". In the first gate's footer, say that the agents' estimates already count the cache re-reads of their own round trips, so the `subagent_tokens` the harness reports should fall within them, and that the billed total of this session's own round trips usually comes to 3–5× its tokens of context (measured: about 4×), because every round trip re-reads the context from cache.
- [N50] Record each approved gate in the report file with the estimate that was shown, so the report shows that every spend was shown and approved; a gate approved after Stage 3 — the [N17] and [N48] answers, applying changes — goes into the decision section [N24] appends, so the trail reads as one.
- [N47] After an interruption — an API error, a resumed or compacted session — read the findings file and the report file on disk, reprint the checklist with the stage the run was in, say where it stopped, and continue from the last batch the findings file records or the last edit the report records, without redoing finished work.

## Stage 1 — Plan: list, estimate, confirm

- [N01] Take the path argument as the audit root, or the current project root when none is given, and state it in the plan without stopping to ask.
- [N02] List every file that shapes model behavior under the root: `CLAUDE.md`, `CLAUDE.local.md` and `AGENTS.md` with every file they import through `@path`; the Markdown files under `.claude/rules/`, `.claude/agents/`, `.claude/skills/` and `.claude/commands/`; `.claude/settings.json` and `.claude/settings.local.json`; and any source file that calls the Claude API, found by searching code files — not prose — for `output_config`, `budget_tokens`, `tool_choice` and a `thinking` request parameter.
- [N36] Leave out of the audit what is not instruction text — JSON or YAML data beside a skill, third-party reference material and licenses, scripts and hooks that do not call the Claude API — and name each group with its size in the plan under "Not audited (not instructions for the model)", never "excluded", which reads as deleted.
- [N37] Read the user's `~/.claude/settings.json` as context for explaining pattern P01 only, never as an audit target or a file to edit, since it sits outside the root.
- [N03] Name `.claude` explicitly in every search, or pass `--hidden` to `rg`, because `rg` skips dot-directories when it walks from `.` and returns zero results with no error.
- [N04] Mark as read-only every listed file that is gitignored — except `.claude/settings.local.json`, which is personal by design — installed by a plugin, or reached through a symlink leading outside the root, since an edit to such a file is overwritten by the tool that produced it or lands in another project; list a file reached through a symlink inside the root once, under its real path, and name the link beside it.
- [N38] Search the listed files, and the project's decision records outside the inventory — `docs/adrs/`, `docs/**/decisions/`, `docs/audits/` and similar — for an existing Opus 5.5 evaluation: a section, skill, decision record or rule that says what the project kept, changed or declined for Opus 5.5. Read the project's auto memory too, as context and never to edit — `~/.claude/projects/<project>/memory/`, or the directory `autoMemoryDirectory` names — since it sits outside the root; in a session running in a git worktree, the project's memory sits under the main checkout's key, not the worktree's, so find the main checkout with `git rev-parse --path-format=absolute --git-common-dir` and read that checkout's memory. Note where the evaluation is, since [N31] depends on it, and never state that no record exists without having searched those places.
- [N19] Check `git status` and whether the root is a git repository, and state the result in the plan, since an audit's edits are easiest to review and revert as one change on a clean branch.
- [N05] Measure the listed files and the groups not audited before reading any of them, estimate the listed files' tokens as bytes divided by four, and estimate the audit stage's marginal cost as a range from that figure to three times it, since reading adds overhead to what the files weigh. Count the fixed cost apart, already paid once the skill loads, in two parts shown summed, as in "fixed: ~30–40k from the skill + ~38k from the project memory": the skill's own, about 30,000–40,000 tokens — its body, the skill list and system reminders the session injects, and the round trips of its questions — and the project memory the session loaded, `CLAUDE.md`, `CLAUDE.local.md` and `AGENTS.md` with their `@path` imports, measured as bytes divided by four. Label every figure "tokens of context (estimate)":

<measure>

```bash
wc -c <every file from the inventory>
wc -c <every file in each group not audited> | tail -n 1
wc -c CLAUDE.md CLAUDE.local.md AGENTS.md <every file they import through @path>
```

</measure>

- [N06] Plan the audit as batches of at most 30,000 estimated tokens, grouping files that belong together — a `CLAUDE.md` with its imports, one agent with the skills it names — split a group larger than one batch into consecutive batches and say so in the plan, and read a single file larger than one batch in line ranges small enough for one read each.
- [N56] Count the batches per area, never over the whole inventory: split each area into the contiguous parts of about 150,000 estimated tokens that [N40] gives one auditor each, count each part's batches as its tokens divided by 30,000, rounded up, and sum them per area, since no batch spans two areas or two parts.
- [N07] Show the plan in one short message before the question in [N39]: the updated checklist, the root, the git state, and these two Markdown tables, translated per [N34]. The first has one row per area — memory files with their imports, rules, agents, skills and settings, plus commands and Claude API code when the inventory holds them — with its batch count per [N56], and a last row for what is not audited (not instructions for the model), with its total and the reason; its Audited column reads yes, "full scope only" for an area the reduced scope leaves out, or no. The second has one row per combination of scope and run mode the [N39] questions offer, plus the quick sweep, marks the recommended combination with ★, writes each batch count as "~N or more", the sum of the per-area counts of [N56] for the areas the option reads, since grouping files per [N06] packs fewer tokens into each batch than the estimate assumes, gives each row the time of [N54], and is followed by the ★ line with the reason and the footnote with the fixed cost from [N05] and the billed-cost sentence of [N49]:

<plan_tables>

```markdown
| Area | Files | Tokens* | Batches | Audited |
|---|---|---|---|---|
| Memory + imports | <n> | ~<k> | ~<n> | yes |
| Rules | <n> | ~<k> | ~<n> | yes |
| Agents | <n> | ~<k> | ~<n> | yes |
| Skills | <n> | ~<k> | ~<n> | full scope only |
| Settings | <n> | ~<k> | ~<n> | yes |
| Not audited (not instructions for the model) | <n> | ~<k> | — | no — <reason> |

| Option | Batches | Cost* | Estimated time | Left out |
|---|---|---|---|---|
| ★ <scope>, <run mode> | ~<n> or more | ~<k>–<k> | ~<minutes> | <what it does not read, or nothing> |

★ recommended: <reason>
\* tokens of context, estimate, verifier included; fixed cost already paid: ~<k> from the skill + ~<k> from the project memory. The agents' figures already count their cache re-reads, so `subagent_tokens` should fall within them; this session's billed total usually comes to 3–5× its own figures (measured: about 4×), because every round trip re-reads the context from cache.
```

</plan_tables>
- [N39] Before reading the first batch, always ask per [N49], even when the plan has a single batch, in one `AskUserQuestion` call with two questions, after the two tables of [N07]. The first question is the scope, offering only the pertinent options: full scope; reduced scope — memory files and their imports, rules, agents and settings — only when it saves at least one batch, with its own estimate and a warning that it leaves out the skills, where most text tuned for Opus 5 usually lives; the quick sweep of [N51]; and cancel, which goes straight to the close in [N45]. The second question is the run mode — in this session, or in parallel agents per [N40] — asked only when the plan has more than one batch and [N40]'s agent is available, and saying that the quick sweep always runs in this session; without it, the run is in this session, and where the agent is unavailable or the project forbids it, the first question says so. Each scope option names what it reads — files and batches — its marginal cost and the total expected to the end; the parallel-agents option finishes sooner and costs more, and states the number of auditors and waves from [N40], that they and the verifier of [N53] run on Opus 5.5 at `medium` effort, and the base context each one loads on start — the brief, estimated as bytes divided by four, and not the project memory, which those agents omit, except on Claude Code older than v2.1.271, where each also loads the project memory measured in [N05] with its rules — per agent and in total, at that tier, plus the tier warning of [N55] where it applies. Write the ★ and its reason in the description of the recommended option of each question, per [N46].
- [N40] In parallel-agents mode, once the user approved it per [N49], start one `batch-auditor` per area — memory files with their imports, rules, agents, skills, commands, settings and Claude API code, each only when the inventory holds it — and split an area above about 150,000 estimated tokens into contiguous parts of up to about 150,000, each with its own auditor; give each auditor the batches of its area, which it audits in sequence, so a run starts about six to eight auditors. Keep the auditors running at once below Claude Code's concurrent subagent limit — 20 by default, or the number in `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` — and dispatch the rest in waves when there are more. Name the agent as the Agent tool lists it — `inbrace-config:batch-auditor` when this skill runs from its plugin, `batch-auditor` when it was copied — which pins Opus 5.5 at `medium` effort with read-only tools and loads no `CLAUDE.md`, and pass no `model` in the call, since the agent sets its own; where the Agent tool does not list it, or the project's `CLAUDE.md` or hooks forbid it, use no auditors. Follow the project's own dispatch conventions — brief format, required fields — where its `CLAUDE.md` or hooks require them. Write one brief, shared with the auditors and the verifier, in one file under `.claude/audits/` that each agent reads, or inline: the pattern table, the `<line_format>` of [N09], the Stage 2 norms, and the project facts they depend on — the evaluation from [N38], the model pins, the read-only files; give each auditor its batches and the brief, and have it return its lines as text, writing no file.
- [N57] Before the gate of [N39], read the `PreToolUse` entries whose matcher covers `Agent` in the project's `.claude/settings.json` and `.claude/settings.local.json`, with the scripts they run, and note whether any of them may require `model` in an Agent call, so [N55] applies from the gate and a refusal does not first appear at dispatch.
- [N55] Where the project's hooks refuse an Agent call that passes no `model` — seen when reading them per [N57], or when a call is refused — pass `model: "opus"`, and say in the gate, or in the chat before retrying when the refusal comes at dispatch, that `opus` resolves to Opus 5.5 on the Anthropic API unless this session runs on another Opus model, whose exact version the agent then gets, and that the agent's `medium` effort may not be kept.
- [N54] Estimate each option's time from measured runs: in this session, about one to two minutes per batch; in parallel agents, the time of the slowest auditor of each wave, about one to two minutes per wave, since the verifier starts only after the slowest auditor finishes; and in every mode, plus about two to three minutes for the verifier of [N53].
- [N46] Recommend one option in each question of [N39] and state why in its description: in the scope question, full scope up to ten batches, and above that the reduced scope when it saves at least one batch; in the run-mode question, parallel agents when the recommended scope still has more than ten batches, and this session otherwise; never recommend the quick sweep with ten batches or fewer.
- [N51] Offer the quick sweep as an option of the scope question in [N39], with a cost of about 50,000–150,000 tokens of context (estimate) and its limit stated in the option: it runs in this session, searches the root for the signals in the pattern table and reads only the lines around each match, so it catches the lexical patterns — P01–P06 and P14–P20 — and misses those that need the surrounding context, P07 and P09–P12. Record its findings per [N09], check them per [N53], and say in the report and the close that the run was a quick sweep.
- [N52] Offer at every gate only the options this skill defines, and never improvise another; where the options of one choice exceed four, split them into questions of the same call per [N33], rather than a numbered list.

## Stage 2 — Audit in batches

- [N08] Audit one batch at a time, and after each batch — or each auditor's return, batch by batch — append its findings to the findings file under a line naming the batch, or that line alone when the batch was clean, before reading the next one, so no finding depends on file contents still sitting in context and [N47] can tell which batches are done.
- [N09] Write the findings file at `.claude/audits/opus-5-5-<YYYY-MM-DD>.findings.md` under the root, one line per finding in the `<line_format>` below, which this skill alone defines and the brief of [N40] carries to every agent, whether the batches run in this session, in parallel agents or as the quick sweep; the pattern id comes from the table below.

<line_format>

One line per finding, its six fields separated by ` | `:

`<file>:<line> | <pattern id> | <status> | "<quoted text>" | <confidence> | <note>`

- `<file>` is the path relative to the audit root, and `<line>` the line the quoted text starts on.
- `<pattern id>` is the id of one row of the pattern table, such as `P07`.
- `<status>` is `change`, `already decided`, `older residue` or `unclear` in a batch's lines; the verifier's final list may also use `re-test` and `discarded`.
- `<quoted text>` is the text exactly as it appears in the file, trimmed to the words that match the row.
- `<confidence>` is `high`, `medium` or `low`.
- `<note>` is the proposed change in a few words for `change` and `re-test`, where the project records the decision for `already decided`, the reason for `unclear` and `discarded`, and `-` for `older residue`.

A batch with no finding is recorded as this line alone:

`clean`

</line_format>

- [N53] Once the last batch is recorded and there is at least one raw finding, start the `finding-verifier` in every run mode — this session, parallel agents and the quick sweep — as the Agent tool lists it, `inbrace-config:finding-verifier` from the plugin or `finding-verifier` when it was copied, passing no `model` except per [N55], with the brief of [N40] — written now when no auditor ran — which also carries the rules of [N12], [N31] and [N41], and every raw finding line. It tries to refute each finding, corrects what needs correcting and returns the final list in the `<line_format>`, editing no file; append that list to the findings file under a line reading "Final list", and build the report and the chat from it without redoing its triage. Where the Agent tool does not list the verifier, or the project forbids it, make a short adversarial pass in this session with the same rules — reopen each cited line, drop or reclassify what the text does not support — write the result as the final list, and say in the report that no verifier ran.
- [N10] Check every batch against each row of the pattern table below, and record a finding only where the row's signal is present and its "applies when" condition holds for that file; a file pinned to a model other than Opus 5 or Opus 5.5 gets no finding from any row about model behavior.
- [N41] Record a finding only where the matched text instructs the model how to behave, and skip a signal word that appears in project prose about something else — a PR's scope, a delegation in the architecture, a checklist in a runbook.
- [N11] Record an instruction that belongs to a transition older than Opus 5 — explicit verification steps, "delegate more" guidance, severity filters in review prompts — as a line with the status `older residue` and no proposed change, since this audit's evidence covers the Opus 5 → 5.5 transition alone.
- [N12] Never propose removing a safety rule, a confirmation step for a destructive or irreversible action, a permission boundary, a project fact, or an instruction the file says exists because of a measured failure; record anything whose purpose you cannot determine with the status `unclear` rather than proposing a deletion.
- [N25] Record every finding in Claude API code — the rows whose "applies when" is API code — with the hand-off `/claude-api migrate <files> to claude-opus-5-5` as its proposed change, and keep it out of the set this skill edits, since Anthropic's `claude-api` skill migrates request code with the right syntax for each SDK language and platform.
- [N26] Treat the `description` in a skill's or agent's frontmatter as routing text, where calibrated urgency is legitimate, and apply the rows about wording only to text that shapes behavior.
- [N27] Grade confidence high when the guide or the Claude Code documentation states the change or the old form fails, medium when the guide says to consider or re-test it, and low when the finding rests on your own inference.
- [N28] Report a batch, or the whole audit, as clean when no row applies, and never stretch a row to fill the report.
- [N31] Record as "already decided", with no proposed change, any finding the project states it already evaluated for Opus 5.5 — using the evaluation [N38] found — citing where it says so; record a decision the project made once for every file as one line naming the files it covers, and prefer "already decided" over "older residue" when both fit.

<patterns>

| Id | Pattern | Signal | Applies when | Proposed change |
|---|---|---|---|---|
| P01 | Project not set to Opus 5.5 at `medium` | the project, local and managed settings leave `model` or a top-level `effortLevel` unset | the project runs on Opus 5 or Opus 5.5, and no settings file already sets an effort level with a model that resolves to Opus 5.5 — a level saved for that model counts as already set, such as `modelSettings["claude-opus-5-5"]` with an effort in the user's `~/.claude/settings.json`, where `/effort` and the `/model` picker save it, but a top-level `effortLevel` in the user's `~/.claude/settings.json` does not count as already set, since it does not apply to Opus 5.5; resolve aliases as the Claude Code docs do: `opus`, `opus[1m]` and `default` are Opus 5.5 on the Anthropic API, Claude Platform on AWS, Amazon Bedrock and Google Cloud, but other models on Microsoft Foundry, and `ANTHROPIC_DEFAULT_OPUS_MODEL`, when set, decides what `opus` means; record it once per project, on `.claude/settings.json` | Add `"model": "claude-opus-5-5"` and `"effortLevel": "medium"` to the project settings, in the file the user picks per [N48]; where the user's current model — in the user's, project or local settings, or this session's — carries the `[1m]` suffix, such as `opus[1m]`, propose `"model": "claude-opus-5-5[1m]"` instead, and say in one line that on the Anthropic API Opus 4.7 and later already run with the 1M window without the suffix, which keeps that context choice on other providers and plans (https://code.claude.com/docs/en/model-config#extended-context). This is the skill's recommendation, not the guide's rule: Opus 5.5's `medium` matches or beats Opus 5 at `high` and costs less, and a top-level `effortLevel` in project settings applies to every model. Explain from [N37] what the user's own settings do today: a top-level `effortLevel` in `~/.claude/settings.json` does not count for Opus 5.5 while a level saved under `modelSettings["claude-opus-5-5"]` does (https://code.claude.com/docs/en/model-config#adjust-effort-level). Type setting. High confidence when the project sets neither `model` nor `effortLevel` and the user relies on a top-level `effortLevel` in `~/.claude/settings.json`, which Opus 5.5 ignores; medium otherwise. |
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
| P20 | Agent still pinned to Opus 5 | `model: claude-opus-5` in an agent's or skill's frontmatter, or in settings | instruction files, unless the project records the pin as deliberate per [N31] | Move the pin to `claude-opus-5-5` and set its effort as P21 explains — `effort: medium`, or no `effort:` so the file inherits the session's level — or record why it stays. Medium confidence, since a pin can be deliberate. |
| P21 | Agent or skill on Opus 5.5 carrying an effort left from Opus 5 | `model: claude-opus-5-5` with an `effort:` in the frontmatter, in a file whose pin came from Opus 5 — the git log shows the `effort:` predates the model change, or the project records no re-derivation of it | agent and skill files; a file with no `effort:` gets no finding, since it inherits the session's level | Re-test one level lower: Opus 5.5's `medium` matches or beats Opus 5 at `high`. List it under "Re-test only, no edit". Medium confidence. |

</patterns>

## Stage 3 — Report: explain it in the chat

- [N13] Write the full report to `.claude/audits/opus-5-5-<YYYY-MM-DD>.md` under the root, opening with the scope, the files read, the files not audited (not instructions for the model) or marked read-only, the batch plan, every approved gate with its estimate per [N50] and a pointer to the decision section that holds the gates approved after this stage, and the counts by pattern and by confidence, followed by every finding of the final list grouped by pattern, the older residue, what the verifier of [N53] discarded or reclassified with each reason, and every section of the chat report, each written as "none" when empty.
- [N15] Present a readable summary of the final list in the chat before the question of [N17], rendered as Markdown rather than inside a code block, in this form and order and nothing more: one line with the scope audited and the cost so far; "What I would change", the numbered table of changes, each typed as remove, add, setting or rewrite; "Why", one line per pattern found saying what changed in Opus 5.5 and what it means here; "What the verifier discarded or reclassified", the count per category — re-test, already decided, older residue, unclear, discarded — with one or two real examples and their reason; "My recommendation", one or two sentences on what to do and why; and the `/claude-api migrate` line only when there is API code. Never show a heading followed by "none" in the chat — an empty category is left out there and written in the report file, which keeps everything. Where more than fifteen changes are proposed, show the fifteen highest-impact in the table and the count per pattern for the rest:

<chat_report>

```markdown
**Opus 5 → 5.5 audit — <project>** · <scope audited> · <files> files · ~<tokens> tokens so far

**What I would change**

| # | File | Pattern | Today | Change | Type | Confidence |
|---|---|---|---|---|---|---|
| 1 | <file:line> | <Pnn> | <what it says, in a few words> | <what it becomes> | <remove/add/setting/rewrite> | <high/medium/low> |

**Why**
- <Pnn>: <what changed in Opus 5.5, in one plain sentence, and what it means here>

**What the verifier discarded or reclassified**
- <n> <category>: e.g. <file:line> — <the reason, in a few words>

**My recommendation:** <one or two sentences: what to do and why>

**API code:** /claude-api migrate <files> to claude-opus-5-5
```

</chat_report>

- [N29] In the report file, close the older-residue section by recommending Anthropic's model-general audit, `/claude-api prompt-audit`, for instructions written for models before Opus 5, and close the API-code section with the `/claude-api migrate` command covering every file it lists.
- [N16] Propose no diff at this stage: the table names each proposed change in words, and the diff is written in Stage 5 for the changes the user approved.

## Stage 4 — Decide

- [N17] Ask what to change per [N33], with these options: apply every proposed change, its label carrying the count by confidence; choose by type of change, offered only when the table holds more than one type; show the diff first; stop here with the report. Give each applying option, in its description, the estimated marginal cost of applying it — the size of the files it edits plus about 5,000 tokens for the verification and the close — and the total expected to the end, per [N49]. Recommend applying every change when none is low confidence, and showing the diff first otherwise; where the dirty tree or missing repository from [N19] applies, say so in each applying option's description, so picking it is the go-ahead to edit anyway.
- [N48] For a P01 row, once the user chose an option that applies it — in [N17], [N21] or [N43] — and never in the same call as [N17], ask where to write the project's model and effort, saying that `claude-opus-5-5` at `medium` — `claude-opus-5-5[1m]` where P01 keeps the suffix — is this skill's recommendation and the choice is the user's: shared, in `.claude/settings.json`, which applies to everyone who opens the project and so fixes the model and effort for the whole team — recommended, and when the repository has a public remote, per `gh repo view --json visibility` or an equivalent check, the option warns that it fixes Opus 5.5 at `medium` for every contributor who opens the project, and says the visibility is unknown when it cannot be determined; or only for me, in `.claude/settings.local.json`. Cite https://code.claude.com/docs/en/model-config#adjust-effort-level in the question, and apply P01 only to the file chosen.
- [N42] Count as "every proposed change" only what this skill edits — the numbered table — and never the re-test-only, already-decided, unclear, out-of-scope or older-residue items.
- [N43] When the user chooses by type, ask one multi-select question per [N33] listing only the types present — remove, add, setting (the project's model and effort, or a model pin), rewrite — each with its count and the table numbers it covers; a P01 row in the chosen set goes to the file picked per [N48].
- [N44] When the table is empty, skip the question and go to the close in [N45], since there is nothing to decide.
- [N18] In a headless run, where no one can answer, change nothing: end with the report and the close in [N45], with Stages 4 and 5 marked skipped.

## Stage 5 — Apply, verify, close

- [N30] Before removing any text, search the root for the exact string, and where a test, hook or script matches it, leave the text and name that dependency in the closing message.
- [N20] Apply exactly the approved set and nothing beside it, and edit no file Stage 1 marked read-only — name it and its proposed change for the user to make where it is produced.
- [N21] When the user chose to see the diff first, show the diff of every proposed change in the chat without editing any file, then ask per [N49] whether to apply all of it, choose by type, or stop, with the cost of applying in each applying option.
- [N22] Re-scan every edited file against the pattern table after applying, and confirm that no instruction protected by [N12] was removed.
- [N24] Append the decision to the report file before the first edit, with the gates approved after Stage 3 per [N50], then each change as it is applied and the verification result, so the report records what the audit changed and not only what it found, and [N47] can resume from the last recorded edit.
- [N45] Close every run the same way, whether it was cancelled at the plan, stopped at the report, or applied changes: the final checklist with each stage marked done or skipped; the files edited and every approved change not applied, with the reason; the reference material kept out of the chat, listing only what has items — what was not audited, any file read only in part, the older residue with `/claude-api prompt-audit`, and the counts by confidence; one line on checking the cost: the agents' estimates already counted their cache re-reads, so `subagent_tokens` compares with them directly, while this session's statusline and bill add the cache re-reads of its own round trips, so those figures run higher; where the audit wrote report files under `.claude/audits/`, that they are untracked and whether to keep, commit or delete them is the user's call; where the audit ran, one line suggesting that running the skill again refines the result, that each round costs about this round's estimate, and that whether and how many times is the user's call, since nothing runs on its own; and one recommended next step.
- [N23] Where the audit ran, make that next step re-running the project's own evals, or a short effort sweep at `low`, `medium` and `high`, since the guide's advice is a starting point that the project's own measurements confirm.
- [N14] Where this session can publish an artifact, offer in the close to publish the report as one for sharing, and publish only if the user accepts.

## Sources

- Prompting Claude Opus 5.5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
- Migration guide, Opus 5 → Opus 5.5: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-5
- Prompting Claude Opus 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
- Claude Code effort levels, saved per model under `modelSettings`: https://code.claude.com/docs/en/model-config#adjust-effort-level
- Claude Code extended context and the `[1m]` suffix: https://code.claude.com/docs/en/model-config#extended-context
- Claude Code subagents, the per-invocation `model` parameter and how `opus` resolves there: https://code.claude.com/docs/en/sub-agents#choose-a-model
- Claude Code hooks, `PreToolUse` and its tool-name matcher: https://code.claude.com/docs/en/hooks#pretooluse
- The concurrent subagent limit and `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`: https://code.claude.com/docs/en/sub-agents#concurrent-subagent-limit
- Plugin agents and the frontmatter fields they support: https://code.claude.com/docs/en/plugins/components#frontmatter-fields-in-plugin-agents
- Anthropic's Claude API skill, whose `migrate` and `prompt-audit` subcommands this audit hands off to: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
