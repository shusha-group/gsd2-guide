# Quick Task: the on this page navigation still cant be seen in light mode

**Date:** 2026-03-17
**Branch:** gsd/quick/5-the-on-this-page-navigation-still-cant-b

## What Changed
- Overrode light mode styles for the mobile "On this page" TOC toggle button — was using `var(--sl-color-black)` background (`#0a140a`), making text invisible against the dark background
- Overrode light mode styles for the TOC dropdown panel — same `var(--sl-color-black)` issue, links were unreadable
- Added hover, open, and active states with appropriate light-theme colors (green accent on active item, dark text on light background)

## Files Modified
- `src/styles/custom.css` — 28 lines of light mode overrides for `mobile-starlight-toc .toggle` and `.dropdown`

## Verification
- Mobile (390×844) light mode: "On this page" toggle clearly visible with light background and dark text
- Mobile light mode expanded: dropdown shows all TOC links with readable dark text, green checkmark on active item
- Mobile dark mode: unchanged, still works correctly with dark background
- `npm run build` — 60 pages, 0 errors
- `node scripts/check-links.mjs` — 3564 links, 0 broken
