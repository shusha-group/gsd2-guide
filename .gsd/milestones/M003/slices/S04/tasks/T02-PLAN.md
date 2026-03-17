---
estimated_steps: 4
estimated_files: 1
---

# T02: End-to-end pipeline verification

**Slice:** S04 — Pipeline Integration and Polish
**Milestone:** M003

## Description

Run the actual `npm run update` pipeline to prove the real entrypoint works end-to-end. This is the final-assembly proof: T01 wired the code and tested with mocks, T02 exercises the real pipeline against the real project. Verify graceful degradation without API key (R043), full step sequence (R042), and that cost/timing reporting surfaces correctly (R045).

## Steps

1. **Run `npm run update` without `ANTHROPIC_API_KEY`.** Ensure the env var is unset. Capture the full output. Verify:
   - Exit code is 0
   - All 7 steps appear in the output: `npm update`, `extract`, `diff report`, `regenerate`, `manage commands`, `build`, `check-links`
   - The `regenerate` step shows a skip or no-API-key warning message (either "no stale pages" or individual pages showing "no API key")
   - The `manage commands` step shows detection results (may show "All commands in sync" or report new/removed commands)
   - The `build` step completes and produces HTML pages in `dist/`
   - The `check-links` step passes
   - The pipeline summary shows step timings for all 7 steps
   - The regeneration summary section appears (even if all skipped)

2. **Verify `content/generated/stale-pages.json` is written** with valid boundary contract format after the pipeline run. Check it has the expected fields: `changedFiles`, `addedFiles`, `removedFiles`, `stalePages`, `reasons`, `timestamp` (or `firstRun: true`).

3. **Run the full test suite.** Execute `node --test tests/*.test.mjs` and verify all tests pass across all suites: `page-map.test.mjs`, `diff-sources.test.mjs`, `regenerate-page.test.mjs`, `manage-pages.test.mjs`, `update-pipeline.test.mjs`, and `extract.test.mjs`. Zero failures.

4. **Fix any issues.** If the real pipeline run reveals problems (step ordering, async timing, import errors, path issues), fix them in `scripts/update.mjs` and re-run until the pipeline completes cleanly. Re-run tests after any fixes.

## Must-Haves

- [ ] `npm run update` completes with exit code 0 without `ANTHROPIC_API_KEY`
- [ ] All 7 pipeline steps appear in output with ✅ completion markers
- [ ] Regeneration step shows skip/warning (not a crash)
- [ ] Build produces HTML pages in `dist/`
- [ ] Link check passes
- [ ] `node --test tests/*.test.mjs` — all tests pass, zero failures

## Verification

- `npm run update` exits 0 — capture output and scan for all 7 step names and `✅` markers
- `node --test tests/*.test.mjs` — all test suites pass
- `ls dist/*.html dist/**/*.html | head -5` — HTML files exist in build output
- `cat content/generated/stale-pages.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log('valid:', Array.isArray(d.stalePages) || d.firstRun === true)"` — boundary contract valid

## Inputs

- `scripts/update.mjs` — as modified by T01, with 7 pipeline steps and async loop
- `tests/update-pipeline.test.mjs` — as created by T01
- All existing test files in `tests/`
- `content/generated/stale-pages.json` — written by the diff report step during pipeline execution

## Expected Output

- `scripts/update.mjs` — potentially with minor fixes discovered during real pipeline run (or unchanged if T01's code works perfectly)
- Confirmed: full pipeline runs end-to-end, all requirements (R042, R043, R045) demonstrated working
