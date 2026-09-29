---
name: scan-reader
description: Read the price tables and volume charts in a scanned contract schedule and turn them into structured rows.
---

# Read a scanned schedule

The schedules of older contracts arrive as scanned PDFs, with price tables and volume-tier charts.

1. Render each page with `pnpm pdf:render <id> --page <n>`.
2. Before reading any chart or table, crop the page into quadrants with `pnpm img:crop` and zoom into each one; always run the OCR pass (`pnpm pdf:ocr`) first, even on pages with a text layer.
3. Write each table row, and each chart's tier boundaries, to `schedules/<id>.json`.
4. Mark a value you could not read as `null` with the page number; never estimate it.
