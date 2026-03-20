# Quick Task: Restructure sidebar — Solo Builder's Guide to top, clarify section names

**Date:** 2026-03-20
**Branch:** gsd/quick/11-can-we-move-solo-builders-guide-to-the-t

## What Changed

- **Solo Builder's Guide** moved to position 3 (immediately below Changelog), replacing its old position at the very bottom of the nav
- **"User Guide"** renamed to **"Getting Started"** — it contains installation + onboarding walkthrough, which is what "Getting Started" means; the old name was ambiguous vs "Guides"
- The "Getting Started" page label inside that section changed from "Getting Started" (same as the group) to "Installation" to avoid the redundant double-label
- **"Guides"** renamed to **"How-to Guides"** — these are deep-dive topic references (Configuration, Architecture, Skills, Visualizer, etc.), distinct from the narrative onboarding content. The new name makes the distinction clear
- **Duplicate "Working in Teams"** removed from Recipes — there were two entries (`/recipes/working-in-teams/` and `/working-in-teams/`); the duplicate `/working-in-teams/` link was removed

## Files Modified

- `astro.config.mjs` — sidebar structure

## Verification

- `npm run build` passes: 113 pages, 0 errors, 0 broken links
