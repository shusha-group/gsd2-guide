---
id: T02
parent: S01
milestone: M004
provides:
  - 20 passing tests covering parseStreamJson, findClaude, prompt construction, regeneratePage integration, and regenerateStalePages batch logic
  - mock-claude.sh executable fixture for subprocess-level testing without real claude CLI
key_files:
  - tests/regenerate-page.test.mjs
  - tests/fixtures/mock-claude.sh
key_decisions:
  - Test prompt construction indirectly via MOCK_CAPTURE_STDIN env var since buildSystemPrompt/buildUserMessage/capDeps are not exported
  - Mock script handles --version flag so findClaude() accepts it as a valid claude binary
  - Use process.env mutation for mock subprocess env vars since spawnSync inherits parent env
patterns_established:
  - Mock subprocess pattern: shell script controlled by env vars (MOCK_EXIT_CODE, MOCK_WRITE_PATH, MOCK_BAD_FRONTMATTER, MOCK_CAPTURE_STDIN) enables testing all result shapes without real CLI
  - Stdin capture pattern: MOCK_CAPTURE_STDIN writes subprocess stdin to a file for test assertion, enabling indirect verification of unexported prompt functions
observability_surfaces:
  - Test runner TAP output: `node --test tests/regenerate-page.test.mjs` reports 20 pass/fail results across 5 suites
  - Mock script env vars document all controllable error simulation paths
duration: 15m
verification_result: passed
completed_at: 2026-03-18
blocker_discovered: false
---

# T02: Rewrite regenerate-page tests for subprocess mock strategy

**Replaced SDK client-mock tests with 20 subprocess-level tests using mock-claude.sh, covering parseStreamJson, findClaude, prompt construction, regeneratePage integration, and regenerateStalePages batch logic.**

## What Happened

Rewrote `tests/regenerate-page.test.mjs` from scratch. The old file (342 lines) used `options.client` mock injection for the Anthropic SDK — an injection point that no longer exists after T01. The new file (320 lines) tests the subprocess-based implementation across 5 suites:

1. **parseStreamJson (6 tests):** Model extraction from system/init event, duration_ms from result event, error subtype detection, non-JSON line skipping (hook output), empty/null stdout handling.

2. **findClaude (3 tests):** Default path returns true (claude installed), nonexistent path returns false, mock-claude.sh returns true (responds to `--version`).

3. **Prompt construction (2 tests, indirect via stdin capture):** Since `buildUserMessage` and `capDeps` are not exported, tests use `MOCK_CAPTURE_STDIN` to capture the stdin sent to the mock subprocess. Verifies pagePath and source file list appear in user message. Verifies reference pages with >50 deps get curated path substitution (skills.json instead of 60 individual deps).

4. **regeneratePage integration (5 tests):** Success case returns pagePath/model/durationMs. Non-zero exit returns error with stderr details. Nonexistent claudePath returns `{ skipped: true }`. Bad frontmatter returns `{ error: 'invalid frontmatter' }`. DryRun mode skips file validation.

5. **regenerateStalePages batch (4 tests):** Empty stalePages returns skip. Multiple pages processed sequentially with aggregated results. Missing stale-pages.json returns error. Missing claude path causes all pages to skip.

Created `tests/fixtures/mock-claude.sh` — a bash script that handles `--version` (for findClaude), reads stdin, writes canned MDX to MOCK_WRITE_PATH, and emits stream-json output. All behavior is controllable via env vars.

## Verification

- `node --test tests/regenerate-page.test.mjs` — 20 tests pass, 0 failures, 5 suites
- `test -x tests/fixtures/mock-claude.sh` — mock script is executable
- Test count ≥ 10 (actual: 20)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `node --test tests/regenerate-page.test.mjs` | 0 | ✅ pass (20/20 tests) | 224ms |
| 2 | `test -x tests/fixtures/mock-claude.sh` | 0 | ✅ pass | <1s |
| 3 | `node --test tests/regenerate-page.test.mjs` (all pass, slice check) | 0 | ✅ pass | 231ms |
| 4 | `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` (slice check) | 0 | ⏳ deferred — SDK removal is T03 scope | <1s |
| 5 | `node -e "...findClaude('/nonexistent/claude')..."` (graceful degradation, slice check) | 0 | ✅ pass | <1s |

## Diagnostics

- **Run tests:** `node --test tests/regenerate-page.test.mjs` — TAP output shows per-test pass/fail
- **Mock script standalone:** `echo "test" | MOCK_MODEL=test-model tests/fixtures/mock-claude.sh -p` — outputs stream-json with custom model
- **Stdin inspection:** Set `MOCK_CAPTURE_STDIN=/tmp/stdin.txt` and run a test to inspect what prompt the subprocess receives
- **Error simulation:** Set `MOCK_EXIT_CODE=1` and `MOCK_STDERR="custom error"` to test error paths

## Deviations

- Added `MOCK_CAPTURE_STDIN` env var support to mock-claude.sh — not in plan but needed to test prompt construction indirectly since buildUserMessage/capDeps are not exported. Minor addition, no plan impact.
- Added a 6th parseStreamJson test (null/undefined input) and a 5th regeneratePage test (dryRun mode) beyond the plan's minimum scenarios. Adds coverage without plan conflict.

## Known Issues

- `@anthropic-ai/sdk` still appears in `package.json` — SDK removal is T03 scope.
- Prompt construction tests verify stdin content but cannot verify the `--system-prompt` flag value (system prompt is passed as a CLI arg, not via stdin). Exemplar and quality rule verification would require intercepting CLI args, which the mock script could do but was not implemented. The indirect coverage via successful end-to-end mock tests provides reasonable confidence.

## Files Created/Modified

- `tests/regenerate-page.test.mjs` — fully rewritten: 20 tests across 5 suites covering all subprocess-based test scenarios
- `tests/fixtures/mock-claude.sh` — new executable mock script simulating claude CLI for tests
- `.gsd/milestones/M004/slices/S01/tasks/T02-PLAN.md` — added Observability Impact section (pre-flight fix)
