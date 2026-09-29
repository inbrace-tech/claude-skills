---
name: portal-ui
description: Build or restyle a page of the reviewer portal (src/portal/web) — contract list, redline view, obligations calendar.
---

# Build a portal page

The reviewer portal is plain HTML and CSS served by the service, with no framework.

- Make it modern and avoid a generic AI look.
- Reuse the tokens in `src/portal/web/tokens.css`; add a token rather than a literal colour.
- Every page must work at 1280 px and at 390 px wide.
- Put each page's styles in its own file under `src/portal/web/pages/`.
