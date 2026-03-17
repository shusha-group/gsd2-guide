# Quick Task: the home page does not really reflect what has been built on the site. the command references dont link to the detailed command pages.

**Date:** 2026-03-17
**Branch:** gsd/quick/3-the-home-page-does-not-really-reflect-wh

## What Changed
- Rewrote hero tagline from generic "Build software with autonomous AI agents" to "The autonomous coding agent. Discuss your goals, then let GSD plan, execute, verify, and ship."
- Replaced "Explore the Documentation" section (links to old reference cards) with "Learn GSD" section linking to the walkthrough and getting started
- Added "Commands" section with 3 featured deep-dive pages (auto, quick, doctor) plus link to full command reference
- Added "Recipes" section highlighting 4 core workflows (fix-a-bug, small-change, error-recovery, working-in-teams)
- Consolidated remaining guides into "Reference & Guides" section
- Updated Mermaid diagram to show actual GSD lifecycle with real commands at key stages
- Hero CTA now links to walkthrough ("Developing with GSD") instead of Quick Reference

## Files Modified
- `src/content/docs/index.mdx` — Complete homepage rewrite

## Verification
- `npm run build` — 60 pages, 0 errors
- `node scripts/check-links.mjs` — 3564 links checked, 0 broken
- Verified homepage links resolve to correct deep-dive pages (commands/auto, commands/quick, commands/doctor, commands/, recipes/*)
