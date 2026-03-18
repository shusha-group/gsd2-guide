# S01: Claude Code Regeneration Engine

**Goal:** `regeneratePage()` spawns `claude -p` instead of calling `@anthropic-ai/sdk`, with correct prompt construction, graceful degradation when CLI is missing, and dep-capping for high-dependency reference pages.
**Demo:** Running `node scripts/lib/regenerate-page.mjs commands/capture.mdx` regenerates the page via `claude -p` with full tool access, the output has correct frontmatter and all 6 sections, and passes the Astro build.

## Must-Haves

- `regeneratePage(pagePath, sourceFiles, options)` spawns `claude -p` with `spawnSync` instead of calling `@anthropic-ai/sdk`
- Same exported function signatures — `regeneratePage()` and `regenerateStalePages()` — so `update.mjs` wiring is unchanged
- Prompt includes quality rules (section order, Mermaid styling, frontmatter format, link format) and exemplar page as system prompt
- Claude writes the updated MDX directly via the Write tool; Node.js validates frontmatter after subprocess exits
- Reference pages with 100+ deps get curated source file list (compiled JSON) instead of raw dep list
- When `claude` CLI is not in PATH, returns `{ skipped: true, reason: 'claude CLI not available' }`
- `update.mjs` replaces `ANTHROPIC_API_KEY` guard with `claude` CLI availability check
- `@anthropic-ai/sdk` removed from `package.json` devDependencies
- All unit tests pass with new mock strategy (subprocess-level, not `options.client`)

## Proof Level

- This slice proves: integration (subprocess invocation + prompt quality + pipeline wiring)
- Real runtime required: yes (T03 runs `claude -p` on a real page)
- Human/UAT required: no (automated frontmatter + section checks, build verification)

## Verification

- `node --test tests/regenerate-page.test.mjs` — all tests pass with new subprocess mock strategy
- `node scripts/lib/regenerate-page.mjs commands/capture.mdx` — regenerates via `claude -p`, output has correct frontmatter and 6 sections
- `npm run build` — Astro build passes with any regenerated pages
- `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` — returns nothing (SDK fully removed)
- `node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json','utf8')); if(pkg.devDependencies?.['@anthropic-ai/sdk']) process.exit(1)"` — SDK not in devDependencies

## Observability / Diagnostics

- Runtime signals: `claude -p` subprocess exit code, `duration_ms` from stream-json result, model name from stream-json init event, console output with `✓`/`✗`/`⊘` status per page
- Inspection surfaces: CLI entry point `node scripts/lib/regenerate-page.mjs <page>` for single-page debug
- Failure visibility: subprocess stderr captured and reported in error result, timeout detection via `spawnSync` timeout option, frontmatter validation failure reported with page path
- Redaction constraints: none (no API keys — uses subscription auth)

## Integration Closure

- Upstream surfaces consumed: `content/generated/page-source-map.json` (staleness map), `content/generated/stale-pages.json` (batch trigger), `content/generated/*.json` (compiled data for reference pages)
- New wiring introduced in this slice: `update.mjs` claude CLI check replaces `ANTHROPIC_API_KEY` guard
- What remains before the milestone is truly usable end-to-end: S02 runs the full pipeline end-to-end with `npm run update`, verifies the 3 stale pages, and proves the commit/push/deploy cycle

## Tasks

- [ ] **T01: Rewrite regeneratePage() to spawn claude -p subprocess** `est:2h`
  - Why: This is the core implementation — replacing the Anthropic SDK call with `spawnSync('claude', ...)`, building new prompt construction functions, parsing stream-json output, adding reference-page dep capping, and implementing graceful degradation when `claude` CLI is missing.
  - Files: `scripts/lib/regenerate-page.mjs`
  - Do: Replace `buildSystemPrompt()`, `buildUserMessage()`, and the `client.messages.create()` call with `spawnSync` invocation. Build `findClaude()` for CLI detection. Build `buildPrompt(pagePath, sourceFiles)` for the user message (stdin). Move quality rules + exemplar into `--system-prompt` flag. Parse stream-json output for `result` type (duration_ms, subtype) and `system`/`init` type (model). Add dep capping: when `sourceFiles.length > 50`, substitute curated paths for known reference pages. Update CLI entry point to report duration instead of cost. Remove all `@anthropic-ai/sdk` imports.
  - Verify: `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log(typeof m.regeneratePage, typeof m.regenerateStalePages))"` prints `function function`
  - Done when: Module loads without errors, exports both functions with correct signatures, `findClaude()` returns true in this environment, and the code has zero references to `@anthropic-ai/sdk`

- [ ] **T02: Rewrite regenerate-page tests for subprocess mock strategy** `est:1h30m`
  - Why: The existing tests mock `options.client` (Anthropic SDK client injection) which no longer exists. Tests must validate prompt construction, stream-json parsing, graceful degradation, and batch logic using subprocess-level mocks.
  - Files: `tests/regenerate-page.test.mjs`
  - Do: Replace `options.client` mock tests with: (1) unit tests for `buildPrompt()` / prompt construction verifying section rules, exemplar inclusion, dep capping for reference pages; (2) unit tests for stream-json output parsing verifying model extraction, duration extraction, error detection; (3) unit tests for `findClaude()` graceful degradation; (4) batch tests for `regenerateStalePages()` with mocked subprocess; (5) frontmatter validation tests. Mock `spawnSync` by using `options.claudePath` to point at a shell script that echoes canned stream-json output, or by testing internal functions directly.
  - Verify: `node --test tests/regenerate-page.test.mjs` — all tests pass
  - Done when: All tests pass, test count is ≥10, covering prompt construction, stream-json parsing, graceful degradation, frontmatter validation, and batch logic

- [ ] **T03: Wire update.mjs, remove SDK, and run integration proof** `est:1h`
  - Why: The pipeline's `runRegenerateStale()` in `update.mjs` still guards on `ANTHROPIC_API_KEY`. This must be replaced with a `claude` CLI check. The `@anthropic-ai/sdk` dependency must be removed from `package.json`. Finally, the integration proof must demonstrate that `claude -p` produces quality documentation matching M002 standards.
  - Files: `scripts/update.mjs`, `package.json`
  - Do: (1) In `update.mjs`, replace the `ANTHROPIC_API_KEY` check with `findClaude()` imported from `regenerate-page.mjs` (or inline equivalent). Update the skip message to say "claude CLI not available" instead of "ANTHROPIC_API_KEY not set". (2) Remove `@anthropic-ai/sdk` from `package.json` devDependencies. Run `npm install` to update lockfile. (3) Run the integration proof: `node scripts/lib/regenerate-page.mjs commands/capture.mdx` and verify the output has correct frontmatter and all 6 required sections (What It Does, Usage, How It Works, What Files It Touches, Examples, Related Commands). (4) Run `npm run build` to verify the regenerated page passes the Astro build. (5) Run `node --test tests/regenerate-page.test.mjs` to confirm tests still pass after SDK removal.
  - Verify: `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` returns nothing; `npm run build` passes; `node --test tests/regenerate-page.test.mjs` passes
  - Done when: SDK fully removed, update.mjs uses claude CLI check, integration proof passes (capture.mdx regenerated with correct structure), build passes

## Files Likely Touched

- `scripts/lib/regenerate-page.mjs`
- `scripts/update.mjs`
- `tests/regenerate-page.test.mjs`
- `package.json`
