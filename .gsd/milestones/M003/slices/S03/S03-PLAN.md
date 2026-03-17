# S03: New/Removed Command Handling

**Goal:** When gsd-pi adds or removes commands, the doc pipeline detects the change and creates/removes the corresponding page and sidebar entry automatically.
**Demo:** Adding a fake command to `commands.json` → detected as new, `createNewPages()` would call `regeneratePage()` with correct args, sidebar entry inserted. Removing an existing command → detected, `removePages()` deletes the `.mdx` file and removes the sidebar entry. Both verified by unit tests with mock LLM client.

## Must-Haves

- `detectNewAndRemovedCommands()` correctly identifies new commands (in `commands.json` but no `.mdx` page) and removed commands (`.mdx` page exists but command gone from `commands.json`)
- Detection filters out subcommands with arguments, non-`/gsd` commands, keyboard shortcuts, CLI flags, and excluded slugs (`help`, `parallel`)
- Non-command pages (`keyboard-shortcuts.mdx`, `cli-flags.mdx`, `headless.mdx`) are never flagged for removal
- `createNewPages()` calls `regeneratePage()` for each new command, adds sidebar entry before "Keyboard Shortcuts", and updates `page-source-map.json`
- `removePages()` deletes the `.mdx` file, removes the sidebar entry, and removes the page from `page-source-map.json`
- Sidebar manipulation preserves all existing content — only the target line is added/removed
- When `ANTHROPIC_API_KEY` is not set and no mock client provided, `createNewPages()` returns a skip result (graceful degradation)
- Module exports match the S03→S04 boundary contract: `detectNewAndRemovedCommands()`, `createNewPages()`, `removePages()`

## Proof Level

- This slice proves: contract + integration (mock LLM, real file manipulation)
- Real runtime required: no (mock client for LLM calls, real filesystem for sidebar/page/map operations in tests)
- Human/UAT required: no

## Verification

- `node --test tests/manage-pages.test.mjs` — all tests pass covering:
  - Detection: new command detected, removed command detected, subcommands/shortcuts/non-gsd filtered out, excluded slugs skipped, non-command pages never flagged
  - Sidebar: entry added before "Keyboard Shortcuts", entry removed correctly, non-command entries untouched
  - Map: new command gets algorithmic deps, removed command entry deleted
  - Full flow: `createNewPages()` with mock client → page file created + sidebar updated + map updated
  - Full flow: `removePages()` → page file deleted + sidebar entry removed + map entry removed
  - Graceful degradation: no API key → skip result
- `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m)))"` — exports `detectNewAndRemovedCommands`, `createNewPages`, `removePages`

## Integration Closure

- Upstream surfaces consumed: `content/generated/commands.json` (command list), `content/generated/page-source-map.json` (dependency map), `content/generated/manifest.json` (for algorithmic dep resolution), `scripts/lib/regenerate-page.mjs` (`regeneratePage()` for new page content), `astro.config.mjs` (sidebar), `src/content/docs/commands/*.mdx` (existing pages)
- New wiring introduced in this slice: `scripts/lib/manage-pages.mjs` module with CLI entry point — not yet wired into the update pipeline (S04 does that)
- What remains before the milestone is truly usable end-to-end: S04 wires manage-pages into `npm run update` alongside regeneration, adds cost/timing reporting, and verifies the full pipeline

## Tasks

- [ ] **T01: Build detection logic and sidebar/map manipulation primitives** `est:40m`
  - Why: The foundation — everything depends on accurate detection of new/removed commands and reliable sidebar/map file manipulation. Combined because the detection logic is small (~30 lines) and testing the full module in one pass is more efficient than splitting across two context windows.
  - Files: `scripts/lib/manage-pages.mjs`, `tests/manage-pages.test.mjs`
  - Do: Create `manage-pages.mjs` with `detectNewAndRemovedCommands()` (compares commands.json slugs vs .mdx files, filters with regex `/^\/gsd [a-z][-a-z]*$/`, excludes `help`/`parallel`, protects non-command pages), `addSidebarEntry(slug, configPath)` and `removeSidebarEntry(slug, configPath)` (string manipulation on astro.config.mjs), `addToPageMap(slug, mapPath, manifestPath)` and `removeFromPageMap(slug, mapPath)` (JSON manipulation on page-source-map.json). Write comprehensive tests for each function using temp dirs for file operations.
  - Verify: `node --test tests/manage-pages.test.mjs` — all detection, sidebar, and map tests pass
  - Done when: Detection correctly identifies new/removed commands with all edge cases handled, sidebar entries are added/removed at correct positions, map entries added with algorithmic deps / removed cleanly

- [ ] **T02: Wire createNewPages and removePages orchestration with mock LLM verification** `est:30m`
  - Why: Closes the slice — orchestrates detection + file manipulation + LLM into the exported functions that match the S03→S04 boundary contract. Integration tests with mock client prove the full flow works end-to-end.
  - Files: `scripts/lib/manage-pages.mjs`, `tests/manage-pages.test.mjs`
  - Do: Add `createNewPages(newCommands, options)` — for each slug, calls `regeneratePage()` (from S02's module), then adds sidebar entry and map entry. Add `removePages(removedCommands, options)` — for each slug, deletes `.mdx` file, removes sidebar entry, removes map entry. Add `dryRun` support. Add graceful degradation (no API key → skip). Add CLI entry point. Write integration tests using mock client and temp directory with real astro.config.mjs/page-source-map.json/commands.json fixtures.
  - Verify: `node --test tests/manage-pages.test.mjs` — all tests pass including full-flow integration tests. `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m)))"` shows correct exports.
  - Done when: `createNewPages()` with mock client creates page, updates sidebar, updates map. `removePages()` deletes page, cleans sidebar, cleans map. Both return structured results. No-API-key case returns skip result. CLI entry point works for both detect-only and execute modes.

## Files Likely Touched

- `scripts/lib/manage-pages.mjs` — NEW. Core module for this slice.
- `tests/manage-pages.test.mjs` — NEW. Unit and integration tests.
- `astro.config.mjs` — READ only (not modified by code in this slice — tests use temp copies)
