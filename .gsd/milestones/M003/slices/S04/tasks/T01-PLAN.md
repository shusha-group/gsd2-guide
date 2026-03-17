---
estimated_steps: 7
estimated_files: 2
---

# T01: Wire regeneration and command handling into update pipeline with integration test

**Slice:** S04 — Pipeline Integration and Polish
**Milestone:** M003

## Description

Wire S02's `regenerateStalePages()` and S03's `detectNewAndRemovedCommands()`/`createNewPages()`/`removePages()` into the existing `scripts/update.mjs` pipeline as two new async function steps. Make the pipeline loop async-aware and add cost/timing reporting for regeneration results. Write integration tests covering the new orchestration logic.

The pipeline currently has 5 steps (npm update → extract → diff report → build → check-links). After this task it has 7 steps with `regenerate` and `manage commands` inserted between `diff report` and `build`.

**Relevant skills:** `test` (for integration test creation)

## Steps

1. **Add imports to `scripts/update.mjs`.** Import `regenerateStalePages` from `./lib/regenerate-page.mjs` and `detectNewAndRemovedCommands`, `createNewPages`, `removePages` from `./lib/manage-pages.mjs`.

2. **Add `formatCost()` helper to `update.mjs`.** Duplicate the 4-line function from regenerate-page.mjs's CLI section (it's not exported — inside an `if (isDirectRun)` block). Sonnet pricing: $3/MTok input, $15/MTok output.
   ```js
   function formatCost(inputTokens, outputTokens) {
     const inputCost = (inputTokens / 1_000_000) * 3;
     const outputCost = (outputTokens / 1_000_000) * 15;
     const total = inputCost + outputCost;
     return `$${total.toFixed(4)} (in: $${inputCost.toFixed(4)}, out: $${outputCost.toFixed(4)})`;
   }
   ```

3. **Add `runRegenerate` async function step.** This function:
   - Calls `regenerateStalePages()` (no arguments — it reads stale-pages.json internally)
   - If result has `skipped: true` → log `"  ⊘ Skipped: <reason>"` and return
   - If result has `error` → log `"  ✗ Error: <error>"` and return (don't throw — pipeline should continue to build)
   - For each result in `batch.results`: log per-page status (✓ regenerated / ⊘ skipped / ✗ error) with token counts
   - Log batch summary: `"  Regenerated: N success, N failed, N skipped"`
   - If `batch.totalInputTokens > 0`: log total tokens and cost estimate via `formatCost()`
   - Log total regeneration time
   - **Store the batch result** on the step object or in a module-level variable so the pipeline summary can include it

4. **Add `runManageCommands` async function step.** This function:
   - Calls `detectNewAndRemovedCommands()` — this is synchronous and doesn't need API key
   - Logs detection results: `"  New commands: N"` and `"  Removed commands: N"`
   - If `newCommands.length > 0`: calls `createNewPages(newCommands)` and logs per-slug results
   - If `removedCommands.length > 0`: calls `removePages(removedCommands)` and logs per-slug results
   - If both are 0: logs `"  ✓ All commands in sync — no changes needed."`

5. **Insert both steps into the `steps` array** after `diff report` and before `build`:
   ```js
   { name: 'regenerate', fn: runRegenerate },
   { name: 'manage commands', fn: runManageCommands },
   ```

6. **Make the pipeline loop async.** Change the `for (const step of steps)` block to use `await`:
   - For `step.fn`: change `step.fn()` to `await step.fn()` — awaiting a non-promise (sync function) is a no-op, so this works for both `runDiffReport` (sync) and the new async steps
   - The script is ESM (`"type": "module"` in package.json) so top-level await works
   - Wrap the main pipeline body in a try block or use top-level await directly

7. **Add regeneration summary to pipeline output.** In the summary section at the end (after step timings), add a "Regeneration" block that shows:
   - Pages regenerated/skipped/failed
   - Total tokens (input/output) if any
   - Total cost estimate if any
   - Or "Regeneration: skipped (no API key)" / "Regeneration: skipped (no stale pages)" as appropriate
   - Store the regeneration result in a module-level variable (e.g. `let regenResult = null;`) set by `runRegenerate`, read by the summary section.

8. **Write `tests/update-pipeline.test.mjs`.** Use `node:test` + `node:assert/strict` (matching project convention). Test the pipeline orchestration:

   Since `update.mjs` is a script (not a library exporting functions), the test strategy is:
   - **Extract the two new step functions** (`runRegenerate`, `runManageCommands`) as named exports alongside their current use in the steps array. Gate exports behind a test-friendly pattern or just export them — they're pure orchestration functions.
   - **Alternative:** If exporting from update.mjs is awkward, test by importing the component modules directly and verifying the integration contract: call `regenerateStalePages()` with mocked stale-pages.json (0 stale pages) and verify the skip result; call `detectNewAndRemovedCommands()` against real project data and verify it returns the expected structure.
   - **Recommended approach:** Export `runRegenerate` and `runManageCommands` from `update.mjs` so tests can call them directly with controlled state. Each function should be self-contained (reads files, calls modules, logs results).

   Test cases:
   - **Step array has 7 entries in correct order:** Import steps and verify names are `['npm update', 'extract', 'diff report', 'regenerate', 'manage commands', 'build', 'check-links']`
   - **Regeneration step with 0 stale pages:** Write a temp stale-pages.json with `{ stalePages: [], ... }`, call `regenerateStalePages({ generatedDir })`, verify `skipped: true`
   - **Manage commands step returns structure:** Call `detectNewAndRemovedCommands()` against real data, verify `{ newCommands: [], removedCommands: [] }` shape (arrays)
   - **formatCost produces correct output:** Test `formatCost(1000000, 100000)` → `$4.5000` (verify the math)

## Must-Haves

- [ ] `scripts/update.mjs` has 7 pipeline steps in order: npm update → extract → diff report → regenerate → manage commands → build → check-links
- [ ] Pipeline loop uses `await step.fn()` for both sync and async function steps
- [ ] `runRegenerate` calls `regenerateStalePages()` and logs per-page results with token/cost data
- [ ] `runManageCommands` calls `detectNewAndRemovedCommands()` and conditionally calls `createNewPages()`/`removePages()`
- [ ] Pipeline summary includes regeneration cost/timing section
- [ ] `formatCost()` helper computes correct cost at $3/MTok input, $15/MTok output
- [ ] Integration test file exists and passes
- [ ] All existing tests still pass (`node --test tests/*.test.mjs`)

## Verification

- `node --test tests/update-pipeline.test.mjs` — all new tests pass
- `node --test tests/*.test.mjs` — all existing tests pass (no regressions)
- `node -e "import('./scripts/update.mjs')"` does NOT run the pipeline (it should only run the pipeline when executed directly via `process.argv[1]` check or similar guard) — **Note:** The current `update.mjs` runs the pipeline at top level. If adding exports, guard the main pipeline execution behind an `isDirectRun` check (same pattern used by `regenerate-page.mjs` and `manage-pages.mjs`).

## Inputs

- `scripts/update.mjs` — current 197-line pipeline with sync loop, 5 steps. The diff report step (`runDiffReport`) is already an in-process function step.
- `scripts/lib/regenerate-page.mjs` — exports `regenerateStalePages(options)` returning `{ results, totalInputTokens, totalOutputTokens, totalElapsedMs, successCount, failCount, skipCount }` or `{ skipped: true, reason }` or `{ error, details }`.
- `scripts/lib/manage-pages.mjs` — exports `detectNewAndRemovedCommands(options)` returning `{ newCommands: string[], removedCommands: string[] }`, `createNewPages(slugs, options)` returning `{ results, created, skipped, failed }`, `removePages(slugs, options)` returning `{ results, removed, failed }`.
- `tests/regenerate-page.test.mjs` — reference for test conventions (node:test, node:assert/strict, mock client pattern).

## Observability Impact

- **New log blocks:** `[update] Step: regenerate` and `[update] Step: manage commands` emit per-page results (✓/⊘/✗), token counts, and cost estimates to stdout during pipeline runs.
- **Regeneration summary section:** Pipeline summary now includes regeneration cost/timing block — shows pages regenerated/skipped/failed, total tokens, and dollar cost estimate. When skipped, shows the reason (e.g. "no API key", "no stale pages").
- **Failure state:** Failed regeneration/manage-commands steps log structured errors (`  ✗ Error: <message>`) but do NOT abort the pipeline — build and check-links still run. Pipeline-level failures (execSync) still exit non-zero naming the failed step.
- **Inspection:** Import `{ steps, formatCost, runRegenerate, runManageCommands }` from `update.mjs` for programmatic inspection. `content/generated/stale-pages.json` remains the boundary contract.

## Expected Output

- `scripts/update.mjs` — modified with 2 new imports, 2 new async step functions, async pipeline loop, `formatCost` helper, regeneration summary in output, `isDirectRun` guard for main execution, exported step functions for testing
- `tests/update-pipeline.test.mjs` — new integration test file with 4+ test cases covering step order, regeneration skip, manage-commands structure, and cost formatting
