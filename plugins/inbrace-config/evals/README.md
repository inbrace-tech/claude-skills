# Eval suite

This directory is the plugin's [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals) suite for the model-transition audit. It checks, on a seeded fixture per transition, that the audit still finds what it found when it was released, holds its negatives, and stays inside its own run folder. It is a regression suite, not a capability evaluation: both fixtures were written from the audit's own known traps, so a high score says the audit did not regress, not that it generalises. The capability evaluations, on a held-out repository, are in [`docs/evaluations/`](../../../docs/evaluations/).

## Run it locally, never in CI

Every run is a real model call, counted against your plan's usage ([Requirements](https://code.claude.com/docs/en/plugin-evals#requirements)). This suite runs only on a maintainer's machine, signed in with their own subscription:

- never as a CI job, and never with an API key stored as a secret, although the documentation shows that setup ([Run evals in CI](https://code.claude.com/docs/en/plugin-evals#run-evals-in-ci)): a full run costs tens of dollars, and nothing should spend that unattended;
- only with the audit's non-interactive arguments, `--scope full --mode agents --stop-at-report`, so a run can never reach a gate that applies changes ([transition-audit N02, N15](../skills/transition-audit/SKILL.md)).

Before the first run, install the sandbox's prerequisites. The audit needs `Bash` (for `curl` and `git status`), and a granted `Bash` runs only under Claude Code's OS-level sandbox, which on Linux needs `bubblewrap` and `socat` ([Grant tools](https://code.claude.com/docs/en/plugin-evals#grant-tools), [Sandboxing](https://code.claude.com/docs/en/sandboxing)):

```bash
sudo apt install bubblewrap socat
```

Then, from `plugins/inbrace-config`:

```bash
claude plugin eval . --scaffold --ablation none --model claude-opus-5-5 --no-publish \
  --max-cost-usd 60 --tag sonnet-5-5 \
  --allow-tools Bash Write Edit "WebFetch(domain:platform.claude.com)" "WebFetch(domain:code.claude.com)"
```

- `--scaffold` runs each case's `scaffold.sh`, which copies the fixture into the run's empty workspace ([Seed the workspace](https://code.claude.com/docs/en/plugin-evals#add-setup-or-history-with-case-yaml)). It runs as you, so pass it only for this suite.
- `--ablation none` skips the no-plugin baseline: without the plugin, the audit's slash command does not exist, so a baseline would measure nothing. The comparison with a plain Claude session is the one in `docs/evaluations/`.
- `--model claude-opus-5-5` pins the model, so a model rollout is not mistaken for a regression ([Command options](https://code.claude.com/docs/en/plugin-evals#command-options)). Effort is left at Opus 5.5's default, `medium`, which the plugin's agents also set.
- `--max-cost-usd` caps the run's list-price estimate. A full-audit case costs about what one full audit of a small project costs, which the audit's plan estimates; the `cheap` cases stop at or before the plan and cost much less. Set the ceiling before a run and check the summary's cost after it.
- Replace `--tag sonnet-5-5` with `--tag opus-5-5`, or drop it for both transitions. `--runs 1` gives one quick run per case; the default is three.

Results land in `evals/results/<timestamp>/` (`aggregate-result.json`, `report.html`), which git ignores.

## Cases

Each transition has the same three cases:

| Case | Prompt | What passes |
|---|---|---|
| `<transition>-full-audit` | `/inbrace-config:audit-<model>-5-5 --scope full --mode agents --stop-at-report` on the seeded fixture | One grader per answer-key row (see `full-audit/KEY.md`), plus: the run reached the report stage, wrote `report.md`, created `.model-audits/.gitignore`, and called `Write` or `Edit` on no file outside `.model-audits/` |
| `<transition>-headless-without-scope` | The same command without `--scope` and `--mode` | It stops at the plan, runs no later stage, calls `Write` or `Edit` on no file outside `.model-audits/`, and names the arguments that would have reached the report |
| `<transition>-bad-argument` | `--scope everything` | It stops before the plan, writes nothing, and shows the usage line naming the token at fault |

## How the full audit is graded

Every grader is deterministic: no judge model, so a score costs nothing beyond the run and does not vary with the judge ([Choose graders that give a stable signal](https://code.claude.com/docs/en/plugin-evals#grade-the-result)).

- **Where the graders look.** A grader reads the "Final list" of the audit's `findings.md`, whose lines follow the audit's fixed line format, `<file>:<line> | <id> | <status> | …`, with the status the verifier left: a finding it discarded carries `discarded` and matches no grader. The report is not graded, since its layout is free and changes from run to run; the trace is not graded either, since the audit may write its files from a shell script. The findings file sits in a folder named after the run's date, and a file grader takes a fixed path, not a glob, so the scaffold links `.eval-findings.md` to today's run folder and keeps the link out of `git status`. A run that crosses midnight between the scaffold and the audit's first write misses the link and scores 0 on the key.
- **Positives.** A positive passes when a line names the key's file, a line within ±2 of the key's, and the expected status. Where another row with the same status sits within two lines in the same file, the line must be exact. The id is not checked, since discovery numbers its own findings `D01`, `D02`, ….
- **Residue and negatives.** A negative passes when no line on that exact location proposes a change (`change`, `re-test` or `optional`). A residue row is graded the same way: since #80 the audit may list older residue, discard it, or leave it out, and the one thing it must never do is propose a change there.
- **The score.** A run's score is the share of graders that passed, so for the full audit it is close to strict recall with negatives and residue folded in; the per-grader results in `aggregate-result.json` give each part.
- **The keys follow the audit's documented rules.** Each `KEY.md` states where a row departs from the fixture's original key, and why: a rule the skill documents (the Sonnet `lint-fixer.md:4` P18 is a negative; P04 and P19 are `change` since #64), or a row the key's author flagged as a judgement call before any run (the Opus `risk-scorer.md:8` accepts `change` or `re-test`).

The Sonnet graders were calibrated against a hand-graded run of 0.6.0 on the same fixture: on its findings file they agree with the hand grading's strict score on every row, apart from the three rows #64 turned from `re-test` into `change`.

A file changed only by the audit's shell commands is not caught by the `Write`/`Edit` checks; the audit's own close lists every file the run created or changed outside its folder ([transition-audit-apply N17](../skills/transition-audit-apply/SKILL.md)). The `files` grader target was not used for this, because it also lists placeholder files the sandbox creates in the workspace while a shell command runs.

## Fixtures

Each `<transition>/fixture/` is a small project seeded with the transition's traps and with negatives. It is stored under neutral names — `dot-claude/`, `CLAUDE.fixture.md`, `package.fixture.json`, `dot-gitignore`, `dot-env.example` — so this repository neither loads its `.claude/` and `CLAUDE.md` nor scans its manifests. `scaffold-fixture.sh` gives the names back, commits the tree once, and writes a gitignored `.claude/settings.local.json` with `disableAllHooks: true`: the fixture's hooks are audit material, and hooks run outside the run's sandbox.

Both fixtures and their keys are public on purpose: they were used to develop the audit, so they are no longer held out. The held-out repositories of the capability evaluations, and their sealed keys, are never added here, so they stay unseen for later evaluations.
