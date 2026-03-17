# S03 — New/Removed Command Handling — Research

**Date:** 2026-03-17

## Summary

S03 is straightforward application of known patterns from S01 and S02 to a well-scoped problem: detect when gsd-pi adds or removes commands, then create/remove corresponding doc pages and sidebar entries automatically. The codebase already has all the building blocks — `commands.json` extraction (S01), `regeneratePage()` for LLM page creation (S02), and a well-structured `astro.config.mjs` sidebar.

The key design decision is **what constitutes a "new" or "removed" command**. The naive approach (using `addedFiles`/`removedFiles` from `stale-pages.json`) won't work because most commands don't have a 1:1 mapping to a single `.ts` file — only 5 of 24 command slugs have a `slug.ts` file. The reliable approach is comparing the **extracted `commands.json`** (which lists all `/gsd <command>` entries parsed from the package's `docs/commands.md`) against the **existing `.mdx` page files** in `src/content/docs/commands/`. This gives a definitive list of new commands without pages and pages without commands.

For page creation, `regeneratePage()` from S02 already handles the "new page" case — when `currentPage` is empty string, the LLM generates from scratch using source files and the exemplar. For removal, simple `fs.unlinkSync` plus sidebar entry removal. The sidebar in `astro.config.mjs` is a JavaScript array literal with a consistent `{ label: '/gsd <slug>', link: '/commands/<slug>/' }` pattern — straightforward to parse and modify with regex or AST-free string manipulation.

## Recommendation

Build a single module `scripts/lib/manage-pages.mjs` that exports two functions matching the S03→S04 boundary contract:
- `detectNewAndRemovedCommands(options)` — compares `commands.json` vs existing `.mdx` files, returns `{ newCommands: string[], removedCommands: string[] }`
- `createNewPages(newCommands, options)` — for each new command, generates a page via `regeneratePage()`, adds to sidebar and page-source-map
- `removePages(removedCommands, options)` — for each removed command, deletes `.mdx` file, removes sidebar entry, removes from page-source-map

Use `commands.json` as the source of truth for what commands exist — not `addedFiles`/`removedFiles` from `stale-pages.json`. The stale-pages data can serve as a secondary trigger (if `addedFiles` contains `docs/commands.md`, that's a hint that command set may have changed), but the comparison logic itself must use the parsed command list.

## Implementation Landscape

### Key Files

- `scripts/lib/manage-pages.mjs` — **NEW.** Main module for this slice. Exports `detectNewAndRemovedCommands()`, `createNewPages()`, `removePages()`. Consumes `commands.json`, page-source-map, and calls `regeneratePage()` for new page content.
- `scripts/lib/regenerate-page.mjs` — **EXISTS.** S02's LLM regeneration module. `regeneratePage(pagePath, sourceFiles, options)` already handles empty `currentPage` (new page creation). No modifications needed.
- `scripts/lib/build-page-map.mjs` — **EXISTS.** Generates `page-source-map.json`. Contains `COMMAND_OVERRIDES` and `SHARED_COMMAND_DEPS` constants. S03 must update the map when adding/removing commands. New commands use the **algorithmic fallback** (shared deps + `slug.ts` if exists + `prompts/slug.md` if exists) — no override entry needed.
- `astro.config.mjs` — **MODIFY.** Sidebar entries must be added/removed in the Commands section. The sidebar is a JavaScript array of `{ label: string, link: string }` objects.
- `content/generated/commands.json` — **READ.** Extracted command list from `docs/commands.md`. Each entry: `{ command: "/gsd <name>", description: "...", category: "..." }`. This is the source of truth for what commands exist.
- `content/generated/page-source-map.json` — **MODIFY.** New commands get entries; removed commands lose entries.
- `tests/manage-pages.test.mjs` — **NEW.** Tests for detection logic, sidebar manipulation, map updates.

### How Commands Map to Pages

Not every entry in `commands.json` maps to a deep-dive page. The following entries should be **excluded** from new-page detection:
- **Subcommands with arguments** — e.g. `/gsd skill-health <name>`, `/gsd skill-health --declining` — these are variations documented on the parent page
- **Non-/gsd commands** — e.g. `/worktree`, `/clear`, `/exit`, `/kill`, `/model`, `/login`, `/thinking`, `/voice` — these are pi-level commands, not GSD commands
- **Keyboard shortcuts** — `Ctrl+Alt+G`, `Ctrl+Alt+V`, etc.
- **CLI flags** — `gsd --continue`, `gsd --model`, etc.
- **`/gsd help`** — a simple help screen, not a workflow-level command

The filter should be: entries where `command` matches exactly `/gsd <single-word>` (regex: `/^\/gsd [a-z][-a-z]*$/`). The current 27 pages include 3 non-command pages (`keyboard-shortcuts.mdx`, `cli-flags.mdx`, `headless.mdx`) that should be excluded from the new/removed comparison.

**Current pages that ARE commands:** auto, capture, cleanup, config, discuss, doctor, forensics, gsd, hooks, knowledge, migrate, mode, next, pause, prefs, queue, quick, run-hook, skill-health, status, steer, stop, triage, visualize (24 pages).

**Current pages that are NOT commands:** keyboard-shortcuts, cli-flags, headless (3 pages — these are manual pages, not auto-managed).

**Commands in `commands.json` without pages:** `help`, `parallel`. These are intentionally excluded (help is trivial, parallel has subcommands only).

An exclusion list (`EXCLUDED_SLUGS`) should be maintained for commands that intentionally don't get pages.

### Sidebar Manipulation Strategy

The `astro.config.mjs` sidebar Commands section uses a consistent pattern:
```js
{ label: '/gsd <slug>', link: '/commands/<slug>/' },
```

Three special entries exist that don't follow this pattern:
- `{ label: 'Commands Reference', link: '/commands/' }` — always first
- `{ label: 'Keyboard Shortcuts', link: '/commands/keyboard-shortcuts/' }`
- `{ label: 'CLI Flags', link: '/commands/cli-flags/' }`
- `{ label: 'Headless Mode', link: '/commands/headless/' }`

**Strategy:** Read `astro.config.mjs` as text. For additions, insert a new `{ label: '/gsd <slug>', link: '/commands/<slug>/' },` line before the `Keyboard Shortcuts` entry (which acts as a boundary between command entries and non-command entries). For removals, delete the matching line. This is simpler and safer than AST parsing — the file format is stable and predictable.

### Source Dependency Resolution for New Commands

When a new command appears, the module needs to compute its source file dependencies for `page-source-map.json`. Use the same algorithmic fallback from `build-page-map.mjs`:
1. Start with `SHARED_COMMAND_DEPS` (commands.ts, state.ts, types.ts)
2. Check if `src/resources/extensions/gsd/<slug>.ts` exists in manifest → add it
3. Check if `src/resources/extensions/gsd/prompts/<slug>.md` exists in manifest → add it

This gives reasonable deps even without an explicit override mapping. The first regeneration will use these deps; a human can later add an override in `COMMAND_OVERRIDES` for more precision.

### Build Order

1. **T01: Detection logic** — `detectNewAndRemovedCommands()` that compares `commands.json` entries against `.mdx` files in `src/content/docs/commands/`. Tests verify correct filtering, edge cases (subcommands, non-gsd commands, excluded slugs). This is the foundation — everything else depends on accurate detection.

2. **T02: Sidebar and map manipulation** — Functions to add/remove sidebar entries in `astro.config.mjs` and add/remove entries in `page-source-map.json`. Tests verify correct insertion point, removal, and map updates. No LLM dependency — pure file manipulation.

3. **T03: Page creation and removal orchestration** — `createNewPages()` calls `regeneratePage()` for new commands, then updates sidebar + map. `removePages()` deletes `.mdx` files, then updates sidebar + map. Integration test with mock client verifies the full flow. Wire detection+action into a CLI entry point.

### Verification Approach

1. **Unit tests** — `node --test tests/manage-pages.test.mjs`
   - Detection: fake `commands.json` with new command → correctly detected; existing command removed → correctly detected; subcommands/shortcuts/non-gsd commands filtered out
   - Sidebar: adding entry inserts at correct position; removing entry deletes correct line; non-command entries (keyboard-shortcuts, cli-flags, headless) are never touched
   - Map: new command gets correct algorithmic deps; removed command loses its entry
   - Full flow: mock LLM client → page file created + sidebar updated + map updated

2. **Manual smoke test** — Create a fake command scenario:
   - Add a fake entry to `commands.json` (e.g. `/gsd fake-test`) → run detection → verify it's flagged as new
   - Run `createNewPages` with `dryRun: true` → verify it would call `regeneratePage` with correct args
   - Remove an existing command from `commands.json` → run detection → verify it's flagged for removal

3. **Build verification** — After adding a fake page manually and updating sidebar → `npm run build && node scripts/check-links.mjs` passes. After removing → build passes with no broken links to the removed page.

## Constraints

- `astro.config.mjs` is a JavaScript file, not JSON — manipulation must preserve all existing content exactly. Regex-based line insertion/removal is safest for this simple, stable format.
- `regeneratePage()` requires `ANTHROPIC_API_KEY` or a mock client. When no API key is present, `createNewPages()` should return a skip result, not error — matching S02's graceful degradation pattern.
- Command pages live at `src/content/docs/commands/<slug>.mdx` — NOT in `content/generated/docs/`. They are hand-authored (by Claude Code in M002) and are NOT managed by the prebuild script. This is correct — new pages should also be written directly to `src/content/docs/commands/`.
- The page-source-map is generated by `build-page-map.mjs` at build time from hardcoded data. S03 must ALSO update the on-disk `content/generated/page-source-map.json` so the map stays consistent between builds. However, `build-page-map.mjs` will overwrite it on next build — so S03's map changes are transient unless the override list in `build-page-map.mjs` is also updated. For new commands, the algorithmic fallback handles this naturally. For removed commands, `build-page-map.mjs` won't create entries for pages that no longer exist in `src/content/docs/commands/`. So **no modification to `build-page-map.mjs` is needed** — the existing scan of `commandDir` handles additions and removals automatically.
- The `EXCLUDED_SLUGS` list (commands that intentionally don't get pages) should be maintained in `manage-pages.mjs` and kept in sync with reality. Current excludes: `help`, `parallel`.

## Common Pitfalls

- **Matching subcommand variants** — `/gsd skill-health`, `/gsd skill-health <name>`, `/gsd skill-health --declining` all appear in `commands.json`. Only the base command (no args/flags) should map to a page. The regex filter `/^\/gsd [a-z][-a-z]*$/` handles this.
- **The `/gsd` command itself** — The bare `/gsd` command (no subcommand) maps to `gsd.mdx`. The detection regex must handle this special case — it's `/gsd` without any suffix, not `/gsd gsd`.
- **Sidebar insertion order** — New entries should be inserted alphabetically among existing command entries, or at minimum before the "Keyboard Shortcuts" boundary. Alphabetical is preferred for consistency but the current sidebar isn't strictly alphabetical (it follows a thematic order). Inserting before "Keyboard Shortcuts" is the simplest safe choice.
- **Page-source-map regeneration** — `build-page-map.mjs` runs during `npm run build` (via prebuild hook). It scans `src/content/docs/commands/*.mdx` for command pages. So adding a new `.mdx` file before build means the map will pick it up automatically. No need for S03 to manually edit `build-page-map.mjs` overrides — the algorithmic fallback works for simple new commands.
