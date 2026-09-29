# Effort sweep for pricing-analyst on Claude Opus 5.5

- Date: 2026-09-24
- Agent: `.claude/agents/pricing-analyst.md`
- Model: `claude-opus-5-5`

## Method

The agent's eval set holds 60 vendor price proposals with a hand-built comparison model for each. We ran it on Claude Opus 5.5 at `medium`, `high` and `xhigh`, three runs per level, and scored the comparison models cell by cell.

## Results

| Effort | Cells correct | Median turn time |
|---|---|---|
| `medium` | 91.2% | 3m 10s |
| `high` | 93.0% | 4m 40s |
| `xhigh` | 96.4% | 7m 05s |

## Decision

Keep `effort: xhigh` for `pricing-analyst` on Claude Opus 5.5: the gain on multi-tier volume discounts is worth the extra time for a job that runs a few times a week. Re-derived for Opus 5.5; not carried over from Opus 5.
