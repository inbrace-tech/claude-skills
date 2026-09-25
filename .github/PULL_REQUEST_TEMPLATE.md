<!--
Sections marked "(optional)" can be deleted when not applicable.
-->

## Summary

<!-- What changed and why. If this PR closes an issue, open with: Closes #<issue-number>. -->

## Test plan

- [ ] `claude plugin validate --strict` passes on the marketplace, the plugin and its skills
- [ ] `pnpm run typecheck`, `pnpm run lint` and `pnpm test` pass
- [ ] `pnpm run check-norms` passes, and every new or changed norm has its reason in `SKILL.norms.json`
- [ ] Installed the branch locally and ran the skill on a real project
- [ ] The skill's invocation mode is chosen deliberately and listed in the README's Skills table
- [ ] Every claim about model behavior cites official Anthropic documentation
- [ ] Nothing private: no internal names, URLs, credentials or customer data

## Decisions worth noting (optional)

- <each decision: what was chosen + 1 line on the rejected alternative>

## Out of scope (optional)

- <what was deliberately left out + 1 line on why>
