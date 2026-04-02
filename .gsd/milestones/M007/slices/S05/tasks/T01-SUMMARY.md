---
id: T01
parent: S05
milestone: M007
provides: []
requires: []
affects: []
key_files: ["astro.config.mjs"]
key_decisions: ["gate-evaluate, reactive-execute, rethink inserted alphabetically into Auto-mode Pipeline subgroup"]
patterns_established: []
drill_down_paths: []
observability_surfaces: []
duration: ""
verification_result: "npm run build (148 pages, 0 errors), npm run check-links (20,662 links, 0 broken), inline node check confirming gate-evaluate is correctly in Prompts not Commands."
completed_at: 2026-04-02T04:42:31.082Z
blocker_discovered: false
---

# T01: Sidebar restructured: Getting Started first, 3 orphaned prompts moved to Auto-mode Pipeline, writing-a-good-brief and cost-examples added; 148 pages build clean with 0 broken links

> Sidebar restructured: Getting Started first, 3 orphaned prompts moved to Auto-mode Pipeline, writing-a-good-brief and cost-examples added; 148 pages build clean with 0 broken links

## What Happened
---
id: T01
parent: S05
milestone: M007
key_files:
  - astro.config.mjs
key_decisions:
  - gate-evaluate, reactive-execute, rethink inserted alphabetically into Auto-mode Pipeline subgroup
duration: ""
verification_result: passed
completed_at: 2026-04-02T04:42:31.083Z
blocker_discovered: false
---

# T01: Sidebar restructured: Getting Started first, 3 orphaned prompts moved to Auto-mode Pipeline, writing-a-good-brief and cost-examples added; 148 pages build clean with 0 broken links

**Sidebar restructured: Getting Started first, 3 orphaned prompts moved to Auto-mode Pipeline, writing-a-good-brief and cost-examples added; 148 pages build clean with 0 broken links**

## What Happened

Made three surgical edits to astro.config.mjs: reordered top-level groups so Getting Started appears before Solo Builder's Guide and Deep Dives; added Writing a Good Brief and Cost Examples to Getting Started; removed gate-evaluate, reactive-execute, and rethink from their orphaned position inside the Commands group; added them alphabetically into Prompts > Auto-mode Pipeline.

## Verification

npm run build (148 pages, 0 errors), npm run check-links (20,662 links, 0 broken), inline node check confirming gate-evaluate is correctly in Prompts not Commands.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` | 0 | ✅ pass | 5600ms |
| 2 | `npm run check-links` | 0 | ✅ pass | 3000ms |
| 3 | `grep + node position check` | 0 | ✅ pass | 100ms |


## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `astro.config.mjs`


## Deviations
None.

## Known Issues
None.
