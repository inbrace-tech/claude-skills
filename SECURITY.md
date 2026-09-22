# Security Policy

## Supported versions

Fixes land on the latest version of each plugin in this marketplace. Older versions are not patched. Run `/plugin marketplace update inbrace` to receive fixes.

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report it privately through GitHub's [Report a vulnerability](https://github.com/inbrace-tech/claude-skills/security/advisories/new) form. It opens a private advisory that only the maintainers can see.

Please include what you can:

- the plugin, skill and version affected;
- your Claude Code version;
- what an attacker gains, and the steps or input that demonstrate it.

You can expect an acknowledgement within a few days and an assessment shortly after. If a fix is warranted, we will agree on a disclosure timeline with you and credit you in the release notes, unless you would rather not be named.

## What this project handles

A skill is a set of instructions that Claude follows on the user's machine, with the user's permissions. That shapes what a vulnerability here can reach:

- **A skill can steer Claude toward any action the user's permissions allow.** A malicious or careless instruction in a `SKILL.md` is the main risk, so every change to a skill is reviewed by a code owner before it merges.
- **Skills here do not ship executable code by default.** A skill that needs a script or a hook must say so in its README row, and that code goes through the same review.
- **Skills never ask for credentials, and never send data to a network service** unless the skill's description says so plainly.
- **A skill with side effects runs only when the user invokes it** (`disable-model-invocation: true`). The README's Skills table lists which skills Claude may also start on its own.

## How the repository is protected

- **Every change reaches `main` through a reviewed pull request.** `CODEOWNERS` requests review from the maintainers on every file.
- **Every pull request is scanned for leaked secrets** with gitleaks. The binary is downloaded from its official release and checked against the published checksum before it runs.
- **Every manifest and skill is validated** with `claude plugin validate --strict` in CI.
- **Every GitHub Action is pinned to a full commit SHA**, so a compromised or retagged action cannot silently enter a workflow run. Dependabot proposes updates after a 7-day cooldown.
- **Workflow checkouts drop their credentials** (`persist-credentials: false`), and every workflow runs with read-only permissions.
