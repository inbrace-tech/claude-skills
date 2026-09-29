---
name: transition-audit-report
description: Report stage of the model-transition audit. Use only when that audit's run file names this stage next.
user-invocable: false
allowed-tools: Skill(inbrace-config:transition-audit) Read Grep Glob
metadata:
  max-bytes: 14000
---

# Report and decide

**This stage explains the final list in the chat, plainly enough that the user needs no file to understand each change, and asks what to change, with a recommendation.** Reference material — coverage, what was not audited, older residue, counts — goes to the report file, which keeps everything.

## Before anything

- [N01] Run only when the run file under `.claude/audits/` names this stage as next, and otherwise stop at once, saying this skill runs only inside the model-transition audit.
- [N02] Where the orchestrator's norms are no longer in context, as after a compaction, invoke `transition-audit` with `--resume` and stop.

## Report

- [N03] Write the full report to `.claude/audits/<target>-<YYYY-MM-DD>.md`, opening with the scope, the files read, the files not audited or marked read-only, the batch plan, every approved gate with its estimates and a pointer to the decision section that holds the gates approved later, the counts by id — leaving out older residue and discarded lines — and by confidence; then every finding of the final list grouped by id, with the `D` findings under "Found outside the known traps", the `optional` findings in a section of their own, the older residue, what the verifier discarded or reclassified with each reason, the coverage account, the "Known traps" lines, and every section of the chat report, each written as "none" when empty.
- [N04] Show a readable summary of the final list in the chat before the question of [N07], as Markdown and not in a code block, in the form and order of `<chat_report>` and nothing more: the scope and cost so far; "What I would change", the numbered changes, each typed remove, add, setting or rewrite; "Read-only — change it where it is produced", numbered on; "Optional — the guide says consider", numbered on; "Why", one line per id found saying what changed for the target and what it means here, naming how many findings came from reading the docs outside the known traps; "What the verifier discarded or reclassified", the count per category with one or two real examples; "My recommendation", naming the option [N07] recommends and why; and the `/claude-api migrate` line only when there is API code. Leave out of the chat a heading with nothing under it, and above fifteen changes show the fifteen of highest impact and the count per id for the rest:

<chat_report>

```markdown
**<title> audit — <project>** · <scope audited> · <files> files · ~<tokens> tokens so far

**What I would change**

| # | File | Id | Today | Change | Type | Confidence |
|---|---|---|---|---|---|---|
| 1 | <file:line> | <Pnn or Dnn> | <what it says, in a few words> | <what it becomes> | <remove/add/setting/rewrite> | <high/medium/low> |

**Read-only — change it where it is produced**

| # | File | Id | Today | Change | Type | Confidence |
|---|---|---|---|---|---|---|

**Optional — the guide says consider**

| # | File | Id | Today | Change | Type | Confidence |
|---|---|---|---|---|---|---|

**Why**
- <id>: <what changed for the target, in one plain sentence, and what it means here>

**What the verifier discarded or reclassified**
- <n> <category>: e.g. <file:line> — <the reason, in a few words>

**My recommendation:** <one or two sentences: what to do and why>

**API code:** /claude-api migrate <files> to <target id>
```

</chat_report>

- [N13] Add to the report file the section "Known traps possibly stale", listing each trap whose drift line is not `holds` with its verdict, its recorded passage and date, and, for `changed` and `vanished`, the section as the page reads today; and in the chat, after "Why", one line counting those traps.
- [N05] In the report file, close the older-residue section by recommending Anthropic's model-general audit, `/claude-api prompt-audit`, and the API-code section with the `/claude-api migrate` command covering every file it lists.
- [N06] Propose no diff at this stage: the table names each change in words, and the diff is written for the changes the user approves.

## Decide

- [N07] Ask what to change, with these options: apply every proposed change, its label carrying the count by confidence and the count of optional changes it leaves out; choose by type, only when the table holds more than one type; show the diff first; stop here with the report. Give each applying option its marginal cost — the size of the files it edits plus about 5,000 tokens for verifying and closing — and the total to the end. Recommend by the first matching rule, naming it in the option's description: (1) the project states or enforces a coupling an isolated edit would break — a check that would fail, or a file bound to a pin through a gate or check script, a binding rule or a required changeset or pull-request flow — and applying the table would leave nothing bound to text written for the source model: show the diff first; (2) such a coupling where part of it is not in the table: stop here with the report, naming it; (3) any change of low confidence: show the diff first; (4) otherwise: apply every change. Where the tree is dirty or not a repository, say so in each applying option. Where the arguments gave `--stop-at-report`, answer with "stop here with the report" and say so in the report and the close.
- [N08] For a trap whose change writes the project's model, once the user chose to apply it and never in the same call as [N07], ask where to write it, saying that `<settings_proposal>` is the audit's proposal and the choice is the user's: shared, in `.claude/settings.json`, for everyone who opens the project — recommended, and when the repository's remote is public, per `gh repo view --json visibility` or an equivalent check, warning that it fixes the model for every contributor, or saying the visibility is unknown; or only for me, in `.claude/settings.local.json`. Cite the URL `<settings_proposal>` gives, and apply the change only to the file chosen.
- [N09] Count as "every proposed change" only what the audit edits — the first table — never the read-only, optional, re-test, already-decided, unclear, handed-off or older-residue items.
- [N10] When the user chooses by type, ask one multi-select question listing only the types present — remove, add, setting, rewrite, optional — each with its count and the table numbers it covers.
- [N11] When the table is empty, skip the question and go to the close, since there is nothing to decide.
- [N12] Append the answers to the report's decision section, set the next stage in the run file, and hand to apply, which closes every run.

## Sources

- Anthropic's Claude API skill, its `migrate` and `prompt-audit` subcommands: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill
- Claude Code settings files, shared and local: https://code.claude.com/docs/en/settings

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
