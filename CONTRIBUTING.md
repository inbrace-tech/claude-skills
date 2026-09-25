# Contributing

Thanks for your interest in improving these skills. This is a small, curated collection, so every skill has to earn its place.

## Ground rules

- **One plugin per theme, under `plugins/<plugin>/`, named `inbrace-<theme>`.** A plugin holds one or more skills in `skills/<skill>/SKILL.md` and is listed in `.claude-plugin/marketplace.json`, whose marketplace is `inbrace`. The shared prefix groups every Inbrace skill under `/inbrace` in the slash-command list.
- **Choose who starts each skill, and say so in the README's Skills table.** Set `disable-model-invocation: true` for a skill with side effects or one a user runs once in a while, such as an audit: only the user can start it, and nothing about it sits in context until then. Leave it unset for a skill Claude should reach for on its own when a task matches, and write its `description` so Claude can tell when that is.
- **Ground every claim about model behavior in a source.** Cite the official Anthropic documentation page in the skill's `Sources` section. A tip that only one person has seen work does not belong here.
- **No executable code without discussion first.** Open an issue before adding a script or a hook to a plugin.
- **Nothing private.** No internal repository names, URLs, credentials or customer data, including in examples.

## Writing a skill

Skills here follow one format, so every rule can be found, cited and traced to the reason it exists.

- **One norm per list item, led by its id:** `- [N07] Measure the inventory before reading any of it, …`. A norm is one direct, imperative sentence stating what to do, and it may add the reason in one clause.
- **Ids are stable.** Number new norms after the highest id in the skill. Never renumber or reuse an id: issues, pull requests and other skills cite them, as in `[N04]`.
- **The history goes in `SKILL.norms.json`, beside the `SKILL.md`.** Give each norm an entry with its `id`, `where` (the section it sits in), `refs` (sources such as `{"docs": ["<url>"], "inbrace-tech/claude-skills": [<pr>]}`) and `what` (why the norm exists, what went wrong without it, what was measured). Claude never loads this file on its own, so the history costs no context.
- **The surface states the final behavior.** How a rule changed, and why an alternative was rejected, belongs in the sidecar and the pull request, not in `SKILL.md`.
- **Wrap content Claude executes verbatim** — a command, a template, a table it checks against — in a structural tag such as `<measure>` or `<patterns>`, so it reads as material to use rather than prose to paraphrase.
- **Keep the context small.** A skill that reads a user's files states how it bounds what it reads, for example by measuring first and working in batches.
- **Agents follow the same format.** A plugin agent at `agents/<name>.md` states its behavior as `- [Nxx]` norms under `##` sections, with their history in `<name>.norms.json` beside it, whose `surface` is the agent's path. Its ids are its own: an agent never cites another surface's norms, since the skill or session that starts it is not in its context.
- **An agent's return contract lives in the agent**, wrapped in its own tag such as `<return_contract>`, with the exact format of what it returns. A skill that starts the agent points to that contract instead of restating it.

## Checking your change

CI runs these on every pull request. Run them locally first:

```bash
node --test "scripts/*.test.mjs"
node scripts/check-norms.mjs
claude plugin validate --strict .
claude plugin validate --strict plugins/<plugin>
claude plugin validate --strict plugins/<plugin>/skills
claude plugin validate --strict plugins/<plugin>/agents   # when the plugin ships agents
```

`check-norms` covers every `plugins/*/skills/*/SKILL.md` and every `plugins/*/agents/*.md`, each with its sidecar.

Then install your branch locally and run the skill on a real project:

```text
/plugin marketplace add ./path/to/your/clone
/plugin install <plugin>@inbrace
```

A skill with `disable-model-invocation: true` starts only from its typed slash command, so test it end to end in an interactive session (`claude --plugin-dir <plugin>`, then type the command), not with `claude -p` and a request in plain words.

## Versions

Bump `version` in the plugin's `.claude-plugin/plugin.json` when users receive a change, and add one line to `CHANGELOG.md` saying what changed for them.

## Opening a pull request

1. Fork and branch from `main`.
2. Make your change and run the checks above.
3. Use a conventional-commit title with a lowercase subject, such as `feat: add a review skill`.
4. Describe what changed and how you tested it.

Pull requests are reviewed and merged by the maintainers. Thank you for contributing.
