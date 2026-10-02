---
transition: sonnet-5-to-5-5
verified: 2026-10-02
---

# Sonnet 5 → Sonnet 5.5: change digest

What changes from Claude Sonnet 5 to Claude Sonnet 5.5 that can bear on a Claude Code setup or on Claude API code: one item per change, with the page that states it and a short passage quoted from that page. Nothing here is an instruction on its own. The page is the authority; a passage is a quotation of at most 30 words, and `…` joins two fragments of one page.

<changes>

### C01 — Existing prompts carry over

- change: Prompts written for Sonnet 5 are expected to work as they are; a change needs a passage below, never the move alone.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5
  passage: "Existing Claude Sonnet 5 prompts should perform well without changes"
  verified: 2026-10-02

### C02 — Effort levels are recalibrated

- change: A level does not give the same amount of thinking as on Sonnet 5, so an effort value carried over is to be re-tested, not kept or translated.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "Run a fresh sweep against your own evals rather than carrying over the setting you used on Claude Sonnet 5."
  verified: 2026-10-02

### C03 — Starting effort depends on the workload

- change: The guide's starting points are `high` in general, `medium` for well-specified agentic coding and tool use, and `medium` or `low` for chat and latency-sensitive work.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "For agentic coding and multistep tool use, start at `medium` for well-specified tasks and move to `high` for harder or longer ones."
  verified: 2026-10-02

### C04 — Claude Code runs Sonnet 5.5 at `medium` by default

- change: In Claude Code the default effort of Sonnet 5.5 is `medium`, while Sonnet 5 defaults to `high`.
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "except that Opus 5.5 and Sonnet 5.5 default to `medium`"
  verified: 2026-10-02

### C05 — Lower effort stops to check in

- change: At `low` and `medium` the model more often pauses to ask before a long agentic task is done; a higher effort or a carry-through instruction addresses it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "At `low` and `medium`, on long agentic tasks, it's more likely to stop and check in with the user before it finishes."
  verified: 2026-10-02

### C06 — Asking for less thinking does not reduce it

- change: An instruction to think less is unreliable; the effort level is the control.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "Asking it in the system prompt to think less doesn't reliably reduce its thinking."
  verified: 2026-10-02

### C07 — `max_tokens` needs room for thinking

- change: Thinking counts toward `max_tokens`, so a limit sized for a request without thinking can cut the reply off.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "Thinking counts toward `max_tokens` even when thinking content isn't returned to you."
  verified: 2026-10-02

### C08 — Changing top-level effort between requests drops the prompt cache

- change: A different top-level `effort` on the next request invalidates the cache; a per-message effort change keeps it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "Changing the top-level `effort` value between requests invalidates the prompt cache."
  verified: 2026-10-02

### C09 — Unrequested additions when coding

- change: The model adds tests, documentation and small supporting files nobody asked for, at every effort level and more at higher effort.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#steer-initiative-and-scope
  passage: "The model tends to add tests, documentation, and small supporting files that fit your repository's conventions, even when you don't ask for them."
  verified: 2026-10-02

### C10 — Self-started review at `xhigh` and `max`

- change: At `xhigh` and `max` the model can start its own review rounds after finishing, sometimes with subagents, which costs time and tokens.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#steer-initiative-and-scope
  passage: "After it finishes a task, it can start its own rounds of review and verification, sometimes with subagents if your harness provides them."
  verified: 2026-10-02

### C11 — Open-ended requests start building

- change: On an open-ended request the model can start producing a deliverable where only ideas or a plan were wanted.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#steer-initiative-and-scope
  passage: "the model can start building a presentation, report, or video when you only wanted ideas"
  verified: 2026-10-02

### C12 — `thinking: disabled` is rejected

- change: A request that turns thinking off with `disabled` returns a 400 error; the lowest setting is `between_tools`, accepted at `high` effort or below and with no other field.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#turn-off-up-front-thinking
  passage: "To turn off up-front thinking on Claude Sonnet 5.5, send `thinking: {"type": "between_tools"}` instead of `"disabled"`."
  verified: 2026-10-02
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#turn-off-up-front-thinking
  passage: "At `xhigh` or `max` effort, a request with `between_tools` returns a 400 error."
  verified: 2026-10-02

### C13 — Instructions not to think, under `between_tools`

- change: With `between_tools`, an instruction telling the model not to think is to be removed.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#running-without-up-front-thinking
  passage: "With `between_tools`, remove any instruction that tells the model not to think."
  verified: 2026-10-02

### C14 — Claude Code cannot turn thinking off

- change: On Sonnet 5.5, Claude Code's thinking toggle, `alwaysThinkingEnabled: false` and `MAX_THINKING_TOKENS=0` have no effect.
- source: https://code.claude.com/docs/en/model-config#extended-thinking
  passage: "You can't turn thinking off on Opus 5.5, Sonnet 5.5, or the Fable models."
  verified: 2026-10-02

### C15 — Manual thinking budgets are rejected

- change: `thinking` of type `enabled` with `budget_tokens` returns a 400 error.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#turn-off-up-front-thinking
  passage: "Manual thinking budgets (`thinking: {"type": "enabled", "budget_tokens": N}`) return a 400 error."
  verified: 2026-10-02

### C16 — Forced tool use is rejected

- change: `tool_choice` of type `any` or `tool` returns a 400 error, on the token-counting endpoint too; `auto` with strict tool use or structured outputs replaces it.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#forced-tool-use-is-not-supported
  passage: "Claude Sonnet 5.5 doesn't support forced tool use."
  verified: 2026-10-02

### C17 — Thinking blocks are tied to the model and the conversation

- change: A request that replays a Sonnet 5.5 thinking block after an edit to the system prompt, the tools or an earlier message can return a 400 error, so history stays append-only.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#thinking-blocks-are-tied-to-the-model-that-produced-them
  passage: "On those accounts, a request that replays a block after such a change returns a 400 error."
  verified: 2026-10-02

### C18 — Text between tool calls arrives in thinking blocks

- change: Notes longer than a sentence or two between tool calls come back as `thinking` blocks, empty at the default display, so an interface that renders only `text` looks silent, and a response may not begin with text.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#text-between-tool-calls
  passage: "At the default `display: "omitted"`, the progress-update blocks' text is empty, so an application that streams those notes to its users goes quiet between tool calls, with no error."
  verified: 2026-10-02

### C19 — Instructions to hold findings for the final response

- change: An older instruction that delays everything to the final response is to be removed, since the model now writes progress notes between tool calls.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#user-facing-progress-updates
  passage: "Next, remove older instructions such as "hold all findings for the final response"."
  verified: 2026-10-02

### C20 — `computer_20251124` is rejected on the Claude API and Google Cloud

- change: There, computer use works only through `computer_toolset_20260801`; Amazon Bedrock still accepts the earlier tool.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#computer-20251124-is-not-supported
  passage: "A request that declares the earlier `computer_20251124` tool returns a 400 `invalid_request_error`."
  verified: 2026-10-02

### C21 — The advisor tool accepts fewer advisors

- change: With a Sonnet 5.5 executor, Opus 4.8, Opus 4.7 and Sonnet 5 advisors return a 400 error, and the advice returns encrypted.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#advisor-tool-pairings
  passage: "Claude Opus 4.8, Claude Opus 4.7, and Claude Sonnet 5 advisors work with a Claude Sonnet 5 executor, but with a Claude Sonnet 5.5 executor they return a 400 `invalid_request_error`."
  verified: 2026-10-02

### C22 — Refusals come in five categories

- change: A decline is a normal response with `stop_reason: "refusal"` and a `stop_details.category` of `cyber`, `bio`, `frontier_llm`, `reasoning_extraction` or `general_harms`, and Sonnet 5.5 declines in more categories than Sonnet 5.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#safeguard-refusals
  passage: "A decline arrives as a normal response with `stop_reason: "refusal"`, and `stop_details.category` names the"
  verified: 2026-10-02

### C23 — Asking for the reasoning in the response invites a refusal

- change: An instruction that asks the model to include its reasoning in the response text is to be removed; a short explanation of the answer or a summary of actions is still fine.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#safeguard-refusals
  passage: "If your prompts ask the model to include its reasoning in the response, remove those instructions, because they invite `reasoning_extraction` declines."
  verified: 2026-10-02

### C24 — Fallback after a refusal

- change: Server-side fallback retries only `cyber` and `frontier_llm` declines, on Sonnet 5; in Claude Code a cybersecurity flag re-runs on Sonnet 5 and a biology flag ends in a refusal.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#refusals-fallback-and-billing
  passage: "It doesn't retry `"bio"`, `"reasoning_extraction"`, or `"general_harms"` declines."
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#automatic-model-fallback
  passage: "cybersecurity-flagged requests re-run on Sonnet 5. Biology-flagged requests end with a refusal instead, because Sonnet 5.5 has no biology fallback model."
  verified: 2026-10-02

### C25 — Language that discourages tool use

- change: A prompt that tells the model to minimise tool calls makes it answer from training knowledge where a search would catch what changed.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#tool-use-in-chat-and-knowledge-work
  passage: "check your prompt for language that discourages tool use, such as "only use tools when strictly necessary" or "minimize tool calls", and remove it"
  verified: 2026-10-02

### C26 — Text placed after tool results can read as an injection

- change: User text inside a `tool_result`, or a harness countdown or instruction after every tool result, can be treated as a prompt injection and ignored.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#mid-turn-user-messages-and-task-budgets
  passage: "Never put user text inside a `tool_result` block."
  verified: 2026-10-02
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#mid-turn-user-messages-and-task-budgets
  passage: "In interactive sessions where users can type mid-turn, don't add your own token or budget countdown after tool results."
  verified: 2026-10-02

### C27 — Verification can be skipped at `low` effort

- change: At `low` the model sometimes reports a code change as done without a check that exercises it; an instruction to run a real check addresses it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#verification-on-coding-tasks
  passage: "At `low` effort, though, it sometimes reports a change as done without running a check that exercises it."
  verified: 2026-10-02

### C28 — Tool calls with the wrong letter case

- change: The model occasionally calls a declared tool, or passes a parameter, under a slightly different name, which a harness should tolerate or answer with the exact name.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#tolerant-tool-call-handling
  passage: "occasionally calls a declared tool by a name that differs only in letter case, such as `bash` for `Bash`"
  verified: 2026-10-02

### C29 — JSON answers to reasoning tasks

- change: On a task that needs working out, the model may answer without thinking, or write its working before the JSON; a response that stops at `max_tokens` is a failure even when its text parses.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#reasoning-tasks-with-json-output
  passage: "Treat any response whose `stop_reason` is `"max_tokens"` as failed, even if its text holds valid JSON, and retry."
  verified: 2026-10-02

### C30 — The minimum cacheable prompt is 512 tokens

- change: Prompt caching applies from 512 tokens, down from 1,024, so a threshold written for Sonnet 5 skips prompts that now cache.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#migrating-from-claude-sonnet-5
  passage: "The minimum cacheable prompt is 512 tokens, down from 1,024 on Claude Sonnet 5, Claude Sonnet 4.6, and Claude Sonnet 4.5."
  verified: 2026-10-02

### C31 — The model id, and what `sonnet` resolves to

- change: The id is `claude-sonnet-5-5`, with no date suffix; the `sonnet` alias is Sonnet 5.5 only on the Anthropic API, from Claude Code v2.1.284, and an older model on the other providers.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#migrating-from-claude-sonnet-5
  passage: "Replace your model ID with `claude-sonnet-5-5`, which has no date suffix."
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#version-history
  passage: "`sonnet` resolves to Sonnet 5.5 on the Anthropic API"
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#model-aliases
  passage: "Sonnet 5.5 requires Claude Code v2.1.284 or later"
  verified: 2026-10-02

### C32 — Prices, tokenizer and context window do not change

- change: Sonnet 5.5 costs the same as Sonnet 5, counts tokens the same way and keeps the 1M window with no `[1m]` suffix, so a price table or a token budget needs a new row, not new numbers.
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#pricing
  passage: "Claude Sonnet 5.5 has the same prices as Claude Sonnet 5, including prompt caching and batch processing rates."
  verified: 2026-10-02
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#new-model
  passage: "The tokenizer is the same as Claude Sonnet 5's, so the same text produces the same token counts."
  verified: 2026-10-02
- source: https://code.claude.com/docs/en/model-config#sonnet-5-5-and-sonnet-5-context-window
  passage: "On the Anthropic API, Sonnet 5.5 and Sonnet 5 always run with the 1M context window."
  verified: 2026-10-02

</changes>
