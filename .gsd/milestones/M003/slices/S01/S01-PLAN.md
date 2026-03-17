# S01: Source Diff and Page Mapping

**Goal:** A detection-only system that knows which gsd-pi source files changed between versions and which of the 42 authored doc pages are affected.
**Demo:** Running `node scripts/lib/diff-sources.mjs` after an `npm run extract` shows which source files changed and which doc pages are stale. Running `node scripts/lib/build-page-map.mjs` generates `page-source-map.json` covering all 42 authored pages with verified source paths.

## Must-Haves

- `content/generated/page-source-map.json` maps all 42 authored pages to their source file dependencies
- Every source path in the map exists in the current `manifest.json` (no typos/stale paths)
- `scripts/lib/diff-sources.mjs` exports `detectChanges(previousManifest, currentManifest)` returning `{ changedFiles, addedFiles, removedFiles }`
- `scripts/lib/diff-sources.mjs` exports `resolveStalePages(changes, pageSourceMap)` returning `{ stalePages, reasons }`
- Previous manifest saved to `content/generated/previous-manifest.json` before extraction overwrites it
- First-run graceful handling: when no previous manifest exists, report "first run" and skip staleness detection
- Cross-cutting pages (recipes, walkthrough) include broad dependency sets

## Proof Level

- This slice proves: contract
- Real runtime required: yes (reads real manifest, real package paths)
- Human/UAT required: no

## Verification

- `node --test tests/page-map.test.mjs` — verifies all 42 pages mapped, all source paths exist in manifest, command pages have ≥1 `.ts` dep, cross-cutting pages have ≥3 deps
- `node --test tests/diff-sources.test.mjs` — verifies change detection with mock manifests: changed file → correct stale pages, added file → in addedFiles, removed file → in removedFiles, no changes → zero stale pages, first-run (no previous) → graceful skip
- `node scripts/lib/build-page-map.mjs && echo "OK"` — generates page-source-map.json without errors
- `node -e "import('./scripts/lib/diff-sources.mjs').then(m => console.log(Object.keys(m)))"` — exports detectChanges and resolveStalePages

## Observability / Diagnostics

- Runtime signals: Console output from diff-sources reports changed file count, stale page count, and per-page reasons
- Inspection surfaces: `content/generated/page-source-map.json` (human-readable JSON), `content/generated/previous-manifest.json` (snapshot)
- Failure visibility: Warning logged if >50% of mapped source paths don't exist in current manifest (suggests repo restructure)

## Integration Closure

- Upstream surfaces consumed: `scripts/lib/manifest.mjs` (`computeDiff` function), `content/generated/manifest.json` (current repo file manifest with SHA hashes)
- New wiring introduced in this slice: `scripts/extract.mjs` saves previous manifest before extraction; `scripts/lib/build-page-map.mjs` and `scripts/lib/diff-sources.mjs` are new modules
- What remains before the milestone is truly usable end-to-end: S02 (LLM regeneration), S03 (new/removed command handling), S04 (full pipeline integration into `npm run update`)

## Tasks

- [x] **T01: Build page-source-map generator with tests** `est:1h`
  - Why: Core data structure — maps all 42 authored doc pages to their gsd-pi source file dependencies. Required by R036 (mapping manifest) and R046 (all pages covered). This must exist before diff/staleness logic can be built.
  - Files: `scripts/lib/build-page-map.mjs`, `content/generated/page-source-map.json`, `tests/page-map.test.mjs`
  - Do: Create `build-page-map.mjs` that encodes the mapping rules from the research doc (27 command pages algorithmically, 15 non-command pages via static lookup). Write the map to `content/generated/page-source-map.json`. Add comprehensive test file using `node:test`. All source paths must use repo-relative format matching `manifest.json` (e.g., `src/resources/extensions/gsd/auto.ts`).
  - Verify: `node --test tests/page-map.test.mjs` passes — all 42 pages present, all source paths validated against manifest
  - Done when: `page-source-map.json` generated with 42 entries, all source paths exist in manifest, tests pass

- [x] **T02: Build diff detection, staleness resolver, and snapshot logic with tests** `est:1h`
  - Why: The change detection engine — compares manifests, identifies stale pages. Required by R034 (snapshot), R035 (diff detection), R037 (staleness). Depends on T01's page-source-map format.
  - Files: `scripts/lib/diff-sources.mjs`, `scripts/extract.mjs`, `tests/diff-sources.test.mjs`
  - Do: Create `diff-sources.mjs` with `detectChanges()` and `resolveStalePages()` exports. Modify `scripts/extract.mjs` to save `manifest.json` → `previous-manifest.json` before `buildManifest()` runs. Handle first-run gracefully (no previous manifest → skip). Add test file with mock manifests covering all scenarios: changed → stale, added → addedFiles, removed → removedFiles, no change → empty, first-run → graceful.
  - Verify: `node --test tests/diff-sources.test.mjs` passes all scenarios
  - Done when: Both functions exported and tested, extract.mjs saves previous manifest, first-run handled gracefully

- [x] **T03: Wire diff reporting into update pipeline and run integration verification** `est:30m`
  - Why: Makes the detection visible — `npm run update` reports stale pages after extraction. Closes the integration loop so S02/S03/S04 can consume the diff output. Validates the full chain end-to-end.
  - Files: `scripts/update.mjs`, `scripts/lib/diff-sources.mjs`
  - Do: After the extract step in `update.mjs`, load previous-manifest and current manifest, run `detectChanges()` + `resolveStalePages()`, log a summary (changed files count, stale pages list with reasons). If no previous manifest exists, log "First run — all pages considered fresh" and continue. Add a `--diff-only` flag or export the diff step so it can be called independently.
  - Verify: Run `npm run extract` then manually tweak one SHA in `previous-manifest.json`, then run the diff step — verify correct pages flagged. Run with no previous manifest — verify graceful "first run" message.
  - Done when: `npm run update` prints stale page report after extraction, diff works end-to-end with real manifests

## Files Likely Touched

- `scripts/lib/build-page-map.mjs` (new)
- `scripts/lib/diff-sources.mjs` (new)
- `scripts/extract.mjs` (modified — save previous manifest)
- `scripts/update.mjs` (modified — add diff reporting)
- `content/generated/page-source-map.json` (new, generated)
- `content/generated/previous-manifest.json` (new, generated at runtime)
- `tests/page-map.test.mjs` (new)
- `tests/diff-sources.test.mjs` (new)
