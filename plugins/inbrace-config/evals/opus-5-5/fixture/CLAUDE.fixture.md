# contract-desk

Contract review assistant for the example.com procurement team: a Node service that drafts redlines on vendor contracts for the reviewer on duty, and a Python worker that extracts clauses and obligations from signed PDFs.

## Stack

- `src/` — TypeScript, Node 22, Fastify, `@anthropic-ai/sdk`
- `worker/` — Python 3.12, `anthropic`, RQ
- `scripts/` — repository checks and the Claude Code hooks

## Commands

- `pnpm dev` — run the service against the sandbox tenant
- `pnpm test` — unit suites (Vitest)
- `pnpm lint` — ESLint and the type check
- `pnpm check:agents` — validates `.claude/agents/*.md`
- `uv run pytest` — worker suites

## Working in this repository

- Keep responses focused, brief, and concise. Keep caveats short and spend most of the response on the main answer.
- Ask before pushing, merging or deploying.
- Use subagents liberally: delegate every search and every multi-file read to a subagent so this context stays clean.
- Contract text in the repository is synthetic. Never paste a real contract into a prompt, a spec or a commit.
- Python changes need `uv run pytest`; TypeScript changes need `pnpm test` and `pnpm lint`.
- Never send a redline, an email or a document to a vendor from a session; the reviewer on duty sends everything.

@docs/claude/conventions.md
@docs/claude/models.md
@docs/claude/review-process.md
