# contract-desk

The assistant behind the example.com procurement desk. It drafts redlines on vendor contracts for the reviewer on duty, answers reviewers' questions about a contract, extracts clauses and obligations from signed PDFs, and runs the nightly re-checks of yesterday's extractions.

## Layout

| Path | What it holds |
|---|---|
| `src/` | TypeScript service: intake, the redline loop, reviewer chat, the vendor-portal reader |
| `worker/` | Python batch worker: clause extraction, review sessions, the due-diligence team |
| `scripts/` | Repository checks and the Claude Code hooks |
| `.claude/` | The Claude Code setup the team works with |
| `docs/` | Decisions, evaluations and team conventions |

## Running it locally

```bash
pnpm install
cp .env.example .env        # sandbox tenant, fake keys
pnpm dev
```

The worker runs with `uv run python -m worker.jobs <job-name>`.

Both halves read `ANTHROPIC_API_KEY` from the environment. The sandbox tenant at `https://sandbox.contracts.example.com` holds synthetic vendors and contracts only.
