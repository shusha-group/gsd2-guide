---
id: T01
parent: S06
milestone: M001
provides:
  - scripts/check-links.mjs — post-build broken internal link checker
  - "check-links" npm script entry
key_files:
  - scripts/check-links.mjs
  - package.json
key_decisions:
  - Only check <a> tag hrefs, not <link> tags — avoids false positives from favicon.svg and sitemap-index.xml which are metadata, not navigation links
patterns_established:
  - Link checker uses [link-check] prefix for structured console output
  - Base path stripping pattern: /gsd2-guide/path/ → /path/ → dist/path/index.html
observability_surfaces:
  - "npm run check-links" — standalone link validation with structured output
  - Exit code 0/1 for CI integration
  - Per-link broken report with source file → href → resolved path on failure
duration: 8m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Build broken internal link checker

**Created `scripts/check-links.mjs` — scans 134 HTML files in dist/, checks 17840 internal `<a>` links against the filesystem, exits 0 with count on success, exits 1 with per-link report on failure.**

## What Happened

Created an ESM Node.js script using only built-ins (`node:fs`, `node:path`) that:

1. Recursively finds all `.html` files in `dist/`
2. Extracts `href` attributes from `<a>` tags only (not `<link>` tags) using regex `/<a\s[^>]*?href="([^"]+)"/gi`
3. Filters to internal links starting with `/gsd2-guide/`, skipping `_astro/` and `pagefind/` asset paths
4. Strips the `/gsd2-guide` base path prefix, hash fragments, and query strings
5. Resolves against the `dist/` filesystem: trailing slash → `index.html`, no extension → try `dir/index.html` then `.html`, with extension → direct file
6. Reports total links checked and broken count with `[link-check]` prefix

Added `"check-links": "node scripts/check-links.mjs"` to `package.json` scripts.

**Design choice:** Only `<a>` tag hrefs are checked, not `<link>` tags. This avoids false positives from `<link rel="shortcut icon" href="/gsd2-guide/favicon.svg">` (Starlight default, no file exists) and `<link rel="sitemap">` — these are metadata/asset references, not user-navigable links. The count difference is exactly 268 (134 pages × 2 `<link>` tags each).

## Verification

- `npm run build && npm run check-links` → exit 0 ✅
- Reports 17840 internal links checked, 0 broken ✅
- Script runs in 0.12s (well under 2s target) ✅
- Injected broken link (`/gsd2-guide/nonexistent-page/`) → exit 1 with structured report showing source, href, resolved path ✅
- `npm run check-links` works via npm script ✅
- `find dist/ -name "*.html" | wc -l` → 134 ✅

### Slice verification (partial — T01 of 3):
- ✅ `npm run build && node scripts/check-links.mjs` exits 0, reports 17840 links checked
- ⬜ `node scripts/update.mjs` — not yet built (T02)
- ⬜ `npm run update` — not yet built (T02)
- ⬜ Update script output — not yet built (T02)
- ⬜ `.github/workflows/deploy.yml` — not yet built (T03)
- ✅ `find dist/ -name "*.html" | wc -l` returns 134
- ✅ Link checker reports 0 broken internal page links
- ✅ Link checker exits 1 with structured broken-link report when broken link exists

## Diagnostics

- **Inspect:** `npm run check-links` after any build to validate internal links
- **Failure state:** Exit 1 with per-link report: source file, original href, resolved filesystem path
- **Output format:** `[link-check] ✅ N internal links checked — 0 broken` or `[link-check] ❌ N broken internal link(s) found out of M checked`

## Deviations

- Plan estimated 18000+ links; actual is 17840. Difference (268) is from correctly scoping to `<a>` tags only — `<link>` tags for favicon.svg (134) and sitemap-index.xml (134) are not navigable links and were excluded by design rather than by a skip-list hack.

## Known Issues

- `favicon.svg` is referenced in every page's `<head>` via `<link rel="shortcut icon">` but the file doesn't exist in `dist/` or anywhere in the project. This is a Starlight default — harmless for the link checker (we skip `<link>` tags) but browsers will 404 on it. Could be fixed by adding a `public/favicon.svg` file.

## Files Created/Modified

- `scripts/check-links.mjs` — new post-build broken internal link checker (80 lines)
- `package.json` — added `"check-links": "node scripts/check-links.mjs"` to scripts
- `.gsd/milestones/M001/slices/S06/S06-PLAN.md` — added failure-path verification step (pre-flight fix)
- `.gsd/milestones/M001/slices/S06/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
