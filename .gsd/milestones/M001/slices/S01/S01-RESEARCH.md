# S01: Content Extraction Pipeline — Research

**Date:** 2026-03-17
**Depth:** Deep research — novel data pipeline, multiple content source formats, API integration, no prior patterns in codebase

## Summary

The content extraction pipeline must pull structured data from three distinct sources: the installed `gsd-pi` npm package (agents, extensions, skills, prompts, templates), the GitHub repo's `docs/` directory (132 narrative markdown files across 6 subdirectories), and GitHub releases (48 releases with structured Added/Fixed/Changed bodies). The output is a set of JSON data files and processed markdown that downstream slices (S03–S05) consume to build pages.

The npm package source (`dist/resources/`) contains 422 files across agents (5 `.md` files with YAML frontmatter), extensions (17 directories + 2 standalone `.ts` files), skills (7 SKILL.md files with YAML frontmatter + references), prompts (29 `.md` files), and templates (18 `.md` files). The key extraction challenge varies by type: agent files have clean frontmatter (name, description, tools); skill files have clean frontmatter (name, description) plus structured `<objective>`/`<arguments>`/`<detection>` XML-like sections; extension files are TypeScript with `registerTool()` calls containing `name`, `description`, `promptSnippet`, and `promptGuidelines` — these need AST-level or regex parsing.

The GitHub docs can be fetched efficiently as a tarball (single API call, ~200KB compressed) rather than per-file (which would burn 132+ API calls). Releases fit in a single `?per_page=100` call. This keeps total API calls to ~3 per build, well within rate limits even without a token.

**Primary recommendation:** Build a modular Node.js extraction script (`scripts/extract.mjs`) with separate extractor functions per content type, all writing to `data/` as JSON files. Use the tarball API for GitHub docs, regex-based extraction for TypeScript extension metadata, and YAML frontmatter parsing for agents/skills. Generate a content manifest with SHA-256 hashes for incremental rebuild support.

## Recommendation

Build `scripts/extract.mjs` as a single entry point that orchestrates 6 extraction modules:

1. **`extractors/commands.mjs`** — Parse `docs/commands.md` from GitHub (structured markdown tables → JSON). Also extract CLI flags from `help-text.js` in the npm package.
2. **`extractors/skills.mjs`** — Read `~/.gsd/agent/skills/*/SKILL.md` files. Parse YAML frontmatter for name/description, then extract structured sections (`<objective>`, `<arguments>`, etc.) for capabilities.
3. **`extractors/extensions.mjs`** — Read `~/.gsd/agent/extensions/*/index.ts` (and standalone `.ts` files). Regex-extract `registerTool()` calls for tool name, description, promptSnippet. Group tools by extension directory.
4. **`extractors/agents.mjs`** — Read `~/.gsd/agent/agents/*.md`. Parse YAML frontmatter (name, description, tools) and extract behavioral description from body.
5. **`extractors/docs.mjs`** — Download GitHub repo tarball, extract `docs/` files, process internal links (rewrite `./docs/X.md` → site paths), write to `data/docs/`.
6. **`extractors/releases.mjs`** — Fetch all releases via GitHub API, parse Added/Fixed/Changed sections from release bodies, output as structured JSON.

All output lands in `data/` with a `manifest.json` tracking file hashes for diff detection.

Use the npm package path (`~/.nvm/.../node_modules/gsd-pi/`) as the primary source for agents, extensions, and skills — it's the canonical behavioral truth. Use `~/.gsd/agent/` as a fallback (it's a synced copy). Use `managed-resources.json` (`{"gsdVersion":"2.22.0","syncedAt":...}`) for version detection.

## Implementation Landscape

### Key Files

**Sources to read:**
- `~/.gsd/agent/agents/*.md` — 5 agent definitions. YAML frontmatter with `name`, `description`, `tools`. Body is behavioral prompt text.
- `~/.gsd/agent/skills/*/SKILL.md` — 7 skill definitions. YAML frontmatter with `name`, `description`. Body has XML-like `<objective>`, `<arguments>`, `<detection>` sections (parseable with regex).
- `~/.gsd/agent/extensions/*/index.ts` — 17+ extension entry points. `pi.registerTool({name, description, promptSnippet, promptGuidelines})` calls define tools. Some extensions register multiple tools (e.g., context7 registers 2, bg-shell registers 1 with many actions).
- `~/.gsd/agent/extensions/*.ts` — 2 standalone extensions (`ask-user-questions.ts`, `get-secrets-from-user.ts`).
- `~/.gsd/agent/managed-resources.json` — Version tracking: `{"gsdVersion":"2.22.0","syncedAt":1773701466469}`.
- GitHub `docs/` — 20 top-level files + 6 subdirectories (building-coding-agents: 27, context-and-hooks: 8, extending-pi: 26, pi-ui-tui: 24, proposals: 1, what-is-pi: 20) = ~126 files.
- GitHub releases API — 48 releases. Bodies are structured markdown: `## Added`, `## Fixed`, `## Changed` sections with bullet points.
- `gsd-pi/dist/help-text.js` — CLI flags and subcommand help text. Parseable JavaScript string arrays.
- `gsd-pi/dist/resources/extensions/gsd/prompts/*.md` — 29 prompt files. LLM-instruction format — useful for documenting GSD's workflow phases (research, plan, execute, complete).
- `gsd-pi/dist/resources/extensions/gsd/templates/*.md` — 18 template files. Markdown templates with `{{placeholders}}` — useful for documenting GSD's artifact format.
- `gsd-pi/dist/resources/extensions/gsd/docs/*.md` — 2 additional doc files (claude-marketplace-import.md, preferences-reference.md).

**Files to create:**
- `scripts/extract.mjs` — Main orchestrator, runs all extractors, writes manifest
- `scripts/extractors/commands.mjs` — Commands from docs/commands.md + help-text.js
- `scripts/extractors/skills.mjs` — Skills from SKILL.md files
- `scripts/extractors/extensions.mjs` — Extensions/tools from index.ts registerTool calls
- `scripts/extractors/agents.mjs` — Agents from .md files
- `scripts/extractors/docs.mjs` — Narrative docs from GitHub tarball
- `scripts/extractors/releases.mjs` — Releases from GitHub API
- `data/commands.json` — Structured command data
- `data/skills.json` — Structured skill data
- `data/extensions.json` — Structured extension/tool data
- `data/agents.json` — Structured agent data
- `data/releases.json` — Structured release data
- `data/docs/` — Processed markdown files from GitHub
- `data/manifest.json` — Content hashes for incremental rebuild

### Build Order

**Task 1: Astro/Starlight scaffold (T01)** — Must exist first so `data/` has a project root. Minimal scaffold: `package.json`, Astro config, one placeholder page. This is foundational — nothing else runs without a project.

**Task 2: Extraction script (T02)** — The core pipeline. Build extractors in this order:
1. **Agents** first (simplest: YAML frontmatter parse, 5 files) — proves the extraction pattern works
2. **Skills** second (frontmatter + XML section parse, 7 files) — slightly harder, validates section extraction
3. **Extensions** third (TypeScript regex extraction, ~19 files) — hardest local extraction, proves registerTool parsing
4. **Commands** fourth (markdown table parse + help-text.js) — combines GitHub + local sources
5. **Releases** fifth (GitHub API + markdown section parse) — proves API integration
6. **Docs** sixth (GitHub tarball download + link rewriting) — most content, most API-dependent

Each extractor is independently testable. The manifest generator runs last, hashing all output files.

**Task 3: Commands quick-reference page (T03)** — First consumer of extracted data. Proves the data format works for Astro page generation. Uses `data/commands.json` to render cheat-sheet cards.

### Verification Approach

1. **Extraction completeness:** `node scripts/extract.mjs` runs without errors. Check file counts:
   - `data/agents.json` has 5 entries
   - `data/skills.json` has 7 entries
   - `data/extensions.json` has 17+ extension groups with tools
   - `data/commands.json` has entries for all command tables (session ~16, config ~11, git ~1, session-mgmt ~7, shortcuts ~4, CLI ~9)
   - `data/releases.json` has 48 entries
   - `data/docs/` has ~126 markdown files
   - `data/manifest.json` exists with SHA-256 hashes

2. **Data quality spot-checks:**
   - `jq '.[] | select(.name == "scout")' data/agents.json` returns description + tools
   - `jq '.[] | select(.name == "lint")' data/skills.json` returns description + objective
   - `jq '.[] | select(.name == "bg-shell") | .tools | length' data/extensions.json` returns ≥ 1
   - `jq '.[0].tag_name' data/releases.json` returns `"v2.22.0"`

3. **Incremental rebuild:** Run extract twice. Second run should detect no changes via manifest diff and skip re-extraction (or confirm hashes match).

4. **Commands page renders:** `npm run dev` shows the commands quick-reference page with cards populated from JSON data.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| YAML frontmatter parsing | `gray-matter` (npm) | Standard lib, handles edge cases (multiline values, nested YAML). ~200 weekly downloads. |
| Tarball download + extraction | `tar` (Node.js built-in `node:zlib` + `tar` npm package) | Don't write tar parsing. `tar` package handles streaming extraction with path filtering. |
| Content hashing | `node:crypto` (built-in) | SHA-256 via `crypto.createHash('sha256')`. No dependency needed. |
| Markdown table parsing | Regex or `marked` lexer | Tables in commands.md are simple pipe-delimited. Regex is sufficient; `marked` if we need AST. |
| GitHub API calls | `gh api` CLI (already authenticated) or `node-fetch` with `GITHUB_TOKEN` | `gh` CLI is simpler for scripting (avoids token management). For Node.js, use native `fetch()` (Node 18+). |

## Constraints

- **npm package location is environment-specific.** The path `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/` depends on the Node version manager and version. Must resolve dynamically: use `require.resolve('gsd-pi/package.json')` or `npm root -g` to find the package root.
- **`~/.gsd/agent/` is the synced copy, not the source of truth.** The npm package `dist/resources/` is canonical. Use `~/.gsd/agent/` only because it's reliably at a known path and mirrors the package contents (synced via `managed-resources.json`).
- **GitHub API without auth gets 60 req/hour.** With `GITHUB_TOKEN` it's 5,000/hour. The tarball approach (1 call) + releases (1 call) + a few contents calls stays well under 60. But if the script is run repeatedly during development, auth is recommended.
- **Extension TypeScript files are source code, not structured data.** The `registerTool()` pattern is consistent but not a stable API — it could change between versions. The regex extraction must be tolerant of whitespace variations and string concatenation patterns (description strings use `+` concatenation across lines).
- **Prompts/templates are LLM-instruction format.** These are NOT directly useful as human documentation. R018 requires "meaningful extraction of capabilities, behaviors, and usage patterns" — not raw dumps. For S01, we should extract metadata (file name, purpose inferred from name, any YAML frontmatter) but defer deep transformation to S04 where content curation happens.

## Common Pitfalls

- **Regex fragility for TypeScript extraction** — `registerTool({name: "...", description: "..." + "..."})` uses string concatenation. A simple regex that captures to the first `"` will break. Use a multi-pass approach: first find `registerTool(` blocks, then extract fields within each block. Handle both single-line and multi-line string concatenation.
- **GitHub tarball path prefix** — GitHub tarballs include a prefix directory (e.g., `gsd-build-gsd-2-abc1234/`). When extracting `docs/`, strip this prefix. The `tar` package supports `strip: 1` for this.
- **Link rewriting in docs** — GitHub docs use relative links like `./getting-started.md` and `../commands.md`. These must be rewritten to site-relative paths. Handle both `[text](./path.md)` and `[text](./path.md#anchor)` patterns.
- **Extension tool grouping** — Some extensions register multiple tools (context7 → resolve_library + get_library_docs). Some are standalone files (ask-user-questions.ts). The JSON output must group tools by extension, not flatten them.
- **Skill sub-skills** — The `github-workflows` skill contains a nested `references/gh/SKILL.md` sub-skill. The extraction must handle nested skill discovery (recursive search for SKILL.md files).

## Open Risks

- **`registerTool()` pattern may vary across extensions.** I checked context7, google-search, and ask-user-questions — all use the same pattern. But some extensions (browser-tools, gsd) are much larger and may register tools differently (e.g., via loops, dynamic registration). If regex fails for these, we may need to fall back to a simpler metadata extraction (just extension name + tool count from file size/grep).
- **Content transformation quality (R018)** — The prompts and templates are inherently LLM-focused. Extracting "capabilities and behaviors" from them is judgment-dependent. S01 should extract raw metadata and defer deep transformation to S04. This defers the hardest part of R018 but gives S04 structured input to work with.
- **Version drift** — If `gsd-pi` is updated between extractions, `managed-resources.json` may show a different version than what the docs/ content reflects. The manifest should record the source version for each content type.

## Sources

- Extension tool registration pattern confirmed by reading `context7/index.ts`, `google-search/index.ts`, `ask-user-questions.ts` — all use `pi.registerTool({name, description, promptSnippet, promptGuidelines, parameters})` from `@gsd/pi-coding-agent` API
- Agent file format confirmed: YAML frontmatter (`name`, `description`, `tools`) + markdown body
- Skill file format confirmed: YAML frontmatter (`name`, `description`) + XML-like body sections (`<objective>`, `<arguments>`, `<detection>`)
- GitHub tarball endpoint confirmed working: `gh api repos/gsd-build/gsd-2/tarball/main` returns 200 with `.tar.gz` content
- GitHub releases API confirmed: `?per_page=100` returns all 48 releases in one call. Body format: `## Added/Fixed/Changed` with bullet points.
- Release body structure confirmed: markdown with `## Added`, `## Fixed`, `## Changed` H2 headers followed by `- **feature name** — description` bullet points
- `managed-resources.json` confirmed: `{"gsdVersion":"2.22.0","syncedAt":1773701466469}` — provides version tracking
- Content counts verified: 5 agents, 7 skills (with nested sub-skills), 17 extension directories + 2 standalone, 29 prompts, 18 templates, ~126 GitHub docs, 48 releases
