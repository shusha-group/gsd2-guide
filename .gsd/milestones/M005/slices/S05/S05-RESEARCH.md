# S05: Pipeline integration — Research

**Date:** 2026-03-19
**Status:** Ready for planning

## Summary

S05 extends the `npm run update` pipeline to handle prompt pages the same way it handles command pages — detecting new/removed prompts, scaffolding/removing pages, and regenerating stale pages. The good news: **stale detection and regeneration already work for prompt pages** because `page-source-map.json` (built in S02) already has 32 `prompts/{slug}.mdx` entries with source deps, and both `diff-sources.mjs` and `check-page-freshness.mjs` iterate over ALL map entries regardless of page type. The regeneration function (`regeneratePage()`) also works generically — it reads the page, reads source files, and writes back.

What's actually missing is narrower than the roadmap suggested:

1. **`manage-pages.mjs` has no prompt equivalent** — `detectNewAndRemovedCommands()`, `createNewPages()`, and `removePages()` are command-specific. Analogous functions are needed for prompts.
2. **`update.mjs` has no "manage prompts" pipeline step** — the `runManageCommands()` step only handles commands. A parallel `runManagePrompts()` step is needed.
3. **`page-versions.json` has no prompt page stamps** — the 32 prompt pages are unstamped (confirmed: 0 prompt entries). The stamp step at the end of `npm run update` will stamp them automatically once the pipeline runs, but the first run will flag all 32 as stale.
4. **The regeneration system prompt is command-page-specific** — `buildSystemPrompt()` in `regenerate-page.mjs` has section rules for command pages (Usage, How It Works, What Files It Touches, etc.). Prompt pages use a different 4-section structure (D056). This needs a page-type-aware system prompt.

## Recommendation

Extend `manage-pages.mjs` with prompt-specific detection and CRUD functions, add a "manage prompts" step to `update.mjs`, and make `regenerate-page.mjs` page-type-aware. Pre-stamp the 32 existing prompt pages in `page-versions.json` to avoid a mass stale flag on first run.

The work divides cleanly into 3 tasks:
1. Extend `manage-pages.mjs` with prompt functions + tests
2. Extend `update.mjs` with the manage-prompts pipeline step + make `regenerate-page.mjs` prompt-aware
3. End-to-end verification with a simulated prompt change

## Implementation Landscape

### Key Files

- **`scripts/lib/manage-pages.mjs`** (473 lines) — Currently exports 7 functions for command page lifecycle. Needs 5 new exports: `detectNewAndRemovedPrompts()`, `addPromptSidebarEntry()`, `removePromptSidebarEntry()`, `createNewPromptPages()`, `removePromptPages()`. Does NOT need `addPromptToPageMap()` / `removePromptFromPageMap()` because prompt page-source-map entries are built by `build-page-map.mjs` Section 6 (already working from S02).

- **`scripts/update.mjs`** (215 lines) — Pipeline orchestrator with 9 steps. Needs a new `runManagePrompts()` function and a "manage prompts" step inserted after "manage commands" (step index 3). The step array assertion in `tests/update-pipeline.test.mjs` needs updating (9 → 10 steps).

- **`scripts/lib/regenerate-page.mjs`** (338 lines) — `buildSystemPrompt()` hardcodes command-page quality rules. Needs a conditional: if pagePath starts with `prompts/`, use a prompt-page system prompt with the 4-section structure (What It Does → Pipeline Position → Variables → Used By) and a prompt page exemplar instead of `commands/capture.mdx`.

- **`scripts/check-page-freshness.mjs`** — **No changes needed.** Already iterates all entries in `page-source-map.json`. Prompt pages are already covered.

- **`scripts/lib/diff-sources.mjs`** — **No changes needed.** `resolveStalePages()` is page-type-agnostic.

- **`scripts/lib/build-page-map.mjs`** — **No changes needed.** Section 6 already builds prompt entries from `prompts.json`.

- **`page-versions.json`** — Needs initial stamping for the 32 prompt pages. Either run `node scripts/check-page-freshness.mjs --stamp` after verifying pages are current, or stamp as part of the E2E test.

- **`content/generated/prompts.json`** — Source of truth for prompt slugs, groups, names. The detection function reads this (analogous to how `detectNewAndRemovedCommands` reads `commands.json`).

- **`tests/manage-pages.test.mjs`** (480 lines) — Needs new test describe blocks for prompt detection, sidebar, and CRUD functions.

- **`tests/update-pipeline.test.mjs`** — Step count assertion changes from 9 to 10.

### Prompt Detection Logic

`detectNewAndRemovedPrompts()` is simpler than the command equivalent because prompts have a 1:1 mapping (prompt name = slug = filename without `.md`):

- **Source of truth:** Scan the actual prompt `.md` files in the gsd-pi package directory (`resolvePackagePath()` + `/src/resources/extensions/gsd/prompts/`) to get the set of current prompt names.
- **Existing pages:** Scan `src/content/docs/prompts/*.mdx` to get existing page slugs.
- **New:** In source but not in pages directory.
- **Removed:** In pages directory but not in source.

This differs from command detection which reads `commands.json`. For prompts, the canonical source is the filesystem directory of `.md` files, since `prompts.json` is a derived artifact that may be stale.

### Sidebar Manipulation

The prompt sidebar structure is nested 2 levels deep (Prompts → Sub-group → entries), unlike commands which are 1 level deep. This means:

- **`addPromptSidebarEntry(slug)`** needs to determine the prompt's group (from `prompts.json`), find the correct sub-group section, and insert the entry alphabetically within that group's items array.
- **`removePromptSidebarEntry(slug)`** needs to find the entry by its link pattern `/prompts/{slug}/` across all 4 sub-groups and remove it.

The group-aware insertion is the most complex part. Map from prompt name to group using `prompts.json` or the `PROMPT_GROUPS` constant in `extract-prompts.mjs`.

### Regeneration System Prompt

`regenerate-page.mjs` currently uses `commands/capture.mdx` as the exemplar. For prompt pages, use a prompt page exemplar (e.g. `prompts/execute-task.mdx` — the most complete prompt page). The system prompt should specify the 4-section structure from D056 and the Mermaid styling rules.

The simplest approach: in `regeneratePage()`, check if `pagePath.startsWith('prompts/')`. If so, use `buildPromptSystemPrompt()` with a prompt exemplar. Otherwise use the existing `buildSystemPrompt()` for commands.

### Build Order

1. **First: `manage-pages.mjs` prompt functions + tests** — This is the core new code. Test it in isolation with temp directories (same pattern as existing command tests). No dependencies on other changes.

2. **Second: `update.mjs` step + `regenerate-page.mjs` prompt awareness** — Wire the new functions into the pipeline and make regeneration page-type-aware. Update `tests/update-pipeline.test.mjs` step count.

3. **Third: E2E verification** — Stamp current prompt pages, simulate a prompt `.md` file change by touching `page-versions.json`, verify `npm run update` detects staleness and pipeline exits 0.

### Verification Approach

**Unit tests:**
- `node --test tests/manage-pages.test.mjs` — new prompt tests pass alongside existing command tests
- `node --test tests/update-pipeline.test.mjs` — step count updated to 10

**Integration:**
- Modify a prompt page's stamp in `page-versions.json` (change a SHA) to simulate staleness → `node scripts/check-page-freshness.mjs` reports it as stale
- `npm run build` exits 0
- `npm run check-links` exits 0

**End-to-end proof (from roadmap):**
- Run `npm run update` end-to-end → pipeline detects stale prompt page → attempts regeneration (or skips if claude not available) → exits 0

## Constraints

- Sidebar insertion for prompts must be group-aware (4 nested sub-groups). The insertion point depends on the prompt's group from `prompts.json`. This is harder than command sidebar insertion which just inserts before "Keyboard Shortcuts".
- The `page-versions.json` file must be stamped for prompt pages before the first pipeline run, otherwise all 32 prompt pages will be flagged stale and attempted for regeneration on every run until stamped.
- The regeneration system prompt for prompt pages must specify backtick-wrapping for `{{variable}}` syntax (D061) to avoid MDX build errors.

## Common Pitfalls

- **Sidebar nesting depth** — Command sidebar entries are at one nesting level; prompt entries are nested inside sub-groups. The `addPromptSidebarEntry` function must find the right sub-group's `items` array, not just insert before a boundary marker. Test carefully with the real `astro.config.mjs` structure.
- **Detection source of truth** — Using `prompts.json` for detection is tempting but wrong because `prompts.json` is regenerated by `extract.mjs` (which runs earlier in the pipeline). The detection function should read the prompt `.md` files from the gsd-pi package directory directly, matching the pattern `detectNewAndRemovedCommands` uses with `commands.json`. Alternatively, since `prompts.json` IS regenerated before the manage step runs, it can serve as source of truth — but only if the extract step already ran.
