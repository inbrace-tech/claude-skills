---
transition: opus-5-to-5-5
verified: 2026-10-02
---

# Opus 5 → Opus 5.5: change digest

What changes from Claude Opus 5 to Claude Opus 5.5 that can bear on a Claude Code setup or on Claude API code: one item per change, with the page that states it and a short passage quoted from that page. Nothing here is an instruction on its own. The page is the authority; a passage is a quotation of at most 30 words, and `…` joins two fragments of one page.

<changes>

### C01 — Existing prompts carry over

- change: Prompts written for Opus 5 are expected to work as they are; a change needs a passage below, never the move alone.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
  passage: "Existing Claude Opus 5 prompts should perform well without changes"
  verified: 2026-10-02

### C02 — The default effort is `medium`

- change: A request that omits `effort` runs at `medium` where Opus 5 ran at `high`, so the level is to be set explicitly.
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#behavior-differences
  passage: "A request that omits `effort` runs at `medium`; on Claude Opus 5 it ran at `high`."
  verified: 2026-10-02

### C03 — An effort level does not carry over

- change: Level names do not mean the same amount of thinking across the two models, and `medium` on Opus 5.5 matches or exceeds `high` on Opus 5, so the starting point is `medium` and a sweep.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#calibrate-effort
  passage: "Claude Opus 5.5 at `medium` matches or exceeds Claude Opus 5 at `high` on coding and knowledge-work evaluations"
  verified: 2026-10-02

### C04 — Claude Code ignores a top-level `effortLevel` in user settings

- change: In Claude Code, Opus 5.5 starts at `medium` and a top-level `effortLevel` in the user settings file does not apply to it; the same key in project, local or managed settings applies to every model.
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "a top-level `effortLevel` in your user settings file doesn't count for Opus 5.5"
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "A top-level `effortLevel` in project, local, or managed settings, or one passed with `--settings`, applies to every model."
  verified: 2026-10-02

### C05 — More thinking per turn, and `max_tokens`

- change: At a given level the model thinks more per turn than Opus 5, and thinking counts toward `max_tokens`, so a limit sized for Opus 5 with thinking off can cut the reply off.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#calibrate-effort
  passage: "Thinking counts toward `max_tokens` even when thinking content isn't returned to you, so a limit sized for Claude Opus 5 with thinking off can cut replies off."
  verified: 2026-10-02

### C06 — Lowering effort reduces thinking more reliably than instructions

- change: To get less thinking, the effort level comes before any prompt instruction.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#calibrate-effort
  passage: "Lowering effort reduces thinking, and with it cost and latency, more reliably than prompt instructions do."
  verified: 2026-10-02

### C07 — Changing top-level effort between requests drops the prompt cache

- change: A different top-level `effort` on the next request invalidates the cache; a per-message effort change keeps it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#calibrate-effort
  passage: "Changing the top-level `effort` value between requests invalidates the prompt cache."
  verified: 2026-10-02

### C08 — Thinking cannot be disabled

- change: `thinking` of type `disabled`, or `enabled` with a manual budget, returns a 400 error; in Claude Code the thinking toggle, `alwaysThinkingEnabled: false` and `MAX_THINKING_TOKENS=0` have no effect.
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#thinking-cant-be-disabled
  passage: "On Claude Opus 5.5, thinking is always on: a request that sets `thinking: {"type": "disabled"}`, or a manual budget with"
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#extended-thinking
  passage: "You can't turn thinking off on Opus 5.5, Sonnet 5.5, or the Fable models."
  verified: 2026-10-02

### C09 — Instructions that stood in for thinking

- change: An instruction that asked for the reasoning in the response as a substitute for thinking is to be removed.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#prompts-written-for-thinking-disabled
  passage: "If your prompt asked the model to write out its reasoning in the response as a substitute for thinking, remove that instruction"
  verified: 2026-10-02

### C10 — Mitigations written for thinking disabled

- change: The combined instruction Opus 5 needed with thinking disabled is to be re-tested, and a rule that tells the model not to think is to be removed.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#prompts-written-for-thinking-disabled
  passage: "With thinking always on, check whether you still need the instruction, and remove the no-thinking rule either way."
  verified: 2026-10-02

### C11 — A response may not begin with text

- change: Every response can begin with a `thinking` block, empty at the default display, so code selects blocks by type and passes thinking blocks back unchanged.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#prompts-written-for-thinking-disabled
  passage: "Check each block's type instead of assuming the first content block is text"
  verified: 2026-10-02

### C12 — Forced tool use is rejected

- change: `tool_choice` of type `any` or `tool` returns a 400 error, on the token-counting endpoint too; `auto` with strict tool use or structured outputs replaces it.
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#forced-tool-use-is-not-supported
  passage: "Claude Opus 5.5 doesn't support forced tool use."
  verified: 2026-10-02

### C13 — Thinking blocks are tied to the model and the conversation

- change: A request that replays an Opus 5.5 thinking block after an edit to the system prompt, the tools or an earlier message can return a 400 error, so history stays append-only and tools are declared from the first request.
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#thinking-blocks-are-tied-to-the-model-that-produced-them
  passage: "On those accounts, a request that replays a block after such a change returns a 400 error."
  verified: 2026-10-02
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#user-facing-progress-updates
  passage: "adding it to `tools` later edits the conversation's prefix and invalidates earlier thinking blocks"
  verified: 2026-10-02

### C14 — `computer_20251124` is rejected on the Claude API and Google Cloud

- change: There, computer use works only through `computer_toolset_20260801`; Amazon Bedrock still accepts the earlier tool.
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#computer-20251124-is-not-supported
  passage: "a request that declares a `computer_20251124` tool returns a 400 `invalid_request_error`"
  verified: 2026-10-02

### C15 — Text between tool calls arrives in thinking blocks

- change: The notes the model writes between tool calls come back as `thinking` blocks, empty at the default display, so an interface that renders only `text` looks silent.
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#behavior-differences
  passage: "at the default `display: "omitted"` an application that streams them to its users goes quiet between tool calls, with no error"
  verified: 2026-10-02

### C16 — An unattended run can end on a progress report

- change: Some updates end the turn with text instead of a tool call, and a loop that reads that as the end of the task stops there.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#unattended-agentic-runs
  passage: "An unattended agent loop that treats such a turn as the end of the task stops running there."
  verified: 2026-10-02

### C17 — A biology classifier is new

- change: Opus 5.5 runs a biology safety classifier in addition to the cybersecurity one, so `stop_details.category` can be `bio`.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#safeguard-refusals
  passage: "The biology safeguards are the same as Claude Fable 5.1's and are new if you're coming from Claude Opus 5."
  verified: 2026-10-02

### C18 — Asking for the reasoning in the response invites a refusal

- change: An instruction that asks the model to write out its reasoning in the response text is to be removed; a short explanation of the answer or a summary of actions is still fine.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#safeguard-refusals
  passage: "If your prompts ask the model to write out its reasoning in the response, remove those instructions"
  verified: 2026-10-02

### C19 — Fallback after a refusal

- change: Server-side fallback does not retry a `reasoning_extraction` decline; in Claude Code a biology flag re-runs on Opus 5 and a cybersecurity flag on Opus 4.8, and the session stays on the fallback model.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#safeguard-refusals
  passage: "except for `reasoning_extraction` declines, which server-side fallback returns to you instead of retrying"
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#automatic-model-fallback
  passage: "biology-flagged requests re-run on Opus 5, and cybersecurity-flagged requests re-run on Opus 4.8"
  verified: 2026-10-02

### C20 — Instructions to think carefully, in chat prompts

- change: In a chat application, a system-prompt instruction to think carefully before answering delays the reply without a clear gain and is a candidate for removal.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#thinking-instructions-in-chat-system-prompts
  passage: "if your system prompt contains instructions that tell Claude to think carefully before answering, consider removing them for Claude Opus 5.5"
  verified: 2026-10-02

### C21 — Elapsed time steers multiagent work

- change: The model paces itself to a time budget or an elapsed-time line the harness adds, which a team of agents can use to finish sooner.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#time-signals-for-multi-agent-harnesses
  passage: "Claude Opus 5.5 pays close attention to information about elapsed time"
  verified: 2026-10-02

### C22 — Loosely specified tasks across several apps

- change: The model gets to work quickly, so on a multi-app task it helps to tell it to look through the relevant sources before acting.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#explore-context-in-multi-app-workflows
  passage: "on loosely specified tasks it helps to tell the model to look through the relevant sources before acting"
  verified: 2026-10-02

### C23 — Pasted text can be marked

- change: Wrapping pasted text in tagged blocks, with a system-prompt note, makes the model resist instructions inside it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#mark-pasted-text-in-user-messages
  passage: "mark which text is the user's own and which was pasted from somewhere else"
  verified: 2026-10-02

### C24 — Scaffolding for visual inputs

- change: The model reads charts, diagrams and screenshots more precisely without tools, so workarounds built for earlier models are to be re-tested.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#tools-for-complex-visual-inputs
  passage: "re-test whether you still need scaffolding you built for visual inputs on earlier models"
  verified: 2026-10-02

### C25 — Generic instructions about frontend style

- change: A general instruction against a generic look swaps one default style for another; naming the specific patterns to avoid works.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#frontend-design-defaults
  passage: "a general instruction such as "avoid a generic AI look" mostly swaps one default for another"
  verified: 2026-10-02

### C26 — Prices are lower

- change: Opus 5.5 has its own, lower prices, so a price table needs its own row and a lookup that falls back to Opus 5's row overstates the cost.
- source: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5#pricing
  passage: "Claude Opus 5.5 costs $4 USD per million input tokens and $20 USD per million output tokens, below Claude Opus 5's $5 and $25"
  verified: 2026-10-02

### C27 — The model id, and what `opus` resolves to

- change: The id is `claude-opus-5-5`, with no date suffix; the `opus` alias is Opus 5.5 from Claude Code v2.1.280 on every provider but Microsoft Foundry.
- source: https://platform.claude.com/docs/en/models/opus-5-5/migration-guide#migrating-from-claude-opus-5
  passage: "`claude-opus-5-5` is a fixed model ID with no date suffix, the same scheme as `claude-opus-5`."
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#version-history
  passage: "`opus` resolves to Opus 5.5 on the Anthropic API, Claude Platform on AWS, Amazon Bedrock, and Google Cloud's Agent Platform"
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#model-aliases
  passage: "Opus 5.5 requires v2.1.280 or later"
  verified: 2026-10-02

</changes>

<older_residue>

Instructions written for a model older than Opus 5, which Opus 5 already made unnecessary. They are not part of this transition; each is recorded as older residue only with its passage below.

### R01 — Explicit verification steps

- residue: Opus 5 already verified its own work, so an instruction to add a verification step or a verifying subagent caused over-verification there.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5#task-scope-and-over-verification
  passage: "If your prompt contains explicit verification instructions … remove them: instructions like these cause over-verification on Claude Opus 5"
  verified: 2026-10-02

### R02 — Guidance to delegate more

- residue: Opus 5 already delegated to subagents readily, so guidance pushing it to delegate more multiplied cost there.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5#controlling-subagent-spawning
  passage: "Claude Opus 5 delegates to subagents more readily than prior models."
  verified: 2026-10-02

### R03 — Severity filters in review prompts

- residue: A review prompt that asked for only high-severity issues already made Opus 5 report less than it found.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5#capability-improvements
  passage: "the model may follow that instruction literally and report less; ask it to report everything and filter in a separate pass instead"
  verified: 2026-10-02

</older_residue>
