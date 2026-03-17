# S04 — Pipeline Integration and Polish — Research

**Date:** 2026-03-17

## Summary

S04 is a low-risk integration slice wiring three proven modules — `diff-sources.mjs` (S01), `regenerate-page.mjs` (S02), and `manage-pages.mjs` (S03) — into the existing `scripts/update.mjs` pipeline. The pipeline already has a `steps` array with sync support (`cmd` for shell, `fn` for in-process functions). The main change is adding two new in-process steps between the existing `diff report` and `build` steps: one for page regeneration (calling `regenerateStalePages()`), one for new/removed command handling (calling `detectNewAndRemovedCommands()` + `createNewPages()` + `removePages()`). Both are async, requiring the pipeline loop to `await` function steps.

The three target requirements are: R042 (pipeline integration — one command does everything), R043 (graceful degradation without API key), R045 (cost/timing reporting). R043 is already partially satisfied — `regeneratePage()` returns `{ skipped: true, reason: "no API key" }` when `ANTHROPIC_API_KEY` is unset, and `createNewPages()` inherits this behavior. The pipeline just needs to surface these skip results clearly and continue to the build step.

## Recommendation

Modify `scripts/update.mjs` directly — add two new async function steps and make the pipeline loop async-aware. No new modules needed. The formatCost helper from `regenerate-page.mjs`'s CLI section should be extracted to a shared utility or duplicated in `update.mjs` (duplication is fine — it's 4 lines). Add a lightweight integration test that exercises the pipeline orchestration logic in isolation (mock the shell commands, inject mock clients for LLM calls).

## Implementation Landscape

### Key Files

- `scripts/update.mjs` — **Primary change target.** Currently 197 lines with a synchronous `for` loop over `steps`. Needs: (1) import `regenerateStalePages` from S02 and `detectNewAndRemovedCommands`/`createNewPages`/`removePages` from S03, (2) add two new `fn` steps after `diff report`, (3) make the pipeline loop async (`for...of` with `await step.fn()`), (4) add cost/timing summary section to pipeline output, (5) graceful degradation logging when no API key.
- `scripts/lib/regenerate-page.mjs` — **Read-only.** `regenerateStalePages()` returns `{ results, totalInputTokens, totalOutputTokens, totalElapsedMs, successCount, failCount, skipCount }`. Pipeline consumes this directly.
- `scripts/lib/manage-pages.mjs` — **Read-only.** `detectNewAndRemovedCommands()` returns `{ newCommands, removedCommands }`. `createNewPages(slugs, options)` and `removePages(slugs, options)` return structured results. Pipeline consumes these directly.
- `content/generated/stale-pages.json` — **Read-only.** Written by `runDiffReport()` step (already exists). The regeneration step reads it indirectly via `regenerateStalePages()`.
- `tests/update-pipeline.test.mjs` — **New.** Integration test for the orchestration logic.

### Pipeline Step Additions

The current step sequence is:
```
1. npm update       (cmd: shell)
2. extract          (cmd: shell, capture stdout)
3. diff report      (fn: sync, writes stale-pages.json)
4. build            (cmd: shell)
5. check-links      (cmd: shell)
```

After S04:
```
1. npm update       (cmd: shell)
2. extract          (cmd: shell, capture stdout)
3. diff report      (fn: sync, writes stale-pages.json)
4. regenerate       (fn: async, calls regenerateStalePages)
5. manage commands  (fn: async, calls detect + create + remove)
6. build            (cmd: shell)
7. check-links      (cmd: shell)
```

Steps 4 and 5 both need `ANTHROPIC_API_KEY` for LLM calls. When the key is absent:
- Step 4 returns `{ skipped: true, reason: "no stale pages" }` (if 0 stale) or each page returns `{ skipped: true, reason: "no API key" }` — pipeline logs a warning and continues.
- Step 5's detection runs without API key (pure filesystem). `createNewPages` skips regeneration (returns skip result). `removePages` works fully (no LLM needed).

### Build Order

**T01: Wire regeneration into pipeline + async support.** This is the core integration: make the pipeline loop async-aware, add the `regenerate` step that calls `regenerateStalePages()`, log per-page results and aggregate cost/timing. This delivers R042 partially and R045 fully.

**T02: Wire new/removed command handling + graceful degradation + verification.** Add the `manage commands` step, implement the no-API-key warning path, run the full pipeline end-to-end, verify all three requirements. This delivers R042 fully and R043.

### Verification Approach

1. **Unit/integration test** (`node --test tests/update-pipeline.test.mjs`) — test the new pipeline functions in isolation with mocked dependencies. Verify: (a) regeneration step called with correct args, (b) manage-commands step runs detect+create+remove in order, (c) no-API-key path logs warning and continues, (d) cost/timing summary printed for successful regenerations.

2. **Full pipeline run without API key** (`npm run update`) — verify: pipeline completes successfully, regeneration step shows "skipped" message, build and check-links pass. This validates R043.

3. **Full pipeline run with API key** (`ANTHROPIC_API_KEY=... npm run update`) — if key available, verify: stale pages regenerated, token counts and cost reported, build and check-links pass. This validates R042 and R045.

4. **All existing tests still pass** (`node --test tests/*.test.mjs`) — no regressions in S01/S02/S03 modules.

## Constraints

- The pipeline loop currently uses `execSync` (blocking). Making it async means wrapping the main body in an async IIFE or top-level await (already valid — the file is ESM with `"type": "module"` in package.json).
- `regenerateStalePages()` reads `stale-pages.json` internally — it must run after the `diff report` step that writes that file. Order matters.
- `createNewPages()` calls `regeneratePage()` internally — it also needs `ANTHROPIC_API_KEY` or a client. Without either, it returns skip results per slug.
- `removePages()` does NOT need an API key — it only does filesystem and config manipulation. It should always run when there are removed commands.

## Common Pitfalls

- **Sync→async migration in pipeline loop** — The `for` loop over steps uses `step.fn()` for sync functions. Changing to `await step.fn()` works for both sync and async functions (awaiting a non-promise is a no-op). Just need to make the enclosing function async. Since `update.mjs` is a script (not a library), top-level await is the cleanest approach.
- **Cost formatting duplication** — The `formatCost()` helper in `regenerate-page.mjs` is inside the CLI `if (isDirectRun)` block, so it's not exported. Either extract it to a shared util or duplicate the 4-line function in `update.mjs`. Duplication is acceptable for this scope.
- **`reasons` field is a plain object, not a Map** — In `stale-pages.json` the `reasons` field is serialized as a plain object. But inside `runDiffReport()`, `resolveStalePages()` returns `reasons` as a `Map`, which gets converted to a plain object for JSON. The regeneration step reads from the JSON file (via `regenerateStalePages()`), so this is fine. But if anyone tries to call `.get()` on the reasons from the JSON, it'll fail. The current code handles this correctly.
