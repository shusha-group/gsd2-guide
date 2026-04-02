---
id: S02
parent: M007
milestone: M007
provides:
  - Changelog page with 768 clickable GitHub issue/PR links
  - Changelog Highlights page at /changelog-highlights/ with 18 per-release summaries
  - generate-highlights.mjs script wired into update pipeline
requires:
  []
affects:
  - S05
key_files:
  - src/components/ReleaseEntry.astro
  - scripts/generate-highlights.mjs
  - content/generated/changelog-highlights.json
  - src/content/docs/changelog-highlights.mdx
  - astro.config.mjs
  - scripts/update.mjs
key_decisions:
  - Used negative lookbehind in regex to avoid double-linking anchors — pattern kept in code, not prose, to avoid JSON escape issues
  - Heuristic highlights summary (first item from added/changed/fixed) requires no LLM and produces consistent factual output
  - Skipped releases where all arrays empty and body under 80 chars to filter stub releases
patterns_established:
  - Regex patterns in task summaries must be wrapped in backticks or code blocks — never embedded as raw prose in GSD artifact fields, to avoid JSON serialization failures on backslash sequences
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M007/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M007/slices/S02/tasks/T02-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T01:12:29.142Z
blocker_discovered: false
---

# S02: Changelog Improvements

**Added 768 clickable GitHub issue/PR links to the changelog and created a new Changelog Highlights page with 18 per-release summaries.**

## What Happened

T01 added a second regex pass to ReleaseEntry.astro that converts bare #NNN references in changelog HTML into clickable links pointing to github.com/gsd-build/gsd-2/issues/NNN. A negative lookbehind prevents double-linking text already inside anchor tags or URLs. The build produced 768 matching links across the changelog page.

T02 created scripts/generate-highlights.mjs, which reads content/generated/releases.json and writes content/generated/changelog-highlights.json with heuristic summaries (first item from added/changed/fixed arrays joined with a dot separator). 18 of 88 releases had structured content. The MDX page at src/content/docs/changelog-highlights.mdx renders accent-bordered cards per release. A sidebar entry was added above Changelog in astro.config.mjs. The generator was wired into scripts/update.mjs (not root update.mjs — correction made during execution) after the extract step. Build confirmed 143 pages, 0 errors; dist/changelog-highlights/index.html present and correct.

## Verification

T01: npm run build then grep-counted github.com/gsd-build/gsd-2/issues/ occurrences in dist/changelog/index.html — 768 matches. T02: node scripts/generate-highlights.mjs (18 highlights written, exit 0), npm run build (143 pages, exit 0), test -f dist/changelog-highlights/index.html (exit 0), grep for Changelog Highlights in that file (exit 0).

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

update.mjs lives at scripts/update.mjs, not the root-level path stated in the T02 plan. Corrected during execution with no impact on outcome.

## Known Limitations

Highlights are heuristic — first item from each of added/changed/fixed. Releases with no structured arrays (70 of 88) have no highlight entry. The highlights page is static; it will not update until npm run update re-runs the generator.

## Follow-ups

None.

## Files Created/Modified

- `src/components/ReleaseEntry.astro` — Added regex pass to linkify #NNN references to GitHub issues/PRs
- `scripts/generate-highlights.mjs` — New script: reads releases.json, writes changelog-highlights.json with heuristic summaries
- `content/generated/changelog-highlights.json` — Generated: 18 per-release highlight entries
- `src/content/docs/changelog-highlights.mdx` — New page: renders per-release highlights as accent-bordered cards
- `astro.config.mjs` — Added Changelog Highlights sidebar entry above Changelog
- `scripts/update.mjs` — Wired generate-highlights step after extract in update pipeline
