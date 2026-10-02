# Inbrace Config

Inbrace's tools for keeping the configuration of a Claude Code setup current: what Claude Code reads as instructions — `CLAUDE.md`, rules, agents, skills, settings and hooks — and the project's model-dependent code, CI and docs.

Today it ships one tool, the **model-transition audit**, for a move from one Claude model to another. The audit reads today's Anthropic documentation for the transition, explores the project, checks the transition's known traps, reports what it would change and why, and applies only what you approve. Its known traps cover two transitions, Claude Opus 5 → Opus 5.5 and Claude Sonnet 5 → Sonnet 5.5; any other pair of models runs on the documentation alone.

## Requirements

- Claude Code. The audit runs from typed commands, uses `Bash` and can start agents, so it is built for Claude Code and not for chat.
- Network access to `platform.claude.com` and `code.claude.com`. Without it, the plan says so and offers to run on the passages the audit recorded, marked as not re-verified.

## Use it

Each command starts only when you type it. Three examples:

```text
/inbrace-config:audit-opus-5-5
/inbrace-config:audit-sonnet-5-5 --scope full --mode agents --stop-at-report
/inbrace-config:audit-model-transition sonnet-5 sonnet-5-5 path/to/project
```

1. The first audits the current project for Claude Opus 5 → Opus 5.5.
2. The second audits it for Claude Sonnet 5 → Sonnet 5.5, answers the plan's questions in advance and ends at the report, changing nothing.
3. The third names the two models itself and audits another folder.

The audit lists and measures the files first, shows a plan with its estimated cost in tokens and dollars, and asks before it reads any file. It asks again before each later costly stage and before applying anything. The repository's [README](https://github.com/inbrace-tech/claude-skills#readme) documents every argument, the install scopes and updates.

## What it runs, fetches and sends

- **Reads** the files of the project you audit, inside your Claude Code session. Nothing from them is sent to Inbrace: the plugin has no server of its own and collects no data.
- **Fetches** Anthropic's public documentation pages for the transition from `platform.claude.com` and `code.claude.com`, with `curl`, as plain text. The Sonnet transition also cites a system card hosted on `www-cdn.anthropic.com`. The pages are evidence the audit quotes beside each finding; they are never executed and never used as instructions.
- **Writes** its working files to `.model-audits/<target>-<date>/` in the audited project, with a `.gitignore` that keeps the folder out of `git status`. It edits project files only after you approve each change.
- **Sends** one thing, and only if you choose to: when a run learns something the audit does not know yet, it offers to draft a generic issue for this repository, with no path, name, code or text from your project. It shows you the draft first, then gives you a link to open yourself or, if you confirm again, posts it with `gh issue create` under your own GitHub account.

It ships no hooks, no MCP servers and no executables. Its two agents, `batch-auditor` and `finding-verifier`, can only read files and return text. The `evals/` folder holds the plugin's regression suite and its sample projects; nothing in it runs when you use the plugin.

## Troubleshooting

- **The command is not in the `/` menu.** Run `claude plugin list` to check the plugin is installed and enabled, then `/reload-plugins`.
- **Asking for an audit in plain words does nothing.** That is by design: only the typed command starts it.
- **The plan says the docs cannot be reached.** Allow `platform.claude.com` and `code.claude.com` in your network or sandbox settings, or accept the offer to run on recorded passages.
- **A headless run stops at the plan.** Pass `--scope`, and `--mode` when the plan has several batches.
- **`git status` is dirty before the audit starts.** Install at user scope; the project scope writes to the versioned `.claude/settings.json`.

## Support, security and privacy

- Questions and bugs: [open an issue](https://github.com/inbrace-tech/claude-skills/issues) or write to contato@inbrace.com.br.
- Security problems: report them privately through [Report a vulnerability](https://github.com/inbrace-tech/claude-skills/security/advisories/new), as [SECURITY.md](https://github.com/inbrace-tech/claude-skills/blob/main/SECURITY.md) describes.
- Privacy policy: https://inbrace.com.br/privacy

## License

MIT © Inbrace. The release history is in [CHANGELOG.md](CHANGELOG.md).
