# 0004 — The obligation-tracker agent stays on Claude Opus 5

- Date: 2026-09-23
- Status: accepted

## Context

`obligation-tracker` reads signed contracts and lists every dated obligation — notice periods, renewal windows, reporting duties — into the obligations calendar. The other agents pinned to Claude Opus 5 are due to move to Claude Opus 5.5.

We ran the tracker's eval set — 380 signed contracts with hand-checked obligation calendars — on Claude Opus 5.5 at `medium` and `high` on 2026-09-22. Recall on obligations stated relative to another clause ("30 days before the date in 4.2") fell from 96.8% to 94.1% at both levels; absolute dates were unchanged.

## Decision

Keep `.claude/agents/obligation-tracker.md` pinned to `claude-opus-5` until the relative-date cases pass on Claude Opus 5.5. Re-run the eval set when the clause cross-reference resolver ships.

## Consequences

- The tracker keeps `claude-opus-5` in its frontmatter.
- Moving the other agents does not touch the tracker.
