# S04: Pipeline Integration and Polish

**Goal:** `npm run update` runs the complete pipeline end-to-end — update, extract, diff, regenerate, manage commands, build, check-links — with graceful degradation when no API key is set and cost/timing reporting for regeneration results.
**Demo:** Running `npm run update` without `ANTHROPIC_API_KEY` completes successfully: the regeneration step prints a skip/warning message, the manage-commands step detects new/removed commands, the build and link check pass. The pipeline summary shows per-step timing and regeneration cost report (showing $0.00 when skipped).

## Must-Haves

- Two new async function steps added to `update.mjs` between `diff report` and `build`: (1) `regenerate` calling `regenerateStalePages()`, (2) `manage commands` calling `detectNewAndRemovedCommands()` + `createNewPages()` + `removePages()`
- Pipeline loop is async-aware (top-level await with `await step.fn()` for both sync and async steps)
- Cost/timing summary in pipeline output: per-page status (regenerated/skipped/failed), token counts, cost estimate ($3/MTok input, $15/MTok output), total regeneration time
- Graceful degradation without `ANTHROPIC_API_KEY`: regeneration step prints warning and continues, `removePages` still runs (no LLM needed), build proceeds with existing content
- Integration test covering pipeline orchestration with mocked dependencies
- All existing tests (S01/S02/S03) still pass — no regressions
- Full `npm run update` completes end-to-end

## Proof Level

- This slice proves: final-assembly
- Real runtime required: yes — the actual `npm run update` entrypoint must run end-to-end
- Human/UAT required: no

## Verification

- `node --test tests/update-pipeline.test.mjs` — integration tests for the new pipeline orchestration (regeneration step, manage-commands step, no-API-key path, cost summary)
- `node --test tests/*.test.mjs` — all existing tests pass (page-map, diff-sources, regenerate-page, manage-pages, extract)
- `npm run update` completes without `ANTHROPIC_API_KEY` — exit code 0, regeneration skipped message visible, build + check-links pass
- Pipeline output includes step timings for all 7 steps including `regenerate` and `manage commands`
- Pipeline output includes regeneration summary section (even when all pages skipped)

## Observability / Diagnostics

- Runtime signals: `[update] Step: regenerate` and `[update] Step: manage commands` log blocks with per-page results (regenerated/skipped/failed), token counts, and cost estimates
- Inspection surfaces: `content/generated/stale-pages.json` shows what was detected; pipeline stdout shows full step-by-step results; `node scripts/lib/regenerate-page.mjs` and `node scripts/lib/manage-pages.mjs` remain available as standalone diagnostic CLIs
- Failure visibility: failed steps report step name, elapsed time, and exit code; regeneration failures report per-page error details; pipeline exits non-zero naming the failed step
- Redaction constraints: `ANTHROPIC_API_KEY` is never logged — only its absence is reported

## Integration Closure

- Upstream surfaces consumed: `scripts/lib/regenerate-page.mjs` (`regenerateStalePages`), `scripts/lib/manage-pages.mjs` (`detectNewAndRemovedCommands`, `createNewPages`, `removePages`), `content/generated/stale-pages.json` (written by `runDiffReport`)
- New wiring introduced in this slice: Two new `fn` steps in the `update.mjs` pipeline `steps` array, async pipeline loop, cost/timing summary section in pipeline output
- What remains before the milestone is truly usable end-to-end: nothing — this is the final assembly slice

## Tasks

- [ ] **T01: Wire regeneration and command handling into update pipeline with integration test** `est:30m`
  - Why: This is the core integration — S01/S02/S03 modules are proven but disconnected from the main pipeline. This task wires them in, makes the pipeline async, and adds cost/timing reporting. Delivers R042, R043, R045.
  - Files: `scripts/update.mjs`, `tests/update-pipeline.test.mjs`
  - Do: (1) Add imports for `regenerateStalePages` from S02 and `detectNewAndRemovedCommands`/`createNewPages`/`removePages` from S03. (2) Add `regenerate` async fn step after `diff report` that calls `regenerateStalePages()` and logs per-page results + cost. (3) Add `manage commands` async fn step that calls `detectNewAndRemovedCommands()` and conditionally calls `createNewPages()`/`removePages()`. (4) Make the pipeline loop async (top-level await — the file is already ESM). (5) Add a `formatCost()` helper (duplicate the 4-line function from regenerate-page.mjs CLI section). (6) Add regeneration summary to the pipeline output section. (7) Write `tests/update-pipeline.test.mjs` with tests covering: regeneration step called correctly, manage-commands step runs detect+create+remove in order, no-API-key path logs warning and continues, cost/timing summary printed for successful regenerations, step ordering is correct.
  - Verify: `node --test tests/update-pipeline.test.mjs` passes all tests; `node --test tests/*.test.mjs` — no regressions
  - Done when: Both new steps exist in `update.mjs`, pipeline loop is async, integration tests pass, all existing tests pass

- [ ] **T02: End-to-end pipeline verification** `est:15m`
  - Why: T01 wires the code and tests the orchestration logic with mocks. T02 runs the actual `npm run update` pipeline to prove the real entrypoint works — the final-assembly proof that the milestone's main deliverable functions correctly.
  - Files: `scripts/update.mjs` (read-only verification)
  - Do: (1) Run `npm run update` without `ANTHROPIC_API_KEY` and verify: exits 0, regeneration step shows skip message, manage-commands step runs detection, build succeeds, check-links passes. (2) Verify pipeline output shows all 7 steps with timing. (3) Verify `content/generated/stale-pages.json` is written. (4) If any issues surface during the real run, fix them in `update.mjs`. (5) Run `node --test tests/*.test.mjs` to confirm zero regressions across all test suites.
  - Verify: `npm run update` exits 0 with all 7 steps completing; `node --test tests/*.test.mjs` — all tests pass
  - Done when: Full pipeline runs end-to-end without API key, all steps report completion, build produces HTML pages, link check passes, all tests pass

## Files Likely Touched

- `scripts/update.mjs`
- `tests/update-pipeline.test.mjs`
