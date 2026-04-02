---
id: S05
parent: M007
milestone: M007
provides:
  - Sidebar with logical new-user flow
  - All M007 content (writing-a-good-brief, cost-examples) surfaced in navigation
  - Auto-mode prompts correctly grouped under Prompts not Commands
  - 0 broken links confirmed post-restructure
requires:
  []
affects:
  []
key_files:
  - astro.config.mjs
key_decisions:
  - gate-evaluate, reactive-execute, rethink inserted alphabetically into Prompts > Auto-mode Pipeline subgroup (removed from orphaned position in Commands group)
patterns_established:
  - (none)
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M007/slices/S05/tasks/T01-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T04:43:29.437Z
blocker_discovered: false
---

# S05: Navigation Polish

**Sidebar restructured for logical new-user flow: Getting Started first, 3 orphaned prompts moved to Auto-mode Pipeline, writing-a-good-brief and cost-examples surfaced; 148 pages, 0 broken links.**

## What Happened

S05 had a single task (T01): surgical edits to `astro.config.mjs` to restructure the Starlight sidebar. Three problems were fixed in one pass: (1) top-level groups were reordered so Getting Started appears before Solo Builder's Guide and Deep Dives — new users now see orientation content first; (2) Writing a Good Brief and Cost Examples (added in S04) were wired into Getting Started so they're discoverable without scrolling deep; (3) three auto-mode prompts (`gate-evaluate`, `reactive-execute`, `rethink`) that were orphaned at the bottom of the Commands group were removed from there and inserted alphabetically into Prompts > Auto-mode Pipeline where they semantically belong. The build produced 148 pages with 0 errors; 20,662 internal links checked with 0 broken.

## Verification

npm run build: 148 pages, 0 errors. npm run check-links: 20,662 links, 0 broken. Inline node position check confirmed gate-evaluate is in Prompts (not Commands). grep confirmed writing-a-good-brief and cost-examples present in astro.config.mjs.

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

- `astro.config.mjs` — Reordered top-level sidebar groups (Getting Started first), added writing-a-good-brief and cost-examples to Getting Started, moved gate-evaluate/reactive-execute/rethink from Commands to Prompts > Auto-mode Pipeline
