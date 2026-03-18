---
estimated_steps: 6
estimated_files: 1
---

# T02: Rewrite regenerate-page tests for subprocess mock strategy

**Slice:** S01 — Claude Code Regeneration Engine
**Milestone:** M004

## Description

The existing `tests/regenerate-page.test.mjs` (342 lines) mocks the Anthropic SDK via `options.client` — a fake client object passed to `regeneratePage()`. This injection point no longer exists after T01's rewrite. The tests must be rewritten to validate the new subprocess-based implementation.

The new test strategy has two layers:

1. **Unit tests (no subprocess):** Test internal functions directly — prompt construction (`buildPrompt`/`buildSystemPrompt`), stream-json parsing (`parseStreamJson`), `findClaude()` behavior. These functions should be exported or testable via the module.

2. **Mock subprocess tests:** For tests that exercise `regeneratePage()` end-to-end, use `options.claudePath` to point at a small shell script that echoes canned stream-json output and writes a canned MDX file. This avoids calling the real `claude` CLI in unit tests.

Key test scenarios to cover:
- Prompt includes quality rules and exemplar page
- Prompt instructs Claude to read source files and write output
- Reference pages with >50 deps get curated source file list in prompt
- Stream-json parsing extracts model from `system`/`init` event
- Stream-json parsing extracts duration_ms from `result` event
- Stream-json parsing handles hook output lines (skips them)
- `findClaude()` returns true when claude is available
- `findClaude()` returns false when claudePath points to nonexistent binary
- `regeneratePage()` returns `{ skipped: true, reason: 'claude CLI not available' }` when claude missing
- `regeneratePage()` returns success result with pagePath, model, durationMs on success
- `regeneratePage()` returns error result when subprocess exits non-zero
- `regenerateStalePages()` batch logic processes multiple pages sequentially
- `regenerateStalePages()` returns skip when no stale pages
- Frontmatter validation detects missing `---` markers

## Steps

1. **Create a mock claude script.** Write `tests/fixtures/mock-claude.sh` — a bash script that:
   - Reads stdin (the user message prompt)
   - Writes a canned MDX file to the path extracted from the prompt (or a hardcoded test path)
   - Echoes canned stream-json output to stdout:
     ```
     {"type":"system","subtype":"init","model":"claude-sonnet-4-20250514"}
     {"type":"result","subtype":"success","duration_ms":1234,"result":"Page updated."}
     ```
   - Exits 0 for success, 1 for error (controlled by an env var like `MOCK_EXIT_CODE`)
   Make it executable: `chmod +x tests/fixtures/mock-claude.sh`

2. **Write `findClaude()` tests.** Test that:
   - `findClaude()` returns `true` in the current environment (claude is installed)
   - `findClaude('/nonexistent/path/claude')` returns `false`
   - `findClaude(path.resolve('tests/fixtures/mock-claude.sh'))` returns `true` (or adapt if `findClaude` checks `--version`)

3. **Write prompt construction tests.** If T01 exports `buildPrompt` / `buildSystemPrompt` (or makes them testable):
   - System prompt contains "Section Order" and "Frontmatter Format"
   - System prompt contains exemplar page content (check for a distinctive string from `capture.mdx`)
   - User message contains the pagePath
   - User message lists source files
   - User message with >50 deps for `reference/skills.mdx` substitutes `content/generated/skills.json`
   - User message with >50 deps for `reference/extensions.mdx` substitutes `content/generated/extensions.json`
   
   If these functions are not exported, test indirectly via the mock subprocess: check that the mock script receives expected stdin content.

4. **Write stream-json parsing tests.** If T01 exports `parseStreamJson`:
   - Extracts model from `{"type":"system","subtype":"init","model":"claude-sonnet-4-20250514"}`
   - Extracts duration_ms from `{"type":"result","subtype":"success","duration_ms":5000}`
   - Detects error from `{"type":"result","subtype":"error_max_turns"}`
   - Skips hook_response lines without error
   - Handles empty stdout gracefully

5. **Write `regeneratePage()` integration tests using mock-claude.sh.** Use `options.claudePath` pointing to the mock script:
   - Success case: mock writes valid MDX, returns result with `pagePath`, `model`, `durationMs`
   - Error case: mock exits non-zero, returns error result with details
   - Missing claude: `options.claudePath` points to nonexistent file, returns `{ skipped: true }`
   - Frontmatter validation: mock writes MDX without `---` markers, returns error about invalid frontmatter
   
   **Important:** Set `cwd` context correctly. The mock script needs to know where to write the canned MDX. Use a temp directory or the actual project paths with cleanup.

6. **Write `regenerateStalePages()` tests.** These test the batch wrapper:
   - No stale pages: returns `{ skipped: true, reason: 'no stale pages' }`
   - With stale pages: calls `regeneratePage()` for each, aggregates results
   - Missing stale-pages.json: returns error
   Use a temp `generatedDir` with fixture `stale-pages.json` and `page-source-map.json` files.

## Must-Haves

- [ ] Mock claude script exists at `tests/fixtures/mock-claude.sh` and is executable
- [ ] `findClaude()` tests cover both found and not-found cases
- [ ] Prompt construction verified (section rules, exemplar, dep capping)
- [ ] Stream-json parsing verified (model extraction, duration, error detection)
- [ ] `regeneratePage()` tested with mock subprocess (success, error, missing claude, bad frontmatter)
- [ ] `regenerateStalePages()` batch logic tested
- [ ] All tests pass: `node --test tests/regenerate-page.test.mjs`
- [ ] Test count ≥ 10

## Verification

- `node --test tests/regenerate-page.test.mjs` — all tests pass, 0 failures
- `node --test tests/regenerate-page.test.mjs 2>&1 | grep -c "^ok"` — prints ≥10 (at least 10 passing tests)
- `test -x tests/fixtures/mock-claude.sh` — mock script is executable

## Inputs

- `scripts/lib/regenerate-page.mjs` — T01's rewritten module. Exports `regeneratePage()`, `regenerateStalePages()`, `findClaude()`, and possibly `buildPrompt()`, `buildSystemPrompt()`, `parseStreamJson()`.
- `tests/regenerate-page.test.mjs` — existing test file (342 lines). Review for any batch tests worth preserving, but most will be replaced.
- `src/content/docs/commands/capture.mdx` — exemplar page. Tests may check that the system prompt includes content from this file.
- `content/generated/page-source-map.json` — used by `regenerateStalePages()` tests.

## Expected Output

- `tests/regenerate-page.test.mjs` — fully rewritten test file with ≥10 test cases covering all key scenarios
- `tests/fixtures/mock-claude.sh` — executable mock script for subprocess tests
