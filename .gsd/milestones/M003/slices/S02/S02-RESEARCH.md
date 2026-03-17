# S02: LLM Page Regeneration — Research

**Date:** 2026-03-17

## Summary

S02 builds the core regeneration capability: a module that takes a stale page path and its source file dependencies, reads the current source code from the installed gsd-pi package, sends it alongside the existing page content and a quality-focused system prompt to the Claude API, and writes the updated MDX back to disk.

The technical implementation is straightforward — the Anthropic Node SDK (`@anthropic-ai/sdk`) provides a simple `messages.create()` API. The real challenge is **prompt engineering**: producing output that matches M02 quality (section structure, Mermaid diagrams with terminal-native styling, annotated examples, files-touched tables, related command links). The source files range from ~31K tokens (light commands) to ~92K tokens (auto), well within Claude's 200K context window but significant for cost. A typical 5-10 page regeneration costs ~$1-2; worst-case all-42-pages costs ~$7.50.

The module must also handle: graceful degradation without ANTHROPIC_API_KEY, token/cost reporting per page, and reading source files from the globally-installed gsd-pi package path. The `resolvePackagePath()` function in `scripts/lib/extract-local.mjs` already solves package resolution and should be reused.

## Recommendation

Build a single ESM module `scripts/lib/regenerate-page.mjs` that exports `regeneratePage(pagePath, sourceFiles, options)` and a batch entry `regenerateStalePages(stalePages, pageSourceMap, options)`. Use `@anthropic-ai/sdk` with `claude-sonnet-4-5-20250929` model (best quality-cost tradeoff for documentation writing). Include a system prompt that embeds one complete exemplar page (capture.mdx — 126 lines, medium complexity) as the quality reference, plus explicit structural rules for section headings, Mermaid styling, link format, and table format.

Prove quality first by regenerating 3 diverse command pages (capture, doctor, auto) and comparing output against M02 originals — this retires the highest risk (R038/R039) before integrating into the pipeline. Report token usage and cost per page for the S04 cost reporting requirement.

## Implementation Landscape

### Key Files

- `scripts/lib/regenerate-page.mjs` — **New.** Core module. Exports `regeneratePage(pagePath, sourceFiles, options)` which reads source files from gsd-pi, reads current page content, calls Claude API, writes updated MDX. Also exports `regenerateStalePages(stalePages, pageSourceMap, options)` for batch operation. CLI entry point for testing.
- `scripts/lib/extract-local.mjs` — **Existing.** `resolvePackagePath(overridePath?)` resolves gsd-pi install location. Reuse, don't duplicate.
- `content/generated/stale-pages.json` — **Existing.** S01 boundary contract. S02 reads `stalePages` array and `reasons` object to know what to regenerate and why.
- `content/generated/page-source-map.json` — **Existing.** Maps page keys (e.g. `commands/capture.mdx`) to arrays of repo-relative source paths (e.g. `src/resources/extensions/gsd/captures.ts`).
- `src/content/docs/commands/*.mdx` — **Existing.** The 27 command deep-dive pages to regenerate. Written directly (not via prebuild pipeline — these are NOT in `.generated-manifest.json`).
- `src/content/docs/recipes/*.mdx` — **Existing.** 6 recipe pages. Same regeneration target.
- `src/content/docs/user-guide/developing-with-gsd.mdx` — **Existing.** Walkthrough page.
- `tests/regenerate-page.test.mjs` — **New.** Unit tests mocking the Anthropic SDK to verify prompt construction, error handling, file I/O, and graceful no-key degradation.

### Build Order

1. **Install `@anthropic-ai/sdk` as a devDependency** — the SDK is not yet installed. It's only needed during the update pipeline, not at build/serve time.

2. **Build `regeneratePage()` with prompt template** — This is the core function and highest risk. Must prove the prompt produces M02-quality output before anything else. The function:
   - Resolves gsd-pi package path via `resolvePackagePath()` from extract-local.mjs
   - Reads each source file from the installed package using the repo-relative paths from page-source-map.json (prepending the resolved package root)
   - Reads the current page content from `src/content/docs/{pagePath}`
   - Constructs a message with: system prompt (quality rules + exemplar page), user message (source files + current page + regeneration instruction)
   - Calls `anthropic.messages.create()` with model, max_tokens, system, messages
   - Extracts the text response and writes it to the page path
   - Returns `{ pagePath, inputTokens, outputTokens, model, elapsedMs }`

3. **Build `regenerateStalePages()` batch wrapper** — Reads stale-pages.json and page-source-map.json, iterates stalePages, calls `regeneratePage()` for each, accumulates cost/token stats, handles partial failures (continue on error, report at end).

4. **Quality verification** — Regenerate 3 pages (capture, doctor, auto) and compare against originals. This retires R038 and R039.

5. **Unit tests** — Mock the SDK to test prompt construction, error paths, no-API-key graceful skip, token reporting. Use `node:test` + `node:assert/strict` following established patterns in `tests/diff-sources.test.mjs`.

### Prompt Design (Critical)

The system prompt must encode these rules extracted from analysis of all 27 M02 command pages:

**Section structure** (all command pages follow this exactly):
1. `## What It Does` — 2-3 paragraphs explaining purpose and when to use
2. `## Usage` — code block with usage variants + flags table if applicable
3. `## How It Works` — detailed mechanics with subsections, Mermaid diagrams where behavior has flow/branching
4. `## What Files It Touches` — tables for Creates/Reads/Writes with File + Purpose columns
5. `## Examples` — annotated terminal output blocks
6. `## Related Commands` — bullet list with links using `../slug/` format

**Mermaid terminal-native styling** (extracted from existing pages):
- Decision nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- Action nodes: `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`
- Start/end nodes: same as decision nodes, use `([text])` for rounded
- All diagrams use `flowchart TD` orientation

**Link format**: All internal links use relative `../slug/` format per Starlight convention.

**Frontmatter**: `title: "/gsd <command>"` and `description: "One-line summary"`

**Recipe pages** follow a different structure: When to Use This → Prerequisites → Steps → What Gets Created → Flow Diagram → related info.

**The exemplar approach**: Include the full text of `commands/capture.mdx` (126 lines) in the system prompt as the quality reference. This is the most token-efficient way to show the exact style, formatting, and depth expected. At ~500 tokens for the exemplar, it's cheap insurance.

### Source File Reading Strategy

Source file paths in page-source-map.json are repo-relative (e.g. `src/resources/extensions/gsd/captures.ts`). To read them:
1. Call `resolvePackagePath()` → e.g. `/Users/.../.nvm/.../gsd-pi`
2. For each source dep, read `path.join(pkgRoot, dep)`
3. If a file is missing (removed between versions), log a warning and skip it

**Optimization opportunity**: `commands.ts` (73K chars, ~18K tokens) is shared by 32 of 42 pages. For command pages, rather than sending the full file, the prompt could instruct the LLM to focus on the specific command's handler. However, this adds fragile extraction logic. For S02, send full files and measure cost. Optimization can be revisited in S04 if costs are problematic.

### API Key Handling

When `ANTHROPIC_API_KEY` is not set:
- `regeneratePage()` returns early with `{ skipped: true, reason: 'no API key' }`
- `regenerateStalePages()` logs a clear message: "ANTHROPIC_API_KEY not set — skipping page regeneration. Build will use existing content."
- No error, no exit code — downstream build proceeds with stale content

This satisfies the milestone success criterion: "When ANTHROPIC_API_KEY is not set, the pipeline reports it clearly, skips regeneration, and builds with existing content."

### Verification Approach

1. **Unit tests** (`node --test tests/regenerate-page.test.mjs`):
   - Prompt construction includes system prompt + source files + current page content
   - Missing API key returns `{ skipped: true }` without error
   - Missing source file logs warning and proceeds with remaining files
   - Token usage is extracted from API response and returned
   - Batch function reads stale-pages.json and iterates correctly

2. **Quality verification** (manual/semi-automated):
   - `node scripts/lib/regenerate-page.mjs commands/capture.mdx` — regenerate single page via CLI
   - Compare output against original using `diff` — verify section structure, Mermaid styling, link format
   - `npm run build && node scripts/check-links.mjs` — verify regenerated pages build and all links work
   - Run for 3 pages: capture (light), doctor (mid), auto (heavy) — covering the dep size spectrum

3. **Cost verification**:
   - Each `regeneratePage()` call returns `{ inputTokens, outputTokens }` from the API response
   - CLI prints per-page and total cost summary

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Claude API client | `@anthropic-ai/sdk` (npm) | Official SDK with types, streaming, retry, error handling built in. Latest version 0.79.0. |
| gsd-pi package path resolution | `resolvePackagePath()` in `scripts/lib/extract-local.mjs` | Already handles `npm root -g` detection, override path, validation. Don't duplicate. |
| Stale page detection | `stale-pages.json` from S01 | Boundary contract already provides `stalePages[]` and `reasons{}`. Just read the file. |

## Constraints

- **Source files are read from the globally installed gsd-pi package** (`npm root -g` + `/gsd-pi`), not from node_modules. This is an existing pattern from extract-local.mjs. Source paths in page-source-map.json are repo-relative (e.g. `src/resources/extensions/gsd/auto.ts`), which map directly to paths within the gsd-pi package directory.
- **Page output files are `.mdx` in `src/content/docs/`** — these are NOT managed by the prebuild pipeline (not in `.generated-manifest.json`). Direct writes are correct.
- **Claude API context window**: 200K tokens. The heaviest page (auto.mdx with 11 deps) needs ~92K tokens of source + ~2K system prompt + ~2K current page = ~96K tokens. Fits comfortably.
- **Model choice**: Must use a model good at following formatting instructions (Mermaid syntax, MDX frontmatter, exact section structure). Sonnet 4.5 is the recommended choice for writing quality.
- **`@anthropic-ai/sdk` should be a devDependency** — it's only used during `npm run update`, never at build/serve time. This keeps the production install lean.

## Common Pitfalls

- **Sending full `commands.ts` (73K chars) to every command page** — This is the biggest shared dep at ~18K tokens, included in 32/42 pages. It's a large file that contains all command handlers. For S02, accept the cost to keep the implementation simple. If cost becomes an issue, S04 can add excerpt logic to extract only the relevant command handler section.
- **MDX frontmatter corruption** — If the LLM outputs malformed YAML frontmatter (missing dashes, wrong indentation), the entire Astro build breaks. The prompt must be explicit about frontmatter format, and the module should validate the output starts with `---\n` and contains a second `---\n` before writing.
- **Mermaid syntax errors** — Invalid Mermaid blocks break the page silently (render as blank). The prompt should include the exact Mermaid color scheme from existing pages. Consider a post-generation validation step that checks Mermaid blocks parse.
- **Relative link format** — Starlight requires `../slug/` format for internal links. The prompt must specify this, and regenerated pages should be checked against the build + link checker.
- **API response extraction** — The SDK returns `message.content` as an array of content blocks. For text generation, extract `message.content[0].text`. The response also has `message.usage.input_tokens` and `message.usage.output_tokens` for cost reporting.

## Open Risks

- **LLM output quality vs Claude Code** — M02 pages were generated by Claude Code with full tool access (reading multiple files, cross-referencing, making editorial choices). API calls with source files in context may produce inferior output. This is the highest risk in the milestone and the primary thing S02 must prove or disprove. The mitigation is the exemplar-in-prompt approach and quality comparison against originals.
- **Non-command page regeneration quality** — Recipe pages and the walkthrough have cross-cutting dependencies and narrative structure that's harder to regenerate from source files alone. The prompt needs page-type-specific instructions. S02 should prove command page quality first; recipe/walkthrough regeneration may need a different prompt template or may be better left as manual-update-when-needed.
- **Output token limits** — The longest command page (doctor.mdx) is 250 lines. With `max_tokens: 8192`, this should fit comfortably (~4K tokens for 250 lines). But if the LLM tries to be more verbose than the original, it may hit the limit and produce truncated output. Set max_tokens to 16384 as safety margin and check for `stop_reason: 'max_tokens'` in the response.

## Sources

- Anthropic SDK TypeScript — `messages.create()` API with `system`, `messages`, `model`, `max_tokens` params. Response includes `usage.input_tokens` and `usage.output_tokens`. ([Context7 docs](https://github.com/anthropics/anthropic-sdk-typescript))
- Existing page structure analysis — all 27 command pages follow identical section order: What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands. 20/27 include Mermaid diagrams. All use the same color scheme.
