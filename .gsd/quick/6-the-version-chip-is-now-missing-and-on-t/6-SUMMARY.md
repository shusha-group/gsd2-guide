# Quick Task: the version chip is now missing and on the home page the hamburger navigation is missing

**Date:** 2026-03-17
**Branch:** gsd/quick/6-the-version-chip-is-now-missing-and-on-t

## What Changed
- Restored version badge on mobile — repositioned to `left: 5rem` (next to site title) with smaller font instead of hiding it entirely
- Switched homepage from `template: splash` to `template: doc` — splash template strips all sidebar/nav chrome including the hamburger menu. Doc template renders the full sidebar while still supporting the hero frontmatter section.
- Desktop version badge positioning unchanged (right: 7.5rem)

## Files Modified
- `src/components/Header.astro` — replaced mobile `display:none` with responsive left-positioning
- `src/content/docs/index.mdx` — changed `template: splash` to `template: doc`

## Verification
- Mobile: version badge visible next to "GSD 2" title, doesn't overlap search or hamburger
- Mobile: hamburger menu present on homepage, opens full sidebar navigation
- Desktop: sidebar visible on homepage with full navigation, hero section still renders
- Desktop: version badge at right:7.5rem, clears theme selector
- Light mode: version badge styled correctly (existing CSS override applies)
- `npm run build` — 60 pages, 0 errors
- `node scripts/check-links.mjs` — 3623 links, 0 broken
