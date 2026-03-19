---
id: T02
parent: S05
milestone: M005
provides:
  - runManagePrompts() exported from update.mjs — wires prompt CRUD into pipeline
  - 10-step pipeline with "manage prompts" at index 4
  - buildPromptSystemPrompt() in regenerate-page.mjs — prompt-page-aware regeneration
  - page-versions.json stamped with 32 prompts/ entries (80 total)
  - update-pipeline tests updated to assert 10-step order
key_files:
  - scripts/update.mjs
  - scripts/lib/regenerate-page.mjs
  - tests/update-pipeline.test.mjs
  - page-versions.json
key_decisions:
  - Stale detection is dep-SHA-based (manifest.files[dep] vs recorded.deps[dep]); headSha is metadata only — tampering headSha alone does not trigger staleness
  - buildPromptSystemPrompt() inlines the execute-task.mdx exemplar at build time (sync fs.readFileSync), matching the existing buildSystemPrompt() pattern
patterns_established:
  - Page-type dispatch in regeneratePage(): pagePath.startsWith('prompts/') → prompt system prompt + execute-task.mdx exemplar; else → command system prompt + capture.mdx exemplar
  - runManagePrompts() mirrors runManageCommands() pattern: detect → log counts → create/remove → log results → in-sync message
observability_surfaces:
  - "npm run update stdout: step 5 'manage prompts' emits New prompts: N / Removed prompts: N / ✓ All prompts in sync"
  - "node scripts/check-page-freshness.mjs — exits 0 (all fresh) or 1 with stale page list including prompts/ entries"
  - "python3 -c \"import json; d=json.load(open('page-versions.json')); print(len([k for k in d if k.startswith('prompts/')]))\""  → 32 when stamped
  - "[regenerate] Exemplar page not found: prompts/execute-task.mdx — logged to stderr if exemplar missing"
duration: ~8m
verification_result: passed
completed_at: 2026-03-19T04:31:00Z
blocker_discovered: false
---

# T02: Wire prompt pipeline step, prompt-aware regeneration, and stamp pages

**Added `runManagePrompts()` to `update.mjs`, making the pipeline 10 steps with prompt-page-aware regeneration, and stamped all 80 pages (32 prompt + 48 existing) in `page-versions.json`.**

## What Happened

T01 delivered the prompt management building blocks; T02 wires them into the live pipeline.

**Step 1–2 (update.mjs):** Extended the import line to pull in `detectNewAndRemovedPrompts`, `createNewPromptPages`, `removePromptPages` from `manage-pages.mjs`. Wrote `runManagePrompts()` exactly mirroring the `runManageCommands()` pattern — detect, log counts, call create/remove if needed, log "in sync" if neither. Inserted `{ name: 'manage prompts', fn: runManagePrompts }` at index 4 in the `steps` array (after "manage commands"). The `steps` array now has 10 entries in the documented order.

**Step 3–4 (regenerate-page.mjs):** Added `buildPromptSystemPrompt(exemplarContent)` specifying the 4-section structure (What It Does → Pipeline Position → Variables → Used By), Mermaid styling rules, variable table format, `{{variable}}` MDX escaping rule (backtick wrapping to avoid JSX parse errors — D061), and `../../commands/{slug}/` link format. Made `regeneratePage()` page-type-aware: after `findClaude()`, dispatches on `pagePath.startsWith('prompts/')` — prompt pages get `buildPromptSystemPrompt()` with `execute-task.mdx` as exemplar; other pages continue with `buildSystemPrompt()` and `capture.mdx`.

**Step 5 (tests):** Updated `update-pipeline.test.mjs` to assert 10-step order, added `'manage prompts'` to the expected step name array, and added the `'manage prompts step uses fn (not cmd)'` test. Also imported `runManagePrompts` and `detectNewAndRemovedPrompts` from their modules.

**Step 6 (stamp):** Ran `node scripts/check-page-freshness.mjs --stamp` → 80 pages stamped. Confirmed 32 `prompts/` entries with `python3`.

**Step 7 (stale simulation):** Tampered one prompt page dep SHA to `"aaaa"` → `check-page-freshness.mjs` reported `prompts/complete-milestone.mdx: complete-milestone.md` as stale (exit 1). Re-stamped → exit 0.

One investigation detour: initial stale simulation tampered `headSha` which is pure metadata and doesn't drive staleness detection — staleness compares `manifest.files[dep]` against `recorded.deps[dep]`. Had to tamper a dep SHA instead.

## Verification

All verification checks passed without failures.

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `node --test tests/update-pipeline.test.mjs` | 0 | ✅ pass | ~0.06s |
| 2 | `node --test tests/manage-pages.test.mjs` | 0 | ✅ pass | ~0.1s |
| 3 | `npm run build` | 0 | ✅ pass | ~48s |
| 4 | `node scripts/check-page-freshness.mjs` | 0 | ✅ pass | <1s |
| 5 | Stale simulation (tamper dep SHA → check → re-stamp) | 1 then 0 | ✅ pass | <1s |
| 6 | `python3 prompts/ count` | — | ✅ 32 | <1s |

## Diagnostics

- **Pipeline step presence:** `grep "manage prompts" scripts/update.mjs` — confirms step and function exist
- **Prompt system prompt dispatch:** `grep -A5 "startsWith.*prompts" scripts/lib/regenerate-page.mjs` — shows conditional
- **Stamp verification:** `python3 -c "import json; d=json.load(open('page-versions.json')); print(len([k for k in d if k.startswith('prompts/')]))"` → 32
- **Freshness check:** `node scripts/check-page-freshness.mjs` — exit 0 = all 80 fresh; exit 1 = lists stale pages with `prompts/` prefix
- **Stale detection field:** staleness is in `recorded.deps[dep]` vs `manifest.files[dep]`; `headSha` is metadata only

## Deviations

None. All steps completed exactly as planned. The stale simulation used dep SHA tampering (not headSha) after discovering that `headSha` is metadata — this is correct behavior, not a deviation from plan intent.

## Known Issues

None.

## Files Created/Modified

- `scripts/update.mjs` — added `runManagePrompts()` and "manage prompts" step; now 10 steps; extended import
- `scripts/lib/regenerate-page.mjs` — added `buildPromptSystemPrompt()` and page-type dispatch in `regeneratePage()`
- `tests/update-pipeline.test.mjs` — updated to 10-step assertion, added "manage prompts" test
- `page-versions.json` — stamped 80 pages (32 prompts/ + 48 existing)
- `.gsd/milestones/M005/slices/S05/tasks/T02-PLAN.md` — added `## Observability Impact` section (pre-flight fix)
