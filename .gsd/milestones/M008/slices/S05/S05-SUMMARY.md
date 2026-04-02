---
id: S05
parent: M008
milestone: M008
provides:
  - Site-wide prev/next pagination via Footer.astro
  - :::tip audience-bridging callouts on 7 pages (16 files total now have tips)
  - Next Steps section on quick-reference.md
requires:
  - slice: S02
    provides: 5-section sidebar structure providing navigation context for prev/next and cross-links
  - slice: S03
    provides: Consolidated content pages (control-your-costs, skills-extensions-agents) that receive callouts
affects:
  - S06
key_files:
  - src/components/Footer.astro
  - content/generated/docs/auto-mode.md
  - content/generated/docs/getting-started.md
  - content/generated/docs/configuration.md
  - src/content/docs/skills-extensions-agents.md
  - src/content/docs/recipes/control-your-costs.md
  - src/content/docs/is-gsd-right-for-me.md
  - src/content/docs/quick-reference.md
key_decisions:
  - Import Pagination from virtual:starlight/components/Pagination and render above custom footer markup
  - Appended callouts to end of each file rather than inserting mid-page to avoid disrupting existing section flow
patterns_established:
  - Starlight virtual module import pattern: use virtual:starlight/components/Pagination (not a relative path) and pass {...Astro.props} for pagination context
  - Audience-bridging callouts appended at end of page avoid disrupting existing content flow while still providing navigation cues
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M008/slices/S05/tasks/T01-SUMMARY.md
  - .gsd/milestones/M008/slices/S05/tasks/T02-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T19:37:05.303Z
blocker_discovered: false
---

# S05: Cross-linking & Wayfinding

**Restored site-wide prev/next pagination and added audience-bridging callouts to 7+ pages, bringing tip count from 6 to 16 and wiring a Next Steps section into quick-reference.md.**

## What Happened

Two tasks completed this slice cleanly. T01 fixed a gap in Footer.astro where the custom footer override had replaced Starlight's default without including the Pagination component. Adding the virtual import and rendering `<Pagination {...Astro.props} />` above the custom markup restored prev/next navigation across all pages — confirmed in both solo-guide/first-project and auto-mode pages. T02 added :::tip audience-bridging callouts to all 7 required pages, editing generated sources in content/generated/docs/ for auto-mode, getting-started, and configuration (as required by the generated-manifest constraint), and hand-authored files directly for the remaining four. A ## Next Steps section with 3 relevant links was added to quick-reference.md. Tip count rose from 6 to 16 (well above the ≥7 threshold). All 20,909 internal links pass, 150 pages build cleanly.

## Verification

npm run build: 0, 150 pages. npm run check-links: 0 broken / 20909 checked. grep -rl ':::tip' returned 16 (≥7 required). pagination-links present in dist/solo-guide/first-project/index.html and dist/auto-mode/index.html.

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

- `src/components/Footer.astro` — Added Pagination component import and render above custom footer markup
- `content/generated/docs/auto-mode.md` — Added :::tip audience-bridging callout linking solo builders to Solo Guide
- `content/generated/docs/getting-started.md` — Added :::tip audience-bridging callout linking solo builders to Solo Guide overview
- `content/generated/docs/configuration.md` — Added :::tip audience-bridging callout linking to recipes for common config tasks
- `src/content/docs/skills-extensions-agents.md` — Added :::tip audience-bridging callout linking to reference pages
- `src/content/docs/recipes/control-your-costs.md` — Added :::tip audience-bridging callout linking solo builders to Solo Guide cost page
- `src/content/docs/is-gsd-right-for-me.md` — Added :::tip audience-bridging callout linking to Solo Guide and Getting Started
- `src/content/docs/quick-reference.md` — Added ## Next Steps section with 3 relevant links and :::tip audience-bridging callout
