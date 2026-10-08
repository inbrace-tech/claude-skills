---
transition: haiku-4-5-to-5-5
verified: 2026-10-07
---

# Haiku 4.5 → Haiku 5.5: change digest

What changes from Claude Haiku 4.5 to Claude Haiku 5.5 that can bear on a Claude Code setup or on Claude API code: one item per change, with the page that states it and a short passage quoted from that page. Nothing here is an instruction on its own. The page is the authority; a passage is a quotation of at most 30 words, and `…` joins two fragments of one page.

<changes>

### C01 — Existing prompts carry over

- change: Prompts written for Haiku 4.5 are expected to work as they are; a change needs a passage below, never the move alone.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5
  passage: "Existing Claude Haiku 4.5 prompts should perform well without changes."
  verified: 2026-10-07

### C02 — The model id

- change: The id is `claude-haiku-5-5`, fixed, with no date suffix and no separate alias; `anthropic.claude-haiku-5-5` on Amazon Bedrock.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#use-the-claude-haiku-5-5-model-id
  passage: "`claude-haiku-5-5` is a fixed model ID with no date suffix and no separate alias."
  verified: 2026-10-07

### C03 — What `haiku` resolves to in Claude Code

- change: From Claude Code v2.1.293 the `haiku` alias is Haiku 5.5 on the Anthropic API, and stays Haiku 4.5 on Claude Platform on AWS, Amazon Bedrock, Google Cloud's Agent Platform and Microsoft Foundry.
- source: https://code.claude.com/docs/en/model-config#version-history
  passage: "`haiku` resolves to Haiku 5.5 on the Anthropic API"
  verified: 2026-10-07
- source: https://code.claude.com/docs/en/model-config#model-aliases
  passage: "Use v2.1.293 or later with Haiku 5.5."
  verified: 2026-10-07

### C04 — `ANTHROPIC_DEFAULT_HAIKU_MODEL` also picks the background model

- change: The variable sets what `haiku` means and the model of Claude Code's background functionality, so a Haiku 4.5 value there keeps both on Haiku 4.5.
- source: https://code.claude.com/docs/en/model-config#environment-variables
  passage: "The model to use for `haiku`, or background functionality"
  verified: 2026-10-07

### C05 — Adaptive thinking is on by default

- change: Haiku 5.5 decides when and how much to think, with no request asking for it; Haiku 4.5 thought only when a request set a budget.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5#adaptive-thinking-and-effort
  passage: "With adaptive thinking, Claude Haiku 5.5 determines when and how much to think. Adaptive thinking is on by default."
  verified: 2026-10-07

### C06 — Claude Code cannot turn its thinking off

- change: On Haiku 5.5, Claude Code's thinking toggle, `alwaysThinkingEnabled: false`, `MAX_THINKING_TOKENS` and the fixed budget mode have no effect.
- source: https://code.claude.com/docs/en/model-config#extended-thinking
  passage: "You can't turn thinking off on Opus 5.5, Sonnet 5.5, Haiku 5.5, or the Fable models."
  verified: 2026-10-07
- source: https://code.claude.com/docs/en/model-config#adaptive-reasoning-and-fixed-thinking-budgets
  passage: "The fixed thinking budget mode and `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` don't apply to them."
  verified: 2026-10-07

### C07 — Effort is new on the Haiku line, default `medium`

- change: Haiku 5.5 takes effort from `low` to `max`, defaulting to `medium` on the Claude API and in Claude Code, with no Haiku 4.5 setting to carry over.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#use-effort-to-control-thinking
  passage: "Claude Haiku 5.5 is the first Haiku model with effort levels."
  verified: 2026-10-07
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#use-effort-to-control-thinking
  passage: "It replaces the thinking budget (`budget_tokens`) that Claude Haiku 4.5 used, so there's no old setting to carry over."
  verified: 2026-10-07

### C08 — Starting effort depends on the workload

- change: The guide's starting points are `medium` for most work, agentic coding included, `low` for chat and simple high-volume requests, `high` for knowledge work and strict instruction following.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#use-effort-to-control-thinking
  passage: "`medium` is the default on the Claude API and in Claude Code. Start here for most work, including agentic coding."
  verified: 2026-10-07
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#use-effort-to-control-thinking
  passage: "`high` suits knowledge work, longer agent tasks, and strict instruction following."
  verified: 2026-10-07

### C09 — A top-level `effortLevel` now reaches Haiku

- change: An `effortLevel` in project, local or managed settings applies to every model, so a level set for other models now runs Haiku 5.5 too.
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "A top-level `effortLevel` in project, local, or managed settings, or one passed with `--settings`, applies to every model."
  verified: 2026-10-07

### C10 — Telling the model to answer directly does not stop its thinking

- change: An instruction to skip thinking is unreliable; the effort level is the control.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#use-effort-to-control-thinking
  passage: "In Anthropic's testing, telling the model in the prompt to answer directly didn't stop it from thinking."
  verified: 2026-10-07

### C11 — Responses can begin with thinking blocks

- change: Code that reads the first content block as the answer breaks; blocks are selected by `type`.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5#responses-can-begin-with-thinking-blocks
  passage: "Code that reads the first content block as the answer needs to select blocks by their `type` field."
  verified: 2026-10-07

### C12 — `max_tokens` needs room for thinking

- change: Thinking counts toward `max_tokens`, so a small limit can end the response before any text.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#configure-thinking
  passage: "Thinking tokens count toward `max_tokens`, so a request with a small `max_tokens` can stop with `stop_reason: "max_tokens"` after a `thinking` block and before any text."
  verified: 2026-10-07

### C13 — Thinking text is omitted by default

- change: Thinking blocks come back with an empty text and a signature, where Haiku 4.5 returned summaries; `display: "summarized"` restores them.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#configure-thinking
  passage: "By default, Claude Haiku 5.5 returns each `thinking` block with an empty `thinking` field and only a `signature`, where Claude Haiku 4.5 returned summarized thinking."
  verified: 2026-10-07

### C14 — Manual thinking budgets are rejected

- change: `thinking` set to `enabled` with `budget_tokens` returns a 400 error; adaptive thinking with an effort level replaces it.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#configure-thinking
  passage: "A `thinking` value of `{"type": "enabled", "budget_tokens": N}` returns a 400 error"
  verified: 2026-10-07

### C15 — Turning thinking off has limits

- change: `disabled` works only at `low`, `medium` and `high`; at `xhigh` or `max`, and with a per-message effort change, it returns a 400 error.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#use-effort-to-control-thinking
  passage: "This works at `low`, `medium`, and `high` only. At `xhigh` and `max`, the request returns a 400 error."
  verified: 2026-10-07

### C16 — Sampling parameters are rejected

- change: Non-default `temperature` or `top_p`, any `top_k`, or both `temperature` and `top_p` together return a 400 error.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#remove-sampling-parameters
  passage: "On Claude Haiku 5.5, omit all three and use prompting to guide the model's behavior instead."
  verified: 2026-10-07

### C17 — Assistant prefill is rejected

- change: A final assistant turn for the model to continue returns a 400 error, even with thinking off.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#replace-assistant-prefill
  passage: "Claude Haiku 5.5 rejects it with a 400 error, even with thinking turned off."
  verified: 2026-10-07

### C18 — Computer use needs the toolset on the Claude API and Google Cloud

- change: There `computer_20250124` returns a 400 error and `computer_toolset_20260801` replaces it, with agent-loop changes; the browser use tool is new.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#computer-use-toolset
  passage: "a request that declares `computer_20250124` returns a 400 error."
  verified: 2026-10-07

### C19 — Editing earlier turns invalidates thinking blocks

- change: A thinking block sent back after a change to `system`, `tools` or earlier messages returns a 400 error, so history stays append-only; Haiku 4.5 ran no such check.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#keep-earlier-turns-unchanged
  passage: "Claude Haiku 4.5 doesn't run this check. Keep conversations append-only."
  verified: 2026-10-07

### C20 — Thinking blocks stay with their account

- change: A block replayed through another account is dropped silently, and the model answers without that reasoning.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5#replaying-thinking-blocks-across-accounts
  passage: "Thinking blocks from Claude Haiku 5.5 work only in the account that produced them, or in an account linked to it."
  verified: 2026-10-07

### C21 — The same text counts as about 30% more tokens

- change: A newer tokenizer raises token counts for the same text, so limits, budgets and cost estimates need recounting on Haiku 5.5.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5#same-text-counts-as-more-tokens
  passage: "the same input text produces approximately 30% more tokens on Claude Haiku 5.5 than on Claude Haiku 4.5."
  verified: 2026-10-07

### C22 — A larger window and output

- change: The context window grows from 200k to 1M tokens and the output from 64k to 128k.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5#larger-context-window-and-output
  passage: "Claude Haiku 5.5 has a 1M token context window and returns up to 128k output tokens, up from 200k and 64k on Claude Haiku 4.5."
  verified: 2026-10-07

### C23 — Two rate cards, by prompt length

- change: Haiku 5.5 costs USD 0.10 / 0.50 per million tokens up to 100,000 prompt tokens and USD 0.50 / 2.50 above, against USD 1 / 5 for Haiku 4.5 at any length.
- source: https://platform.claude.com/docs/en/about-claude/pricing#long-context-pricing
  passage: "Claude Haiku 5.5 is priced by prompt length: a prompt of over 100,000 tokens pays higher prices."
  verified: 2026-10-07
- source: https://platform.claude.com/docs/en/models/haiku-5-5/overview
  passage: "$0.10 / MTok for prompts up to 100,000 tokens; $0.50 / MTok for prompts over 100,000 tokens"
  verified: 2026-10-07

### C24 — The minimum cacheable prompt drops to 512 tokens

- change: Prompt caching applies from 512 tokens, against 4,096 on Haiku 4.5, so a threshold written for Haiku 4.5 skips prompts that now cache.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-caching#cache-limitations
  passage: "4,096 tokens for Claude Haiku 4.5"
  verified: 2026-10-07

### C25 — Refusals are new, with no fallback

- change: Safety classifiers can decline in four categories — `cyber`, `frontier_llm`, `bio`, `general_harms` — and Haiku 5.5 has no server-side fallback.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#safeguard-refusals
  passage: "If you're moving from Claude Haiku 4.5, these refusals are new."
  verified: 2026-10-07
- source: https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback
  passage: "Claude Haiku 5.5 has no server-side fallback: with `fallbacks: "default"`, a declined request stays declined, and a list of fallback models returns a 400 error."
  verified: 2026-10-07

### C26 — Give a searching model today's date

- change: With a search tool, the date grounds answers in recent results; a further paragraph helps at `low` effort and in long prompts, and a blanket always-search rule backfires.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#accurate-search-results
  passage: "When you give Claude Haiku 5.5 a search tool, also give it today's date."
  verified: 2026-10-07
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#accurate-search-results
  passage: "In Anthropic's testing, that instruction made the model search on half of the prompts that needed no search."
  verified: 2026-10-07

### C27 — JSON output with the caller's tools needs thinking on

- change: With thinking off and structured output requested, the model may skip a tool call it needs.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#json-output-with-your-own-tools
  passage: "With thinking off, Claude Haiku 5.5 might skip a tool call it needs when you also request JSON output with structured outputs."
  verified: 2026-10-07

### C28 — Early stopping in long agent prompts

- change: With a long coding-agent prompt at `low` effort the model sometimes hands the task back early; `medium` or a carry-through text reduces it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#prevent-early-stopping-in-long-agent-prompts
  passage: "With a long coding-agent system prompt at `low` effort, it sometimes stops early and hands the task back to the user."
  verified: 2026-10-07

### C29 — Verification can be skipped at `low` and `medium`

- change: The model sometimes reports a code change as done without running a check; a verification paragraph addresses it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#tell-coding-agents-to-verify-their-changes
  passage: "At `low` and `medium` effort, Claude Haiku 5.5 sometimes reports a code change as done without running a check."
  verified: 2026-10-07

### C30 — User text placed with tool results can be ignored

- change: User words inside a `tool_result`, or in a system message right after one, can read as untrusted text; they go in a text block after the last tool result.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#mid-turn-user-messages
  passage: "Never put user text inside a `tool_result` block."
  verified: 2026-10-07

### C31 — Chatbots keep their rules with a hold line

- change: A line saying the system prompt's rules hold for the whole conversation, with `high` effort, helps a chatbot keep to them.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#keep-chatbots-to-their-system-prompt
  passage: "In Anthropic's testing, this text made the model keep to its system prompt more often."
  verified: 2026-10-07

### C32 — Reasoning-like text in replies

- change: Replies sometimes carry reasoning-like text, more often with thinking off or at `low`; adaptive thinking at `medium` addresses it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#keep-reasoning-out-of-user-facing-text
  passage: "This happens more often with thinking off or at `low` effort."
  verified: 2026-10-07

### C33 — Empty replies at `xhigh`

- change: In multi-turn chats at `xhigh` the model sometimes ends a turn with no visible text.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#use-effort-to-control-thinking
  passage: "the model sometimes writes its whole answer in its thinking and ends the turn with no visible text."
  verified: 2026-10-07

### C34 — Changing top-level effort between requests drops the prompt cache

- change: A different top-level `effort` on the next request invalidates the cache; a per-message effort change with adaptive thinking keeps it.
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5#use-effort-to-control-thinking
  passage: "Changing the top-level `effort` value between requests invalidates the prompt cache for the conversation's messages."
  verified: 2026-10-07

### C35 — Forced tool use is accepted but skips thinking

- change: Unlike Opus 5.5 and Sonnet 5.5, Haiku 5.5 accepts a forced `tool_choice`, and the response then starts with the call and no thinking.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#configure-thinking
  passage: "Claude Haiku 5.5 accepts a forced `tool_choice` (`any` or a named tool), but the response starts with the tool call and has no `thinking` block."
  verified: 2026-10-07

### C36 — No Priority Tier

- change: Priority Tier is not supported on Haiku 5.5.
- source: https://platform.claude.com/docs/en/models/haiku-5-5/migration-guide#migration-checklist
  passage: "Priority Tier is not supported on Claude Haiku 5.5."
  verified: 2026-10-07

</changes>

<older_residue>

Ids and instructions written for a Haiku model older than Haiku 4.5, already retired before this transition. They are not part of it; each is recorded as older residue only with its passage below.

### R01 — Retired Haiku 3.5 and Haiku 3 ids

- residue: `claude-3-5-haiku-20241022` and `claude-3-haiku-20240307` were retired on the Claude API, each with Haiku 4.5 as its recommended replacement.
- source: https://platform.claude.com/docs/en/about-claude/model-deprecations#2025-12-19-claude-haiku-3-5-model
  passage: "On December 19, 2025, Anthropic notified developers using Claude Haiku 3.5 model of its upcoming retirement on the Claude API."
  verified: 2026-10-07
- source: https://platform.claude.com/docs/en/about-claude/model-deprecations#2026-02-19-claude-haiku-3-model
  passage: "On February 19, 2026, Anthropic notified developers using Claude Haiku 3 model of its upcoming retirement on the Claude API."
  verified: 2026-10-07

</older_residue>
</content>
</invoke>
