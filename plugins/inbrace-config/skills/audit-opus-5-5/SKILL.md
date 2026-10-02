---
name: audit-opus-5-5
description: Audit a project's Claude Code setup (CLAUDE.md, rules, agents, skills, settings, hooks, CI and Claude API code) for what changes when moving from Claude Opus 5 to Claude Opus 5.5. Explores the project against what Anthropic's documentation says changed, as recorded and dated in the plugin, checks the known traps, asks before each costly stage with its cost, reports in the chat, and applies only what was approved.
argument-hint: "[path] [--scope full|reduced|quick] [--mode session|agents] [--stop-at-report]"
disable-model-invocation: true
allowed-tools: Skill(inbrace-config:transition-audit)
metadata:
  max-bytes: 4000
---

# Audit a Claude Code setup for the move from Opus 5 to Opus 5.5

This command runs the transition-agnostic audit for Claude Opus 5 → Claude Opus 5.5, the same audit as `/inbrace-config:audit-model-transition opus-5 opus-5-5`.

## Start

- [N64] Invoke `transition-audit` through the Skill tool — `inbrace-config:transition-audit` from the plugin, `transition-audit` when copied — with `--transition opus-5-to-5-5` followed by the arguments below, unchanged, and follow it:

<arguments>

```text
$ARGUMENTS
```

</arguments>

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
