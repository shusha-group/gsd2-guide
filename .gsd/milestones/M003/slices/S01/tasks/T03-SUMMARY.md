---
id: T03
parent: S01
milestone: M003
provides:
  - Diff reporting wired into `npm run update` pipeline between extract and build steps
  - `content/generated/stale-pages.json` boundary contract for S02/S03/S04 consumption
  - Fast-path (0 stale pages) and first-run (no previous manifest) logging paths
key_files:
  - scripts/update.mjs
  - content/generated/stale-pages.json
key_decisions:
  - Diff report runs as in-process function step (not shelled-out command) for speed and direct data access
  - stale-pages.json written on every run including first-run and zero-stale cases, ensuring downstream slices always have a consistent file to read
patterns_established:
  - Pipeline steps support both `cmd` (shell) and `fn` (in-process function) types via the step config object
  - Boundary contract format for stale-pages.json includes changedFiles, addedFiles, removedFiles, stalePages, reasons (object), and timestamp
observability_surfaces:
  - "[update] Step: diff report" log block with changed/added/removed counts and per-page stale reasons
  - `content/generated/stale-pages.json` for post-hoc inspection of diff results
  - "✓ No stale pages — skipping regeneration" fast-path signal in pipeline output
  - "ℹ First run — no previous manifest for diff" first-run signal
duration: 15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T03: Wire diff reporting into update pipeline and run integration verification

**Wired diff detection into `npm run update` — reports stale pages after extraction and writes `stale-pages.json` boundary contract for downstream slices.**

## What Happened

Modified `scripts/update.mjs` to add a "diff report" step between extract and build. The step imports `detectChanges` and `resolveStalePages` from `scripts/lib/diff-sources.mjs`, loads the previous and current manifests plus the page-source-map, and logs a summary of changed files and stale pages. It writes `content/generated/stale-pages.json` with the full diff results in a format consumable by S02/S03/S04.

The diff report runs as an in-process function (not a shelled-out command) for speed — it completes in ~3ms. Three paths are handled:
1. **Normal path:** Reports changed/added/removed file counts and lists stale pages with their triggering source files
2. **Fast path:** When 0 pages are stale, logs "✓ No stale pages — skipping regeneration"
3. **First-run path:** When no previous-manifest.json exists, logs "ℹ First run" and writes a minimal stale-pages.json

## Verification

- `npm run update` completed successfully with diff report visible between extract and build ✅
- `content/generated/stale-pages.json` exists after update with valid JSON matching the boundary contract format ✅
- Running update twice in succession shows "0 stale pages" on the second run ✅
- Pipeline timing includes diff report step (3ms) ✅
- Manually tweaking a SHA in previous-manifest.json → `node scripts/lib/diff-sources.mjs` correctly flags `commands/auto.mdx`, `user-guide/developing-with-gsd.mdx`, and `reference/extensions.mdx` as stale ✅
- All 21 existing tests pass (`node --test tests/page-map.test.mjs tests/diff-sources.test.mjs`) ✅
- Slice verification: `build-page-map.mjs` generates OK, `diff-sources.mjs` exports both functions, all test suites green ✅
- Full build + check-links still passes — no regressions ✅

## Diagnostics

- Inspect diff results: `cat content/generated/stale-pages.json | python3 -m json.tool`
- Check pipeline output: `npm run update` — look for `[update] Step: diff report` block
- Test staleness manually: edit a SHA in `content/generated/previous-manifest.json`, then `node scripts/lib/diff-sources.mjs`
- Verify boundary contract shape: `node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('content/generated/stale-pages.json','utf8'))))"`

## Deviations

None. Implementation followed the plan exactly.

## Known Issues

None.

## Files Created/Modified

- `scripts/update.mjs` — Added diff-report function step between extract and build; imports detectChanges/resolveStalePages, writes stale-pages.json
- `content/generated/stale-pages.json` — New generated file; boundary contract for S02/S03/S04
- `.gsd/milestones/M003/slices/S01/tasks/T03-PLAN.md` — Added Observability Impact section (pre-flight fix)
