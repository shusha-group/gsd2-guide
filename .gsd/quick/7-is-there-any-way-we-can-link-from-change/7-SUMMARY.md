# Quick Task: is there any way we can link from changelog commands directly to the detail page of that command. similar to the command reference to cammand detail page.

**Date:** 2026-03-17
**Branch:** gsd/quick/7-is-there-any-way-we-can-link-from-change

## What Changed
- Added command auto-linking in `ReleaseEntry.astro` — post-processes rendered markdown HTML to convert `<code>/gsd X</code>` and `<code>gsd X</code>` references into clickable links to `/commands/X/` deep-dive pages
- Command slug map covers all 27 command pages plus common variants (with/without leading slash, `gsd sessions` → headless)
- Added CSS styling for `.command-link code` — dashed underline in both dark and light modes to visually distinguish linked commands from regular code elements
- 20 command references linked across the changelog's 48 releases

## Files Modified
- `src/components/ReleaseEntry.astro` — command slug map and HTML post-processing regex
- `src/styles/terminal.css` — `.command-link code` styles for dark and light modes

## Verification
- `npm run build` — 60 pages, 0 errors
- `node scripts/check-links.mjs` — 3643 links, 0 broken (up from 3623 — 20 new command links)
- Clicked `/gsd` link in changelog → navigated to `/commands/gsd/` deep-dive page
- Links styled with dashed underline, distinguishable from non-linked `<code>` elements
- Verified both dark and light mode rendering
