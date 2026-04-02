---
id: T01
parent: S02
milestone: M008
provides: []
requires: []
affects: []
key_files: ["astro.config.mjs"]
key_decisions: ["Prompts group and all 4 sub-groups get collapsed:true", "Deep Dives, How-to Guides, Reference items promoted to flat items inside Learn More"]
patterns_established: []
drill_down_paths: []
observability_surfaces: []
duration: ""
verification_result: "npm run build passed (148 pages, no errors). npm run check-links passed (20661 links, 0 broken). DOM inspection of built HTML confirmed 5 top-level summary elements in correct order. Task plan's verification script had a minor flaw (aria-label="Sidebar" vs actual "Main") — adapted check confirmed identical sidebar content."
completed_at: 2026-04-02T13:17:40.041Z
blocker_discovered: false
---

# T01: Rewrote astro.config.mjs sidebar from 10 top-level entries to exactly 5 sections (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More) with 0 broken links

> Rewrote astro.config.mjs sidebar from 10 top-level entries to exactly 5 sections (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More) with 0 broken links

## What Happened
---
id: T01
parent: S02
milestone: M008
key_files:
  - astro.config.mjs
key_decisions:
  - Prompts group and all 4 sub-groups get collapsed:true
  - Deep Dives, How-to Guides, Reference items promoted to flat items inside Learn More
duration: ""
verification_result: passed
completed_at: 2026-04-02T13:17:40.041Z
blocker_discovered: false
---

# T01: Rewrote astro.config.mjs sidebar from 10 top-level entries to exactly 5 sections (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More) with 0 broken links

**Rewrote astro.config.mjs sidebar from 10 top-level entries to exactly 5 sections (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More) with 0 broken links**

## What Happened

Replaced the entire sidebar array in astro.config.mjs. Start Here absorbed the Home link + 7 Getting Started items. Solo Builder's Guide and Recipes are unchanged. Commands is unchanged. Learn More absorbed Deep Dives (4 flat items), How-to Guides (9 flat items), Reference (6 flat items), Prompts group with collapsed:true on group and all 4 sub-groups, and Changelog as a direct link. All link: values preserved exactly.

## Verification

npm run build passed (148 pages, no errors). npm run check-links passed (20661 links, 0 broken). DOM inspection of built HTML confirmed 5 top-level summary elements in correct order. Task plan's verification script had a minor flaw (aria-label="Sidebar" vs actual "Main") — adapted check confirmed identical sidebar content.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` | 0 | ✅ pass | 6700ms |
| 2 | `npm run check-links` | 0 | ✅ pass | 3100ms |
| 3 | `node -e DOM sidebar sections check` | 0 | ✅ pass | 200ms |


## Deviations

Verification script in plan used aria-label=\"Sidebar\" but built HTML uses aria-label=\"Main\". Adapted check to use correct attribute.

## Known Issues

None.

## Files Created/Modified

- `astro.config.mjs`


## Deviations
Verification script in plan used aria-label=\"Sidebar\" but built HTML uses aria-label=\"Main\". Adapted check to use correct attribute.

## Known Issues
None.
