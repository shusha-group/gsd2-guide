---
id: T01
parent: S01
milestone: M006
provides:
  - src/content/docs/solo-guide/ directory with 9 MDX files (index + 8 section stubs)
  - "Solo Builder's Guide" sidebar group in astro.config.mjs (9 entries)
  - Build verified at 113 pages (104 + 9 new)
key_files:
  - src/content/docs/solo-guide/index.mdx
  - src/content/docs/solo-guide/why-gsd.mdx
  - src/content/docs/solo-guide/first-project.mdx
  - src/content/docs/solo-guide/brownfield.mdx
  - src/content/docs/solo-guide/daily-mix.mdx
  - src/content/docs/solo-guide/context-engineering.mdx
  - src/content/docs/solo-guide/controlling-costs.mdx
  - src/content/docs/solo-guide/when-things-go-wrong.mdx
  - src/content/docs/solo-guide/building-rhythm.mdx
  - astro.config.mjs
key_decisions:
  - none
patterns_established:
  - Solo-guide MDX files use .mdx extension and standard Starlight frontmatter (title + description only); index page imports CardGrid/LinkCard from @astrojs/starlight/components
  - Sidebar groups for hand-authored guide sections use /slug/ link format (no /gsd2-guide/ prefix); Starlight base config handles prefix automatically
observability_surfaces:
  - Build page count (npm run build 2>&1 | tail -5) — 113 confirms all 9 pages rendered
  - Pipeline contamination (diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json) — empty diff is healthy state
  - Solo-guide file count (ls src/content/docs/solo-guide/*.mdx | wc -l) — 9
  - Sidebar registration (grep -c "Solo Builder" astro.config.mjs) — 1
duration: ~10m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Create solo-guide directory, 9 MDX files, and sidebar group

**Created 9 MDX files in `src/content/docs/solo-guide/` and registered the "Solo Builder's Guide" sidebar group in `astro.config.mjs`; build passes at 113 pages with pipeline uncontaminated.**

## What Happened

Pre-flight first: added `## Observability / Diagnostics` to S01-PLAN.md (including a failure-path build-error check) and `## Observability Impact` to T01-PLAN.md as required by the observability gap flags.

Then created all 9 MDX files in one batch:
- `index.mdx` — substantive landing page importing `CardGrid` and `LinkCard` from `@astrojs/starlight/components`, with navigable links to all 8 sections
- 8 section stubs (`why-gsd.mdx`, `first-project.mdx`, `brownfield.mdx`, `daily-mix.mdx`, `context-engineering.mdx`, `controlling-costs.mdx`, `when-things-go-wrong.mdx`, `building-rhythm.mdx`) — each with valid frontmatter and a placeholder paragraph using Australian spelling (`behaviour`, `organisation`, `recognise`)

Added the sidebar group to `astro.config.mjs` by inserting before the closing `],` of the sidebar array (after the existing "Guides" group). Used exact 8-space indentation for the group object and 12-space for items entries, matching existing groups.

Build ran in ~8 seconds and reported exactly 113 pages — confirming all 9 new pages were discovered and rendered with no parse errors.

## Verification

All 5 slice-level verification checks passed in the first run:

1. `ls src/content/docs/solo-guide/*.mdx | wc -l` → **9** ✅
2. `npm run build 2>&1 | grep "pages"` → **113 pages** ✅
3. `diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json` → **no diff** ✅
4. `grep "solo-guide" src/content/docs/.generated-manifest.json` → **no output (exit 1)** ✅
5. `grep -c "Solo Builder" astro.config.mjs` → **1** ✅

Failure-path check also ran clean: `npm run build 2>&1 | grep -i "error\|warn" | grep -i "solo-guide"` → no output (exit 1).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `ls src/content/docs/solo-guide/*.mdx \| wc -l` | 0 (output: 9) | ✅ pass | <1s |
| 2 | `npm run build 2>&1 \| grep "pages"` | 0 (output: 113 pages) | ✅ pass | ~8s |
| 3 | `diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json` | 0 (no diff) | ✅ pass | <1s |
| 4 | `grep "solo-guide" src/content/docs/.generated-manifest.json` | 1 (no match) | ✅ pass | <1s |
| 5 | `grep -c "Solo Builder" astro.config.mjs` | 0 (output: 1) | ✅ pass | <1s |
| 6 | `npm run build 2>&1 \| grep -i "error\|warn" \| grep -i "solo-guide"` | 1 (no match) | ✅ pass | ~8s |

## Diagnostics

To inspect the state of this task's output at any time:
- **Page count:** `npm run build 2>&1 | grep "pages"` — should show 113
- **File inventory:** `ls src/content/docs/solo-guide/*.mdx` — lists all 9 files
- **Sidebar entry:** `grep -A 12 "Solo Builder" astro.config.mjs` — shows the full sidebar group
- **Pipeline safety:** `diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json` — empty diff is healthy
- **MDX parse errors:** `npm run build 2>&1 | grep -A5 "solo-guide"` — surfaces any parse/render errors scoped to new pages

## Deviations

None. Task executed exactly as planned.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/solo-guide/index.mdx` — new; landing page with CardGrid/LinkCard navigation
- `src/content/docs/solo-guide/why-gsd.mdx` — new; Section 1 stub
- `src/content/docs/solo-guide/first-project.mdx` — new; Section 2 stub
- `src/content/docs/solo-guide/brownfield.mdx` — new; Section 3 stub (uses Australian spelling: "behaviour")
- `src/content/docs/solo-guide/daily-mix.mdx` — new; Section 4 stub
- `src/content/docs/solo-guide/context-engineering.mdx` — new; Section 5 stub (uses Australian spelling: "recognise")
- `src/content/docs/solo-guide/controlling-costs.mdx` — new; Section 6 stub
- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — new; Section 7 stub
- `src/content/docs/solo-guide/building-rhythm.mdx` — new; Section 8 stub (uses Australian spelling: "organisation")
- `astro.config.mjs` — modified; added "Solo Builder's Guide" sidebar group with 9 entries before closing sidebar array `],`
- `.gsd/milestones/M006/slices/S01/S01-PLAN.md` — modified; added `## Observability / Diagnostics` section and failure-path verification check
- `.gsd/milestones/M006/slices/S01/tasks/T01-PLAN.md` — modified; added `## Observability Impact` section
