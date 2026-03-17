---
id: T02
parent: S03
milestone: M003
provides:
  - createNewPages(newCommands, options) — orchestrates regeneratePage + addSidebarEntry + addToPageMap per slug
  - removePages(removedCommands, options) — orchestrates file deletion + removeSidebarEntry + removeFromPageMap per slug
  - CLI entry point with --execute and --dry-run modes for standalone use
  - S03→S04 boundary contract complete: detectNewAndRemovedCommands, createNewPages, removePages
key_files:
  - scripts/lib/manage-pages.mjs
  - tests/manage-pages.test.mjs
key_decisions:
  - Let resolvePackagePath find gsd-pi globally rather than passing explicit pkgPath in tests — avoids coupling to local node_modules layout
  - createNewPages only updates sidebar/map when regeneration succeeds (not skipped, not error) — prevents orphaned metadata for pages that weren't actually created
  - removePages counts a slug as "removed" even if the .mdx file was already gone — sidebar/map cleanup is the important part
patterns_established:
  - computeSourceFiles() extracted as shared helper to avoid duplicating addToPageMap's algorithmic dep logic
  - Mock Anthropic client pattern for integration tests — { messages: { create: async (args) => response } } with call tracking
observability_surfaces:
  - createNewPages returns { results: Array<{ slug, regeneration, sidebar, map }>, created, skipped, failed } — per-slug detail for inspection
  - removePages returns { results: Array<{ slug, fileDeleted, sidebar, map }>, removed, failed } — confirms file deletion + metadata cleanup
  - CLI prints structured detection results and per-slug action outcomes in all three modes
duration: 15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Wire createNewPages and removePages orchestration with mock LLM verification

**Added `createNewPages()` and `removePages()` orchestration functions plus CLI entry point to `manage-pages.mjs`, completing the S03→S04 boundary contract with 31 passing tests.**

## What Happened

Added three major pieces to `scripts/lib/manage-pages.mjs`:

1. **`createNewPages(newCommands, options)`** — For each slug: computes source files using `computeSourceFiles()` (shared algorithmic dep logic), calls `regeneratePage()` from S02, then updates sidebar and page-source-map only when regeneration succeeds. Supports `client` (DI for mock), `dryRun`, and all path overrides. Returns structured results with per-slug detail and aggregate counts (created/skipped/failed).

2. **`removePages(removedCommands, options)`** — For each slug: deletes the .mdx file (graceful on ENOENT), removes sidebar entry, removes page-source-map entry. Returns structured results with per-slug detail and aggregate counts (removed/failed).

3. **CLI entry point** — Three modes:
   - `node scripts/lib/manage-pages.mjs` → detect-only, prints new/removed commands
   - `node scripts/lib/manage-pages.mjs --execute` → detect + create + remove
   - `node scripts/lib/manage-pages.mjs --dry-run` → detect + simulate without writes

Extended `tests/manage-pages.test.mjs` with 8 new tests across 3 suites:
- **createNewPages** (4 tests): mock client success with page/sidebar/map verification, dryRun mode, no-API-key skip, multiple commands
- **removePages** (3 tests): full removal with file/sidebar/map cleanup, missing file graceful handling, multiple removals
- **Full round-trip** (1 test): detect new → create with mock → verify sync → remove command from JSON → detect removed → remove → verify clean

## Verification

- `node --test tests/manage-pages.test.mjs` — **31/31 tests pass** (23 T01 + 8 T02, 8 suites)
- `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m)))"` — shows all 7 exports including `createNewPages`, `removePages`
- `node scripts/lib/manage-pages.mjs` — CLI detect-only mode works, reports `config` and `pause` as removed commands
- `node scripts/lib/manage-pages.mjs --dry-run` — dry-run mode works, shows what would be removed

### Slice-level verification status (T02 is final task):
- ✅ Detection: new command detected, removed command detected, subcommands/shortcuts/non-gsd filtered out, excluded slugs skipped, non-command pages never flagged
- ✅ Sidebar: entry added before "Keyboard Shortcuts", entry removed correctly, non-command entries untouched
- ✅ Map: new command gets algorithmic deps, removed command entry deleted
- ✅ Full flow: `createNewPages()` with mock client → page file created + sidebar updated + map updated
- ✅ Full flow: `removePages()` → page file deleted + sidebar entry removed + map entry removed
- ✅ Graceful degradation: no API key → skip result
- ✅ Module exports check: `detectNewAndRemovedCommands`, `createNewPages`, `removePages` (plus T01 primitives)

## Diagnostics

- Run `node --test tests/manage-pages.test.mjs` to verify all orchestration and primitives.
- Run `node scripts/lib/manage-pages.mjs` to check detection against real project data.
- Run `node scripts/lib/manage-pages.mjs --dry-run` to preview what changes would occur.
- Inspect `createNewPages` result: `result.results[i].regeneration` shows LLM outcome, `.sidebar` shows sidebar result, `.map` shows map result.
- Inspect `removePages` result: `result.results[i].fileDeleted` confirms file removal, `.sidebar.removed` and `.map.removed` confirm metadata cleanup.

## Deviations

- Removed explicit `pkgPath` from test options — `resolvePackagePath` correctly finds the globally installed gsd-pi package without override. The plan assumed `node_modules/gsd-pi` would work but the package is installed globally.

## Known Issues

- Detection against real data shows `config` and `pause` as orphaned pages (same as T01). These are genuine orphans — `gsd config` uses CLI flag format, `pause` has no matching `/gsd pause` command.
- `createNewPages` tests write real `.mdx` files to `src/content/docs/commands/` via `regeneratePage` (which uses its hardcoded ROOT). Tests clean up via `afterEach` but a test crash could leave artifacts. This is a tradeoff of testing the real integration path vs full temp-dir isolation.

## Files Created/Modified

- `scripts/lib/manage-pages.mjs` — Added `createNewPages()`, `removePages()`, `computeSourceFiles()` helper, CLI entry point, and import of `regeneratePage`.
- `tests/manage-pages.test.mjs` — Added 8 integration tests across 3 suites (createNewPages, removePages, full round-trip). Updated imports.
- `.gsd/milestones/M003/slices/S03/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix).
