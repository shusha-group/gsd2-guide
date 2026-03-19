# S05: Pipeline integration

**Goal:** `manage-pages.mjs` extended for prompt pages, `update.mjs` has a "manage prompts" step, `regenerate-page.mjs` is prompt-page-aware, and `npm run update` detects stale prompt pages and runs the pipeline end-to-end without errors.
**Demo:** Run `npm run update` — pipeline exits 0 with 10 steps. Modify a prompt page stamp in `page-versions.json` → `node scripts/check-page-freshness.mjs` reports it as stale.

## Must-Haves

- `manage-pages.mjs` exports 5 new functions: `detectNewAndRemovedPrompts()`, `addPromptSidebarEntry()`, `removePromptSidebarEntry()`, `createNewPromptPages()`, `removePromptPages()`
- `update.mjs` has a "manage prompts" step (10 total steps) that calls `detectNewAndRemovedPrompts` and scaffolds/removes prompt pages
- `regenerate-page.mjs` uses a prompt-specific system prompt (4-section structure: What It Does → Pipeline Position → Variables → Used By) when the page path starts with `prompts/`
- `page-versions.json` has 32 prompt page stamps so they're not flagged stale on first pipeline run
- All existing tests pass; new tests cover prompt detection, sidebar manipulation, and page CRUD
- `npm run build` exits 0; `npm run check-links` exits 0
- Pipeline step count test updated from 9 to 10

## Proof Level

- This slice proves: integration
- Real runtime required: yes (pipeline must run end-to-end)
- Human/UAT required: no

## Verification

- `node --test tests/manage-pages.test.mjs` — all tests pass (existing + new prompt tests)
- `node --test tests/update-pipeline.test.mjs` — 10-step assertion passes
- `python3 -c "import json; d=json.load(open('page-versions.json')); print(len([k for k in d if k.startswith('prompts/')]))"` → 32
- `node scripts/check-page-freshness.mjs` — exits 0 (all pages fresh)
- `npm run build` — exits 0
- Simulate stale detection: modify one prompt page stamp in `page-versions.json`, run `node scripts/check-page-freshness.mjs`, confirm the modified page is reported stale

## Integration Closure

- Upstream surfaces consumed: `content/generated/prompts.json` (S01), `page-source-map.json` with 32 prompt entries (S02), prompt `.md` source files in gsd-pi package
- New wiring introduced in this slice: `runManagePrompts()` function in `update.mjs`, prompt-aware `buildPromptSystemPrompt()` in `regenerate-page.mjs`
- What remains before the milestone is truly usable end-to-end: nothing — this is the final slice

## Tasks

- [ ] **T01: Extend manage-pages.mjs with prompt detection, sidebar, and CRUD functions** `est:45m`
  - Why: The pipeline needs prompt-specific equivalents of the command page management functions — detection of new/removed prompts, group-aware sidebar insertion/removal, and scaffold page creation/deletion. These are the building blocks that T02 wires into the pipeline.
  - Files: `scripts/lib/manage-pages.mjs`, `tests/manage-pages.test.mjs`
  - Do: Add 5 exported functions for prompt page lifecycle: `detectNewAndRemovedPrompts()` scans prompt `.md` files from the gsd-pi package directory against existing `src/content/docs/prompts/*.mdx` pages. `addPromptSidebarEntry(slug)` determines the prompt's group from `prompts.json` and inserts into the correct sidebar sub-group alphabetically. `removePromptSidebarEntry(slug)` finds and removes by link pattern across all 4 sub-groups. `createNewPromptPages(slugs)` creates stub MDX + sidebar + page-source-map entry. `removePromptPages(slugs)` deletes file + sidebar + map entry. Add comprehensive tests for each function using temp directories.
  - Verify: `node --test tests/manage-pages.test.mjs` — all tests pass (existing command tests + new prompt tests)
  - Done when: All 5 prompt functions exported, tested, and the existing command tests still pass

- [ ] **T02: Wire prompt pipeline step, prompt-aware regeneration, and stamp pages** `est:40m`
  - Why: The new manage-pages functions need to be called during `npm run update`, regeneration needs to produce correct content for prompt pages, and page-versions.json must be stamped to avoid a mass stale flag.
  - Files: `scripts/update.mjs`, `scripts/lib/regenerate-page.mjs`, `tests/update-pipeline.test.mjs`, `page-versions.json`
  - Do: (1) Add `runManagePrompts()` to `update.mjs` that calls `detectNewAndRemovedPrompts` + `createNewPromptPages`/`removePromptPages`. Insert a "manage prompts" step after "manage commands" in the steps array. (2) In `regenerate-page.mjs`, add `buildPromptSystemPrompt()` with the 4-section structure (What It Does → Pipeline Position → Variables → Used By) and use `prompts/execute-task.mdx` as the exemplar. In `regeneratePage()`, check if `pagePath.startsWith('prompts/')` and use the prompt system prompt accordingly. (3) Stamp all 32 prompt pages in `page-versions.json` by running `node scripts/check-page-freshness.mjs --stamp`. (4) Update `tests/update-pipeline.test.mjs` step count from 9 to 10 and add the "manage prompts" step to the expected order. (5) Verify E2E: `npm run build`, confirm stale detection works by tampering with one stamp.
  - Verify: `node --test tests/update-pipeline.test.mjs` passes, `npm run build` exits 0, `node scripts/check-page-freshness.mjs` exits 0
  - Done when: Pipeline has 10 steps, prompt pages are stamped (32 entries), build passes, and simulated stale detection works

## Files Likely Touched

- `scripts/lib/manage-pages.mjs`
- `scripts/update.mjs`
- `scripts/lib/regenerate-page.mjs`
- `tests/manage-pages.test.mjs`
- `tests/update-pipeline.test.mjs`
- `page-versions.json`
