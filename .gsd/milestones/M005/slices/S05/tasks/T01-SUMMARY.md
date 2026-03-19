---
id: T01
parent: S05
milestone: M005
provides:
  - detectNewAndRemovedPrompts() — compares gsd-pi package .md source files against existing .mdx pages
  - addPromptSidebarEntry() — group-aware alphabetical insertion into nested prompt sidebar sub-groups
  - removePromptSidebarEntry() — link-pattern search across all 4 sub-groups
  - createNewPromptPages() — scaffold MDX + sidebar entry per slug (no page-source-map)
  - removePromptPages() — delete MDX + sidebar entry per slug
key_files:
  - scripts/lib/manage-pages.mjs
  - tests/manage-pages.test.mjs
key_decisions:
  - Prompt sidebar insertion uses items-array bracket detection (find `items: [` after label, then find closing `],` at same indentation) rather than hard-coding line offsets — makes it resilient to sidebar edits
  - createNewPromptPages does NOT write to page-source-map (handled by build-page-map.mjs Section 6 which already reads prompts.json)
patterns_established:
  - Sidebar sub-group items block found by: (1) locate label line, (2) scan forward for `items: [`, (3) match closing `],` at same indentation level as `items: [`
  - 16-space indentation for prompt entries (vs 12 for command entries) reflects 2-level nesting vs 1-level
observability_surfaces:
  - node scripts/lib/manage-pages.mjs — detect-only mode; prints new/removed for both commands and prompts
  - node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(m.detectNewAndRemovedPrompts()))" — quick sync check
  - createNewPromptPages/removePromptPages return { results, created/removed, failed } with per-slug .error field on failure
duration: 35m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Extend manage-pages.mjs with prompt detection, sidebar, and CRUD functions

**Added 5 exported prompt page lifecycle functions to manage-pages.mjs, with 26 new tests covering all functions; all 54 tests pass.**

## What Happened

Implemented all 5 required functions in `scripts/lib/manage-pages.mjs`:

1. **`detectNewAndRemovedPrompts(options?)`** — reads `.md` files from the gsd-pi package `prompts/` directory via `resolvePackagePath()`, compares against existing `.mdx` pages, returns `{ newPrompts, removedPrompts }` sorted arrays. Added `promptsSourceDir`/`promptsPageDir` overrides for testability.

2. **`addPromptSidebarEntry(slug, options?)`** — looks up slug's group in `prompts.json` (4 groups: auto-mode-pipeline, guided-variants, commands, foundation), maps to sidebar label, finds the sub-group's `items: [` block by scanning from the label line, finds the closing `],` by indentation matching, inserts alphabetically with 16-space indentation.

3. **`removePromptSidebarEntry(slug, options?)`** — searches all sub-groups for `link: '/prompts/{slug}/'` pattern, removes the matching line. Simple and group-agnostic.

4. **`createNewPromptPages(newPrompts, options?)`** — writes stub MDX with title=slug, description="Prompt reference: {slug}", and `:::caution` scaffold notice; calls `addPromptSidebarEntry`. Explicitly does NOT touch page-source-map (delegated to `build-page-map.mjs`).

5. **`removePromptPages(removedPrompts, options?)`** — deletes MDX file (ENOENT-safe), calls `removePromptSidebarEntry`. No page-source-map changes.

Also updated the module header comment with all 12 exports and extended the CLI to detect and manage both commands and prompts, with a new `--prompts` flag for prompt-only execution.

Pre-flight fixes applied: added `## Observability / Diagnostics` section to S05-PLAN.md, added a failure-path diagnostic verification step to S05-PLAN.md, and added `## Observability Impact` section to T01-PLAN.md.

## Verification

- `node --test tests/manage-pages.test.mjs` — **54 tests, 0 failures** across 13 suites (8 existing + 5 new)
- `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(m.detectNewAndRemovedPrompts()))"` — `{ newPrompts: [], removedPrompts: [] }` (all in sync)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `node --test tests/manage-pages.test.mjs` | 0 | ✅ pass | ~95ms |
| 2 | `node -e "import(...).then(m => console.log(m.detectNewAndRemovedPrompts()))"` | 0 | ✅ pass | <1s |

**Slice-level checks (T01's scope):**
| # | Command | Exit Code | Verdict |
|---|---------|-----------|---------|
| S1 | `node --test tests/manage-pages.test.mjs` | 0 | ✅ pass |
| S2 | `node --test tests/update-pipeline.test.mjs` | 0 | ✅ pass (9 tests; 10-step is T02) |
| S3 | prompt page count check | n/a | ⏳ T02 (page-versions.json stamping) |
| S4 | `node scripts/check-page-freshness.mjs` | n/a | ⏳ T02 |
| S5 | `npm run build` | n/a | ⏳ T02 |
| S6 | stale detection sim | n/a | ⏳ T02 |

## Diagnostics

- **Sync check:** `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(m.detectNewAndRemovedPrompts()))"` — both arrays empty = in sync
- **Sidebar state:** `grep -n '/prompts/' astro.config.mjs` shows current prompt sidebar entries
- **CLI mode:** `node scripts/lib/manage-pages.mjs` — detect-only, prints counts; `--execute` applies changes; `--prompts` runs prompt management only
- **Failure shape:** `createNewPromptPages` and `removePromptPages` return `{ results, created/removed, failed }` — check `failed > 0` and per-result `.error` field

## Deviations

The `addPromptSidebarEntry` indentation detection uses items-array bracket matching (find `items: [`, then find closing `],` at same indentation) rather than a simple hard-coded offset. This is more robust than the plan implied but follows the same conceptual approach.

The CLI was restructured to always detect both commands and prompts (not gated on `--prompts` flag), showing both summaries even in detect-only mode. The `--prompts` flag enables prompt-specific execution only.

## Known Issues

None.

## Files Created/Modified

- `scripts/lib/manage-pages.mjs` — extended with 5 new exported functions, updated header comment (12 exports), updated CLI with --prompts flag and dual command+prompt detection
- `tests/manage-pages.test.mjs` — extended with 26 new tests across 5 new describe blocks for all prompt functions
- `.gsd/milestones/M005/slices/S05/S05-PLAN.md` — added Observability/Diagnostics section and failure-path verification step (pre-flight fix)
- `.gsd/milestones/M005/slices/S05/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
