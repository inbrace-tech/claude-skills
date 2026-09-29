---
name: model-notes-sonnet-5
description: Working notes for sessions and agents on Claude Sonnet 5 in this repository.
---

# Notes for Claude Sonnet 5

These notes reach every session through the session-start hook and every pinned agent through its `skills:` list.

## Effort

- `medium` suits bounded, well-specified work: a single bug with a known cause, a lint pass, a lookup.
- For the hardest coding work — multi-module refactors, anything touching `src/assistant/reply-loop.ts` — run at `xhigh`, the level recommended for that class of work.
- At `low` and `medium`, Sonnet 5 keeps to what was asked and adds no tests, docs or files unprompted, so briefs at those levels need no scope reminder.

## Thinking

- Only think when a step needs it: a lookup or a one-line fix should get an immediate answer.
- Think carefully through the problem before responding on anything that touches billing or refunds.

## Output

- Apply the formatting rules in this section to every section of a document you write, not only the first one.
- Lead with the answer and put the evidence after it.
- Use Markdown headings only in documents longer than one screen.
