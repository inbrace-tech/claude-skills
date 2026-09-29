# supportdesk-assistant

Support assistant for the example.com help desk: a Node service that drafts replies to customer tickets for the agent on shift, and a Python worker for the batch jobs.

## Stack

- `src/` — TypeScript, Node 22, Fastify, `@anthropic-ai/sdk`
- `worker/` — Python 3.12, `anthropic`, RQ
- `scripts/` — repository checks run in CI

## Commands

- `pnpm dev` — run the service against the sandbox help desk
- `pnpm test` — unit suites (Vitest)
- `pnpm lint` — ESLint and the type check
- `pnpm check:agents` — validates `.claude/agents/*.md`
- `uv run pytest` — worker suites

## Working in this repository

- Keep diffs minimal: no drive-by refactors, renames or reformatting.
- Ask before pushing, merging or deploying.
- Never run a migration or a script against the production help desk from a session; use the sandbox tenant.
- Customer data in the repository is synthetic. Never paste a real ticket into a prompt, a spec or a commit.
- Python changes need `uv run pytest`; TypeScript changes need `pnpm test` and `pnpm lint`.

@docs/claude/conventions.md
@docs/claude/environments.md
