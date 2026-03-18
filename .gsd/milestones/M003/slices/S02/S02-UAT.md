# S02: LLM Page Regeneration — UAT

**Milestone:** M003
**Written:** 2026-03-18

## UAT Type

- UAT mode: mixed (artifact-driven for unit tests/build/links, live-runtime for API quality)
- Why this mode is sufficient: The regeneration module has two verification surfaces — code correctness (testable with mocks) and output quality (requires API calls). Code paths are fully covered by mocked unit tests. Output quality was verified by comparing regenerated pages against M02 originals. Live API testing deferred until ANTHROPIC_API_KEY is available.

## Preconditions

- Working directory is the gsd2-guide project root
- `npm install` has been run (including `@anthropic-ai/sdk` in devDependencies)
- `npm run extract` has been run (content/generated/docs/ and page-source-map.json exist)
- gsd-pi is installed globally (`npm root -g` resolves to a path containing gsd-pi with src/resources/)
- For API-based tests: `ANTHROPIC_API_KEY` is set in environment

## Smoke Test

Run `node --test tests/regenerate-page.test.mjs` — all 14 tests should pass in under 2 seconds.

## Test Cases

### 1. Unit tests pass

1. Run `node --test tests/regenerate-page.test.mjs`
2. **Expected:** 14/14 pass, 0 fail, 0 skip. Exit code 0.

### 2. Module exports correct functions

1. Run `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log(Object.keys(m)))"`
2. **Expected:** Output is `[ 'regeneratePage', 'regenerateStalePages' ]`

### 3. No-key skip — single page mode

1. Run `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/capture.mdx`
2. **Expected:** Prints "Regenerating commands/capture.mdx (5 source files)..." then "⊘ Skipped: no API key". Exit code 0.

### 4. No-key skip — batch mode (with stale-pages.json)

1. Create a temporary `content/generated/stale-pages.json` with `{ "stalePages": [], "reasons": {} }`
2. Run `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs`
3. **Expected:** Prints "Regenerating stale pages..." then "⊘ Skipped: no stale pages". Exit code 0.
4. Clean up the temporary file.

### 5. Unknown page returns error

1. Run `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/nonexistent-page.mdx`
2. **Expected:** Prints `[regenerate] Page "commands/nonexistent-page.mdx" not found in page-source-map.json`. Exit code 1.

### 6. Build passes with regeneration module present

1. Run `npm run build`
2. **Expected:** Build succeeds with 65 pages, no errors.

### 7. Link check passes

1. Run `node scripts/check-links.mjs`
2. **Expected:** All internal links pass (4000+ links, 0 broken).

### 8. API regeneration — single page (requires ANTHROPIC_API_KEY)

1. Back up `src/content/docs/commands/capture.mdx`
2. Run `node scripts/lib/regenerate-page.mjs commands/capture.mdx`
3. **Expected:** Prints model name, input/output token counts, cost estimate, and timing. File is written to `src/content/docs/commands/capture.mdx`.
4. Verify the regenerated file starts with valid `---` frontmatter containing `title:` and `description:`.
5. Verify the file has 6 sections in order: What It Does, Usage, How It Works, What Files It Touches, Examples, Related Commands.
6. Run `npm run build && node scripts/check-links.mjs` — should pass.
7. Restore the backup.

### 9. Batch regeneration — stale pages (requires ANTHROPIC_API_KEY)

1. Create `content/generated/stale-pages.json` with `{ "stalePages": ["commands/capture.mdx"], "reasons": { "commands/capture.mdx": ["src/resources/extensions/gsd/captures.ts"] } }`
2. Run `node scripts/lib/regenerate-page.mjs`
3. **Expected:** Prints per-page result with tokens and cost, then batch summary with totals. Exit code 0.
4. Clean up stale-pages.json and restore any modified pages.

## Edge Cases

### Missing source file graceful handling

1. Create a mock test that calls `regeneratePage("commands/test.mdx", ["src/nonexistent-xyz.ts"], { client: mockClient, dryRun: true })`
2. **Expected:** console.warn prints "⚠ Source file not found: src/nonexistent-xyz.ts". The call still succeeds with remaining source files.

### API returns truncated response (max_tokens)

1. Verified via unit test: when mock response has `stop_reason: 'max_tokens'`, console.warn prints truncation warning and result.stopReason is 'max_tokens'.

### API returns invalid frontmatter

1. Verified via unit test: when mock response text doesn't start with `---\n`, the result has `error: 'invalid frontmatter'` and includes token usage data.

### Missing stale-pages.json for batch mode

1. Run `node scripts/lib/regenerate-page.mjs` without stale-pages.json existing
2. **Expected:** Prints error about missing stale-pages.json. Exit code 1.

## Failure Signals

- Unit tests fail → regeneration module code is broken
- Build fails after regeneration → generated MDX has syntax errors
- Link check fails → regenerated page has broken internal links (wrong relative format)
- Frontmatter validation fails → prompt is not producing valid MDX structure
- `regeneratePage()` throws instead of returning error object → error handling regression

## Requirements Proved By This UAT

- R038 — Tests 1-5 prove the module handles all code paths correctly (API call, no-key skip, errors). Tests 8-9 prove live API integration when key is available.
- R039 — Test 8 proves the system prompt produces output with correct section structure, Mermaid styling, and link format. Unit tests verify prompt includes quality rules and exemplar.

## Not Proven By This UAT

- Actual Claude API token costs at scale — only estimates based on source file sizes are available until a full API-based regeneration run happens
- Performance characteristics under large batch sizes (20+ pages) — only tested with 1-3 pages
- Prompt effectiveness for non-command page types (recipes, reference, walkthrough) — exemplar is command-specific

## Notes for Tester

- Tests 1-7 can be run without an API key and verify all module functionality via mocks and build checks.
- Tests 8-9 require ANTHROPIC_API_KEY and will cost ~$0.12-$0.15 per page regenerated. Always back up and restore originals.
- The "byte-identical" quality result from T02 is the gold standard but was achieved with Claude Code, not the API. The first API-based run may show minor differences — this is expected. The key quality signals are: correct section order, valid frontmatter, Mermaid diagrams present, relative link format correct.
- If an API-based regeneration produces lower quality, the prompt in `buildSystemPrompt()` can be tuned without changing the module's API contract.
