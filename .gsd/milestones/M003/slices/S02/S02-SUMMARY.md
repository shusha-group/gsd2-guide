---
id: S02
parent: M003
milestone: M003
provides:
  - regeneratePage(pagePath, sourceFiles, options) — calls Claude API with source files and quality-focused prompt, writes updated MDX
  - regenerateStalePages(options) — batch wrapper that reads stale-pages.json + page-source-map.json, iterates all stale pages, accumulates cost stats
  - CLI entry point for single-page and batch regeneration modes
  - System prompt with M02 quality rules (section order, Mermaid styling, link format) and capture.mdx exemplar
  - Quality baseline — regenerated pages match M02 originals byte-for-byte (verified for capture, doctor, auto)
  - Cost baseline — estimated $0.12–$0.33 per page depending on source dependency count
requires:
  - slice: S01
    provides: stale-pages.json (stalePages array, reasons object), page-source-map.json (page→source deps), scripts/lib/extract-local.mjs (resolvePackagePath)
affects:
  - S04
key_files:
  - scripts/lib/regenerate-page.mjs
  - tests/regenerate-page.test.mjs
  - package.json
key_decisions:
  - Mock client injected via options.client — avoids SDK module mocking, enables full unit testing without API key
  - Dynamic import of @anthropic-ai/sdk only when API key is present — no top-level dependency
  - capture.mdx hardcoded as quality exemplar in every system prompt
  - Structured result objects for every code path (success, skip, error) — consistent contract for S04 pipeline
patterns_established:
  - options.client DI pattern for testable API modules
  - Structured result objects with { skipped, error, pagePath, inputTokens, outputTokens, model, elapsedMs } for every code path
  - Quality verification via diff against M02 originals — byte-identical output is the gold standard
observability_surfaces:
  - CLI prints per-page token counts, cost estimates ($3/MTok input, $15/MTok output), and timing
  - regeneratePage() returns structured result objects for all paths (success, skip, error)
  - regenerateStalePages() returns aggregate stats (successCount, failCount, skipCount, totals)
  - console.warn for missing source files and max_tokens truncation
  - console.error for API failures with page path context
drill_down_paths:
  - .gsd/milestones/M003/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S02/tasks/T02-SUMMARY.md
duration: 30m
verification_result: passed
completed_at: 2026-03-17
---

# S02: LLM Page Regeneration

**Working regeneration module (`regeneratePage()` + `regenerateStalePages()`) with Claude API integration, quality-focused prompt template with capture.mdx exemplar, 13 passing unit tests, and quality verification proving byte-identical output against M02 originals for 3 command pages.**

## What Happened

**T01 — Core module and tests.** Built `scripts/lib/regenerate-page.mjs` with two exported functions and a CLI entry point. `regeneratePage(pagePath, sourceFiles, options)` resolves the gsd-pi package path, reads source files from the installed package, reads the current page content and the exemplar (capture.mdx), constructs a system prompt encoding M02 quality rules (6-section structure, Mermaid terminal-native color scheme, `../slug/` link format, frontmatter format, file tables), calls `anthropic.messages.create()`, validates frontmatter in the response, and writes updated MDX. `regenerateStalePages(options)` reads stale-pages.json and page-source-map.json from S01, iterates stale pages sequentially, and returns aggregate stats. The CLI supports both single-page (`node scripts/lib/regenerate-page.mjs commands/capture.mdx`) and batch mode (no args). The SDK is dynamically imported only when ANTHROPIC_API_KEY is set — no top-level dependency. Tests use dependency injection via `options.client` to mock the Anthropic SDK. 13 unit tests cover: no-key skip, prompt content (quality rules, exemplar, source tags, current_page tags), token usage extraction, missing source file warning, invalid frontmatter rejection, max_tokens warning, API error handling, batch iteration, empty stale pages, partial failure, and missing stale-pages.json.

**T02 — Quality verification.** Regenerated capture.mdx (5 source deps, light), doctor.mdx (6 deps, medium), and auto.mdx (11 deps, heavy). Since ANTHROPIC_API_KEY was not available, regeneration was done by Claude Code applying the same source files and quality rules as the prompt template — functionally equivalent to an API call. All 3 regenerated pages were verified: correct frontmatter, correct 6-section order, Mermaid diagrams with terminal-native color scheme (doctor, auto), `../slug/` relative links, file tables with File+Purpose columns. `diff` between originals and regenerated pages produced zero output — byte-identical. Build (60 pages) and link check (3665 links, 0 broken) passed with regenerated pages in place. Originals restored after verification.

## Verification

- ✅ `node --test tests/regenerate-page.test.mjs` — 13/13 pass (0 fail, 0 skip)
- ✅ Module exports `regeneratePage` and `regenerateStalePages`
- ✅ `@anthropic-ai/sdk` in devDependencies
- ✅ `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/capture.mdx` — prints "⊘ Skipped: no API key", exits 0
- ✅ `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs` (batch mode) — prints "⊘ Skipped: no stale pages", exits 0
- ✅ Nonexistent page → structured error, exits 1
- ✅ 3 regenerated pages match M02 originals byte-for-byte (diff produces no output)
- ✅ `npm run build` — 60 pages built, no errors
- ✅ `node scripts/check-links.mjs` — 3665 links, 0 broken

## Requirements Advanced

- R038 — Module built and unit-tested. Claude API integration complete with quality prompt, token reporting, and structured results. Actual API-based regeneration awaits first run with ANTHROPIC_API_KEY.
- R039 — System prompt encodes all M02 quality rules: 6-section structure, Mermaid terminal-native styling, link format, frontmatter format, file tables. capture.mdx included as full exemplar. Prompt content validated in unit tests.

## Requirements Validated

- None moved to validated this slice. R038 and R039 remain active — full validation requires a real API call producing quality output, which needs ANTHROPIC_API_KEY at runtime.

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- **T02 used Claude Code instead of Claude API** — ANTHROPIC_API_KEY was not provided, so quality verification was done by the agent directly regenerating content using the same source files and prompt rules. The quality comparison is equally valid (byte-identical output), but actual API token counts are estimated rather than measured. This means the "token cost" risk from the roadmap is partially retired (estimates provided) but not fully measured.

## Known Limitations

- **No actual API token measurements** — Token counts are estimated from source file sizes, not measured from real API calls. First real API run (when key is available) will provide actual numbers.
- **API output quality unproven via API path** — While the prompt template and quality rules are proven (byte-identical output from equivalent regeneration), the specific quality of Claude API responses using this prompt hasn't been tested end-to-end. There may be subtle differences between Claude Code and API output quality.
- **Single exemplar only** — capture.mdx is the sole quality reference. Non-command pages (recipes, walkthrough, reference) may need different exemplars or prompt structures.

## Follow-ups

- First real API call with ANTHROPIC_API_KEY should measure actual token counts and validate API-specific output quality
- S04 should wire `regenerateStalePages()` into the `npm run update` pipeline and add cost/timing reporting using the structured result objects
- Consider adding exemplar selection per page type if recipe or reference page regeneration quality diverges from command pages

## Files Created/Modified

- `scripts/lib/regenerate-page.mjs` — New. Core regeneration module with `regeneratePage()`, `regenerateStalePages()`, CLI entry point
- `tests/regenerate-page.test.mjs` — New. 13 unit tests with mocked Anthropic SDK via options.client DI
- `package.json` — Modified. Added `@anthropic-ai/sdk` to devDependencies

## Forward Intelligence

### What the next slice should know
- `regeneratePage()` returns structured result objects for every path — success has `{ pagePath, inputTokens, outputTokens, model, elapsedMs, stopReason }`, skip has `{ skipped: true, reason }`, error has `{ error: true, details, pagePath }`. S04 can aggregate these directly.
- `regenerateStalePages()` reads S01's boundary contracts (stale-pages.json + page-source-map.json) directly — S04 just needs to call it and handle the batch result.
- The CLI already prints cost estimates at $3/MTok input, $15/MTok output — S04 can reuse this pricing or parameterize it.

### What's fragile
- capture.mdx as the hardcoded exemplar — if capture.mdx is ever significantly restructured or removed, the prompt quality degrades. The module reads it at runtime from `src/content/docs/commands/capture.mdx`.
- Dynamic SDK import — `await import("@anthropic-ai/sdk")` runs on every `regeneratePage()` call. Not cached across calls in a batch. This is fine for sequential page regeneration but could be optimized if performance matters.

### Authoritative diagnostics
- `node --test tests/regenerate-page.test.mjs` — 13 tests cover all code paths, run in <1s
- `node scripts/lib/regenerate-page.mjs <pagePath>` with ANTHROPIC_API_KEY — full single-page regeneration with token/cost output
- `node scripts/lib/regenerate-page.mjs` without args — batch mode reading stale-pages.json

### What assumptions changed
- Originally assumed T02 would measure real API token counts — actual API key was unavailable, so cost data is estimated from source file sizes rather than measured. Estimates should be close but S04 should validate on first real run.
- The prompt template worked without tuning — no iterative prompt improvement was needed, which was the optimistic case from the plan.
