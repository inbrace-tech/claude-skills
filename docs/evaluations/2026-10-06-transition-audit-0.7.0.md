# 0.7.0: the audit that reaches no network, re-measured, 2026-10-06

0.7.0 changes where the audit's knowledge comes from. It no longer downloads Anthropic's documentation at run time. It reads the change digest and known traps that ship with each transition, checked against the docs as of 2026-10-06 ([#105](https://github.com/inbrace-tech/claude-skills/issues/105)). Discovery's input changed, so [#110](https://github.com/inbrace-tech/claude-skills/issues/110) asked for both measurements to be re-run before the release: the plugin's regression suite, and the capability check on the held-out repositories.

**In short:** the redesign lost nothing measurable. On the regression suite, 0.7.0 scored 0.95 (Opus 5 → 5.5) and 0.99 (Sonnet 5 → 5.5) on the full audit, mean of three runs, against 0.956 and 0.956 for 0.6.1 in one run each. On the v3 held-out repositories it found 33 of 35 Sonnet items and 31 of 34 Opus items, against 31.0 and 29.5 for 0.6.0. Every run was cheaper than 0.6.0's. **The held-out figures are not blind.** The 0.6.1 fixes were derived from these repositories, so the figures are an upper bound for 0.7.0, not proof of a gain over 0.6.0.

## Regression suite

The plugin's [`claude plugin eval` suite](../../plugins/inbrace-config/evals/README.md), run on the version branch of [#124](https://github.com/inbrace-tech/claude-skills/pull/124) with the README's command: `--model claude-opus-5-5`, `--ablation none`, three runs per case, `Bash`, `Write` and `Edit` granted, no fetch tool.

| Case | Opus 5 → 5.5 | Sonnet 5 → 5.5 | 0.6.1, one run ([#86](https://github.com/inbrace-tech/claude-skills/issues/86)) |
|---|---|---|---|
| `bad-argument` | 1.00 (3/3) | 1.00 (3/3) | 1.00 / 1.00 |
| `headless-without-scope` | 1.00 (3/3) | 1.00, one run (see below) | 1.00 / 1.00 |
| `full-audit` | **0.95** (0.94, 0.98, 0.93) | **0.99** (0.99, 0.98, 0.99) | 0.956 / 0.956 |

The suite's list-price cost was US$52.30, plus US$1.85 for an earlier one-run pass of the four cheap cases. The full-audit case grades every finding against the fixture's answer key. It also checks that the run reached no network: no WebFetch, `curl`, `wget` or `gh`. Every run passed that check.

**What the full audit missed.** Each line below was missed in at least two of the three runs:

- **Opus `neg-12`, a false positive in all three runs.** The audit proposed a change on the negative at `SKILL.md:12`. [#86](https://github.com/inbrace-tech/claude-skills/issues/86) already reported this line, as a re-test that never came out with the expected status.
- **Opus `pos-44`, `pos-52`, `pos-57`, each missing in two of three runs.** All three are model-id changes in Claude API code (`anthropic.ts:6`, `client.py:9`, `bedrock-portal.py:10`). The held-out check shows the same pattern (K09 below): the audit points to `/claude-api migrate` for the file without writing the new id itself.
- **Opus `pos-07`, missing in two of three runs.** The `change` on `nightly-review.yml:22`.
- **Sonnet `pos-21`, missing in all three runs.** The `change` on `history.ts:39`. #86 reported it on 0.6.1.

**The Sonnet `headless-without-scope` case is reported from one run.** Its three-run pass on the version branch never started. Before the case began, Docker Desktop's WSL integration put symbolic links into the machine's Docker credential store. With a link in that store, `claude plugin eval`'s sandbox refuses every case that grants `Bash`, and pointing `DOCKER_CONFIG` elsewhere does not get around the refusal. The figure above comes from the one-run pass on `main` at 553db88, earlier the same day. Since that commit, the plugin has changed only its `verified` dates and its version number. The Opus copy of the case scored 1.00 in all three runs on the version branch.

## Capability check on the held-out repositories (exploratory, not blind)

This check reuses the two held-out repositories and sealed keys of the [v3 evaluation](2026-09-29-transition-audit-v3.md). Its protocol was written down before any run. Following the frozen v3 protocol, an arm added afterwards is labelled exploratory.

- **Why it is not blind.** The 0.6.1 fixes were derived from these two repositories (v3, "Defects found and fixed in 0.6.1"). 0.7.0 carries those fixes, so its score here is an upper bound. The question this check answers is narrower than v3's: did the redesign lose recall against 0.6.0 on the same targets?
- **Controls, as in v3.** Claude Opus 5.5 at `--effort medium`, permission mode `auto`, one headless `claude -p` session per arm, hooks disabled. Each arm ran on a fresh copy of its target with no git remote, and at most two sessions ran at once. The arm ran `/inbrace-config:audit-<model>-5-5 --scope full --mode agents --stop-at-report` with 0.7.0 from the version branch, once per target.
- **Trace.** Each arm's transcripts were checked after the run. Neither read a key, a sealed file, an earlier output or a sibling copy. Neither ran a network command: the only `curl` text in the transcripts is file content of the target and the Bash tool's own description.
- **Grading.** One headless Opus 5.5 grader per target at effort `high`, with the v3 held-out scoring rules unchanged. Each grader checked the key's hash before opening it: Sonnet `99724db8…65fe73` and Opus `5a9935d4…9e159`, the values v3 registered. Each graded the run's final list against the docs fetched fresh on 2026-10-06. Neither grader raised a key dispute. Blindness is nominal: there was one arm per target, in a recognisable format.

| | Sonnet 5 → 5.5 | Opus 5 → 5.5 |
|---|---|---|
| **0.7.0, recall (strict)** | **33/35 (94.3%)** | **31/34 (91.2%)** |
| 0.6.0 in v3, recall (strict, mean of two runs) | 31.0/35 (88.6%) | 29.5/34 (86.8%), runs of 27 and 32 |
| 0.7.0, high-severity items | 18/18 | 17/18 |
| 0.7.0, precision (false positives only) | 97.2% (2 FP units in 72 findings) | 100% (0 in 44) |
| 0.7.0, negatives held | 12/13 | 15/15 |
| 0.7.0, correct findings outside the key | 25 | 10 |
| 0.7.0, cost per run | US$9.69 | US$7.45 |
| 0.6.0 in v3, cost per run | US$11.16 | US$8.96 |

The Opus figure for 0.7.0 is one run and falls inside the spread of 0.6.0's two runs (27 and 32), so it is not read as a change. The check's new spend was US$21.36: the two arms, and US$4.22 for the two graders.

**Sensitivity.** On Sonnet, two key items (K01, K28) count only through a `/claude-api migrate … to claude-sonnet-5-5` hand-off that does not state the edit itself. Read as partial, strict recall is 31/35 and high-severity recall 16/18. On Opus, the grader's alternative readings put strict recall between 29/34 and 32/34.

**What 0.7.0 missed or got wrong:**

- **Opus K09 (high), partial.** A Bedrock platform id. It appears only as a premise of an effort finding and in the `/claude-api migrate` hand-off, never as a prescribed change. This is the same pattern as the suite's `pos-44`, `pos-52` and `pos-57`.
- **Opus K17 and K18 (low), never considered.** A cache-read price multiplier, and a retired `context-1m` beta header.
- **Sonnet K35 (low), never considered.** A model statement in `CLAUDE.md`, which the audit read without raising it.
- **Sonnet false positives.** A `max_tokens` finding on a computer-use request that sends no `thinking` field. And a recommendation to add `claude-sonnet-5-5` to `availableModels`, which violates a negative. The audit itself had labelled that recommendation an inference with no supporting passage.

## Limitations

- **One run per held-out target.** The v3 Opus runs of 0.6.0 differed by five items, so a one-run figure carries at least that much noise.
- **The held-out figures are an upper bound,** for the reason given above.
- **The plain-session arms of v3 were not re-run.** The documentation changed between 2026-09-29 and 2026-10-06, so their recall today is not known.
- **Prices are list prices,** taken from the runs' own cost totals.
