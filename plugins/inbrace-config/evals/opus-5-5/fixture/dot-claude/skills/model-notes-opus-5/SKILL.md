---
name: model-notes-opus-5
description: Working notes for sessions and agents on Claude Opus 5 in this repository.
---

# Notes for Claude Opus 5

These notes reach every session through the session-start hook and every pinned agent through its `skills:` list.

## Output

- Keep outputs reasonably concise: lead with the answer, then the evidence.
- Match the length of written documents to what the task needs; no filler sections, redundant summaries or boilerplate.

## Tools

- When you use a tool, you may say a brief sentence first. If no tool can express what the user asked for, say so instead of guessing. Do not include internal or system XML tags in your response.

## Thinking

- Do not think on lookups and one-line fixes: answer at once.

## Clauses

- Quote clause text exactly, with its section number; never paraphrase inside quotation marks.
- Write dates as `YYYY-MM-DD` and amounts with their currency code.
