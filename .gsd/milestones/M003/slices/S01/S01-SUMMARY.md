---
id: S01
parent: M003
milestone: M003
provides:
  - page-source-map.json mapping all 42 authored doc pages to their gsd-pi source file dependencies (485 total deps)
  - detectChanges() comparing manifest snapshots to find changed/added/removed source files
  - resolveStalePages() mapping source file changes to affected doc pages with per-page reasons
  - previous-manifest.json snapshot saved by extract.mjs before each extraction
  - stale-pages.json boundary contract for S02/S03/S04 consumption
  - Diff reporting wired into npm run update between extract and build steps
requires:
  - slice: none
    provides: first slice — no dependencies
affects:
  - S02 (consumes stale-pages.json stalePages array and page-source-map.json for regeneration targeting)
  - S03 (consumes stale-pages.json addedFiles/removedFiles and page-source-map.json for new/removed command detection)
  - S04 (orchestrates all — consumes diff-sources.mjs exports and stale-pages.json for full pipeline integration)
key_files:
  - scripts/lib/build-page-map.mjs
  - scripts/lib/diff-sources.mjs
  - scripts/update.mjs
  - scripts/extract.mjs
  - content/generated/page-source-map.json
  - content/generated/stale-pages.json
  - content/generated/previous-manifest.json
  - tests/page-map.test.mjs
  - tests/diff-sources.test.mjs
key_decisions:
  - Page keys use content-relative format (commands/auto.mdx), source deps use repo-relative paths matching manifest.json (D043)
  - Added files excluded from staleness triggers — S03 handles new commands separately (D042)
  - stale-pages.json boundary contract written on every run including first-run and zero-stale cases (D044)
  - Reference pages dynamically pull deps from manifest rather than hardcoding
  - Commands without dedicated slug.ts (discuss, next, pause, stop) map to shared deps (commands.ts, state.ts, types.ts)
patterns_established:
  - ESM module with CLI entry point pattern — check process.argv[1] against import.meta.url for direct-run detection
  - Pipeline steps support both cmd (shell) and fn (in-process function) types via step config object
  - Mock manifest helper in tests — manifest(files) builds full manifest from path→sha map
  - Boundary contract pattern — intermediate pipeline outputs written as JSON for downstream consumption
observability_surfaces:
  - content/generated/page-source-map.json — human-readable map of all 42 page dependencies
  - content/generated/stale-pages.json — diff results including changed files, stale pages, and reasons
  - content/generated/previous-manifest.json — snapshot for comparing against current extraction
  - [update] Step: diff report log block with changed/added/removed counts and per-page reasons
  - CLI: node scripts/lib/diff-sources.mjs prints full stale page report
  - CLI: node scripts/lib/build-page-map.mjs prints page count and dep total
drill_down_paths:
  - .gsd/milestones/M003/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M003/slices/S01/tasks/T03-SUMMARY.md
duration: 50m
verification_result: passed
completed_at: 2026-03-17
---

# S01: Source Diff and Page Mapping

**Detection-only pipeline that maps all 42 authored doc pages to their gsd-pi source dependencies and identifies which pages are stale after source changes — producing the boundary contracts that S02, S03, and S04 consume.**

## What Happened

Built three modules that form the detection backbone of the M003 regeneration pipeline:

**T01 — Page-source-map generator.** Created `scripts/lib/build-page-map.mjs` that maps all 42 authored doc pages to their gsd-pi source file dependencies using three strategies: (1) 27 command pages with 22 explicit override mappings and 5 algorithmic fallbacks for commands without dedicated `.ts` files, (2) 6 recipes + 1 walkthrough with broad cross-cutting dependency sets, (3) 6 reference pages with dynamic manifest lookups plus 2 static pages with no deps. The generator validates all source paths against `manifest.json` at build time, logging warnings for missing paths and erroring if >50% are invalid. Output: `page-source-map.json` with 42 entries and 485 total dependencies.

**T02 — Diff detection and staleness resolver.** Created `scripts/lib/diff-sources.mjs` with `detectChanges(prev, curr)` that compares path→sha maps from two manifests returning `{ changedFiles, addedFiles, removedFiles }`, and `resolveStalePages(changes, pageSourceMap)` that checks each page's deps against changed ∪ removed files (not added — S03 handles those) returning `{ stalePages, reasons }`. Modified `scripts/extract.mjs` to copy `manifest.json` → `previous-manifest.json` before each extraction so there's always a baseline for diffing. First-run handled gracefully.

**T03 — Pipeline integration.** Wired the diff report into `npm run update` as an in-process function step (~3ms) between extract and build. Writes `content/generated/stale-pages.json` as the boundary contract for downstream slices. Three code paths: normal (reports stale pages with reasons), fast-path (0 stale → skip message), first-run (no previous manifest → informational message). Running update twice in succession correctly shows 0 stale pages on the second run.

## Verification

All slice-level verification checks pass:

- `node --test tests/page-map.test.mjs` — **9/9 pass** (42 pages, 27 commands, 6 recipes, walkthrough+reference+other, all paths in manifest, ≥1 .ts per command, ≥3 deps per cross-cutting, 0 deps for static, 0 warnings)
- `node --test tests/diff-sources.test.mjs` — **12/12 pass** (5 detectChanges + 7 resolveStalePages covering changed→stale, added≠stale, removed→stale, empty deps, cross-cutting, multi-trigger, no-changes)
- `node scripts/lib/build-page-map.mjs && echo "OK"` — generates page-source-map.json without errors (42 pages, 485 deps)
- `node -e "import('./scripts/lib/diff-sources.mjs').then(m => console.log(Object.keys(m)))"` — exports `[ 'detectChanges', 'resolveStalePages' ]`
- `npm run update` completes with diff report visible between extract and build
- `content/generated/stale-pages.json` exists with valid boundary contract format
- All 21 tests pass across both test suites
- Full build + check-links passes without regressions

## Requirements Advanced

None — all requirements owned by this slice were validated (see below).

## Requirements Validated

- **R034** — extract.mjs saves manifest.json → previous-manifest.json before each extraction, confirmed with 1029 files tracked
- **R035** — detectChanges() correctly identifies changed/added/removed files between manifest versions, 5/5 unit tests pass, real diff produced 55 changed files
- **R036** — page-source-map.json maps all 42 authored pages to concrete source file paths, all paths validated against manifest, 9/9 tests pass
- **R037** — resolveStalePages() cross-references changes against page-source-map, 7/7 unit tests pass, real run flagged 17 stale pages from 55 changed files
- **R046** — page-source-map.json contains exactly 42 entries covering all authored pages (27 commands, 6 recipes, 1 walkthrough, 6 reference, 1 changelog, 1 homepage), 485 total deps

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

- T01: Added `commands.ts` to `recipes/small-change.mdx` deps beyond the plan to meet the ≥3 deps requirement for cross-cutting pages. Valid since `/quick` is registered in commands.ts.
- T02: Manifest `.files` format was `Record<string, string>` (path→sha), not an array of objects as the plan described. Built against the real format.
- T02: Added 3 extra test cases beyond the planned 9 (combined add/change/remove, multi-trigger reasons, no-changes-no-stale) — total 12 tests.

## Known Limitations

- Source-to-page mapping doesn't capture indirect/transitive dependencies. If file A imports from file B, and file B changes, pages depending on A won't be flagged. This is an acceptable tradeoff for simplicity — direct dependency coverage catches the vast majority of real changes.
- The `previous-manifest.json` snapshot approach means the first run after enabling the pipeline always shows "first run" with no diff. This is by design.
- Added files are intentionally excluded from staleness triggers. If a new utility file is added that existing commands start importing, those pages won't be flagged until the importing file itself changes. S03 handles the "new command" case separately.

## Follow-ups

- S02 needs to consume `stale-pages.json` → `stalePages` array to know which pages to regenerate
- S03 needs to consume `stale-pages.json` → `addedFiles`/`removedFiles` arrays to detect new/removed commands
- S04 needs to orchestrate all three stages (diff → regen → manage) in the update pipeline
- The boundary map in M003-ROADMAP.md describes the module path as `scripts/diff-sources.mjs` but the actual path is `scripts/lib/diff-sources.mjs` — downstream slice plans should use the real path

## Files Created/Modified

- `scripts/lib/build-page-map.mjs` — ESM module exporting `buildPageSourceMap()` with CLI entry point, maps 42 pages to source deps
- `scripts/lib/diff-sources.mjs` — ESM module exporting `detectChanges()` and `resolveStalePages()` with CLI entry point
- `scripts/extract.mjs` — Modified to copy manifest.json → previous-manifest.json before buildManifest()
- `scripts/update.mjs` — Added diff-report in-process function step between extract and build, writes stale-pages.json
- `content/generated/page-source-map.json` — Generated map with 42 page entries and 485 total source deps
- `content/generated/stale-pages.json` — Boundary contract with diff results for downstream slices
- `content/generated/previous-manifest.json` — Manifest snapshot for change detection
- `tests/page-map.test.mjs` — 9 test cases using node:test + node:assert/strict
- `tests/diff-sources.test.mjs` — 12 test cases covering all diff detection and staleness scenarios

## Forward Intelligence

### What the next slice should know
- The page-source-map uses content-relative keys (e.g. `commands/auto.mdx`) — use these as-is when looking up pages in the map
- `stale-pages.json` is the single boundary contract — always present after `npm run update`, even on first-run (with empty arrays)
- `detectChanges` and `resolveStalePages` are importable from `scripts/lib/diff-sources.mjs` (note: under `lib/`, not directly in `scripts/`)
- Manifest `.files` is a `Record<string, string>` (path→sha), not an array — both functions operate on this format directly
- The `reasons` field in stale-pages.json is a plain object (not a Map) mapping page keys to arrays of triggering source file paths

### What's fragile
- The 22 explicit command override mappings in `build-page-map.mjs` are hardcoded — if gsd-pi adds a new command or reorganizes its source files, the map needs manual updates. The algorithmic fallback helps but only for simple single-file commands.
- The test assertion `has exactly 42 page entries` will break when new pages are added. Update the count and the page list when adding pages.

### Authoritative diagnostics
- `node scripts/lib/diff-sources.mjs` — shows real diff state between previous and current manifest, trustworthy because it reads the actual generated files
- `node scripts/lib/build-page-map.mjs` — re-validates all source paths against current manifest, warnings indicate stale paths
- `cat content/generated/stale-pages.json | python3 -m json.tool` — post-hoc inspection of the last diff run

### What assumptions changed
- Plan assumed manifest `.files` was an array of `{ path, sha }` objects — actual format is `Record<string, string>`. All code built against real format.
- Plan described module path as `scripts/diff-sources.mjs` — actual path is `scripts/lib/diff-sources.mjs` (follows existing `scripts/lib/` convention).
