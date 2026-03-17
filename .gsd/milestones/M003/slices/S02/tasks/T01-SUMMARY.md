---
id: T01
parent: S02
milestone: M003
provides:
  - regeneratePage() function for LLM-powered doc page regeneration via Claude API
  - regenerateStalePages() batch wrapper for processing all stale pages
  - CLI entry point for single-page and batch regeneration modes
  - 13 unit tests covering all code paths with mocked Anthropic SDK
key_files:
  - scripts/lib/regenerate-page.mjs
  - tests/regenerate-page.test.mjs
  - package.json
key_decisions:
  - Mock client injected via options.client parameter — avoids SDK module mocking complexity
  - Dynamic import of @anthropic-ai/sdk only when API key is present — no import at top level
  - capture.mdx hardcoded as exemplar — canonical quality reference for all command pages
patterns_established:
  - options.client pattern for dependency injection in testable API modules
  - Structured result objects with { skipped, error, pagePath, inputTokens, outputTokens, ... } for every code path
observability_surfaces:
  - CLI prints per-page token counts, cost estimates, and timing
  - regeneratePage() returns structured result objects for all paths (success, skip, error)
  - regenerateStalePages() returns aggregate stats (successCount, failCount, skipCount, totals)
  - console.warn for missing source files and max_tokens truncation
  - console.error for API failures with page path context
duration: 15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Build regeneration module with prompt template and unit tests

**Built `scripts/lib/regenerate-page.mjs` with `regeneratePage()`, `regenerateStalePages()`, and CLI entry point — all 13 unit tests pass with mocked SDK, graceful no-key handling, frontmatter validation, and cost reporting.**

## What Happened

Installed `@anthropic-ai/sdk` as devDependency. Built the complete regeneration module following the task plan exactly:

1. `regeneratePage(pagePath, sourceFiles, options)` — reads source files from gsd-pi install, reads current page and exemplar (capture.mdx), constructs system prompt with quality rules (section order, Mermaid styling, link format, frontmatter format), calls Claude API, validates frontmatter, writes output. Returns structured result with token usage. Accepts `options.client` for testing.

2. `regenerateStalePages(options)` — reads stale-pages.json and page-source-map.json, iterates stale pages sequentially, collects results with aggregate stats.

3. CLI entry point — single-page mode (`node scripts/lib/regenerate-page.mjs commands/capture.mdx`) looks up source files from page-source-map.json. Batch mode (no args) runs `regenerateStalePages()`. Both print cost estimates at $3/MTok input, $15/MTok output.

4. Wrote 13 tests in `tests/regenerate-page.test.mjs`: no-API-key skip, prompt content validation (quality rules, exemplar, source tags, current_page tags), token usage extraction, missing source file warning, invalid frontmatter rejection, max_tokens warning, API error handling, batch iteration, empty stale pages skip, partial failure handling, missing stale-pages.json handling.

## Verification

- `node --test tests/regenerate-page.test.mjs` — **13/13 pass** (0 fail, 0 skip)
- `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log(Object.keys(m)))"` — exports `[ 'regeneratePage', 'regenerateStalePages' ]`
- `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/capture.mdx` — prints "⊘ Skipped: no API key", exits 0
- `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs` — prints "⊘ Skipped: no stale pages", exits 0
- `npm run build` — builds successfully (60 pages, no errors)

### Slice-level checks status (T01 is task 1 of 2):
- ✅ Unit tests pass
- ✅ No-key skip works
- ⏳ Actual API regeneration (T02 — requires ANTHROPIC_API_KEY)
- ⏳ Build + link check with regenerated pages (T02)
- ⏳ Quality comparison of 3 pages (T02)

## Diagnostics

- **Single-page diagnostics**: `node scripts/lib/regenerate-page.mjs <pagePath>` — prints model, token counts, cost, timing, and truncation warnings
- **Batch diagnostics**: `node scripts/lib/regenerate-page.mjs` — per-page results plus batch totals
- **Structured results**: Every code path returns an inspectable object — `{ skipped, reason }`, `{ error, details, pagePath }`, or `{ pagePath, inputTokens, outputTokens, model, elapsedMs, stopReason }`
- **Warning signals**: `console.warn` for missing source files (`⚠ Source file not found: ...`) and max_tokens truncation. `console.error` for API failures with page path context.

## Deviations

- Added `options.generatedDir` to `regenerateStalePages()` for test isolation (not in plan but required for testable batch wrapper)
- Added API error handling test and missing stale-pages.json test (plan had 8 test cases, delivered 13)
- Used `path.resolve(process.argv[1]) === path.resolve(__filename)` pattern matching diff-sources.mjs for CLI detection

## Known Issues

None.

## Files Created/Modified

- `scripts/lib/regenerate-page.mjs` — New. Core regeneration module with `regeneratePage()`, `regenerateStalePages()`, CLI entry point
- `tests/regenerate-page.test.mjs` — New. 13 unit tests with mocked Anthropic SDK
- `package.json` — Modified. Added `@anthropic-ai/sdk` to devDependencies
- `.gsd/milestones/M003/slices/S02/S02-PLAN.md` — Modified. Added failure-path verification step (pre-flight fix)
- `.gsd/milestones/M003/slices/S02/tasks/T01-PLAN.md` — Modified. Added Observability Impact section (pre-flight fix)
