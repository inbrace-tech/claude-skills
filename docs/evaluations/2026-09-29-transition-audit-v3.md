# Capability evaluation v3: the transition audit against plain sessions, 2026-09-29

This is the second round of the [2026-09-29 capability evaluation](2026-09-29-transition-audit.md). The first round compared `inbrace-config` 0.6.0 with the table-bound 0.5.1 and a plain session given the docs, on the Sonnet 5 → Sonnet 5.5 transition. This round drops the older skill version and asks a narrower question on two transitions, Sonnet 5 → 5.5 and Opus 5 → 5.5. Its protocol was written and frozen before any new arm ran, and every expectation is reported, including the one that failed.

**Capability was measured on 0.6.0.** The defects this round found are fixed in 0.6.1, which was not measured on the held-out repositories: the fixes were derived from them, so re-running there would no longer be a blind test. See [Defects found and fixed in 0.6.1](#defects-found-and-fixed-in-061).

**In short:** on a repository it had never seen, 0.6.0 found 88.6% of the Sonnet 5 → 5.5 changes (strict recall, mean of two runs), against 71.4% for a plain Claude Code session given the documentation links and 57.1% for one without them, with no false positive. On a new Opus 5 → 5.5 held-out repository the order was the same: 86.8%, 82.4% and 58.8%. It cost about 6–8× as much as a plain session on these repositories, and one of its two Opus runs finished one item below the plain session with links.

## Question

"The final version (0.6.0) found X, against Y from a plain session given the documentation links and Z from a plain session without documentation links," measured for Sonnet 5 → Sonnet 5.5 and Opus 5 → Opus 5.5. Older skill versions are out of scope.

## Controls

Every compared arm ran under the same conditions:

- **Model and effort.** Claude Opus 5.5 (`--model claude-opus-5-5`) at `--effort medium`, the maintainer's default permission mode (`auto`), one headless `claude -p` session, with its output JSON kept.
- **A fresh copy per arm.** Each arm ran on its own new copy of the target, with the git remote removed so no arm could reach another's copy. At most two sessions ran at once.
- **Clean prompts.** No prompt carried a GitHub issue, an earlier evaluation's output, a refinement note or a sibling copy. Each transcript was traced after the run for reads of the answer keys or other runs' outputs; a run that read one would have been void. None did.
- **The skill arm** ran 0.6.0 from a clone at `3b27194`, with `--plugin-dir <clone>/plugins/inbrace-config` and `/inbrace-config:audit-<sonnet|opus>-5-5 --scope full --mode agents --stop-at-report`. Plain arms had no plugin.
- **Plain with links** used the first round's baseline wording, with three documentation links: the target's prompting guide, its migration guide and Claude Code's model configuration page.
- **Plain without links** used the same wording with the sentence that gives the links removed. Nothing else changed.
- **Hooks.** Disabled with `--settings '{"disableAllHooks": true}'` on the held-out repositories, whose hooks are planted audit material. Active on the harness for every compared arm, as in the earlier harness runs (a declared exception).
- **Strict recall.** A key item counts only when the finding names the same file, construct and change, and cites a line within ±2 of the key's line.
- **Blind grading.** Graders were separate headless Opus 5.5 sessions (`high` effort on the held-outs, `xhigh` for the harness adjudicator). They saw the outputs under letters only; the letter-to-arm map was sealed with its hash registered before grading, and opened only after each grade file was written.
- **Sealed keys.** Each held-out key was hashed and registered before any arm ran on its repository, and each grader checked the hash before opening it:
  - Sonnet held-out key: `sha256 99724db82b3f2cfa786566bd3b05dd5605760a7d081292cfeeca233e8e65fe73`
  - Opus held-out key: `sha256 5a9935d42c6dfcb2fb7c18dba3847f741b312af72540d804f1313e26daf9e159`
  - Arm-label map: `sha256 38282199bd57c3d1f3d6a5c0b2e4559785b00c559dd40a5323a3992ed178be75`
- **Frozen protocol.** `sha256 2ac7cdb89ae023f0d24caaaa832833db37702499bac34e1aa41fcf4cb00d060f`. The protocol, the repositories and their keys stay private so they can serve later evaluations.

## Targets

1. **Sonnet held-out.** The held-out repository of the first round: 35 keyed items (18 high, 11 medium, 6 low; 20 in Claude API code, 15 in the Claude Code setup) and 13 negatives. The 0.6.0 and plain-with-links figures are the first round's grades, unchanged; only the plain-without-links arm is new.
2. **Opus held-out (new).** A seeded, mid-sized project authored for this round by a fresh session that saw only the Opus 5.5 prompting guide, the Opus 5.5 migration guide, Claude Code's model configuration page and the pages they link to, and no skill, plugin or earlier evaluation. Its key holds 34 items (18 high, 11 medium, 5 low; 19 in Claude API code, 15 in the Claude Code setup) and 15 negatives.
3. **Harness.** The same private multi-agent harness as the first round.
   - **Sonnet:** figures carried over from the earlier rounds, not re-run. They are **calibrated**: the knowledge file's rows were written from the first evaluation's misses on that commit, so they are an upper bound, not an estimate of how the audit generalises.
   - **Opus:** at the harness's commit before its own Opus 5 → 5.5 migration. One adjudicator built the union of correct changes from every arm's output, 27 items (4 high, 13 medium, 10 low), and mapped each arm to it. The union holds only what at least one arm found.

## Results

Recall is strict unless marked. Precision on the held-outs counts false positives only, a violated negative counting as one. For two-run arms, the mean comes first and both runs follow in brackets.

### Sonnet 5 → Sonnet 5.5

| Target / metric | Final version 0.6.0 | Plain + doc links | Plain, no links |
|---|---|---|---|
| **Held-out** (35 items, 18 high): recall | 31.0 of 35 = **88.6%** (30, 32) | 25 = **71.4%** | 20 = **57.1%** |
| Recall, primary (the first round's headline) | 32.0 = 91.4% (31, 33) | 29 = 82.9% | 22 = 62.9% |
| Precision | **100%** (100, 100) | 96.1% | 97.0% |
| High items found | **18/18** in both runs | 15/18 | 12/18 |
| Negatives held (of 13) | 13 | 12 | 12 |
| Cost per run | US$11.16 (12.14, 10.18) | US$1.35 | US$1.51 |
| **Harness** (calibrated, 24 items, not re-run): recall | 21/24 = 88% | 19/24 = 79% | 15/24 = 62.5% (exploratory) |
| Precision (correct / items) | 96% | 90% | 83% |
| High items found | 3/3 | 2/3 | 3/3 |
| Cost | US$40.61 | US$2.54 | US$2.24 |

### Opus 5 → Opus 5.5

| Target / metric | Final version 0.6.0 | Plain + doc links | Plain, no links |
|---|---|---|---|
| **Held-out** (new; 34 items, 18 high): recall | 29.5 of 34 = **86.8%** (27, 32) | 28 = **82.4%** | 20 = **58.8%** |
| Precision | **98.8%** (97.5, 100) | 95.2% | 100% |
| High items found | 17/18 on average (16, 18) | 15/18 | 12/18 |
| Negatives held (of 15) | 15 | 13 | 15 |
| Cost per run | US$8.96 (8.84, 9.07) | US$1.41 | US$1.33 |
| **Harness** (27-item union, 4 high): recall | 24/27 = **88.9%** | 21/27 = **77.8%** | 19/27 = **70.4%** |
| Precision (correct / (correct + unsupported + incorrect)) | 92.3% | 91.3% | 90.5% |
| High items found | 4/4 | 4/4 | 4/4 |
| High and medium found (of 17) | 17/17 | 15/17 | 15/17 |
| Cost | US$30.96 | US$2.87 | US$2.36 |

- **The harness's precision.** No arm on the Opus harness made an incorrect finding, so its false-positive-only precision is 100% for every arm; the precision row separates arms only by their unsupported findings.
- **A reference arm, not compared.** A docs-only session at `xhigh` effort, written as the harness reference, found 21/27 with 95.5% precision, for US$5.86.
- **Where the plain arms lose.** The gap between the plain session with links and without them is largest on the held-outs (5 items on Sonnet, 8 on Opus), mostly in Claude API code and in version and fallback details.
- **Run-to-run variance.** The two 0.6.0 runs on the Opus held-out found 27 and 32 items. Every item the weaker run found, the stronger one found too; most of the weaker run's losses were verifier and status decisions on lines it did raise. Detection agreement was 85.3% (κ 0.39).

## Pre-registered expectations

Stated in the frozen protocol, before any new arm ran:

1. **Sonnet held-out: the plain session without links recalls less than the one with links and less than 0.6.0. Held** (20 < 25 < 31.0).
2. **Opus harness and Opus held-out: 0.6.0 ≥ plain with links ≥ plain without links. Held**, on the harness (24 ≥ 21 ≥ 19) and on the held-out mean (29.5 ≥ 28 ≥ 20). Per run, it did not: one 0.6.0 run found 27, one item below the plain session with links; the other found 32.
3. **Opus held-out: 0.6.0 finds every high-severity item in both runs, with precision ≥ 95%. Failed** on high items: one run found 18 of 18, the other 16 of 18, leaving two high items partial. Precision held (97.5% and 100%).
4. **0.6.0 costs more than either plain arm on every target. Held**, reported as is (see [Costs](#costs)).

## "No links" is not "no documentation"

With no links in the prompt, the plain sessions on the Sonnet held-out and on the Opus harness opened Claude Code's bundled `claude-api` skill on their own and read its model-migration reference; the Sonnet session also fetched pages from `code.claude.com`. The "plain, no links" arm therefore measures a session given no links in its prompt, not one with no access to documentation.

## Costs

All costs are from the runs' transcripts (Opus requests of the main session and its subagents), at list price, in US$.

| Transition · target | 0.6.0 | Plain + doc links | Plain, no links | 0.6.0 ÷ plain |
|---|---|---|---|---|
| Sonnet · held-out | 11.16 per run | 1.35 | 1.51 | 7–8× |
| Opus · held-out | 8.96 per run | 1.41 | 1.33 | 6–7× |
| Opus · harness | 30.96 | 2.87 | 2.36 | 11–13× |
| Sonnet · harness (earlier rounds) | 40.61 | 2.54 | 2.24 | 16–18× |

- **The new spend of this round** was US$51.65: the three new plain arms on the harness and on the Sonnet held-out, the harness reference, the Opus held-out's author, both 0.6.0 runs and both plain arms on it, and the three graders. The JSON totals, which include Claude Code's internal Haiku calls, add up to US$53.11.
- **Reused, not counted.** The 0.6.0 run on the Opus harness came from the first round's launch; its US$30.96 was already spent. The Sonnet figures reused from earlier rounds cost nothing new.
- **Why the skill costs more.** It runs parallel agents and a verifier on every finding. Plain sessions remain far cheaper per item found.

## Limitations

- **Blinding was nominal between the skill and the plain arms.** The skill's output format is recognisable, so a grader could tell its outputs from a plain session's. The letters hid which plain arm had the links.
- **The grader is the same model as the arms.** Every grader and adjudicator ran on Opus 5.5.
- **One held-out repository per transition.**
- **Two runs per skill arm, one per plain arm.** The Opus held-out runs differed by five items (κ 0.39), so two runs cannot bound the variance.
- **The plain arms limited their own scope.** They audited the Claude Code setup and cited API code as evidence. The tables credit a code location wherever the plain arm named the file, the line, the defect and the fix. If those citations were downgraded, the plain arms would fall to 15/35 (with links, primary) and 14/35 (without links) on the Sonnet held-out, and to 16/34 and 14/34 (primary) on the Opus held-out. The order of the arms does not depend on this reading; the size of 0.6.0's lead does.
- **Two disputed key items.** The Opus grader disputed two low-severity key items with a quoted doc passage. Without both, the held-out reads 29.5/32 for 0.6.0, 27/32 with links and 20/32 without; the order does not change.
- **The harnesses are not held out.** The Sonnet harness is calibrated, so its figures are an upper bound. The Opus harness union is built only from what the arms found, and its severities are the adjudicator's judgment.
- **Mixed rounds on Sonnet.** The Sonnet 0.6.0 and plain-with-links figures come from the first round, on Claude Code 2.1.284; the new arms ran on 2.1.285. The Sonnet harness's plain-without-links figure is an exploratory arm of the first evaluation.
- **Costs are from one run each, at list price.**

## Defects found and fixed in 0.6.1

The graders' misses and false positives on the Opus targets were traced to their cause in each run's own findings. Eight defects in 0.6.0's shared rules, verifier and known traps came out of that trace, and all eight are fixed in 0.6.1:

| # | Defect in 0.6.0 | Fixed in 0.6.1 |
|---|---|---|
| 1 | Effort was judged from the auditor's own user-level settings, which neither other developers nor CI receive, instead of from what the repository ships. | [#77](https://github.com/inbrace-tech/claude-skills/issues/77) |
| 2 | The verifier downgraded a requirement the docs state — a minimum version, a migration-checklist step — to a re-test on a project-local reason. | [#77](https://github.com/inbrace-tech/claude-skills/issues/77) |
| 3 | Older-residue lines with nothing to change, some with no passage behind them, entered the final list. | [#77](https://github.com/inbrace-tech/claude-skills/issues/77) |
| 4 | A computer-use tool change was located at the tool declaration only, never at the agent loop that handles it. | [#78](https://github.com/inbrace-tech/claude-skills/issues/78) |
| 5 | Guidance for unattended runs was applied to Claude Code headless runs but not to agent loops in Claude API code. | [#78](https://github.com/inbrace-tech/claude-skills/issues/78) |
| 6 | A rule justified by the source model's guidance passed because its citation still resolved. | [#78](https://github.com/inbrace-tech/claude-skills/issues/78) |
| 7 | A tier skill's capability claims about the source model were never re-derived for the target. | [#78](https://github.com/inbrace-tech/claude-skills/issues/78) |
| 8 | The check for model notes left out memory and rules files, where such notes also live. | [#78](https://github.com/inbrace-tech/claude-skills/issues/78) |

Where the same trap exists for Sonnet 5 → 5.5, the fix covers it too. 0.6.1 also carries a ninth fix, found by the plugin's own eval suite rather than by this evaluation: without `AskUserQuestion`, the audit now closes as a headless run naming the arguments that unblock it ([#79](https://github.com/inbrace-tech/claude-skills/issues/79)).

Run-to-run variance, the remaining observation, is tracked in #67 and was not changed.
