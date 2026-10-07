# Helpdesk triage service

This service tags, routes and drafts first replies for incoming help-desk tickets. Claude Code agents do the bulk work on Haiku; Opus 5.5 plans larger changes.

## Working here

- Run `pnpm test` and `pnpm lint` before every commit.
- Never push to `main`; open a pull request and wait for a review.
- Secrets live in `.env`, never in code or in a prompt.

## Models

- Bulk tagging, routing and FAQ lookups run on Haiku. Haiku has no extended thinking unless a request asks for it, so its answers come back in one pass.
- Haiku's context window is 200K tokens; split any batch of tickets larger than that.
- Model routing and its reasons live in `.claude/rules/model-routing.md`.
- The batch reporter stays on Haiku 4.5; see `docs/adrs/0002-batch-reporter-stays-on-haiku-4-5.md`.

## Pull requests

- Keep each pull request to one ticket.
- Describe in the pull request what changed and why.
