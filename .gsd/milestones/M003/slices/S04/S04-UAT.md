# S04: Pipeline Integration and Polish — UAT

**Milestone:** M003
**Written:** 2026-03-18

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: The pipeline is a build system — its outputs (built HTML, JSON boundary contracts, test results, link check verdicts) are deterministic artifacts that can be inspected without human judgment. The quality of regenerated pages was already proven in S02 UAT.

## Preconditions

- Working directory is the project root (where `package.json` and `scripts/update.mjs` live)
- Node.js 20+ installed
- `gsd-pi` npm package installed globally (`npm i -g gsd-pi`)
- `ANTHROPIC_API_KEY` is NOT set (for graceful degradation tests)

## Smoke Test

Run `node --test tests/*.test.mjs` and confirm exit code 0 with 113+ tests passing, 0 failures.

## Test Cases

### 1. Full pipeline completes without API key

1. Unset `ANTHROPIC_API_KEY`: `unset ANTHROPIC_API_KEY`
2. Run `npm run update`
3. **Expected:** Exit code 0. All 9 steps show ✅ markers. Regeneration step shows skip message (either "no stale pages" or "ANTHROPIC_API_KEY not set"). Build produces HTML pages. Check-links reports 0 broken links.

### 2. Pipeline output shows step timings for all 9 steps

1. Run `npm run update`
2. Inspect the `[update] Step timings:` section at the end of output
3. **Expected:** 9 lines listing: update gsd-pi, extract, diff report, manage commands, regenerate, build, check-links, audit content, stamp pages — each with elapsed time.

### 3. Stale pages boundary contract is written

1. Run `npm run update`
2. Read `content/generated/stale-pages.json`
3. **Expected:** Valid JSON with fields: `changedFiles` (array), `addedFiles` (array), `removedFiles` (array), `stalePages` (array), `reasons` (object), `timestamp` (ISO string). When no source changes, `stalePages` should be empty.

### 4. Pipeline step order is correct

1. Run `node -e "import('./scripts/update.mjs').then(m => console.log(m.steps.map(s => s.name)))"`
2. **Expected:** Array: `['update gsd-pi', 'extract', 'diff report', 'manage commands', 'regenerate', 'build', 'check-links', 'audit content', 'stamp pages']`

### 5. Import guard prevents side effects

1. Run `node -e "import('./scripts/update.mjs').then(m => console.log('OK:', m.steps.length, 'steps'))"`
2. **Expected:** Prints `OK: 9 steps` without any pipeline execution output (no `[update]` log lines).

### 6. Manage commands detects sync state

1. Run `npm run update`
2. Find the `[update] Step: manage commands` section in output
3. **Expected:** Shows "New commands: 0", "Removed commands: 0", "✓ All commands in sync — no changes needed."

### 7. Link checker catches all internal links

1. Run `node scripts/check-links.mjs`
2. **Expected:** Exit code 0. Reports 4000+ internal links checked, 0 broken. No links to `/commands/config/` or `/commands/pause/` (these were removed).

### 8. All test suites pass with zero regressions

1. Run `node --test tests/*.test.mjs`
2. **Expected:** 113+ tests pass, 0 fail, 0 cancelled across all suites (diff-sources, extract, manage-pages, page-source-map, regenerate-page, update-pipeline).

## Edge Cases

### Pipeline fails on broken step — exit code and message

1. Temporarily introduce a build error (e.g., rename `astro.config.mjs`)
2. Run `npm run update`
3. **Expected:** Pipeline exits non-zero. Output shows `❌ Step "build" failed after Xms` with total elapsed time.
4. Restore the file and re-run to confirm clean state.

### No previous manifest (first-run path)

1. Move `content/generated/previous-manifest.json` aside temporarily
2. Run `npm run update`
3. **Expected:** Diff report step prints "First run — no previous manifest for diff. All pages considered fresh." Stale pages file shows `firstRun: true, stalePages: []`.
4. Restore the file.

## Failure Signals

- `npm run update` exits non-zero — a step failed, check the `❌ Step "..."` line
- Tests report `# fail > 0` — regression introduced
- `check-links` reports broken links — a page was added/removed without sidebar sync
- `stale-pages.json` missing after pipeline run — diff report step didn't execute
- Pipeline hangs on import — `isDirectRun` guard broken

## Requirements Proved By This UAT

- R042 — Regeneration runs as part of `npm run update` between extract and build, only when stale pages detected (Test 1, Test 4)
- R043 — Without ANTHROPIC_API_KEY, pipeline reports absence, skips regeneration, builds with existing content (Test 1)
- R045 — Pipeline reports per-page status, token usage, cost estimate, and total time (Test 2)
- R007 — Single command runs the full pipeline end-to-end (Test 1, Test 2)

## Not Proven By This UAT

- Regeneration with a real API key and actual stale pages — S02 UAT covers this with mock clients; a live API test would require real source changes and API spend
- Token cost accuracy for large regeneration runs — only the math formula is verified, not actual API charges
- Build quality of regenerated pages — S02 UAT covers quality comparison against M02 originals

## Notes for Tester

- The pipeline step count may grow beyond 9 if future slices add steps. Test 1 and 4 may need count updates.
- The "audit content" and "stamp pages" steps are newer additions — if they fail, check `scripts/audit-content.mjs` and `scripts/check-page-freshness.mjs` exist.
- All tests run against real project data (page-source-map.json, commands.json, etc.) — they test the actual project state, not fixtures.
