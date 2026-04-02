---
id: S04
parent: M008
milestone: M008
provides:
  - Homepage with 3 persona cards linking to solo-guide, getting-started, and commands
  - Common Tasks section with 4 recipe LinkCards
  - Go Deeper section with 4 architecture/reference LinkCards
  - How GSD Works mermaid diagram retained
requires:
  []
affects:
  - S05
  - S06
key_files:
  - src/content/docs/index.mdx
key_decisions:
  - Used Card+CardGrid for persona cards (rich body content with description + CTA link) vs LinkCard for Common Tasks and Go Deeper sections (single-link navigation items)
patterns_established:
  - Persona card pattern: Card+CardGrid with description prose + markdown CTA link in the body — allows richer content than LinkCard while still being a navigation element
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M008/slices/S04/tasks/T01-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T13:35:36.604Z
blocker_discovered: false
---

# S04: Homepage Rewrite

**Rewrote the homepage with persona cards (Choose Your Starting Point), retained How GSD Works mermaid diagram, and added Common Tasks + Go Deeper LinkCard sections — all links verified.**

## What Happened

Single-task slice. T01 rewrote `src/content/docs/index.mdx` from scratch: added `Card` to the existing import alongside `CardGrid` and `LinkCard`, replaced the old "Learn GSD" section with "Choose Your Starting Point" (3 persona `Card` components in a `CardGrid` — Solo Business Builder, Developer New to AI Coding, Experienced AI Developer), kept the "How GSD Works" mermaid diagram untouched, replaced "Commands" + "Recipes" with "Common Tasks" (4 LinkCards: Fix a Bug, Small Change, Error Recovery, Developing with GSD), and replaced "Reference & Guides" with "Go Deeper" (4 LinkCards: Architecture, Auto Mode, Quick Reference Cards, All Commands). Hero actions and `template: doc` frontmatter were left unchanged. All hrefs use the `/gsd2-guide/` base-path prefix. Build produced 150 pages (exit 0) and link checker verified 20,639 internal links with 0 broken.

## Verification

npm run build → exit 0, 150 pages built. npm run check-links → exit 0, 20,639 links, 0 broken.

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

- `src/content/docs/index.mdx` — Rewrote homepage: added persona cards (Choose Your Starting Point), retained How GSD Works mermaid, replaced old sections with Common Tasks and Go Deeper LinkCards
