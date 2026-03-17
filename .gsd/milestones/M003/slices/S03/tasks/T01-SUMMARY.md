---
id: T01
parent: S03
milestone: M003
provides:
  - detectNewAndRemovedCommands() — compares commands.json slugs vs .mdx pages
  - addSidebarEntry() / removeSidebarEntry() — sidebar line manipulation
  - addToPageMap() / removeFromPageMap() — page-source-map JSON manipulation
  - SHARED_COMMAND_DEPS / EXCLUDED_SLUGS / NON_COMMAND_PAGES constants
key_files:
  - scripts/lib/manage-pages.mjs
  - tests/manage-pages.test.mjs
key_decisions:
  - Match sidebar entries by link pattern (e.g. /commands/gsd/) rather than label text — avoids ambiguity between "/gsd" and "/gsd auto"
patterns_established:
  - Options/DI pattern for all 5 functions — path overrides for testability, defaults resolve from ROOT
  - Temp directory fixtures in tests — no real project files modified during testing
observability_surfaces:
  - All functions return structured result objects ({ added/removed: boolean, slug, deps?, reason? })
  - Detection returns { newCommands: string[], removedCommands: string[] } — pure data, no side effects
duration: 12m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Build detection logic and sidebar/map manipulation primitives

**Created `scripts/lib/manage-pages.mjs` with 5 exported primitives for detecting new/removed commands and manipulating sidebar entries and page-source-map entries.**

## What Happened

Built the `manage-pages.mjs` module with all 5 functions specified in the plan:

1. `detectNewAndRemovedCommands(options)` — reads commands.json, filters with `/^\/gsd [a-z][-a-z]*$/` regex plus bare `/gsd` case, compares against existing .mdx files. Excludes `help`/`parallel` slugs and `keyboard-shortcuts`/`cli-flags`/`headless` non-command pages.

2. `addSidebarEntry(slug, options)` — reads astro.config.mjs, finds "Keyboard Shortcuts" boundary, inserts correctly formatted entry with 12-space indentation.

3. `removeSidebarEntry(slug, options)` — finds entry by link pattern (`/commands/${slug}/`) to avoid label ambiguity, removes the line. Returns `{ removed: false, reason: 'not found' }` for missing entries.

4. `addToPageMap(slug, options)` — computes algorithmic deps from manifest (shared deps + slug.ts + prompts/slug.md if they exist), writes to page-source-map.json.

5. `removeFromPageMap(slug, options)` — deletes the `commands/${slug}.mdx` key from page-source-map.json.

All functions follow the options/DI pattern established in S01/S02 — path overrides for testability, defaults resolve from ROOT.

Wrote 23 tests covering detection edge cases (new command, removed command, subcommands, non-gsd commands, shortcuts, flags, excluded slugs, non-command pages, bare /gsd, empty results), sidebar manipulation (add before boundary, correct format, remove specific entry, remove bare /gsd, nonexistent handling, non-command preservation), and map manipulation (add with deps, slug.ts inclusion, prompt inclusion, remove, nonexistent handling).

Verified against real project data: detection correctly identifies `config` and `pause` as orphaned pages (they have .mdx files but their commands.json entries don't match `/gsd <slug>` pattern).

## Verification

- `node --test tests/manage-pages.test.mjs` — 23/23 tests pass (5 suites: detect, addSidebar, removeSidebar, addMap, removeMap)
- `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m)))"` — shows all 5 exports
- Real-data smoke test: `detectNewAndRemovedCommands()` returns `{ newCommands: [], removedCommands: ['config', 'pause'] }` — both are genuine orphans

### Slice-level verification status (T01 is task 1 of 2):
- ✅ Detection: new command detected, removed command detected, subcommands/shortcuts/non-gsd filtered out, excluded slugs skipped, non-command pages never flagged
- ✅ Sidebar: entry added before "Keyboard Shortcuts", entry removed correctly, non-command entries untouched
- ✅ Map: new command gets algorithmic deps, removed command entry deleted
- ⬜ Full flow: `createNewPages()` with mock client (T02)
- ⬜ Full flow: `removePages()` (T02)
- ⬜ Graceful degradation: no API key → skip result (T02)
- ✅ Module exports check passes (5 primitives; `createNewPages`/`removePages` added in T02)

## Diagnostics

- Run `node --test tests/manage-pages.test.mjs` to verify all primitives work.
- Run `node -e "import('./scripts/lib/manage-pages.mjs').then(m => { const r = m.detectNewAndRemovedCommands(); console.log(r); })"` to check detection against real data.
- All functions return structured results — inspect `.added`/`.removed`/`.reason`/`.deps` fields.

## Deviations

- Used link pattern matching (`/commands/${slug}/`) for sidebar removal instead of label matching — more reliable, avoids ambiguity between `/gsd` label and `/gsd auto` label.

## Known Issues

- Detection against real data shows `config` and `pause` as orphaned pages. This is correct behavior — `gsd config` is a CLI flag (no `/` prefix), and `pause` has no corresponding `/gsd pause` command. These may need manual resolution or explicit NON_COMMAND_PAGES additions if they should be kept.

## Files Created/Modified

- `scripts/lib/manage-pages.mjs` — NEW. Core module with 5 exported primitives for command detection and sidebar/map manipulation.
- `tests/manage-pages.test.mjs` — NEW. 23 test cases across 5 suites covering all edge cases.
- `.gsd/milestones/M003/slices/S03/S03-PLAN.md` — Added Observability / Diagnostics section.
- `.gsd/milestones/M003/slices/S03/tasks/T01-PLAN.md` — Added Observability Impact section.
