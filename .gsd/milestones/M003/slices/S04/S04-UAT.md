# S04: Pipeline Integration and Polish — UAT

**Milestone:** M003
**Written:** 2026-03-17

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: This is the final-assembly slice — the pipeline must actually run end-to-end as a real command. Mocked unit tests (covered in T01) verify orchestration logic; this UAT verifies the real `npm run update` entrypoint produces correct results.

## Preconditions

- Working directory: `gsd2-guide` project root
- Node.js 20+ installed
- `gsd-pi` globally installed (`npm i -g gsd-pi`)
- `ANTHROPIC_API_KEY` should **not** be set (tests graceful degradation path)
- Previous `npm run update` has been run at least once (so `content/generated/previous-manifest.json` exists)

## Smoke Test

Run `npm run update` — it should exit 0 with all 7 steps showing ✅ markers in stdout.

## Test Cases

### 1. Full pipeline completes without API key

1. `unset ANTHROPIC_API_KEY`
2. `npm run update`
3. **Expected:** Exit code 0. All 7 steps show `[update] ✅` completion markers:
   - npm update
   - extract
   - diff report
   - regenerate
   - manage commands
   - build
   - check-links

### 2. Regeneration step skips gracefully

1. Run `npm run update` without `ANTHROPIC_API_KEY`
2. Look for the `[update] Step: regenerate` log block
3. **Expected:** Contains `⊘ Skipped:` with a reason (either "no stale pages" or "no API key"). Does NOT show any error or stack trace.

### 3. Manage commands step detects sync state

1. Run `npm run update`
2. Look for the `[update] Step: manage commands` log block
3. **Expected:** Contains `✓ All commands in sync` (since no commands were added/removed between runs).

### 4. Step timings reported for all 7 steps

1. Run `npm run update`
2. Look for the `[update] Step timings:` section at the bottom
3. **Expected:** Lists all 7 step names with elapsed times (e.g., `npm update      639ms`). Step names are left-padded to 18 characters.

### 5. Regeneration summary in pipeline output

1. Run `npm run update`
2. Look for the `[update] Regeneration:` line in the summary section
3. **Expected:** Shows `skipped (no stale pages)` when no source changes detected. When pages are regenerated, shows `N regenerated, N skipped, N failed` with optional cost/token lines.

### 6. Boundary contract file written

1. Run `npm run update`
2. `cat content/generated/stale-pages.json`
3. **Expected:** Valid JSON with fields: `changedFiles` (array), `addedFiles` (array), `removedFiles` (array), `stalePages` (array), `reasons` (object), `timestamp` (ISO string).

### 7. Build produces HTML pages

1. Run `npm run update`
2. `find dist -name '*.html' | wc -l`
3. **Expected:** 58 HTML pages (may vary slightly if commands are added/removed upstream).

### 8. Link check passes

1. Run `npm run update`
2. Look for check-links step output
3. **Expected:** `X internal links checked — 0 broken` with exit code 0.

### 9. Pipeline exits non-zero on step failure

1. Temporarily rename `scripts/check-links.mjs` to `scripts/check-links.mjs.bak`
2. Run `npm run update`
3. **Expected:** Pipeline fails at `check-links` step with `[update] ❌ Step "check-links" failed` message and non-zero exit code.
4. Restore: `mv scripts/check-links.mjs.bak scripts/check-links.mjs`

### 10. Import guard prevents side effects

1. `node -e "import('./scripts/update.mjs').then(m => console.log('steps:', m.steps.length))"`
2. **Expected:** Prints `steps: 7` without executing the pipeline (no `[update]` log output). The import completes in under 1 second.

## Edge Cases

### First run (no previous manifest)

1. Delete `content/generated/previous-manifest.json`
2. Run `npm run update`
3. **Expected:** Diff report shows "First run — no previous manifest for diff. All pages considered fresh." stale-pages.json has `firstRun: true`.

### All tests pass after pipeline changes

1. `node --test tests/*.test.mjs`
2. **Expected:** 118 tests pass, 0 fail, 0 cancelled across all 28 suites.

## Failure Signals

- `npm run update` exits non-zero — check which step failed in the `[update] ❌` line
- Missing `[update] Step: regenerate` or `[update] Step: manage commands` in output — steps not wired into pipeline
- `stale-pages.json` not written — diff report step failed silently
- Broken links in check-links output — a command page was removed but its ReleaseEntry.astro slug wasn't cleaned up
- Test count drops below 118 — a test file was accidentally removed or broken

## Requirements Proved By This UAT

- R042 — Pipeline integration into `npm run update` (test cases 1, 4, 5)
- R043 — Graceful degradation without API key (test cases 1, 2)
- R045 — Cost/timing reporting (test cases 4, 5)
- R007 — Single-command update cycle (test case 1)

## Not Proven By This UAT

- Regeneration quality with actual API key and real source changes (proved by S02 UAT, not repeated here)
- New command detection with a real new gsd-pi command (proved by S03 UAT with fake commands)
- Token cost accuracy against actual Claude API billing (would require real API calls with billing verification)

## Notes for Tester

- The pipeline takes ~8 seconds total — most of that is the build step (~5.5s) and extract step (~1s).
- The `npm update` step at the start may show npm warnings about deprecated packages — these are harmless.
- If running in a worktree, ensure `content/generated/` exists and has the expected artifacts from prior runs.
- The regeneration step currently shows "no stale pages" because the manifest hasn't changed between runs. To see the regeneration path exercise, you'd need to modify `content/generated/previous-manifest.json` to simulate a source change.
