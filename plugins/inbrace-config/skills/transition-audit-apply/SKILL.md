---
name: transition-audit-apply
description: Apply-and-close stage of the model-transition audit. Use only when that audit's run file names this stage next.
user-invocable: false
allowed-tools: Skill(inbrace-config:transition-audit) Read Grep Glob
metadata:
  max-bytes: 14000
---

# Apply, verify, close

**This stage changes exactly what the user approved, checks it, and closes every run the same way** — cancelled at the plan, stopped at the report, or applied.

## Before anything

- [N01] Run only when the run file under `.claude/audits/` names this stage as next, and otherwise stop at once, saying this skill runs only inside the model-transition audit.
- [N02] Where the orchestrator's norms are no longer in context, as after a compaction, invoke `transition-audit` with `--resume` and stop.

## Apply

- [N03] Append the decision to the report file before the first edit, then each change as it is applied and the verification result, so the report records what the audit changed and a resume can continue from the last edit.
- [N04] When the user chose to see the diff first, show the diff of every proposed change in the chat without editing any file, then ask whether to apply all of it, choose by type, or stop, with the cost of applying in each applying option.
- [N05] Before removing any text, search the root for the exact string, and where a test, hook or script matches it, leave the text and name that dependency in the close.
- [N06] Apply exactly the approved set and nothing beside it, and edit no file the plan marked read-only: name it with its change for the user to make where it is produced.
- [N07] After applying, check every edited file again against the known traps and the change digest, and confirm that no safety rule, confirmation step, permission boundary, project fact or measured-failure rule was removed.

## Close

- [N08] Close every run the same way: the final checklist with each stage done or skipped; the files edited, and every approved change not applied with the reason; the gates the arguments answered; the reference material kept out of the chat, listing only what has items — what was not audited, any file read only in part, the older residue with `/claude-api prompt-audit`, the counts by confidence; one line saying the gates counted tokens of context without the cache re-reads of every round trip, which multiply the tokens actually sent (measured: about 10× across agents and session on a 47-batch run), so the statusline, the bill and each agent's token count are no check of the estimate, while `/usage`, also `/cost`, shows the real volume and the Console or the plan's usage page the bill; where the audit wrote files under `.claude/audits/`, that they are untracked and keeping, committing or deleting them is the user's call; where the audit ran, that running it again refines the result at about this round's cost, whenever the user chooses; and one recommended next step.
- [N09] Where the audit ran, make the next step the knowledge file's `<next_step>`, since the guides' advice is a starting point the project's own measurements confirm.
- [N10] Where this session can publish an artifact, offer in the close to publish the report as one for sharing, and publish only if the user accepts.

## Sources

- `/usage` and `/cost`: https://code.claude.com/docs/en/costs#track-your-costs and https://code.claude.com/docs/en/commands
- How each round trip re-reads the context from cache: https://code.claude.com/docs/en/prompt-caching#how-the-cache-is-organized
- Anthropic's Claude API skill and its `prompt-audit` subcommand: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
