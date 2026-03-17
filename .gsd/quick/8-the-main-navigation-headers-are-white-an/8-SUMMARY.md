# Quick Task: the main navigation headers are white and the reference page commands dont link to the detail command pages.

**Date:** 2026-03-17
**Branch:** gsd/quick/8-the-main-navigation-headers-are-white-an

## What Changed
- Fixed light mode sidebar group headers ("User Guide", "Commands", etc.) being white/invisible — Starlight's `.large` class uses `var(--sl-color-white)` which is `#ffffff` in our light theme. Added `nav.sidebar .large { color: #1b2d1b }` override.
- Added "View full deep-dive →" links to reference command cards — `ReferenceCard.astro` now accepts an optional `href` prop that renders a link to the deep-dive page. `commands.mdx` passes the appropriate `/commands/<slug>/` URL for all 24 commands that have deep-dive pages.
- Styled the deep-dive links in both dark and light modes with mono font and dashed underline.

## Files Modified
- `src/styles/custom.css` — added `nav.sidebar .large` light mode color override
- `src/styles/terminal.css` — `.ref-card .deep-dive-link` styles for dark and light modes
- `src/components/ReferenceCard.astro` — optional `href` prop, renders "View full deep-dive →" link
- `src/content/docs/reference/commands.mdx` — command slug map, passes href to ReferenceCard

## Verification
- Desktop + mobile light mode: sidebar group headers ("User Guide", "Commands", etc.) clearly visible with dark text
- Reference page: expanded command card shows "View full deep-dive →" link
- Clicked link navigates to correct deep-dive page (/commands/gsd/)
- `npm run build` — 60 pages, 0 errors
- `node scripts/check-links.mjs` — 3665 links, 0 broken (22 new deep-dive links)
