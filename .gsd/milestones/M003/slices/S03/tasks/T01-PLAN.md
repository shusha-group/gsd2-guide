---
estimated_steps: 6
estimated_files: 2
---

# T01: Build detection logic and sidebar/map manipulation primitives

**Slice:** S03 — New/Removed Command Handling
**Milestone:** M003

## Description

Create the `scripts/lib/manage-pages.mjs` module with the core logic for detecting new/removed commands and manipulating sidebar entries and page-source-map entries. This is the foundation — T02 builds orchestration on top of these primitives.

The detection logic compares `commands.json` entries against existing `.mdx` files in `src/content/docs/commands/`. The key filter is: only entries where the command field matches exactly `/gsd <single-word>` (regex: `/^\/gsd [a-z][-a-z]*$/`) map to pages. There's also the special case of `/gsd` itself (the bare command, maps to `gsd.mdx`).

Sidebar manipulation reads `astro.config.mjs` as text and inserts/removes lines. New entries go before the "Keyboard Shortcuts" line. Removal deletes the matching line.

Map manipulation reads/writes `page-source-map.json` as JSON. New commands get algorithmic deps (shared deps + slug.ts if exists + prompts/slug.md if exists). Removal deletes the key.

## Steps

1. **Create `scripts/lib/manage-pages.mjs`** with the following exports:

   **`detectNewAndRemovedCommands(options)`** — Core detection function.
   - Read `commands.json` from `content/generated/commands.json` (or `options.commandsPath`)
   - Extract command slugs: filter entries matching `/^\/gsd [a-z][-a-z]*$/`, plus handle the special `/gsd` entry (slug = `gsd`). Extract the slug from each matching command (last word after `/gsd `).
   - Also handle the bare `/gsd` command: if `command === "/gsd"`, slug is `gsd`.
   - Maintain `EXCLUDED_SLUGS = ['help', 'parallel']` — commands that intentionally don't get pages.
   - Maintain `NON_COMMAND_PAGES = ['keyboard-shortcuts', 'cli-flags', 'headless']` — pages that exist in commands/ but aren't auto-managed.
   - Read existing `.mdx` files from `src/content/docs/commands/` (or `options.commandsDir`).
   - Extract existing slugs from filenames (strip `.mdx`), excluding `NON_COMMAND_PAGES`.
   - New commands = slugs in commands.json but not in existing pages (minus excluded).
   - Removed commands = slugs with existing pages but not in commands.json.
   - Return `{ newCommands: string[], removedCommands: string[] }`.

   **`addSidebarEntry(slug, options)`** — Add a sidebar entry for a new command.
   - Read `astro.config.mjs` (from `options.configPath` or default).
   - Find the line containing `'Keyboard Shortcuts'` — this is the boundary.
   - Insert `            { label: '/gsd ${slug}', link: '/commands/${slug}/' },\n` before that line.
   - Write the modified content back.
   - Return `{ added: true, slug }`.

   **`removeSidebarEntry(slug, options)`** — Remove a sidebar entry for a removed command.
   - Read `astro.config.mjs`.
   - Find and remove the line matching `/gsd ${slug}` in the sidebar.
   - Special case: for slug `gsd`, the label is `/gsd` not `/gsd gsd`, so match `label: '/gsd'` with link `/commands/gsd/`.
   - Write the modified content back.
   - Return `{ removed: true, slug }` or `{ removed: false, slug, reason: 'not found' }`.

   **`addToPageMap(slug, options)`** — Add a page-source-map entry for a new command.
   - Read `page-source-map.json` (from `options.mapPath` or default).
   - Read `manifest.json` (from `options.manifestPath` or default) to check for slug.ts and prompts/slug.md.
   - Compute algorithmic deps: start with `SHARED_COMMAND_DEPS` (same constants as build-page-map.mjs: `src/resources/extensions/gsd/commands.ts`, `state.ts`, `types.ts`), add `src/resources/extensions/gsd/${slug}.ts` if it exists in manifest, add `src/resources/extensions/gsd/prompts/${slug}.md` if it exists in manifest.
   - Set `map["commands/${slug}.mdx"] = deps`.
   - Write the updated map back.
   - Return `{ added: true, slug, deps }`.

   **`removeFromPageMap(slug, options)`** — Remove a page-source-map entry.
   - Read `page-source-map.json`.
   - Delete `map["commands/${slug}.mdx"]`.
   - Write back.
   - Return `{ removed: true, slug }` or `{ removed: false, slug, reason: 'not found' }`.

2. **Write `tests/manage-pages.test.mjs`** with comprehensive tests using `node:test` and `node:assert/strict`. Use temp directories (via `fs.mkdtempSync`) for all file operations to avoid modifying the real project files.

   **Detection tests:**
   - Given commands.json with a new command (e.g., `/gsd fake-test`) and no `fake-test.mdx` → `newCommands` includes `fake-test`
   - Given a `removed-cmd.mdx` page but no `/gsd removed-cmd` in commands.json → `removedCommands` includes `removed-cmd`
   - Subcommands filtered: `/gsd skill-health <name>` not detected as separate command
   - Non-gsd commands filtered: `/worktree`, `/clear`, `/exit` etc. not detected
   - Keyboard shortcuts filtered: `Ctrl+Alt+G` etc. not detected
   - CLI flags filtered: `gsd --continue` etc. not detected
   - Excluded slugs: `/gsd help` and `/gsd parallel start` not detected as new even without pages
   - Non-command pages: `keyboard-shortcuts.mdx`, `cli-flags.mdx`, `headless.mdx` never flagged as removed
   - The bare `/gsd` command maps to slug `gsd` correctly
   - When all commands match pages → both arrays empty

   **Sidebar tests (using temp copies of astro.config.mjs):**
   - `addSidebarEntry('fake-test')` inserts line before "Keyboard Shortcuts"
   - Added line has correct format: `{ label: '/gsd fake-test', link: '/commands/fake-test/' },`
   - `removeSidebarEntry('auto')` removes the `/gsd auto` line
   - `removeSidebarEntry('gsd')` removes the bare `/gsd` line (special case)
   - `removeSidebarEntry('nonexistent')` returns `{ removed: false }`
   - Non-command entries (Keyboard Shortcuts, CLI Flags, Headless Mode) are never affected

   **Map tests (using temp files):**
   - `addToPageMap('fake-test')` creates entry with at least shared deps
   - `removeFromPageMap('auto')` removes the `commands/auto.mdx` key
   - `removeFromPageMap('nonexistent')` returns `{ removed: false }`

3. **Add the `SHARED_COMMAND_DEPS` constant** — same values as in `build-page-map.mjs`:
   ```js
   const GSD = 'src/resources/extensions/gsd';
   const SHARED_COMMAND_DEPS = [`${GSD}/commands.ts`, `${GSD}/state.ts`, `${GSD}/types.ts`];
   ```

4. **Handle options/defaults pattern** — every function takes an `options` object with path overrides for testability. Defaults resolve from `ROOT` (project root, computed via `import.meta.url`). This matches the DI pattern established in S01 and S02.

5. **Run tests** and iterate until all pass.

6. **Verify module exports** — `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m)))"` should show all 5 primitives.

## Must-Haves

- [ ] `detectNewAndRemovedCommands()` correctly identifies new and removed commands
- [ ] Regex filter `/^\/gsd [a-z][-a-z]*$/` plus bare `/gsd` case excludes subcommands, non-gsd commands, shortcuts, flags
- [ ] `EXCLUDED_SLUGS` = `['help', 'parallel']` prevents pages for intentionally-excluded commands
- [ ] `NON_COMMAND_PAGES` = `['keyboard-shortcuts', 'cli-flags', 'headless']` are never flagged for removal
- [ ] `addSidebarEntry()` inserts before "Keyboard Shortcuts" with correct format and indentation
- [ ] `removeSidebarEntry()` removes only the target line, handles the bare `/gsd` special case
- [ ] `addToPageMap()` computes correct algorithmic deps from manifest
- [ ] `removeFromPageMap()` cleanly removes the key
- [ ] All tests pass with `node --test tests/manage-pages.test.mjs`

## Verification

- `node --test tests/manage-pages.test.mjs` — all detection, sidebar, and map tests pass
- `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m)))"` — shows exported functions

## Observability Impact

- **New inspection surface:** All 5 exported functions return structured result objects (`{ added/removed: boolean, slug, deps?, reason? }`) — future agents can inspect return values directly without parsing logs.
- **Detection signal:** `detectNewAndRemovedCommands()` return shape lets the caller (T02's orchestration) decide actions per-slug. No side effects — pure detection.
- **Failure visibility:** Missing files throw with standard Node.js I/O errors (ENOENT). Sidebar/map entry not-found returns `{ removed: false, reason: 'not found' }` rather than throwing — distinguishes "target absent" from "I/O failure".
- **Test coverage:** ~15 test cases in `tests/manage-pages.test.mjs` cover every edge case. Test failures identify the exact function and edge case.

## Inputs

- `content/generated/commands.json` — extracted command list from gsd-pi's docs/commands.md. Each entry has `{ command, description, category }`. Example: `{ "command": "/gsd auto", "description": "...", "category": "Session Commands" }`.
- `content/generated/page-source-map.json` — maps page keys like `commands/auto.mdx` to arrays of repo-relative source paths.
- `content/generated/manifest.json` — has `.files` property which is `Record<string, string>` (path→sha). Used to check if `slug.ts` or `prompts/slug.md` exist for algorithmic deps.
- `astro.config.mjs` — sidebar config. The Commands section has entries like `{ label: '/gsd auto', link: '/commands/auto/' },` with "Keyboard Shortcuts" as the boundary between command entries and non-command entries. Indentation is 12 spaces (3 levels of 4-space indent).
- `src/content/docs/commands/*.mdx` — 27 existing command page files.

## Expected Output

- `scripts/lib/manage-pages.mjs` — new module exporting `detectNewAndRemovedCommands`, `addSidebarEntry`, `removeSidebarEntry`, `addToPageMap`, `removeFromPageMap`
- `tests/manage-pages.test.mjs` — comprehensive test file with ~15 test cases covering all edge cases
