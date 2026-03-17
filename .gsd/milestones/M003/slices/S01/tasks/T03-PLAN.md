---
estimated_steps: 4
estimated_files: 2
---

# T03: Wire diff reporting into update pipeline and run integration verification

**Slice:** S01 — Source Diff and Page Mapping
**Milestone:** M003

## Description

Wire the diff detection and staleness resolver into `scripts/update.mjs` so that `npm run update` reports stale pages after extraction. This closes the integration loop — after this task, running the update command produces a human-readable report of what changed and what needs regeneration. S02/S03/S04 will consume this output.

## Steps

1. Modify `scripts/update.mjs` to add a diff-reporting step after extraction:
   - After the extract step completes, import `detectChanges` and `resolveStalePages` from `scripts/lib/diff-sources.mjs`
   - Load `content/generated/previous-manifest.json` (if it exists) and `content/generated/manifest.json`
   - If no previous manifest exists, log `"  ℹ First run — no previous manifest for diff. All pages considered fresh."` and continue to the build step
   - Otherwise, load `content/generated/page-source-map.json` and run `detectChanges()` + `resolveStalePages()`
   - Log a summary block:
     ```
     Source diff: N changed, M added, K removed
     Stale pages: P
       - commands/auto.mdx (auto.ts, auto-dispatch.ts changed)
       - recipes/error-recovery.mdx (auto-recovery.ts changed)
     ```
   - If 0 stale pages, log `"  ✓ No stale pages — skipping regeneration"` (this is the fast path for S04)
   - Store the stale pages result for future use by S02/S04 (e.g., write to `content/generated/stale-pages.json` or pass through the pipeline — for now, just log it; S04 will add the data plumbing)
   - Time this step and include it in the pipeline timing report

2. Also write `content/generated/stale-pages.json` with the diff results so downstream slices can consume it:
   - Format: `{ "changedFiles": [...], "addedFiles": [...], "removedFiles": [...], "stalePages": [...], "reasons": { "page": ["file1", "file2"] }, "timestamp": "ISO" }`
   - If first run (no previous manifest), write: `{ "firstRun": true, "stalePages": [], "timestamp": "ISO" }`
   - This file is the S01→S02 and S01→S03 boundary contract

3. Run integration verification:
   - Run `npm run extract` to establish baseline (creates both manifest.json and previous-manifest.json)
   - Run `npm run extract` again — should report 0 stale pages (nothing changed)
   - Manually edit one SHA in `content/generated/previous-manifest.json` (e.g., change the SHA for `src/resources/extensions/gsd/auto.ts`) then run `node scripts/lib/diff-sources.mjs` — verify `auto.mdx` and any cross-cutting pages appear as stale
   - Verify `content/generated/stale-pages.json` is written with correct content

4. Verify the full `npm run update` pipeline still works end-to-end:
   - Run `npm run update` — should complete all steps including the new diff report
   - Confirm the diff report appears in the output between the extract and build steps
   - Confirm the build still succeeds (no regressions from the pipeline modification)

## Must-Haves

- [ ] `npm run update` prints a stale page report after extraction
- [ ] `content/generated/stale-pages.json` written with diff results (boundary contract for S02/S03)
- [ ] Fast path: 0 stale pages clearly reported when nothing changed
- [ ] First-run path: graceful message when no previous manifest exists
- [ ] Existing pipeline (extract → build → check-links) still works without regression

## Verification

- `npm run update` completes successfully with diff report visible in output
- `content/generated/stale-pages.json` exists after update and contains valid JSON
- Running update twice in succession shows "0 stale pages" on the second run
- Pipeline timing still reported correctly (diff step included)

## Inputs

- `scripts/update.mjs` — existing pipeline orchestrator (to be modified)
- `scripts/lib/diff-sources.mjs` — from T02, exports `detectChanges()` and `resolveStalePages()`
- `content/generated/page-source-map.json` — from T01, maps 42 pages to source deps
- `content/generated/manifest.json` — current manifest (existing, refreshed by extract)
- `content/generated/previous-manifest.json` — from T02's extract.mjs modification

## Expected Output

- `scripts/update.mjs` — modified with diff reporting step between extract and build
- `content/generated/stale-pages.json` — new file written by update pipeline (boundary contract for S02/S03/S04)
