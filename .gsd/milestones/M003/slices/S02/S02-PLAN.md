# S02: LLM Page Regeneration

**Goal:** A working `regeneratePage()` module that takes a stale page path and its source dependencies, calls the Claude API with a quality-focused prompt, and writes updated MDX back to disk — with proven output quality matching M02 originals.
**Demo:** Running `node scripts/lib/regenerate-page.mjs commands/capture.mdx` regenerates the capture page via Claude API. The output has correct frontmatter, section structure (What It Does → Usage → How It Works → Files → Examples → Related Commands), Mermaid diagrams with terminal-native styling, and relative links. Token usage and cost are reported. Without ANTHROPIC_API_KEY, the module reports clearly and skips regeneration.

## Must-Haves

- `regeneratePage(pagePath, sourceFiles, options)` reads source files from installed gsd-pi, reads current page content, calls Claude API, writes updated MDX
- `regenerateStalePages(stalePages, pageSourceMap, options)` batch wrapper reads stale-pages.json + page-source-map.json, iterates pages, accumulates cost stats
- System prompt encodes M02 quality rules: section structure, Mermaid terminal-native styling, relative link format, frontmatter format
- Exemplar page (capture.mdx) included in system prompt as quality reference
- Graceful degradation: no ANTHROPIC_API_KEY → returns `{ skipped: true, reason: 'no API key' }`, no error
- Token usage reporting: each call returns `{ pagePath, inputTokens, outputTokens, model, elapsedMs }`
- Output validation: generated content starts with valid `---` frontmatter
- CLI entry point for direct invocation: `node scripts/lib/regenerate-page.mjs <pagePath>`
- Unit tests mock the SDK to verify prompt construction, error handling, no-key skip, and token reporting
- Quality proven by regenerating 3+ command pages and comparing against M02 originals

## Proof Level

- This slice proves: integration (real Claude API calls producing real page output)
- Real runtime required: yes (Claude API for quality verification)
- Human/UAT required: yes (quality comparison of regenerated vs original pages)

## Verification

- `node --test tests/regenerate-page.test.mjs` — all unit tests pass (prompt construction, no-key skip, missing source file handling, token reporting, batch iteration, frontmatter validation)
- `node scripts/lib/regenerate-page.mjs commands/capture.mdx` — regenerates page when ANTHROPIC_API_KEY is set, reports token usage
- `npm run build && node scripts/check-links.mjs` — regenerated pages build cleanly with no broken links
- `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/capture.mdx` — prints skip message, exits cleanly with code 0
- Quality comparison of 3 regenerated pages (capture, doctor, auto) against M02 originals confirms equivalent structure, depth, and visual quality
- `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/nonexistent-page.mdx` — returns structured error result (not crash), exits 0
- `node --test tests/regenerate-page.test.mjs 2>&1 | grep -c 'pass'` — confirms failure-path tests (invalid frontmatter, max_tokens warning, missing source file) all pass

## Observability / Diagnostics

- Runtime signals: per-page regeneration logs with `pagePath`, `inputTokens`, `outputTokens`, `model`, `elapsedMs`, and computed cost. Batch summary with totals.
- Inspection surfaces: CLI `node scripts/lib/regenerate-page.mjs <page>` for single-page regeneration with full diagnostics. `regenerateStalePages()` return value includes per-page results array.
- Failure visibility: API errors logged with page path and error message. `stop_reason: 'max_tokens'` detected and warned. Missing source files logged as warnings with file path. Partial failures in batch mode reported at end with per-page success/failure.
- Redaction constraints: ANTHROPIC_API_KEY never logged or included in error output.

## Integration Closure

- Upstream surfaces consumed: `content/generated/stale-pages.json` (stalePages array, reasons object), `content/generated/page-source-map.json` (page→source deps mapping), `scripts/lib/extract-local.mjs` (`resolvePackagePath()`)
- New wiring introduced in this slice: `scripts/lib/regenerate-page.mjs` module with CLI entry point — not yet wired into update.mjs pipeline (S04 does that)
- What remains before the milestone is truly usable end-to-end: S03 (new/removed command handling), S04 (pipeline integration wiring regeneration + management into `npm run update`)

## Tasks

- [x] **T01: Build regeneration module with prompt template and unit tests** `est:1h`
  - Why: This is the core deliverable — the module that calls Claude API with source files and a quality-focused prompt to regenerate documentation pages. Unit tests verify all code paths without needing an API key.
  - Files: `scripts/lib/regenerate-page.mjs`, `tests/regenerate-page.test.mjs`, `package.json`
  - Do: Install `@anthropic-ai/sdk` as devDependency. Build `regeneratePage(pagePath, sourceFiles, options)` that resolves gsd-pi package path via `resolvePackagePath()`, reads source files, reads current page, constructs system prompt with quality rules + capture.mdx exemplar, calls `anthropic.messages.create()`, validates frontmatter, writes output. Build `regenerateStalePages()` batch wrapper. Add CLI entry point. Write comprehensive unit tests mocking the Anthropic SDK.
  - Verify: `node --test tests/regenerate-page.test.mjs` — all tests pass. `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log(Object.keys(m)))"` — exports `regeneratePage` and `regenerateStalePages`.
  - Done when: Module exports both functions, CLI entry point works, all unit tests pass with mocked SDK, `@anthropic-ai/sdk` is in devDependencies.

- [ ] **T02: Quality verification — regenerate 3 pages and validate against M02 originals** `est:45m`
  - Why: This retires the highest risk in M003 — can the Claude API produce documentation matching M02 quality? Without proving this, the entire milestone's value proposition is unverified. Also measures token usage/cost for S04's reporting requirement.
  - Files: `scripts/lib/regenerate-page.mjs` (may need prompt tuning), `src/content/docs/commands/capture.mdx`, `src/content/docs/commands/doctor.mdx`, `src/content/docs/commands/auto.mdx`
  - Do: Back up the 3 original pages. Run `regeneratePage()` for capture (light — 5 deps), doctor (mid — 7 deps), and auto (heavy — 11 deps). Compare each output against original: verify frontmatter, section structure, Mermaid diagram presence and styling, link format, content depth. Run `npm run build && node scripts/check-links.mjs` with regenerated pages. Record token usage and cost per page. If quality issues found, tune the system prompt and re-run. Restore originals after verification. Write a verification report as a task summary.
  - Verify: `npm run build && node scripts/check-links.mjs` passes with regenerated pages. All 3 pages have correct section structure (What It Does → Usage → How It Works → Files → Examples → Related Commands). Mermaid diagrams use terminal-native color scheme. All internal links use `../slug/` format. Token usage logged for each page.
  - Done when: 3 pages regenerated and verified, build passes, link check passes, token usage/cost documented, originals restored, quality assessment recorded.

## Files Likely Touched

- `scripts/lib/regenerate-page.mjs` — New. Core regeneration module with CLI entry point.
- `tests/regenerate-page.test.mjs` — New. Unit tests with mocked Anthropic SDK.
- `package.json` — Modified. Add `@anthropic-ai/sdk` as devDependency.
- `src/content/docs/commands/capture.mdx` — Temporarily regenerated for quality verification.
- `src/content/docs/commands/doctor.mdx` — Temporarily regenerated for quality verification.
- `src/content/docs/commands/auto.mdx` — Temporarily regenerated for quality verification.
