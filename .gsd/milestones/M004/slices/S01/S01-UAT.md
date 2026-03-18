# S01: Claude Code Regeneration Engine — UAT

**Milestone:** M004
**Written:** 2026-03-18

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: The slice replaces an SDK call with a subprocess invocation. All verification is testable via CLI commands, file inspection, and build checks. No live server or human experience judgment needed.

## Preconditions

- Working directory: the gsd2-guide project root (or M004 worktree)
- `claude` CLI installed and in PATH (run `claude --version` to confirm)
- `npm install` completed (dependencies installed)
- Node.js 20+ available

## Smoke Test

Run `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log(typeof m.regeneratePage, typeof m.findClaude))"` — should print `function function`.

## Test Cases

### 1. All tests pass

1. Run `node --test tests/regenerate-page.test.mjs`
2. **Expected:** 20 tests pass across 5 suites (parseStreamJson, findClaude, prompt construction, regeneratePage, regenerateStalePages), 0 failures.

### 2. SDK fully removed

1. Run `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json`
2. **Expected:** No output, exit code 1 (no matches found anywhere).

### 3. SDK not in devDependencies

1. Run `node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json','utf8')); if(pkg.devDependencies?.['@anthropic-ai/sdk']) { console.log('FAIL'); process.exit(1); } else { console.log('PASS'); }"`
2. **Expected:** Prints `PASS`.

### 4. Graceful degradation when claude CLI is missing

1. Run `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => { const r = m.findClaude('/nonexistent/claude'); console.log('graceful degradation:', r === false ? 'PASS' : 'FAIL'); })"`
2. **Expected:** Prints `graceful degradation: PASS`.

### 5. findClaude detects real claude CLI

1. Run `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log('claude found:', m.findClaude()))"`
2. **Expected:** Prints `claude found: true` (assumes claude is installed).

### 6. update.mjs uses findClaude guard (not ANTHROPIC_API_KEY)

1. Run `grep "ANTHROPIC_API_KEY" scripts/update.mjs`
2. **Expected:** No output (exit code 1).
3. Run `grep "findClaude" scripts/update.mjs`
4. **Expected:** Shows import line and guard usage (exit code 0).

### 7. Astro build passes

1. Run `npm run build`
2. **Expected:** Build completes with 64 pages, no errors. Output includes `✓ Completed` and page count.

### 8. Single-page regeneration (integration proof)

1. Run `node scripts/lib/regenerate-page.mjs commands/capture.mdx`
2. **Expected:** Prints `✓ commands/capture.mdx` with model name and duration (~2 minutes). Exit code 0.
3. Read `src/content/docs/commands/capture.mdx`
4. **Expected:** File has valid YAML frontmatter (`title:` field present) and all 6 sections: "What It Does", "Usage", "How It Works", "What Files It Touches", "Examples", "Related Commands".

### 9. Regenerated page builds cleanly

1. After test case 8, run `npm run build`
2. **Expected:** Build passes with no errors related to capture.mdx.

### 10. Exported function signatures preserved

1. Run:
   ```
   node -e "import('./scripts/lib/regenerate-page.mjs').then(m => {
     console.log('regeneratePage:', typeof m.regeneratePage);
     console.log('regenerateStalePages:', typeof m.regenerateStalePages);
     console.log('findClaude:', typeof m.findClaude);
     console.log('parseStreamJson:', typeof m.parseStreamJson);
   })"
   ```
2. **Expected:** All four print `function`.

## Edge Cases

### Nonexistent page path

1. Run `node scripts/lib/regenerate-page.mjs commands/nonexistent.mdx`
2. **Expected:** Reports an error (✗ prefix) but does not crash the process.

### Mock claude subprocess (test fixture)

1. Run `echo "test" | MOCK_MODEL=test-model tests/fixtures/mock-claude.sh -p`
2. **Expected:** Outputs stream-json lines with model "test-model". Exit code 0.

### Mock claude --version

1. Run `tests/fixtures/mock-claude.sh --version`
2. **Expected:** Outputs a version string. Exit code 0.

## Failure Signals

- `node --test tests/regenerate-page.test.mjs` reports any failures — indicates broken test coverage or implementation regression
- `grep -r "@anthropic-ai/sdk"` finds matches — SDK was not fully removed
- `npm run build` fails — regenerated content broke the Astro build
- `findClaude()` returns false when claude IS installed — CLI detection is broken
- `update.mjs` still references ANTHROPIC_API_KEY — guard was not replaced

## Requirements Proved By This UAT

- R048 — Test cases 8, 10 prove `regeneratePage()` spawns `claude -p` with correct function signature
- R054 — Test cases 2, 3 prove SDK fully removed from all files and dependencies
- R056 — Test case 4 proves graceful degradation when claude CLI is absent

## Not Proven By This UAT

- R049 — Full pipeline invocation (`npm run update` with real stale pages) is S02 scope
- R050 — Quality across all page types (only capture.mdx tested here; reference pages, recipes deferred to S02)
- R051 — Semantic correctness of all 43 page-source-map entries (structural validity only)
- R052 — End-to-end cycle with commit/push/deploy (S02 scope)
- R053 — "Update gsd-guide" zero-intervention completion (S02 scope)
- R055 — Fast path timing when no pages are stale (S02 scope)

## Notes for Tester

- Test case 8 (single-page regeneration) takes ~2 minutes and requires an active Claude Code subscription. Skip if testing in an environment without claude CLI — the graceful degradation test (case 4) confirms the fallback path.
- The regenerated capture.mdx content may differ slightly from the original M002 version in wording, but must have the same structural sections and valid frontmatter.
- All other test cases complete in under 10 seconds total.
