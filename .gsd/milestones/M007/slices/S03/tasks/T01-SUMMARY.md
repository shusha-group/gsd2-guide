---
id: T01
parent: S03
milestone: M007
provides: []
requires: []
affects: []
key_files: ["src/content/docs/how-auto-mode-works.mdx", "src/content/docs/gsd-directory.mdx", "src/content/docs/v1-to-v2.mdx", "astro.config.mjs"]
key_decisions: ["Deep Dives sidebar group placed between Solo Builder's Guide and Getting Started for logical reading order", "Used Steps component for 12-phase pipeline and CardGrid for verification ladder to match Starlight conventions"]
patterns_established: []
drill_down_paths: []
observability_surfaces: []
duration: ""
verification_result: "npm run build exits 0 (146 pages built). npm run check-links exits 0 with 0 broken links across 20092 internal links checked."
completed_at: 2026-04-02T04:28:43.442Z
blocker_discovered: false
---

# T01: Created three hand-authored deep-dive pages (auto mode, .gsd/ directory, v1→v2 comparison) and wired them into a new Deep Dives sidebar group.

> Created three hand-authored deep-dive pages (auto mode, .gsd/ directory, v1→v2 comparison) and wired them into a new Deep Dives sidebar group.

## What Happened
---
id: T01
parent: S03
milestone: M007
key_files:
  - src/content/docs/how-auto-mode-works.mdx
  - src/content/docs/gsd-directory.mdx
  - src/content/docs/v1-to-v2.mdx
  - astro.config.mjs
key_decisions:
  - Deep Dives sidebar group placed between Solo Builder's Guide and Getting Started for logical reading order
  - Used Steps component for 12-phase pipeline and CardGrid for verification ladder to match Starlight conventions
duration: ""
verification_result: passed
completed_at: 2026-04-02T04:28:43.444Z
blocker_discovered: false
---

# T01: Created three hand-authored deep-dive pages (auto mode, .gsd/ directory, v1→v2 comparison) and wired them into a new Deep Dives sidebar group.

**Created three hand-authored deep-dive pages (auto mode, .gsd/ directory, v1→v2 comparison) and wired them into a new Deep Dives sidebar group.**

## What Happened

Created how-auto-mode-works.mdx (12-phase pipeline with Steps + CardGrid, verification ladder, auto vs guided guidance), gsd-directory.mdx (annotated FileTree, human-vs-generated table, project memory explanation), and v1-to-v2.mdx (philosophy comparison, three core v2 ideas, key differences table). Added Deep Dives sidebar group in astro.config.mjs between Solo Builder's Guide and Getting Started. All three pages build cleanly and all 20092 internal links pass.

## Verification

npm run build exits 0 (146 pages built). npm run check-links exits 0 with 0 broken links across 20092 internal links checked.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -c 'how-auto-mode-works\|gsd-directory\|v1-to-v2' astro.config.mjs` | 0 | ✅ pass | 50ms |
| 2 | `npm run build` | 0 | ✅ pass | 7600ms |
| 3 | `npm run check-links` | 0 | ✅ pass | 2700ms |


## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/how-auto-mode-works.mdx`
- `src/content/docs/gsd-directory.mdx`
- `src/content/docs/v1-to-v2.mdx`
- `astro.config.mjs`


## Deviations
None.

## Known Issues
None.
