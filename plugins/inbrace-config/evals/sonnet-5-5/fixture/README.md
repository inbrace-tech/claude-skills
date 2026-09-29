# supportdesk-assistant

The assistant behind the example.com help desk. It drafts replies to customer tickets for the agent on shift, classifies and tags incoming tickets, estimates response deadlines, and runs the nightly batch jobs (thread summaries, dashboard insights, refund reviews).

## Layout

| Path | What it holds |
|---|---|
| `src/` | TypeScript service: the reply loop, triage, the billing-portal reader |
| `worker/` | Python batch worker: summaries, tagging, dashboard insights, refund computations |
| `scripts/` | Repository checks run in CI |
| `.claude/` | The Claude Code setup the team works with |
| `docs/` | Decisions and team conventions |

## Running it locally

```bash
pnpm install
cp .env.example .env        # sandbox help-desk tenant, fake keys
pnpm dev
```

The worker runs with `uv run python -m worker.jobs <job-name>`.

Both halves read `ANTHROPIC_API_KEY` from the environment. The sandbox tenant at `https://sandbox.help.example.com` holds synthetic customers only.
