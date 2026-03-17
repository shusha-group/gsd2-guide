# Quick Task: Remove LLM regeneration from update pipeline

**Date:** 2026-03-17
**Branch:** gsd/quick/9-paste-1-14

## What Changed
- Removed `scripts/lib/regenerate-page.mjs` (LLM-powered page regeneration via Claude API)
- Removed `tests/regenerate-page.test.mjs` (all regeneration tests)
- Removed `regenerate` step from `scripts/update.mjs` pipeline (7→6 steps)
- Removed `@anthropic-ai/sdk` from `devDependencies` (3 packages uninstalled)
- Removed `formatCost` helper and regeneration summary output from update.mjs
- Converted `createNewPages` in `manage-pages.mjs` from async LLM-powered to sync scaffold-only — writes stub MDX with frontmatter + caution callout
- Updated `tests/update-pipeline.test.mjs` — step count 7→6, removed formatCost tests and regenerateStalePages integration tests
- Updated `tests/manage-pages.test.mjs` — removed mock Anthropic client, converted createNewPages tests to scaffold assertions, made round-trip test synchronous

## Design Decision
- `stale-pages.json` remains as the agent handoff contract — the pipeline detects stale pages and writes the contract, but regeneration happens externally
- `manage-pages.mjs` remains useful for detecting new/removed commands, manipulating sidebar entries, and scaffolding pages — it just no longer calls the LLM

## Files Modified
- `scripts/update.mjs` — removed regenerate step, imports, cost helper, regen summary
- `scripts/lib/manage-pages.mjs` — stripped regeneratePage dependency, scaffold-only createNewPages
- `scripts/lib/regenerate-page.mjs` — deleted
- `tests/regenerate-page.test.mjs` — deleted
- `tests/update-pipeline.test.mjs` — updated step count, removed regen tests
- `tests/manage-pages.test.mjs` — updated createNewPages and round-trip tests
- `package.json` — removed @anthropic-ai/sdk from devDependencies
- `package-lock.json` — lockfile updated

## Verification
- All 97 tests pass across 4 test files (diff-sources, extract-local, manage-pages, update-pipeline, page-map)
- No dangling references to regenerate-page, regeneratePage, @anthropic-ai, or formatCost
- npm install clean — 3 packages removed, 0 vulnerabilities
