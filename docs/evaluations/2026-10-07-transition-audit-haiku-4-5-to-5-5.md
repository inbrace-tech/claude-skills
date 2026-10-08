# Haiku 4.5 → Haiku 5.5: the new transition, measured, 2026-10-07

The Haiku 4.5 → Haiku 5.5 transition ([#135](https://github.com/inbrace-tech/claude-skills/issues/135), [#136](https://github.com/inbrace-tech/claude-skills/pull/136)) was measured twice before release: with the plugin's regression suite, on a seeded fixture, and with one field run on a private repository that was due to migrate its Haiku tier.

**In short:** the first suite pass scored 0.98 on the full audit and found a defect in the transition's own knowledge file. The defect was fixed before release, and a confirmation run scored 1.00. On the private repository, the audit found all 7 sites of a key sealed before the run and held all 3 negatives. **That field run is not blind.** The key's author also wrote the transition's traps, so the figure checks that the audit covers a real migration. It is not a capability number.

## Regression suite

The plugin's [`claude plugin eval` suite](../../plugins/inbrace-config/evals/README.md), on the branch of #136, with the README's command: `--model claude-opus-5-5`, `--ablation none`, `Bash`, `Write` and `Edit` granted, no fetch tool, `--concurrency 2`. The Haiku fixture is new in this release. It has 39 positives, 9 negatives and one older-residue row, all written from the transition's own traps.

| Case | First pass, 3 runs | After the fix, 1 run |
|---|---|---|
| `bad-argument` | 1.00 (3/3) | — |
| `headless-without-scope` | 1.00 (3/3) | — |
| `full-audit` | **0.98** (0.98, 0.98, 0.96) | **1.00** |

The first pass cost US$21.16 at list price and the confirmation run US$5.25. Every full-audit run reached no network: no WebFetch, `curl`, `wget` or `gh`.

**What the first pass found:**

- **A defect in the knowledge file, `pos-02`, missing in all three runs.** Trap P01 told the audit to record a Haiku 4.5 setting once per settings file. Every run therefore folded `CLAUDE_CODE_SUBAGENT_MODEL` into the finding on `ANTHROPIC_DEFAULT_HAIKU_MODEL`. Two runs also claimed that an agent's pinned `model:` had no effect while that variable stayed. The model-config page says the opposite: "A per-invocation model or a definition's `model` field, including `inherit`, takes precedence." P01 now records one finding per setting and quotes that passage. The confirmation run found the line.
- **A key row stricter than the audit's rule, `pos-18`, missing in one run.** Trap P06 records the `haiku` alias once per dispatch convention, as one line that names every file. That run recorded the convention on the agent and named the routing-table rows. The row now accepts either location, and [`KEY.md`](../../plugins/inbrace-config/evals/haiku-5-5/full-audit/KEY.md) states why.

## Field run on a private repository (exploratory, not blind)

- **Target.** A private multi-agent harness, the same kind of repository as the harness of the [v3 evaluation](2026-09-29-transition-audit-v3.md), scheduled to move its Haiku tier from 4.5 to 5.5. Its maintainer's issue listed the sites measured with `git grep`.
- **Key.** Written from that list and a survey of the repository, then sealed with its hash registered (`01593ed2…0fba36`) before any run. It holds 7 positives: a closed model-to-skill table, a price sheet and its CI-checked copy, the `haiku` alias convention, an `effort: low` set while Haiku had no effort levels, a Claude Code version floor, and the decision on a Haiku prompting skill. It also holds 3 negatives. The key's author also wrote the transition's traps, so the run is labelled exploratory.
- **Controls, as in v3.** Claude Opus 5.5 at `--effort medium`, one headless `claude -p` session on a fresh copy of the target, hooks disabled. The plugin snapshot was the fixed commit on #136. The session ran `/inbrace-config:audit-haiku-5-5 --scope full --mode agents --stop-at-report`.

| | Result |
|---|---|
| **Sites of the sealed key found** | **7/7**, each with the expected status |
| Negatives held | 3/3 |
| Correct findings beyond the key | refusal handling (P22), token medians that mix Haiku 4.5 and 5.5 counts (P17), every `effort: 'low'` recipe for the Haiku stage (P03) |
| Findings outside the known traps | 0 (13 discovery findings, all matching a trap) |
| Verifier | 1 duplicate discarded, 10 downgraded from change to re-test or optional |
| Cost per run | US$33.17, 17 minutes |

The run found nothing the traps did not already describe. On a repository whose Haiku use is a single mechanical stage, that is the expected result. It also means the run says nothing about what discovery would add on a project that uses Haiku in more roles.

## Limitations

- **The fixture and the key share an author with the traps.** A high score says the audit applies its traps, not that it generalises. No held-out repository was written for this transition.
- **One field run.** The private repository was audited once. The v3 runs varied by up to 5 items on the same target.
- **The confirmation is one run.** The defect it checks failed in three of three runs before the fix.
