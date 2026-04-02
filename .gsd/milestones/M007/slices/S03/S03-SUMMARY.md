---
id: S03
parent: M007
milestone: M007
provides:
  - how-auto-mode-works.mdx deep-dive page
  - gsd-directory.mdx deep-dive page
  - v1-to-v2.mdx deep-dive page
  - Deep Dives sidebar group in astro.config.mjs
  - Cross-reference subsections in context-engineering, controlling-costs, building-rhythm solo-guide pages
requires:
  []
affects:
  - S05
key_files:
  - src/content/docs/how-auto-mode-works.mdx
  - src/content/docs/gsd-directory.mdx
  - src/content/docs/v1-to-v2.mdx
  - astro.config.mjs
  - src/content/docs/solo-guide/context-engineering.mdx
  - src/content/docs/solo-guide/controlling-costs.mdx
  - src/content/docs/solo-guide/building-rhythm.mdx
key_decisions:
  - Deep Dives sidebar group placed between Solo Builder's Guide and Getting Started
  - Steps component for 12-phase pipeline, CardGrid for verification ladder in how-auto-mode-works.mdx
  - v1-to-v2 page covers philosophy comparison only (not migration steps) — migration steps are in the generated migration.md
patterns_established:
  - Deep-dive pages live at src/content/docs/ root (not inside solo-guide/) and link to generated reference pages with ../../slug/ format
  - Cross-reference subsections appended to solo-guide pages before the final section marker line
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M007/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M007/slices/S03/tasks/T02-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T04:31:53.879Z
blocker_discovered: false
---

# S03: Content Consolidation

**Added three deep-dive pages (auto mode, .gsd/ directory, v1→v2) and wired cross-reference subsections into three solo-guide pages; build passes at 146 pages with 0 broken links.**

## What Happened

S03 delivered the "Content Consolidation" goal in two tasks. T01 created three hand-authored MDX deep-dive pages: `how-auto-mode-works.mdx` (12-phase pipeline breakdown + verification ladder), `gsd-directory.mdx` (annotated FileTree of the .gsd/ directory with human-vs-machine-generated classification), and `v1-to-v2.mdx` (narrative philosophy comparison, not migration steps). All three were registered in a new "Deep Dives" sidebar group in astro.config.mjs placed between the Solo Builder's Guide and Getting Started for logical reading order. T02 appended cross-reference subsections to three existing solo-guide pages: a "Preferences" subsection in context-engineering.mdx linking to configuration and how-auto-mode-works, a "Token Optimisation Deep Dive" subsection in controlling-costs.mdx linking to token-optimization, and a "Git Strategy" subsection in building-rhythm.mdx linking to git-strategy, gsd-directory, and v1-to-v2. Both tasks verified clean with npm run build (146 pages) and npm run check-links (20092 links, 0 broken).

## Verification

npm run build exits 0 (146 pages built). npm run check-links exits 0 with 20092 internal links checked, 0 broken. All 3 new MDX pages exist with valid frontmatter. grep -c returns 3 matches for the new page slugs in astro.config.mjs. Cross-reference subsections confirmed in all 3 solo-guide pages.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `src/content/docs/how-auto-mode-works.mdx` — New deep-dive page: 12-phase auto mode breakdown + verification ladder
- `src/content/docs/gsd-directory.mdx` — New deep-dive page: annotated .gsd/ directory structure with FileTree
- `src/content/docs/v1-to-v2.mdx` — New deep-dive page: v1 vs v2 philosophy comparison
- `astro.config.mjs` — Added Deep Dives sidebar group with 3 new page entries
- `src/content/docs/solo-guide/context-engineering.mdx` — Appended Preferences cross-reference subsection
- `src/content/docs/solo-guide/controlling-costs.mdx` — Appended Token Optimisation Deep Dive cross-reference subsection
- `src/content/docs/solo-guide/building-rhythm.mdx` — Appended Git Strategy cross-reference subsection
