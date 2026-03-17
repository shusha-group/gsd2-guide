# Quick Task: so on the mobile version the top right corner has overlap of the version number, search and the menu navigation. also still having issues seeing on the light version with navigation menu.

**Date:** 2026-03-17
**Branch:** gsd/quick/4-so-on-the-mobile-version-the-top-right-c

## What Changed
- Hidden version badge on mobile viewports (<50rem) — it was overlapping the search icon and hamburger menu button
- Moved version badge from `right: 1rem` to `right: 7.5rem` on desktop to clear the theme selector dropdown
- Added light mode override for the mobile sidebar overlay background — Starlight uses `var(--sl-color-black)` for the mobile sidebar pane, which is dark (`#0a140a`) even in light mode, making all navigation text invisible against the dark background. Override sets it to `#f4f8f4` in light mode.

## Files Modified
- `src/components/Header.astro` — version badge positioning + mobile hide media query
- `src/styles/custom.css` — light mode `.sidebar-pane` background override

## Verification
- Mobile viewport (390×844): version badge hidden, search + menu icons unobstructed
- Mobile light mode sidebar: light background with readable dark text
- Mobile dark mode sidebar: unchanged, still works correctly
- Desktop: version badge visible, no overlap with theme selector
- `npm run build` — 60 pages, 0 errors
- `node scripts/check-links.mjs` — 3564 links, 0 broken
