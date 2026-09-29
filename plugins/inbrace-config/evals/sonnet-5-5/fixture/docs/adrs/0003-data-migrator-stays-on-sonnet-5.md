# 0003 — The data-migrator agent stays on Claude Sonnet 5

- Date: 2026-09-21
- Status: accepted

## Context

`data-migrator` converts help-desk export files into the import format of the new ticketing backend. Every other agent pinned to Claude Sonnet 5 is due to move to Claude Sonnet 5.5.

We ran the migrator's eval set — 412 historical exports — on Claude Sonnet 5.5 on 2026-09-19. Field-mapping accuracy fell from 99.1% to 97.4% on exports with nested custom fields; the flat exports were unchanged.

## Decision

Keep `.claude/agents/data-migrator.md` pinned to `claude-sonnet-5` until the nested-field cases pass on Claude Sonnet 5.5. Re-run the eval set when the importer's nested-field mapping ships (tracked in the migration plan).

## Consequences

- The migrator keeps `claude-sonnet-5` in its frontmatter and binds the Sonnet 5 notes skill, which `scripts/check-agent-models.mjs` requires.
- Moving the other agents does not touch the migrator.
