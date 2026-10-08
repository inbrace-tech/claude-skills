# 0002 — The batch reporter stays on Claude Haiku 4.5

- Date: 2026-10-07
- Status: accepted

## Context

`batch-reporter` writes the nightly ticket-volume report. Claude Haiku 5.5 is out, and the other Haiku agents are due to move to it.

We ran the reporter's eval set — 30 nightly exports — on Claude Haiku 5.5 on 2026-10-07. The reports matched, but the run cost more on the largest exports, which pass 100,000 tokens and pay Haiku 5.5's higher rate card.

## Decision

Keep `.claude/agents/batch-reporter.md` pinned to `claude-haiku-4-5` until the exports are split below 100,000 tokens. Re-run the eval set then.

## Consequences

- The reporter keeps `claude-haiku-4-5` in its frontmatter.
- Moving the other agents does not touch the reporter.
