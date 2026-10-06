---
transition: sonnet-5-to-5-5
title: Sonnet 5 → Sonnet 5.5
source: { name: Claude Sonnet 5, id: claude-sonnet-5, alias: sonnet }
target: { name: Claude Sonnet 5.5, id: claude-sonnet-5-5, bedrock: anthropic.claude-sonnet-5-5, alias: sonnet }
claude-code-floor: v2.1.284
verified: 2026-10-06
---

# Sonnet 5 → Sonnet 5.5

What the transition audit knows about moving a Claude Code setup from Claude Sonnet 5 to Claude Sonnet 5.5. The audit's stages read the blocks they name; nothing here is an instruction on its own. An instruction already outdated on Sonnet 5 is older residue, and is reported, not changed.

<docs>

| Role | URL | Read |
|---|---|---|
| target prompting guide | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5 | whole |
| migration guide | https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#migrating-from-claude-sonnet-5 | the anchored section |
| what's new | https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5 | whole |
| source prompting guide | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 | on demand, to recognise text written for the source |
| Claude Code model configuration | https://code.claude.com/docs/en/model-config | sections: model-aliases, version-history, adjust-effort-level, extended-thinking, automatic-model-fallback, sonnet-5-5-and-sonnet-5-context-window |
| system card | https://www-cdn.anthropic.com/870c8f525702625d2c62fc6dd04c857e3250bec1/Claude%20Sonnet%205.5%20System%20Card.pdf | only the pages a trap cites |

</docs>

<source_id_match>

- The source id as a string literal not followed by `-5`: `claude-sonnet-5`.
- The source id used as a prefix or pattern, which `claude-sonnet-5-5` also matches: `startsWith("claude-sonnet-5")`, a trailing `*` as in `claude-sonnet-5*`, a regular expression such as `^claude-sonnet-5`.

</source_id_match>

<api_signals>

Find Claude API code first by what imports the SDK — `@anthropic-ai/sdk`, `import anthropic`, `from anthropic import` — and by any project module that wraps the client, then by `messages.create`, and only then by the request tokens `output_config`, `budget_tokens`, `tool_choice`, `between_tools` and a `thinking` request parameter, never by those tokens alone.

</api_signals>

<older_residue>

Assistant prefill; a non-default `temperature`, `top_p` or `top_k`; `budget_tokens`; forced interim status scaffolding such as "after every 3 tool calls, summarize progress".

</older_residue>

<protected>

Never record a finding for what the Sonnet 5.5 sources keep or recommend:

- a crop, zoom or code tool for images;
- "Think the problem through before you answer", or the Sonnet 5 guide's "Think carefully through the problem before responding";
- the Sonnet 5 guide's prompting techniques — a verbosity instruction, an explicit scope such as "apply this to every section", a tone instruction, a frontend design list, a "report every issue" review prompt — which the Sonnet 5.5 guide calls a reasonable starting point; a statement of how the model behaves that a Sonnet 5.5 source contradicts is P07's to record;
- a Sonnet 5 entry in `fallbackModel` or `ANTHROPIC_DEFAULT_SONNET_MODEL` on Amazon Bedrock, Google Cloud's Agent Platform or Microsoft Foundry, which supplies the model Sonnet 5.5's cyber-flagged requests re-run on.

</protected>

<settings_proposal>

Propose `"model": "claude-sonnet-5-5"` — `anthropic.claude-sonnet-5-5` on Amazon Bedrock — keeping a `[1m]` suffix where the current value carries one, and write no effort level: effort is a re-test (P03). The choice of file, shared or local, is the user's. Cite https://code.claude.com/docs/en/model-config#model-aliases.

</settings_proposal>

<next_step>

Re-run the project's own evals, or a fresh effort sweep from the guide's starting points — `medium` then `high` for agentic coding, `medium` or `low` for chat, `high` otherwise — since Sonnet 5.5's levels are recalibrated and the guide's advice is a starting point the project's own measurements confirm.

</next_step>

<unquoted>

Traps whose matching lines in a project ask the model to reveal its reasoning, which can stop it with a refusal when it reads or quotes them. The plan finds their lines with the pattern below and lists them in `unquoted.md`, and no stage reads or quotes those lines.

- P09 — label: reasoning requested in the reply — pattern (`grep -n -i -E`): `chain[ -]of[ -]thought|(show|include|write( out)?|give|explain|walk( me)? through|lay out|share|reveal|expose|print|output)( all| out)? (your|its)( full| complete| step[ -]by[ -]step| internal| hidden)? (reasoning|thinking|thought process|thoughts)`

</unquoted>

<traps>

### P01 — Project settings run Sonnet 5

- kind: setting
- area: settings
- signal: `model` or `env.ANTHROPIC_MODEL` set to `claude-sonnet-5` or its provider ID, or `env.ANTHROPIC_DEFAULT_SONNET_MODEL` set to Sonnet 5 while `model` is `sonnet`, `sonnet[1m]` or `opusplan`, in the project, local or managed settings
- applies when: a settings file names Sonnet 5 as the session model; resolve aliases as the Claude Code docs do: `sonnet` is Sonnet 5.5 on the Anthropic API, but Sonnet 4.6 on Claude Platform on AWS and Sonnet 4.5 on Amazon Bedrock, Google Cloud's Agent Platform and Microsoft Foundry, which fall outside this transition, and `ANTHROPIC_DEFAULT_SONNET_MODEL`, when set, decides what `sonnet` means; `default` resolves to Opus 5.5, so a project that sets no model gets no finding; record it once per project, on the file that names Sonnet 5; on a provider other than the Anthropic API, `ANTHROPIC_DEFAULT_SONNET_MODEL` left at Sonnet 5 beside a `model` already on Sonnet 5.5 is the fallback the docs describe, not a finding, and a file that says so is the record
- change: Set `"model": "claude-sonnet-5-5"` — `anthropic.claude-sonnet-5-5` on Amazon Bedrock — in the file the user picks per the report stage's settings question, keeping a `[1m]` suffix where the current value carries one, and say in one line that on the Anthropic API Sonnet 5.5 always runs with the 1M window. Where Sonnet 5 comes from `ANTHROPIC_DEFAULT_SONNET_MODEL`, propose removing it on the Anthropic API, and on the other providers keep it and set `model` instead, since there it supplies the model Sonnet 5.5's cyber-flagged requests re-run on. Write no effort level: P03 covers effort. Explain, from the user's settings read as context, what the user's settings do today: in Claude Code, Sonnet 5.5 starts at `medium` unless a level is set for it, and a top-level `effortLevel` in `~/.claude/settings.json` does not count for Opus 5.5 and the models released after it; Sonnet 5.5 requires Claude Code v2.1.284 or later. Type setting. Medium confidence when it comes through `ANTHROPIC_DEFAULT_SONNET_MODEL`.
- confidence: high
- sweep: yes
- context: user-settings
- source: https://code.claude.com/docs/en/model-config#sonnet-5-5-and-sonnet-5-context-window
  passage: "On the Anthropic API, Sonnet 5.5 and Sonnet 5 always run with the 1M context window."
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#enable-fallback-on-bedrock-agent-platform-and-foundry
  passage: "From Sonnet 5.5, cybersecurity-flagged requests re-run on the model you set in `ANTHROPIC_DEFAULT_SONNET_MODEL`"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "except that Opus 5.5 and Sonnet 5.5 default to `medium` … Opus 5.5 and models released after it start at their own default until you choose a level for them"
  verified: 2026-10-06

### P02 — Agent, skill or launch still pinned to Sonnet 5

- kind: change
- area: memory, rules, agents, skills, commands, hooks, ci
- signal: `model: claude-sonnet-5` in an agent's or skill's frontmatter; `claude-sonnet-5` in a launch command or dispatch recipe — a `--model` flag, a `model` argument to an Agent or workflow call, a brief template — which instructs how a session or agent starts even when written as prose
- applies when: instruction files and the code that dispatches agents, unless the project records the pin as deliberate as already decided
- change: Move the pin to `claude-sonnet-5-5` and leave its `effort:` to P03, or record why it stays. Where the pin or launch carries no explicit effort, say in the note that in Claude Code Sonnet 5 starts at `high` and Sonnet 5.5 at `medium`, so the move drops a level for everyone who runs the project; a level the user saved for Sonnet 5.5 in `~/.claude/settings.json` covers only this machine.
- confidence: medium
- sweep: yes
- context: user-settings
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "The model's default effort: `high` on every model that supports effort, except that Opus 5.5 and Sonnet 5.5 default to `medium`"
  verified: 2026-10-06

### P03 — Effort level carried over from Sonnet 5

- kind: re-test
- area: memory, rules, agents, skills, commands, hooks, settings, ci
- signal: an `effort:` in the frontmatter of a file on Sonnet 5.5 whose pin came from Sonnet 5 — the git log shows the `effort:` predates the model change, or the project records no re-derivation of it; a top-level `effortLevel` in the project, local or managed settings, which applies to every model; `CLAUDE_CODE_EFFORT_LEVEL` in a settings `env`; a line in an instruction file that states the effort of a named agent or skill whose own `effort:` draws this finding, such as a row of a model-and-effort routing table
- applies when: files and settings that run Sonnet 5.5, and the memory, rules and command files that restate their effort; a line that names a file with no `effort:`, or one whose effort a recorded eval re-derived, gets no finding; also a pin or launch that moves to Sonnet 5.5 with no explicit effort — a P02 finding without an `effort:` or `--effort` — since Claude Code starts Sonnet 5 at `high` and Sonnet 5.5 at `medium`
- change: Re-run the effort sweep rather than carrying the level over, since the levels are recalibrated and the guide states no direction: start at `medium` for well-specified agentic coding and multistep tool use and move to `high` for harder or longer work, at `medium` or `low` for chat and latency-sensitive work, at `high` otherwise, and keep `xhigh` or `max` only where a quality gain was measured. Say that the Claude API defaults to `high` while Claude Code starts Sonnet 5.5 at `medium`. For a line that mirrors a file's effort, record one finding per line, its note naming the mirrored `file:line`, re-test it together with that file and change both in the same edit. List it under "Re-test only, no edit".
- confidence: medium
- sweep: yes
- context: user-settings
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "Run a fresh sweep against your own evals rather than carrying over the setting you used on Claude Sonnet 5 … Start at `high`, the default on the Claude API"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "A top-level `effortLevel` in project, local, or managed settings, or one passed with `--settings`, applies to every model."
  verified: 2026-10-06

### P04 — Thinking turned off by a setting Sonnet 5.5 ignores

- kind: change
- area: settings
- signal: `MAX_THINKING_TOKENS` set to `0` in a settings `env`, or `alwaysThinkingEnabled: false`
- applies when: settings of a project that runs Sonnet 5.5, unless the project records that the setting still serves another model — a Sonnet 5 fallback, or an agent pinned to a model where it still turns thinking off — which is already decided
- change: Remove the setting, typed remove: it turned thinking off on Sonnet 5 and has no effect on Sonnet 5.5, whose thinking cannot be turned off in Claude Code; where the goal was less thinking, the lever is a lower effort level, which P03 leaves to a re-test. Where the project's settings or agents name another model the setting still affects and no record says it serves that model, name that model in the note.
- confidence: high
- sweep: yes
- source: https://code.claude.com/docs/en/model-config#extended-thinking
  passage: "You can't turn thinking off on Opus 5.5, Sonnet 5.5, or the Fable models … a saved `alwaysThinkingEnabled: false` or `MAX_THINKING_TOKENS=0` has no effect there"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#extended-thinking
  passage: "which turns thinking off on the Anthropic API except on Opus 5.5, Sonnet 5.5, and Fable models"
  verified: 2026-10-06

### P05 — Sonnet 5 prompting delivered to Sonnet 5.5 by prefix

- kind: change
- area: hooks, rules, settings
- signal: any file that maps a model id to instruction text — a hook script, a gate or check script, a rule condition, a setting — by matching the id against a prefix or pattern, such as `claude-sonnet-5*`, `startsWith("claude-sonnet-5")` or `^claude-sonnet-5`, which `claude-sonnet-5-5` also matches; found by the plan's prefix search
- applies when: text written for Sonnet 5 reaches Sonnet 5.5 through the match: the delivery mismatch is the finding, whatever the delivered text says
- change: Where a Sonnet 5.5 counterpart exists under the root or the project records it as planned, propose making the selector match exact ids or the longest prefix, since a first match over a sorted list keeps returning the Sonnet 5 text after the new skill exists, and never propose adding the new skill alone as the fix: that selector edit is a change, typed rewrite, and where the counterpart is only planned its note says that whether Sonnet 5.5 should receive the Sonnet 5 text meanwhile stays a re-test. Otherwise, re-test whether Sonnet 5.5 should receive the delivered text, then match the exact id `claude-sonnet-5`, or record why Sonnet 5.5 keeps it, and list it under "Re-test only, no edit". Name in the note any statement in the delivered text that P07 flags.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#new-model
  basis: inference: `claude-sonnet-5-5` begins with `claude-sonnet-5`, so a prefix or pattern match on the Sonnet 5 id also selects Sonnet 5.5.

### P06 — Sonnet alias in dispatch conventions

- kind: re-test
- area: memory, rules, agents, skills, commands, hooks
- signal: `sonnet` as a model choice in instruction text or dispatch code — `model: sonnet` in frontmatter, a `model: "sonnet"` argument to an Agent or workflow call, a brief template or hook text, or a rule such as "use `sonnet` for bounded work"
- applies when: the project runs Claude Code on the Anthropic API; on Claude Platform on AWS `sonnet` is Sonnet 4.6 and on Amazon Bedrock, Google Cloud's Agent Platform and Microsoft Foundry Sonnet 4.5, outside this transition, unless `ANTHROPIC_DEFAULT_SONNET_MODEL` names Sonnet 5 or 5.5; record it once per dispatch convention, one line naming every file it covers
- change: Re-test. Since Claude Code v2.1.284 `sonnet` resolves to Sonnet 5.5 on the Anthropic API, so these dispatches already run on Sonnet 5.5 with no edit, while explicit `claude-sonnet-5` pins stay on Sonnet 5; a subagent dispatched this way runs at the session's effort unless it sets its own, since a subagent's `effort` defaults to inheriting from the session. Decide deliberately: accept the move and re-test the work it dispatches, or pin `claude-sonnet-5` where the project must stay, and note beside the convention that `sonnet` is Sonnet 4.6 on Claude Platform on AWS and Sonnet 4.5 on Amazon Bedrock, Google Cloud's Agent Platform and Microsoft Foundry. List it under "Re-test only, no edit".
- confidence: high
- sweep: yes
- context: user-settings
- source: https://code.claude.com/docs/en/model-config#version-history
  passage: "`sonnet` resolves to Sonnet 5.5 on the Anthropic API"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
  passage: "Effort level when this subagent is active. Overrides the session effort level. Default: inherits from session."
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#model-aliases
  passage: "The version that the `opus` and `sonnet` aliases resolve to depends on the provider"
  verified: 2026-10-06

### P07 — Sonnet 5 behavior claim a Sonnet 5.5 source contradicts

- kind: re-test
- area: memory, rules, agents, skills, commands
- signal: a statement of how the model behaves, in text Sonnet 5.5 reads or that a pin P02 moves would carry to it, that says (a) at `low` or `medium` effort the model scopes its work to what was asked; (b) `xhigh` is the recommended level for the hardest coding or agentic work; (c) an effort level produces the thinking it did on Sonnet 5; or (d) any other statement of how Sonnet 5 behaves, such as how it scales response length; and (e) a rule whose stated reason cites Sonnet 5 guidance, a Sonnet 5 tier skill or one of its norms, even where the citation still resolves
- applies when: instruction text, not the prompting techniques `<protected>` keeps
- change: Re-test, and re-ground any instruction that rests on the claim, citing the passage that contradicts it, or for (e) re-anchor the reason on the Sonnet 5.5 guide or a reason that names no model, since the session that reads it now runs Sonnet 5.5: (a) "The model tends to add tests, documentation, and small supporting files … It does this at every effort level, and more at higher effort", and "At `low` and `medium`, on long agentic tasks, it's more likely to stop and check in with the user before it finishes"; (b) "Reserve `xhigh` and `max` for work where you've measured a quality gain", and at those levels "it can start its own rounds of review and verification"; (c) "a level doesn't produce the same amount of thinking as the same level on Claude Sonnet 5"; (d) and (e) the migration guide's "re-evaluate model-specific prompt instructions against Prompting Claude Sonnet 5.5". List it under "Re-test only, no edit". Low confidence for (d), which no Sonnet 5.5 passage contradicts.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#steer-initiative-and-scope
  passage: "It does this at every effort level, and more at higher effort … it can start its own rounds of review and verification"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "a level doesn't produce the same amount of thinking as the same level on Claude Sonnet 5 … Reserve `xhigh` and `max` for work where you've measured a quality gain"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#recommended-changes
  passage: "Then re-evaluate model-specific prompt instructions against Prompting Claude Sonnet 5.5."
  verified: 2026-10-06

### P08 — Instructions to think less or not to think

- kind: change
- area: memory, rules, agents, skills, commands
- signal: "respond directly", "thinking adds latency", "only think when", "don't overthink", "do not think", "skip thinking"
- applies when: any instruction file
- change: Remove, and lower the effort level where less thinking is wanted: asking Sonnet 5.5 to think less does not reliably reduce its thinking, and with `between_tools` such instructions make it more likely to write internal XML tags in its visible output.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "Asking it in the system prompt to think less doesn't reliably reduce its thinking."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#running-without-up-front-thinking
  passage: "Such instructions make it more likely that the model writes internal XML tags in its visible output."
  verified: 2026-10-06

### P09 — Reasoning written into the response

- kind: change
- area: memory, rules, agents, skills, commands
- signal: "show your reasoning in the answer", "write out your chain of thought", "include your reasoning in the response"
- applies when: any instruction file; not a request to explain the rationale for a change or a decision
- change: Remove. It invites the `reasoning_extraction` refusal, which server-side fallback does not retry. Read summarized thinking blocks instead.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#safeguard-refusals
  passage: "It doesn't retry `bio`, `reasoning_extraction`, or `general_harms` declines … remove those instructions, because they invite `reasoning_extraction` declines"
  verified: 2026-10-06

### P10 — Updates held until the end

- kind: change
- area: memory, rules, agents, skills, commands
- signal: "hold all findings for the final response", "report only at the end", "no interim updates"
- applies when: prompts of a user-facing agent; never a subagent's return contract
- change: Remove. Sonnet 5.5 writes notes to the user between tool calls, and the guide says to remove older instructions that hold them back.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#user-facing-progress-updates
  passage: "Between tool calls, Claude Sonnet 5.5 writes user-facing notes … remove older instructions such as "hold all findings for the final response""
  verified: 2026-10-06

### P11 — Language that discourages tool use

- kind: change
- area: memory, rules, agents, skills, commands
- signal: "only use tools when strictly necessary", "minimize tool calls", "avoid unnecessary tool calls"
- applies when: chat and knowledge-work prompts; a coding agent gets no finding
- change: Remove. On chat and knowledge work Sonnet 5.5 sometimes answers from its training knowledge when a search would catch details that have changed.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#tool-use-in-chat-and-knowledge-work
  passage: "Claude Sonnet 5.5 sometimes answers from its training knowledge when a web search would catch details that have changed."
  verified: 2026-10-06

### P12 — Search tool without the check-current-facts instruction

- kind: change
- area: agents, skills, commands
- signal: a research, support or knowledge-work agent or skill with a search tool, such as `WebSearch`, and no instruction to check specifics that may have changed
- applies when: chat and knowledge-work prompts with a search tool
- change: Add the guide's paragraph: "Use the search tool to check specifics that may have changed since your training, such as what is allowed, required or charged, even when you feel confident. For researched work such as a report or a comparison, gather current sources rather than writing from your training knowledge."
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#tool-use-in-chat-and-knowledge-work
  passage: "Use the search tool to check specifics that may have changed since your training, such as what is allowed, required or charged, even when you feel confident."
  verified: 2026-10-06

### P13 — No update cadence

- kind: optional
- area: agents, skills, commands, memory
- signal: long human-in-the-loop agentic work with no guidance on updates
- applies when: agent and orchestrator prompts, unless the file points to where the project states its update guidance and that guidance, and the reason it gives, are not written for Sonnet 5; a pointer to Sonnet 5 guidance is P07's
- change: Add a cadence, for example a line on what the model is about to do before its first tool call and a short recap at the end.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#user-facing-progress-updates
  passage: "for example a line on what the model is about to do before its first tool call and a short recap at the end, say so in the system prompt."
  verified: 2026-10-06

### P14 — Agent that may check in before the work is done

- kind: optional
- area: agents, skills, commands
- signal: multipart agentic coding, or multipart background work, at `low` or `medium` effort — an `effort: low` or `effort: medium`, or no `effort:` in Claude Code, where Sonnet 5.5 starts at `medium` — with no instruction to carry the work through
- applies when: agentic coding agents and skills, and subagents with no channel to the user, where a check-in becomes a premature return
- change: Try a higher effort level first; otherwise add the guide's first paragraph, "Keep working until everything the user asked for is done, and only stop to ask when you can't go on without the user or before a risky step.", keeping the project's own rules on risky or irreversible actions. Sessions then run longer and cost more.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#steer-initiative-and-scope
  passage: "On agentic coding tasks at `low` and `medium` effort, the model sometimes checks in before the work is done … sessions at those levels run longer and cost more"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#adjust-effort-level
  passage: "except that Opus 5.5 and Sonnet 5.5 default to `medium`"
  verified: 2026-10-06

### P15 — Unrequested additions in a project that wants minimal changes

- kind: optional
- area: agents, skills, commands, memory, rules
- signal: a coding agent or skill with no instruction limiting changes to the request, or a minimal-diff or scope-fence instruction in a coding agent, a skill, or a memory file and its imports that does not name unrequested tests, docs or files, in a project that states it prefers minimal diffs
- applies when: coding agents and skills, and memory files with their imports, in such a project; a memory file whose own minimal-diff statement omits unrequested tests, docs or files is a finding on that line
- change: Add only the guide's second paragraph: "When the work the user asked for is done and checked, stop and report. Don't add features, tests, files, docs or refactors that weren't asked for. If you think one would help, mention it at the end instead of doing it."
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#steer-initiative-and-scope
  passage: "If you prefer changes limited to what was explicitly requested, add only the second paragraph of that prompt"
  verified: 2026-10-06

### P16 — Self-started review rounds at `xhigh` or `max`

- kind: optional
- area: agents, skills, commands
- signal: `effort: xhigh` or `effort: max` on routine work, or on an orchestrator that can start subagents, with no instruction to stop once the checks pass
- applies when: agent and skill files, unless the project's workflow asks for the review
- change: Run routine work at `high` or below; where that thoroughness is wanted, add the guide's paragraph: "When the work the user asked for is done and its checks pass, stop and report. Don't start extra rounds of review or hardening on your own, and don't launch reviewer sub-agents unless the user asked for a review. If you think a deeper review is worth doing, say so at the end."
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#steer-initiative-and-scope
  passage: "it can start its own rounds of review and verification, sometimes with subagents if your harness provides them … run routine work at `high` or below, where it's rare"
  verified: 2026-10-06

### P17 — Open-ended requests that start building

- kind: optional
- area: skills, commands
- signal: a skill or command that asks for ideas, options or a plan with no instruction to stop there
- applies when: ideation and planning entry points
- change: Add the guide's line: "When the user asks for ideas, options or a plan, give them that and stop. Don't start building or changing anything until they say to go ahead."
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#steer-initiative-and-scope
  passage: "the model can start building a presentation, report, or video when you only wanted ideas"
  verified: 2026-10-06

### P18 — Coding at `low` effort with no verification rule

- kind: optional
- area: agents, skills, commands
- signal: an `effort: low` agent or skill that changes code, with no instruction to run a test, type-check or build before reporting done
- applies when: coding agents and skills at `low` effort; also once per project, where coding agents run on Sonnet 5.5 and a P03 re-test could move one to `low`
- change: Add the guide's verification paragraph, where the project sees changes reported done without a check, and keep any project rule that forbids installing dependencies, which the paragraph otherwise allows; in the once-per-project case, note that the paragraph applies if a re-test moves an agent to `low`. Low confidence for the once-per-project case.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#verification-on-coding-tasks
  passage: "At `low` effort, though, it sometimes reports a change as done without running a check that exercises it."
  verified: 2026-10-06

### P19 — Harness text after every tool result

- kind: change
- area: hooks, settings
- signal: a `PreToolUse` or `PostToolUse` hook that adds a token, budget or tool-call countdown on every call of the tools it matches, or whose script adds other context or a message on every such call
- applies when: interactive sessions, where the user can type mid-turn; hook scripts are found by the plan's prefix search
- change: For a countdown or per-call budget, remove it, typed remove, or where the project needs the limit, make the hook add it only rarely, typed rewrite: the guide says not to add one after tool results in interactive sessions, since Sonnet 5.5 can then treat a genuine user message as a possible prompt injection, and a hook's added context reaches the model beside the tool result. For other context added on every call, re-test instead: the guide names per-step harness text among the causes and says to send it less often where the misread shows; list it under "Re-test only, no edit".
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#mid-turn-user-messages-and-task-budgets
  passage: "A token countdown that your harness adds after every tool result can cause this … having your harness add instructions or context after the tool results on every step"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#mid-turn-user-messages-and-task-budgets
  passage: "If you see this reaction to a reminder of your own, send the reminder less often. … In interactive sessions where users can type mid-turn, don't add your own token or budget countdown after tool results."
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/hooks#posttooluse-decision-control
  passage: "String added to Claude's context alongside the tool result."
  verified: 2026-10-06

### P20 — Blanket authorization

- kind: optional
- area: agents, skills, commands
- signal: "you are authorized", "this task is your authorization", "assume permission"
- applies when: agents that act on external systems
- change: Scope the authorization to named targets, and keep a confirmation step for actions on third-party or production systems. The System Card shows Sonnet 5.5 treating a task card as sufficient authorization in an automated capture-the-flag exercise (Claude Sonnet 5.5 System Card, p.60–61, §6.2.1).
- confidence: low
- sweep: yes
- source: https://www-cdn.anthropic.com/870c8f525702625d2c62fc6dd04c857e3250bec1/Claude%20Sonnet%205.5%20System%20Card.pdf
  basis: system-card p.60–61 §6.2.1

### P21 — Faults left in replayed history

- kind: optional
- area: api-code
- signal: code that splices synthetic assistant turns, or replays earlier turns with stray tokens or tool noise
- applies when: API code and harnesses that build or replay history
- change: Hand off per the API hand-off rule, and keep replayed turns clean: in the System Card's evaluation Sonnet 5.5 copied faults inserted into its earlier turns in 62% of sessions, against 22% to 35% for the other models tested (p.97–98, §7.2.3).
- confidence: low
- sweep: no
- source: https://www-cdn.anthropic.com/870c8f525702625d2c62fc6dd04c857e3250bec1/Claude%20Sonnet%205.5%20System%20Card.pdf
  basis: system-card p.97–98 §7.2.3

### P22 — Thinking disabled, or `between_tools` where it fails

- kind: hand-off
- area: api-code
- signal: `thinking: {type: "disabled"}`; `between_tools` with effort `xhigh` or `max`, with `display`, `budget_tokens` or `block_binding`, or with a per-message effort that differs from the level in effect
- applies when: API code
- change: Hand off per the API hand-off rule. `disabled` returns a 400 on Sonnet 5.5: send `between_tools`, the lowest thinking setting, at `high` effort or below, and adaptive thinking at `xhigh` or `max`; each listed `between_tools` combination returns a 400.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#turn-off-up-front-thinking
  passage: "a request that sends `thinking: {"type": "disabled"}` returns a 400 … At `xhigh` or `max` effort, a request with `between_tools` returns a 400 error."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#turn-off-up-front-thinking
  passage: "`between_tools` takes no other field: `display`, `budget_tokens`, or `block_binding` sent with it returns a 400 error."
  verified: 2026-10-06

### P23 — Forced tool use

- kind: hand-off
- area: api-code
- signal: `tool_choice` of type `any` or `tool`; structured outputs or `strict: true` in Amazon Bedrock code
- applies when: API code, token-counting calls included
- change: Hand off per the API hand-off rule. Forced tool use returns a 400; the fix is `auto` with `strict: true` and a prompt line saying when to call the tool, or structured outputs; on Amazon Bedrock, where structured outputs and strict tool use are not available for Sonnet 5.5, send `auto` without `strict` and validate the tool input in code.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#forced-tool-use
  passage: "Claude Sonnet 5.5 rejects both with a 400 error, including on the token counting endpoint … On Amazon Bedrock, structured outputs, which include strict tool use, aren't available for Claude Sonnet 5.5."
  verified: 2026-10-06

### P24 — History edited between requests

- kind: hand-off
- area: api-code
- signal: code that rewrites `system`, `tools` or earlier messages mid-session, adds a tool partway through, or inserts a reminder and later deletes it
- applies when: API code that builds `messages` itself
- change: Hand off per the API hand-off rule. Keep history append-only and change instructions or tools with mid-conversation system messages: each Sonnet 5.5 thinking block is signed over the conversation before it, and for accounts created on or after 2026-08-31 an edit before it returns a 400.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#thinking-blocks
  passage: "Each Claude Sonnet 5.5 thinking block is also signed over the conversation before it … Keep conversations append-only, and change instructions or tools with mid-conversation system messages"
  verified: 2026-10-06

### P25 — Model switched mid-conversation

- kind: hand-off
- area: api-code
- signal: code that sends one `messages` history to Sonnet 5.5 and to another model
- applies when: API routers and cascades
- change: Hand off per the API hand-off rule. Sonnet 5.5 does not read thinking blocks from Opus 5, Opus 5.5, Fable or Mythos models, and only Opus 5.5, on the Claude API and Google Cloud, reads Sonnet 5.5's, so on any other switch the reasoning is dropped silently.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#thinking-blocks-are-tied-to-the-model-that-produced-them
  passage: "but not from Claude Opus 5, Claude Opus 5.5, or any Claude Fable or Claude Mythos model … Claude Opus 5.5 reads Claude Sonnet 5.5 thinking blocks; no other model does."
  verified: 2026-10-06

### P26 — Silent agentic turns

- kind: hand-off
- area: api-code
- signal: a client or harness that renders only `text` blocks
- applies when: API code, custom harnesses
- change: Hand off per the API hand-off rule. Set `thinking.display: "updates"`, or use `between_tools`, which returns the notes without `display`: on Sonnet 5.5 notes longer than a sentence or two between tool calls arrive as thinking blocks, empty by default.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#text-between-tool-calls
  passage: "come back as progress-update `thinking` blocks, empty at the default `display` … With `between_tools`, the text comes back without `display`."
  verified: 2026-10-06

### P27 — User text placed with tool results

- kind: hand-off
- area: api-code
- signal: user input inside a `tool_result` block, a harness notice in the same block as the user's words, or a token or budget countdown after tool results in an interactive session
- applies when: API code and custom harnesses
- change: Hand off per the API hand-off rule. Deliver mid-turn user input as a text block after the last `tool_result`, keep notices in a separate mid-conversation system message, and drop the countdown, or Sonnet 5.5 can treat the user's message as a prompt injection.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#mid-turn-user-messages-and-task-budgets
  passage: "Sometimes it treats a genuine user message as a possible injection. … Never put user text inside a `tool_result` block."
  verified: 2026-10-06

### P28 — Old computer-use tool

- kind: hand-off
- area: api-code
- signal: `computer_20251124`, `computer_20250124`, or the `fine-grained-tool-streaming-2025-05-14` header beside a toolset
- applies when: API code on the Claude API or Google Cloud; `computer_20250124` on any platform
- change: Hand off per the API hand-off rule. There the old tools return a 400 and the fix is `computer_toolset_20260801`, with `eager_input_streaming: true` per tool in place of the header; on Amazon Bedrock `computer_20251124` still works, so record no finding for it in Bedrock-only code. Record a second line on the agent loop that runs the tool's calls — where it reads the action from `input.action`, handles only the first `tool_use` block, or returns results without `toolset_name` — since the toolset changes the loop as well as the declaration.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#computer-use-toolset
  passage: "`computer_20251124` returns a 400 error … Claude Sonnet 5.5 doesn't accept `computer_20250124` on any platform"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#computer-use-toolset
  passage: "Set `eager_input_streaming: true` on each tool that needs it instead."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#computer-20251124-is-not-supported
  passage: "On Amazon Bedrock, Claude Sonnet 5.5 accepts the earlier `computer_20251124` tool."
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#computer-20251124-is-not-supported
  passage: "Drop the beta header, replace the `tools` entry with `{"type": "computer_toolset_20260801"}`, and update your agent loop for member `tool_use` blocks, batch actions, and `toolset_name` on results."
  verified: 2026-10-06

### P29 — Advisor the executor rejects

- kind: hand-off
- area: api-code
- signal: an advisor tool whose advisor is Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 5 or Sonnet 4.6 with a Sonnet 5.5 executor, or code that reads the advice text
- applies when: API code
- change: Hand off per the API hand-off rule. Those advisors return a 400; pair Sonnet 5.5 with Opus 5, Opus 5.5, Sonnet 5.5, Fable 5, Fable 5.1, Mythos 5 or Mythos 5.1, whose advice arrives encrypted.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#advisor-tool
  passage: "Claude Opus 4.8, Claude Opus 4.7, Claude Opus 4.6, Claude Sonnet 5, and Claude Sonnet 4.6 advisors return a 400 error."
  verified: 2026-10-06

### P30 — Refusals not handled

- kind: hand-off
- area: api-code
- signal: code with no branch for `stop_reason: "refusal"`
- applies when: API code
- change: Hand off per the API hand-off rule. Sonnet 5.5 declines in more categories than Sonnet 5 — `cyber`, `bio`, `frontier_llm`, `reasoning_extraction`, `general_harms` — and server-side fallback retries only `cyber` and `frontier_llm`, on Sonnet 5.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#safety-classifiers-and-fallback
  passage: "Claude Sonnet 5.5 declines in more categories than Claude Sonnet 5 … retries `"cyber"` and `"frontier_llm"` declines on Claude Sonnet 5"
  verified: 2026-10-06

### P31 — JSON answers that skip the working-out

- kind: hand-off
- area: api-code
- signal: structured outputs at `low` or `medium` effort on tasks that need a few steps; `between_tools` on requests without tools; a parser that takes the whole text or the span from the first `{` to the last `}`
- applies when: API code asking for JSON on reasoning tasks
- change: Hand off per the API hand-off rule. Use adaptive thinking with "Think the problem through before you answer." at the end of the system prompt, or `xhigh`; treat `stop_reason: "max_tokens"` as failed even with valid JSON; without structured outputs, parse the last JSON value in the `text` blocks and retry once.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#reasoning-tasks-with-json-output
  passage: "Treat any response whose `stop_reason` is `"max_tokens"` as failed, even if its text holds valid JSON, and retry. … Don't take everything from the first `{` to the last `}`."
  verified: 2026-10-06

### P32 — `max_tokens` sized without thinking

- kind: hand-off
- area: api-code
- signal: a small `max_tokens` in agentic or coding request code, or no streaming there
- applies when: API code
- change: Hand off per the API hand-off rule. Thinking counts toward `max_tokens`; for agentic coding the guide sets 128,000 and streams the response.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "Thinking counts toward `max_tokens` even when thinking content isn't returned to you. … For agentic coding, set `max_tokens` to 128,000, the model's maximum, and stream the response."
  verified: 2026-10-06

### P33 — Tool dispatch that fails on a near-miss name

- kind: hand-off
- area: api-code
- signal: a tool map that throws or ends the loop on a name that differs in letter case or a parameter under a slightly different name
- applies when: custom API harnesses
- change: Hand off per the API hand-off rule. Accept an unambiguous case-insensitive match, or return a `tool_result` with `is_error: true` naming the exact expected name.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#tolerant-tool-call-handling
  passage: "Claude Sonnet 5.5 occasionally calls a declared tool by a name that differs only in letter case … Return a `tool_result` with `is_error: true` that states the exact expected name."
  verified: 2026-10-06

### P34 — Dense images with no image tools

- kind: hand-off
- area: api-code
- signal: charts or technical drawings sent with no crop, zoom or code tool
- applies when: vision workloads in API code
- change: Hand off per the API hand-off rule. Give Sonnet 5.5 a crop, zoom or code tool: on charts it helps at every effort level, on technical drawings from `high` up.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#tools-for-complex-visual-inputs
  passage: "On charts, the tools help at every effort level … they help only from `high` effort up"
  verified: 2026-10-06

### P35 — Effort changed between requests

- kind: hand-off
- area: api-code
- signal: code that sets a different top-level `output_config.effort` from one request of a conversation to the next
- applies when: API code
- change: Hand off per the API hand-off rule. It invalidates the prompt cache; use the per-message effort change (beta) with adaptive thinking.
- confidence: high
- sweep: yes
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#calibrate-effort
  passage: "Changing the top-level `effort` value between requests invalidates the prompt cache."
  verified: 2026-10-06

### P36 — Caching gated at 1,024 tokens

- kind: hand-off
- area: api-code
- signal: code that adds `cache_control` only above 1,024 tokens
- applies when: API code
- change: Hand off per the API hand-off rule. Sonnet 5.5's minimum cacheable prompt is 512 tokens.
- confidence: medium
- sweep: yes
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#other-changes-from-claude-sonnet-5
  passage: "The minimum cacheable prompt is 512 tokens, down from 1,024 on Claude Sonnet 5"
  verified: 2026-10-06

### P37 — Sonnet 5 skill preloaded into an agent moving to Sonnet 5.5

- kind: re-test
- area: agents
- signal: a `skills:` entry naming a skill written for Sonnet 5 — its name or title names Sonnet 5 — in an agent with a P02 finding
- applies when: agent files
- change: Re-test: re-derive a Sonnet 5.5 counterpart from the Sonnet 5.5 guide and point the `skills:` line at it, since the migration guide says to re-evaluate model-specific prompt instructions against Prompting Claude Sonnet 5.5; where a prefix match selects that skill, P05 applies too. List it under "Re-test only, no edit".
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#recommended-changes
  passage: "Then re-evaluate model-specific prompt instructions against Prompting Claude Sonnet 5.5."
  verified: 2026-10-06

### P38 — No Claude Code version floor for Sonnet 5.5

- kind: change
- area: setup, memory
- signal: a P01, P02 or P06 finding, and no memory file, README or setup script under the root that states the Claude Code version the project needs
- applies when: the project, once, on the file where it describes its setup, or its root `CLAUDE.md`
- change: Add a line stating Claude Code v2.1.284 or later, since Sonnet 5.5 requires Claude Code v2.1.284 or later.
- confidence: medium
- sweep: no
- source: https://code.claude.com/docs/en/model-config#model-aliases
  passage: "Sonnet 5.5 requires Claude Code v2.1.284 or later"
  verified: 2026-10-06

### P39 — Content-based fallback left unaccounted for

- kind: re-test
- area: model-dependent, memory, skills
- signal: the project runs or moves to Sonnet 5.5
- applies when: the project, once, on the file that holds its model notes or its Sonnet tier skill, or else on the first pin finding
- change: Re-test: in Claude Code cyber-flagged Sonnet 5.5 requests re-run on Sonnet 5 and biology-flagged ones end with a refusal, and the session continues on the fallback model; decide whether the project keeps guidance for that model available and whether its measurements tell the models apart. List it under "Re-test only, no edit".
- confidence: medium
- sweep: no
- source: https://code.claude.com/docs/en/model-config#automatic-model-fallback
  passage: "Sonnet 5.5: cybersecurity-flagged requests re-run on Sonnet 5 … After a fallback, the session continues on the fallback model."
  verified: 2026-10-06

### P40 — Price table without a Sonnet 5.5 entry

- kind: change
- area: model-dependent
- signal: a per-model price table or rate lookup naming `claude-sonnet-5` with no `claude-sonnet-5-5` entry
- applies when: model-dependent code and docs
- change: Add an explicit `claude-sonnet-5-5` entry at Sonnet 5's prices, since "Claude Sonnet 5.5 has the same prices as Claude Sonnet 5, including prompt caching and batch processing rates"; a lookup that falls back to the `claude-sonnet-5` stem is right today only by that coincidence.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5#pricing
  passage: "Claude Sonnet 5.5 has the same prices as Claude Sonnet 5, including prompt caching and batch processing rates"
  verified: 2026-10-06

### P41 — Model docs that miss the Sonnet 5.5 guide

- kind: change
- area: model-dependent, memory, rules
- signal: a prompting-guide index or per-model notes under the root that list the Sonnet 5 guide and not the Sonnet 5.5 guide, or that state Sonnet 5 behavior a Sonnet 5.5 source contradicts, such as running "with thinking disabled"
- applies when: model-dependent code and docs, and model notes in memory and rules files — a paragraph naming the model the project runs, its effort or its thinking setting
- change: Add the Sonnet 5.5 guide as a source and re-evaluate the model-specific statements against it, as the migration guide says; thinking cannot be turned off on Sonnet 5.5 in Claude Code.
- confidence: medium
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#recommended-changes
  passage: "Then re-evaluate model-specific prompt instructions against Prompting Claude Sonnet 5.5."
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/model-config#extended-thinking
  passage: "You can't turn thinking off on Opus 5.5, Sonnet 5.5, or the Fable models."
  verified: 2026-10-06

### P42 — Transcript or output parser that reads only text blocks

- kind: re-test
- area: model-dependent
- signal: code outside the Claude API calls that reads model output or a session transcript and keeps only `text` blocks
- applies when: model-dependent code and docs
- change: Re-test with a response that holds progress-update `thinking` blocks: on Sonnet 5.5, notes the model writes between tool calls come back as `thinking` blocks, empty at the default `display`. List it under "Re-test only, no edit".
- confidence: low
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#text-between-tool-calls
  passage: "notes longer than a sentence or two that the model writes between tool calls come back as progress-update `thinking` blocks, empty at the default `display`"
  verified: 2026-10-06
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#text-between-tool-calls
  basis: inference: how Claude Code records those blocks in a session transcript is not documented.

### P43 — Message sent to an agent while it works

- kind: re-test
- area: memory, rules, agents, skills, commands
- signal: an instruction to message an agent or teammate while it is still working — a `SendMessage` to a running subagent or teammate, a rule to steer or redirect a background agent mid-task, a lead that forwards the user's words to a teammate partway through its turn
- applies when: the agent that receives the message runs on Sonnet 5.5; not a message to an agent that has finished, which resumes it on a new turn
- change: Re-test: Sonnet 5.5 can treat a genuine message that arrives while it is partway through a multistep turn as a possible prompt injection, and ignore it or ask for confirmation. Where the flow allows it, send the message once the agent has finished, which resumes it, and keep messages to a working agent rare. List it under "Re-test only, no edit".
- confidence: low
- sweep: no
- source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#mid-turn-user-messages-and-task-budgets
  passage: "Sometimes it treats a genuine user message as a possible injection. … So can letting users send messages while the model is partway through a multistep turn"
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/sub-agents#resume-subagents
  passage: "When Claude sends a completed subagent a message with the `SendMessage` tool, the subagent resumes in the background without a new `Agent` invocation."
  verified: 2026-10-06
- source: https://code.claude.com/docs/en/agent-teams#context-and-communication
  basis: inference: where Claude Code places a message that reaches a working agent, relative to its tool results, is not documented; the page says only that messages between teammates are delivered automatically.

### P44 — Source model id held in Claude API code

- kind: hand-off
- area: api-code
- signal: the id `claude-sonnet-5`, or its provider form such as `anthropic.claude-sonnet-5` on Amazon Bedrock, held as a constant, default or configuration value in the module that wraps the SDK client or builds its requests
- applies when: Claude API code, unless the project records the id as deliberate as already decided; a price table is P40's, a setting P01's, and an instruction file or launch P02's
- change: Hand off per the API hand-off rule. The migration replaces the id with `claude-sonnet-5-5`, which has no date suffix, and on other platforms with the id the what's-new page lists under Availability, `anthropic.claude-sonnet-5-5` on Amazon Bedrock.
- confidence: high
- sweep: no
- source: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide#migrating-from-claude-sonnet-5
  passage: "Replace your model ID with `claude-sonnet-5-5`, which has no date suffix. On other platforms, use the ID listed under"
  verified: 2026-10-06

</traps>
