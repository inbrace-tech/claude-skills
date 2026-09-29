---
name: audit-model-transition
description: Audit a project's Claude Code setup (CLAUDE.md, rules, agents, skills, settings, hooks, CI and Claude API code) for what changes when moving from one Claude model to another. Reads today's Anthropic docs, explores the project, checks the transition's known traps, asks before each costly stage with its estimated cost, reports in the chat, and applies only what was approved.
argument-hint: "<source> <target> [path] [--scope full|reduced|quick] [--mode session|agents] [--stop-at-report]"
disable-model-invocation: true
allowed-tools: Skill(inbrace-config:transition-audit)
metadata:
  max-bytes: 4000
---

# Audit a Claude Code setup for a model transition

## Start

- [N01] Read the first two tokens of the arguments below as the source and target models, each as an id such as `claude-sonnet-5` or a short name such as `sonnet-5`, and keep the rest, unchanged, for the audit; with fewer than two, stop and show the `argument-hint` usage.

<arguments>

```text
$ARGUMENTS
```

</arguments>

- [N02] Form the transition's slug by removing `claude-` from both models and writing `<source>-to-<target>`, dropping the target's family when both share it — `sonnet-5` and `sonnet-5-5` give `sonnet-5-to-5-5` — and say in one line whether `${CLAUDE_SKILL_DIR}/../transition-audit/transitions/<slug>.md` exists, and when it does not, that the audit will run on the docs alone, with no known traps.
- [N03] Invoke `transition-audit` through the Skill tool — `inbrace-config:transition-audit` from the plugin, `transition-audit` when copied — with `--transition <slug>` followed by the rest of the arguments, and follow it.

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
