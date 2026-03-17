# S02: LLM Page Regeneration — UAT

**Milestone:** M003
**Written:** 2026-03-17

## UAT Type

- UAT mode: mixed (artifact-driven for unit tests and build, live-runtime for API regeneration)
- Why this mode is sufficient: The module has two verification layers — unit tests with mocked SDK prove all code paths, and live regeneration (when API key is available) proves output quality. Build + link check proves the output is valid MDX.

## Preconditions

- Working directory: `/Users/davidspence/dev/gsd2-guide`
- `npm install` has been run (node_modules present)
- `content/generated/page-source-map.json` exists (from S01)
- `content/generated/stale-pages.json` exists (from S01)
- gsd-pi package is installed in node_modules

## Smoke Test

Run `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/capture.mdx` — should print "⊘ Skipped: no API key" and exit 0. This confirms the module loads, resolves the page in the source map, and handles the no-key path cleanly.

## Test Cases

### 1. Unit tests pass

1. Run `node --test tests/regenerate-page.test.mjs`
2. **Expected:** 13/13 tests pass, 0 failures, 0 skipped. Tests cover: no-key skip, prompt construction (quality rules, exemplar, source/current_page tags), token usage extraction, missing source file warning, invalid frontmatter rejection, max_tokens warning, API error handling, batch iteration, empty stale pages, partial failure, missing stale-pages.json.

### 2. Module exports correct API

1. Run `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log(Object.keys(m)))"`
2. **Expected:** `[ 'regeneratePage', 'regenerateStalePages' ]`

### 3. No-key graceful skip (single page)

1. Run `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/capture.mdx`
2. **Expected:** Prints "⊘ Skipped: no API key", exits with code 0. No error output. No file modifications.

### 4. No-key graceful skip (batch mode)

1. Run `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs`
2. **Expected:** Prints "⊘ Skipped: no stale pages" (or processes stale pages if stale-pages.json has entries, each reporting skip). Exits with code 0.

### 5. Nonexistent page returns structured error

1. Run `node scripts/lib/regenerate-page.mjs commands/nonexistent-page.mdx`
2. **Expected:** Prints error message about page not found in page-source-map.json. Exits with code 1. No crash or unhandled exception.

### 6. Build passes with current content

1. Run `npm run build`
2. Run `node scripts/check-links.mjs`
3. **Expected:** Build completes (60 pages). Link check reports 0 broken links out of ~3665 checked.

### 7. Live API regeneration (requires ANTHROPIC_API_KEY)

1. Back up `src/content/docs/commands/capture.mdx` (`cp src/content/docs/commands/capture.mdx /tmp/capture.mdx.bak`)
2. Run `ANTHROPIC_API_KEY=<your-key> node scripts/lib/regenerate-page.mjs commands/capture.mdx`
3. **Expected:** 
   - Prints regeneration progress with token usage (inputTokens, outputTokens, model, elapsedMs)
   - Prints cost estimate
   - Overwrites capture.mdx with regenerated content
4. Verify regenerated capture.mdx:
   - Has valid `---` frontmatter with title and description
   - Has sections in order: What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands
   - Has Mermaid diagrams with terminal-native styling (if applicable)
   - All internal links use `../slug/` format
5. Run `npm run build && node scripts/check-links.mjs` — should pass
6. Restore original: `cp /tmp/capture.mdx.bak src/content/docs/commands/capture.mdx`

### 8. Live batch regeneration (requires ANTHROPIC_API_KEY + stale pages)

1. Ensure `content/generated/stale-pages.json` has entries in `stalePages` array
2. Run `ANTHROPIC_API_KEY=<your-key> node scripts/lib/regenerate-page.mjs`
3. **Expected:** Iterates stale pages, regenerates each, prints per-page results and batch totals (successCount, failCount, inputTokens, outputTokens, cost)

## Edge Cases

### Missing source file in page-source-map

1. Temporarily edit `content/generated/page-source-map.json` to add a nonexistent source path for an existing page
2. Run regeneration for that page (with API key or mocked client in tests)
3. **Expected:** Warning logged for missing source file. Regeneration continues with available source files. No crash.

### API returns content without valid frontmatter

1. This is tested in unit tests (test: "invalid frontmatter prevents writing")
2. **Expected:** The module rejects the output and returns `{ error: true }` without writing to disk.

### API response truncated (max_tokens)

1. This is tested in unit tests (test: "max_tokens stop reason triggers warning")
2. **Expected:** Warning logged about truncation. Result still returned but flagged.

## Failure Signals

- `node --test tests/regenerate-page.test.mjs` reports any failures → module code paths broken
- `npm run build` fails after regeneration → invalid MDX output from Claude API
- `node scripts/check-links.mjs` reports broken links after regeneration → link format in prompt needs tuning
- Regenerated page missing sections → system prompt quality rules not being followed by the model
- Regenerated page has `style` blocks or HTML artifacts → model not following "output ONLY MDX" instruction
- Module crashes instead of returning structured error → error handling regression

## Requirements Proved By This UAT

- R038 — Tests 1-5, 7 prove the regeneration module works end-to-end (unit-tested code paths + live API call)
- R039 — Test 7 step 4 proves the system prompt produces output matching M02 quality rules (section structure, Mermaid styling, link format, frontmatter)

## Not Proven By This UAT

- Actual API token costs are estimated until Test 7 or 8 runs with a real API key
- Quality of regeneration for non-command pages (recipes, walkthrough, reference) — only command deep-dives are tested
- Performance at scale (regenerating 20+ pages in batch) — only tested with 1-3 pages
- Pipeline integration (npm run update → regenerate) — that's S04's responsibility

## Notes for Tester

- Tests 1-6 require no API key and should be run first as a baseline
- Tests 7-8 require `ANTHROPIC_API_KEY` set in the environment — skip if not available
- The T02 quality verification was done by Claude Code (not API) and showed byte-identical output — the prompt template is proven but the API path specifically has not been exercised
- Always back up original MDX files before live regeneration and restore after
- Cost estimate for 3 pages is ~$0.65 (capture $0.12, doctor $0.20, auto $0.33)
