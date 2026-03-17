---
estimated_steps: 5
estimated_files: 2
---

# T01: Build broken internal link checker

**Slice:** S06 — Update pipeline & GitHub Pages deployment
**Milestone:** M001

## Description

Create `scripts/check-links.mjs` — a post-build broken internal link checker that scans all HTML files in `dist/`, extracts internal `href` attributes pointing to the `/gsd2-guide/` base path, resolves them against the `dist/` filesystem, and reports any broken links. This satisfies R021 (broken link detection before deployment). Uses only Node.js built-ins — no npm dependencies.

**Critical constraint:** The `dist/` directory does NOT contain a `gsd2-guide/` subdirectory. When `base: '/gsd2-guide'` is set in `astro.config.mjs`, Astro applies the prefix at serve time, not in the filesystem. So an href like `/gsd2-guide/getting-started/` must be resolved by stripping `/gsd2-guide` prefix → `/getting-started/` → `dist/getting-started/index.html`.

Add `"check-links": "node scripts/check-links.mjs"` to package.json scripts.

## Steps

1. Create `scripts/check-links.mjs` as an ESM module using `node:fs`, `node:path`, and `node:url`
2. Recursively find all `.html` files in `dist/` using `fs.readdirSync` with `{recursive: true}`
3. For each HTML file, extract all `href="..."` attribute values using a regex like `/href="([^"]+)"/g`
4. Filter to internal links: keep only hrefs starting with `/gsd2-guide/`. Skip external links (http/https), anchor-only links (`#...`), and non-page assets (links to `_astro/` or `pagefind/`)
5. For each internal link:
   - Strip the `/gsd2-guide` prefix (e.g., `/gsd2-guide/getting-started/` → `/getting-started/`)
   - Strip any hash fragment (`#section` → removed)
   - Strip query strings if present
   - If the path ends with `/`, resolve to `dist/{path}index.html`
   - If the path has no extension, try `dist/{path}/index.html` and `dist/{path}.html`
   - If the path has an extension, resolve to `dist/{path}` directly (for `.css`, `.js`, `.svg`, etc.)
   - Check if the resolved file exists on disk
6. Collect all broken links with their source file and target
7. Report: total links checked, total broken. If broken > 0, print each broken link with source file, exit 1. If broken == 0, print success message with link count, exit 0
8. Add `"check-links": "node scripts/check-links.mjs"` to `package.json` scripts

## Must-Haves

- [ ] Scans all HTML files in dist/ recursively
- [ ] Extracts href attributes matching `/gsd2-guide/` prefix
- [ ] Strips `/gsd2-guide` prefix before resolving against dist/ filesystem
- [ ] Handles trailing slashes (resolves to index.html)
- [ ] Strips hash fragments before file resolution
- [ ] Skips external links, anchor-only links, and asset paths (_astro/, pagefind/)
- [ ] Exits 0 with link count when all links resolve
- [ ] Exits 1 with broken link report when any link is broken
- [ ] Uses only Node.js built-ins (no npm deps)
- [ ] `npm run check-links` works

## Verification

- `npm run build && npm run check-links` exits 0
- Output reports 18000+ links checked (the site has 134 HTML pages with many internal links)
- Output reports 0 broken internal links (or identifies only known false positives like missing favicon)
- The script runs in under 2 seconds (it's scanning local files, not making network requests)

## Inputs

- `dist/` directory — produced by `npm run build` (must exist before running the checker)
- Knowledge: `dist/` does NOT have `gsd2-guide/` subdirectory; base path is applied at serve time
- Knowledge: Internal links in HTML use `/gsd2-guide/` prefix (from `astro.config.mjs` base setting)

## Expected Output

- `scripts/check-links.mjs` — ~60-80 line Node.js script for broken link detection
- `package.json` — updated with `"check-links"` script entry

## Observability Impact

- **New signal:** `npm run check-links` outputs `[link-check]`-prefixed lines with total links checked and broken count
- **Inspection surface:** Run `npm run check-links` standalone to validate dist/ internal links at any time after build
- **Failure state:** Exit code 1 with per-link broken report (source file → target href → resolved path) when broken links detected
- **Downstream consumption:** Update script (T02) and CI workflow (T03) invoke this script and surface its output
