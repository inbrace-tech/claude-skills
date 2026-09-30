# Answer key: Opus 5 → Opus 5.5 fixture

Each grader below reads the "Final list" of the audit's `findings.md`, through the `.eval-findings.md` link the scaffold makes. A positive passes when a line names one of the row's files, a line within ±2 of the key's (any line where the key gives none), and the expected status; the finding's id is not checked, since discovery numbers its own findings `D01`, `D02`, …. A residue row passes when no line on that exact location proposes a change: since 0.6.1 (#80) residue may be listed as `older residue`, discarded, or left out. Read-only rows expect their underlying status, `change`, and the already-decided row expects `already decided`. A negative passes when no line on that exact location carries `change`, `re-test` or `optional`.

| Grader | Location (±2 lines; negatives exact) | Expected | Why |
|---|---|---|---|
| `pos-01-settings-json-3-change` | `.claude/settings.json:3` | change | P01: `model: claude-opus-5` with no effortLevel in project settings (P20 co-fire ok) |
| `pos-02-model-notes-mjs-17-change` | `scripts/claude-hooks/model-notes.mjs:17`, `scripts/claude-hooks/model-notes.mjs:12` | change | P22: first-match prefix list gives Opus 5.5 the Opus 5 notes; 5.5 counterpart exists |
| `pos-03-check-agent-models-mjs-10-change` | `scripts/check-agent-models.mjs:10` | change | P22: gate `/^claude-opus-5/` requires Opus 5 notes of 5.5 agents; counterpart exists |
| `pos-04-delegation-reminder-mjs-15-re-test` | `scripts/claude-hooks/delegation-reminder.mjs:15`, `scripts/claude-hooks/delegation-reminder.mjs:12` | re-test | P22: PreToolUse hook delivers the Opus 5 delegation cap by prefix; no counterpart |
| `pos-05-transcript-digest-mjs-17-re-test` | `scripts/transcript-digest.mjs:17` | re-test | P28: transcript parser keeps only text blocks |
| `pos-06-nightly-review-yml-19-change` | `.github/workflows/nightly-review.yml:19` | change | P20: `--model claude-opus-5` in the CI launch |
| `pos-07-nightly-review-yml-22-change` | `.github/workflows/nightly-review.yml:22` | change | P10: unattended claude -p run with no checklist or continuation cap |
| `pos-08-claude-md-21-re-test` | `CLAUDE.md:21` | re-test | P07: Opus 5 conciseness instruction |
| `pos-09-conventions-md-5-change` | `docs/claude/conventions.md:5` | change | P20: `model: claude-opus-5` in the Agent dispatch convention |
| `pos-10-models-md-7-change` | `docs/claude/models.md:7` | change | P27: guide index lists the Opus 5 guide, not the Opus 5.5 guide |
| `pos-11-models-md-12-change` | `docs/claude/models.md:12` | change | P27: states batch sessions run with thinking disabled |
| `pos-12-models-md-any-re-test` | `docs/claude/models.md` (any line), `.claude/settings.json:3` | re-test | P25: content-based fallback unaccounted for in the model notes |
| `pos-13-readme-md-any-change` | `README.md` (any line), `CLAUDE.md` (any line) | change | P24: no Claude Code version floor (v2.1.280) stated |
| `pos-14-clause-extractor-md-4-change` | `.claude/agents/clause-extractor.md:4` | change | P20: agent pinned to claude-opus-5 |
| `pos-15-clause-extractor-md-8-re-test` | `.claude/agents/clause-extractor.md:8` | re-test | P23: preloads model-notes-opus-5 in an agent with a P20 finding |
| `pos-16-clause-extractor-md-18-re-test` | `.claude/agents/clause-extractor.md:18` | re-test | P07: Opus 5 correction-narration instruction |
| `pos-17-redline-drafter-md-4-change` | `.claude/agents/redline-drafter.md:4` | change | P20: agent pinned to claude-opus-5 |
| `pos-18-redline-drafter-md-7-re-test` | `.claude/agents/redline-drafter.md:7` | re-test | P23: preloads model-notes-opus-5 in an agent with a P20 finding |
| `pos-19-risk-scorer-md-5-re-test` | `.claude/agents/risk-scorer.md:5` | re-test | P21: Opus 5.5 pin with effort kept from Opus 5 |
| `pos-20-risk-scorer-md-8-change-re-test` | `.claude/agents/risk-scorer.md:8` | change or re-test | P23 variant (P07/P22 ok): 5.5 agent still preloads model-notes-opus-5; `change` (remove the preload) accepted after the trial run, as the key author had flagged this row a judgement call |
| `pos-21-obligation-tracker-md-4-already-decided` | `.claude/agents/obligation-tracker.md:4` | already decided | P20: pin kept on Opus 5 by ADR 0004 after a 5.5 eval |
| `pos-22-vendor-onboarding-md-9-change` | `.claude/agents/vendor-onboarding.md:9`, `.claude/agents/vendor-onboarding.md:4` | change | P11: multi-app automation with no explore-first instruction |
| `pos-23-nightly-auditor-md-8-change` | `.claude/agents/nightly-auditor.md:8`, `.claude/agents/nightly-auditor.md:4` | change | P10: background agent with no checklist or continuation plan |
| `pos-24-review-lead-md-4-optional` | `.claude/agents/review-lead.md:4`, `.claude/agents/review-lead.md:9` | optional | P12: lead agent delegating to subagents, no time signal |
| `pos-25-review-lead-md-14-re-test` | `.claude/agents/review-lead.md:14` | re-test | P07: Opus 5 subagent-spawning cap |
| `pos-26-skill-md-12-re-test` | `.claude/skills/model-notes-opus-5/SKILL.md:12` | re-test | P07: Opus 5 conciseness / document-length tuning |
| `pos-27-skill-md-17-re-test` | `.claude/skills/model-notes-opus-5/SKILL.md:17` | re-test | P05: Opus 5 thinking-disabled mitigation |
| `pos-28-skill-md-21-change` | `.claude/skills/model-notes-opus-5/SKILL.md:21` | change | P03: 'Do not think on lookups' |
| `pos-29-skill-md-8-optional` | `.claude/skills/ask-contract/SKILL.md:8` | optional | P13: multi-turn chat with follow-ups, no 'treat as done' |
| `pos-30-skill-md-13-optional` | `.claude/skills/ask-contract/SKILL.md:13` | optional | P06: 'Think carefully before answering' in a chat skill |
| `pos-31-skill-md-11-change` | `.claude/skills/summarize-contract/SKILL.md:11` | change | P04: reasoning requested in the reply (the line is cited by number and never quoted) |
| `pos-32-skill-md-11-change` | `.claude/skills/triage-intake/SKILL.md:11` | change | P03: 'Do not think before labelling: skip thinking' |
| `pos-33-skill-md-11-re-test` | `.claude/skills/scan-reader/SKILL.md:11` | re-test | P15: forced crop and OCR before reading charts |
| `pos-34-skill-md-10-change` | `.claude/skills/portal-ui/SKILL.md:10` | change | P16: 'Make it modern and avoid a generic AI look' |
| `pos-35-skill-md-any-optional` | `.claude/skills/redline-session/SKILL.md` (any line) | optional | P09: long human-in-the-loop session with no update cadence |
| `pos-36-skill-md-14-change` | `.claude/skills/bulk-reextract/SKILL.md:14` | change | P20: `claude -p --model claude-opus-5` launch recipe |
| `pos-37-skill-md-4-change` | `.claude/skills/quarterly-report/SKILL.md:4` | change | P20: skill frontmatter `model: claude-opus-5` |
| `pos-38-skill-md-5-re-test` | `.claude/skills/vendor-scorecard/SKILL.md:5` | re-test | P21: Opus 5.5 skill with effort kept from Opus 5 |
| `pos-39-explain-clause-md-3-change` | `.claude/commands/explain-clause.md:3` | change | P20: command frontmatter `model: claude-opus-5` |
| `pos-40-explain-clause-md-10-change` | `.claude/commands/explain-clause.md:10` | change | P04: reasoning requested in the reply (the line is cited by number and never quoted) |
| `pos-41-writing-md-10-re-test` | `.claude/rules/writing.md:10` | re-test | P07: Opus 5 scope instruction |
| `pos-42-review-voice-md-3-change` | `.claude/rules/shared/review-voice.md:3` | change | P03 (read-only): 'skip thinking' in a gitignored synced rule |
| `pos-43-review-voice-md-6-change` | `.claude/rules/shared/review-voice.md:6` | change | P04: reasoning requested in the reply (the line is cited by number and never quoted); the file is read-only |
| `pos-44-anthropic-ts-6-change` | `src/lib/anthropic.ts:6` | change | D: MODEL = claude-opus-5 in the client wrapper |
| `pos-45-classify-ts-21-change` | `src/intake/classify.ts:21` | change | P02: thinking disabled (TS) |
| `pos-46-classify-ts-25-change` | `src/intake/classify.ts:25` | change | P17: forced tool_choice type tool (TS) |
| `pos-47-redline-loop-ts-51-change` | `src/review/redline-loop.ts:51` | change | P08: agentic loop renders only text blocks |
| `pos-48-redline-loop-ts-64-change` | `src/review/redline-loop.ts:64` | change | P19: rewrites system mid-session |
| `pos-49-ask-ts-12-change` | `src/chat/ask.ts:12` | change | P14: pasted email forwarded unmarked |
| `pos-50-vendor-portal-agent-ts-30-change` | `src/portal/vendor-portal-agent.ts:30` | change | P18: computer_20251124 on the Claude API |
| `pos-51-model-prices-ts-3-change` | `src/billing/model-prices.ts:3`, `src/billing/model-prices.ts:9` | change | P26: price table with no claude-opus-5-5 entry, stem lookup |
| `pos-52-client-py-9-change` | `worker/client.py:9` | change | D: default model claude-opus-5 in the worker client |
| `pos-53-extract-py-37-change` | `worker/extract.py:37` | change | P17: tool_choice any in count_tokens (Py) |
| `pos-54-extract-py-45-change` | `worker/extract.py:45` | change | P02: thinking disabled (Py) |
| `pos-55-extract-py-49-change` | `worker/extract.py:49` | change | P17: tool_choice any in create (Py) |
| `pos-56-session-py-37-change` | `worker/session.py:37` | change | P19: appends a tool to tools mid-session |
| `pos-57-bedrock-portal-py-10-change` | `worker/bedrock_portal.py:10` | change | D: Bedrock id anthropic.claude-opus-5 |
| `res-01-claude-md-23` | `CLAUDE.md:23` | not change or re-test or optional (older residue) | 'Use subagents liberally' — delegate-more guidance |
| `res-02-skill-md-14` | `.claude/skills/redline-session/SKILL.md:14` | not change or re-test or optional (older residue) | explicit final verification step by a subagent |
| `res-03-review-pr-md-8` | `.claude/commands/review-pr.md:8` | not change or re-test or optional (older residue) | severity filter 'only report high-severity issues' in a review prompt |
| `res-04-security-reviewer-md-10` | `.claude/agents/security-reviewer.md:10` | not change or re-test or optional (older residue) | severity filter 'Only report high-severity issues' in a review agent |
| `neg-01-claude-md-26` | `CLAUDE.md:26` | not change or re-test or optional | safety rule: never send anything to a vendor |
| `neg-02-conventions-md-11` | `docs/claude/conventions.md:11` | not change or re-test or optional | P07 word: a pull request's scope, not the model's |
| `neg-03-review-process-md-6` | `docs/claude/review-process.md:6` | not change or re-test or optional | P03 phrase in a human SLA description |
| `neg-04-check-agent-models-mjs-19` | `scripts/check-agent-models.mjs:19` | not change or re-test or optional | P22: startsWith('model:') parses YAML |
| `neg-05-security-reviewer-md-4` | `.claude/agents/security-reviewer.md:4` | not change or re-test or optional | P20: `model: opus` resolves to Opus 5.5 |
| `neg-06-citation-checker-md-4` | `.claude/agents/citation-checker.md:4` | not change or re-test or optional | P20/P21: already claude-opus-5-5, no effort |
| `neg-07-citation-checker-md-16` | `.claude/agents/citation-checker.md:16` | not change or re-test or optional | P09/P10: subagent return contract |
| `neg-08-clause-lookup-md-9` | `.claude/agents/clause-lookup.md:9` | not change or re-test or optional | P03: agent pinned to claude-sonnet-5-5 |
| `neg-09-pricing-analyst-md-5` | `.claude/agents/pricing-analyst.md:5` | not change or re-test or optional | P21: effort re-derived on Opus 5.5 by a recorded eval |
| `neg-10-renewal-watcher-md-3` | `.claude/agents/renewal-watcher.md:3` | not change or re-test or optional | P03 phrase: routing urgency in description |
| `neg-11-renewal-watcher-md-9` | `.claude/agents/renewal-watcher.md:9` | not change or re-test or optional | P11: already has the explore-broadly instruction |
| `neg-12-skill-md-12` | `.claude/skills/model-notes-opus-5-5/SKILL.md:12` | not change or re-test or optional | P03: 'answer directly without deliberating' is the 5.5 guide's own line |
| `neg-13-skill-md-11` | `.claude/skills/drawing-reader/SKILL.md:11` | not change or re-test or optional | P15: optional crop tool for the densest drawings |
| `neg-14-skill-md-10` | `.claude/skills/renewal-review/SKILL.md:10` | not change or re-test or optional | P09: states its own update cadence |
| `neg-15-skill-md-18` | `.claude/skills/bulk-reextract/SKILL.md:18` | not change or re-test or optional | P10: checklist, continuation rule and cap of two |
| `neg-16-followup-chat-md-7` | `.claude/commands/followup-chat.md:7` | not change or re-test or optional | P13: already has 'treat that answer as done' |
| `neg-17-email-templates-md-10` | `.claude/rules/email-templates.md:10` | not change or re-test or optional | P16: names the specific patterns to avoid |
| `neg-18-stream-view-ts-6` | `src/review/stream-view.ts:6` | not change or re-test or optional | D: already-migrated claude-opus-5-5 id |
| `neg-19-stream-view-ts-13` | `src/review/stream-view.ts:13` | not change or re-test or optional | P02: adaptive thinking with display updates |
| `neg-20-stream-view-ts-21` | `src/review/stream-view.ts:21` | not change or re-test or optional | P08: renders thinking progress updates |
| `neg-21-ask-ts-32` | `src/chat/ask.ts:32` | not change or re-test or optional | P14: pasted thread wrapped in pasted_content tags |
| `neg-22-schema-call-ts-36` | `src/extract/schema-call.ts:36` | not change or re-test or optional | P17: tool_choice auto with strict tool |
| `neg-23-bedrock-portal-py-18` | `worker/bedrock_portal.py:18` | not change or re-test or optional | P18: computer_20251124 on Bedrock only |
| `neg-24-prices-py-5` | `worker/prices.py:5` | not change or re-test or optional | P26: table already has a claude-opus-5-5 entry |
| `neg-25-team-runner-py-54` | `worker/team_runner.py:54` | not change or re-test or optional | P12: harness already appends elapsed time |
