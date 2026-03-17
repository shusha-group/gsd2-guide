---
estimated_steps: 8
estimated_files: 3
---

# T01: Build regeneration module with prompt template and unit tests

**Slice:** S02 — LLM Page Regeneration
**Milestone:** M003

## Description

Build the core `scripts/lib/regenerate-page.mjs` module that calls the Claude API to regenerate documentation pages from source code. The module reads source files from the globally-installed gsd-pi package, reads the current page content, constructs a system prompt with quality rules and an exemplar page, sends everything to Claude, validates the output, and writes updated MDX. Includes a batch wrapper for processing multiple stale pages and a CLI entry point for direct invocation. Unit tests mock the Anthropic SDK to verify all code paths without needing an API key.

## Steps

1. **Install `@anthropic-ai/sdk` as devDependency.** Run `npm install --save-dev @anthropic-ai/sdk`. Verify it appears in `package.json` under `devDependencies`.

2. **Create `scripts/lib/regenerate-page.mjs` with core `regeneratePage()` function.** The function signature is `regeneratePage(pagePath, sourceFiles, options)` where:
   - `pagePath` is a content-relative key like `commands/capture.mdx`
   - `sourceFiles` is an array of repo-relative source paths like `["src/resources/extensions/gsd/captures.ts", ...]`
   - `options` is `{ dryRun?, pkgPath?, model?, maxTokens? }`
   
   Implementation:
   - **API key check first**: If `process.env.ANTHROPIC_API_KEY` is not set, return `{ skipped: true, reason: 'no API key' }` immediately. Do NOT import/instantiate the SDK if no key.
   - **Resolve package path**: Call `resolvePackagePath(options.pkgPath)` from `scripts/lib/extract-local.mjs` to get the gsd-pi install root.
   - **Read source files**: For each path in `sourceFiles`, read `path.join(pkgRoot, dep)`. If a file is missing, log a warning (`console.warn(\`⚠ Source file not found: ${dep}\`)`) and skip it. Collect all readable files into an array of `{ path, content }`.
   - **Read current page**: Read `path.join('src', 'content', 'docs', pagePath)`. If the file doesn't exist (new page), set currentPage to empty string.
   - **Read exemplar page**: Read `src/content/docs/commands/capture.mdx` as the quality reference. This is hardcoded — capture.mdx is the canonical exemplar.
   - **Construct system prompt**: Build a system prompt string that includes:
     - Role: "You are a documentation writer for the gsd-pi CLI tool."
     - Quality rules for command pages: exact section order (What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands), frontmatter format (`title: "/gsd <command>"`, `description: "one-line"`), Mermaid styling rules (decision nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`, action nodes: `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`, `flowchart TD` orientation), link format (`../slug/` relative), table format for files.
     - The full text of capture.mdx as exemplar wrapped in `<exemplar>` tags.
     - Instruction: "Output ONLY the complete MDX file content. No markdown code fences. No explanation before or after."
   - **Construct user message**: Include each source file wrapped as `<source path="...">content</source>`, followed by the current page content (if any) wrapped as `<current_page>content</current_page>`, followed by the regeneration instruction: "Regenerate the documentation page for `{pagePath}`. Use the source code above to ensure accuracy. Match the quality, structure, and style of the exemplar page."
   - **Call Claude API**: 
     ```js
     import Anthropic from '@anthropic-ai/sdk';
     const client = new Anthropic();
     const startTime = Date.now();
     const message = await client.messages.create({
       model: options.model || 'claude-sonnet-4-5-20250929',
       max_tokens: options.maxTokens || 16384,
       system: systemPrompt,
       messages: [{ role: 'user', content: userMessage }],
     });
     ```
   - **Extract response**: Get text from `message.content[0].text`. Check `message.stop_reason` — if `'max_tokens'`, log a warning.
   - **Validate frontmatter**: Check that the response starts with `---\n` and contains a second `---\n`. If not, log error and return `{ error: 'invalid frontmatter' }` without writing.
   - **Write output**: If not `dryRun`, write the text content to `path.join('src', 'content', 'docs', pagePath)`.
   - **Return result**: `{ pagePath, inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens, model: message.model, elapsedMs: Date.now() - startTime, stopReason: message.stop_reason }`

3. **Build `regenerateStalePages()` batch wrapper.** Exports `regenerateStalePages(options)` which:
   - Reads `content/generated/stale-pages.json` — extracts `stalePages` array
   - Reads `content/generated/page-source-map.json` — the full map
   - If `stalePages` is empty, returns `{ skipped: true, reason: 'no stale pages', results: [] }`
   - Iterates `stalePages` sequentially (not parallel — avoid rate limits)
   - For each page, looks up `sourceFiles` from the page-source-map, calls `regeneratePage(page, sourceFiles, options)`
   - Collects results into an array. On error, logs and continues (partial failure allowed)
   - Returns `{ results: [...], totalInputTokens, totalOutputTokens, totalElapsedMs, successCount, failCount, skipCount }`

4. **Add CLI entry point.** At the bottom of the module, detect direct execution via `process.argv[1]` comparison with `import.meta.url` (follow the pattern from `scripts/lib/diff-sources.mjs` and `scripts/lib/build-page-map.mjs`):
   - With argument: `node scripts/lib/regenerate-page.mjs commands/capture.mdx` — regenerates single page. Looks up source files from page-source-map.json.
   - Without argument: `node scripts/lib/regenerate-page.mjs` — runs `regenerateStalePages()` for all stale pages.
   - Print per-page results with token counts and cost estimate (input: $3/MTok, output: $15/MTok for Sonnet).
   - Exit 0 on success or skip, exit 1 on total failure.

5. **Write unit tests in `tests/regenerate-page.test.mjs`.** Use `node:test` + `node:assert/strict` following established patterns from `tests/diff-sources.test.mjs`. Mock the Anthropic SDK by passing a mock client through options or by mocking the module. Test cases:
   - **No API key returns skip**: Set `ANTHROPIC_API_KEY` to empty, call `regeneratePage()`, assert result is `{ skipped: true, reason: 'no API key' }`.
   - **Prompt includes source files and current page**: Provide a mock client that captures the messages argument. Assert system prompt contains exemplar content and quality rules. Assert user message contains source file contents wrapped in `<source>` tags and current page in `<current_page>` tags.
   - **Token usage extracted from response**: Mock client returns a response with `usage: { input_tokens: 1000, output_tokens: 500 }`. Assert result includes these values.
   - **Missing source file logs warning and continues**: Provide a source file path that doesn't exist. Assert the function completes without error and the warning was logged.
   - **Invalid frontmatter not written**: Mock client returns content without `---` frontmatter. Assert the output file is NOT written (or not changed).
   - **max_tokens stop reason triggers warning**: Mock client returns `stop_reason: 'max_tokens'`. Assert a warning is logged.
   - **Batch reads stale-pages.json and iterates**: Test `regenerateStalePages()` with mock files and mock client. Assert it calls `regeneratePage()` for each stale page.
   - **Batch with empty stalePages skips**: Write a stale-pages.json with empty stalePages array. Assert returns `{ skipped: true }`.

   **Important mocking strategy**: To avoid importing the real SDK in tests, the `regeneratePage` function should accept an optional `client` in `options`. If provided, use it instead of instantiating `new Anthropic()`. Tests pass a mock client object with a `messages.create()` method that returns controlled responses. This avoids needing to mock the entire `@anthropic-ai/sdk` module.

## Must-Haves

- [ ] `@anthropic-ai/sdk` installed as devDependency
- [ ] `regeneratePage(pagePath, sourceFiles, options)` exported and functional
- [ ] `regenerateStalePages(options)` exported and functional
- [ ] System prompt includes section structure rules, Mermaid styling, link format, frontmatter format, and capture.mdx exemplar
- [ ] Graceful no-API-key handling returns `{ skipped: true }` without error
- [ ] Token usage extracted from API response and returned
- [ ] Frontmatter validation prevents writing malformed output
- [ ] CLI entry point supports both single-page and batch modes
- [ ] All unit tests pass with mocked SDK

## Verification

- `node --test tests/regenerate-page.test.mjs` — all tests pass
- `node -e "import('./scripts/lib/regenerate-page.mjs').then(m => console.log(Object.keys(m)))"` — exports `[ 'regeneratePage', 'regenerateStalePages' ]`
- `ANTHROPIC_API_KEY= node scripts/lib/regenerate-page.mjs commands/capture.mdx` — prints skip message, exits 0
- `npm run build` — still builds (no regressions from new devDependency)

## Inputs

- `scripts/lib/extract-local.mjs` — provides `resolvePackagePath()` for finding gsd-pi install location
- `content/generated/page-source-map.json` — maps page keys to source file arrays (e.g. `"commands/capture.mdx": ["src/resources/extensions/gsd/captures.ts", ...]`)
- `content/generated/stale-pages.json` — boundary contract with `stalePages[]` array and `reasons{}` object
- `src/content/docs/commands/capture.mdx` — 126-line exemplar page embedded in system prompt as quality reference
- `tests/diff-sources.test.mjs` — reference for test patterns (node:test + node:assert/strict, describe/it blocks)
- `scripts/lib/diff-sources.mjs` or `scripts/lib/build-page-map.mjs` — reference for CLI entry point pattern (process.argv[1] vs import.meta.url)

## Expected Output

- `scripts/lib/regenerate-page.mjs` — complete ESM module with `regeneratePage()`, `regenerateStalePages()`, and CLI entry point
- `tests/regenerate-page.test.mjs` — 8+ test cases covering all code paths with mocked SDK
- `package.json` — updated with `@anthropic-ai/sdk` in devDependencies
