---
id: S01
parent: M003
milestone: M003
provides:
  - page-source-map.json mapping 43 authored doc pages to their gsd-pi source file dependencies (778 total deps)
  - detectChanges() comparing manifest snapshots to find changed/added/removed source files
  - resolveStalePages() mapping source changes to affected doc pages with per-page reasons
  - previous-manifest.json snapshot saved by extract.mjs before each extraction
  - stale-pages.json boundary contract written by the update pipeline for S02/S03/S04 consumption
requires:
  - slice: none
    provides: first slice — no upstream dependencies
affects:
  - S02 (consumes stale-pages.json to decide which pages to regenerate)
  - S03 (consumes page-source-map.json + addedFiles/removedFiles to detect new/removed commands)
  - S04 (orchestrates all three — reads stale-pages.json, page-source-map.json, and pipeline integration)
key_files:
  - scripts/lib/build-page-map.mjs
  - scripts/lib/diff-sources.mjs
  - scripts/update.mjs
  - scripts/extract.mjs
  - content/generated/page-source-map.json
  - content/generated/stale-pages.json
  - tests/page-map.test.mjs
  - tests/diff-sources.test.mjs
key_decisions:
  - Page keys use content-relative format (e.g. "commands/auto.mdx") matching Starlight content collection slugs; source deps use repo-relative paths matching manifest.json keys (D043)
  - addedFiles intentionally excluded from staleness triggers — S03 handles new commands separately
  - stale-pages.json written on every run (including first-run and zero-stale) so downstream slices can read unconditionally (D042)
  - Diff report runs as in-process function step for speed (~3ms) rather than shelled-out command
  - Reference pages (skills, agents, extensions) dynamically pull deps from manifest rather than hardcoding
patterns_established:
  - Pipeline steps support both `cmd` (shell) and `fn` (in-process function) types via step config object in update.mjs
  - CLI entry point pattern — check `process.argv[1]` resolved path against `import.meta.url` for direct-run detection
  - Boundary contract pattern — JSON file written on every pipeline run with consistent shape for downstream consumers
observability_surfaces:
  - content/generated/page-source-map.json — human-readable JSON, 43 page entries with source deps
  - content/generated/stale-pages.json — boundary contract with changedFiles, addedFiles, removedFiles, stalePages, reasons, timestamp
  - content/generated/previous-manifest.json — snapshot for comparing headSha between runs
  - "[update] Step: diff report" log block in pipeline output with changed/added/removed counts
  - "✓ No stale pages — skipping regeneration" fast-path signal
  - "ℹ First run — no previous manifest for diff" first-run signal
  - Console warnings from build-page-map.mjs if source paths are missing from manifest
drill_down_paths:
  - .gsd/milestones/M003/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M003/slices/S01/tasks/T03-SUMMARY.md
duration: 50m
verification_result: passed
completed_at: 2026-03-17
---

# S01: Source Diff and Page Mapping

**Detection-only system that maps all 43 authored doc pages to their gsd-pi source dependencies, identifies changed source files between versions, and flags stale pages — integrated into `npm run update` with a `stale-pages.json` boundary contract for downstream slices.**

## What Happened

Three tasks built the detection pipeline from data structure through integration:

**T01** created `build-page-map.mjs` — an ESM module that generates `page-source-map.json` mapping every authored page to its source file dependencies. Three strategies handle the mapping: 22 command pages have explicit override mappings with multi-file deps (auto.ts + auto-dispatch.ts + prompts, etc.), 6 commands use an algorithmic fallback (shared deps + slug.ts + prompts/slug.md), and 15 non-command pages use static lookup with broad cross-cutting deps. Reference pages (skills, agents, extensions) dynamically pull all matching files from the manifest rather than hardcoding. The generator validates every path against manifest.json at build time.

**T02** created `diff-sources.mjs` with two exported functions: `detectChanges(prev, curr)` compares path→sha maps from two manifests to find changed/added/removed files, and `resolveStalePages(changes, pageSourceMap)` cross-references changes against page deps to flag stale pages with per-page reasons. A key design choice: addedFiles are intentionally excluded from staleness triggers — S03 handles new commands through a separate path. The task also modified `extract.mjs` to snapshot manifest.json → previous-manifest.json before each extraction.

**T03** wired the diff report into `npm run update` as an in-process function step between extract and build. It reads both manifests plus the page map, runs the detection chain, and writes `content/generated/stale-pages.json` — the boundary contract consumed by S02/S03/S04. Three paths are handled: normal (lists stale pages), fast (0 stale → logs skip message), and first-run (no previous manifest → graceful message). The step completes in ~3ms.

## Verification

All slice-level verification checks pass:

| Gate Check | Command | Result |
|---|---|---|
| Page map tests | `node --test tests/page-map.test.mjs` | 9/9 pass ✅ |
| Diff-sources tests | `node --test tests/diff-sources.test.mjs` | 12/12 pass ✅ |
| Build page map CLI | `node scripts/lib/build-page-map.mjs` | 43 pages, 778 deps ✅ |
| Module exports | `node -e "import('./scripts/lib/diff-sources.mjs')..."` | detectChanges, resolveStalePages ✅ |
| stale-pages.json boundary contract | `cat content/generated/stale-pages.json` | Valid JSON, correct shape ✅ |
| Pipeline integration | `npm run update` | Diff report visible in output ✅ |
| Idempotent rerun | Second `npm run update` | 0 stale pages ✅ |

Observability surfaces confirmed:
- `page-source-map.json` is human-readable with 43 entries
- `stale-pages.json` written with consistent shape on every run
- Pipeline output shows diff report step with counts
- Manual SHA tweak correctly flags dependent pages as stale

## Requirements Advanced

- R034 — previous-manifest.json snapshot now saved by extract.mjs before each extraction, providing the diff baseline
- R035 — detectChanges() compares previous vs current manifest SHAs, returning changedFiles/addedFiles/removedFiles
- R036 — page-source-map.json maps all 43 authored pages to 778 source deps with validated paths
- R037 — resolveStalePages() cross-references changes against page-source-map to flag stale pages with reasons
- R046 — all 43 authored pages (28 command deep-dives, 6 recipes, walkthrough, homepage, 6 reference pages, changelog) have explicit mappings

## Requirements Validated

- R034 — Snapshot saved on every extract run; diff detection uses it as baseline; verified via end-to-end pipeline run with stale-pages.json output
- R035 — 5 unit tests verify correct detection (changed, added, removed, identical, combined); end-to-end pipeline confirms diff report step executes
- R036 — 9 unit tests verify structure; all source paths validated against manifest.json; pipeline uses map in diff report step
- R037 — 7 unit tests verify staleness detection; pipeline confirms correct page flagging when source files change
- R046 — 9 unit tests verify completeness (43 pages, 28 commands, 6 recipes, cross-cutting deps ≥3, static deps = 0)

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- R046 — page count updated from original "42" to 43 (includes config, export, update pages added by S03's manage-pages)

## Deviations

- Page count is 43 (not 42 as originally planned) — S03's manage-pages added config, export, and update command pages after the original count was established. Tests and the map generator correctly reflect 43.
- Manifest `.files` is a `Record<string, string>` (path→sha), not an array of `{path, sha}` objects as the plan implied. Built against the real format.
- T02 added 3 extra test cases (combined add/change/remove, multi-trigger reasons, no-changes-no-stale) — total 12 tests vs. 9 specified.

## Known Limitations

- Source-to-page mapping is explicit, not inferred — when new page types are added (beyond command/recipe/reference patterns), the mapping rules in `build-page-map.mjs` must be extended manually.
- Staleness detection is file-level (hash comparison), not line-level. A change to a comment in a source file triggers regeneration of all pages depending on that file.
- Cross-cutting pages have broad dependency sets by design — a change to `commands.ts` flags many pages as stale even if the change only affects one command.

## Follow-ups

- S02 should consume `stale-pages.json` to determine which pages to regenerate
- S03 should consume `addedFiles`/`removedFiles` from `stale-pages.json` to detect new/removed commands
- S04 should orchestrate all three slices through the pipeline

## Files Created/Modified

- `scripts/lib/build-page-map.mjs` — ESM module exporting `buildPageSourceMap()` with CLI entry point; maps 43 pages to source deps
- `scripts/lib/diff-sources.mjs` — ESM module exporting `detectChanges()` and `resolveStalePages()` with CLI entry point
- `scripts/extract.mjs` — Modified to save manifest.json → previous-manifest.json before extraction
- `scripts/update.mjs` — Added diff-report function step between extract and build; writes stale-pages.json
- `content/generated/page-source-map.json` — Generated map with 43 page entries and 778 total source deps
- `content/generated/stale-pages.json` — Boundary contract for S02/S03/S04
- `tests/page-map.test.mjs` — 9 test cases for page map completeness and correctness
- `tests/diff-sources.test.mjs` — 12 test cases for diff detection and staleness resolution

## Forward Intelligence

### What the next slice should know
- `stale-pages.json` is always present after `npm run update` — no existence check needed. On first-run it has `stalePages: []` and `firstRun: true`.
- The `reasons` field in `stale-pages.json` is a plain object (not a Map) — keys are page paths, values are arrays of triggering source file paths.
- Page keys in `page-source-map.json` use content-relative format (`commands/auto.mdx`) — these are the same keys in `stale-pages.json`.
- `addedFiles` in `stale-pages.json` are source files not yet mapped to any page — S03 should check these for new command `.ts` files.
- Reference pages (skills, agents, extensions) pull deps dynamically from manifest — their dep lists grow/shrink as the gsd-pi package adds/removes files.

### What's fragile
- `build-page-map.mjs` has 22 hardcoded command override mappings — when gsd-pi adds a new command with non-standard source structure, this map needs a manual entry. The algorithmic fallback handles simple commands but complex ones (like auto with 5 source files) need explicit overrides.
- The `COMMAND_SLUGS` array in `tests/page-map.test.mjs` must be kept in sync with actual command pages — if S03's manage-pages adds/removes commands, the test expectations need updating.

### Authoritative diagnostics
- `node scripts/lib/diff-sources.mjs` — the definitive check for what's changed and what's stale. Reads real manifests and page map, prints human-readable report. If this shows unexpected results, check `previous-manifest.json` headSha vs current `manifest.json` headSha first.
- `node scripts/lib/build-page-map.mjs` — regenerates page-source-map.json and prints warnings for any source paths not found in manifest. If a page is missing from the map, check the three strategy blocks in the source (command overrides, algorithmic fallback, static lookup).
- `cat content/generated/stale-pages.json | python3 -m json.tool` — post-hoc inspection of last pipeline run's diff results.

### What assumptions changed
- Original plan assumed 42 authored pages — actual count is 43 after S03 added config, export, and update command pages. Tests and map generator reflect the real count.
- Original plan assumed manifest `.files` was an array of `{path, sha}` objects — actual format is `Record<string, string>` (path→sha). Both `detectChanges()` and tests use the real format.
