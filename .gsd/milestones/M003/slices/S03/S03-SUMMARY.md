---
id: S03
parent: M003
milestone: M003
provides:
  - detectNewAndRemovedCommands() — compares commands.json slugs vs .mdx files, filters subcommands/shortcuts/flags
  - createNewPages(newCommands, options) — orchestrates regeneratePage + addSidebarEntry + addToPageMap per slug
  - removePages(removedCommands, options) — orchestrates file deletion + removeSidebarEntry + removeFromPageMap per slug
  - CLI entry point with --execute and --dry-run modes
  - S03→S04 boundary contract: scripts/lib/manage-pages.mjs with 7 exports
requires:
  - slice: S01
    provides: content/generated/commands.json, content/generated/page-source-map.json, content/generated/manifest.json
  - slice: S02
    provides: scripts/lib/regenerate-page.mjs (regeneratePage function)
affects:
  - S04
key_files:
  - scripts/lib/manage-pages.mjs
  - tests/manage-pages.test.mjs
key_decisions:
  - Match sidebar entries by link pattern (/commands/{slug}/) not label text — avoids ambiguity (D047)
  - Only update sidebar/map when regeneration succeeds — prevents orphaned metadata (D048)
  - removePages counts slug as removed even if .mdx already gone — sidebar/map cleanup is the important part
patterns_established:
  - Options/DI pattern for all 7 functions — path overrides for testability, defaults resolve from ROOT
  - computeSourceFiles() shared helper extracts algorithmic dep logic from addToPageMap for reuse in createNewPages
  - Mock Anthropic client pattern for integration tests — { messages: { create: async (args) => response } } with call tracking
  - Temp directory fixtures in tests — no real project files modified during testing
observability_surfaces:
  - detectNewAndRemovedCommands() returns { newCommands: string[], removedCommands: string[] }
  - createNewPages returns { results: Array<{ slug, regeneration, sidebar, map }>, created, skipped, failed }
  - removePages returns { results: Array<{ slug, fileDeleted, sidebar, map }>, removed, failed }
  - CLI prints structured detection results and per-slug action outcomes
drill_down_paths:
  - .gsd/milestones/M003/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S03/tasks/T02-SUMMARY.md
duration: 27m
verification_result: passed
completed_at: 2026-03-17
---

# S03: New/Removed Command Handling

**`manage-pages.mjs` module with detection, creation, and removal of command doc pages — 7 exports, 31 tests, CLI entry point, mock-verified LLM integration.**

## What Happened

Built `scripts/lib/manage-pages.mjs` in two tasks that layer detection primitives under orchestration functions.

**T01 (12m)** created 5 primitives: `detectNewAndRemovedCommands()` compares `commands.json` slugs against existing `.mdx` files, filtering with `/^\/gsd [a-z][-a-z]*$/` regex plus bare `/gsd` handling, excluding `help`/`parallel` slugs and protecting non-command pages (`keyboard-shortcuts`, `cli-flags`, `headless`). `addSidebarEntry()`/`removeSidebarEntry()` manipulate `astro.config.mjs` by finding the "Keyboard Shortcuts" boundary and matching entries by link pattern (not label text). `addToPageMap()`/`removeFromPageMap()` manipulate `page-source-map.json` with algorithmic dep computation from the manifest. 23 tests across 5 suites verified all edge cases.

**T02 (15m)** added `createNewPages()` and `removePages()` orchestration. `createNewPages` computes source files, calls `regeneratePage()` from S02, then updates sidebar and map only on success. `removePages` deletes the `.mdx` file (graceful on ENOENT), removes sidebar entry, and removes map entry. Added CLI entry point with detect-only, `--execute`, and `--dry-run` modes. 8 integration tests including a full round-trip (detect→create→remove→verify clean) brought the total to 31/31.

Against real project data, detection correctly identifies `config` and `pause` as orphaned pages — genuine cases where `.mdx` files exist but no matching `/gsd <slug>` command exists in `commands.json`.

## Verification

- **31/31 tests pass** (`node --test tests/manage-pages.test.mjs`) across 8 suites covering detection, sidebar manipulation, map manipulation, createNewPages, removePages, and full round-trip
- **7 exports confirmed**: `detectNewAndRemovedCommands`, `createNewPages`, `removePages`, `addSidebarEntry`, `removeSidebarEntry`, `addToPageMap`, `removeFromPageMap`
- **CLI works** in all 3 modes: detect-only, `--execute`, `--dry-run`
- **Mock LLM verified**: createNewPages with mock client creates page file, updates sidebar, updates map
- **Graceful degradation**: no API key and no mock client → returns skip result with zero side effects
- **Non-command protection**: keyboard-shortcuts, cli-flags, headless never flagged for removal

## Requirements Advanced

- R040 — createNewPages() detects new commands and generates pages with sidebar/map entries. Mock-verified with full integration test.
- R041 — removePages() detects removed commands and deletes pages with sidebar/map cleanup. Handles missing files gracefully.
- R044 — addSidebarEntry() inserts before "Keyboard Shortcuts" boundary. removeSidebarEntry() finds by link pattern. Both return structured results.

## Requirements Validated

- R040 — 31/31 tests including full round-trip (detect new → create with mock LLM → verify page + sidebar + map → detect removed → remove → verify clean)
- R041 — Same round-trip plus explicit missing-file graceful handling and multiple-removal tests
- R044 — Sidebar tests verify correct position, indentation, format, non-command preservation, and missing-entry handling

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Used link pattern matching (`/commands/${slug}/`) for sidebar removal instead of label matching per plan — more reliable, avoids ambiguity between `/gsd` and `/gsd auto` labels. Recorded as D047.
- Removed explicit `pkgPath` from test options — `resolvePackagePath` correctly finds the globally installed gsd-pi package without override. Tests work without coupling to local `node_modules/` layout.

## Known Limitations

- Detection against real data shows `config` and `pause` as orphaned pages. This is correct behavior: `gsd config` uses CLI flag format (no `/` prefix), `pause` has no matching `/gsd pause` command. These may need manual resolution or explicit `NON_COMMAND_PAGES` additions.
- `createNewPages` tests write real `.mdx` files to `src/content/docs/commands/` via `regeneratePage` (which uses hardcoded ROOT). Tests clean up via `afterEach` but a test crash could leave artifacts.
- Cross-reference cleanup for removed commands (updating links in other pages that reference the removed command) is not implemented — noted in R041 but deferred.

## Follow-ups

- S04 must wire `manage-pages.mjs` into `scripts/update.mjs` alongside the regeneration step
- Consider adding `config` and `pause` to `NON_COMMAND_PAGES` constant if they should be kept despite not matching the `/gsd <slug>` pattern
- Cross-reference link cleanup for removed commands is a potential future enhancement

## Files Created/Modified

- `scripts/lib/manage-pages.mjs` — NEW. Core module with 7 exports for command detection, page creation/removal, sidebar and map manipulation, and CLI entry point.
- `tests/manage-pages.test.mjs` — NEW. 31 test cases across 8 suites covering detection edge cases, sidebar manipulation, map manipulation, orchestration, and full round-trip integration.

## Forward Intelligence

### What the next slice should know
- `manage-pages.mjs` exports match the S03→S04 boundary contract exactly: `detectNewAndRemovedCommands`, `createNewPages`, `removePages`. Import and call them in `update.mjs`.
- `createNewPages` takes `{ client?, dryRun?, docsDir?, configPath?, mapPath?, manifestPath? }` — pass the Anthropic client from S02 and it just works. Without a client or API key, it returns a skip result.
- `removePages` takes `{ docsDir?, configPath?, mapPath? }` — no LLM involved, pure filesystem+config cleanup.
- The CLI entry point (`node scripts/lib/manage-pages.mjs`) is standalone for debugging but not meant for the pipeline — S04 should call the functions directly.

### What's fragile
- Sidebar manipulation is string-based (finds "Keyboard Shortcuts" boundary by text match, inserts/removes lines) — if astro.config.mjs sidebar structure changes significantly, the regex patterns may break.
- `computeSourceFiles()` uses hardcoded patterns for slug-to-source-file resolution (`src/resources/extensions/gsd/{slug}.ts`, `src/resources/prompts/{slug}.md`, etc.) — if gsd-pi reorganizes its source layout, these patterns need updating.

### Authoritative diagnostics
- `node --test tests/manage-pages.test.mjs` — 31 tests, comprehensive edge case coverage, the single best signal for whether manage-pages is working
- `node scripts/lib/manage-pages.mjs` — real-data detection against the actual project, shows new/removed commands immediately
- `node scripts/lib/manage-pages.mjs --dry-run` — previews what would change without writing

### What assumptions changed
- Plan assumed `pkgPath` would be passed to tests pointing at `node_modules/gsd-pi` — actually gsd-pi is globally installed and `resolvePackagePath` handles this automatically without override
