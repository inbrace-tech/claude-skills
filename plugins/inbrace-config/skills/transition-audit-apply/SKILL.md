---
name: transition-audit-apply
description: Apply-and-close stage of the model-transition audit. Use only when that audit's run file names this stage next.
user-invocable: false
allowed-tools: Skill(inbrace-config:transition-audit) Read Grep Glob
metadata:
  max-bytes: 14000
---

# Apply, verify, close

**This stage changes exactly what the user approved, checks it, and closes every run the same way** — cancelled at the plan, stopped at the report, or applied.

## Before anything

- [N01] Run only when the run file in the run's folder under `.model-audits/` names this stage as next, and otherwise stop at once, saying this skill runs only inside the model-transition audit.
- [N02] Where the orchestrator's norms are no longer in context, as after a compaction, invoke `transition-audit` with `--resume` and stop.

## Apply

- [N03] Append the decision to the report file before the first edit, then each change as it is applied and the verification result, so the report records what the audit changed and a resume can continue from the last edit.
- [N04] When the user chose to see the diff first, show the diff of every proposed change in the chat without editing any file, then ask whether to apply all of it, choose by type, or stop, with the cost of applying in each applying option.
- [N05] Before removing any text, search the root for the exact string, and where a test, hook or script matches it, leave the text and name that dependency in the close.
- [N06] Apply exactly the approved set and nothing beside it, and edit no file the plan marked read-only: name it with its change for the user to make where it is produced.
- [N07] After applying, check every edited file again against the known traps and the change digest, and confirm that no safety rule, confirmation step, permission boundary, project fact or measured-failure rule was removed.

## Close

- [N08] Close every run the same way: the final checklist with each stage done or skipped; the files edited, and every approved change not applied with the reason; the gates the arguments answered; the reference material kept out of the chat, listing only what has items — what was not audited, any file read only in part, the older residue with `/claude-api prompt-audit`, the counts by confidence; one line saying the gates counted tokens of context without the cache re-reads of every round trip, which multiply the tokens actually sent (measured: 15–19× across agents and session, about US$14–17 per million tokens of context on Opus 5.5), so the statusline, the bill and each agent's token count are no check of the estimate, while `/usage`, also `/cost`, shows the real volume and the Console or the plan's usage page the bill; the path of the report, and that the run's folder is ignored by git through `.model-audits/.gitignore`, so the user can delete it, or keep and version it by removing that `.gitignore`; where the audit ran, that running it again refines the result at about this round's cost, whenever the user chooses; and one recommended next step.
- [N16] At the close of a run that reached its end — applied, stopped at the report, or cancelled — after the check of [N17], delete the run's working files, `docs/`, `digest.md`, `brief.md`, `status-before.txt` and `run.md`, keeping `report.md` and `findings.md`; where the deletion is refused or fails, leave the files and never retry it by another route, since a guard on the project is the user's choice, and say in the close which working files remain in the run's folder and that the user can delete them, or the whole `.model-audits/<run>/` folder; where the run stopped early and can be resumed, keep them all and say in the close that they stay for `--resume`.
- [N17] Before closing, compare the root's `git status --porcelain --untracked-files=all` — or its file list outside git — with `status-before.txt`, and list in the close, by path, every file the run created or changed outside `.model-audits/` and the edits the user approved, never calling the tree clean without this check; keep `status-before.txt` with the working files until then.
- [N09] Where the audit ran, make the next step the knowledge file's `<next_step>`, since the guides' advice is a starting point the project's own measurements confirm.
- [N10] Where this session can publish an artifact, offer in the close to publish the report as one for sharing, and publish only if the user accepts.

## Learning loop, only with the user's consent

- [N11] Offer the learning loop at the close only when the run audited files and learned something the knowledge file lacks — a `D` line the verifier kept as `change` or `re-test`, a drift line other than `holds`, or a bootstrap run — and never in a headless run or after a cancelled plan.
- [N12] Make the offer an invitation, before any drafting: say, in the user's language, "This run found something the audit's knowledge doesn't cover yet. Improvements to this skill are very welcome, and each one helps everyone who uses it.", then ask "Would you like to contribute what this run learned? I can draft an issue for the public inbrace-tech/claude-skills repository in a moment — anonymised, with no path, name or text from your project — and I'll show it to you before anything is posted." with the options of `<consent>`, offering the `gh` option only when `gh auth status` succeeds:

<consent>

| Option | Description |
|---|---|
| Yes, give me a prefilled link (Recommended) | I draft it and show it here, then give you a link to GitHub's issue form with the draft filled in. Nothing is sent until you review it and submit it yourself. |
| Yes, post it with `gh` | I draft it and show it here, then post it with `gh issue create` under your GitHub account once you confirm the draft. |
| Not now | Nothing is drafted or sent. |

</consent>

- [N13] After a yes, build the draft only from the transition's slug and the plugin version, trap ids and drift verdicts, doc URLs with passages that match the cached page, the area names of the plan's `<map>`, and one generic sentence per item in that map's words, such as "a hook script that selects instruction text by matching a model id prefix"; never write into it a path, file name, line number, identifier, quoted text, code, repository, remote, branch or person's name from the audited project.
- [N14] Before showing the draft, search it, ignoring case, for every path segment and file name of the inventory, with and without extension, the root directory's name, each `git remote -v` URL with its owner and repository, the current branch, `git config user.name` and `user.email`, and every quoted text of the final list — leaving out words shorter than four letters and the map's own words; on a match, rewrite the draft once and search again, and on a second match show nothing, post nothing, and say the draft could not be written without details of the project.
- [N15] Show the draft in full in the chat before anything else, then deliver it as chosen: for the link, `https://github.com/inbrace-tech/claude-skills/issues/new?template=trap_report.yml` with `title`, `transition`, `trap`, `where`, `passage` and `version` URL-encoded, dropping `passage` and saying so when the link would pass about 8,000 characters, and sending nothing; for `gh`, ask once more "Post this issue to the public inbrace-tech/claude-skills repository under your GitHub account?", with the options "Post it" (recommended, since the user chose this path), "Give me the link instead" and "Don't post", run `gh issue create --repo inbrace-tech/claude-skills --label enhancement` with the draft only on "Post it", and print the new issue's URL.

## Sources

- `/usage` and `/cost`: https://code.claude.com/docs/en/costs#track-your-costs and https://code.claude.com/docs/en/commands
- How each round trip re-reads the context from cache: https://code.claude.com/docs/en/prompt-caching#how-the-cache-is-organized
- Anthropic's Claude API skill and its `prompt-audit` subcommand: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill
- GitHub issue forms, and filling their fields with URL query parameters: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms and https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
