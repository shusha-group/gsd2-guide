# Quick Task: Fix homepage "Explore the Documentation" section

**Date:** 2026-03-17
**Branch:** gsd/quick/1-the-explore-documentation-right-at-the-t

## What Changed
- Replaced non-clickable `<Card>` components with clickable `<LinkCard>` components in the "Explore the Documentation" section
- Removed duplicate `<CardGrid>` that had a second set of LinkCards pointing to the same pages
- Each card (Commands, Skills, Extensions, Agents) now links to its reference page with full descriptions
- Light mode readability was already fixed in prior commits (LinkCard title/description CSS overrides)

## Files Modified
- `src/content/docs/index.mdx` — replaced Card with LinkCard, removed duplicate CardGrid

## Verification
- Build passes: 135 pages, 0 broken links
- Dark mode: all 4 cards render as bordered clickable cards with arrow icons
- Light mode: titles in dark green (#0e580e), descriptions in dark text (#384838), fully readable
- Clicked "Commands" card → navigated to `/reference/commands/` page successfully
- Deployed to GitHub Pages and verified live at https://shusha-group.github.io/gsd2-guide/
