# Changesets

Each file here declares one change a plugin's users will receive: which plugin, whether it is a patch, minor or major bump, and one line saying what changed for them.

- A pull request that changes a file under `plugins/<plugin>/` adds one with `pnpm changeset`. CI fails the pull request without it. The files a release writes (`package.json`, `CHANGELOG.md`, `.claude-plugin/plugin.json`) do not count, through `changedFilePatterns` in `config.json`.
- The summary is one line of at most 200 characters: it becomes a line of the public changelog. The bump is per plugin — `patch` for a fix or refinement, `minor` for a new skill, agent, argument or wider audit, `major` for a removal, rename or incompatible change; while a plugin is `0.x`, a breaking change is a `minor`.
- At release time the maintainer runs `pnpm run release:version`, which consumes these files, moves each plugin's version in its `package.json` and `.claude-plugin/plugin.json`, and writes its `CHANGELOG.md`.

The whole flow is in `CONTRIBUTING.md` › Versions. Changesets' own documentation: https://github.com/changesets/changesets.
