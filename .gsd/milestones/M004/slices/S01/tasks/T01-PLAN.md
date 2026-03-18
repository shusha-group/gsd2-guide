---
estimated_steps: 8
estimated_files: 1
---

# T01: Rewrite regeneratePage() to spawn claude -p subprocess

**Slice:** S01 — Claude Code Regeneration Engine
**Milestone:** M004

## Description

Replace the Anthropic SDK-based implementation of `regeneratePage()` in `scripts/lib/regenerate-page.mjs` with a `spawnSync('claude', ['-p', ...])` subprocess call. This is the core of the slice — all other tasks depend on this working correctly.

The current implementation:
1. Reads source files from the gsd-pi package into memory
2. Constructs a system prompt (quality rules + exemplar page) and user message (source files + current page)
3. Calls `client.messages.create()` with the Anthropic SDK
4. Validates frontmatter in the response text
5. Writes the response to disk

The new implementation:
1. Checks if `claude` CLI is available (graceful degradation)
2. Constructs a system prompt with quality rules + exemplar (passed via `--system-prompt` flag)
3. Constructs a user message (task instruction + source file list, NOT file contents — Claude reads them itself via tools) passed via stdin
4. Calls `spawnSync('claude', ['-p', '--output-format', 'stream-json', '--no-session-persistence', '--dangerously-skip-permissions', '--model', 'sonnet'], { input, cwd: ROOT })`
5. Claude reads the files and writes the updated MDX directly via its Write tool
6. Node.js reads the file back to validate frontmatter
7. Parses stream-json output for metadata (model from `system`/`init` event, duration_ms from `result` event)

Key differences from the old approach:
- Source files are NOT read into memory and sent in the prompt. Instead, the prompt tells Claude which files to read — Claude does the reading via its Read tool.
- Claude writes the file directly. Node.js does NOT write the response text to disk.
- The return shape changes slightly: `inputTokens`/`outputTokens` become `0` with subscription auth. `elapsedMs` comes from `duration_ms` in stream-json. `model` comes from the `system`/`init` stream-json event.
- `options.client` injection point is removed. `options.claudePath` is added for testing (overrides the `claude` binary path).

## Steps

1. **Add `findClaude()` function.** Replace the `ANTHROPIC_API_KEY` check at the top of `regeneratePage()`. Use `execSync('claude --version', { stdio: ['pipe','pipe','pipe'], timeout: 5000 })` wrapped in try/catch. Export this function (T03 needs it for `update.mjs`). Accept `options.claudePath` override — if provided, check that path instead.

2. **Build the system prompt for `--system-prompt` flag.** Reuse the quality rules from the existing `buildSystemPrompt()` but adapt for the new approach: Claude now writes files directly (no "output only the MDX" instruction). Keep section order rules, frontmatter format, Mermaid styling, link format, file tables. Include the exemplar page (`commands/capture.mdx`) read at invocation time. The system prompt should NOT contain source file paths — those go in the user message.

3. **Build the user message (stdin input).** This replaces `buildUserMessage()`. The message instructs Claude to:
   - Read the current page at `src/content/docs/<pagePath>`
   - Read specific source files (listed by path, relative to project root)
   - Update the page to reflect current source, preserving good content
   - Write the updated MDX to `src/content/docs/<pagePath>`
   For reference pages with 100+ deps, substitute curated paths:
   - `reference/skills.mdx` → `content/generated/skills.json`
   - `reference/extensions.mdx` → `content/generated/extensions.json`
   - `reference/agents.mdx` → `content/generated/agents.json`
   The dep-capping threshold should be configurable via `options.depThreshold` (default: 50).

4. **Implement the `spawnSync` call.** Replace the `client.messages.create()` call:
   ```js
   const result = spawnSync(claudePath, [
     '-p',
     '--output-format', 'stream-json',
     '--no-session-persistence',
     '--dangerously-skip-permissions',
     '--model', options.model || 'sonnet',
     '--system-prompt', systemPrompt,
   ], {
     input: userMessage,
     encoding: 'utf8',
     stdio: ['pipe', 'pipe', 'pipe'],
     env: process.env,
     cwd: ROOT,  // Project root, NOT worktree — avoids broken hooks
     timeout: options.timeout || 300_000,
   });
   ```
   Handle exit codes: 0 = success, non-zero = error. Capture stderr for error reporting.

5. **Parse stream-json output.** The stdout contains newline-delimited JSON objects. Parse each line, looking for:
   - `type === 'system'` with `subtype === 'init'` → extract `model`
   - `type === 'result'` → extract `duration_ms`, `subtype` (success/error), `result` (text content)
   Skip hook output lines (`type === 'system'` with `subtype === 'hook_response'`). Build a `parseStreamJson(stdout)` helper function.

6. **Validate the written file.** After subprocess exits successfully, read back the file at `src/content/docs/<pagePath>` and check frontmatter (`---\n` at start, second `---\n` found). If validation fails, return error result. For `dryRun` mode: modify the prompt to tell Claude to output MDX to stdout instead of writing the file, then capture from the stream-json `result` text.

7. **Update the return shape.** Return:
   ```js
   { pagePath, inputTokens: 0, outputTokens: 0, model, elapsedMs: durationMs, durationMs }
   ```
   Keep `inputTokens`/`outputTokens` at 0 (subscription auth) for backward compatibility with `regenerateStalePages()` aggregation. Add `durationMs` as a new explicit field.

8. **Update the CLI entry point.** Replace cost formatting with duration reporting. Remove the `formatCost()` function. Report model and duration. The skip message should say "claude CLI not available" instead of "no API key".

### Important constraints:
- `cwd` in `spawnSync` must be the **project root** (`ROOT` = `path.resolve(__dirname, '../..')`), NOT the worktree. The worktree has a broken `.claude/hooks/gsd-check-update.js` that causes errors.
- Remove the `import { resolvePackagePath } from "./extract-local.mjs"` — source files are no longer read by Node.js.
- Remove all references to `@anthropic-ai/sdk`.
- The `--system-prompt` flag value may be very long (exemplar page is ~200 lines). This is fine — shell argument limits are typically 2MB+ on macOS/Linux.
- Keep `regenerateStalePages()` largely unchanged — it calls `regeneratePage()` per page, and the aggregation logic stays the same.
- Add `import { execSync, spawnSync } from "node:child_process"` at the top.

## Must-Haves

- [ ] `findClaude()` exported and returns boolean, accepts optional path override
- [ ] System prompt includes quality rules + exemplar page content
- [ ] User message instructs Claude to read source files and write updated MDX
- [ ] Reference pages with >50 deps get curated source file list
- [ ] `spawnSync` call has correct flags: `--output-format stream-json`, `--no-session-persistence`, `--dangerously-skip-permissions`, `--model sonnet`
- [ ] Stream-json parsing extracts model and duration_ms
- [ ] Frontmatter validated by reading file back after subprocess exits
- [ ] Graceful degradation returns `{ skipped: true, reason: 'claude CLI not available' }`
- [ ] Zero references to `@anthropic-ai/sdk` in the file
- [ ] `regenerateStalePages()` still works (calls updated `regeneratePage()`)

## Verification

- `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => { console.log('regeneratePage:', typeof m.regeneratePage); console.log('regenerateStalePages:', typeof m.regenerateStalePages); console.log('findClaude:', typeof m.findClaude); })"` — prints `function` for all three
- `grep "@anthropic-ai/sdk" scripts/lib/regenerate-page.mjs` — returns nothing (exit code 1)
- `grep "options.client" scripts/lib/regenerate-page.mjs` — returns nothing (exit code 1)
- `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log('claude found:', m.findClaude()))"` — prints `claude found: true`

## Inputs

- `scripts/lib/regenerate-page.mjs` — current SDK-based implementation (243 lines). Full source is in the preloaded context.
- `src/content/docs/commands/capture.mdx` — exemplar page (quality reference). Read at runtime by the new code.
- `content/generated/page-source-map.json` — dep mappings. Used by CLI entry point and batch mode.
- S01-RESEARCH.md findings on: subprocess mechanics (`spawnSync` works, `claude` on PATH), stream-json format (result/system/init types), CWD requirements (project root, not worktree), dep capping strategy (compiled JSON for reference pages).

## Observability Impact

- **New signals:** `claude -p` subprocess exit code (0=success, non-zero=error), `duration_ms` from stream-json `result` event, `model` from stream-json `system`/`init` event, console output with `✓`/`✗`/`⊘` status per page
- **Removed signals:** `inputTokens`/`outputTokens` (always 0 with subscription auth), cost formatting (`formatCost()` removed)
- **Inspection:** Run `node scripts/lib/regenerate-page.mjs <page>` for single-page debug — reports model, duration, and success/failure status. `findClaude()` export lets callers check CLI availability without spawning a full subprocess.
- **Failure visibility:** Subprocess stderr captured and included in error result objects (`details` field). Timeout detection via `spawnSync` timeout option. Frontmatter validation failure reported with page path. Non-zero exit code triggers error result with stderr contents.

## Expected Output

- `scripts/lib/regenerate-page.mjs` — fully rewritten to use `claude -p` subprocess. Exports `regeneratePage()`, `regenerateStalePages()`, and `findClaude()`. Zero SDK references. Same function signatures except `options.client` replaced by `options.claudePath`.
