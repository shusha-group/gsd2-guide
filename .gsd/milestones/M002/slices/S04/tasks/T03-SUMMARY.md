---
id: T03
parent: S04
milestone: M002
provides:
  - 6 recipe sidebar entries wired in astro.config.mjs, all recipes navigable and indexed
key_files:
  - astro.config.mjs
key_decisions:
  - Used short action-oriented labels (e.g., "Fix a Bug", "Handle UAT Failures") without "Recipe:" prefix per task plan guidance
patterns_established:
  - Recipe sidebar entries go before existing guide entries in the Recipes section
observability_surfaces:
  - "grep -c \"'/recipes/\" astro.config.mjs" returns 6 — sidebar entry count matches recipe page count
  - "ls dist/recipes/*/index.html | wc -l" returns 6 — all recipe pages in built output
  - "node scripts/check-links.mjs" — 0 broken links across all 3558 internal links
duration: 5m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T03: Wire sidebar entries and verify full build

**Added 6 recipe sidebar entries to astro.config.mjs and verified full build, link check, and Pagefind indexing — all 6 recipes discoverable and indexed.**

## What Happened

Added 6 new sidebar entries to the Recipes section in `astro.config.mjs`, positioned before the existing 8 guide entries. The entries use short action-oriented labels: Fix a Bug, Small Change, New Milestone, Handle UAT Failures, Error Recovery, Working in Teams.

Ran the full verification suite: build exits 0, link check finds 0 broken links across 3558 internal links, all 6 recipe pages appear in `dist/recipes/*/index.html`, and Pagefind search index includes them.

## Verification

All slice-level verification checks pass:

- `npm run build` — exits 0, 60 pages built in 4.69s ✓
- `node scripts/check-links.mjs` — 0 broken links (3558 checked) ✓
- `ls src/content/docs/recipes/*.mdx | wc -l` — returns 6 ✓
- `grep -c "'/recipes/" astro.config.mjs` — returns 6 ✓
- `ls dist/recipes/*/index.html | wc -l` — returns 6 ✓
- `grep -l 'mermaid' src/content/docs/recipes/*.mdx | wc -l` — returns 6 ✓
- `ls dist/pagefind/` — search index exists with entry JSON, WASM, and JS files ✓

## Diagnostics

- **Sidebar count:** `grep -c "'/recipes/" astro.config.mjs` should return 6. If it doesn't match the number of recipe MDX files, a page exists but isn't navigable.
- **Build output:** Each recipe produces `dist/recipes/<slug>/index.html`. Missing files mean MDX compilation failed — check `npm run build` stderr.
- **Link integrity:** `node scripts/check-links.mjs` prints broken links with source file and target path if any exist.
- **Pagefind:** `dist/pagefind/` directory and `pagefind-entry.json` confirm search indexing is working.

## Deviations

None. Task plan specified short labels without "Recipe:" prefix and the slice plan's T03 description said to use "Recipe:" prefix — followed the authoritative task plan which was more specific and aligned with better UX.

## Known Issues

None.

## Files Created/Modified

- `astro.config.mjs` — Added 6 recipe sidebar entries to the Recipes section, before existing guide entries
- `.gsd/milestones/M002/slices/S04/S04-PLAN.md` — Added failure-path diagnostic to slice verification section (pre-flight fix)
- `.gsd/milestones/M002/slices/S04/tasks/T03-PLAN.md` — Added Observability Impact section (pre-flight fix)
