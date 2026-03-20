# Quick Task: Restructure command navigation with grouping + consistent labels

**Date:** 2026-03-20
**Branch:** gsd/quick/10-can-we-restructure-the-command-navigatio

## What Changed

- Replaced flat 33-item commands list in sidebar with 8 grouped sub-sections, mirroring the Prompts section pattern
- Groups: **Running GSD**, **Planning & Discussion**, **Monitoring & Capture**, **Milestone Management**, **Configuration**, **Diagnostics & Skills**, **Migration**, **Reference**
- Fixed label inconsistency: `gsd config` and `gsd update` were missing the leading slash — now `/gsd config` and `/gsd update` to match all other command labels
- Re-ordered commands within groups logically (e.g. `/gsd` before `/gsd next` before `/gsd auto`)
- Non-command reference pages (`Keyboard Shortcuts`, `CLI Flags`, `Headless Mode`) collected under a **Reference** sub-group

## Files Modified

- `astro.config.mjs` — sidebar `Commands` section restructured

## Verification

- `npm run build` passes cleanly: 113 pages built, 0 errors, 0 broken links
