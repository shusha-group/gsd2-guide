---
id: T02
parent: S04
milestone: M003
provides:
  - End-to-end proof that `npm run update` runs the full 7-step pipeline successfully
  - Broken command-link fix in ReleaseEntry.astro (removed stale config/pause slug mappings)
  - Updated page-map tests to reflect current 25-command / 40-page state
key_files:
  - scripts/update.mjs
  - src/components/ReleaseEntry.astro
  - tests/page-map.test.mjs
key_decisions:
  - Fix broken links at the source (ReleaseEntry.astro commandSlugs map) rather than adding an allowlist to check-links.mjs — keeps the link checker strict and honest
  - Update page-map test expectations rather than leaving them as known failures — tests should reflect actual project state
patterns_established:
  - When manage-pages removes a command page, the corresponding slug must also be removed from ReleaseEntry.astro's commandSlugs map to prevent broken changelog links
observability_surfaces:
  - "`npm run update` stdout" — full 7-step pipeline output with per-step ✅ markers, timings, regeneration summary, and link-check results
  - "`content/generated/stale-pages.json`" — boundary contract written by diff report step, inspectable after any pipeline run
  - Pipeline exits non-zero naming the failed step when any step fails
duration: 10m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: End-to-end pipeline verification

**Ran `npm run update` end-to-end without API key, fixed pre-existing broken changelog links to removed command pages (config, pause), and confirmed all 118 tests pass with zero failures.**

## What Happened

1. First pipeline run failed at check-links step: 2 broken links in `dist/changelog/index.html` pointing to `/commands/config/` which no longer exists. The `config` and `pause` command pages were removed by a prior `manage-pages` run, but `ReleaseEntry.astro`'s `commandSlugs` map still contained entries for them, causing the component to generate dead links from changelog release notes.

2. Fixed `src/components/ReleaseEntry.astro` by removing the `config` and `pause` entries (both `/gsd config`→`config` and `gsd config`→`config` variants, and same for `pause`) from the `commandSlugs` map.

3. Second pipeline run completed successfully — all 7 steps passed:
   - `npm update` ✅ (639ms)
   - `extract` ✅ (1.0s) — 1296 content items, manifest unchanged
   - `diff report` ✅ (5ms) — 0 changed, 0 stale pages
   - `regenerate` ✅ (1ms) — "⊘ Skipped: no stale pages"
   - `manage commands` ✅ (0ms) — "✓ All commands in sync"
   - `build` ✅ (5.5s) — 58 pages built
   - `check-links` ✅ (36ms) — 3427 links, 0 broken

4. Updated `tests/page-map.test.mjs` to reflect the current 25-command / 40-page state (removed `config` and `pause` from `COMMAND_SLUGS`, updated counts).

5. Full test suite: 118 tests pass, 0 failures across all 28 suites.

## Verification

- `unset ANTHROPIC_API_KEY && npm run update` — exits 0, all 7 steps show ✅ markers
- Pipeline output shows step timings for all 7 steps
- Regeneration summary: "skipped (no stale pages)"
- `ls dist/*.html | wc -l` → 58 HTML pages
- `node scripts/check-links.mjs` → "3427 internal links checked — 0 broken"
- `cat content/generated/stale-pages.json` → valid boundary contract with fields: changedFiles, addedFiles, removedFiles, stalePages, reasons, timestamp
- `node --test tests/*.test.mjs` → 118 pass, 0 fail

## Diagnostics

- Run `npm run update` to exercise the full pipeline — stdout shows all step results and timing
- `content/generated/stale-pages.json` shows what the diff report detected
- `node scripts/check-links.mjs` validates all internal links post-build
- If a step fails, the pipeline exits non-zero with the step name and elapsed time printed

## Deviations

- Fixed pre-existing broken links in `ReleaseEntry.astro` — the `config` and `pause` command slugs were still in the mapping but their pages had already been removed by a prior manage-pages run. This was not in the original plan but was necessary to get check-links to pass.
- Updated `page-map.test.mjs` expectations (42→40 pages, 27→25 commands) to match current project state after command page removals. This aligns tests with reality rather than leaving stale assertions.

## Known Issues

None.

## Files Created/Modified

- `src/components/ReleaseEntry.astro` — Removed stale `config` and `pause` entries from `commandSlugs` map to fix broken changelog links
- `tests/page-map.test.mjs` — Updated page count (42→40) and command count (27→25) after config/pause page removal
- `.gsd/milestones/M003/slices/S04/tasks/T02-PLAN.md` — Added Observability Impact section per pre-flight requirement
