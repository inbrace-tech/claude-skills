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

   The command opens a panel where you pick a scope. Choose **Install for you (user scope)**: the project scope writes `enabledPlugins` into the repository's `.claude/settings.json`, which is versioned, so the tree is dirty before the audit starts.

3. Run one of its skills by typing its command:

   ```text
   /inbrace-config:audit-opus-5-5
   ```

Every plugin and its skills are listed in [Skills](#skills) below. A skill starts only when you type its command. For scopes, updates and removal, see [Install, step by step](#install-step-by-step).

## Skills

`inbrace-config` holds Inbrace's tools for the configuration of a Claude Code setup. Today it ships the model-transition audit, which you start with one of three commands: a general one that takes the two models, and one each for Opus 5 → 5.5 and Sonnet 5 → 5.5.

| Plugin | Skill | Mode | What it does |
|---|---|---|---|
| `inbrace-config` | `/inbrace-config:audit-model-transition <source> <target>` | Command only | Audits `CLAUDE.md`, rules, agents, skills, settings, hooks, CI, Claude API code and model-dependent code and docs for what changes when a project moves from one Claude model to another, such as `sonnet-5 sonnet-5-5`. It reads today's Anthropic docs for the transition and explores the project guided by a map of where model-dependent behaviour lives, recording a finding only with the doc passage behind it; then it checks each of the transition's known traps — the edge cases earlier audits learned — against today's docs, flagging any whose passage changed, and applies them, adding what discovery missed. It lists and measures the files first, then shows the plan with its estimated token cost, counted from measured runs — the audit's fixed load (about 75–85k tokens of context with its skills and the transition's knowledge file), the docs, the files, the findings and the verifier agents — and its cost in dollars (measured runs: US$2.16 on a tiny project, US$7.90 on a small one) and asks before reading any file, asks again before each later costly stage, can run one `batch-auditor` agent per area in parallel, has every raw finding checked by the `finding-verifier` agent against the file and the cached doc page, summarizes in the chat what it would change and why, asks what to apply with a recommendation, and applies only what you approve. Arguments can pre-answer the plan gate and stop at the report — `--scope`, `--mode`, `--stop-at-report` — so it can run headless; no argument applies changes. A transition with no knowledge file yet runs on the docs alone. |
| `inbrace-config` | `/inbrace-config:audit-opus-5-5` | Command only | The same audit for Claude Opus 5 → Opus 5.5, with its known traps. It proposes Opus 5.5 at `medium` effort in the project settings, shared or local as you choose. Same arguments, without the models. |
| `inbrace-config` | `/inbrace-config:audit-sonnet-5-5` | Command only | The same audit for Claude Sonnet 5 → Sonnet 5.5, with its known traps. It proposes the model `claude-sonnet-5-5` where the project runs Sonnet 5 and never writes an effort level, leaving effort to a re-test against the guide's starting points. Same arguments, without the models. |
| `inbrace-config` | `transition-audit`, `transition-audit-plan`, `-discover`, `-drift`, `-traps`, `-report`, `-apply` | Stage | The audit's orchestrator and stages. They run only when one of the commands above starts them: each is out of the `/` menu, and stops at once when the audit's run file does not name it as the next stage. |

`inbrace-config` also ships two agents, which only the audit starts: `batch-auditor`, one per area of the setup when you choose to run an audit in parallel agents, and `finding-verifier`, which checks the raw findings at the end of every run and returns the final list. Both read files and return text; neither can edit or write anything.

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

For the audit, `user` is the right choice — **Install for you (user scope)** in the panel: you run it once in a while, in whichever project you are auditing. The `project` scope writes `enabledPlugins` into the versioned `.claude/settings.json`, which leaves the tree dirty before the audit starts.

### 4. Run the audit

```text
/inbrace-config:audit-model-transition <source> <target> [path]
/inbrace-config:audit-opus-5-5 [path]
/inbrace-config:audit-sonnet-5-5 [path]
```

Name the transition your project is making, as `sonnet-5 sonnet-5-5`, or use the command for it. The audit fetches the current Anthropic docs with `curl`, so it needs network access to `platform.claude.com` and `code.claude.com`; without it, the plan says so and offers to run on the passages the audit recorded, marked as not re-verified. When a run learns something the audit does not know yet, the close invites you to contribute it: it drafts a generic issue for this repository, with nothing from your project, shows it to you, and sends nothing unless you choose to.

Each run keeps its files in its own folder, `.model-audits/<target>-<date>/`, under the audited project. That is outside `.claude/`, which Claude Code protects from writes in every permission mode except bypass, so the audit runs without a prompt per file in `acceptEdits` and headless. The first run writes `.model-audits/.gitignore` holding `*`, so the folder never shows in `git status` and your own `.gitignore` is left alone. At the close, the audit keeps only `report.md` and `findings.md`. Delete the folder when you are done, or remove its `.gitignore` to version it.

Arguments can answer the plan's questions in advance, in any order: `--scope full|reduced|quick`, `--mode session|agents`, and `--stop-at-report`, which ends the run with the report. The plan is still shown, an option the plan would not offer stops the run with the reason, and no argument applies changes:

```text
/inbrace-config:audit-sonnet-5-5 --scope full --mode agents --stop-at-report
```

The same command runs headless, where nobody can answer a question; there the run always ends at the report, and without `--scope` (and `--mode`, when the plan has several batches) it stops at the plan:

```bash
claude -p "/inbrace-config:audit-sonnet-5-5 --scope full --mode agents"
```

Without a path it audits the current project. It starts only from this typed command: asking for an audit in plain words does not start it.

### 5. Check the install

Run `claude plugin list` in your terminal, or open the **Installed** tab in `/plugin`.

### 6. Update

An existing install receives a new release only when the plugin's version changes; commits between releases do not reach it. To update, refresh the marketplace listing inside Claude Code, then update the plugin from your terminal:

```text
/plugin marketplace update inbrace
```

```bash
claude plugin update inbrace-config@inbrace
```

Or open the plugin on the **Installed** tab in `/plugin` and select **Update now**. The running session keeps the version it loaded: run `/reload-plugins`, or start a new session, to use the new one.

Auto-update is off by default for a third-party marketplace like this one. Turn it on per marketplace: in `/plugin`, go to **Marketplaces**, select `inbrace` and select **Enable auto-update**.

Each release is a [GitHub Release](https://github.com/inbrace-tech/claude-skills/releases) with its notes, tagged `inbrace-config@x.y.z`. The plugin's full history is in [`plugins/inbrace-config/CHANGELOG.md`](plugins/inbrace-config/CHANGELOG.md).

Checked against [Keep plugins updated](https://code.claude.com/docs/en/plugins/install#keep-plugins-updated) and [Host and maintain a marketplace › Keep users up to date](https://code.claude.com/docs/en/plugins/host-marketplace#keep-users-up-to-date).

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
| `/claude-api migrate <scope> to claude-opus-5-5`, or `to claude-sonnet-5-5` | Code that calls the Claude API: model IDs, request parameters that now return errors, SDK syntax in each language |
| `/claude-api prompt-audit` | Dated prompt patterns across model generations, independent of one transition |
| `/inbrace-config:audit-model-transition`, `audit-opus-5-5`, `audit-sonnet-5-5` | What Claude Code reads as instructions (`CLAUDE.md`, rules, agents, skills, settings, hooks) and the project's model-dependent code and docs, checked against the transition's current guides and known traps |

The audits never edit API code. Each lists what it finds there and gives you the `/claude-api migrate` command to run, and points to `/claude-api prompt-audit` for instructions older than the model it moves from.

## Skills load only what they need

Installing a plugin does not load its skills into every conversation. A skill's full instructions load only when it runs, and each skill declares who may start it:

| Mode | Who starts it | What sits in context before it runs |
|---|---|---|
| Command only | You, by typing its slash command | Nothing |
| Default | You, or Claude when the task matches | Its one-line description |
| Stage | Only the audit, once you started it | Its one-line description |

The Skills table above says which mode each skill uses. One-shot or side-effecting skills, like the audit, are command only. The audit's stages are skills Claude invokes, so they can hand the run to each other and resume after a compaction; that is why their one-line descriptions stay in context while the plugin is enabled, about 200 tokens for the seven. Each one stops at once unless an audit you started names it as the next stage.

Agents are different: while a plugin is enabled, the one-line description of each agent it ships stays in context, so Claude knows the agent exists. `inbrace-config` ships two, `batch-auditor` and `finding-verifier`, each with a single short sentence.

## Without the plugin system

Each skill is a plain folder with a `SKILL.md`, following the [Agent Skills](https://agentskills.io) standard, so its core instructions also work in other tools that support the standard. To use one without a plugin, copy its folder:

```bash
# for you, in every project
for s in audit-model-transition audit-opus-5-5 audit-sonnet-5-5 transition-audit transition-audit-plan transition-audit-discover transition-audit-drift transition-audit-traps transition-audit-report transition-audit-apply; do
  cp -r plugins/inbrace-config/skills/$s ~/.claude/skills/
done
cp plugins/inbrace-config/agents/batch-auditor.md plugins/inbrace-config/agents/finding-verifier.md ~/.claude/agents/
# for one repository, shared with your team: the same, into .claude/skills/ and .claude/agents/
```

The audit is the ten skill folders together — the commands, the orchestrator with its `transitions/` knowledge files, and the stages — and runs in your session. Copy the agent files too only to use agents: `batch-auditor.md` for the parallel mode and `finding-verifier.md` for the final check; without them the audit offers only the in-session mode and checks its findings itself. Outside the plugin the skills and agents are called without the `inbrace-config:` prefix, and Claude Code asks once before each stage, since the pre-approval in each skill names the prefixed skill.

A copied skill does not receive updates. Installing through the marketplace does.

## Evaluations

Each skill is measured, not asserted. The results are published whether an expectation held or not:

- [2026-09-29: the transition-agnostic audit](docs/evaluations/2026-09-29-transition-audit.md). On a repository no version of the skill had seen, 0.6.0 found 32 of 35 items on average, against 25 for 0.5.1 and 29 for a plain session given the docs. It found every high-severity item, with no false positive, at about twice 0.5.1's cost.
- [2026-09-29, second round (v3): against plain sessions, Sonnet and Opus](docs/evaluations/2026-09-29-transition-audit-v3.md). On a repository it had never seen, 0.6.0 found 88.6% of the Sonnet 5 → 5.5 changes (strict recall), against 71.4% for a plain session given the doc links and 57.1% without them, with no false positive; on Opus 5 → 5.5, 86.8%, 82.4% and 58.8%. The defects it found are fixed in 0.6.1.

## How the skills are written

Each rule in a skill is one imperative sentence with a stable id, like `[N07]`. Beside every `SKILL.md`, a `SKILL.norms.json` records why each rule exists and the source behind it. Claude never loads that file on its own, so the history costs no context. CI checks that the two files list the same rules.

## Security

Skills are instructions that Claude follows on your machine, with your permissions. Read a skill before you install it, from this repository or any other. See [SECURITY.md](SECURITY.md) for how this repository is protected and how to report a problem.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Inbrace
