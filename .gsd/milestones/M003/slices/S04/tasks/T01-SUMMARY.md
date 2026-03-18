---
id: T01
parent: S04
milestone: M003
provides:
  - 7-step async pipeline in update.mjs (regenerate + manage commands wired in)
  - Exported steps array, formatCost, runRegenerate, runManageCommands for testing
  - isDirectRun guard so imports don't trigger pipeline execution
  - Integration test suite (14 tests) covering step order, cost math, regeneration skip, command detection shape
key_files:
  - scripts/update.mjs
  - tests/update-pipeline.test.mjs
key_decisions:
  - Export steps/functions directly from update.mjs (rather than extracting a separate module) since they're self-contained orchestration functions
  - isDirectRun guard uses process.argv[1] endsWith check (same pattern as regenerate-page.mjs and manage-pages.mjs)
  - regenResult stored as module-level variable to share between runRegenerate and summary section
patterns_established:
  - Pipeline fn steps can be sync or async — the loop uses `await step.fn()` which is a no-op for sync returns
observability_surfaces:
  - "[update] Step: regenerate" log block with per-page ✓/⊘/✗ status, token counts, cost estimate
  - "[update] Step: manage commands" log block with new/removed counts and per-slug results
  - "[update] Regeneration:" summary line in pipeline output (shows skipped reason, or success/fail/skip counts with cost)
duration: 12m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Wire regeneration and command handling into update pipeline with integration test

**Wired regenerateStalePages() and detectNewAndRemovedCommands()/createNewPages()/removePages() into update.mjs as async pipeline steps 4 and 5, with cost/timing reporting and isDirectRun guard for safe imports.**

## What Happened

Modified `scripts/update.mjs` to add:
1. Imports for `regenerateStalePages` from S02 and `detectNewAndRemovedCommands`/`createNewPages`/`removePages` from S03
2. `formatCost()` helper ($3/MTok input, $15/MTok output)
3. `runRegenerate` async step — calls regenerateStalePages(), logs per-page results with token/cost data, stores result for summary
4. `runManageCommands` async step — calls detect, then conditionally create/remove, with per-slug logging
5. Pipeline expanded from 5 to 7 steps (regenerate + manage commands inserted between diff report and build)
6. Pipeline loop changed to `await step.fn()` — works for both sync and async steps
7. Regeneration summary section added to pipeline output
8. `isDirectRun` guard wrapping the main pipeline execution — imports don't trigger side effects
9. Exported `steps`, `formatCost`, `runRegenerate`, `runManageCommands` for testing

Created `tests/update-pipeline.test.mjs` with 14 tests across 5 suites.

## Verification

- `node --test tests/update-pipeline.test.mjs` — 14 tests pass (step structure, formatCost math, regeneration skip, command detection shape, isDirectRun guard)
- `node --test tests/*.test.mjs` — 118 tests pass, 0 failures across all suites (diff-sources, extract, manage-pages, page-source-map, regenerate-page, update-pipeline)
- `node -e "import('./scripts/update.mjs')"` — imports without triggering pipeline execution, exports are accessible

## Diagnostics

- Import `{ steps }` from update.mjs to inspect pipeline step order programmatically
- `[update] Step: regenerate` log block shows per-page ✓/⊘/✗ with token counts
- `[update] Step: manage commands` log block shows new/removed command counts
- `[update] Regeneration:` summary line shows aggregate cost or skip reason
- `content/generated/stale-pages.json` is the boundary contract between diff report and regenerate steps
- Module-level `regenResult` variable carries regeneration results to the summary section

## Verification Evidence

| Gate | Command | Exit | Verdict | Duration |
|------|---------|------|---------|----------|
| Integration tests | `node --test tests/update-pipeline.test.mjs` | 0 | 14 pass, 0 fail | 0.5s |
| Full test suite | `node --test tests/*.test.mjs` | 0 | 118 pass, 0 fail | 1.5s |
| Import guard | `node -e "import('./scripts/update.mjs')"` | 0 | No side effects on import | 0.1s |

## Deviations

- Changed `padEnd(14)` to `padEnd(18)` in step timing formatting to accommodate the longer "manage commands" name.
- isDirectRun guard uses `endsWith('/update.mjs')` in addition to exact path match for robustness (handles symlinks/worktrees).

## Known Issues

None.

## Files Created/Modified

- `scripts/update.mjs` — Modified: added imports, formatCost, runRegenerate, runManageCommands, 7-step pipeline, async loop, isDirectRun guard, regeneration summary, exports
- `tests/update-pipeline.test.mjs` — Created: 14 integration tests covering step order, cost math, regeneration skip path, command detection shape, import guard
- `.gsd/milestones/M003/slices/S04/S04-PLAN.md` — Fixed: added failure-path verification check per pre-flight requirement
- `.gsd/milestones/M003/slices/S04/tasks/T01-PLAN.md` — Fixed: added Observability Impact section per pre-flight requirement
