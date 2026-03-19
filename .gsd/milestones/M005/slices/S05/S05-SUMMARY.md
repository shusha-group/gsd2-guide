---
id: S05
parent: M005
milestone: M005
provides:
  - detectNewAndRemovedPrompts() — scans gsd-pi package prompts/ against existing .mdx pages
  - addPromptSidebarEntry(slug) — group-aware alphabetical insertion into the correct sidebar sub-group
  - removePromptSidebarEntry(slug) — link-pattern search and removal across all 4 sub-groups
  - createNewPromptPages(slugs) — scaffold stub MDX + sidebar entry per slug
  - removePromptPages(slugs) — delete MDX file + sidebar entry per slug
  - runManagePrompts() in update.mjs — 10th pipeline step wiring prompt CRUD into npm run update
  - buildPromptSystemPrompt() in regenerate-page.mjs — prompt-page-aware regeneration with 4-section structure
  - page-versions.json stamped with 32 prompts/ entries (80 total)
  - update-pipeline tests asserting 10-step order
requires:
  - slice: S02
    provides: page-source-map.json with 32 prompt entries; confirmed /prompts/{slug}/ URL slugs
  - slice: S04
    provides: command pages with backlinks (prerequisite for link checker validation)
affects: []
key_files:
  - scripts/lib/manage-pages.mjs
  - scripts/update.mjs
  - scripts/lib/regenerate-page.mjs
  - tests/manage-pages.test.mjs
  - tests/update-pipeline.test.mjs
  - page-versions.json
key_decisions:
  - Sidebar sub-group insertion uses items-array bracket detection (find `items: [`, then match closing `],` at same indentation) — resilient to sidebar edits without hard-coded line offsets
  - 16-space indentation for prompt entries reflects the 2-level nesting (Prompts → sub-group → entry) vs 12-space for command entries (1-level nesting)
  - createNewPromptPages does NOT write to page-source-map — delegated to build-page-map.mjs Section 6 which already reads prompts.json
  - Stale detection is dep-SHA-based (manifest.files[dep] vs recorded.deps[dep]); headSha is metadata only and does not drive staleness
  - buildPromptSystemPrompt() inlines execute-task.mdx exemplar at build time via sync fs.readFileSync, matching the existing buildSystemPrompt()/capture.mdx pattern
  - Page-type dispatch in regeneratePage(): pagePath.startsWith('prompts/') → prompt system prompt; else → command system prompt
patterns_established:
  - runManagePrompts() mirrors runManageCommands() exactly: detect → log counts → create/remove if needed → "in sync" message if neither
  - manage-pages CLI detect-only mode shows both commands and prompts in one pass; --execute flag applies changes; --prompts flag scopes execution to prompts only
  - Prompt CRUD functions return { results, created/removed, failed } — non-zero failed is visible to callers; per-result .error field for individual failures
observability_surfaces:
  - node scripts/lib/manage-pages.mjs — prints new/removed counts for both commands and prompts; "(none)" = in sync
  - node scripts/check-page-freshness.mjs — exits 0 (all 80 fresh) or 1 with stale page list including prompts/ prefix
  - python3 -c "import json; d=json.load(open('page-versions.json')); print(len([k for k in d if k.startswith('prompts/')]))" → 32
  - npm run update stdout step 5 "manage prompts" — emits New/Removed counts or "All prompts in sync"
drill_down_paths:
  - .gsd/milestones/M005/slices/S05/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S05/tasks/T02-SUMMARY.md
duration: ~43m (T01: 35m, T02: 8m)
verification_result: passed
completed_at: 2026-03-19
---

# S05: Pipeline integration

**`manage-pages.mjs` extended with 5 prompt lifecycle functions; `update.mjs` is now a 10-step pipeline with a "manage prompts" step; `regenerate-page.mjs` dispatches prompt-page-aware regeneration; all 80 pages stamped fresh; stale detection confirmed end-to-end.**

## What Happened

S05 completed M005's final wiring: making the `npm run update` pipeline fully aware of the prompt page lifecycle. The work split cleanly into two tasks.

**T01** extended `scripts/lib/manage-pages.mjs` with 5 exported functions covering the full prompt page lifecycle. `detectNewAndRemovedPrompts()` reads `.md` source files from the gsd-pi package `prompts/` directory and diffs against existing `.mdx` pages in `src/content/docs/prompts/`, returning sorted `{ newPrompts, removedPrompts }` arrays. `addPromptSidebarEntry(slug)` performs group-aware insertion: it looks up the slug's group in `prompts.json`, maps it to the corresponding sidebar label, finds the sub-group's `items: [` block by scanning from the label line, matches the closing `],` by indentation level, then inserts alphabetically with 16-space indentation (2-level nesting vs 12-space for command entries at 1-level nesting). `removePromptSidebarEntry(slug)` is group-agnostic — it scans all 4 sub-groups for the `link: '/prompts/{slug}/'` pattern and removes the matching line. `createNewPromptPages()` writes a stub MDX with `:::caution` scaffold notice and calls `addPromptSidebarEntry`, but deliberately skips page-source-map (already handled by `build-page-map.mjs` Section 6 which reads `prompts.json`). `removePromptPages()` deletes the MDX file (ENOENT-safe) and calls `removePromptSidebarEntry`. The CLI was also extended to show both command and prompt detection in detect-only mode. 26 new tests brought the total to 54, all passing.

**T02** wired the new functions into the live pipeline. In `update.mjs`, `runManagePrompts()` mirrors `runManageCommands()` exactly and was inserted as step 5 (index 4) after "manage commands", giving the pipeline its 10th step. In `regenerate-page.mjs`, `buildPromptSystemPrompt()` was added specifying the 4-section structure (What It Does → Pipeline Position → Variables → Used By), Mermaid styling rules, variable table format, and the `{{variable}}` MDX escaping rule (backtick wrapping, from D061). The `regeneratePage()` dispatcher now branches on `pagePath.startsWith('prompts/')` — prompt pages use `buildPromptSystemPrompt()` with `execute-task.mdx` as the exemplar; all other pages continue to use `buildSystemPrompt()` with `capture.mdx`. `page-versions.json` was stamped via `check-page-freshness.mjs --stamp` — 80 total pages (32 prompts/ + 48 existing). Tests in `update-pipeline.test.mjs` were updated to assert 10-step order with "manage prompts" present. Stale detection was confirmed end-to-end by tampering a prompt page dep SHA to `"aaaa"`, observing exit 1 from `check-page-freshness.mjs` with the correct page name, then re-stamping to exit 0.

One discovery during T02: initial stale simulation tampered `headSha`, which is purely metadata. Staleness is actually computed by comparing `manifest.files[dep]` against `recorded.deps[dep]` — the dep SHA stored in `page-versions.json`. This clarification is captured in `key_decisions` and is important for anyone writing stale detection tests in future slices.

## Verification

All slice-level checks passed:

| # | Command | Exit Code | Verdict | Notes |
|---|---------|-----------|---------|-------|
| 1 | `node --test tests/manage-pages.test.mjs` | 0 | ✅ pass | 54 tests, 13 suites |
| 2 | `node --test tests/update-pipeline.test.mjs` | 0 | ✅ pass | 10 tests, 3 suites |
| 3 | `python3 prompts/ stamp count` | — | ✅ 32 | 32 prompts/ keys in page-versions.json |
| 4 | `node scripts/check-page-freshness.mjs` | 0 | ✅ pass | All 80 pages fresh |
| 5 | `npm run build` | 0 | ✅ pass | 104 pages built, 0 errors |
| 6 | Stale simulation (tamper dep SHA → check → re-stamp) | 1 → 0 | ✅ pass | prompts/complete-milestone.mdx correctly flagged |
| 7 | `node scripts/lib/manage-pages.mjs` CLI | 0 | ✅ pass | Prints "(none)" for both new/removed; in sync |

## Requirements Advanced

- R057 — prompt pages are now lifecycle-managed by the update pipeline (detect, scaffold, remove)
- R058 — `regenerate-page.mjs` can regenerate prompt pages with the correct 4-section structure when staleness is detected
- R059 — `page-versions.json` stamps all 32 prompt pages; stale detection works end-to-end
- R060 — `npm run update` is fully prompt-aware with a dedicated "manage prompts" step

## Requirements Validated

None newly validated (validation was established in earlier slices; S05 proves operational closure).

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None. The sidebar bracket-detection approach was slightly more sophisticated than the plan implied (it searches for `items: [` rather than using hard-coded line offsets), but this is a better implementation of the same concept, not a deviation from plan intent.

## Known Limitations

- `createNewPromptPages()` does NOT write to `page-source-map.json` — the map is managed entirely by `build-page-map.mjs` Section 6 which reads `prompts.json`. This is correct by design, but means the page-source-map won't reflect a newly scaffolded prompt page until the next `npm run build` (which runs prebuild including `build-page-map.mjs`).
- `buildPromptSystemPrompt()` inlines the `execute-task.mdx` exemplar at module import time via `fs.readFileSync`. If that file is missing, a warning is logged to stderr but the function still returns a system prompt (with empty exemplar content). The quality of regenerated pages would degrade silently.

## Follow-ups

None. S05 is the final slice for M005 — all deliverables complete.

## Files Created/Modified

- `scripts/lib/manage-pages.mjs` — added 5 prompt lifecycle functions, updated header comment (12 exports), extended CLI with dual detection and --prompts flag
- `scripts/update.mjs` — added `runManagePrompts()` and "manage prompts" step (now 10 steps); extended import
- `scripts/lib/regenerate-page.mjs` — added `buildPromptSystemPrompt()` and page-type dispatch in `regeneratePage()`
- `tests/manage-pages.test.mjs` — 26 new tests across 5 new describe blocks (54 total)
- `tests/update-pipeline.test.mjs` — updated to 10-step assertion, added "manage prompts" test (10 total)
- `page-versions.json` — stamped 80 pages (32 prompts/ + 48 existing)
- `.gsd/milestones/M005/slices/S05/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
- `.gsd/milestones/M005/slices/S05/tasks/T02-PLAN.md` — added Observability Impact section (pre-flight fix)
- `.gsd/milestones/M005/slices/S05/S05-PLAN.md` — added Observability/Diagnostics section and failure-path verification step (pre-flight fix)

## Forward Intelligence

### What the next slice should know
- The full update pipeline is now 10 steps. Any new management steps (e.g., for a new content type) should follow the same `runManage*()` pattern and be inserted with awareness of the current step order.
- `page-versions.json` has 80 entries. When adding a new content type, remember to stamp its pages via `--stamp` before first run or the whole new set will be reported stale.
- Staleness is dep-SHA-based, not headSha-based. To simulate stale detection in tests, tamper a value in `recorded.deps[dep]`, not `headSha`.
- `build-page-map.mjs` Section 6 owns prompt page-source-map entries — do not duplicate this in `manage-pages.mjs` CRUD functions.

### What's fragile
- The sidebar bracket-detection in `addPromptSidebarEntry` relies on consistent indentation (16 spaces for prompt entries). If the sidebar formatting changes (e.g., a linter runs Prettier on `astro.config.mjs`), the indentation matching could break. This was observed to be stable across all M005 slices but is worth noting.
- `buildPromptSystemPrompt()` reads `execute-task.mdx` synchronously at import time. If the file is deleted or renamed, the warning is easy to miss since it's on stderr.

### Authoritative diagnostics
- `node scripts/lib/manage-pages.mjs` — canonical sync check; "(none)" for both commands and prompts = healthy
- `node scripts/check-page-freshness.mjs` — canonical freshness check; exit 0 = all stamps current; exit 1 lists stale pages with full path prefix
- `python3 -c "import json; d=json.load(open('page-versions.json')); print(len([k for k in d if k.startswith('prompts/')]))"` → 32 = stamps are present

### What assumptions changed
- Initial assumption: stale detection could be simulated by tampering `headSha`. Reality: `headSha` is metadata only. The actual staleness comparator is `recorded.deps[dep]` vs `manifest.files[dep]`. Dep SHA tampering is required for realistic stale simulation.
