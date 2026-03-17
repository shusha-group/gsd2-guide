---
estimated_steps: 5
estimated_files: 4
---

# T02: Build diff detection, staleness resolver, and snapshot logic with tests

**Slice:** S01 — Source Diff and Page Mapping
**Milestone:** M003

## Description

Create the change detection engine that compares manifest versions and resolves which doc pages are stale. This task produces two core functions — `detectChanges()` and `resolveStalePages()` — plus the snapshot-saving logic in the extract pipeline.

The existing `scripts/lib/manifest.mjs` already has a `computeDiff(oldFiles, newFiles)` function (line 35) that returns `{ added, changed, removed }`. The new `diff-sources.mjs` module wraps this with a higher-level API and adds the page staleness resolution step.

## Steps

1. Create `scripts/lib/diff-sources.mjs` as an ESM module exporting two functions:

   **`detectChanges(previousManifest, currentManifest)`**
   - Takes two manifest objects (the full JSON from `manifest.json`, which has a `files` array of `{ path, sha }` objects)
   - Returns `{ changedFiles: string[], addedFiles: string[], removedFiles: string[] }`
   - Implementation: build path→sha maps from both manifests, compare. A file is "changed" if path exists in both but SHA differs. "Added" if only in current. "Removed" if only in previous.
   - Note: reuse or adapt the logic from `manifest.mjs`'s `computeDiff()` (which operates on the same file array structure). You can import it or replicate the logic — the key is consistency.

   **`resolveStalePages(changes, pageSourceMap)`**
   - Takes the output of `detectChanges()` and the page-source-map JSON object
   - Returns `{ stalePages: string[], reasons: Map<string, string[]> }` where reasons maps each stale page path to the list of changed source files that triggered it
   - For each page in pageSourceMap, check if any of its source dependencies appear in `changedFiles` or `removedFiles`. If so, the page is stale.
   - `addedFiles` do NOT flag existing pages as stale (S03 handles new commands)
   - A page with an empty dependency array is never stale

2. Add a **CLI entry point** at the bottom of `diff-sources.mjs` (runs when executed directly with `node scripts/lib/diff-sources.mjs`):
   - Load `content/generated/previous-manifest.json` and `content/generated/manifest.json`
   - If previous manifest doesn't exist, print "First run — no previous manifest. All pages considered fresh." and exit 0
   - Load `content/generated/page-source-map.json`
   - Run `detectChanges()` + `resolveStalePages()`
   - Print summary: "N files changed, M files added, K files removed. P pages stale."
   - For each stale page, print "  - <page> (because: <changed files>)"

3. Modify `scripts/extract.mjs` to save the previous manifest before extraction:
   - At the TOP of the `main()` function (before `buildManifest()` is called), check if `content/generated/manifest.json` exists
   - If it exists, copy it to `content/generated/previous-manifest.json`
   - This ensures the previous version is preserved before `buildManifest()` overwrites it
   - If it doesn't exist (first-ever run), skip the copy — `diff-sources.mjs` handles the missing-previous-manifest case

4. Write `tests/diff-sources.test.mjs` using `node:test` + `node:assert/strict`:

   **Test: detectChanges with modified file**
   - Create two mock manifests where one file has a different SHA → verify it appears in `changedFiles`

   **Test: detectChanges with added file**
   - Current manifest has a file not in previous → verify it appears in `addedFiles`

   **Test: detectChanges with removed file**
   - Previous manifest has a file not in current → verify it appears in `removedFiles`

   **Test: detectChanges with no changes**
   - Identical manifests → all arrays empty

   **Test: resolveStalePages flags correct pages**
   - Create a pageSourceMap where page A depends on file X, page B depends on file Y
   - Changes has file X in changedFiles → page A is stale, page B is not

   **Test: resolveStalePages — added files don't flag existing pages**
   - Changes has file Z in addedFiles only → no pages flagged stale

   **Test: resolveStalePages — removed file flags dependent page**
   - Changes has file X in removedFiles → page A that depends on X is stale

   **Test: resolveStalePages — empty dependency pages never stale**
   - A page with `[]` dependencies is never stale regardless of changes

   **Test: resolveStalePages — cross-cutting page flagged when any dep changes**
   - A page depending on [A, B, C] is stale if B changes

5. Verify the `extract.mjs` modification works:
   - Run `node scripts/extract.mjs` (or `npm run extract`)
   - Confirm `content/generated/previous-manifest.json` exists after the run
   - Confirm it contains valid manifest JSON

## Must-Haves

- [ ] `scripts/lib/diff-sources.mjs` exports `detectChanges` and `resolveStalePages`
- [ ] `scripts/extract.mjs` saves previous manifest before building new one
- [ ] First-run graceful handling when no previous manifest exists
- [ ] `node --test tests/diff-sources.test.mjs` passes all assertions (≥9 test cases)

## Verification

- `node --test tests/diff-sources.test.mjs` — all tests pass
- `node -e "import('./scripts/lib/diff-sources.mjs').then(m => console.log(Object.keys(m)))"` — prints array containing `detectChanges` and `resolveStalePages`
- `npm run extract && ls content/generated/previous-manifest.json` — file exists after extraction
- `node scripts/lib/diff-sources.mjs` — runs CLI mode without errors (should report "0 pages stale" or "First run" depending on state)

## Observability Impact

- **New signal: `previous-manifest.json`** — Created at runtime by `extract.mjs` before each extraction. Agents can diff this against `manifest.json` to see what changed between runs. Missing file = first run.
- **New signal: CLI diff report** — Running `node scripts/lib/diff-sources.mjs` prints changed file counts, stale page counts, and per-page reasons to stdout. Zero-stale is normal when no source files changed.
- **Failure visibility:** If `resolveStalePages()` returns stale pages, each is printed with the triggering source files. If the page-source-map has entries whose deps don't appear in the manifest, `detectChanges()` won't flag them (they're simply not tracked) — the page-map test suite catches mapping errors.
- **Inspection:** `content/generated/previous-manifest.json` is human-readable JSON. Compare `headSha` fields between previous and current manifests to confirm they represent different repo states.

## Inputs

- `content/generated/page-source-map.json` — produced by T01, maps 42 pages to source deps
- `content/generated/manifest.json` — the current repo file manifest (existing)
- `scripts/lib/manifest.mjs` — existing module with `computeDiff()` at line 35 and `buildManifest()` at line 63
- `scripts/extract.mjs` — existing extraction orchestrator, needs modification to save previous manifest

## Expected Output

- `scripts/lib/diff-sources.mjs` — new ESM module with `detectChanges()`, `resolveStalePages()`, and CLI entry
- `scripts/extract.mjs` — modified to copy manifest.json → previous-manifest.json before buildManifest()
- `tests/diff-sources.test.mjs` — test file with ≥9 test cases, all passing
- `content/generated/previous-manifest.json` — created at runtime by extract.mjs
