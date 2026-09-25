# Inbrace Claude Skills

Curated Claude Code skills from the team at [Inbrace](https://github.com/inbrace-tech), kept current with each new Claude model.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-d97757)](https://code.claude.com/docs/en/discover-plugins)

## Quickstart

Inside Claude Code, from your project root:

1. Add the marketplace, once:

   ```text
   /plugin marketplace add inbrace-tech/claude-skills
   ```

2. Install a plugin, for example `inbrace-config`:

   ```text
   /plugin install inbrace-config@inbrace
   ```

3. Run one of its skills by typing its command:

   ```text
   /inbrace-config:audit-opus-5-5
   ```

Every plugin and its skills are listed in [Skills](#skills) below. A skill starts only when you type its command. For scopes, updates and removal, see [Install, step by step](#install-step-by-step).

## Skills

| Plugin | Skill | Mode | What it does |
|---|---|---|---|
| `inbrace-config` | `/inbrace-config:audit-opus-5-5` | Command only | Audits `CLAUDE.md`, rules, agents, skills, settings and Claude API code for what changes from Claude Opus 5 to Opus 5.5. Shows its plan and estimated token cost and asks before reading anything, asks again before each later costly stage, explains the findings in the chat with a short numbered table of changes, asks what to apply with a recommendation, and applies only what you approve. Each pattern cites the official Anthropic guide it comes from. |

## Install, step by step

New to plugins? These steps take you from nothing to a running audit. Every command is checked against [Install and manage plugins](https://code.claude.com/docs/en/plugins/install).

### 1. Install inside Claude Code

Start `claude` in any project, then add this marketplace and install the plugin:

```text
/plugin marketplace add inbrace-tech/claude-skills
/plugin install inbrace-config@inbrace
```

The install command opens a panel with the plugin's details, where you pick a scope (step 3). On Claude Code v2.1.275 or later, one command does both:

```text
/plugin install inbrace-config --marketplace inbrace-tech/claude-skills
```

### 2. Or install from your terminal

```bash
claude plugin marketplace add inbrace-tech/claude-skills
claude plugin install inbrace-config@inbrace --scope user
```

`--scope` takes `user`, `project` or `local`, and defaults to `user`.

### 3. Pick a scope

| Scope | Who gets the plugin | Recorded in |
|---|---|---|
| `user` (default) | You, in all your projects | `~/.claude/settings.json` |
| `project` | Everyone working in this repository | `.claude/settings.json`, which you commit |
| `local` | You, in this repository only | `.claude/settings.local.json` |

For the audit, `user` is the right choice: you run it once in a while, in whichever project you are auditing.

### 4. Run the audit

```text
/inbrace-config:audit-opus-5-5 [path]
```

Without a path it audits the current project. It starts only from this typed command: asking for an audit in plain words does not start it.

### 5. Check the install

Run `claude plugin list` in your terminal, or open the **Installed** tab in `/plugin`.

### 6. Update

Third-party marketplaces do not update on their own. Run `/plugin marketplace update inbrace`, or turn on auto-update for `inbrace` in the **Marketplaces** tab of `/plugin`.

### 7. Turn off or remove

```text
/plugin disable inbrace-config@inbrace
/plugin enable inbrace-config@inbrace
```

```bash
claude plugin uninstall inbrace-config@inbrace
claude plugin marketplace remove inbrace
```

Removing the marketplace also uninstalls every plugin you installed from it.

### 8. For contributors

Test a branch, or a local copy for one session:

```bash
claude plugin marketplace add inbrace-tech/claude-skills#<branch>
claude --plugin-dir ./plugins/inbrace-config
```

## How this relates to Anthropic's `claude-api` skill

Claude Code ships Anthropic's [`claude-api` skill](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill), and the two cover different ground:

| Use | For |
|---|---|
| `/claude-api migrate <scope> to claude-opus-5-5` | Code that calls the Claude API: model IDs, request parameters that now return errors, SDK syntax in each language |
| `/claude-api prompt-audit` | Dated prompt patterns across model generations, independent of one transition |
| `/inbrace-config:audit-opus-5-5` | What Claude Code reads as instructions (`CLAUDE.md`, rules, agents, skills, settings), checked against the Opus 5 → 5.5 guide |

The audit never edits API code. It lists what it finds there and gives you the `/claude-api migrate` command to run, and it points to `/claude-api prompt-audit` for instructions older than Opus 5.

## Skills load only what they need

Installing a plugin does not load its skills into every conversation. A skill's full instructions load only when it runs, and each skill declares who may start it:

| Mode | Who starts it | What sits in context before it runs |
|---|---|---|
| Command only | You, by typing its slash command | Nothing |
| Default | You, or Claude when the task matches | Its one-line description |

The Skills table above says which mode each skill uses. One-shot or side-effecting skills, like the audit, are command only.

## Without the plugin system

Each skill is a plain folder with a `SKILL.md`, following the [Agent Skills](https://agentskills.io) standard, so its core instructions also work in other tools that support the standard. To use one without a plugin, copy its folder:

```bash
# for you, in every project
cp -r plugins/inbrace-config/skills/audit-opus-5-5 ~/.claude/skills/
# for one repository, shared with your team
cp -r plugins/inbrace-config/skills/audit-opus-5-5 .claude/skills/
```

A copied skill does not receive updates. Installing through the marketplace does.

## How the skills are written

Each rule in a skill is one imperative sentence with a stable id, like `[N07]`. Beside every `SKILL.md`, a `SKILL.norms.json` records why each rule exists and the source behind it. Claude never loads that file on its own, so the history costs no context. CI checks that the two files list the same rules.

## Security

Skills are instructions that Claude follows on your machine, with your permissions. Read a skill before you install it, from this repository or any other. See [SECURITY.md](SECURITY.md) for how this repository is protected and how to report a problem.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Inbrace
