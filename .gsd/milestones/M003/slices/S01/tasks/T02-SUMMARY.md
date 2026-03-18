---
id: T02
parent: S01
milestone: M003
provides:
  - detectChanges() function comparing manifest snapshots to find changed/added/removed source files
  - resolveStalePages() function mapping source file changes to affected doc pages
  - previous-manifest.json snapshot saved by extract.mjs before each extraction
  - CLI entry point printing stale page report with per-page reasons
key_files:
  - scripts/lib/diff-sources.mjs
  - scripts/extract.mjs
  - tests/diff-sources.test.mjs
key_decisions:
  - Manifest .files is a path→sha object map (not an array) — detectChanges operates on this format directly rather than converting
  - addedFiles intentionally excluded from staleness triggers — S03 handles new commands separately
patterns_established:
  - CLI entry point pattern: check `process.argv[1]` resolved path against `import.meta.url` for direct-run detection
  - Mock manifest helper: `manifest(files)` builds a full manifest object from a path→sha map for clean test fixtures
observability_surfaces:
  - CLI: `node scripts/lib/diff-sources.mjs` prints "N files changed, M added, K removed. P pages stale." with per-page reasons
  - File: `content/generated/previous-manifest.json` — compare headSha with current manifest to verify different repo states
  - Console: extract.mjs logs "[orchestrator] Saved previous manifest snapshot" when snapshotting
duration: 15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Build diff detection, staleness resolver, and snapshot logic with tests

**Created ESM module with `detectChanges()` and `resolveStalePages()` exports, modified extract.mjs to snapshot previous manifests, and validated with 12 passing tests plus real end-to-end diff producing 17 stale pages.**

## What Happened

Created `scripts/lib/diff-sources.mjs` with two exported functions:
- `detectChanges(prev, curr)` builds path→sha maps from both manifests and returns `{ changedFiles, addedFiles, removedFiles }` — consistent with `manifest.mjs`'s `computeDiff()` logic but operating on full manifest objects.
- `resolveStalePages(changes, pageSourceMap)` checks each page's deps against `changedFiles ∪ removedFiles` (not addedFiles) and returns `{ stalePages, reasons }` where reasons is a Map of page→triggering files.

Added a CLI entry point that loads real generated files and prints a human-readable report. Handles first-run gracefully (no previous-manifest.json → prints message and exits 0).

Modified `scripts/extract.mjs` to copy `manifest.json` → `previous-manifest.json` at the top of `main()` before `buildManifest()` overwrites it.

Wrote 12 test cases (5 for detectChanges, 7 for resolveStalePages) covering all specified scenarios plus a combined add/change/remove test and a multi-trigger reasons test.

## Verification

- `node --test tests/diff-sources.test.mjs` — **12/12 pass** (5 detectChanges + 7 resolveStalePages)
- `node -e "import('./scripts/lib/diff-sources.mjs').then(m => console.log(Object.keys(m)))"` — prints `[ 'detectChanges', 'resolveStalePages' ]`
- `node scripts/extract.mjs` — completes successfully, `previous-manifest.json` exists with valid JSON (1025 files tracked)
- `node scripts/lib/diff-sources.mjs` — reports "55 files changed, 4 files added, 0 files removed. 17 pages stale." with real data

Slice-level checks:
- ✅ `node --test tests/page-map.test.mjs` — 9/9 pass (T01)
- ✅ `node --test tests/diff-sources.test.mjs` — 12/12 pass (T02)
- ✅ `node scripts/lib/build-page-map.mjs && echo "OK"` — generates without errors
- ✅ `node -e "import('./scripts/lib/diff-sources.mjs').then(m => console.log(Object.keys(m)))"` — exports confirmed

## Verification Evidence

| Gate Check | Command | Exit Code | Verdict | Duration |
|---|---|---|---|---|
| Diff-sources tests (12) | `node --test tests/diff-sources.test.mjs` | 0 | ✅ pass | ~1s |
| Module exports | `node -e "import('./scripts/lib/diff-sources.mjs').then(m => console.log(Object.keys(m)))"` | 0 | ✅ pass | <1s |
| Extract with snapshot | `node scripts/extract.mjs` | 0 | ✅ pass | ~8s |
| CLI diff report | `node scripts/lib/diff-sources.mjs` | 0 | ✅ pass | <1s |

## Diagnostics

- Inspect diff results: `node scripts/lib/diff-sources.mjs`
- Check previous snapshot: `cat content/generated/previous-manifest.json | python3 -m json.tool | head -5`
- Verify snapshot was taken: look for "[orchestrator] Saved previous manifest snapshot" in extract output
- Test staleness with synthetic change: edit a SHA in `previous-manifest.json`, re-run `node scripts/lib/diff-sources.mjs`

## Deviations

- Plan described manifest `files` as "an array of `{ path, sha }` objects" but actual format is a `Record<string, string>` (path→sha object map). Built against the real format.
- Added 3 extra test cases beyond the 9 specified: combined add/change/remove, multi-trigger reasons, and no-changes-no-stale — total 12 tests.

## Known Issues

None.

## Files Created/Modified

- `scripts/lib/diff-sources.mjs` — New ESM module with `detectChanges()`, `resolveStalePages()`, and CLI entry
- `scripts/extract.mjs` — Modified to copy manifest.json → previous-manifest.json before buildManifest()
- `tests/diff-sources.test.mjs` — 12 test cases for diff detection and staleness resolution
- `.gsd/milestones/M003/slices/S01/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix)
