# Capability evaluation: the transition-agnostic audit, 2026-09-29

This evaluation asks whether `inbrace-config` 0.6.0, which reads today's docs, explores the project and then checks known traps, finds more of the right Sonnet 5 → Sonnet 5.5 changes than the table-bound 0.5.1 and than a plain Claude session given the docs, without losing precision. The protocol was written and registered before any arm ran. Every expectation is reported, including where it held only under one reading.

**In short:** on a repository no version of the skill had seen, 0.6.0 found 31 and 33 of 35 items in its two runs. That is 32 on average, against 25 for 0.5.1 and 29 for the plain session. It found every high-severity item, made no false positive, and held all 13 negatives. It also cost the most: about US$11 a run, against US$5.5 for 0.5.1 and US$1.35 for the plain session.

## Question

Does the transition-agnostic audit (0.6.0: open discovery, then known traps) find more of the correct Sonnet 5 → Sonnet 5.5 changes than the table-bound 0.5.1, and than a plain Claude session given Anthropic's docs, without losing precision, on a repository no version of the skill has seen?

## Versions

| Label | Version | Commit | What it is |
|---|---|---|---|
| NEW | 0.6.0 | `3b27194` | Epic #34 in full: open discovery, drift check, known traps, the `.model-audits/` run folder (#58), the measured cost estimate (#60) and trap areas and run-folder writes (#62) |
| OLD | 0.5.1 | `42d0b32` | The last table-bound version, with the per-transition pattern table |
| PLAIN | — | — | A plain Claude Code session with the documentation links and no plugin |

Both skill versions ran from a clone at their commit, with `--plugin-dir <clone>/plugins/inbrace-config`.

## Targets

1. **Held-out (primary).** A seeded repository authored by a session blind to every skill version. It has a Python service that calls the Claude API and a Claude Code setup: settings, hooks, agents, a skill with a template, rules, CI and docs.
   - Its sealed answer key holds 35 items: 18 high, 11 medium and 6 low severity, 20 in Claude API code and 15 in the Claude Code setup. It also holds 13 negatives, constructs that must not be changed.
   - The key's hash was registered before any run, and the grader opened it only after every arm had finished.
   - Neither the repository nor its key is published.
2. **Calibrated harness (labelled as such).** A private multi-agent harness, at the same commit the v1 evaluation (#34) was graded on, scored against v1's 24-item union.
   - It is **not held out.** The knowledge file's traps P37–P42 were written from v1's misses on this commit, one to one, so its figures measure whether those fixes landed. They are an upper bound, not an estimate of how the audit generalises.
3. **Fixture regression (supporting).** A fresh copy of the seeded fixture used during development, graded with the method of earlier runs, to check that 0.6.0's later fixes held and that the release introduced no regression.

## Arms

Every arm used Claude Opus 5.5 at `medium` effort, the maintainer's default permission mode (`auto`), a fresh copy of the target and one headless `claude -p` session, with its output JSON kept.

| Target | Arm | Command | Runs |
|---|---|---|---|
| Held-out | NEW (labels B, D) | `/inbrace-config:audit-sonnet-5-5 --scope full --mode agents --stop-at-report` | 2 |
| Held-out | OLD (labels A, E) | same command | 2 |
| Held-out | PLAIN (label C) | the v1 baseline wording, report path adapted, no plugin | 1 |
| Harness | NEW | same command | 1 |
| Fixture | NEW (run F) | same command, with the fixture's planted hooks disabled | 1 |

The grader saw the held-out outputs as A–E only. The version behind each label was revealed after grading.

## Pre-registered expectations

Stated from the design in #34, before any run:

1. NEW's recall on the held-out repository is at least PLAIN's, and above OLD's.
2. NEW's precision is at least 95%, and NEW finds every high-severity item.
3. NEW costs more than PLAIN; the difference is reported as it is.

### Amendment 1 (before any grading, and before the key was opened)

The first launch ran all 8 arms at once and was void. Under that load the auto-mode classifier returned no verdict, causing 4 to 9 denials per run, and the held-out repository's own planted `PostToolUse` hook capped each session at 150 tool calls, stopping one NEW run after stage 2. Two changes applied to every arm alike:

- at most 2 arms ran at once;
- every target ran with `--settings '{"disableAllHooks": true}'`. The hook file stayed in the repository as audit material; it was only not executed.

**One exception, declared in the amendment.** The two harness runs of the first launch — NEW on the harness, and an Opus 5 → 5.5 functional run — completed every stage with one denial each: the close's cleanup `rm`, refused by the harness's own destructive-command hook. They were kept rather than re-run, and they ran with the harness's hooks enabled, as the v1 harness arms had.

## Results

### Held-out repository (primary)

Scoring rules:

- **Primary recall** counts a finding as correct when it names the same file, construct and change.
- **Strict recall** also requires a cited line within ±2 of the key's line.
- **PARTIAL** marks the right place with a wrong or weak change, or a status that contradicts the required edit. It scores 0.
- **Precision** counts false positives only; a violated negative counts as one false positive.

| Metric | OLD A | OLD E | NEW B | NEW D | PLAIN C |
|---|---|---|---|---|---|
| Recall, primary (of 35) | 24 (68.6%) | 26 (74.3%) | 31 (88.6%) | **33 (94.3%)** | 29 (82.9%) |
| Recall, strict (of 35) | 23 (65.7%) | 25 (71.4%) | 30 (85.7%) | **32 (91.4%)** | 25 (71.4%) |
| PARTIAL | 7 | 4 | 3 | 2 | 3 |
| Missed | 4 | 5 | 1 | 0 | 3 |
| High severity found (of 18) | 13 | 16 | **18** | **18** | 16 |
| Medium (of 11) | 7 | 7 | 9 | 9 | 8 |
| Low (of 6) | 4 | 3 | 4 | 6 | 5 |
| Claude API code (of 20) | 15 | 15 | **20** | **20** | 14 |
| Claude Code setup (of 15) | 9 | 11 | 11 | 13 | **15** |
| Findings graded | 53 | 57 | 64 | 62 | 51 |
| False-positive units | 2 | 1 | 0 | 0 | 2 |
| Precision | 96.2% | 98.2% | **100%** | **100%** | 96.1% |
| Negatives held (of 13) | 12 | 13 | **13** | **13** | 12 |
| Correct findings outside the key | 16 | 19 | 23 | 18 | 15 |

| Version | Mean recall, primary | Mean recall, strict | Detection agreement between its two runs |
|---|---|---|---|
| NEW 0.6.0 | 32.0 (31, 33) | 31.0 (30, 32) | 33/35 = 94.3% (κ 0.64) |
| OLD 0.5.1 | 25.0 (24, 26) | 24.0 (23, 25) | 31/35 = 88.6% (κ 0.72) |
| PLAIN | 29 (one run) | 25 (one run) | — |

- **High-severity misses.**
  - OLD A missed 2 high-severity items and left 3 PARTIAL.
  - OLD E missed 2.
  - PLAIN C missed 1 and left 1 PARTIAL.
  - NEW B and D missed none.
- **Negatives.** Both violations, one by OLD A and one by PLAIN C, were on the same construct: they proposed adding the new model id to an `availableModels` prefix list that already admits it ("A version prefix also matches later model IDs that extend it with another segment"). NEW stated that the prefix already covers Sonnet 5.5.
- **Weak spots every skill version shares.** Two items that require an edit were kept as `re-test, no edit` by OLD and NEW alike: a `MAX_THINKING_TOKENS=0` setting and a per-tool-call budget countdown hook. PLAIN recommended the edit (#64). One further item was located inside the right function by every arm, and by none within ±2 of its anchor line.

**Expectations:**

1. **NEW recall ≥ PLAIN's and > OLD's: held.** Primary recall was 32.0 for NEW, 29 for PLAIN and 25.0 for OLD. Strict recall was 31.0, 25 and 24.0.
2. **NEW precision ≥ 95% and every high-severity item found: held.** NEW had 100% precision in both runs and found 18 of 18 high-severity items in both.
3. **NEW costs more than PLAIN: held.** NEW cost about US$11 a run against US$1.35 for PLAIN (see Costs).

### Calibrated harness (not held out; an upper bound)

| Arm | Correct of 24 | Recall | High (of 3) | Medium (of 10) | Low (of 11) | Incorrect | Precision (correct / items) | Cost (US$) |
|---|---|---|---|---|---|---|---|---|
| **0.6.0 (this evaluation)** | 21, plus 1 correct outside the union | **88%** | 3 | 10 | 8 | 0 | 22/23 = **96%** | 40.61 |
| 0.5.0 (v1) | 14 | 58% | 3 | 9 | 2 | 0 | 14/14 = 100% | 23.48 |
| Plain session with links (v1) | 19 | 79% | 2 | 8 | 9 | 0 | 19/21 = 90% | 2.54 |
| Docs-only reference (v1) | 21 | 88% | 3 | 10 | 8 | 0 | 21/24 = 88% | — |

- **Against 0.5.0.** 0.6.0 adds 7 items and loses none.
- **Against the plain session.** 0.6.0 finds 2 more items overall, and 3 more among high and medium severity.
- **The 3 misses are all low severity.**
  - A mid-flight message to a running agent. Its trap covers API code only and was recorded as "not checkable" (#65).
  - A hook's per-call context. It was dismissed as firing only on a matched command.
  - A correct no-op that the v1 reference was not credited for either.
- **The one unsupported finding** had no doc passage behind it: re-running a decision record's canary on the new model.
- **Line numbers.** 11 notes cited a selector one line off, and the verifier corrected 3 of them (#66).

An Opus 5 → Opus 5.5 functional run on the same harness, at its pre-migration commit, completed all seven stages. It cost US$31.81 and was not graded.

### Fixture regression (supporting)

| Run | Version, mode | Recall, primary / strict (key as written) | Recall, skill-adjusted | Precision | Negatives | Correct outside the key | Files written outside the run folder | Cost (US$) |
|---|---|---|---|---|---|---|---|---|
| E | `a289710`, session | 96.6% / 89.8% | 98.3% / 91.4% | 100% | 23/23 | 8 | 2 (fixed in #62) | 7.90 |
| **F** | **`3b27194` (0.6.0), agents** | **94.9% / 91.5%** | **96.6% / 93.1%** | **100%** | **23/23** | **11** | **none** | **12.17** |

What changed between E and F:

- **What F fixes.**
  - F finds the P13 in a skill that E missed; the trap's areas were widened in #62.
  - F gives a P06 its own line.
  - F anchors a P14 on an accepted line.
  - F writes nothing outside `.model-audits/`, and its close's claim that it wrote nothing else is true.
- **What F loses.**
  - F misses a P14 that every earlier run found (#67). This looks like agents-mode variance rather than a rule change, and should be measured before anything changes.
  - F reads a synthetic assistant turn as an older prefill: one PARTIAL.
- **The key and the skill disagree on one row.** The fixture's key expects a P18 on an agent whose instruction the project memory already states. The skill's documented rule — a custom subagent loads the project memory unless it sets `omitClaudeMd` — discards that finding, correctly. The "skill-adjusted" column scores that row by the skill's rule. The key row is obsolete and should be amended; the fixture is private, so no issue was opened.
- **Cost estimate.** F's plan estimated about 389k–769k tokens of context, about US$5–13. The run cost US$12.17. F's report gave no measured figure of its own, only a pointer to `/usage`.

## Costs

All costs are from the runs' transcripts, at list price, in US$.

| Target | Arm | Cost | Mean | Recall per US$ (primary, mean) |
|---|---|---|---|---|
| Held-out | OLD 0.5.1 (A, E) | 5.36, 5.66 | 5.51 | 4.5 items |
| Held-out | NEW 0.6.0 (B, D) | 12.14, 10.18 | 11.16 | 2.9 items |
| Held-out | PLAIN (C) | 1.35 | 1.35 | 21.5 items |
| Harness | 0.6.0 | 40.61 | — | — |
| Harness | 0.5.0 (v1) | 23.48 | — | — |
| Harness | plain session (v1) | 2.54 | — | — |
| Harness | Opus functional run (not graded) | 31.81 | — | — |
| Fixture | 0.6.0, run F | 12.17 | — | — |

- **Against OLD.** NEW costs about twice as much and finds 7 more items: all high-severity items, and all 20 API-code items.
- **Against PLAIN.** NEW costs about 8× as much, for 3 more items (primary) or 6 more (strict), with no false positive and no violated negative.
- **Where PLAIN leads.** PLAIN remains far cheaper per item found, and led on the Claude Code setup (15 of 15).

## Limitations

- **Blinding was partial.** The grader saw labels only, but inferred from output format and vocabulary that A/E and B/D were each two runs of one method. The versions behind the labels were revealed only after grading.
- **The plain arm limited its own scope.** PLAIN audited the Claude Code setup and cited API code "as evidence", asking for separate tickets. The table credits a code location wherever PLAIN named the file:line, the defect and the fix. If those citations were downgraded to PARTIAL, PLAIN's primary recall would fall from 29 to 15 of 35, and its API-code recall from 14 to 0 of 20. The result for expectation 1 does not depend on this reading, but the size of NEW's lead over PLAIN does.
- **The harness is calibrated.** Its knowledge rows were written from v1's misses on the same commit, so its 88% is an upper bound, not generalisation evidence.
- **A shared blind spot.** Every skill version kept two edit-required items as re-tests (#64), so neither version's recall reflects them.
- **One run per plain arm, two per skill version.** The paired runs agree on 89–94% of items, but two runs cannot bound run-to-run variance. The fixture's agents-mode miss (#67) is an example.
- **One model, one effort, one permission mode.** Every arm ran on Opus 5.5 at `medium` in `auto` mode, with hooks disabled after Amendment 1. The two kept harness runs are the exception: they had hooks enabled.
- **Costs are from one run each at list price.** They include cache re-reads, which the audit's own estimate reports as 15–19× the context.

## Follow-ups

- #64 Remove `MAX_THINKING_TOKENS=0` and per-step countdown hooks instead of re-testing them.
- #65 P27's mid-flight message risk also sits in instructions, not only in API code.
- #66 The verifier corrects every cited line number, not only the anchor.
- #67 Measure agents-mode detection variance before changing anything.
- #68 When the close's cleanup is refused, leave the files and say so.
