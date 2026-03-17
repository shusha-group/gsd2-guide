# S01: Source Diff and Page Mapping — UAT

**Milestone:** M003
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: This slice produces detection-only artifacts (JSON files, console output) with no UI or runtime behavior. All verification is against generated data structures and CLI output.

## Preconditions

- Node.js 20+ installed
- `npm install` completed in project root
- `npm run extract` has been run at least once (so `content/generated/manifest.json` exists)

## Smoke Test

Run `node scripts/lib/build-page-map.mjs` — should print "42 pages mapped, 485 total deps" and exit 0.

## Test Cases

### 1. Page-source-map covers all 42 authored pages

1. Run `node scripts/lib/build-page-map.mjs`
2. Open `content/generated/page-source-map.json`
3. Count the top-level keys
4. **Expected:** Exactly 42 keys. Should include: 27 `commands/*.mdx` entries, 6 `recipes/*.mdx` entries, `user-guide/developing-with-gsd.mdx`, `reference/skills.mdx`, `reference/agents.mdx`, `reference/extensions.mdx`, `reference/prompts.mdx`, `reference/hooks.mdx`, `reference/index.mdx`, `changelog.mdx`, `index.mdx`.

### 2. All source paths exist in manifest

1. Run `node --test tests/page-map.test.mjs`
2. Check the "every source path in every entry exists in manifest.json" test
3. **Expected:** Test passes — zero source paths reference files not in the current manifest.

### 3. Command pages have meaningful dependencies

1. Open `content/generated/page-source-map.json`
2. Check `commands/auto.mdx` — should list `src/resources/extensions/gsd/auto.ts`, `src/resources/extensions/gsd/auto-dispatch.ts`, plus shared deps
3. Check `commands/discuss.mdx` — no dedicated `discuss.ts` exists, so should map to shared deps (commands.ts, state.ts, types.ts) plus prompts/discuss.md if it exists
4. **Expected:** Every command page has ≥1 `.ts` file in its dependency array. Complex commands (auto, doctor, migrate, visualize) have multiple specific source files.

### 4. Cross-cutting pages have broad dependency sets

1. Check `recipes/fix-a-bug.mdx` in the page-source-map
2. Check `user-guide/developing-with-gsd.mdx`
3. **Expected:** Each cross-cutting page has ≥3 dependencies spanning multiple source directories.

### 5. Diff detection with identical manifests

1. Run `npm run extract` (creates current manifest)
2. Run `npm run update` (which re-extracts, making previous = current)
3. Check `content/generated/stale-pages.json`
4. **Expected:** `stalePages` is an empty array, `changedFiles` is empty, pipeline log shows "✓ No stale pages — skipping regeneration".

### 6. Diff detection with simulated change

1. Copy `content/generated/manifest.json` to `content/generated/previous-manifest.json`
2. Edit `previous-manifest.json`: change the SHA value for `src/resources/extensions/gsd/auto.ts` to `"aaaa"`
3. Run `node scripts/lib/diff-sources.mjs`
4. **Expected:** Output reports 1 changed file. `commands/auto.mdx` appears in stale pages list. The reason includes `src/resources/extensions/gsd/auto.ts`.

### 7. First-run graceful handling

1. Delete `content/generated/previous-manifest.json` (if it exists)
2. Run `node scripts/lib/diff-sources.mjs`
3. **Expected:** Output says "First run — no previous manifest" (or similar). Exits with code 0. No error thrown.

### 8. Stale-pages.json boundary contract shape

1. Run `npm run update`
2. Inspect `content/generated/stale-pages.json`
3. **Expected:** JSON object with exactly these keys: `changedFiles` (array), `addedFiles` (array), `removedFiles` (array), `stalePages` (array), `reasons` (object), `timestamp` (string).

### 9. Previous-manifest snapshot saved before extraction

1. Note the current `content/generated/manifest.json` headSha
2. Run `npm run extract`
3. Check `content/generated/previous-manifest.json`
4. **Expected:** `previous-manifest.json` exists and its `headSha` matches the pre-extraction manifest's headSha (the old state was preserved).

### 10. Update pipeline includes diff report

1. Run `npm run update`
2. Scan console output for `[update] Step: diff report`
3. **Expected:** Diff report step appears between extract and build steps, shows changed file count and stale page list (or "No stale pages" message).

## Edge Cases

### Added file does not trigger staleness

1. Copy `content/generated/manifest.json` to `content/generated/previous-manifest.json`
2. Add a new entry `"src/resources/extensions/gsd/brand-new.ts": "deadbeef"` to the current `manifest.json` files
3. Run `node scripts/lib/diff-sources.mjs`
4. **Expected:** `brand-new.ts` appears in "added files" but stale pages count is 0 — added files don't flag existing pages.

### Removed file triggers staleness

1. Copy `content/generated/manifest.json` to `content/generated/previous-manifest.json`
2. Remove `src/resources/extensions/gsd/auto.ts` from the current `manifest.json` files
3. Run `node scripts/lib/diff-sources.mjs`
4. **Expected:** `auto.ts` appears in "removed files" and `commands/auto.mdx` appears in stale pages.

### Reference pages with dynamic deps

1. Check `reference/skills.mdx` in page-source-map.json
2. **Expected:** Dependencies include all `src/resources/skills/**/SKILL.md` files found in the manifest. Count should be ≥8 (matching the known skill count).

## Failure Signals

- `node --test tests/page-map.test.mjs` fails — page-source-map is incomplete or has invalid paths
- `node --test tests/diff-sources.test.mjs` fails — diff detection or staleness logic is broken
- `content/generated/page-source-map.json` missing or has fewer than 42 entries
- `content/generated/stale-pages.json` missing after `npm run update`
- `content/generated/previous-manifest.json` missing after `npm run extract`
- `npm run update` errors during the diff report step
- Console warnings about >50% missing source paths (suggests manifest/map mismatch)

## Requirements Proved By This UAT

- **R034** — Test case 9 proves previous manifest snapshot is saved before extraction
- **R035** — Test cases 5, 6, 7 prove diff detection works for identical, changed, and first-run scenarios
- **R036** — Test cases 1, 2, 3, 4 prove all 42 pages mapped with validated source paths
- **R037** — Test cases 6 and edge cases (added/removed) prove staleness resolution works correctly
- **R046** — Test case 1 proves all 42 authored pages have explicit source mappings

## Not Proven By This UAT

- LLM regeneration quality (S02) — this slice only detects staleness, doesn't regenerate
- New/removed command page creation (S03) — addedFiles are detected but not acted on
- Full pipeline end-to-end with regeneration (S04) — only the detection stage is wired
- Token cost and latency of regeneration — no API calls made in this slice

## Notes for Tester

- The "485 total deps" count may change if gsd-pi adds new source files — the reference pages dynamically pull deps from the manifest. The key assertion is 42 page entries, not the exact dep count.
- Test case 6 (simulated change) requires manually editing a JSON file. Be careful to maintain valid JSON — use a JSON-aware editor or `python3 -m json.tool` to validate after editing.
- Running `npm run update` takes ~15-20 seconds (extract + build). The diff report itself is ~3ms.
- The `previous-manifest.json` is overwritten on every extract. If you need to test specific scenarios, back up the file first.
