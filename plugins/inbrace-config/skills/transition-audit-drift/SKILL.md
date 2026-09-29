---
name: transition-audit-drift
description: Drift stage of the model-transition audit. Use only when that audit's run file names this stage next.
user-invocable: false
allowed-tools: Skill(inbrace-config:transition-audit) Read Grep Glob
metadata:
  max-bytes: 14000
---

# Drift: check the known traps against today's docs

**This stage checks every passage a known trap rests on against the page as it reads today, so the audit's knowledge never silently outlives the docs.** A passage that no longer holds does not remove its trap: the trap is still applied, flagged as possibly stale, and the report quotes what the page says now.

## Before anything

- [N01] Run only when the run file under `.claude/audits/` names this stage as next, and otherwise stop at once, saying this skill runs only inside the model-transition audit.
- [N02] Where the orchestrator's norms are no longer in context, as after a compaction, invoke `transition-audit` with `--resume` and stop.

## Compare

- [N03] For every `source` of every trap in the knowledge file that has a `passage`, take the page — the URL without its `#anchor` — from the raw pages discovery cached under `.claude/audits/docs/<YYYY-MM-DD>/`, or fetch it now with `curl -fsSL <url>.md` into that directory; a source with only a `basis` has nothing to compare and gets the verdict `basis`.
- [N04] Compare with the commands of `<drift_commands>`, never by reading the page, so the verdict is the same on every run and the page stays out of context: normalise the page and each fragment of the passage — split on `…` — the same way, and find each fragment's offset in the normalised page.

<drift_commands>

```bash
# once per page: normalise — whitespace runs to one space, [text](url) to text, no * marks, straight quotes
norm() { tr -s ' \t\r\n' '    ' | sed -E 's/\[([^]]*)\]\([^)]*\)/\1/g' | tr -d '*' | LC_ALL=C sed "s/’/'/g; s/‘/'/g; s/“/\"/g; s/”/\"/g"; }
norm < "$page.md" > "$page.norm"
# per fragment: its byte offset, case-insensitive; no output means absent
frag=$(printf '%s' '<fragment>' | norm | sed -E 's/^ +| +$//g')
grep -F -i -o -b -- "$frag" "$page.norm" | head -n 1 | cut -d: -f1
# per anchor: whether the page still has it
curl -fsSL "<url without #anchor>" | grep -c "id=\"<anchor>\""
```

</drift_commands>

- [N05] Give each source the first verdict that applies, and record it:

<verdicts>

| Verdict | When | The trap |
|---|---|---|
| `unverified` | the page could not be read raw — no network, WebFetch only, or a PDF with no `pdftotext` installed | is applied as recorded, its note saying "not re-verified since <verified>" |
| `vanished` | the page returns 404 or 410, or its anchor is gone and no fragment of the passage occurs in it | is applied, flagged possibly stale, confidence at most medium |
| `changed` | the page is there but not every fragment occurs, in order, or its anchor is gone while the fragments remain | is applied, flagged possibly stale, confidence at most medium, and the report quotes up to 15 lines of the section as it reads today |
| `holds` | every fragment occurs, in order, and the anchor exists | is re-verified today |

</verdicts>

- [N06] For a system card or any other PDF, convert it with `pdftotext` where installed and compare the same way; otherwise give its sources the verdict `unverified`.
- [N07] Never edit the knowledge file: a changed passage is for the maintainers to re-verify, and the run reports it.

## Close the stage

- [N08] Append to the findings file, under "Drift", one line per source — `Pnn source <k>: <verdict> <url>` — and for each `changed` or `vanished` source the lines of the section as it reads today, then set the next stage.

## Sources

- The docs serve raw Markdown at `<page>.md`, and WebFetch returns a small model's answer rather than the page: https://code.claude.com/docs/en/tools-reference#webfetch-tool-behavior

**Every `[N<NN>]` above is one norm, and why it exists lives in [`SKILL.norms.json`](SKILL.norms.json), which nothing loads automatically.** Open it when a step is doubted.
