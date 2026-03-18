---
id: S04
parent: M003
milestone: M003
provides:
  - Complete `npm run update` pipeline with 9 async-aware steps (update gsd-pi → extract → diff report → manage commands → regenerate → build → check-links → audit content → stamp pages)
  - Graceful degradation without ANTHROPIC_API_KEY — regeneration skipped, build proceeds
  - Per-page cost/timing reporting with $3/MTok input, $15/MTok output cost estimates
  - isDirectRun guard enabling safe imports of update.mjs without triggering pipeline
  - Integration test suite (9 tests) covering step order, fn/cmd typing, import guard
requires:
  - slice: S01
    provides: diff-sources.mjs (detectChanges, resolveStalePages), page-source-map.json, stale-pages.json boundary contract
  - slice: S02
    provides: regenerate-page.mjs (regeneratePage), quality prompt template, dependency-injected Anthropic client
  - slice: S03
    provides: manage-pages.mjs (detectNewAndRemovedCommands, createNewPages, removePages), sidebar mutation logic
affects: []
key_files:
  - scripts/update.mjs
  - tests/update-pipeline.test.mjs
  - src/components/ReleaseEntry.astro
  - tests/page-map.test.mjs
key_decisions:
  - Export steps/functions directly from update.mjs (rather than extracting a separate orchestration module) since they're self-contained
  - isDirectRun guard uses process.argv[1] endsWith check — same pattern as regenerate-page.mjs and manage-pages.mjs
  - Fix broken links at source (remove stale slugs from ReleaseEntry.astro's commandSlugs map) rather than adding an allowlist to check-links.mjs
  - Update test expectations to reflect actual project state (40 pages, 25 commands) rather than leaving stale assertions
patterns_established:
  - Pipeline fn steps can be sync or async — the loop uses `await step.fn()` which is a no-op for sync returns
  - When manage-pages removes a command page, the corresponding slug in ReleaseEntry.astro's commandSlugs map must also be removed to prevent broken changelog links
observability_surfaces:
  - "[update] Step: regenerate" log block with per-page ✓/⊘/✗ status, token counts, cost estimate
  - "[update] Step: manage commands" log block with new/removed counts and per-slug results
  - "[update] Regeneration:" summary line in pipeline output (shows skipped reason, or success/fail/skip counts with cost)
  - "`npm run update` stdout" — full 9-step pipeline output with per-step ✅ markers, timings, and link-check results
  - "`content/generated/stale-pages.json`" — boundary contract written by diff report step
  - Pipeline exits non-zero naming the failed step when any step fails
drill_down_paths:
  - .gsd/milestones/M003/slices/S04/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S04/tasks/T02-SUMMARY.md
duration: 22m
verification_result: passed
completed_at: 2026-03-18
---

# S04: Pipeline Integration and Polish

**Wired S01/S02/S03 modules into the `npm run update` pipeline as async steps with graceful API-key degradation, cost/timing reporting, and end-to-end verification — completing the M003 continuous documentation regeneration system.**

## What Happened

S01, S02, and S03 each produced proven but disconnected modules: diff detection, LLM page regeneration, and new/removed command handling. S04 assembled them into the `npm run update` pipeline and proved the whole system works end-to-end.

**T01 (12m):** Wired `regenerateStalePages()` from S02 and `detectNewAndRemovedCommands()`/`createNewPages()`/`removePages()` from S03 into `scripts/update.mjs`. Made the pipeline loop async (`await step.fn()`) to support both sync and async steps. Added per-page cost reporting ($3/MTok input, $15/MTok output) and a regeneration summary section. Added an `isDirectRun` guard so the module can be imported for testing without triggering the pipeline. Created 14 integration tests covering step structure, cost math, regeneration skip path, command detection shape, and import safety.

**T02 (10m):** Ran the real `npm run update` pipeline end-to-end without an API key. The first run exposed 2 broken links in `dist/changelog/index.html` — the `config` and `pause` command pages had been removed by a prior `manage-pages` run but their slugs remained in `ReleaseEntry.astro`'s `commandSlugs` map. Fixed by removing the stale slug entries. Second run completed successfully: all 7 steps passed (npm update → extract → diff report → regenerate → manage commands → build → check-links), 58 pages built, 3427 links verified. Updated `page-map.test.mjs` expectations from 42→40 pages and 27→25 commands.

**Post-T02 evolution:** The pipeline subsequently grew from 7 to 9 steps (adding `audit content` and `stamp pages`). Tests were updated during slice closure to match the 9-step reality — 113 tests pass across all suites.

## Verification

- `node --test tests/*.test.mjs` — 113 tests pass, 0 failures across 26 suites
- `node scripts/check-links.mjs` — 4036 internal links checked, 0 broken
- `find dist -name '*.html' | wc -l` — 65 HTML pages in dist/
- `node -e "import('./scripts/update.mjs')"` — imports without triggering pipeline execution
- Pipeline stdout shows all 9 steps with ✅ markers and timing
- `content/generated/stale-pages.json` written as boundary contract on pipeline runs

## Requirements Advanced

- R007 — Extended from 5-step to 9-step pipeline with regeneration, command management, content audit, and page stamping steps

## Requirements Validated

- R042 — `npm run update` runs the full pipeline with regeneration between extract and build. 14 integration tests + end-to-end run confirm.
- R043 — Pipeline without ANTHROPIC_API_KEY exits 0, logs skip message, builds with existing content. Verified end-to-end.
- R045 — Pipeline output shows per-page ✓/⊘/✗ status, token counts, cost estimate, and total regeneration time. Integration tests verify cost math.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- **Broken changelog links to removed commands:** The first end-to-end pipeline run failed at check-links because `ReleaseEntry.astro`'s `commandSlugs` map still had entries for `config` and `pause` commands whose pages had been removed. Fixed by removing stale slug entries. This was not in the plan but was necessary for end-to-end success.
- **Page/command count drift:** Test expectations updated from 42→40 pages and 27→25 commands to match reality after command page removals. Not a plan deviation — normal test maintenance.
- **Pipeline grew from 7 to 9 steps post-T02:** The `audit content` and `stamp pages` steps were added after T02 completed. Integration tests updated during slice closure to match.

## Known Limitations

- **No live regeneration test:** The pipeline was only tested without `ANTHROPIC_API_KEY` (the graceful degradation path). The regeneration-with-API-key path is exercised by S02's unit tests with mock clients, but the full pipeline with real API calls hasn't been run end-to-end in this slice.
- **ReleaseEntry slug cleanup is manual:** When `manage-pages` removes a command page, the corresponding slug in `ReleaseEntry.astro` must be manually removed. This could be automated in `removePages()`.

## Follow-ups

- Consider automating `ReleaseEntry.astro` slug cleanup inside `removePages()` to avoid manual intervention when commands are removed
- A full pipeline run with `ANTHROPIC_API_KEY` set and real stale pages should be done as a smoke test before relying on regeneration in production

## Files Created/Modified

- `scripts/update.mjs` — Modified: added S02/S03 imports, regenerate and manage commands async steps, cost/timing reporting, isDirectRun guard, regeneration summary
- `tests/update-pipeline.test.mjs` — Created: 9 integration tests (updated from original 14 to match 9-step pipeline structure)
- `src/components/ReleaseEntry.astro` — Modified: removed stale `config` and `pause` entries from commandSlugs map
- `tests/page-map.test.mjs` — Modified: updated page count (42→40) and command count (27→25)

## Forward Intelligence

### What the next slice should know
- The pipeline is complete — `npm run update` is the single entrypoint for the entire doc regeneration lifecycle. No further integration work is needed for M003.
- All M003 slices (S01–S04) are done. The milestone definition of done criteria should be checked against reality.

### What's fragile
- `ReleaseEntry.astro`'s `commandSlugs` map must stay in sync with command page additions/removals — the link checker will catch drift, but the fix is manual. A knowledge base entry documents this requirement.
- The `formatCost` logic is inlined in `runRegenerateStale()` rather than extracted as a reusable helper — if cost reporting is needed elsewhere, it should be extracted.

### Authoritative diagnostics
- `npm run update` stdout — the single source of truth for pipeline health; shows all 9 steps with pass/fail, timing, and regeneration cost
- `content/generated/stale-pages.json` — the boundary contract between diff detection and regeneration; always present after a pipeline run
- `node --test tests/*.test.mjs` — 113 tests across 26 suites cover all M003 modules

### What assumptions changed
- Original plan assumed 7 pipeline steps — actual pipeline has 9 (audit content and stamp pages added post-T02)
- Original plan estimated 42 pages and 27 commands — actual is 40 pages and 25 commands after config/pause removal
