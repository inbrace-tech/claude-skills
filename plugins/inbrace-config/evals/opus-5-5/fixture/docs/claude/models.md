# Model notes

Every session and agent in this repository runs on Claude Opus 5 unless its file pins another model.

## Guides we follow

- Prompting Claude Opus 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
- Effort: https://platform.claude.com/docs/en/build-with-claude/effort

## How we run it

- Batch sessions (`claude -p` in the nightly job and the bulk re-extraction) run with thinking disabled to keep them fast; interactive sessions keep thinking on.
- The working notes for each model live in `.claude/skills/model-notes-<model>/`; the session-start hook adds the right ones to every session.
- Prices for the cost dashboard come from `src/billing/model-prices.ts` and `worker/prices.py`.
- Some agents pin other models on purpose; `docs/adrs/` records why.
