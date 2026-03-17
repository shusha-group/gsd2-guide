---
id: S04
parent: M003
milestone: M003
provides:
  - 7-step async `npm run update` pipeline wiring S01 diff detection, S02 LLM regeneration, and S03 command management into a single command
  - Cost/timing reporting for regeneration (per-page status, token counts, $3/MTok input + $15/MTok output estimates)
  - Graceful degradation without ANTHROPIC_API_KEY (skip regeneration, build with existing content)
  - isDirectRun guard pattern for safe ESM imports without side effects
  - 14 integration tests covering pipeline orchestration
requires:
  - slice: S01
    provides: diff-sources.mjs (detectChanges, resolveStalePages), page-source-map.json, stale-pages.json boundary contract
  - slice: S02
    provides: regenerate-page.mjs (regenerateStalePages) with Claude API integration and quality prompt template
  - slice: S03
    provides: manage-pages.mjs (detectNewAndRemovedCommands, createNewPages, removePages) for command lifecycle
affects: []
key_files:
  - scripts/update.mjs
  - tests/update-pipeline.test.mjs
  - src/components/ReleaseEntry.astro
  - tests/page-map.test.mjs
key_decisions:
  - Export steps/functions directly from update.mjs with isDirectRun guard (avoid separate orchestration module)
  - Fix broken links at source (ReleaseEntry.astro commandSlugs) rather than adding allowlist to check-links.mjs (D049)
  - Update test expectations to reflect current state (40 pages, 25 commands) rather than leaving as known failures
patterns_established:
  - Pipeline fn steps can be sync or async — the loop uses `await step.fn()` which is a no-op for sync returns
  - When manage-pages removes a command, the ReleaseEntry.astro commandSlugs map must also be updated to prevent broken changelog links
observability_surfaces:
  - "[update] Step: regenerate" log block with per-page ✓/⊘/✗ status, token counts, cost estimate
  - "[update] Step: manage commands" log block with new/removed counts and per-slug results
  - "[update] Regeneration:" summary line in pipeline output (shows skipped reason, or success/fail/skip counts with cost)
  - Per-step timing for all 7 steps in pipeline summary
  - content/generated/stale-pages.json boundary contract (inspectable after any pipeline run)
drill_down_paths:
  - .gsd/milestones/M003/slices/S04/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S04/tasks/T02-SUMMARY.md
duration: 22m
verification_result: passed
completed_at: 2026-03-17
---

# S04: Pipeline Integration and Polish

**Wired S01 diff detection, S02 LLM regeneration, and S03 command management into a 7-step async `npm run update` pipeline with cost/timing reporting and graceful API key degradation — completing M003's single-command continuous documentation regeneration.**

## What Happened

T01 wired the three upstream slice modules into `scripts/update.mjs` as two new async pipeline steps — `regenerate` (step 4) and `manage commands` (step 5) — inserted between `diff report` and `build`. The pipeline loop was made async with `await step.fn()` to handle both sync and async steps uniformly. A `formatCost()` helper computes cost estimates at Sonnet pricing ($3/MTok input, $15/MTok output). An `isDirectRun` guard wraps the main pipeline execution so that importing `update.mjs` for testing doesn't trigger side effects. 14 integration tests were written covering step structure, cost math, regeneration skip paths, command detection shape, and the import guard.

T02 ran the full `npm run update` end-to-end without an API key. The first run exposed pre-existing broken links — `ReleaseEntry.astro` still had `config` and `pause` entries in its `commandSlugs` map, but those command pages had already been removed by a prior S03 `manage-pages` run. After removing the stale slug entries and updating `page-map.test.mjs` expectations (42→40 pages, 27→25 commands), the second run completed successfully: all 7 steps passed, 58 pages built, 3427 links verified with 0 broken.

## Verification

- `node --test tests/update-pipeline.test.mjs` — 14 tests pass across 5 suites (step structure, formatCost, regeneration skip, command detection, import guard)
- `node --test tests/*.test.mjs` — 118 tests pass, 0 failures across all 28 suites (no regressions)
- `npm run update` without ANTHROPIC_API_KEY — exits 0, all 7 steps show ✅ markers with timing
- Pipeline output shows regeneration summary: "skipped (no stale pages)"
- `content/generated/stale-pages.json` — valid boundary contract with all required fields
- `node scripts/check-links.mjs` — 3427 internal links, 0 broken
- 58 HTML pages in dist/

## Requirements Advanced

- R007 — Extended from 5-step to 7-step pipeline with regeneration and command management steps. Still validates as single-command update cycle.

## Requirements Validated

- R042 — `npm run update` runs the complete 7-step pipeline end-to-end with regeneration between extract and build
- R043 — Pipeline completes successfully without ANTHROPIC_API_KEY, regeneration skipped with clear message
- R045 — Per-page status, token counts, cost estimate, and timing all reported in pipeline output
- R034 — Previous manifest snapshot saved and used as diffing baseline
- R035 — Source diff detection correctly identifies changed/added/removed files
- R036 — All 40 authored pages mapped to 477 source deps in page-source-map.json
- R037 — Staleness resolver correctly flags pages whose source dependencies changed
- R038 — Claude API regeneration module wired into pipeline and callable via regenerateStalePages()
- R039 — Quality prompt template with capture.mdx exemplar proven in unit tests
- R040 — New command detection and page creation wired into pipeline manage commands step
- R041 — Removed command detection and page cleanup wired into pipeline manage commands step
- R044 — Sidebar entries automatically added/removed during command management
- R046 — All 40 authored pages have explicit source mappings (40 not 42 — config/pause removed)

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- R046 — Rescoped from "all 42 authored pages" to "all 40 authored pages" since config and pause command pages were correctly removed by manage-pages (the system working as designed)

## Deviations

- Fixed pre-existing broken links in `ReleaseEntry.astro` — the `config` and `pause` command slugs were still in the commandSlugs map but their pages had been removed by a prior manage-pages run. Not in the original plan but necessary for check-links to pass.
- Updated `page-map.test.mjs` expectations (42→40 pages, 27→25 commands) to reflect current state after command page removals.

## Known Limitations

- Regeneration quality has not been tested end-to-end with a real API key and actual source changes in this slice — S02 validated quality for 3 pages; S04 only verified the pipeline orchestration and skip paths.
- The `ReleaseEntry.astro` commandSlugs map is not automatically updated by `removePages()` — it requires manual cleanup when commands are removed. This coupling is documented in KNOWLEDGE.md.
- No transitive dependency tracking in the source-to-page mapping — a change to a utility file that affects multiple commands won't be detected unless those utility files are explicitly listed as dependencies (accepted tradeoff from S01).

## Follow-ups

- none — this is the final assembly slice for M003. All success criteria are met.

## Files Created/Modified

- `scripts/update.mjs` — Added imports, formatCost, runRegenerate, runManageCommands, 7-step pipeline, async loop, isDirectRun guard, regeneration summary, exports
- `tests/update-pipeline.test.mjs` — Created: 14 integration tests for pipeline orchestration
- `src/components/ReleaseEntry.astro` — Removed stale config/pause entries from commandSlugs map
- `tests/page-map.test.mjs` — Updated page count (42→40) and command count (27→25)

## Forward Intelligence

### What the next slice should know
- M003 is complete. The `npm run update` pipeline is the primary interface for documentation updates. It handles the full lifecycle: update package → extract content → diff sources → regenerate stale pages → manage new/removed commands → build site → check links. All 13 M003 requirements are now validated.

### What's fragile
- `ReleaseEntry.astro` commandSlugs map — must be manually synchronized when manage-pages removes commands. This is a known coupling point that could produce broken changelog links if forgotten. The KNOWLEDGE.md entry documents it but there's no automated enforcement.
- The `isDirectRun` guard in update.mjs depends on `process.argv[1]` ending with `/update.mjs` — this works for normal execution and symlinks but could theoretically fail with unusual invocation patterns.

### Authoritative diagnostics
- `npm run update` stdout — the single most informative diagnostic surface. Shows all 7 steps, per-step timing, regeneration results, and link check.
- `content/generated/stale-pages.json` — the boundary contract between detection and regeneration. If regeneration seems wrong, inspect this file first.
- `node --test tests/*.test.mjs` — 118 tests across 28 suites cover all M003 modules.

### What assumptions changed
- Page count assumption: M003 roadmap assumed 42 authored pages, but manage-pages correctly removed config and pause (2 pages), bringing the count to 40. This is the system working as designed, not a failure.
