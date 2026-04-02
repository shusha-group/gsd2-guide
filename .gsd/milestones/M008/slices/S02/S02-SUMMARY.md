---
id: S02
parent: M008
milestone: M008
provides:
  - 5-section sidebar structure in astro.config.mjs: Start Here, Solo Builder's Guide, Recipes, Commands, Learn More
  - 0 broken links baseline (20,661 links checked)
  - collapsed:true on Prompts group and all 4 sub-groups
requires:
  []
affects:
  - S03
  - S04
  - S05
  - S06
key_files:
  - astro.config.mjs
key_decisions:
  - Prompts group and all 4 sub-groups get collapsed:true
  - Deep Dives, How-to Guides, Reference items promoted to flat items inside Learn More (not sub-groups)
  - All link: values preserved exactly — only grouping structure changed
patterns_established:
  - Sidebar consolidation pattern: absorb sibling sections as flat items into a parent section rather than nested sub-groups, except for Prompts which retains sub-groups with collapsed:true
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M008/slices/S02/tasks/T01-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T13:19:00.617Z
blocker_discovered: false
---

# S02: Sidebar Restructure

**Rewrote astro.config.mjs sidebar from 10 top-level entries to exactly 5 sections (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More) with 0 broken links across 20,661 internal links.**

## What Happened

T01 replaced the entire sidebar array in astro.config.mjs. The previous structure had 10 top-level entries (Home, Getting Started, Solo Builder's Guide, Recipes, Commands, Deep Dives, How-to Guides, Reference, Prompts, Changelog). The new structure consolidates to exactly 5 sections per D074:

1. **Start Here** — absorbed the Home link plus all 7 Getting Started items (Is GSD Right for Me, Quick Reference, Writing a Good Brief, Cost Examples, Installation, Developing with GSD, Discussing a Milestone)
2. **Solo Builder's Guide** — unchanged (9 items)
3. **Recipes** — unchanged (13 items)  
4. **Commands** — unchanged (Commands Reference + 8 sub-groups)
5. **Learn More** — absorbed Deep Dives (4 flat items), How-to Guides (9 flat items), Reference (6 flat items), Prompts group with `collapsed: true` on the group and all 4 sub-groups, and Changelog as a direct link

All `link:` values were preserved exactly — only the grouping structure changed. No pages were created, moved, or deleted.

The task plan's verification script had a minor flaw: it used `aria-label="Sidebar"` but the built HTML uses `aria-label="Main"`. The executor adapted the check and confirmed identical sidebar content across homepage and inner pages.

Build verification: 148 pages built, 0 errors. Link check: 20,661 internal links, 0 broken. DOM inspection of built HTML confirmed 5 top-level `class="large"` span elements in correct order: Start Here → Solo Builder's Guide → Recipes → Commands → Learn More.

## Verification

npm run build: 148 pages, exit 0. npm run check-links: 20,661 links, 0 broken, exit 0. DOM inspection of dist/index.html confirmed 5 top-level sidebar section spans with class="large" in correct order.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

Task plan's verification script used aria-label="Sidebar" but built HTML uses aria-label="Main". Executor adapted the check accordingly.

## Known Limitations

None.

## Follow-ups

None. Downstream slices S03, S04, S05, S06 can now proceed — they all depend on S02's 5-section sidebar structure being in place.

## Files Created/Modified

- `astro.config.mjs` — Sidebar array rewritten from 10 top-level entries to 5 sections
