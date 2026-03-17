---
estimated_steps: 5
estimated_files: 2
---

# T02: Wire createNewPages and removePages orchestration with mock LLM verification

**Slice:** S03 — New/Removed Command Handling
**Milestone:** M003

## Description

Add the top-level orchestration functions `createNewPages()` and `removePages()` to `scripts/lib/manage-pages.mjs`. These compose the primitives from T01 (detection, sidebar manipulation, map manipulation) with S02's `regeneratePage()` to form the complete new/removed command handling flow. Add a CLI entry point for standalone use. Write integration tests using a mock Anthropic client that verify the full flow end-to-end.

These three exported functions (`detectNewAndRemovedCommands`, `createNewPages`, `removePages`) are the S03→S04 boundary contract — S04 will import and call them from the update pipeline.

## Steps

1. **Add `createNewPages(newCommands, options)` to `manage-pages.mjs`:**
   - Takes `newCommands: string[]` (array of slugs) and `options` object.
   - `options` supports: `client` (mock Anthropic client, same DI pattern as S02), `dryRun` (boolean), `configPath`, `mapPath`, `manifestPath`, `commandsDir`, `pkgPath`, `model`, `maxTokens`.
   - For each slug in `newCommands`:
     1. Compute source files using the algorithmic fallback (same logic as `addToPageMap` — shared deps + slug.ts + prompts/slug.md from manifest).
     2. Call `regeneratePage(`commands/${slug}.mdx`, sourceFiles, { client, dryRun, pkgPath, model, maxTokens })` from `../lib/regenerate-page.mjs`.
     3. If regeneration succeeded (not skipped, not error), call `addSidebarEntry(slug, options)` and `addToPageMap(slug, options)`.
     4. If regeneration was skipped (no API key), still return skip info — don't add sidebar/map entries for pages that weren't created.
   - Return `{ results: Array<{ slug, regeneration, sidebar, map }>, created: number, skipped: number, failed: number }`.

2. **Add `removePages(removedCommands, options)` to `manage-pages.mjs`:**
   - Takes `removedCommands: string[]` (array of slugs) and `options` object.
   - `options` supports: `configPath`, `mapPath`, `commandsDir`.
   - For each slug in `removedCommands`:
     1. Delete the `.mdx` file at `src/content/docs/commands/${slug}.mdx` (or `options.commandsDir/${slug}.mdx`). Use `fs.unlinkSync`. If file doesn't exist, log warning but continue.
     2. Call `removeSidebarEntry(slug, options)`.
     3. Call `removeFromPageMap(slug, options)`.
   - Return `{ results: Array<{ slug, fileDeleted, sidebar, map }>, removed: number, failed: number }`.

3. **Add CLI entry point** — detect direct-run via `process.argv[1]` matching `import.meta.url` (same pattern as S01/S02 modules):
   - `node scripts/lib/manage-pages.mjs` — detect-only mode: runs `detectNewAndRemovedCommands()` and prints results.
   - `node scripts/lib/manage-pages.mjs --execute` — full mode: detect, then create new pages and remove old pages. Requires ANTHROPIC_API_KEY for page creation.
   - `node scripts/lib/manage-pages.mjs --dry-run` — detect + simulate execution without writing files.
   - Print structured output: new commands found, removed commands found, actions taken.

4. **Write integration tests** in `tests/manage-pages.test.mjs` (append to existing test file from T01):

   **createNewPages tests:**
   - Mock client returns valid frontmatter response. Given 1 new slug → page file created at correct path, sidebar entry added, map entry added, result has `created: 1`.
   - `dryRun: true` → regeneratePage called with dryRun, no sidebar/map changes.
   - No API key and no client → result has `skipped: 1`, no sidebar/map changes.
   - Multiple new commands → all processed, results array has entries for each.

   **removePages tests:**
   - Given 1 slug with existing page file → file deleted, sidebar entry removed, map entry removed, result has `removed: 1`.
   - Given slug where file doesn't exist → warns but continues, sidebar/map still cleaned.
   - Multiple removals → all processed correctly.

   **Full round-trip test:**
   - Set up temp directory with commands.json (including a new command), astro.config.mjs copy, page-source-map.json copy, manifest.json copy, and a commands/ dir with existing pages.
   - Run `detectNewAndRemovedCommands()` → verify new command detected.
   - Run `createNewPages()` with mock client → verify page file, sidebar, map all updated.
   - Modify commands.json to remove a command.
   - Run `detectNewAndRemovedCommands()` → verify removed command detected.
   - Run `removePages()` → verify page file deleted, sidebar cleaned, map cleaned.

5. **Verify everything:**
   - `node --test tests/manage-pages.test.mjs` — all tests pass (T01 + T02 tests)
   - `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m)))"` — exports include `detectNewAndRemovedCommands`, `createNewPages`, `removePages`
   - `node scripts/lib/manage-pages.mjs` — CLI detect-only mode works against real project files

## Must-Haves

- [ ] `createNewPages()` calls `regeneratePage()` for each new command with correct pagePath and sourceFiles
- [ ] `createNewPages()` updates sidebar and map only when regeneration succeeds
- [ ] `createNewPages()` returns structured results with per-slug details and aggregate counts
- [ ] `createNewPages()` with no API key and no client returns skip result (graceful degradation)
- [ ] `removePages()` deletes `.mdx` file, removes sidebar entry, and removes map entry for each slug
- [ ] `removePages()` handles missing files gracefully (warns, continues)
- [ ] CLI entry point works in detect-only, execute, and dry-run modes
- [ ] Integration tests verify full create and remove flows with mock client
- [ ] All exports match S03→S04 boundary contract: `detectNewAndRemovedCommands`, `createNewPages`, `removePages`

## Verification

- `node --test tests/manage-pages.test.mjs` — all tests pass (expect ~20+ total tests across T01 and T02)
- `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m)))"` — shows `detectNewAndRemovedCommands`, `createNewPages`, `removePages` (plus T01's primitives)
- `node scripts/lib/manage-pages.mjs` — CLI runs detect-only mode and prints results without errors

## Inputs

- `scripts/lib/manage-pages.mjs` from T01 — has `detectNewAndRemovedCommands`, `addSidebarEntry`, `removeSidebarEntry`, `addToPageMap`, `removeFromPageMap` already implemented and tested
- `tests/manage-pages.test.mjs` from T01 — existing test file to extend
- `scripts/lib/regenerate-page.mjs` — S02's module. Import `regeneratePage` from it. Key facts:
  - Signature: `regeneratePage(pagePath, sourceFiles, options)` where `pagePath` is content-relative like `"commands/capture.mdx"`, `sourceFiles` is array of repo-relative paths, `options` includes `{ client, dryRun, pkgPath, model, maxTokens }`
  - Returns: `{ pagePath, inputTokens, outputTokens, model, elapsedMs, stopReason }` on success, `{ skipped: true, reason }` when no API key, `{ error: string, details }` on failure
  - Mock client shape: `{ messages: { create: async (args) => response } }` where response has `{ content: [{ text: "---\ntitle: ...\n---\n..." }], model, stop_reason, usage: { input_tokens, output_tokens } }`
  - When `currentPage` is empty string (new page), it generates from scratch using source files and exemplar
- S02 Forward Intelligence: `regeneratePage()` reads the page from `src/content/docs/` — when it's a new page, the file doesn't exist yet and `currentPage` is empty string, which triggers new-page generation mode

## Expected Output

- `scripts/lib/manage-pages.mjs` — updated with `createNewPages()`, `removePages()`, and CLI entry point added to the module from T01
- `tests/manage-pages.test.mjs` — extended with integration tests for orchestration functions. Total ~20+ tests.
