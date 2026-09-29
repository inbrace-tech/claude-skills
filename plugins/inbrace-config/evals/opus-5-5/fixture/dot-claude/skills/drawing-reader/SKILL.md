---
name: drawing-reader
description: Read the site plans and technical drawings annexed to facilities contracts and list the areas and equipment they cover.
---

# Read a technical drawing

Facilities contracts annex site plans and equipment drawings that define what the vendor maintains.

- Read each drawing and list the rooms, areas and equipment it marks as in scope, with their labels.
- A crop tool (`pnpm img:crop`) is available for the densest technical drawings; use it when a label is too small to read.
- Write the list to `annexes/<id>.json` and give the drawing number for each item.
