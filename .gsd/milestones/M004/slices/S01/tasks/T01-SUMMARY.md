---
id: T01
parent: S01
milestone: M004
provides:
  - regeneratePage() using claude -p subprocess instead of Anthropic SDK
  - findClaude() CLI detection with graceful degradation
  - parseStreamJson() for extracting model/duration from stream-json output
  - Dep capping for high-dependency reference pages
key_files:
  - scripts/lib/regenerate-page.mjs
key_decisions:
  - parseStreamJson exported for testability (T02 tests it directly)
  - CURATED_SOURCES constant maps reference pages to compiled JSON paths rather than using raw dep lists
  - dryRun mode instructs Claude to output to stdout rather than disabling tools
patterns_established:
  - Claude subprocess pattern: spawnSync with --output-format stream-json, --no-session-persistence, --dangerously-skip-permissions, cwd=ROOT
  - Stream-json parsing: iterate lines, extract model from system/init, duration from result event
  - Graceful degradation: findClaude() check before subprocess spawn, returns { skipped, reason }
observability_surfaces:
  - CLI reports model + duration per page (✓/✗/⊘ prefix)
  - Subprocess stderr captured in error result objects (details field)
  - findClaude() export lets callers test CLI availability independently
duration: 20m
verification_result: passed
completed_at: 2026-03-18
blocker_discovered: false
---

# T01: Rewrite regeneratePage() to spawn claude -p subprocess

**Replaced Anthropic SDK call with spawnSync('claude', ['-p', ...]) subprocess, added findClaude() graceful degradation, stream-json parsing, and dep capping for reference pages.**

## What Happened

Rewrote `scripts/lib/regenerate-page.mjs` from SDK-based to subprocess-based Claude invocation. The new implementation:

1. `findClaude(claudePath?)` — checks CLI availability via `execSync('claude --version')`, accepts optional path override. Exported for use by `update.mjs` (T03).

2. `buildSystemPrompt(exemplarContent)` — carries quality rules (section order, Mermaid styling, frontmatter format, link format, file tables) plus the exemplar page. Adapted instruction to tell Claude it has Read/Write tools instead of "output only MDX".

3. `buildUserMessage(pagePath, sourceFiles, options)` — instructs Claude to read the current page and listed source files, then write updated MDX. Source file paths are listed (not contents) — Claude reads them via tools. For `dryRun`, instructs stdout output instead of file write.

4. `capDeps(pagePath, sourceFiles, threshold)` — substitutes curated compiled JSON paths for reference pages (skills→skills.json, extensions→extensions.json, agents→agents.json) when deps exceed threshold (default: 50).

5. `spawnSync` call with flags: `--output-format stream-json`, `--no-session-persistence`, `--dangerously-skip-permissions`, `--model sonnet`, `--system-prompt`. CWD set to project root (not worktree) to avoid broken hooks.

6. `parseStreamJson(stdout)` — parses newline-delimited JSON, extracts model from `system/init` event and `duration_ms` from `result` event. Exported for testability.

7. Post-subprocess validation reads the file back and checks frontmatter. Returns `{ inputTokens: 0, outputTokens: 0, model, elapsedMs, durationMs }`.

8. CLI entry point reports model + duration instead of token counts + cost. Removed `formatCost()`.

Removed: `import { resolvePackagePath }`, all `@anthropic-ai/sdk` references, `options.client` injection point.

## Verification

All 4 task-level verification commands pass. All 10 must-have checks pass. Slice-level checks partially pass (tests deferred to T02, integration proof to T03).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => { console.log('regeneratePage:', typeof m.regeneratePage); console.log('regenerateStalePages:', typeof m.regenerateStalePages); console.log('findClaude:', typeof m.findClaude); })"` | 0 | ✅ pass | <1s |
| 2 | `grep "@anthropic-ai/sdk" scripts/lib/regenerate-page.mjs` | 1 | ✅ pass (no matches) | <1s |
| 3 | `grep "options.client" scripts/lib/regenerate-page.mjs` | 1 | ✅ pass (no matches) | <1s |
| 4 | `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log('claude found:', m.findClaude()))"` | 0 | ✅ pass (prints true) | <1s |
| 5 | `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => { const r = m.findClaude('/nonexistent/claude'); console.log(r === false ? 'PASS' : 'FAIL'); })"` | 0 | ✅ pass (graceful degradation) | <1s |
| 6 | parseStreamJson unit check with mock stream-json data | 0 | ✅ pass (model, durationMs, subtype extracted) | <1s |

## Diagnostics

- **Single page debug:** `node scripts/lib/regenerate-page.mjs <page>` — reports model, duration, ✓/✗/⊘ status
- **CLI detection:** `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log(m.findClaude()))"` — returns true/false
- **Stream-json parsing:** `parseStreamJson` is exported, can be tested in isolation with mock data
- **Error shapes:** subprocess errors include `{ error, pagePath, details }` with stderr content; frontmatter errors include `{ error: 'invalid frontmatter', pagePath, model, durationMs }`

## Deviations

- Exported `parseStreamJson` (not in plan) — needed for T02 test isolation. Minor addition, no plan impact.

## Known Issues

- Existing tests (`tests/regenerate-page.test.mjs`) will hang/fail because they use old `options.client` injection. T02 rewrites these tests.
- `@anthropic-ai/sdk` is still in `package.json` devDependencies. T03 removes it.

## Files Created/Modified

- `scripts/lib/regenerate-page.mjs` — fully rewritten: SDK → subprocess, new prompt construction, stream-json parsing, dep capping, graceful degradation
- `.gsd/milestones/M004/slices/S01/S01-PLAN.md` — added graceful degradation diagnostic to verification
- `.gsd/milestones/M004/slices/S01/tasks/T01-PLAN.md` — added Observability Impact section
