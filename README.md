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
/claude-config:audit
```

From a terminal, the same install is:

```bash
claude plugin marketplace add inbrace-tech/claude-skills
claude plugin install claude-config@inbrace
```

## Skills

| Plugin | Skill | What it does |
|---|---|---|
| `claude-config` | `/claude-config:audit` | Audits `CLAUDE.md`, rules, agents, skills and settings for instructions that current Claude models no longer need, and proposes a diff. Each finding cites the official Anthropic prompting guide it comes from. |

## Skills run only when you call them

Installing a plugin does not load its skills into every conversation. Until a skill runs, Claude Code keeps only its name and one-line description in context.

Every skill here also sets `disable-model-invocation: true`, so Claude never starts one on its own. It runs only when you type its slash command.

You choose where a plugin is active when you install it:

- `--scope user` (default): all your projects.
- `--scope project`: this repository, shared with collaborators through `.claude/settings.json`.
- `--scope local`: this repository, only for you.

Turn a plugin off without removing it with `/plugin disable claude-config@inbrace`, and back on with `/plugin enable claude-config@inbrace`. Get new versions with `/plugin marketplace update inbrace`.

## Without the plugin system

Each skill is a plain folder with a `SKILL.md`, following the [Agent Skills](https://agentskills.io) standard. To use one without a plugin, copy its folder:

```bash
# for you, in every project
cp -r plugins/claude-config/skills/audit ~/.claude/skills/claude-config-audit
# for one repository, shared with your team
cp -r plugins/claude-config/skills/audit .claude/skills/claude-config-audit
```

A copied skill does not receive updates. Installing through the marketplace does.

## Security

Skills are instructions that Claude follows on your machine, with your permissions. Read a skill before you install it, from this repository or any other. See [SECURITY.md](SECURITY.md) for how this repository is protected and how to report a problem.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Inbrace
