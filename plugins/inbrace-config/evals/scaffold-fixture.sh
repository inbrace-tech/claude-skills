#!/usr/bin/env bash
# Seeds a run's empty workspace with a transition fixture: `scaffold-fixture.sh <fixture-group>`, where
# <fixture-group> is the directory beside this script that holds `fixture/`, such as `sonnet-5-5`.
# `claude plugin eval --scaffold` runs it as you, outside the agent's sandbox, from the workspace.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src="$here/${1:?usage: scaffold-fixture.sh <fixture-group>}/fixture"
[[ -d "$src" ]] || { echo "no fixture at $src" >&2; exit 1; }

cp -R "$src/." .

# The fixture is stored under neutral names so this repository neither loads its `.claude/` and
# `CLAUDE.md` nor scans its manifests; give each file back the name the audit expects.
mv dot-claude .claude
mv dot-gitignore .gitignore
mv dot-env.example .env.example
mv CLAUDE.fixture.md CLAUDE.md
mv package.fixture.json package.json
if [[ -f worker/pyproject.fixture.toml ]]; then mv worker/pyproject.fixture.toml worker/pyproject.toml; fi
if [[ -d dot-github ]]; then mv dot-github .github; fi

# One commit with a fixed author and date, so the audit sees a clean tree and its `git status` check
# has a baseline. The fixture's `.gitignore` keeps `.claude/rules/shared/` and settings.local.json out.
export GIT_AUTHOR_NAME=Fixture GIT_AUTHOR_EMAIL=fixture@example.com GIT_AUTHOR_DATE=2026-09-01T00:00:00Z
export GIT_COMMITTER_NAME=Fixture GIT_COMMITTER_EMAIL=fixture@example.com GIT_COMMITTER_DATE=2026-09-01T00:00:00Z
git init --quiet --initial-branch=main
git add -A
git -c commit.gpgsign=false -c core.hooksPath=/dev/null commit --quiet --no-verify -m "Initial import"

# The audit writes its findings to `.model-audits/<group>-<date>/findings.md`, and a file grader takes a
# fixed path, not a glob. Point one at today's run folder — the date Claude Code gives the session —
# and keep it out of `git status`, so the audit's own before-and-after check never sees it.
ln -s ".model-audits/$1-$(date +%F)/findings.md" .eval-findings.md
echo ".eval-findings.md" >> .git/info/exclude

# The fixture plants hooks as audit material (a SessionStart notes loader and a PostToolUse tool-budget
# countdown). Hooks run outside the run's sandbox, and the countdown stops a long session, so they are
# kept as files and switched off; the file is gitignored, so the tree stays clean.
printf '{\n  "disableAllHooks": true\n}\n' > .claude/settings.local.json
