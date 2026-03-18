# S01: Source Diff and Page Mapping — UAT

**Milestone:** M003
**Written:** 2026-03-18

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 is detection-only — no runtime server, no user-facing UI, no LLM calls. All outputs are JSON files and console messages that can be verified by inspecting artifacts and running scripts.

## Preconditions

- Node.js 22+ installed
- gsd-pi globally installed (`npm root -g` resolves to a directory with `gsd-pi/dist/src/resources/`)
- `content/generated/manifest.json` exists (run `npm run extract` if missing)
- Working directory is the project root

## Smoke Test

Run `node scripts/lib/build-page-map.mjs && node scripts/lib/diff-sources.mjs` — should print page count and diff summary without errors.

## Test Cases

### 1. Page map covers all 43 authored pages

1. Run `node scripts/lib/build-page-map.mjs`
2. Run `python3 -c "import json; m=json.load(open('content/generated/page-source-map.json')); print(f'{len(m)} pages'); cmds=[k for k in m if k.startswith('commands/')]; print(f'{len(cmds)} commands'); recipes=[k for k in m if k.startswith('recipes/')]; print(f'{len(recipes)} recipes')"`
3. **Expected:** 43 pages, 28 commands, 6 recipes

### 2. All source paths are valid

1. Run `node --test tests/page-map.test.mjs`
2. **Expected:** 9/9 tests pass — includes "every source path in every entry exists in manifest.json"

### 3. Diff detection finds changed files

1. Run `node scripts/extract.mjs` (ensures current manifest exists)
2. Run `cp content/generated/manifest.json content/generated/previous-manifest.json`
3. Edit `content/generated/previous-manifest.json` — change any SHA value for `src/resources/extensions/gsd/auto.ts`
4. Run `node scripts/lib/diff-sources.mjs`
5. **Expected:** Output reports 1 file changed, 0 added, 0 removed. `commands/auto.mdx` listed as stale.

### 4. Diff detection finds added files

1. Edit `content/generated/previous-manifest.json` — remove the entry for `src/resources/extensions/gsd/auto.ts` entirely
2. Run `node scripts/lib/diff-sources.mjs`
3. **Expected:** Output reports 1 file added (auto.ts). No pages flagged stale (added files don't trigger staleness — S03 handles new commands).

### 5. Diff detection finds removed files

1. Edit `content/generated/manifest.json` — temporarily remove the entry for `src/resources/extensions/gsd/auto.ts`
2. Ensure `previous-manifest.json` still has `auto.ts` with its original SHA
3. Run `node scripts/lib/diff-sources.mjs`
4. **Expected:** Output reports 1 file removed. `commands/auto.mdx` listed as stale (removed deps trigger staleness).
5. Restore manifest.json: `node scripts/extract.mjs`

### 6. First-run graceful handling

1. If `content/generated/previous-manifest.json` exists, rename it: `mv content/generated/previous-manifest.json content/generated/previous-manifest.json.bak`
2. Run `node scripts/lib/diff-sources.mjs`
3. **Expected:** Output prints "First run — no previous manifest" message and exits cleanly (exit code 0).
4. Restore: `mv content/generated/previous-manifest.json.bak content/generated/previous-manifest.json`

### 7. Pipeline integration — diff report in update output

1. Run `npm run update`
2. **Expected:** Output includes `[update] Step: diff report` block between extract and build. Changed file count and stale page count visible.

### 8. stale-pages.json boundary contract format

1. After `npm run update`, run `node -e "const s=JSON.parse(require('fs').readFileSync('content/generated/stale-pages.json','utf8')); console.log(Object.keys(s).sort().join(', ')); console.log('stalePages is array:', Array.isArray(s.stalePages)); console.log('timestamp exists:', !!s.timestamp)"`
2. **Expected:** Keys include `addedFiles, changedFiles, reasons, removedFiles, stalePages, timestamp`. stalePages is array: true. timestamp exists: true.

### 9. Idempotent — second run shows zero stale

1. Run `npm run update` twice in succession
2. **Expected:** Second run shows "0 stale pages" or "✓ No stale pages" in diff report output.

### 10. Unit tests all green

1. Run `node --test tests/page-map.test.mjs tests/diff-sources.test.mjs`
2. **Expected:** 21/21 tests pass (9 page-map + 12 diff-sources)

## Edge Cases

### Cross-cutting page with broad deps

1. Run `node -e "const m=JSON.parse(require('fs').readFileSync('content/generated/page-source-map.json','utf8')); console.log('walkthrough deps:', m['user-guide/developing-with-gsd.mdx'].length)"`
2. **Expected:** Walkthrough has ≥3 dependencies (broad cross-cutting)

### Reference page dynamic deps

1. Run `node -e "const m=JSON.parse(require('fs').readFileSync('content/generated/page-source-map.json','utf8')); console.log('skills deps:', m['reference/skills.mdx'].length); console.log('extensions deps:', m['reference/extensions.mdx'].length)"`
2. **Expected:** Both have multiple deps (dynamically pulled from manifest, not hardcoded)

### Static pages have zero deps

1. Run `node -e "const m=JSON.parse(require('fs').readFileSync('content/generated/page-source-map.json','utf8')); console.log('index:', m['index.mdx'].length); console.log('ref/index:', m['reference/index.mdx'].length); console.log('changelog:', m['changelog.mdx'].length)"`
2. **Expected:** All three print 0

## Failure Signals

- `build-page-map.mjs` warns about missing source paths → manifest.json may be stale, run `npm run extract`
- `build-page-map.mjs` errors with ">50% paths missing" → likely a gsd-pi repo restructure, mappings need updating
- `diff-sources.mjs` crashes on missing previous-manifest → extract.mjs didn't save the snapshot properly
- `stale-pages.json` is missing after `npm run update` → diff report step in update.mjs may have thrown
- Tests fail on page count → a page was added or removed without updating the test expectations

## Requirements Proved By This UAT

- R034 — Test 7 proves previous-manifest.json is saved during extract; Tests 3-6 prove diff uses it as baseline
- R035 — Tests 3-5 prove correct detection of changed, added, and removed files
- R036 — Tests 1-2 prove all 43 pages are mapped with valid source paths
- R037 — Tests 3, 5 prove stale page flagging from changed/removed files; Test 4 proves added files don't trigger staleness
- R046 — Test 1 proves all 43 authored pages have explicit mappings

## Not Proven By This UAT

- LLM regeneration quality (S02)
- New/removed command page creation/deletion (S03)
- Full end-to-end `npm run update` with actual regeneration (S04)
- Cost/timing reporting for regeneration runs (S02/S04)
- Graceful degradation without ANTHROPIC_API_KEY (S04)

## Notes for Tester

- Tests 3-6 involve editing manifest JSON files — make sure to restore them afterward (run `npm run extract` to regenerate clean manifests).
- The page count (43) and command count (28) reflect S03's additions (config, export, update). If S03 adds or removes more pages in the future, these counts will need updating.
- The diff report step runs in ~3ms — if it takes longer, it's likely doing file I/O that should be cached.
