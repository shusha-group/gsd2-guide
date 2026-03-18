# S01: Claude Code Regeneration Engine — Research

**Date:** 2026-03-18
**Slice:** Replace `@anthropic-ai/sdk` with `claude -p` subprocess in `regenerate-page.mjs`

## Summary

This slice rewrites the core of `scripts/lib/regenerate-page.mjs` to spawn `claude -p` instead of calling the Anthropic SDK. The work is mechanically straightforward — the existing module structure, function signatures, and pipeline wiring all stay identical. Only the inner implementation of `regeneratePage()` changes: instead of `client.messages.create()`, it calls `spawnSync('claude', ['-p', ...])`.

The highest-risk item (confirmed by testing) is subprocess invocation mechanics, which are now fully understood: `spawnSync` works, `claude` is discoverable in Node.js `process.env`, cwd must be the project root (not the worktree), `--dangerously-skip-permissions` is required, and `--output-format stream-json` gives duration and model metadata even without API key auth. The "claude missing" graceful degradation path is straightforward.

The second risk — prompt design for high-dep reference pages — is resolved: `reference/skills.mdx` (295 deps) and `reference/extensions.mdx` (289 deps) are data-driven pages that import compiled JSON. Their 295/289 deps are correct for **staleness detection** but wrong for **regeneration prompts**. For these pages, the prompt should direct claude to read `content/generated/skills.json` / `content/generated/extensions.json` (which the extract step already produces), not all the raw source files.

Tests need significant rewriting: the existing `regenerate-page.test.mjs` uses `options.client` mock injection, which no longer applies. New tests will mock the subprocess at the `spawnSync` level or use integration-style checks.

## Recommendation

Rewrite `regeneratePage()` using `spawnSync` with these exact mechanics:

```js
const result = spawnSync('claude', [
  '-p',
  '--output-format', 'stream-json',
  '--no-session-persistence',
  '--dangerously-skip-permissions',
  '--model', 'sonnet',   // faster, cheaper than opus for doc generation
], {
  input: buildPrompt(pagePath, sourceFiles),
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env,
  cwd: ROOT,             // project root, not worktree — avoids broken hooks
  timeout: 300_000,      // 5 min per page; complex docs with tool calls need headroom
});
```

The prompt instructs claude to: read the current page, read the relevant source files, and **write the updated MDX directly** to `src/content/docs/<pagePath>` using the Write tool. Claude's confirmation text goes to stdout (stream-json `result` field); Node.js validates the written file's frontmatter after the subprocess exits.

Parse the stream-json stdout for the `result` type line to get `duration_ms` and `subtype` ("success" or "error"). Get `model` from the `system`/`init` line. Cost and token counts are zero with subscription auth (apiKeySource: "none") — report duration instead.

For reference pages with 100+ deps, substitute a curated `sourceFiles` list in the regeneration prompt: `["content/generated/skills.json"]` for skills, `["content/generated/extensions.json"]` for extensions, `["content/generated/agents.json"]` for agents. The full dep list stays in `page-source-map.json` for staleness detection — only the prompt is adjusted.

## Implementation Landscape

### Key Files

- `scripts/lib/regenerate-page.mjs` — **Primary target.** Replace `buildSystemPrompt()`, `buildUserMessage()`, and the inner `client.messages.create()` call with `spawnSync('claude', ...)`. Keep the same exported function signatures: `regeneratePage(pagePath, sourceFiles, options)` and `regenerateStalePages(options)`. The `options.client` injection point disappears; replace with `options.claudePath` override for testing.
- `scripts/update.mjs` — **No changes needed.** The `runRegenerateStale()` function already calls `regeneratePage()` with the right arguments. Replace the `ANTHROPIC_API_KEY` guard with a `which claude` check.
- `tests/regenerate-page.test.mjs` — **Full rewrite.** Current tests mock `options.client`; new tests must mock at the subprocess level (or skip subprocess and test prompt construction + output parsing logic separately). Keep the batch tests — they test `regenerateStalePages()` logic which stays valid.
- `content/generated/page-source-map.json` — **Verify semantic accuracy.** All 43 entries have structurally valid deps (confirmed). Need to verify semantic correctness for pages with ambiguous mappings. The reference pages (skills, extensions) are semantically correct for staleness detection but require prompt-level override for regeneration.
- `package.json` — **Remove `@anthropic-ai/sdk` from devDependencies** once the implementation is complete and tests pass.

### Prompt Design

The prompt has two layers:

**System prompt (via `--system-prompt` flag):** Quality rules + exemplar page content. Same rules as current `buildSystemPrompt()`: section order, Mermaid styling, frontmatter format, link format, file tables. Inline the exemplar (`commands/capture.mdx`) verbatim.

**User message (via stdin):** Task instruction. Structure:
```
You are regenerating the documentation page `<pagePath>`.

Read the current page at: src/content/docs/<pagePath>
Read these source files (relative to project root):
  - <source1>
  - <source2>

Update the page to reflect the current source. Preserve good content. Fix outdated content. Match the section structure and quality of the exemplar.

Write the updated MDX to: src/content/docs/<pagePath>
```

For reference pages with 100+ deps, replace the source file list with the appropriate compiled JSON path. For `reference/skills.mdx`: `content/generated/skills.json`. For `reference/extensions.mdx`: `content/generated/extensions.json`. For `reference/agents.mdx`: `content/generated/agents.json`.

For the "rewrite vs review" question: use **"review and update"** (not rewrite from scratch). The existing pages are high quality — the goal is accuracy, not a full rewrite. Tell claude to preserve good content and update what's outdated.

### Graceful Degradation

Replace the `ANTHROPIC_API_KEY` guard with:
```js
function findClaude() {
  try {
    execSync('claude --version', { stdio: ['pipe', 'pipe', 'pipe'], timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
```
If claude is not found, return `{ skipped: true, reason: 'claude CLI not available' }` — same shape as the API key missing case.

### Build Order

1. **Prove subprocess mechanics** — Write a minimal `spawnSync` wrapper that calls `claude -p` with a trivial prompt and parses stream-json output. Verify model, duration_ms, and exit code are captured correctly. This unblocks everything else.

2. **Rewrite `regeneratePage()`** — Replace SDK call with `spawnSync`. Build the new prompt construction functions (`buildPrompt(pagePath, sourceFiles)`). Handle success/error/timeout from subprocess exit codes. Parse stream-json for metadata.

3. **Add reference-page dep capping** — Add a threshold (e.g., `> 50 deps`) to substitute the compiled JSON path instead of listing all source files. Make this configurable via options.

4. **Rewrite tests** — Replace `options.client` mock tests with:
   - Unit tests for prompt construction (no subprocess)
   - Unit tests for stream-json parsing (no subprocess)
   - Unit tests for graceful degradation (mock `spawnSync` to return non-zero exit)
   - One integration test that actually runs `claude -p` on `commands/capture.mdx` (tagged as slow/integration)

5. **Verify page-source-map semantic accuracy** — Cross-check a sample of pages (especially the 3 stale pages: `commands/config.mdx`, `reference/skills.mdx`, `reference/extensions.mdx`) to confirm the mapped source files are the right ones for regeneration.

6. **Remove `@anthropic-ai/sdk`** — Delete from `package.json` devDependencies and `package-lock.json`. Remove all imports.

### Verification Approach

```bash
# 1. Unit tests pass
node --test tests/regenerate-page.test.mjs

# 2. Direct invocation regenerates capture.mdx (the exemplar proof)
node scripts/lib/regenerate-page.mjs commands/capture.mdx

# 3. Validate regenerated page: correct frontmatter + 6 sections
node -e "
const f = fs.readFileSync('src/content/docs/commands/capture.mdx', 'utf8');
const sections = ['What It Does','Usage','How It Works','What Files It Touches','Examples','Related Commands'];
for (const s of sections) {
  if (!f.includes('## ' + s)) console.error('MISSING: ' + s);
}
console.log('Sections: OK');
"

# 4. Astro build passes with the regenerated page
npm run build

# 5. Graceful degradation: mock claude as missing
PATH="" node scripts/lib/regenerate-page.mjs commands/capture.mdx
# Should output: ⊘ Skipped: claude CLI not available
```

## Constraints

- `claude` binary is at `/Users/davidspence/.local/bin/claude` — available in `process.env.PATH` when called from the shell (confirmed via `spawnSync` test)
- `--dangerously-skip-permissions` is required to suppress interactive permission prompts in non-interactive mode
- CWD must be the project root (`gsd2-guide/`), NOT the worktree — the worktree has a broken `.claude/hooks/gsd-check-update.js` reference that causes hook errors in stream-json output
- With subscription auth (`apiKeySource: "none"`), `total_cost_usd` and token counts are zero in stream-json — report `duration_ms` instead
- `spawnSync` with `timeout: 300_000` is safe; Node.js event loop is blocked during subprocess but `update.mjs` pipeline is inherently sequential
- The `--model sonnet` flag can be used to prefer sonnet over opus for faster/cheaper doc generation; the model flag uses aliases so `sonnet` resolves to the latest claude-sonnet-* model

## Common Pitfalls

- **Prompt via stdin vs `--system-prompt` flag** — Long prompts (with exemplar page) are better passed via `--system-prompt` flag rather than stdin. The user message (task) goes via stdin. Mixing them keeps the concerns separated: quality rules as system prompt, task as user message.
- **CWD is the worktree in tests** — When tests spawn `claude -p`, if CWD is the worktree directory, the missing hook causes hook-response errors in stream-json. Always set `cwd: ROOT` (project root) or mock `spawnSync` in tests to avoid this.
- **Frontmatter validation after Write** — Since claude writes the file directly, Node.js must read it back to validate frontmatter. The current approach of validating the response text before writing no longer applies. Read the file after subprocess exits.
- **`--no-session-persistence` is required** — Without it, sessions are saved to disk and can accumulate. Always include this flag for automated invocations.
- **stream-json has hook output before content** — Don't try to parse the first line as the result. Iterate all lines looking for `type === 'result'`. The hooks fire before claude's actual response and produce system/hook_response lines.
- **`options.dryRun` must skip the Write tool** — For dry-run mode, tell claude in the prompt to output the MDX to stdout instead of writing the file. Or: in dryRun mode, pass `--tools ""` to disable all tools and capture the text output directly.

## Open Risks

- **claude -p quality for documentation pages** — Not yet proven on a full documentation page (only tested on trivial prompts). The proof is: regenerate `commands/capture.mdx` and compare against original. This is the first thing to validate.
- **Hook noise in stream-json parsing** — The user's global claude config fires hooks on `SessionStart`. While these don't break the result, they add noise to the stream-json output that the parser must skip. Using `cwd = project root` (no project-level Claude config) reduces this but doesn't eliminate global hooks.
- **Timeout tuning** — 5 minutes may be too short for reference pages with heavy tool use, or too long as a worst-case wait. Monitor actual durations during development and adjust.
- **`--model sonnet` vs default (opus)** — The user's default model is `claude-opus-4-6`. Sonnet is faster but may produce lower quality documentation. The right call depends on quality testing during S01.

## Forward Intelligence

Key facts that would have taken time to discover without testing:

1. **`claude` is on PATH in Node.js subprocess** — `spawnSync('claude', ['--version'])` returns exit 0 with version string. No PATH manipulation needed.
2. **CWD matters for hooks** — Setting `cwd: '/path/to/worktree'` triggers the worktree's broken hook. Set `cwd: ROOT` (project root, which has no `.claude/` directory).
3. **Cost/tokens are zero with subscription** — `total_cost_usd: 0` and `input_tokens: 0` in stream-json result. Duration_ms is non-zero. Model is available from the `system`/`init` event.
4. **Claude writes relative to CWD** — When instructed to write to `src/content/docs/commands/capture.mdx`, claude resolves this relative to CWD. Correct CWD = correct file written.
5. **Reference pages are data-driven** — `reference/skills.mdx` imports `skills.json` via Astro/MDX import syntax. Passing 295 raw skill source files to the regeneration prompt would confuse and waste context. Pass `content/generated/skills.json` instead.
6. **`--dangerously-skip-permissions` is required** — Without it, claude prompts for permission interactively, blocking the subprocess.
7. **`--no-session-persistence` prevents session accumulation** — Must always be included for automated runs.
