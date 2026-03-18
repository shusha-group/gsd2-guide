# Quick Task: Remove LLM regeneration + add missing command pages

**Date:** 2026-03-17
**Branch:** gsd/quick/9-paste-1-14

## What Changed

### Part 1: Remove LLM regeneration from pipeline
- Removed `scripts/lib/regenerate-page.mjs` and `tests/regenerate-page.test.mjs`
- Removed regenerate step from update pipeline (7→6 steps)
- Removed `@anthropic-ai/sdk` from devDependencies
- Converted `createNewPages` to sync scaffold-only (no LLM)
- `stale-pages.json` remains as the agent handoff contract

### Part 2: Add missing command pages
- Created detailed pages: `config.mdx`, `export.mdx`, `update.mdx`
- Updated sidebar with all three entries
- Updated `ReleaseEntry.astro` slug map for changelog linking
- Expanded `manage-pages.mjs` detection to match bare `gsd X` CLI commands
- Updated page-source-map (40→43 pages) and all test fixtures (25→28 slugs)

## Files Modified
- `scripts/update.mjs` — removed regenerate step
- `scripts/lib/manage-pages.mjs` — scaffold-only createNewPages, CLI_COMMAND_RE
- `scripts/lib/regenerate-page.mjs` — deleted
- `tests/regenerate-page.test.mjs` — deleted
- `tests/update-pipeline.test.mjs` — updated
- `tests/manage-pages.test.mjs` — updated fixtures and assertions
- `tests/page-map.test.mjs` — 43 pages, 28 command slugs
- `package.json` — removed @anthropic-ai/sdk
- `src/content/docs/commands/config.mdx` — new
- `src/content/docs/commands/export.mdx` — new
- `src/content/docs/commands/update.mdx` — new
- `astro.config.mjs` — sidebar entries
- `src/components/ReleaseEntry.astro` — slug map
- `content/generated/page-source-map.json` — 3 new entries

## Verification
- 97 tests pass across all suites
- 62 pages built, 3850 internal links, 0 broken
- Changelog links to config/export/update verified in dist/
- `npm run update` pipeline runs clean end-to-end
