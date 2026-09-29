# Design: one transition-agnostic model audit

Status: proposed, for review. Implements the direction of #34, which supersedes #29. Nothing here is built yet; this document settles the open questions of #34 so the implementation can be reviewed against it.

Every claim about Claude Code below was checked against the documentation as served on 2026-09-29, fetched as raw Markdown (`<page>.md`), and cites the page and the passage. Norm ids are written in backticks (`N05`) because the ids of the new surfaces do not exist yet; an id of today's skills is named with its surface, as in `audit-sonnet-5-5` `N05`.

## Contents

1. [Surfaces and the order they run in](#1-surfaces-and-the-order-they-run-in)
2. [The per-transition knowledge file](#2-the-per-transition-knowledge-file)
3. [Fetching the docs at runtime](#3-fetching-the-docs-at-runtime)
4. [The doc drift check's comparison rule](#4-the-doc-drift-checks-comparison-rule)
5. [Size budget per surface](#5-size-budget-per-surface)
6. [Where today's norms go](#6-where-todays-norms-go)
7. [The opt-in issue draft](#7-the-opt-in-issue-draft)
8. [Migration and versioning](#8-migration-and-versioning)
9. [How it will be measured](#9-how-it-will-be-measured)
10. [Where this design departs from #34](#10-where-this-design-departs-from-34)
11. [Sources](#11-sources)

## 1. Surfaces and the order they run in

### 1.1 Why the orchestrator cannot keep `disable-model-invocation: true`

#34 asks for an orchestration skill that invokes stage skills, and for the two existing commands to stay as thin entry points that "run the orchestration skill". Two documented rules decide the frontmatter:

- `disable-model-invocation: true` means "Only you can invoke the skill", and "If Claude tries anyway, Claude Code blocks the call" (skills › Control who invokes a skill). A thin entry point is Claude following a skill's text, so if the orchestrator set this field, no entry point and no stage could start it, and nothing could reload it after compaction.
- `user-invocable: false`: "Claude Code hides it from the `/` menu and doesn't run it when you type `/name`" (skills › Frontmatter reference), while "With `user-invocable: false`, you can't invoke the skill, but Claude still can" (skills › Restrict Claude's skill access).

So only the commands a person types keep `disable-model-invocation: true`. The orchestrator and every stage are `user-invocable: false`: out of the `/` menu, invocable by Claude through the Skill tool, with arguments, since "Both you and Claude can pass arguments when invoking a skill" (skills › Pass arguments to skills).

**What frontmatter cannot do.** No field keeps a model-invocable skill out of unrelated tasks. For `user-invocable: false` the docs state "Description always in context, full skill loads when invoked" (skills › Control who invokes a skill), and "Every skill in the skill listing adds to your context on every turn, whether or not Claude ever uses it" (skills › Find unused skills). `skillOverrides` could hide them, but "Plugin skills are not affected by `skillOverrides`" (skills › Override skill visibility from settings). `paths` limits automatic activation to matching files, but the docs do not say how it interacts with an explicit Skill call, so the design does not rely on it. The design therefore keeps stages out of unrelated tasks with two measures it can guarantee:

1. **A routing description that names its only caller**, at most 120 characters, such as `Stage 3 of the model-transition audit. Use only when that audit's run file names this stage next.`
2. **A guard as each stage's first norm**: the stage runs only when the run file under `.claude/audits/` (§1.4) names it as the next stage; otherwise it stops at once, saying it runs only inside the audit. A mistaken invocation then costs one skill load and changes nothing.

The cost is real and goes in the README: while `inbrace-config` is enabled, seven short stage descriptions (about 30 tokens each, about 200 in all) sit in every session's skill listing, where today the plugin's skills put nothing (the README's "Command only" row). The README's mode table gains a third row, "Stage — started only by the audit — its one-line description".

**Permissions.** The Skill tool requires permission (tools-reference › Tools available to Claude, the `Skill` row: "Executes a skill within the main conversation | Yes"), and `allowed-tools` grants "permission for the listed tools during the turn that invokes the skill … The grant clears when you send your next message" (skills › Pre-approve tools for a skill). Each entry point and each stage lists, in `allowed-tools`, the exact names of the orchestrator and the stages it may hand to (`Skill(inbrace-config:transition-audit-discover)`, the form `Skill(name)` being an exact match per skills › Restrict Claude's skill access), so every hop re-grants the next one and a gate answered in a later message does not leave the next stage behind a prompt. Where a copied install drops the `inbrace-config:` prefix, the grant does not match and Claude Code asks once per stage; the plan says so.

### 1.2 The surfaces

All live in `plugins/inbrace-config/`. Skills are `skills/<name>/SKILL.md` with `SKILL.norms.json`; agents are `agents/<name>.md` with `<name>.norms.json`.

| Surface | Kind | Frontmatter | Started by | Reads | Writes / returns |
|---|---|---|---|---|---|
| `audit-model-transition` | skill, entry | `disable-model-invocation: true`, `argument-hint: "<source> <target> [path] [--scope full\|reduced\|quick] [--mode session\|agents] [--stop-at-report]"`, `allowed-tools: Skill(inbrace-config:transition-audit)` | the user | its arguments; the `transitions/` directory's frontmatter lines | invokes `transition-audit` with `--transition <slug>` and the rest of the arguments |
| `audit-opus-5-5`, `audit-sonnet-5-5` | skill, entry | as today (`disable-model-invocation: true`, same `argument-hint`), plus the same `allowed-tools` | the user | its arguments | invokes `transition-audit` with `--transition opus-5-to-5-5` or `sonnet-5-to-5-5` and `$ARGUMENTS` unchanged |
| `transition-audit` | skill, orchestrator | `user-invocable: false`, `allowed-tools` naming the seven stage skills | an entry point; itself with `--resume` after compaction | the arguments, the run file | the run file; the checklist; starts each stage in order; starts the verifier (stage 5); owns the line format and the findings file |
| `transition-audit-plan` | skill, stage 1 | `user-invocable: false` | `transition-audit` | the knowledge file, the audit root, git, settings and hooks | inventory, measurements, doc probe, the plan tables and the first gate; appends the plan to the report file |
| `transition-audit-discover` | skill, stage 2 | `user-invocable: false` | `transition-audit` | the docs (§3), the inventory, leads found while reading | the doc cache, the change digest, the brief, discovery lines in the findings file, the coverage account |
| `transition-audit-drift` | skill, stage 3 | `user-invocable: false` | `transition-audit` | the knowledge file's recorded passages, the doc cache | a drift line per trap source (§4), in the findings file |
| `transition-audit-traps` | skill, stage 4 | `user-invocable: false` | `transition-audit` | the knowledge file, the findings file, the files a trap's area names | trap lines: each discovery line relabelled with the trap it matches, the findings discovery missed, corrections, and a per-trap coverage line |
| `finding-verifier` | agent, stage 5 | as today: `model: claude-opus-5-5`, `effort: medium`, `tools: Read, Grep, Glob`, `omitClaudeMd: true` | `transition-audit` | the brief, the raw lines of its shard, the cited files, the doc cache | the final list, per its `<return_contract>` |
| `transition-audit-report` | skill, stage 6 | `user-invocable: false` | `transition-audit` | the final list, the drift lines, the coverage account | the report file, the chat report, the decision gate |
| `transition-audit-apply` | skill, stage 7 | `user-invocable: false` | `transition-audit` | the approved set | the edits, the verification, the close, the opt-in issue draft (§7) |
| `batch-auditor` | agent, inside stage 2 | as today | `transition-audit-discover`, in agents mode | the brief, its batches | discovery lines, per its `<return_contract>` |

Agents stay where the work runs in parallel: the auditors of stage 2 on a large inventory, and the verifier, which is sharded above 40 raw findings (§1.3). No stage is an agent, and `context: fork` is not used, since a forked skill "doesn't see your conversation history" (skills › Run skills in a subagent) and every stage depends on the gates answered in the session.

Knowledge files live beside the orchestrator, in `skills/transition-audit/transitions/`, so `${CLAUDE_SKILL_DIR}` finds them both from the plugin and in a copied install; `${CLAUDE_PLUGIN_ROOT}` is "Substituted only in plugin skills" (skills › Available string substitutions). The orchestrator writes their absolute path into the run file, and every later stage reads it from there.

### 1.3 The order

```text
Sonnet 5 → Sonnet 5.5 audit              (title from the knowledge file)
  [ ] 1. Plan: list, measure, check the docs, confirm       transition-audit-plan
  [ ] 2. Discover: read the docs and the files              transition-audit-discover (+ batch-auditor ×N)
  [ ] 3. Drift: check the known traps against today's docs  transition-audit-drift
  [ ] 4. Known traps: add what discovery missed             transition-audit-traps
  [ ] 5. Verify: an agent tries to refute every finding     finding-verifier (×1, or one per shard)
  [ ] 6. Report and decide                                  transition-audit-report
  [ ] 7. Apply, verify, close                               transition-audit-apply
```

Stages 1 and 6 end in gates; a cancelled plan goes straight to the close in stage 7, as today. The quick sweep (§6, `N51`) runs 1, 3, 4 (lexical traps only), 5, 6 and 7, and marks 2 skipped. A run with no knowledge file for the pair (bootstrap, §2.5) marks 3 and 4 skipped. With `--stop-at-report` or in a headless run, 7 runs only its close.

Verifier shards: up to 40 raw findings, one verifier, as today. Above that, one verifier per group of files of about 40 findings, never splitting one file across shards, so the verifier's rule "merge only duplicates — lines with the same file, line and pattern id" still sees every candidate duplicate. The shards run at once, below the concurrent-subagent limit (sub-agents › Concurrent subagent limit: "when 20 subagents are running in a session, spawning another with the Agent tool fails").

### 1.4 The run file and compaction

A run keeps `.claude/audits/<target>-<date>.run.md` beside today's findings and report files: the transition slug, the knowledge file's absolute path, the doc cache directory, the audit root, the answered gates, the stage just finished and the stage next. It exists for two documented behaviours:

- Invoked skill content "stays there across later turns", but after compaction "Claude Code re-attaches the most recent invocation of each skill after the summary, keeping the first 5,000 tokens of each. Re-attached skills share a combined budget of 25,000 tokens … so older skills can be dropped entirely" (skills › Skill content lifecycle). The orchestrator is the oldest skill of the run, so it is the first to go. Every stage therefore carries a norm: when the orchestrator's norms are no longer in context, invoke `transition-audit --resume`, which is possible only because the orchestrator is model-invocable (§1.1). "If the skill is large or you invoked several others after it, re-invoke it after compaction to restore the full content" (same section).
- The stage guard of §1.1 reads the run file to decide whether it may run.

Today's resume norm (`N47`) moves to the orchestrator and reads the run file first.

## 2. The per-transition knowledge file

### 2.1 Files

One transition, two files, in `skills/transition-audit/transitions/`:

- `<slug>.md` — what Claude reads at runtime: the transition, the docs, the transition-specific data today's norms carry inline, and the traps with the passages they rest on. The slug is `<source>-to-<target>`, dropping the family from the target when both share it: `opus-5-to-5-5`, `sonnet-5-to-5-5`, `sonnet-5-to-opus-5-5`.
- `<slug>.traps.json` — the history, never loaded at runtime, as `SKILL.norms.json` is for norms: where each trap was learned, the issues and pull requests behind it, what was measured, and the retired trap ids.

### 2.2 `<slug>.md`

````markdown
---
transition: sonnet-5-to-5-5
title: Sonnet 5 → Sonnet 5.5
source: { name: Claude Sonnet 5, id: claude-sonnet-5, alias: sonnet }
target: { name: Claude Sonnet 5.5, id: claude-sonnet-5-5, bedrock: anthropic.claude-sonnet-5-5 }
claude-code-floor: v2.1.284
verified: 2026-09-29
---

<docs>
| Role | URL | Read |
|---|---|---|
| target prompting guide | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5 | whole |
| migration guide | https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#migrating-from-claude-sonnet-5 | the anchored section |
| what's new | https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5 | whole |
| source prompting guide | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 | on demand, to recognise text written for the source |
| Claude Code model configuration | https://code.claude.com/docs/en/model-config | sections: model-aliases, version-history, adjust-effort-level, extended-thinking, automatic-model-fallback |
| system card | https://www-cdn.anthropic.com/…/Claude%20Sonnet%205.5%20System%20Card.pdf | pages the traps cite |
</docs>

<source_id_match>   the source id used as a prefix or pattern: startsWith("claude-sonnet-5"), claude-sonnet-5*, ^claude-sonnet-5   (today's `N59`)
<api_signals>       output_config, budget_tokens, tool_choice, between_tools, thinking   (today's `N02`)
<older_residue>     assistant prefill; non-default temperature, top_p or top_k; budget_tokens; forced interim status scaffolding   (today's `N11`)
<protected>         the list of today's `audit-sonnet-5-5` `N61`, each item with its passage
<settings_proposal> "model": "claude-sonnet-5-5", provider id on Bedrock, keep [1m], write no effort level   (today's `N48`)
<next_step>         re-run the project's evals, or an effort sweep from the guide's starting points   (today's `N23`)

<traps>

### P40 — Price table without a Sonnet 5.5 entry

- kind: change
- area: price-tables
- signal: a per-model price table or rate lookup naming `claude-sonnet-5` with no `claude-sonnet-5-5` entry
- applies when: model-dependent code and docs
- change: add an explicit `claude-sonnet-5-5` entry at Sonnet 5's prices; a lookup that falls back to the `claude-sonnet-5` stem is right today only by that coincidence
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#pricing
  passage: "Claude Sonnet 5.5 has the same prices as Claude Sonnet 5, including prompt caching and batch processing rates"
  verified: 2026-09-29

</traps>
````

(The six single-line sections are shown compressed; in the file each is a tagged block like `<docs>`.)

Trap fields:

| Field | Values | Replaces today's |
|---|---|---|
| id | `P` + two digits, stable, never reused within the file | the row id |
| kind | `change`, `re-test` (listed under "Re-test only, no edit"), `optional` (today's `N60` list), `hand-off` (API code, today's `N25`), `setting` | prose in the row and in `N60` |
| area | one area of the discovery map (§2.4) | the implicit area in "Applies when" |
| signal, applies when, change, confidence | as in today's row | the row's columns |
| sweep | `yes` when the signal is lexical | the lists in `N51` |
| context | `user-settings` when the trap reads `~/.claude/settings.json` as context | the list in `N37` |
| source (one or more) | URL with anchor; `passage` quoted verbatim, `…` joining fragments of one section; `verified` date; or `basis: inference` with the reasoning, or `basis: system-card p.N §x` | the inline citations |

"Where learned" is the one provenance field that has no runtime use, so it lives in the sidecar, which "Claude never loads … on its own, so the history costs no context" (CONTRIBUTING.md › Writing a skill):

```json
{
  "transition": "plugins/inbrace-config/skills/transition-audit/transitions/sonnet-5-to-5-5.md",
  "traps": [
    {
      "id": "P40",
      "learned": "Added in 0.5.0 after round 4 of the capability evaluation missed a price table (#28).",
      "refs": { "inbrace-tech/claude-skills": [28] }
    }
  ],
  "retired": []
}
```

`check-norms` is extended to hold every trap to one sidecar entry and back, to require at least one source per trap with an https URL and either a non-empty passage and an ISO `verified` date or a `basis`, and to refuse a retired trap id reused as a live one.

### 2.3 Mapping of today's pattern rows

Every row keeps its id in its transition's file, so every citation of a row in issues, pull requests and sidecars stays true. "Learned" is the pull request that first introduced the row's title, found with `git log -S "<title>"` on `origin/main`; a Sonnet row whose title first appeared in the Opus skill cites both. The passages the rows quote were checked on 2026-09-29 with the rule of §4: all 22 in the Sonnet table and all 8 in the Opus table hold.

**`sonnet-5-to-5-5.md`** (42 traps, from `audit-sonnet-5-5` 0.5.x)

| Row | Trap | Kind | Area | Sweep | Learned |
|---|---|---|---|---|---|
| P01 | Project settings run Sonnet 5 | setting | settings | yes | #28 |
| P02 | Agent, skill or launch still pinned to Sonnet 5 | change | agents, skills, dispatch | yes | #28 |
| P03 | Effort level carried over from Sonnet 5 | re-test | agents, skills, settings | yes | #28 |
| P04 | Thinking turned off by a setting Sonnet 5.5 ignores | re-test | settings | yes | #28 |
| P05 | Sonnet 5 prompting delivered by prefix | change / re-test | hooks, gate scripts | no | #28, #33 |
| P06 | Sonnet alias in dispatch conventions | re-test | agents, dispatch | yes | #28 |
| P07 | Sonnet 5 behaviour claim a Sonnet 5.5 source contradicts | re-test | instructions | no | #28 |
| P08 | Instructions to think less or not to think | change | instructions | yes | #28 |
| P09 | Reasoning written into the response | change | instructions | yes | #1, #28 |
| P10 | Updates held until the end | change | instructions | yes | #28 |
| P11 | Language that discourages tool use | change | instructions | yes | #28 |
| P12 | Search tool without the check-current-facts instruction | change | agents, skills | no | #28 |
| P13 | No update cadence | optional | agents | no | #2, #28 |
| P14 | Agent that may check in before the work is done | optional | agents, skills | no | #28 |
| P15 | Unrequested additions in a minimal-diff project | optional | agents, skills, memory | no | #28 |
| P16 | Self-started review rounds at `xhigh` or `max` | optional | agents, skills | no | #28 |
| P17 | Open-ended requests that start building | optional | skills, commands | no | #28 |
| P18 | Coding at `low` effort with no verification rule | optional | agents, skills | no | #28 |
| P19 | Harness text after every tool result | re-test | hooks | no | #28 |
| P20 | Blanket authorization | optional (system card) | agents | yes | #28 |
| P21 | Faults left in replayed history | optional (system card) | API code | no | #28 |
| P22 | Thinking disabled, or `between_tools` where it fails | hand-off | API code | yes | #28 |
| P23 | Forced tool use | hand-off | API code | yes | #2, #28 |
| P24 | History edited between requests | hand-off | API code | no | #2, #28 |
| P25 | Model switched mid-conversation | hand-off | API code | no | #28 |
| P26 | Silent agentic turns | hand-off | API code | yes | #2, #28 |
| P27 | User text placed with tool results | hand-off | API code | no | #28 |
| P28 | Old computer-use tool | hand-off | API code | yes | #2, #28 |
| P29 | Advisor the executor rejects | hand-off | API code | no | #28 |
| P30 | Refusals not handled | hand-off | API code | no | #28 |
| P31 | JSON answers that skip the working-out | hand-off | API code | no | #28 |
| P32 | `max_tokens` sized without thinking | hand-off | API code | no | #28 |
| P33 | Tool dispatch that fails on a near-miss name | hand-off | API code | no | #28 |
| P34 | Dense images with no image tools | hand-off | API code | no | #28 |
| P35 | Effort changed between requests | hand-off | API code | yes | #28 |
| P36 | Caching gated at 1,024 tokens | hand-off | API code | yes | #28 |
| P37 | Sonnet 5 skill preloaded into an agent moving to 5.5 | re-test | agents | no | #28 |
| P38 | No Claude Code version floor | change | setup docs | no | #28 |
| P39 | Content-based fallback unaccounted for | re-test | model notes | no | #28 |
| P40 | Price table without a Sonnet 5.5 entry | change | price tables | no | #28 |
| P41 | Model docs that miss the Sonnet 5.5 guide | change | model docs, guide indexes | no | #28 |
| P42 | Parser that reads only text blocks | re-test | transcript and output parsers | no | #28 |

The "Sweep" column is today's `audit-sonnet-5-5` `N51` list (P01–P04, P06, P08–P11, P20, P22, P23, P26, P28, P35, P36); the optional kinds are its `N60` list (P13–P18, P20, P21).

**`opus-5-to-5-5.md`** (28 traps, from `audit-opus-5-5` 0.5.x)

| Row | Trap | Kind | Area | Sweep | Learned |
|---|---|---|---|---|---|
| P01 | Project not set to Opus 5.5 at `medium` | setting | settings | yes | #7 |
| P02 | Thinking disabled or budgeted | hand-off | API code | yes | #1 |
| P03 | "Don't think" rules | change | instructions | yes | #1 |
| P04 | Reasoning written into the response | change | instructions | yes | #1 |
| P05 | Thinking-disabled mitigation | re-test | instructions | yes | #2 |
| P06 | "Think carefully" in chat prompts | optional | instructions | yes | #2 |
| P07 | Opus 5 tuning instructions | re-test | instructions | no | #2 |
| P08 | Silent agentic turns | hand-off | API code | no | #2 |
| P09 | No update cadence | optional | agents | no | #2 |
| P10 | Unattended runs without a continuation plan | change | agents | no | #2 |
| P11 | Multi-app agents that act without looking | change | agents | no | #2 |
| P12 | Multi-agent runs without time signals | optional | agents | no | #2 |
| P13 | Chat that re-examines settled answers | optional | instructions | no | #2 |
| P14 | Unmarked pasted content | change | API code, apps | yes | #1 |
| P15 | Visual-input scaffolding | re-test | instructions | yes | #1 |
| P16 | Vague design direction | change | instructions | yes | #1 |
| P17 | Forced tool use | hand-off | API code | yes | #2 |
| P18 | Old computer-use tool | hand-off | API code | yes | #2 |
| P19 | History edited between requests | hand-off | API code | yes | #2 |
| P20 | Agent still pinned to Opus 5 | change | agents, skills | yes | #6 |
| P21 | Effort left from Opus 5 on an Opus 5.5 file | re-test | agents, skills | no | #7 |
| P22 | Opus 5 prompting delivered by prefix | change / re-test | hooks, gate scripts | no | #27, #33 |
| P23 | Opus 5 skill preloaded into an agent moving to 5.5 | re-test | agents | no | #28 |
| P24 | No Claude Code version floor | change | setup docs | no | #28 |
| P25 | Content-based fallback unaccounted for | re-test | model notes | no | #28 |
| P26 | Price table without an Opus 5.5 entry | change | price tables | no | #28 |
| P27 | Model docs that miss the Opus 5.5 guide | change | model docs, guide indexes | no | #28 |
| P28 | Parser that reads only text blocks | re-test | transcript and output parsers | no | #28 |

The Opus "Sweep" column is today's `audit-opus-5-5` `N51` list (P01–P06, P14–P20); its optional kinds are its `N60` list (P06, P09, P12, P13).

Beyond the rows, today's norms hold transition data inline. It moves into the file too, so the norms become transition-agnostic:

| Today, inline in | Data | Moves to |
|---|---|---|
| `N02` | the API request tokens (`between_tools` on Sonnet only) | `<api_signals>` |
| `N59` | the source id and its prefix forms | `<source_id_match>` |
| `N11` | examples of older residue (they differ per transition) | `<older_residue>` |
| `audit-sonnet-5-5` `N61` | what the Sonnet 5.5 sources keep or recommend | `<protected>` (Opus: empty) |
| `N48` | the model value, the `[1m]` rule, and whether an effort level is written (Opus: `medium`; Sonnet: none) | `<settings_proposal>` |
| `N23` | the recommended next step (differs per transition) | `<next_step>` |
| `N32`, `N15` | the checklist and report titles | `title` |
| `N25` | the `/claude-api migrate … to <target>` id | `target.id` |
| the `Sources` sections | the transition's doc list | `<docs>` |

### 2.4 The discovery map

The map says **where** model-dependent behaviour lives; it lists no signals. It sits in `transition-audit-plan` (it drives the inventory and the cost) and in the brief (it drives what auditors read). Areas marked new were not in today's `N02`; the rest come from it.

| Area | What to look at |
|---|---|
| Memory | `CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md` and every `@path` import |
| Rules | `.claude/rules/**` |
| Agents, skills, commands | `.claude/agents/`, `.claude/skills/`, `.claude/commands/`, templates, triggers, briefs they tell the model to read |
| Settings | project, local and managed settings, their `env` |
| Hooks and the scripts they run | every `hooks` entry and its script |
| Gate and check scripts | scripts that pick instruction text or check a model id |
| CI and automation (new) | workflow files that run `claude`, pass `--model`, `--effort`, set model env vars, or run evals |
| Claude API code | SDK imports, client wrappers, the strings they send as `system` or messages |
| Model-dependent code and docs | price or rate tables, model selectors, prompting-guide indexes, per-model notes, transcript and output parsers |
| Setup docs (new, explicit) | README and setup scripts: the Claude Code version the project requires |
| Dependency manifests (new) | the pinned Anthropic SDK or Claude Code version, where a new request field or tool needs a newer one |
| Plugin and eval config (new) | a plugin manifest, marketplace or eval suite of the audited project that names a model |

The list closes nothing: discovery also follows leads (§6, discover `N66`–`N68`) and searches the whole root for every concrete token the docs name. The map only makes sure the known places are read.

### 2.5 A pair with no knowledge file

`audit-model-transition` looks up the pair in the `transitions/` frontmatter. With no match, it does not stop: the plan finds the target's prompting guide, migration guide and what's-new page in `https://platform.claude.com/llms.txt` and shows them at the first gate for the user to confirm, and the run marks drift and known traps as skipped. The close then offers the learning-loop draft (§7) as a proposal for a new knowledge file. A new transition is a new knowledge file, but the audit is useful before that file exists.

## 3. Fetching the docs at runtime

**Tool.** Bash with `curl -fsSL <url>.md`, saved under `.claude/audits/docs/<date>/`. The documentation serves raw Markdown at `<page>.md`: on 2026-09-29 every page the two transitions cite answered `200 text/markdown`. Raw text is required because WebFetch "runs the prompt against the content using a small, fast model. For most fetches, Claude receives that model's answer, not the raw page … This makes WebFetch lossy by design … use `curl` via Bash for the unprocessed page" (tools-reference › WebFetch tool behavior). A lossy copy can support reading, but not the verbatim comparison of §4, nor the verifier checking a quoted passage.

**Probe before the gate.** The plan runs `curl -fsI` on each `<docs>` URL and shows at the first gate: reachable or not, the domains (`platform.claude.com`, `code.claude.com`, and `www-cdn.anthropic.com` for a system card), and the pages' size. `curl` through Bash may prompt for permission or be blocked by a sandbox that does not allow the domain, and "Sandboxed commands don't inherit WebFetch's built-in set of preapproved documentation domains" (same section); the gate says so and names the allow rule.

**Reading the pages.** Pages are read into context only as the `<docs>` table says: whole for the prompting guide and the what's-new page, the anchored section for the migration guide (the Sonnet 5.5 guide is 55 KB and covers several source models), and only the listed sections of `model-config`, which at 109 KB is over the Read limit (§5) and is read by heading with `offset` and `limit`. Measured on 2026-09-29 for Sonnet 5.5: guide 27 KB, migration section about 12 KB, what's new 23 KB, the five `model-config` sections about 20 KB, so about 80 KB, about 27,000 tokens at the ratio of §5. This cost is shown as its own line at the first gate.

**The change digest.** Discovery writes what changed from the source to the target as a digest under `.claude/audits/`, one item per change with its URL, anchor and verbatim passage, at most about 4,000 tokens. The auditors and the verifier read the digest and the cached pages, never fetch themselves, so a run fetches each page once.

**Fallback 1: WebFetch.** Where `curl` cannot run but WebFetch can, discovery reads the pages through WebFetch with a prompt asking for the sections verbatim, says so in the report, and every drift line for that page is `unverified`, since a lossy copy cannot confirm a passage.

**Fallback 2: no network.** Where neither reaches the docs, the first gate says so before any spend, and offers to run on the knowledge file's recorded passages: discovery then judges files against those passages only (its reach shrinks to what the traps already know), drift marks every source `unverified (offline)`, every finding's note says "not re-verified", and the report and the close name the verification date the run relied on. A headless run with no network takes this path and says so. With no network and no knowledge file (§2.5), there is nothing to audit against: the run stops at the plan.

**PDF sources.** A system card is a PDF. Where `pdftotext` is installed, drift converts it and compares as §4 says; otherwise its sources are `unverified (PDF)`. Traps that rest only on a system card are optional and low-confidence already (today's `N60`, `N62`).

## 4. The doc drift check's comparison rule

For each `source` of each trap:

1. **Page.** The URL without its fragment, plus `.md`, from the doc cache (fetched in stage 2 or now). No page → go to 4.
2. **Normalise both** the page and the recorded passage the same way: collapse every run of whitespace to one space; replace a Markdown link `[text](url)` by `text`; drop `**` and `*` emphasis markers; replace curly quotes and apostrophes by straight ones; compare case-insensitively. Backticks stay, so a changed code token is a change.
3. **Split** the passage on `…` into fragments, trimming each.
4. **Verdict**, the first that applies:

| Verdict | Condition | Effect on the trap |
|---|---|---|
| `unverified` | the page could not be fetched as raw text (no network, WebFetch only, PDF without `pdftotext`) | applied as recorded; the note says "not re-verified since <verified>" |
| `vanished` | the page returned 404 or 410, or no fragment occurs in it | applied; flagged "possibly stale" in the report, confidence capped at medium |
| `changed` | the page exists and at least one fragment, but not all, occurs; or the anchor's heading is gone | as `vanished`, and the report quotes up to 15 lines of the anchored section as it reads today |
| `holds` | every fragment occurs, in order | re-verified today |

The check needs none of the page in context: it is `grep -F -i` of each normalised fragment in the normalised cached page, with the commands in a `<drift_commands>` block that uses only `curl`, `tr`, `sed` and `grep`, portable between GNU and BSD. This is the same rule the author ran to verify the 30 passages of §2.3; it caught link text (`[Prompting Claude Sonnet 5.5](…)`) that a naive comparison reports as changed.

The drift check never edits a knowledge file. Its lines go to the findings file and the report section "Known traps possibly stale", and a trap that is not `holds` is one of the triggers of the learning loop (§7).

## 5. Size budget per surface

**The limits that apply.**

- **Read.** "When a whole-file read exceeds the token limit, Read returns the first page with a `PARTIAL view` notice" (tools-reference › Read tool behavior); the limit can be changed with `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` (env-vars). Reading today's Sonnet skill returns "showing lines 1-242 of 295 total (25806 tokens, cap 25000)". This limit binds every file a run reads: a knowledge file, a copied skill, a doc page.
- **Skill load.** Loading through the Skill tool is not cut at the Read limit, but after compaction only "the first 5,000 tokens of each" re-attached skill survive, in "a combined budget of 25,000 tokens" (skills › Skill content lifecycle).
- **Bytes per token.** 73,671 bytes measured 25,806 tokens: 2.85 bytes per token for this prose, not the 4 today's `N05` assumes. The budgets below use 3, and so does the cost estimate (`N05`, §6).

**Budgets**, each a hard ceiling in bytes that `check-norms` enforces, with the estimate from today's text (sections measured with `wc -c`):

| Surface | Ceiling | Estimate | Why that ceiling |
|---|---|---|---|
| `transition-audit` | 14 KB (~4,900 tokens) | ~10 KB (~3,500) | survives compaction whole |
| `transition-audit-plan` | 28 KB (~9,800) | ~21 KB (~7,000): today's Stage 1 is 16.9 KB | first 5,000 tokens hold the norms that apply after the gate |
| `transition-audit-discover` | 28 KB | ~17 KB (~5,700) | same |
| `transition-audit-drift` | 14 KB | ~6 KB (~2,000) | survives compaction whole |
| `transition-audit-traps` | 14 KB | ~6 KB (~2,000) | same |
| `transition-audit-report` | 14 KB | ~10 KB (~3,500): today's Stages 3–4 are 7.7 KB | same |
| `transition-audit-apply` | 14 KB | ~9 KB (~3,000) | same |
| each entry point | 4 KB | ~2 KB | loads before anything else |
| each agent | 8 KB | ~4 KB (today 2.7–3.7 KB) | an agent's whole prompt |
| a knowledge file | 57 KB (~19,000) | Sonnet ~45 KB (~15,000): today's table is 26.2 KB, plus ~300 bytes of source per trap and ~4 KB of sections; Opus ~25 KB | under the Read limit with margin |

Where a knowledge file would pass its ceiling, its `hand-off` traps move to `<slug>.api.md`, which the traps stage reads only when the inventory holds Claude API code.

**What a run loads in the session.** A run cancelled at the plan loads the entry, the orchestrator, the plan, and the knowledge file only down to its `<traps>` line, which is all the plan needs: about 13,000 tokens, against 25,800 today. A full run loads every stage and the knowledge file: about 27,000 tokens of skills plus 15,000 of knowledge (Sonnet), about 42,000 against 25,800 today, plus the docs of §3 (about 27,000). The design spends more on instructions and docs in the session; §9 says where it expects to save.

## 6. Where today's norms go

**Ids.** A norm keeps its id when it moves: `audit-sonnet-5-5` `N05` becomes `transition-audit-plan` `N05`. Every new norm in the family is numbered from `N64` up, in each surface, so an id at or below `N63` always means "carried from the per-transition skills", and no id is renumbered or reused. The two old skills and the orchestrator share ids by design, since `audit-opus-5-5` and `audit-sonnet-5-5` already number the same rule the same way (the Sonnet sidecar says each was "Derived in 0.5.0 from" the Opus norm of the same id).

**Histories.** Each carried norm's sidecar entry opens with `Carried in 0.6.0 from audit-opus-5-5 N05 and audit-sonnet-5-5 N05` (qualified citations in the real file) and keeps both old `what` texts and the union of their `refs`. The old skills, now entry points, keep ids `N01`–`N63` as **retired** entries pointing to the new home, and number their own new norm `N64`.

**This needs a checker change.** Today a sidecar entry that matches no norm is an error ("`<id>` matches no norm in `SKILL.md`"), and a qualified citation must name an id the sidecar declares, so the old histories' many citations such as `audit-opus-5-5` `N01` would break the moment those ids leave the surface. `check-norms` gains a `retired` array per sidecar — `{ "id", "movedTo": [qualified citations], "what" }` — whose ids count as declared for citations and may never be defined again in that surface.

**The table.** One row per id; "both" means the id exists in both skills with the same purpose.

| Today | New surface | New id | What changes |
|---|---|---|---|
| `N01` both | plan | `N01` | none |
| `N02` both | plan | `N02` | the list becomes the map of §2.4; the clause that read model-dependent code "only for the rows" P05, P40–P42 (Opus P22, P26–P28) is dropped; request tokens come from `<api_signals>` |
| `N03` both | plan | `N03` | none |
| `N04` both | plan | `N04` | none |
| `N05` both | plan | `N05` | tokens as bytes ÷ 3, from the measured 2.85 (§5) |
| `N06` both | plan | `N06` | none |
| `N07` both | plan | `N07` | tables gain a docs row and the expansion budget (plan `N66`) |
| `N08` both | discover | `N08` | none |
| `N09` both | orchestrator | `N09` | line format v2 (below); findings path `<target>-<date>` unchanged |
| `N10` both | traps | `N10` | "check every batch against each row" becomes "check each trap"; its clause on files pinned to another model moves to discover `N70` |
| `N11` both | discover | `N11` | examples from `<older_residue>` |
| `N12` both | discover | `N12` | none |
| `N13` both | report | `N13` | adds the drift, coverage and outside-the-traps sections |
| `N14` both | apply | `N14` | none |
| `N15` both | report | `N15` | discovery findings appear in the same tables with their `D` id; one line counts traps possibly stale |
| `N16` both | report | `N16` | none |
| `N17` both | report | `N17` | none |
| `N18` both | orchestrator | `N18` | none |
| `N19` both | plan | `N19` | none |
| `N20`, `N21` both | apply | `N20`, `N21` | none |
| `N22` both | apply | `N22` | re-scan against the traps and the digest |
| `N23` both | apply | `N23` | the step itself from `<next_step>` |
| `N24` both | apply | `N24` | none |
| `N25` both | discover | `N25` | target id from the knowledge file |
| `N26`, `N28` both | discover | `N26`, `N28` | none |
| `N27` both | discover | `N27` | keeps the Sonnet clause on the system card |
| `N29` both | report | `N29` | none |
| `N30` both | apply | `N30` | none |
| `N31` both | discover | `N31` | none |
| `N32` both | orchestrator | `N32` | seven stages; title from the knowledge file |
| `N33`, `N34`, `N35` both | orchestrator | same | none |
| `N36` both | plan | `N36` | none |
| `N37` both | plan | `N37` | the traps it serves are those with `context: user-settings` |
| `N38` both | plan | `N38` | none |
| `N39` both | plan | `N39` | the gate shows the doc probe, the docs cost and the offline option |
| `N40` both | discover | `N40` | the brief carries the digest, the map and the classification norms, not the trap table |
| `N41` both | discover | `N41` | none |
| `N42`, `N43`, `N44` both | report | same | none |
| `N45` both | apply | `N45` | adds the learning-loop line (§7) |
| `N46` both | plan | `N46` | "a skill written for the source model" from `source` |
| `N47` both | orchestrator | `N47` | reads the run file first |
| `N48` both | report | `N48` | values from `<settings_proposal>` |
| `N49`, `N50`, `N52` both | orchestrator | same | none |
| `N51` both | plan | `N51` | lexical traps are those with `sweep: yes`; the quick sweep also runs the drift check |
| `N53` both | orchestrator | `N53` | sharding moves to orchestrator `N68` |
| `N54` both | plan | `N54` | adds the docs time |
| `N55` both | orchestrator | `N55` | none |
| `N56`, `N57` both | plan | same | none |
| `N58` both | discover | `N58` | applies to any finding of a missing instruction, not only rows P12–P18 (Opus P09–P12) |
| `N59` both | plan | `N59` | source id from `<source_id_match>`; the clause "read for P05 and P19 only — never checked against another row" is dropped, since discovery reads them openly |
| `N60` both | traps | `N60` | optional = `kind: optional` |
| `N61` Sonnet | discover | `N61` | the list moves to `<protected>` |
| `N62` Sonnet | discover | `N62` | none |
| `N63` both | orchestrator | `N63` | the entry points pass the arguments through; the grammar is unchanged, plus the transition |

No norm is retired without a successor. The clauses dropped inside `N02` and `N59` are the ones that tied reading to rows: they are the closed list #34 wants gone.

**New norms**, numbered from `N64` in each surface:

| Surface | New norms |
|---|---|
| `audit-model-transition` | `N64` read `<source> <target>` (ids or short names) and pass the rest through; `N65` resolve the knowledge file or announce the bootstrap of §2.5; `N66` invoke the orchestrator |
| `audit-opus-5-5`, `audit-sonnet-5-5` | `N64` invoke the orchestrator with the fixed transition and `$ARGUMENTS` |
| `transition-audit` | `N64` the stage order of §1.3 and invoking each stage as the Skill tool lists it; `N65` the run file; `N66` start only from an entry point's `--transition` or from `--resume`; `N67` re-invoke with `--resume` after compaction; `N68` verifier shards; `N69` a findings file in the 0.5.x format is not resumed |
| every stage | `N64` the stage guard of §1.1; `N65` the compaction check of §1.4 |
| plan | `N66` the expansion budget for leads outside the inventory, 25% of the inventory's tokens by default, shown at the gate; `N67` the doc probe of §3 |
| discover | `N66` fetch and cache the docs (§3); `N67` write the change digest; `N68` judge each instruction and construct against the digest, recording a finding only with the passage behind it; `N69` search the whole root for every concrete token the digest names (a setting, a parameter, a model id, a header, a version); `N70` a file pinned to another model gets no finding (from `N10`); `N71` follow a lead outside the inventory within the budget, logging it; `N72` end with the coverage account: areas read, read in part, not read, and why; `N73` read a page over the Read limit by heading |
| drift | `N66` the rule of §4; `N67` write the drift lines; `N68` never edit a knowledge file |
| traps | `N66` for each trap, relabel the discovery line it matches, keeping `(was: Dnn)`; `N67` otherwise look for it: `sweep: yes` by searching its signal, others by reading the files of its area, within the plan's estimate; `N68` correct a discovery line a trap contradicts, as when discovery proposes removing what `<protected>` keeps; `N69` apply a trap whose drift is not `holds` with confidence at most medium and flag it; `N70` a coverage line per trap: fired, checked clean, or not checkable, and why |
| report | `N66` the section "Found outside the known traps" (the `D` lines) and "Known traps possibly stale" |
| apply | `N66`–`N69` the learning loop of §7 |
| `batch-auditor` | `N09` (retires `N02`) judge each file against the digest and the passages in the brief, not a pattern table; `N10` fill the doc field of each line |
| `finding-verifier` | `N11` check that each line's doc passage occurs in the cached page, and discard a `D` line whose passage does not support it; `N12` in a shard, verify only the files the brief assigns |

**Line format v2.** One field is added, so every finding quotes the doc passage behind it, as #34 requires; the agents' contracts already say to use "the line format your brief gives", so neither contract changes.

```text
<file>:<line> | <id> | <status> | "<quoted text>" | <confidence> | <doc> | <note>
```

`<id>` is a trap id of the knowledge file, `P00` for older residue, or `D01`, `D02`, … for a discovery finding no trap names yet. `<doc>` is `<url>#<anchor> "<passage>"`, at most 30 words, or `trap` for a line whose trap's recorded source is the passage.

## 7. The opt-in issue draft

**When.** At the close of a run that audited files (not a cancelled plan), when the final list holds a `D` line with status `change` or `re-test` that the verifier kept, or a drift line other than `holds`, or the run was a bootstrap (§2.5). Never in a headless run: `N18` makes a run headless where "no one can answer", and there is no one to say yes.

**Construction by allow-list, not by redaction.** The draft is assembled only from:

- the transition slug and the plugin version;
- trap ids and drift verdicts from the knowledge file;
- doc URLs and passages, each checked verbatim against the cached page with the rule of §4;
- the area names of §2.4;
- one generic sentence per item, written from the map's vocabulary, such as "a hook script that selects instruction text by matching a model id prefix".

It never holds a file path, file name, line number, quoted project text, identifier, repository or remote name, branch, user name or code block from the audited project.

**Sanitisation check, before showing it.** Build the forbidden set from the run: every path segment and file basename in the inventory (without extension too), the repository directory name, every `git remote -v` URL and its owner and repository, the current branch, `git config user.name` and `user.email`, and every quoted text field of the final list. Search the draft for each, case-insensitively. Any hit: rewrite the draft once and search again; a second hit: do not offer the draft, and say in the close that it could not be written generically. Tokens shorter than four characters and words of the map's vocabulary are exempt, so `hooks` or `CLAUDE` do not block every draft.

**Delivery.** The draft is shown in full in the chat. The repository sets `blank_issues_enabled: false` and uses issue forms, so a prefilled link needs a form: the implementation adds `.github/ISSUE_TEMPLATE/trap_report.yml` with the fields transition, trap or area, where it shows up (generic), doc passage, and plugin version. The link is `https://github.com/inbrace-tech/claude-skills/issues/new?template=trap_report.yml&title=…&<field>=…`, URL-encoded; above about 8,000 characters it drops the passages and says so.

**The consent question**, through `AskUserQuestion` per `N33`, exactly:

> Share this generic report with the public inbrace-tech/claude-skills repository, so the audit can learn it? The draft above holds no path, name or text from this project. Nothing is sent unless you choose to.

| Option | Description |
|---|---|
| Give me a prefilled link (Recommended) | Nothing is sent: the link opens GitHub's issue form with the draft, and you review and submit it yourself. |
| Open the issue now with `gh` | Runs `gh issue create` on the public repository, under your GitHub account. |
| Don't share | Nothing is sent; the draft stays in the report file. |

The recommendation is the link because the person's own submit on GitHub is the last check. The `gh` option is offered only when `gh auth status` succeeds, and it runs only on that explicit choice.

## 8. Migration and versioning

**Changeset.** One `minor` for `inbrace-config`: a new skill and a new argument, and a changed invocation path for two existing commands, which on `0.x` is a `minor` (CONTRIBUTING.md › Which bump). The line:

> One audit for every model transition, `/inbrace-config:audit-model-transition <source> <target>`, reads today's docs, explores freely, then checks known traps; the Opus and Sonnet commands run it.

**What users see.**

- `/inbrace-config:audit-opus-5-5` and `/inbrace-config:audit-sonnet-5-5` keep their names, arguments and `argument-hint`, so every command and headless script keeps working. Their checklist has seven stages instead of five.
- A new command, `/inbrace-config:audit-model-transition <source> <target> [path] [flags]`, with the same flags.
- The first gate adds a docs line: whether the docs are reachable, their cost, and the offline option.
- The report adds "Found outside the known traps" and "Known traps possibly stale"; the close may offer the issue draft.
- The report and findings files keep their names (`<target>-<date>`); a run file is added. A findings file written by 0.5.x is not resumed, and the run says so and starts a new one.
- Seven stage descriptions enter Claude's skill listing while the plugin is enabled (§1.1). The README's "Skills load only what they need" table gains the "Stage" row; its Skills table gains the new command and the stages; "Without the plugin system" copies the seven skill folders with `transitions/` and the two agents.
- Where the `inbrace-config:` prefix is absent (a copied install), the Skill tool asks once per stage.

**Files.** `plugin.json` and the marketplace entry describe the plugin as a transition-agnostic audit; `keywords` gain `model-transition`. `check-norms` gains `retired` entries (§6), the knowledge-file checks (§2.2) and the size ceilings (§5), each as the four-file script shape CONTRIBUTING.md requires. The two old skills' pattern tables and Stage sections leave their `SKILL.md`; their text lives on in the new surfaces and their sidecars, and in git.

**Claude Code version.** Nothing here needs a newer Claude Code than 0.5.x does: `user-invocable`, Skill arguments and `allowed-tools` predate it, so the plugin's floor does not move and the change is not a `major`.

**Order of work.** One pull request per step, each passing every check: (1) `check-norms` learns `retired`, knowledge files and ceilings; (2) the knowledge files, from today's tables, with every passage re-verified by §4; (3) the orchestrator, the stages and the entry points, with the norm moves of §6 and the retired entries; (4) the agents; (5) README, manifest, issue form and changeset.

## 9. How it will be measured

The maintainer measures; this design runs no model-calling evaluation. It states what it expects and what it must not lose, so the measurement can confirm or refute it.

**Expected to improve.**

- **Recall.** On a seeded repository, at least the plain session's 79% of #34's table, with the docs-only reference's 88% as the target: doc-guided open discovery reaches the items no row names (a price table, a guide index, the version floor were outside 0.5.0's table in #34), and the traps stage then adds what discovery missed.
- **Cost in agents mode.** Lower than 0.5.1 at the same scope: each auditor's brief carries a ~4,000-token digest and the classification norms, not the ~9,000-token trap table and every Stage 2 norm, and the docs are fetched once for the run. A run cancelled at the plan costs about half of today's fixed cost (§5).
- **Staleness is visible.** Every trap whose passage changed shows in the report, with the changed text.

**Must not lose.**

- **Precision**: 0.5.0 made no false claim. The guards are a verbatim passage behind every finding, the verifier checking that passage against the cached page, `<protected>`, and today's classification norms, all carried over.
- **High-severity coverage**: every high-severity item 0.5.1 finds. Every trap of 0.5.1 is still applied after discovery, so nothing 0.5.1 checks goes unchecked.

**Expected not to improve.** Session-mode cost: a full run loads about 16,000 more tokens of instructions and about 27,000 tokens of docs than 0.5.1 (§5). The tenfold gap in #34 comes mostly from cache re-reads across agents (today's `N49` records about 10× on a 47-batch run); this design narrows it in agents mode, and does not claim to match a plain session.

**Suggested for the measurement.** Several runs per arm, since one run per arm cannot separate a real gain from run-to-run variance; arms compared at the same scope and run mode; per-stage token counts from `/usage` recorded in the report; two checks that grade without a model: the drift check, by planting a changed passage in a copy of a knowledge file (expected `changed`), and the issue draft, by seeding the repository with distinctive names and searching the draft for them (expected none).

## 10. Where this design departs from #34

1. **Frontmatter cannot keep a stage out of unrelated tasks.** `user-invocable: false` keeps it out of the `/` menu, but its description stays in Claude's listing in every session and Claude can invoke it. The design uses a narrow description plus a run-file guard, and the README must say the plugin now costs about 200 tokens of listing per session.
2. **The orchestrator cannot be `disable-model-invocation: true`.** Claude Code blocks Claude's call to such a skill, so neither the thin entry points nor a resume after compaction could start it. Only the typed commands keep that field.
3. **The size problem is compaction and the token ratio, not only the Read cap.** A skill loaded through the Skill tool is not cut at the Read limit, but after compaction each keeps only its first 5,000 tokens in a shared 25,000, oldest dropped first. And these files run 2.85 bytes per token, so today's bytes ÷ 4 estimates are about 30% low.
4. **Carrying the histories over needs a checker change.** Today's `check-norms` rejects a sidecar entry with no live norm and a citation of an undeclared id, so the retired ids need a `retired` record.
5. **WebFetch cannot serve the drift check**; the docs say it is lossy by design. The design fetches raw Markdown with `curl`.
6. **"The existing verifier, in parallel"** changes its duplicate-merging contract unless shards split by file; the design shards by file, and only above 40 findings.
7. **The learning loop needs an issue form**, since the repository disables blank issues, and `gh issue create` posts publicly under the user's account; the consent question says so.
8. **The acceptance compares unlike arms with one run each.** The plain session had no gates, verifier or apply stage, and the cost gap is mostly agents and cache re-reads, which open discovery does not remove. The design promises recall and agents-mode cost, not a plain session's cost.

## 11. Sources

Fetched on 2026-09-29 as raw Markdown.

- Skills: frontmatter reference, control who invokes a skill, skill content lifecycle, pre-approve tools, pass arguments, available string substitutions, run skills in a subagent, restrict Claude's skill access, override skill visibility from settings, find unused skills — https://code.claude.com/docs/en/skills
- Subagents: preload skills into subagents, what loads at startup, concurrent subagent limit — https://code.claude.com/docs/en/sub-agents
- Plugin agents' supported frontmatter fields — https://code.claude.com/docs/en/plugins/components
- Plugins reference — https://code.claude.com/docs/en/plugins-reference
- Tools reference: the Skill row, Read tool behavior, WebFetch tool behavior — https://code.claude.com/docs/en/tools-reference
- `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` — https://code.claude.com/docs/en/env-vars
- Permissions: `Skill(name)` rules, preapproved documentation domains — https://code.claude.com/docs/en/permissions
- Model configuration, the sections the traps cite — https://code.claude.com/docs/en/model-config
- The transitions' guides, whose passages §2.3 re-verified: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5, https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide, https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5, https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5, https://platform.claude.com/docs/en/models/opus-5-5/migration-guide, https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5, https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
- The documentation index used by the bootstrap of §2.5 — https://platform.claude.com/llms.txt
