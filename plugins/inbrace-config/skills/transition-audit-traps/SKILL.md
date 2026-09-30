---
name: transition-audit-traps
description: Known-traps stage of the model-transition audit. Use only when that audit's run file names this stage next.
user-invocable: false
allowed-tools: Skill(inbrace-config:transition-audit) Read Grep Glob
metadata:
  max-bytes: 14000
---

# Known traps: check what discovery missed

**This stage applies the transition's known traps as a checklist after discovery.** Each trap is an edge case an earlier audit learned, with the passage it rests on. The checklist makes sure each was checked, adds what discovery missed, and corrects what discovery got wrong. It never narrows what discovery found.

## Before anything

- [N01] Run only when the run file in the run's folder under `.model-audits/` names this stage as next, and otherwise stop at once, saying this skill runs only inside the model-transition audit.
- [N02] Where the orchestrator's norms are no longer in context, as after a compaction, invoke `transition-audit` with `--resume` and stop.
- [N03] Read the whole knowledge file the run file names, its `<traps>` included; in a quick sweep, which has no discovery, first write the run's brief as `transition-audit-discover` describes it, reading that skill's `SKILL.md` beside this one's directory for the brief's contents and its "Classify" norms.

## Check each trap

- [N04] Check every trap in order, recording a finding only where its signal is present and its "applies when" holds for that file, and classifying by the "Classify" norms the brief carries.
- [N05] Where a discovery line already records what a trap describes — the same file, the same construct and that trap's id or none — give that line the trap's id, keep `(was: Dnn)` at the end of its note, and take the trap's kind, change and confidence where they are stronger than the line's, so each finding appears once; where another trap fires on that construct, give it its own line, since the unit is one line per id per `file:line`.
- [N06] Otherwise look for the trap: for a trap whose `sweep` is `yes`, search its signal across the areas it names, naming `.claude` explicitly, and read the lines around each match, except those [N12] covers; for the others, read the files the inventory holds in every area the trap's `area` lists — ids of the plan's `<map>` — within the reading estimate the user approved; record each finding with the trap's id and `trap` in its `<doc>` field.
- [N12] For a trap the knowledge file's `<unquoted>` lists, take its lines from `unquoted.md` instead of searching, and record each with `[not quoted: <label>]` as the quoted text, judging its "applies when" from the lines around it and never reading or quoting the line itself.
- [N07] Correct a discovery line that a trap contradicts — one proposing to change what `<protected>` keeps, or a change where the trap says re-test — giving it the trap's status and ending its note with `(was: <what it said>)`.
- [N08] Give a finding from a trap whose `kind` is `optional` the status `optional` and a confidence no higher than medium, so it is shown apart from the changes the docs state outright.
- [N11] Give a finding from a trap whose drift line is not `holds` a confidence no higher than medium, and end its note with "possibly stale: <verdict> since <verified>", so the user sees that the passage behind it has changed or could not be checked.
- [N09] Give a finding from a `re-test` trap the status `re-test`, and from a `hand-off` trap the hand-off to `/claude-api migrate`; leave a `setting` trap's file choice to the report stage's question.

## Close the stage

- [N10] Append to the findings file, under "Known traps", one line per trap — `Pnn: fired <n>`, `Pnn: checked, clean in <the area ids read>`, or `Pnn: not checkable, <why>` — so the report can show that every known trap was checked, then set the next stage.

## Sources

- Subagents, preloaded skills and project memory: https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents
- Anthropic's Claude API skill and its `migrate` subcommand: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
