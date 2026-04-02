---
id: S01
parent: M008
milestone: M008
provides:
  - Homepage sidebar is identical to inner page sidebars — S02 sidebar restructure will apply uniformly across the entire site including the homepage
requires:
  []
affects:
  - S02
key_files:
  - src/content/docs/index.mdx
key_decisions:
  - Homepage uses template:doc (not splash), ensuring sidebar parity with all inner pages
patterns_established:
  - Sidebar parity between homepage and inner pages is achieved solely by template:doc frontmatter — no custom component overrides needed
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M008/slices/S01/tasks/T01-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T13:13:17.534Z
blocker_discovered: false
---

# S01: Homepage Nav Fix

**Confirmed homepage sidebar matches inner page sidebars exactly by verifying template:doc in index.mdx frontmatter; R084 validated.**

## What Happened

S01 was a verification slice, not a build slice. The fix itself (switching src/content/docs/index.mdx from template:splash to template:doc) had already been applied in a prior quick task. T01 confirmed the fix was complete by: (1) grepping for template:doc in the frontmatter, (2) running npm run build (exit 0, 148 pages), (3) diffing the sidebar HTML between dist/index.html and dist/getting-started/index.html after stripping aria-current attributes — identical result, and (4) running npm run check-links (exit 0, 0 broken links). No code changes were needed; the slice is purely confirmatory.

## Verification

All four checks passed: grep for 'template: doc' in index.mdx (exit 0), npm run build (exit 0, 148 pages), sidebar diff between homepage and inner page (identical after stripping aria-current), npm run check-links (exit 0, 0 broken).

## Requirements Advanced

None.

## Requirements Validated

- R084 — npm run build exits 0 (148 pages), sidebar HTML diff between dist/index.html and dist/getting-started/index.html is identical after stripping aria-current, npm run check-links exits 0 (0 broken links)

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None. The fix was pre-existing; S01 confirmed it rather than implementing it.

## Known Limitations

None.

## Follow-ups

None. S02 (Sidebar Restructure) can proceed — the homepage now uses template:doc and will reflect all sidebar changes made in S02 automatically.

## Files Created/Modified

- `src/content/docs/index.mdx` — Already had template:doc set; no changes made in this slice
