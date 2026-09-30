# Answer key: Sonnet 5 → Sonnet 5.5 fixture

Each grader below reads the "Final list" of the audit's `findings.md`, through the `.eval-findings.md` link the scaffold makes. A positive passes when a line names the file, a line within ±2 of the key's, and the expected status; the finding's id is not checked, since discovery numbers its own findings `D01`, `D02`, …. A residue row passes when no line on that exact location proposes a change: since 0.6.1 (#80) residue may be listed as `older residue`, discarded, or left out. A negative passes when no line on that exact location proposes a change. The key is the fixture's development key, adjusted to the audit's documented rules as of 0.6.1: `lint-fixer.md:4` P18 is a negative, since the verifier discards it under the project-memory rule, and the two P04 settings and the P19 countdown hook expect `change`, since #64 turned them from re-tests into removals.

| Grader | Location (±2 lines; negatives exact) | Expected | Why |
|---|---|---|---|
| `pos-01-settings-json-3-change` | `.claude/settings.json:3` | change (exact line) | P01: `model: claude-sonnet-5` in project settings |
| `pos-02-settings-json-4-change` | `.claude/settings.json:4` | change (exact line) | P04: remove `alwaysThinkingEnabled: false`, which has no effect on Sonnet 5.5 (#64) |
| `pos-03-settings-json-6-change` | `.claude/settings.json:6` | change (exact line) | P04: remove `MAX_THINKING_TOKENS: 0`, which has no effect on Sonnet 5.5 (#64) |
| `pos-04-tool-budget-mjs-27-change` | `scripts/claude-hooks/tool-budget.mjs:27`, `.claude/settings.json:40` | change | P19: remove the PostToolUse budget countdown hook (#64) |
| `pos-05-model-notes-mjs-11-re-test` | `scripts/claude-hooks/model-notes.mjs:11` | re-test | P05: model-id prefix match in a SessionStart hook |
| `pos-06-check-agent-models-mjs-10-re-test` | `scripts/check-agent-models.mjs:10` | re-test | P05: model-id prefix match in a gate script |
| `pos-07-claude-md-21-optional` | `CLAUDE.md:21`, `.claude/skills/fix-bug/SKILL.md` (any line) | optional | P15: minimal-diff fence that omits unrequested tests, docs and files |
| `pos-08-conventions-md-5-re-test` | `docs/claude/conventions.md:5` | re-test (exact line) | P06: `model: "sonnet"` alias in an Agent-call convention |
| `pos-09-conventions-md-6-change` | `docs/claude/conventions.md:6` | change | P02: `claude-sonnet-5` in a dispatch recipe |
| `pos-10-conventions-md-6-re-test` | `docs/claude/conventions.md:6` | re-test (exact line) | P03: the same recipe carries no effort |
| `pos-11-investigate-md-10-change` | `.claude/commands/investigate.md:10` | change | P10: holds all findings for the final response |
| `pos-12-brainstorm-md-6-optional` | `.claude/commands/brainstorm.md:6` | optional | P17: asks for options with no instruction to stop there |
| `pos-13-reply-loop-ts-21-change` | `src/assistant/reply-loop.ts:21` | change | P24: adds a tool partway through a session |
| `pos-14-reply-loop-ts-25-change` | `src/assistant/reply-loop.ts:25` | change | P32: `max_tokens: 1024` in an agentic loop |
| `pos-15-reply-loop-ts-29-change` | `src/assistant/reply-loop.ts:29` | change | P35: effort switches between requests of one conversation |
| `pos-16-reply-loop-ts-38-change` | `src/assistant/reply-loop.ts:38` | change | P26: renders only text blocks |
| `pos-17-reply-loop-ts-49-change` | `src/assistant/reply-loop.ts:49` | change | P33: throws on an inexact tool name |
| `pos-18-reply-loop-ts-57-change` | `src/assistant/reply-loop.ts:57` | change | P27: mid-turn user text inside a tool_result |
| `pos-19-history-ts-20-optional` | `src/assistant/history.ts:20` | optional | P21: replays tool results with terminal noise |
| `pos-20-history-ts-24-optional` | `src/assistant/history.ts:24` | optional | P21: splices a synthetic assistant turn |
| `pos-21-history-ts-39-change` | `src/assistant/history.ts:39` | change | P25: sends the Sonnet loop's messages to another model |
| `pos-22-faq-ts-13-change` | `src/assistant/faq.ts:13` | change | P22: `thinking: disabled` (TypeScript) |
| `pos-23-classify-ts-30-change` | `src/triage/classify.ts:30` | change | P23: forced `tool_choice` (TypeScript) |
| `pos-24-sla-estimate-ts-30-change` | `src/triage/sla-estimate.ts:30` | change | P31: JSON asked in the prompt at low effort |
| `pos-25-browser-agent-ts-24-change` | `src/portal/browser-agent.ts:24` | change | P28: `computer_20251124` on the Claude API |
| `pos-26-client-py-15-change` | `worker/client.py:15` | change | P36: `cache_control` only above 1,024 tokens |
| `pos-27-client-py-43-change` | `worker/client.py:43`, `worker/client.py:23`, `worker/client.py:32` | change | P30: no refusal branch |
| `pos-28-summarize-py-22-change` | `worker/summarize.py:22` | change | P22: `thinking: disabled` (Python) |
| `pos-29-tagger-py-32-change` | `worker/tagger.py:32` | change | P23: forced `tool_choice` in count_tokens |
| `pos-30-tagger-py-45-change` | `worker/tagger.py:45` | change | P23: forced `tool_choice` in create |
| `pos-31-advisor-review-py-10-change` | `worker/advisor_review.py:10` | change | P29: older advisor with a Sonnet 5.5 executor |
| `pos-32-chart-insights-py-26-change` | `worker/chart_insights.py:26` | change | P34: dense images with no crop or zoom tool |
| `pos-33-ticket-researcher-md-4-change` | `.claude/agents/ticket-researcher.md:4` | change | P02: agent pinned to `claude-sonnet-5` |
| `pos-34-ticket-researcher-md-5-re-test` | `.claude/agents/ticket-researcher.md:5` | re-test | P03: effort carried over from Sonnet 5 |
| `pos-35-ticket-researcher-md-any-optional` | `.claude/agents/ticket-researcher.md` (any line) | optional | P14: background investigation with no carry-through line |
| `pos-36-code-fixer-md-4-change` | `.claude/agents/code-fixer.md:4` | change | P02: agent pinned to `claude-sonnet-5` |
| `pos-37-code-fixer-md-4-re-test` | `.claude/agents/code-fixer.md:4` | re-test | P03: pin with no effort |
| `pos-38-code-fixer-md-13-optional` | `.claude/agents/code-fixer.md:13`, `.claude/agents/code-fixer.md:4` | optional (exact line) | P14: multipart coding with no carry-through line |
| `pos-39-code-fixer-md-15-optional` | `.claude/agents/code-fixer.md:15` | optional (exact line) | P15: scope fence that omits docs and files |
| `pos-40-policy-answerer-md-4-change` | `.claude/agents/policy-answerer.md:4` | change | P12: WebSearch with no check-current-facts instruction |
| `pos-41-policy-answerer-md-9-change` | `.claude/agents/policy-answerer.md:9` | change | P11: only use tools when strictly necessary |
| `pos-42-kb-sync-md-4-re-test` | `.claude/agents/kb-sync.md:4` | re-test | P06: `model: sonnet` alias |
| `pos-43-kb-sync-md-5-optional` | `.claude/agents/kb-sync.md:5` | optional | P14: background, low effort, no carry-through line |
| `pos-44-release-captain-md-4-optional` | `.claude/agents/release-captain.md:4` | optional | P16: `xhigh` on routine work |
| `pos-45-refund-operator-md-9-optional` | `.claude/agents/refund-operator.md:9` | optional | P20: blanket authorization on a billing agent |
| `pos-46-data-migrator-md-4-already-decided` | `.claude/agents/data-migrator.md:4` | already decided | P02: an ADR keeps this pin on Sonnet 5 |
| `pos-47-skill-md-13-re-test` | `.claude/skills/model-notes-sonnet-5/SKILL.md:13` | re-test (exact line) | P07: `xhigh` recommended for the hardest coding |
| `pos-48-skill-md-14-re-test` | `.claude/skills/model-notes-sonnet-5/SKILL.md:14` | re-test (exact line) | P07: low and medium add no tests, docs or files |
| `pos-49-skill-md-18-change` | `.claude/skills/model-notes-sonnet-5/SKILL.md:18` | change | P08: only think when a step needs it |
| `pos-50-skill-md-8-optional` | `.claude/skills/incident-bridge/SKILL.md:8` | optional | P13: long human-in-the-loop work with no update guidance |
| `pos-51-skill-md-11-change` | `.claude/skills/triage-queue/SKILL.md:11` | change | P09: reasoning requested in the reply (the line is cited by number and never quoted) |
| `pos-52-skill-md-10-change` | `.claude/skills/explain-invoice/SKILL.md:10` | change | P09: reasoning requested in the reply (the line is cited by number and never quoted) |
| `pos-53-skill-md-10-change` | `.claude/skills/customer-reply/SKILL.md:10` | change | P08: respond directly, thinking adds latency |
| `pos-54-skill-md-14-change` | `.claude/skills/backfill-tags/SKILL.md:14` | change | P02: `claude -p --model claude-sonnet-5` recipe |
| `pos-55-skill-md-14-re-test` | `.claude/skills/backfill-tags/SKILL.md:14` | re-test | P03: the launch has no `--effort` |
| `pos-56-effort-levels-md-9-re-test` | `.claude/rules/effort-levels.md:9` | re-test | P07: levels carry over unchanged |
| `pos-57-support-voice-md-3-change` | `.claude/rules/shared/support-voice.md:3` | change (exact line) | P08, read-only: don't overthink |
| `pos-58-support-voice-md-4-change` | `.claude/rules/shared/support-voice.md:4` | change (exact line) | P11, read-only: minimize tool calls |
| `res-01-classify-ts-27` | `src/triage/classify.ts:27` | not change or re-test or optional (older residue) | `temperature: 0` |
| `res-02-summarize-py-18` | `worker/summarize.py:18` | not change or re-test or optional (older residue) | assistant prefill |
| `res-03-skill-md-15` | `.claude/skills/triage-queue/SKILL.md:15` | not change or re-test or optional (older residue) | progress summary every 3 tool calls |
| `res-04-api-code-md-10` | `.claude/rules/api-code.md:10` | not change or re-test or optional (older residue) | `temperature: 0` in instruction text |
| `neg-01-claude-md-22` | `CLAUDE.md:22` | not change or re-test or optional | prose approval gate |
| `neg-02-claude-md-23` | `CLAUDE.md:23` | not change or re-test or optional | safety rule |
| `neg-03-conventions-md-12` | `docs/claude/conventions.md:12` | not change or re-test or optional | "respond directly" describes a human SLA |
| `neg-04-conventions-md-18` | `docs/claude/conventions.md:18` | not change or re-test or optional | "minimize tool calls" describes API batching |
| `neg-05-environments-md-17` | `docs/claude/environments.md:17` | not change or re-test or optional | Bedrock default model kept on Sonnet 5 on purpose |
| `neg-06-plan-change-md-8` | `.claude/commands/plan-change.md:8` | not change or re-test or optional | already says to stop after the plan |
| `neg-07-claude-ts-27` | `src/lib/claude.ts:27` | not change or re-test or optional | already branches on refusal |
| `neg-08-diagram-reader-py-16` | `worker/diagram_reader.py:16` | not change or re-test or optional | a crop tool is offered |
| `neg-09-diagram-reader-py-69` | `worker/diagram_reader.py:69` | not change or re-test or optional | tolerant tool-name match |
| `neg-10-refund-calc-py-16` | `worker/refund_calc.py:16` | not change or re-test or optional | "think the problem through" nudge |
| `neg-11-bedrock-portal-py-12` | `worker/bedrock_portal.py:12` | not change or re-test or optional | computer use on Bedrock |
| `neg-12-ticket-researcher-md-23` | `.claude/agents/ticket-researcher.md:23` | not change or re-test or optional | a subagent's return contract |
| `neg-13-code-fixer-md-16` | `.claude/agents/code-fixer.md:16` | not change or re-test or optional | "avoid unnecessary tool calls" in a coding agent |
| `neg-14-code-fixer-md-17` | `.claude/agents/code-fixer.md:17` | not change or re-test or optional | asks for a rationale in the pull request |
| `neg-15-release-notes-researcher-md-4` | `.claude/agents/release-notes-researcher.md:4` | not change or re-test or optional | a preloaded skill carries the check-current-facts line |
| `neg-16-architect-md-11` | `.claude/agents/architect.md:11` | not change or re-test or optional | an agent pinned to Opus 5.5 |
| `neg-17-refund-operator-md-3` | `.claude/agents/refund-operator.md:3` | not change or re-test or optional | routing urgency in a description |
| `neg-18-refund-operator-md-12` | `.claude/agents/refund-operator.md:12` | not change or re-test or optional | a confirmation step before large refunds |
| `neg-19-skill-md-19` | `.claude/skills/model-notes-sonnet-5/SKILL.md:19` | not change or re-test or optional | "think carefully" nudge |
| `neg-20-skill-md-23` | `.claude/skills/model-notes-sonnet-5/SKILL.md:23` | not change or re-test or optional | literal-scope technique |
| `neg-21-skill-md-any` | `.claude/skills/fix-bug/SKILL.md` (any line) | not change or re-test | carries carry-through and verification |
| `neg-22-skill-md-10` | `.claude/skills/escalation-review/SKILL.md:10` | not change or re-test or optional | states its own update cadence |
| `neg-23-api-code-md-11` | `.claude/rules/api-code.md:11` | not change or re-test or optional | "think the problem through" nudge |
| `neg-24-lint-fixer-md-4` | `.claude/agents/lint-fixer.md:4` | not optional | P18 discarded: the agent loads the project memory |
