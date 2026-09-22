# Inbrace Claude Skills

Curated Claude Code skills from the team at [Inbrace](https://github.com/inbrace-tech), kept current with each new Claude model.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-d97757)](https://code.claude.com/docs/en/discover-plugins)

## Quickstart

Inside Claude Code:

```text
/plugin marketplace add inbrace-tech/claude-skills
/plugin install claude-config@inbrace
```

Then run a skill by name:

```text
/claude-config:audit-opus-5-5
```

From a terminal, the same install is:

```bash
claude plugin marketplace add inbrace-tech/claude-skills
claude plugin install claude-config@inbrace
```

## Skills

| Plugin | Skill | Mode | What it does |
|---|---|---|---|
| `claude-config` | `/claude-config:audit-opus-5-5` | Command only | Audits `CLAUDE.md`, rules, agents, skills, settings and Claude API code for what changes from Claude Opus 5 to Opus 5.5. Works in context-sized batches, writes a full report, asks what to change, and applies only what you approve. Each pattern cites the official Anthropic guide it comes from. |

## Skills load only what they need

Installing a plugin does not load its skills into every conversation. A skill's full instructions load only when it runs, and each skill declares who may start it:

| Mode | Who starts it | What sits in context before it runs |
|---|---|---|
| Command only | You, by typing its slash command | Nothing |
| Default | You, or Claude when the task matches | Its one-line description |

The Skills table above says which mode each skill uses. One-shot or side-effecting skills, like the audit, are command only.

You choose where a plugin is active when you install it:

- `--scope user` (default): all your projects.
- `--scope project`: this repository, shared with collaborators through `.claude/settings.json`.
- `--scope local`: this repository, only for you.

Turn a plugin off without removing it with `/plugin disable claude-config@inbrace`, and back on with `/plugin enable claude-config@inbrace`. Get new versions with `/plugin marketplace update inbrace`.

## Without the plugin system

Each skill is a plain folder with a `SKILL.md`, following the [Agent Skills](https://agentskills.io) standard, so its core instructions also work in other tools that support the standard. To use one without a plugin, copy its folder:

```bash
# for you, in every project
cp -r plugins/claude-config/skills/audit-opus-5-5 ~/.claude/skills/
# for one repository, shared with your team
cp -r plugins/claude-config/skills/audit-opus-5-5 .claude/skills/
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
