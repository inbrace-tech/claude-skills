---
name: audit-haiku-5-5
description: Audit a project's Claude Code setup (CLAUDE.md, rules, agents, skills, settings, hooks, CI and Claude API code) for what changes when moving from Claude Haiku 4.5 to Claude Haiku 5.5. Explores the project against what Anthropic's documentation says changed, as recorded and dated in the plugin, checks the known traps, asks before each costly stage with its cost, reports in the chat, and applies only what was approved.
argument-hint: "[path] [--scope full|reduced|quick] [--mode session|agents] [--stop-at-report]"
disable-model-invocation: true
allowed-tools: Skill(inbrace-config:transition-audit)
metadata:
  max-bytes: 4000
---

# Audit a Claude Code setup for the move from Haiku 4.5 to Haiku 5.5

This command runs the transition-agnostic audit for Claude Haiku 4.5 → Claude Haiku 5.5, the same audit as `/inbrace-config:audit-model-transition haiku-4-5 haiku-5-5`. There is no Claude Haiku 5: Haiku 5.5 succeeds Haiku 4.5.

## Start

- [N01] Invoke `transition-audit` through the Skill tool — `inbrace-config:transition-audit` from the plugin, `transition-audit` when copied — with `--transition haiku-4-5-to-5-5` followed by the arguments below, unchanged, and follow it:

<arguments>

```text
$ARGUMENTS
```

</arguments>

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
