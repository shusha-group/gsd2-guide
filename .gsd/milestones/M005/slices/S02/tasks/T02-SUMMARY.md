---
id: T02
parent: S02
milestone: M005
provides:
  - Section 6 in build-page-map.mjs generating 32 prompt page entries from prompts.json
  - page-source-map.json with 80 total entries (48 core + 32 prompt pages)
  - Fixed test suite with correct 33-command count, updated 80-page assertion, and 3 new prompt page tests
key_files:
  - scripts/lib/build-page-map.mjs
  - content/generated/page-source-map.json
  - tests/page-map.test.mjs
key_decisions:
  - Used fs.existsSync guard in Section 6 so build-page-map.mjs doesn't break if prompts.json is absent
  - Page key format prompts/{slug}.mdx and source dep src/resources/extensions/gsd/prompts/{name}.md per D058 and manifest conventions
patterns_established:
  - New section pattern for addPage blocks: section header comment, existsSync guard on generated JSON, iterate array, addPage per entry
  - Test fix pattern: update COMMAND_SLUGS array in alphabetical order to match actual command dir contents, then update all dependent assertions
observability_surfaces:
  - "node scripts/lib/build-page-map.mjs → stdout: Page source map: 80 pages mapped"
  - "python3 -c \"import json; d=json.load(open('content/generated/page-source-map.json')); print(len([k for k in d if k.startswith('prompts/')]))\" → 32"
  - "node --test tests/page-map.test.mjs → 12 tests, 0 failures"
duration: ~10 minutes
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T02: Extend build-page-map with prompt entries, fix and extend tests, verify build

**Added Section 6 to build-page-map.mjs wiring 32 prompt pages into the source-map pipeline, fixed 5 missing command slugs and stale page count in tests, and verified all 12 tests pass with npm run build producing 104 pages.**

## What Happened

The task had three parallel concerns: extending the source-map generator, fixing pre-existing test rot, and verification.

**Section 6 in build-page-map.mjs:** Inserted after Section 5 ("Other pages"), before the validation summary. The new section reads `content/generated/prompts.json`, iterates the 32 prompt entries, and calls `addPage()` with key `prompts/{slug}.mdx` and a single source dep `src/resources/extensions/gsd/prompts/{name}.md`. An `fs.existsSync` guard makes the section a no-op if `prompts.json` is absent, keeping the script safe in fresh checkouts. Updated the file header comment to reflect the new 80-page total.

**Test fixes:** The COMMAND_SLUGS array was missing `keys`, `logs`, `new-milestone`, `skip`, and `undo` — all inserted in alphabetical order matching the actual `src/content/docs/commands/` directory. Updated the sanity check from 28 to 33 and the test name from "includes all 28 command pages" to "includes all 33 command pages". Updated the page count assertion from 43 to 80.

**New prompt test block:** Added `PROMPT_SLUGS` constant (32 entries matching prompts.json slugs exactly), and three new `it()` assertions: presence of all 32 `prompts/*.mdx` keys in the map, exactly 1 `.md` dep per prompt page, and all deps starting with `src/resources/extensions/gsd/prompts/`.

**Regeneration:** Ran `node scripts/lib/build-page-map.mjs` — output was `Page source map: 80 pages mapped, 941 total deps`, no warnings.

## Verification

Ran all verification steps in sequence:

1. `node scripts/lib/build-page-map.mjs` → `80 pages mapped, 941 total deps`, exit 0
2. Python source-map probe → `Prompt pages: 32`, `Total pages: 80`
3. `node --test tests/page-map.test.mjs` → 12 tests, 0 failures
4. `npm run build` → `104 page(s) built in 5.08s`, exit 0 (Pagefind found 104 HTML files)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `node scripts/lib/build-page-map.mjs` | 0 | ✅ pass | ~1s |
| 2 | `python3 -c "...page-source-map.json..."` (total=80, prompts=32) | 0 | ✅ pass | <1s |
| 3 | `node --test tests/page-map.test.mjs` (12/12 pass) | 0 | ✅ pass | ~45ms |
| 4 | `npm run build` (104 pages) | 0 | ✅ pass | ~5s |
| 5 | `ls src/content/docs/prompts/*.mdx \| wc -l` → 32 | 0 | ✅ pass | <1s |

## Diagnostics

- **Source-map health:** `node scripts/lib/build-page-map.mjs` stdout reports total page count and dep count. A regression to <80 pages means Section 6 is broken or prompts.json is missing.
- **Prompt entry count:** `python3 -c "import json; d=json.load(open('content/generated/page-source-map.json')); print(len([k for k in d if k.startswith('prompts/')]))"` → should be 32.
- **Test suite:** `node --test tests/page-map.test.mjs` → 12 tests (was 8 before this task). The "generates without warnings" test catches any missing manifest entries.
- **Build count:** `npm run build` reports page count in `[build] N page(s) built`. Currently 104 — includes stub and non-source-mapped pages beyond the 80 tracked ones.

## Deviations

None — implementation followed the plan exactly.

## Known Issues

None.

## Files Created/Modified

- `scripts/lib/build-page-map.mjs` — Added Section 6 for prompt pages (32 entries); updated header comment
- `content/generated/page-source-map.json` — Regenerated with 80 entries (48 → 80, +32 prompt pages)
- `tests/page-map.test.mjs` — Fixed COMMAND_SLUGS (28→33), page count assertion (43→80), added PROMPT_SLUGS and 3 new test assertions
- `.gsd/milestones/M005/slices/S02/tasks/T02-PLAN.md` — Added missing Observability Impact section (pre-flight fix)
