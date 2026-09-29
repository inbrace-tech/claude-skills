# Conventions for Claude Code work

## Delegating to agents

- Read-only lookups — a log search, finding where a setting is read, summarising a ticket thread — go to a general-purpose subagent on `sonnet`: pass `model: "sonnet"` in the Agent call.
- Anything that edits code goes to `code-fixer`. For an ad-hoc edit outside its scope, dispatch a general-purpose agent with `model: "claude-sonnet-5"`, so the edit runs on the same model as the pinned agents.
- Every brief names the ticket, the files in scope and what "done" means.
- Diagnoses go to `ticket-researcher` first; `code-fixer` never starts without its verdict.

## Tickets and replies

- Tier-1 agents respond directly to the customer within four business hours. The assistant's drafts go to the agent on shift, never to the customer.
- A reply that mentions money, a date or a policy exception is always reviewed by a person before it is sent.

## Claude API code

- Every TypeScript call goes through `src/lib/claude.ts`, every Python call through `worker/client.py`.
- The billing client batches account lookups to minimize tool calls against the rate-limited billing API.
- Model ids live in those two files only.
