---
estimated_steps: 8
estimated_files: 2
---

# T01: Extend manage-pages.mjs with prompt detection, sidebar, and CRUD functions

**Slice:** S05 — Pipeline integration
**Milestone:** M005

## Description

Add 5 new exported functions to `scripts/lib/manage-pages.mjs` for prompt page lifecycle management, mirroring the existing command page functions but adapted for prompt-specific patterns (group-aware sidebar nesting, `prompts.json` as metadata source, prompt `.md` source files for detection).

The key complexity is sidebar manipulation: prompt entries are nested 2 levels deep (`Prompts → Sub-group → entries`) unlike commands which are 1 level deep. The `addPromptSidebarEntry` function must determine the prompt's group from `prompts.json`, find the correct sub-group's items array in `astro.config.mjs`, and insert alphabetically within that group.

Detection uses the prompt `.md` files from the globally-installed gsd-pi package as the source of truth (via `resolvePackagePath()` from `extract-local.mjs`), comparing against existing `src/content/docs/prompts/*.mdx` pages.

Add comprehensive tests for each new function using temp directories, following the same patterns as the existing command page tests.

## Steps

1. **Add prompt detection function.** Import `resolvePackagePath` from `extract-local.mjs`. Add `detectNewAndRemovedPrompts(options?)` that:
   - Reads prompt `.md` files from `{pkgPath}/src/resources/extensions/gsd/prompts/` to get source slugs (filename without `.md`)
   - Reads existing `src/content/docs/prompts/*.mdx` to get existing page slugs
   - Returns `{ newPrompts: string[], removedPrompts: string[] }`
   - Accepts `options.promptsSourceDir` and `options.promptsPageDir` overrides for testability
   - Unlike command detection, there are no excluded slugs or non-prompt pages to filter out

2. **Add prompt sidebar entry insertion.** Add `addPromptSidebarEntry(slug, options?)` that:
   - Reads `prompts.json` to determine the prompt's group (`auto-mode-pipeline`, `guided-variants`, `commands`, `foundation`)
   - Maps group names to sidebar labels: `auto-mode-pipeline` → `'Auto-mode Pipeline'`, `guided-variants` → `'Guided Variants'`, `commands` → `'Commands'`, `foundation` → `'Foundation'`
   - Finds the sub-group's items block in `astro.config.mjs` by searching for the sub-group label within the Prompts section
   - Inserts `{ label: '{slug}', link: '/prompts/{slug}/' },` in alphabetical order within that sub-group's items
   - Uses the correct indentation (16 spaces — 4 deeper than command entries because of the extra nesting level)
   - Accepts `options.configPath` and `options.promptsJsonPath` overrides

3. **Add prompt sidebar entry removal.** Add `removePromptSidebarEntry(slug, options?)` that:
   - Searches across all 4 sub-groups in `astro.config.mjs` for a line containing `link: '/prompts/{slug}/'`
   - Removes the matching line
   - Returns `{ removed: boolean, slug, reason? }`
   - Accepts `options.configPath` override

4. **Add prompt page creation orchestrator.** Add `createNewPromptPages(newPrompts, options?)` that:
   - For each slug: writes a stub MDX file to `src/content/docs/prompts/{slug}.mdx` with frontmatter (title = slug, description = "Prompt reference: {slug}") and `:::caution` scaffold notice
   - Calls `addPromptSidebarEntry(slug)` to add the sidebar entry
   - Does NOT add to page-source-map (that's handled by `build-page-map.mjs` Section 6, which already works)
   - Returns `{ results, created, failed }`
   - Accepts `options.dryRun`, `options.configPath`, `options.promptsJsonPath`, `options.promptsDir`

5. **Add prompt page removal orchestrator.** Add `removePromptPages(removedPrompts, options?)` that:
   - For each slug: deletes `src/content/docs/prompts/{slug}.mdx`, calls `removePromptSidebarEntry(slug)`
   - Does NOT remove from page-source-map (analogous to how command removal handles the map separately, and `build-page-map.mjs` regenerates from `prompts.json`)
   - Returns `{ results, removed, failed }`

6. **Update module exports and header comment.** Add the 5 new functions to the module header comment's Exports list. Update CLI entry point to also detect and manage prompts (add `--prompts` flag or integrate into existing `--execute` flow).

7. **Write detection tests.** In `tests/manage-pages.test.mjs`, add a new `describe("detectNewAndRemovedPrompts")` block with tests:
   - Detects a new prompt when source `.md` file exists but no `.mdx` page
   - Detects a removed prompt when `.mdx` page exists but no source `.md` file
   - Returns empty arrays when all prompts match pages
   - All tests use temp directories with fixture prompt files

8. **Write sidebar and CRUD tests.** Add test blocks:
   - `describe("addPromptSidebarEntry")`: inserts into correct sub-group, maintains alphabetical order, has correct indentation and label/link format
   - `describe("removePromptSidebarEntry")`: removes from correct sub-group, returns `removed: false` for nonexistent slug
   - `describe("createNewPromptPages")`: creates scaffold, updates sidebar; `dryRun` skips writes
   - `describe("removePromptPages")`: deletes file and sidebar entry, handles missing file gracefully
   - Sidebar tests use a copy of the real `astro.config.mjs` (via `makeAstroConfig()` which already reads the real file)

## Observability Impact

- **What signals change:** This task adds 5 prompt-management functions whose outputs are inspectable via `node scripts/lib/manage-pages.mjs` (detect-only) or `--execute`/`--dry-run` flags in the CLI entry point, extended to cover prompt detection alongside command detection.
- **How a future agent inspects:** `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(m.detectNewAndRemovedPrompts()))"` — both arrays empty confirms sync. `grep -n '/prompts/' astro.config.mjs` shows sidebar state. `ls src/content/docs/prompts/*.mdx | wc -l` counts existing pages.
- **Failure visibility:** `createNewPromptPages()` and `removePromptPages()` return structured `{ results, created/removed, failed }` objects. Each failed result includes an `.error` field with the exception message. Callers can check `result.failed > 0` to surface problems. The CLI entry point prints `✗ {slug}: {error}` per failed operation to stdout.
- **Test suite as observability:** `node --test tests/manage-pages.test.mjs` covers all 5 new functions — a failing test directly identifies which function broke and under what input condition.

## Must-Haves

- [ ] `detectNewAndRemovedPrompts()` exported and correctly compares source `.md` files against existing `.mdx` pages
- [ ] `addPromptSidebarEntry()` inserts into the correct sidebar sub-group based on prompt group from `prompts.json`
- [ ] `removePromptSidebarEntry()` finds and removes entries across all 4 sub-groups
- [ ] `createNewPromptPages()` creates stub MDX + sidebar entry per slug
- [ ] `removePromptPages()` deletes MDX file + sidebar entry per slug
- [ ] All existing command page tests still pass (no regressions)
- [ ] New prompt tests cover detection, sidebar manipulation, and CRUD operations

## Verification

- `node --test tests/manage-pages.test.mjs` — all tests pass (existing + new)
- Check that the real project shows no new/removed prompts: `node -e "import('./scripts/lib/manage-pages.mjs').then(m => { const r = m.detectNewAndRemovedPrompts(); console.log(r); })"`  — both arrays empty

## Inputs

- `scripts/lib/manage-pages.mjs` — existing 473-line module with 7 command-page exports, to be extended
- `tests/manage-pages.test.mjs` — existing 480-line test file with command page test patterns to follow
- `astro.config.mjs` — real sidebar structure showing prompt sub-group nesting (lines 70-125)
- `content/generated/prompts.json` — 32 entries with `slug`, `name`, `group` fields for sidebar group mapping
- `scripts/lib/extract-local.mjs` — provides `resolvePackagePath()` for finding gsd-pi package directory

## Expected Output

- `scripts/lib/manage-pages.mjs` — extended with 5 new exported functions for prompt page lifecycle
- `tests/manage-pages.test.mjs` — extended with test describe blocks for all 5 prompt functions
