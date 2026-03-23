# Quick Task: links on this page do not seem to be working https://shusha-group.github.io/gsd2-guide/solo-guide/

**Date:** 2026-03-23
**Branch:** gsd/quick/12-links-on-this-page-do-not-seem-to-be-wor

## What Changed
- Fixed all 8 broken `LinkCard` hrefs in the Solo Builder's Guide index page
- Changed `../why-gsd/`, `../first-project/`, etc. → `./why-gsd/`, `./first-project/`, etc.
- Root cause: `../` navigates to the *parent* directory (`/gsd2-guide/`), so links resolved to `/gsd2-guide/why-gsd/` (404) instead of `/gsd2-guide/solo-guide/why-gsd/` (correct). Since `index.mdx` is inside `solo-guide/`, the sibling pages are in the *same* directory — `./` is the correct prefix.

## Files Modified
- `src/content/docs/solo-guide/index.mdx` — updated 8 LinkCard href values from `../` to `./`

## Verification
- Confirmed 404 on `https://shusha-group.github.io/gsd2-guide/why-gsd/` (what `../why-gsd/` resolved to)
- Confirmed 200 on `https://shusha-group.github.io/gsd2-guide/solo-guide/why-gsd/` (correct target)
- Ran `npm run build` — succeeded with 113 pages, no errors
- Verified built HTML `dist/solo-guide/index.html` has all 8 hrefs using `./` prefix (e.g. `href="./why-gsd/"`)
