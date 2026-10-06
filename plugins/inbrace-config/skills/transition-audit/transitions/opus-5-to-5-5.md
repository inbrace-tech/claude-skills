---
transition: opus-5-to-5-5
title: Opus 5 → Opus 5.5
source: { name: Claude Opus 5, id: claude-opus-5, alias: opus }
target: { name: Claude Opus 5.5, id: claude-opus-5-5, alias: opus }
claude-code-floor: v2.1.280
verified: 2026-10-06
---

# Opus 5 → Opus 5.5

What the transition audit knows about moving a Claude Code setup from Claude Opus 5 to Claude Opus 5.5. The audit's stages read the blocks they name; nothing here is an instruction on its own. An instruction already outdated on Opus 5 is older residue, and is reported, not changed.

<docs>

| Role | URL | Read |
|---|---|---|
| target prompting guide | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 | whole |
| migration guide | https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-5 | the anchored section |
| what's new | https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5 | whole |
| source prompting guide | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 | on demand, to recognise text written for the source |
| Claude Code model configuration | https://code.claude.com/docs/en/model-config | sections: model-aliases, adjust-effort-level, extended-context, extended-thinking, automatic-model-fallback |

</docs>

<source_id_match>

- The source id as a string literal not followed by `-5`: `claude-opus-5`.
- The source id used as a prefix or pattern, which `claude-opus-5-5` also matches: `startsWith("claude-opus-5")`, a trailing `*` as in `claude-opus-5*`, a regular expression such as `^claude-opus-5`.

</source_id_match>

<api_signals>

Find Claude API code first by what imports the SDK — `@anthropic-ai/sdk`, `import anthropic`, `from anthropic import` — and by any project module that wraps the client, then by `messages.create`, and only then by the request tokens `output_config`, `budget_tokens`, `tool_choice` and a `thinking` request parameter, never by those tokens alone.

</api_signals>

<older_residue>

Explicit verification steps, "delegate more" guidance, severity filters in review prompts.

</older_residue>

<protected>

None beyond the audit's own rules for this transition.

</protected>

<settings_proposal>

Propose `"model": "claude-opus-5-5"` and `"effortLevel": "medium"` — `"model": "claude-opus-5-5[1m]"` where the user's current model carries the `[1m]` suffix. This is the audit's recommendation, not the guide's rule: Opus 5.5's `medium` matches or beats Opus 5 at `high` and costs less, and a top-level `effortLevel` in project settings applies to every model. The choice of file, shared or local, is the user's. Cite https://code.claude.com/docs/en/model-config#adjust-effort-level.

</settings_proposal>

<next_step>

Re-run the project's own evals, or a short effort sweep at `low`, `medium` and `high`, since the guide's advice is a starting point the project's own measurements confirm.

</next_step>

<unquoted>

Traps whose matching lines in a project ask the model to reveal its reasoning, which can stop it with a refusal when it reads or quotes them. The plan finds their lines with the pattern below and lists them in `unquoted.md`, and no stage reads or quotes those lines.

- P04 — label: reasoning requested in the reply — pattern (`grep -n -i -E`): `chain[ -]of[ -]thought|(show|include|write( out)?|give|explain|walk( me)? through|lay out|share|reveal|expose|print|output)( all| out)? (your|its)( full| complete| step[ -]by[ -]step| internal| hidden)? (reasoning|thinking|thought process|thoughts)`

</unquoted>

<traps>

### P01 — Project not set to Opus 5.5 at `medium`

- kind: setting
- area: settings
- signal: the project, local and managed settings leave `model` or a top-level `effortLevel` unset
- applies when: the project runs on Opus 5 or Opus 5.5, and no project, local or managed settings file already sets an effort level with a model that resolves to Opus 5.5; the user's `~/.claude/settings.json` never counts as already set, whether it saves a level under `modelSettings["claude-opus-5-5"]`, where `/effort` and the `/model` picker save it, or a top-level `effortLevel`, which does not apply to Opus 5.5, since the project's other developers and its CI never get that file; resolve aliases as the Claude Code docs do: `opus`, `opus[1m]` and `default` are Opus 5.5 on the Anthropic API, Claude Platform on AWS, Amazon Bedrock and Google Cloud, but other models on Microsoft Foundry, and `ANTHROPIC_DEFAULT_OPUS_MODEL`, when set, decides what `opus` means; record it once per project, on `.claude/settings.json`
- change: Add `"model": "claude-opus-5-5"` and `"effortLevel": "medium"` to the project settings, in the file the user picks per the report stage's settings question; where the user's current model — in the user's, project or local settings, or this session's — carries the `[1m]` suffix, such as `opus[1m]`, propose `"model": "claude-opus-5-5[1m]"` instead, and say in one line that on the Anthropic API Opus 4.7 and later already run with the 1M window without the suffix, which keeps that context choice on other providers and plans. This is the skill's recommendation, not the guide's rule: Opus 5.5's `medium` matches or beats Opus 5 at `high` and costs less, and a top-level `effortLevel` in project settings applies to every model. Explain, from the user's settings read as context, what the user's own settings do today: a top-level `effortLevel` in `~/.claude/settings.json` does not count for Opus 5.5 while a level saved under `modelSettings["claude-opus-5-5"]` does, on this machine only. Type setting. Medium confidence unless the project sets neither `model` nor `effortLevel` and the user relies on a top-level `effortLevel` in `~/.claude/settings.json`, which Opus 5.5 ignores.
- confidence: high
- sweep: yes
- context: user-settings
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "a top-level `effortLevel` in your user settings file doesn't count for Opus 5.5 … A top-level `effortLevel` in project, local, or managed settings, or one passed with `--settings`, applies to every model."
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#extended-context
  passage: "On the Anthropic API, Fable 5.1, Fable 5, Sonnet 5 and later, and Opus 4.7 and later run with the 1M window on every plan, including Pro."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#calibrate-effort
  passage: "in Anthropic's testing, Claude Opus 5.5 at `medium` matches or exceeds Claude Opus 5 at `high` on coding and knowledge-work evaluations"
  verified: 2026-10-06

### P02 — Thinking disabled or budgeted

- kind: hand-off
- area: api-code
- signal: `thinking: {type: "disabled"}`, `budget_tokens`
- applies when: API code
- change: Hand off per the API hand-off rule. Both return a 400 on Opus 5.5 at every effort level; remove them and use `low` effort where latency matters.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#thinking-cant-be-disabled
  passage: "On Claude Opus 5.5, thinking is always on: a request that sets `thinking: {"type": "disabled"}`, or a manual budget with `thinking: {"type": "enabled", "budget_tokens": N}`, returns a 400 `invalid_request_error`."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#prompts-written-for-thinking-disabled
  passage: "Start at `low` effort and measure."
  verified: 2026-10-06

### P03 — "Don't think" rules

- kind: change
- area: memory, rules, agents, skills, commands
- signal: "do not think", "don't reason", "skip thinking"
- applies when: any instruction file
- change: Remove. Thinking is always on, and such rules increase internal-tag leakage.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5#running-with-thinking-disabled
  passage: "If your system prompt contains a rule instructing the model not to think or not to reason, remove it; that kind of instruction increases tag leakage."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#prompts-written-for-thinking-disabled
  passage: "With thinking always on, check whether you still need the instruction, and remove the no-thinking rule either way."
  verified: 2026-10-06

### P04 — Reasoning written into the response

- kind: change
- area: memory, rules, agents, skills, commands
- signal: "show your reasoning in the answer", "write out your chain of thought"
- applies when: any instruction file
- change: Remove. It can be declined with the `reasoning_extraction` refusal. Read summarized thinking blocks instead.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#prompts-written-for-thinking-disabled
  passage: "If your prompt asked the model to write out its reasoning in the response as a substitute for thinking, remove that instruction and read the reasoning from summarized thinking blocks instead"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#safeguard-refusals
  passage: "Requests that push the model to reproduce its internal reasoning in the response text may be declined with the `reasoning_extraction` category"
  verified: 2026-10-06

### P05 — Thinking-disabled mitigation

- kind: re-test
- area: memory, rules, agents, skills, commands
- signal: "you may say a brief sentence first… do not include internal or system XML tags"
- applies when: the project ran Opus 5 with thinking off
- change: Re-test, then remove if nothing regresses. It addressed artifacts that appear only with thinking disabled.
- confidence: medium
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#prompts-written-for-thinking-disabled
  passage: "Both address artifacts that appear on Claude Opus 5 only when thinking is disabled. With thinking always on, check whether you still need the instruction"
  verified: 2026-10-06

### P06 — "Think carefully" in chat prompts

- kind: optional
- area: memory, rules, agents, skills, commands
- signal: "think carefully before answering", "take your time"
- applies when: chat applications
- change: Consider removing. Effort is the control, and removing the line made replies start sooner without a quality drop in Anthropic's testing.
- confidence: medium
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#thinking-instructions-in-chat-system-prompts
  passage: "consider removing them for Claude Opus 5.5 … removing such a line made replies start sooner, with no clear decline in the quality of the reply"
  verified: 2026-10-06

### P07 — Opus 5 tuning instructions

- kind: re-test
- area: memory, rules, agents, skills, commands
- signal: conciseness, over-verification, scope, narration-cadence or correction-narration instructions written for Opus 5; a statement of what Opus 5 can do, such as the capability context of a tier skill — how well it coordinates subagents, how conservative its review prompts must be, a measurement left open on it; a rule whose stated reason cites Opus 5 guidance, an Opus 5 tier skill or one of its norms, even where the citation still resolves
- applies when: any instruction file, one line per norm or paragraph of a tier skill written for Opus 5; recognise text written for Opus 5 that names no model by finding its words in the cached Opus 5 guide with Grep, since the guide's own sentences on conciseness, document length and scope are what such rules copy
- change: Keep as the starting point and mark for re-testing. They may no longer be needed; do not delete them on this audit's word alone. Re-derive a capability statement from the Opus 5.5 guide's capabilities, re-run a measurement it leaves open on Opus 5.5, and re-anchor a rule's stated reason on the Opus 5.5 guide or a reason that names no model, since the session that reads it now runs Opus 5.5.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#capability-improvements
  passage: "It also sustains long-running autonomous work better than Claude Opus 5 … Early testers also reported stronger code review, with more bugs caught than on Claude Opus 5 and fewer false alarms"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
  passage: "Existing Claude Opus 5 prompts should perform well without changes, and the patterns in Prompting Claude Opus 5 remain a reasonable starting point."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#recommended-changes
  passage: "Instructions tuned for Claude Opus 5's behavior may no longer be needed"
  verified: 2026-10-06

### P08 — Silent agentic turns

- kind: hand-off
- area: api-code
- signal: a client or harness that renders only `text` blocks
- applies when: API code, custom harnesses
- change: Set `thinking.display: "updates"`. On Opus 5.5 notes between tool calls arrive as thinking blocks, empty by default.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#user-facing-progress-updates
  passage: "their text is empty at the default `thinking.display`, so a client that renders only `text` blocks can look silent during a long agentic turn"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#text-between-tool-calls
  passage: "`"updates"` (beta, `thinking-display-updates-2026-08-18` header) returns the progress updates while reasoning stays hidden"
  verified: 2026-10-06

### P09 — No update cadence

- kind: optional
- area: agents, skills, commands, memory
- signal: long human-in-the-loop agentic work with no guidance on updates
- applies when: agent and orchestrator prompts, unless the file points to where the project states its update guidance and that guidance, and the reason it gives, are not written for Opus 5; a pointer to Opus 5 guidance is P07's
- change: Add a cadence, for example a one-line intent before the first tool call and a short recap at the end.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#user-facing-progress-updates
  passage: "a one-line statement of intent before the first tool call and a short recap at the end, say so in the system prompt … This helps most in human-in-the-loop work."
  verified: 2026-10-06

### P10 — Unattended runs without a continuation plan

- kind: change
- area: agents, skills, commands, ci, api-code
- signal: background or headless agents, no to-do tracking; an API agent loop that runs with no user to answer and ends the task on a turn that ends with text, `stop_reason: "end_turn"`
- applies when: unattended agents only — background or headless Claude Code runs, and API agent loops such as a scheduled or batch job; never a loop a person answers
- change: Add a checklist the model updates, auto-continue only when items are open and no blocker is stated, and cap continuations at 2–3. Opus 5.5 sometimes ends a turn with a text update instead of a tool call. In API code, hand off per the API hand-off rule, naming the loop's exit on a text-only end of turn.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#unattended-agentic-runs
  passage: "some of those updates end the turn with text rather than a tool call"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#unattended-agentic-runs
  passage: "Keep the task's parts in a checklist the model updates, such as a to-do tool or a file. If a turn ends with items still open and no blocker stated, send a short user message naming them"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#unattended-agentic-runs
  passage: "stop after two or three automatic continuations on the same task rather than repeating them indefinitely"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#unattended-agentic-runs
  passage: "An unattended agent loop that treats such a turn as the end of the task stops running there."
  verified: 2026-10-06

### P11 — Multi-app agents that act without looking

- kind: change
- area: agents, skills, commands
- signal: an agent or skill whose tools or steps span two or more of email, documents, spreadsheets and CRM, that creates or changes records, with no instruction to look through the relevant sources first
- applies when: multi-app automation that writes to those apps; a specific brief does not clear it, since the guide's point is that what a task depends on often sits in a source the request does not name
- change: Add the guide's instruction to explore the relevant sources before acting.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#explore-context-in-multi-app-workflows
  passage: "Claude Opus 5.5 tends to get to work quickly, and on loosely specified tasks it helps to tell the model to look through the relevant sources before acting."
  verified: 2026-10-06

### P12 — Multi-agent runs without time signals

- kind: optional
- area: agents, skills, commands, api-code
- signal: a lead agent delegating to subagents
- applies when: multi-agent harnesses
- change: Consider an elapsed-time line against a budget in each message back to the model.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#time-signals-for-multi-agent-harnesses
  passage: "have your harness add a short line at the end of each message it sends back to the model giving the elapsed time against that budget, in seconds"
  verified: 2026-10-06

### P13 — Chat that re-examines settled answers

- kind: optional
- area: memory, rules, agents, skills, commands
- signal: multi-turn chat with slow follow-ups
- applies when: chat, not agentic work
- change: Consider the guide's two-sentence "treat that answer as done" instruction.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#thinking-instructions-in-chat-system-prompts
  passage: "If you would rather the model treat earlier answers as settled, add two sentences at the end of the system prompt"
  verified: 2026-10-06

### P14 — Unmarked pasted content

- kind: change
- area: api-code
- signal: an application forwarding text users pasted
- applies when: applications you build
- change: Wrap pasted blocks in `<pasted_content id="…">` tags and add the guide's system-prompt note.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#mark-pasted-text-in-user-messages
  passage: "Wrap each pasted block in an opening and a closing tag that both carry the same short random ID, generated by your application … Then add this note to your system prompt"
  verified: 2026-10-06

### P15 — Visual-input scaffolding

- kind: re-test
- area: memory, rules, agents, skills, commands
- signal: forced cropping, OCR passes, "zoom before reading the chart"
- applies when: vision workloads
- change: Re-test. Opus 5.5 reads charts and diagrams natively; crop tools still help on the densest inputs.
- confidence: medium
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#tools-for-complex-visual-inputs
  passage: "re-test whether you still need scaffolding you built for visual inputs on earlier models … a cropping tool alone still helps"
  verified: 2026-10-06

### P16 — Vague design direction

- kind: change
- area: memory, rules, agents, skills, commands
- signal: "avoid a generic AI look", "make it modern"
- applies when: frontend work
- change: Replace with the specific default patterns to avoid.
- confidence: medium
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#frontend-design-defaults
  passage: "a general instruction such as "avoid a generic AI look" mostly swaps one default for another. It responds well to instructions that name specific patterns to avoid"
  verified: 2026-10-06

### P17 — Forced tool use

- kind: hand-off
- area: api-code
- signal: `tool_choice` of type `any` or `tool`
- applies when: API code
- change: Hand off per the API hand-off rule. Forced tool use returns a 400; the fix is `auto` with `strict: true` and a check that the call happened, or structured outputs.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#forced-tool-use-is-not-supported
  passage: "`tool_choice` set to `{"type": "any"}` or `{"type": "tool", "name": "..."}` returns a 400 `invalid_request_error`"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#forced-tool-use-is-not-supported
  passage: "keep `tool_choice: {"type": "auto"}` and set `strict: true` with strict tool use, or move the schema to structured outputs"
  verified: 2026-10-06

### P18 — Old computer-use tool

- kind: hand-off
- area: api-code
- signal: `computer_20251124`
- applies when: API code on the Claude API or Google Cloud
- change: Hand off per the API hand-off rule. There the old tool returns a 400 and the fix is `computer_toolset_20260801`; on Amazon Bedrock it still works, so record no finding for Bedrock-only code. Record a second line on the agent loop that runs the tool's calls — where it reads the action from `input.action`, handles only the first `tool_use` block, or returns results without `toolset_name` — since the toolset changes the loop as well as the declaration.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#computer-20251124-is-not-supported
  passage: "On the Claude API and Google Cloud, Claude Opus 5.5 supports only the toolset: a request that declares a `computer_20251124` tool returns a 400 `invalid_request_error`."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#computer-20251124-is-not-supported
  passage: "On Amazon Bedrock, the earlier `computer_20251124` tool continues to work on Claude Opus 5.5 as it does on Claude Opus 5, so no change is needed there."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#computer-use-toolset
  passage: "In your agent loop, handle member `tool_use` blocks (the action is the block's `name`, not `input.action`), several of them per turn, and echo `toolset_name` on every result."
  verified: 2026-10-06

### P19 — History edited between requests

- kind: hand-off
- area: api-code
- signal: code that rewrites `system`, `tools` or earlier messages mid-session
- applies when: API code that builds `messages` itself
- change: Hand off per the API hand-off rule. Keep history append-only: edits before a thinking block invalidate it, and for accounts created on or after 2026-08-31 return a 400.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#thinking-blocks
  passage: "Keep the conversation append-only (no edits to the `system` prompt, `tools`, or earlier messages mid-conversation) so the blocks stay valid"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#thinking-blocks
  passage: "for accounts created on or after August 31, 2026, 00:00 UTC, replaying a thinking block after such an edit returns a 400 error by default"
  verified: 2026-10-06

### P20 — Agent still pinned to Opus 5

- kind: change
- area: memory, rules, agents, skills, commands, hooks, settings, ci
- signal: `model: claude-opus-5` in an agent's or skill's frontmatter, in settings, or in a launch command or dispatch recipe — a `--model` flag in a CI workflow or a `claude -p` recipe, a `model` argument to an Agent call — which instructs how a session or agent starts even when written as prose
- applies when: instruction files, workflows and scripts that launch a session, unless the project records the pin as deliberate as already decided
- change: Move the pin to `claude-opus-5-5` and set its effort as P21 explains — `effort: medium`, or no `effort:` so the file inherits the session's level — or record why it stays. Where a launch sets no effort — no `--effort`, no `CLAUDE_CODE_EFFORT_LEVEL`, no project effort setting — say that Opus 5 starts at `high` and Opus 5.5 at `medium`, so the move drops a level for everyone who runs it.
- confidence: medium
- sweep: yes
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "The model's default effort: `high` on every model that supports effort, except that Opus 5.5 and Sonnet 5.5 default to `medium`"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/sub-agents#choose-a-model
  passage: "Full model ID: use a full model ID such as `claude-opus-5-5` or `claude-sonnet-5`."
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
  passage: "Effort level when this subagent is active. Overrides the session effort level. Default: inherits from session."
  verified: 2026-10-06

### P21 — Agent or skill on Opus 5.5 carrying an effort left from Opus 5

- kind: re-test
- area: memory, rules, agents, skills, commands
- signal: `model: claude-opus-5-5` with an `effort:` in the frontmatter, in a file whose pin came from Opus 5 — the git log shows the `effort:` predates the model change, or the project records no re-derivation of it; a line in an instruction file that states the effort of a named agent or skill whose own `effort:` draws this finding, such as a row of a model-and-effort routing table
- applies when: agent and skill files, and the memory, rules and command files that restate their effort; a file with no `effort:` gets no finding, since it inherits the session's level, and neither does a line that names such a file or one whose effort a recorded eval re-derived
- change: Re-test one level lower: Opus 5.5's `medium` matches or beats Opus 5 at `high`. For a line that mirrors a file's effort, record one finding per line, its note naming the mirrored `file:line`, re-test it together with that file and change both in the same edit. List it under "Re-test only, no edit".
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#calibrate-effort
  passage: "test several levels against your own evals rather than carrying over the setting you used on Claude Opus 5 … Claude Opus 5.5 at `medium` matches or exceeds Claude Opus 5 at `high`"
  verified: 2026-10-06

### P22 — Opus 5 prompting delivered to Opus 5.5 by prefix

- kind: change
- area: hooks, rules, settings
- signal: any file that maps a model id to instruction text — a hook script, a gate or check script, a rule condition, a setting — by matching the id against a prefix or pattern, such as `claude-opus-5*`, `startsWith("claude-opus-5")` or `^claude-opus-5`, which `claude-opus-5-5` also matches
- applies when: the project runs on Opus 5.5 and the delivered text carries Opus 5 tuning, as P07 describes; such files are found by the plan's prefix search
- change: Where an Opus 5.5 counterpart exists under the root or the project records it as planned, propose making the selector match exact ids or the longest prefix, since a first match over a sorted list keeps returning the Opus 5 text after the new skill exists, and never propose adding the new skill alone as the fix: that selector edit is a change, typed rewrite, and where the counterpart is only planned its note says that whether Opus 5.5 still needs the Opus 5 text meanwhile stays a re-test. Otherwise, re-test whether Opus 5.5 still needs the delivered text, then match the exact id `claude-opus-5`, or record why Opus 5.5 keeps it, and list it under "Re-test only, no edit".
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#new-model
  basis: inference: the id `claude-opus-5-5` begins with `claude-opus-5`, so any prefix selector for Opus 5 also matches it.
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#recommended-changes
  passage: "Instructions tuned for Claude Opus 5's behavior may no longer be needed"
  verified: 2026-10-06

### P23 — Opus 5 skill preloaded into an agent moving to Opus 5.5

- kind: re-test
- area: agents
- signal: a `skills:` entry naming a skill written for Opus 5 — its name or title names Opus 5 — in an agent that is pinned to Opus 5, a P20 finding, or already to Opus 5.5
- applies when: agent files; an agent already on `claude-opus-5-5` gets the finding on its own, with no P20 finding
- change: Re-test: re-derive a Opus 5.5 counterpart from the Opus 5.5 guide and point the `skills:` line at it, since the migration guide says to re-evaluate model-specific prompt instructions against Prompting Claude Opus 5.5; where a prefix match selects that skill, P22 applies too. An agent already on Opus 5.5 receives the Opus 5 text in full at startup all the same. List it under "Re-test only, no edit".
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#recommended-changes
  passage: "Re-evaluate model-specific prompt instructions. Instructions tuned for Claude Opus 5's behavior may no longer be needed"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents
  passage: "The full content of each listed skill is injected into the subagent's context at startup."
  verified: 2026-10-06

### P24 — No Claude Code version floor for Opus 5.5

- kind: change
- area: setup, memory
- signal: a P01 or P20 finding, and no memory file, README or setup script under the root that states the Claude Code version the project needs
- applies when: the project, once, on the file where it describes its setup, or its root `CLAUDE.md`
- change: Add a line stating Claude Code v2.1.280 or later, since Opus 5.5 requires Claude Code v2.1.280 or later.
- confidence: medium
- sweep: no
- source: https://code.claude.com/docs/en/model-config#model-aliases
  passage: "Sonnet 5.5 requires Claude Code v2.1.284 or later, and Opus 5.5 requires v2.1.280 or later."
  verified: 2026-10-06

### P25 — Content-based fallback left unaccounted for

- kind: re-test
- area: model-dependent, memory, skills
- signal: the project runs or moves to Opus 5.5
- applies when: the project, once, on the file that holds its model notes or its Opus tier skill, or else on the first pin finding
- change: Re-test: in Claude Code biology-flagged Opus 5.5 requests re-run on Opus 5 and cyber-flagged ones on Opus 4.8, and the session continues on the fallback model; decide whether the project keeps guidance for that model available and whether its measurements tell the models apart. List it under "Re-test only, no edit".
- confidence: medium
- sweep: no
- source: https://code.claude.com/docs/en/model-config#automatic-model-fallback
  passage: "Fable 5.1, Fable 5, and Opus 5.5: biology-flagged requests re-run on Opus 5, and cybersecurity-flagged requests re-run on Opus 4.8. … After a fallback, the session continues on the fallback model."
  verified: 2026-10-06

### P26 — Price table without an Opus 5.5 entry

- kind: change
- area: model-dependent
- signal: a per-model price table or rate lookup naming `claude-opus-5` with no `claude-opus-5-5` entry
- applies when: model-dependent code and docs
- change: Add an explicit `claude-opus-5-5` entry at Opus 5.5's own prices, $4 and $20 per million input and output tokens against Opus 5's $5 and $25, since a lookup that falls back to the `claude-opus-5` stem prices Opus 5.5 at Opus 5's rates.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#pricing
  passage: "Claude Opus 5.5 costs $4 USD per million input tokens and $20 USD per million output tokens, below Claude Opus 5's $5 and $25"
  verified: 2026-10-06

### P27 — Model docs that miss the Opus 5.5 guide

- kind: change
- area: model-dependent, memory, rules
- signal: a prompting-guide index or per-model notes under the root that list the Opus 5 guide and not the Opus 5.5 guide, or that state Opus 5 behavior a Opus 5.5 source contradicts, such as running "with thinking disabled"
- applies when: model-dependent code and docs, and model notes in memory and rules files — a paragraph naming the model the project runs, its effort or its thinking setting
- change: Add the Opus 5.5 guide as a source and re-evaluate the model-specific statements against it, as the migration guide says; thinking cannot be turned off on Opus 5.5 in Claude Code.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#recommended-changes
  passage: "Re-evaluate model-specific prompt instructions. Instructions tuned for Claude Opus 5's behavior may no longer be needed"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#extended-thinking
  passage: "You can't turn thinking off on Opus 5.5, Sonnet 5.5, or the Fable models."
  verified: 2026-10-06

### P28 — Transcript or output parser that reads only text blocks

- kind: re-test
- area: model-dependent
- signal: code outside the Claude API calls that reads model output or a session transcript and keeps only `text` blocks
- applies when: model-dependent code and docs
- change: Re-test with a response that holds progress-update `thinking` blocks: on Opus 5.5, notes the model writes between tool calls come back as `thinking` blocks, empty at the default `display`. List it under "Re-test only, no edit".
- confidence: low
- sweep: no
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#text-between-tool-calls
  passage: "The short notes the model writes between tool calls arrive as progress-update `thinking` blocks rather than `text` blocks"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#extended-thinking
  basis: inference: the Claude Code docs do not say how a session transcript records progress-update thinking blocks.

### P29 — `max_tokens` sized for a request with thinking off

- kind: hand-off
- area: api-code
- signal: a small `max_tokens` in request code that ran Opus 5 with thinking disabled
- applies when: API code
- change: Hand off per the API hand-off rule. Thinking counts toward `max_tokens` on Opus 5.5, so a limit sized for Opus 5 with thinking off can cut replies off.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#calibrate-effort
  passage: "Thinking counts toward `max_tokens` even when thinking content isn't returned to you, so a limit sized for Claude Opus 5 with thinking off can cut replies off."
  verified: 2026-10-06

### P30 — Requests that pass no effort

- kind: hand-off
- area: api-code
- signal: request code for a model id or alias that is moving to Opus 5.5 and sends no `effort`
- applies when: API code, unless the project records the omission as deliberate as already decided
- change: Hand off per the API hand-off rule. Say that such a request ran at `high` on Opus 5 and runs at `medium` on Opus 5.5, so the id change lowers the level for every caller, and that the docs' advice is to set `effort` explicitly and re-run the sweep.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#behavior-differences
  passage: "A request that omits `effort` runs at `medium`; on Claude Opus 5 it ran at `high`. Set `effort` explicitly and re-run your sweep"
  verified: 2026-10-06

</traps>
