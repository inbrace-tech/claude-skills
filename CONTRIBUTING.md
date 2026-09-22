# Contributing

Thanks for your interest in improving these skills. This is a small, curated collection, so every skill has to earn its place.

## Ground rules

- **One plugin per theme, under `plugins/<plugin>/`.** A plugin holds one or more skills in `skills/<skill>/SKILL.md` and is listed in `.claude-plugin/marketplace.json`.
- **Skills run only when invoked.** Set `disable-model-invocation: true` in the frontmatter unless the pull request explains why Claude should start the skill on its own.
- **Ground every claim about model behavior in a source.** Cite the official Anthropic documentation page in the skill's `Sources` section. A tip that only one person has seen work does not belong here.
- **No executable code without discussion first.** Open an issue before adding a script or a hook to a plugin.
- **Nothing private.** No internal repository names, URLs, credentials or customer data, including in examples.

## Checking your change

CI runs these on every pull request. Run them locally first:

```bash
claude plugin validate --strict .
claude plugin validate --strict plugins/<plugin>
claude plugin validate --strict plugins/<plugin>/skills
```

Then install your branch locally and run the skill on a real project:

```text
/plugin marketplace add ./path/to/your/clone
/plugin install <plugin>@inbrace
```

## Versions

Bump `version` in the plugin's `.claude-plugin/plugin.json` when users receive a change, and add one line to `CHANGELOG.md` saying what changed for them.

## Opening a pull request

1. Fork and branch from `main`.
2. Make your change and run the checks above.
3. Use a conventional-commit title with a lowercase subject, such as `feat: add a review skill`.
4. Describe what changed and how you tested it.

Pull requests are reviewed and merged by the maintainers. Thank you for contributing.
