# Answer key: Haiku 4.5 → Haiku 5.5 fixture

Each grader below reads the "Final list" of the audit's `findings.md`, through the `.eval-findings.md` link the scaffold makes. A positive passes when a line names the file, a line within ±2 of the key's, and the expected status; the finding's id is not checked, since discovery numbers its own findings `D01`, `D02`, …. Where another row with the same status sits within two lines in the same file, the line must be exact, and where the trap can sit on more than one line, every line it may take is listed. A residue row passes when no line on that exact location proposes a change. A negative passes when no line on that exact location proposes a change.

The fixture was written in 0.8.0 from the transition's own known traps, so it is a regression check, not a held-out evaluation. Two rows were adjusted after the first paid run (3 runs, 2026-10-07, scores 0.98, 0.98 and 0.96), each for a stated reason:

- `pos-02-settings-json-6-change` is unchanged; the trap was fixed instead. P01 said to record Haiku 4.5 once per settings file, so every run folded `CLAUDE_CODE_SUBAGENT_MODEL` into the `ANTHROPIC_DEFAULT_HAIKU_MODEL` finding, and two runs misread its precedence over an agent's `model:`. P01 now records one finding per setting and states that precedence.
- `pos-18-model-routing-md-8-re-test` also accepts `.claude/agents/faq-researcher.md:4`: P06 records the `haiku` alias once per dispatch convention, one line naming every file it covers, and one run recorded it on the agent, naming the routing rows.

| Grader | Location (±2 lines unless exact) | Expected | Why |
|---|---|---|---|
| `pos-01-settings-json-5-change` | `.claude/settings.json:5` | change (exact line) | P01: `ANTHROPIC_DEFAULT_HAIKU_MODEL` names Haiku 4.5, which also picks the background model |
| `pos-02-settings-json-6-change` | `.claude/settings.json:6` | change (exact line) | P01: `CLAUDE_CODE_SUBAGENT_MODEL` names Haiku 4.5 |
| `pos-03-settings-json-7-change` | `.claude/settings.json:7` | change (exact line) | P04: `MAX_THINKING_TOKENS` has no effect on Haiku 5.5 |
| `pos-04-settings-json-3-re-test` | `.claude/settings.json:3` | re-test (exact line) | P03: a top-level `effortLevel` now reaches Haiku 5.5 |
| `pos-05-model-skill-mjs-7-change` | `scripts/claude-hooks/model-skill.mjs:7,12` | change | P05: a family prefix sends the Haiku 4.5 notes to Haiku 5.5 |
| `pos-06-ticket-tagger-md-4-change` | `.claude/agents/ticket-tagger.md:4` | change | P02: agent pinned to `claude-haiku-4-5` |
| `pos-07-ticket-tagger-md-4-re-test` | `.claude/agents/ticket-tagger.md:4` | re-test (exact line) | P03: the pin moves with no effort |
| `pos-08-ticket-tagger-md-11-change` | `.claude/agents/ticket-tagger.md:11` | change | P08: tells the model to answer directly and not think |
| `pos-09-faq-researcher-md-4-re-test` | `.claude/agents/faq-researcher.md:4` | re-test (exact line) | P06: `model: haiku` alias |
| `pos-10-faq-researcher-md-5-change` | `.claude/agents/faq-researcher.md:5,8,9` | change (exact line) | P09: WebSearch with no date in the prompt |
| `pos-11-faq-researcher-md-11-change` | `.claude/agents/faq-researcher.md:11` | change (exact line) | P10: blanket instruction to always search |
| `pos-12-patch-writer-md-4-change` | `.claude/agents/patch-writer.md:4` | change | P02: agent pinned to the dated Haiku 4.5 id |
| `pos-13-patch-writer-md-5-re-test` | `.claude/agents/patch-writer.md:4,5` | re-test (exact line) | P03: an `effort:` Haiku 4.5 never honoured |
| `pos-14-patch-writer-md-any-optional` | `.claude/agents/patch-writer.md` (any line) | optional | P12 or P11: coding agent at `low` with no verification or carry-through text |
| `pos-15-support-bot-md-4-change` | `.claude/agents/support-bot.md:4` | change | P02: chatbot pinned to `claude-haiku-4-5` |
| `pos-16-support-bot-md-any-optional` | `.claude/agents/support-bot.md` (any line) | optional | P13: chatbot rules with no rules-hold line |
| `pos-17-batch-reporter-md-4-already-decided` | `.claude/agents/batch-reporter.md:4` | already decided | P02: an ADR keeps this pin on Haiku 4.5 |
| `pos-18-model-routing-md-8-re-test` | `.claude/rules/model-routing.md:8,9`, `.claude/agents/faq-researcher.md:4` | re-test (exact line) | P06: `haiku` alias in the routing table, recorded once per convention, so on the table row or on the agent that shares it |
| `pos-19-model-routing-md-10-re-test` | `.claude/rules/model-routing.md:10` | re-test (exact line) | P07 or P22: claims Haiku never refuses |
| `pos-20-model-routing-md-12-re-test-or-change` | `.claude/rules/model-routing.md:12` | re-test or change (exact line) | P07 or P18: Haiku 4.5's price stated as Haiku's |
| `pos-21-claude-md-13-re-test` | `CLAUDE.md:13` | re-test (exact line) | P07: claims Haiku does not think unless asked |
| `pos-22-claude-md-14-re-test` | `CLAUDE.md:14` | re-test (exact line) | P07 or P17: a 200K window assumed for Haiku |
| `pos-23-readme-or-claude-md-any-change` | `README.md` (any line), `CLAUDE.md` (any line) | change | P16: no Claude Code version floor for Haiku 5.5 |
| `pos-24-skill-md-16-change` | `.claude/skills/triage-ticket/SKILL.md:16` | change (exact line) | P02: `claude -p --model claude-haiku-4-5` recipe |
| `pos-25-skill-md-16-re-test` | `.claude/skills/triage-ticket/SKILL.md:16` | re-test (exact line) | P03: the launch has no `--effort` |
| `pos-26-prices-ts-11-change` | `scripts/metrics/prices.ts:11` | change | P18: price table with no Haiku 5.5 rate cards |
| `pos-27-claude-ts-6-change` | `src/lib/claude.ts:6` | change (exact line) | P40: Haiku 4.5 id held in the client module |
| `pos-28-classify-ts-11-change` | `src/triage/classify.ts:11` | change (exact line) | P29: `max_tokens: 5` leaves no room for thinking |
| `pos-29-classify-ts-12-change` | `src/triage/classify.ts:12` | change (exact line) | P24: `temperature: 0` |
| `pos-30-classify-ts-16-change` | `src/triage/classify.ts:15,16` | change (exact line) | P25: assistant prefill |
| `pos-31-classify-ts-20-change` | `src/triage/classify.ts:19,20,21` | change (exact line) | P29: reads `content[0]` as the answer |
| `pos-32-summarize-ts-10-change` | `src/triage/summarize.ts:10,21` | change (exact line) | P38: caching gated at 4,096 tokens |
| `pos-33-summarize-ts-14-change` | `src/triage/summarize.ts:14` | change (exact line) | P23: `budget_tokens` thinking |
| `pos-34-browser-check-ts-9-change` | `src/portal/browser-check.ts:9` | change | P26: `computer_20250124` on the Claude API |
| `pos-35-chat-ts-22-change` | `src/assistant/chat.ts:22,30` | change (exact line) | P31: a fallback list Haiku 5.5 rejects, and no refusal branch |
| `pos-36-chat-ts-23-change` | `src/assistant/chat.ts:23` | change (exact line) | P33: effort switches between requests of one conversation |
| `pos-37-chat-ts-42-change` | `src/assistant/chat.ts:42` | change | P34: mid-turn user text inside a `tool_result` |
| `pos-38-extract-py-18-change` | `worker/extract.py:18,19` | change | P24: `temperature` and `top_k` (Python) |
| `pos-39-extract-py-9-change` | `worker/extract.py:9` | change (exact line) | P40: Haiku 4.5 id held in the worker |
| `res-01-legacy-digest-py-7` | `worker/legacy_digest.py:7` | not change or re-test or optional (older residue) | a retired Haiku 3.5 id |
| `neg-01-claude-md-7` | `CLAUDE.md:7` | not change or re-test or optional | a test rule |
| `neg-02-settings-json-2` | `.claude/settings.json:2` | not change or re-test or optional | the session runs Opus 5.5 |
| `neg-03-architect-md-4` | `.claude/agents/architect.md:4` | not change or re-test or optional | an agent pinned to Opus 5.5 |
| `neg-04-architect-md-5` | `.claude/agents/architect.md:5` | not change or re-test or optional | its effort, set for Opus 5.5 |
| `neg-05-claude-ts-9` | `src/lib/claude.ts:9` | not change or re-test or optional | the Opus 5.5 id |
| `neg-06-route-ts-11` | `src/triage/route.ts:11` | not change or re-test or optional | `disabled` thinking at `low` effort, with no tools, which Haiku 5.5 accepts |
| `neg-07-plan-release-md-7` | `.claude/commands/plan-release.md:7` | not change or re-test or optional | already says to stop after the plan |
| `neg-08-extract-py-23` | `worker/extract.py:23` | not change or re-test or optional | already branches on refusal |
| `neg-09-model-routing-md-7` | `.claude/rules/model-routing.md:7` | not change or re-test or optional | the Opus 5.5 row |
