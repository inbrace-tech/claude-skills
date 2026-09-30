---
name: transition-audit-discover
description: Stage 2 of the model-transition audit. Use only when that audit's run file names this stage next.
user-invocable: false
allowed-tools: Skill(inbrace-config:transition-audit) Read Grep Glob
metadata:
  max-bytes: 28000
---

# Discover: read the docs, then the files

**This stage finds what the move to the target model changes in this project, without a list of what to find.** It reads today's docs for the transition, writes down what changed with the passage behind each change, and reads the inventory against that, following leads the map did not name. The known traps come after, in their own stage; nothing here is limited to them.

## Before anything

- [N01] Run only when the run file in the run's folder under `.model-audits/` names this stage as next, and otherwise stop at once, saying this skill runs only inside the model-transition audit.
- [N02] Where the orchestrator's norms are no longer in context, as after a compaction, invoke `transition-audit` with `--resume` and stop.

## Docs

- [N03] Fetch each page the knowledge file's `<docs>` names — or, in a bootstrap, the pages the user confirmed — as raw Markdown with `curl -fsSL <url>.md` into `docs/` in the run's folder, by its absolute path, never through WebFetch while `curl` works, since WebFetch returns a small model's answer rather than the page; where only WebFetch reaches them, read them through it with a prompt asking for the sections verbatim and say so in the report; where neither does and the user chose to go on, read the knowledge file's traps and use their recorded passages as the docs, noting in every finding "not re-verified since <verified>".
- [N04] Read only what `<docs>` says of each page — whole, the anchored section, or the listed sections — and read a page larger than one read by heading: list its headings with `grep -n '^#'`, then read each needed section with `offset` and `limit`.
- [N05] Write the change digest to `digest.md` in the run's folder, at most about 4,000 tokens: one item per change from the source model to the target that can bear on a Claude Code setup or on Claude API code — behaviour, defaults, settings, parameters, aliases, versions, prices, refusals, tools — each with what changed in one sentence, the page URL with its anchor, and the passage that states it, verbatim, at most 30 words; add the knowledge file's `<protected>` list as the digest's last section.
- [N06] Write the brief to `brief.md` in the run's folder, shared with every agent of the run: the transition — source and target by name and id; the paths of the digest, the doc cache and the knowledge file; `<map>` from the plan; the orchestrator's `<line_format>`, copied; the norms of this stage's "Classify" section, copied; the knowledge file's `<older_residue>` and `<protected>`; the lines of `unquoted.md`, as `file:line | id | label`, never their text; and the project facts the classification depends on — the evaluation of the target the plan found, the model pins, the read-only files, the scripts the prefix search matched — each as `file:line` with the quoted text, never a paraphrase or a count no command measured.

## Read

- [N07] Read one batch at a time, and after each batch — or each auditor's return, batch by batch — append its lines to the findings file under a line naming the batch, or that line alone when it was clean, renumbering an auditor's `D` ids to continue the run's sequence, before opening anything else — the next batch, a skill read as context, a lead — so a refusal loses at most one batch, no finding depends on file contents still in context and a resume can tell which batches are done.
- [N25] Read a file holding a line `unquoted.md` lists in the line ranges around it, never that line, and record each such line as its trap's id with `[not quoted: <label>]` as the quoted text, judging [N13] from the lines around it; cite the same way, by `file:line` and a label of a few words, any other line that asks the model to reveal its reasoning.
- [N08] In agents mode, start one `batch-auditor` per area part of the plan — `inbrace-config:batch-auditor` from the plugin, `batch-auditor` when copied — passing no `model`, since the agent pins its own, with its batches and the brief; keep the auditors running at once below Claude Code's concurrent subagent limit — 20 by default, or `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` — dispatching the rest in waves; follow the project's own dispatch conventions where its `CLAUDE.md` or hooks require them; and where the agent is not listed or the project forbids it, read the batches in this session.
- [N09] Judge each instruction and each construct of a batch against the digest and the docs, and record a finding only where a passage states that the target behaves differently, that the old form fails or is ignored, or that the target needs something the file lacks, quoting that passage in the line's `<doc>` field; number the findings `D01`, `D02`, … in the order they are recorded across the run.
- [N10] Search the whole root, naming `.claude` explicitly, for every concrete token the digest names — a setting, an environment variable, a request parameter, a header, a tool version, a model id or alias, a version number, a price — and read each match outside the inventory as a lead, since a closed inventory missed a price table, a guide index and a version floor in a measured run.
- [N11] Follow a lead — a match of [N10], or a file a listed file imports, runs or tells the model to read — within the expansion budget the plan set, and record each file read that way, with its reason, in the coverage account.
- [N12] Record no finding about model behaviour in a file pinned to a model other than the source or the target.

## Classify

- [N13] Record a finding only where the text instructs the model how to behave, and skip a signal word in prose about something else — a pull request's scope, a delegation in the architecture, a checklist in a runbook.
- [N14] Record an instruction that belongs to a transition older than the source model, such as those `<older_residue>` names, as `P00` with the status `older residue` and no proposed change, only with a passage showing it was written for a model older than the source — the source model's guide, or a section of the migration guide for older models, saying it is no longer needed — and record nothing without one; one the project already weighed is `already decided`, per [N20].
- [N15] Never propose removing a safety rule, a confirmation step for a destructive or irreversible action, a permission boundary, a fact about the project, or an instruction its file says exists because of a measured failure; record anything whose purpose you cannot determine as `unclear` instead.
- [N16] Record every finding in Claude API code with the hand-off `/claude-api migrate <files> to <target id>` as its proposed change, and keep it out of what the audit edits, since Anthropic's `claude-api` skill migrates request code with the right syntax for each SDK and platform.
- [N17] Treat the `description` in a skill's or agent's frontmatter as routing text, where calibrated urgency is legitimate, and judge wording only in text that shapes behaviour.
- [N18] Grade confidence high when a passage states the change or that the old form fails, medium when it says to consider or re-test, and low when the finding rests on your inference or on a system card alone, which you cite by page and section, claiming no more than the passage supports.
- [N19] Record a batch as clean when nothing applies, and never stretch a passage to fill the report.
- [N20] Record as `already decided`, with no proposed change, a finding the project states it already evaluated for the target model, citing where; record a decision made once for every file as one line naming the files it covers.
- [N21] Before recording that an agent lacks an instruction, search the skills its frontmatter lists under `skills:` for that instruction with Grep, reading only the lines around a match and none `unquoted.md` lists, as context and without auditing them again, and record nothing when one states it, since each is loaded in full into the agent at startup — unless that skill sets `disable-model-invocation: true` or cannot be read; read too the project memory the brief names, and record nothing when it states the instruction and the agent does not set `omitClaudeMd: true`, since a custom subagent loads that memory at startup.
- [N22] Never record a finding for what the knowledge file's `<protected>` lists, or for what the target's own guide keeps or recommends.
- [N24] Judge the model and effort the project runs with by what reaches everyone who runs it — its project, local and managed settings, the flags of its launch commands, the frontmatter of its files — and never let the user's `~/.claude/settings.json` clear a trap, make a finding `already decided` or lower it, since other developers, CI and headless runs never get that file; the note may say what it does on this machine.

## Close the stage

- [N23] End with the coverage account, written to the report file under "Coverage" and summed in the run file: per area of the map, the files read in full, read in part with the line ranges and the lines skipped per [N25], or not read and why — `not audited — refusal` included; the leads followed; and how the docs were read — fetched raw, through WebFetch, or from the recorded passages — then set the next stage.

## Sources

- WebFetch returns a small model's answer; `curl` reads the raw page: https://code.claude.com/docs/en/tools-reference#webfetch-tool-behavior
- Read and its `PARTIAL view` above the token limit: https://code.claude.com/docs/en/tools-reference#read-tool-behavior
- Subagents, what loads at startup, `omitClaudeMd` and preloaded skills: https://code.claude.com/docs/en/sub-agents#what-loads-at-startup and https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents
- The concurrent subagent limit: https://code.claude.com/docs/en/sub-agents#concurrent-subagent-limit
- Anthropic's Claude API skill and its `migrate` subcommand: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
