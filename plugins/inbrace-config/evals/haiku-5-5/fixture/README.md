# helpdesk-triage

Tags, routes and drafts first replies for help-desk tickets.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Node 22 or later. The agents under `.claude/` run in Claude Code; install it with `npm install -g @anthropic-ai/claude-code`.

## Layout

- `src/` — the service and its Claude API calls
- `worker/` — the Python extraction worker
- `scripts/` — metrics and Claude Code hooks
- `.claude/` — agents, rules, skills and commands for Claude Code
