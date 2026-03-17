# S01: Content Extraction Pipeline — Research

**Date:** 2026-03-17
**Depth:** Deep research — novel pipeline with multiple content sources, GitHub API rate limits, and content transformation challenges

## Summary

The content extraction pipeline must pull structured data from three distinct sources: (1) the installed `gsd-pi` npm package at `~/.nvm/.../node_modules/gsd-pi/` which contains skills (7 SKILL.md files with YAML frontmatter), agents (5 .md files with YAML frontmatter), and extensions (17 directories with TypeScript source); (2) the `gsd-build/gsd-2` GitHub repo which contains 126 markdown doc files across 7 subdirectories (473 KB total), plus a 579-line README; and (3) the GitHub Releases API which has 48 releases totaling 42 KB of changelog bodies.

The critical finding is that the GitHub API rate limit for unauthenticated requests is only 60/hour — far too low for per-file content fetching of 126 docs. However, the **tarball endpoint** (`/repos/{owner}/{repo}/tarball/{ref}`) downloads the entire repo in a single API call (2.3 MB compressed), and the **recursive tree endpoint** (`/git/trees/{sha}?recursive=1`) returns all file paths and SHAs in one call (991 blobs). The releases endpoint returns all 48 releases in a single paginated call (`per_page=100`). This means the entire GitHub content fetch can work within **3 API calls** (tree for manifest hashes, tarball for content, releases for changelog) — well within rate limits even without a token.

The recommended approach is a single Node.js extraction script (`scripts/extract.mjs`) that: reads local files directly from the npm package path for skills/agents/extensions, downloads the tarball for GitHub docs, fetches releases via the API, and writes structured JSON + markdown to `content/generated/`. A content manifest with SHA hashes from the tree API enables efficient diffing on subsequent runs.

## Recommendation

Build the extraction script as an ESM Node.js script (`scripts/extract.mjs`) with three extraction phases that run in parallel:

1. **Local extraction** — Read skills, agents, and extension metadata directly from the filesystem. Parse YAML frontmatter from skill/agent `.md` files. Extract extension tool names and descriptions from TypeScript source using regex (the `name:` and `description:` patterns in tool registrations are consistent). Extract commands from the README's tables.

2. **GitHub docs extraction** — Use the tarball endpoint to download all docs in one request. Extract to a temp directory, copy `docs/**/*.md` and `README.md` to `content/generated/docs/`. Use the tree API to get SHA hashes for the manifest.

3. **GitHub releases extraction** — Fetch all releases in one paginated call. Parse the markdown bodies (they use `## Added` / `## Changed` / `## Fixed` sections consistently). Write to `content/generated/releases.json`.

**Why this approach:** It minimizes API calls (3 total for GitHub), reads npm package content directly (zero API calls), produces clean JSON for S03's quick-reference cards and structured markdown for S04's deep-dive pages, and generates a manifest for S06's incremental rebuild.

## Implementation Landscape

### Key Files

- `scripts/extract.mjs` — Main extraction script. Entry point for the pipeline. Orchestrates all three extraction phases. Outputs to `content/generated/`.
- `scripts/lib/extract-local.mjs` — Extracts skills, agents, extensions from the installed npm package. Reads from `~/.nvm/.../node_modules/gsd-pi/` and `~/.gsd/agent/`.
- `scripts/lib/extract-github-docs.mjs` — Downloads tarball, extracts docs markdown. Uses tree API for SHA manifest.
- `scripts/lib/extract-releases.mjs` — Fetches all releases from GitHub API, parses changelog bodies.
- `scripts/lib/manifest.mjs` — Reads/writes `content/generated/manifest.json`. Compares current SHAs to previous for diffing.
- `content/generated/commands.json` — Structured command data (parsed from README tables + docs/commands.md)
- `content/generated/skills.json` — Structured skill data (name, description, from YAML frontmatter)
- `content/generated/extensions.json` — Structured extension data (name, tools, description)
- `content/generated/agents.json` — Structured agent data (name, description, model, tools)
- `content/generated/releases.json` — All releases with parsed Added/Changed/Fixed sections
- `content/generated/docs/**/*.md` — Raw markdown files from GitHub repo's docs/ directory
- `content/generated/readme.md` — Processed README content
- `content/generated/manifest.json` — SHA hashes for all extracted content, used for diff tracking

### Source Locations

The extraction script needs to resolve these paths:

| Content Type | Source Path | Format |
|---|---|---|
| Skills | `{npmPkgRoot}/src/resources/skills/*/SKILL.md` | YAML frontmatter + markdown body |
| Agents | `{npmPkgRoot}/src/resources/agents/*.md` | YAML frontmatter + markdown body |
| Extensions | `{npmPkgRoot}/src/resources/extensions/*/index.ts` | TypeScript with `name:`, `description:` patterns |
| Extension packages | `{npmPkgRoot}/src/resources/extensions/*/package.json` | JSON (when present) |
| Docs | GitHub tarball → `docs/**/*.md` | Raw markdown |
| README | GitHub tarball → `README.md` | Markdown with HTML badges, tables |
| Commands | GitHub tarball → `docs/commands.md` | Markdown tables |
| Releases | GitHub API `/repos/gsd-build/gsd-2/releases?per_page=100` | JSON with markdown body |

Where `{npmPkgRoot}` is resolved via: `path.dirname(require.resolve('gsd-pi/package.json'))` or by checking the known global install path. The script should also accept a `--pkg-path` flag for explicit override.

### Content Transformation Notes

**Skills** (7 files) — Clean extraction. YAML frontmatter has `name` and `description`. The markdown body contains structured sections (`<objective>`, `<arguments>`, `<detection>`) that can be parsed for richer data. Example from `lint/SKILL.md`: frontmatter gives the summary, body gives detection rules and command patterns.

**Agents** (5 files) — Clean extraction. YAML frontmatter has `name`, `description`, optional `model`, `memory`, `tools`. The body is agent instructions — useful for a "what this agent does" summary but not raw-dumpable. Extract the first paragraph after frontmatter as the human-facing description.

**Extensions** (17 directories) — Medium difficulty. No standard metadata file, but the TypeScript source has consistent patterns:
- Tool names: `name: "tool_name"` in tool registration objects
- Tool descriptions: `description:` strings adjacent to name
- Module-level JSDoc comments describe the extension's purpose
- `package.json` files (where present) have name and version

The extraction should use regex parsing of the TypeScript source — not full AST parsing. The patterns are consistent enough across all extensions.

**Commands** — Parsed from `docs/commands.md` which uses consistent markdown tables (`| Command | Description |`). Also cross-reference with README tables. The commands.md file has tables for Session Commands, Configuration & Diagnostics, Git Commands, Session Management, Keyboard Shortcuts, and CLI Flags.

**Releases** — The release bodies use consistent `## Added` / `## Changed` / `## Fixed` section headers with `- **feature name** — description` bullet patterns. Parse these into structured arrays.

**Docs** — Pass through as-is. These are already human-readable markdown. The only transformation needed is adding Astro-compatible frontmatter (title, description) derived from the first `# heading` and first paragraph.

### Build Order

1. **Scaffold `scripts/extract.mjs` with local extraction first** — This is zero-risk (no API calls, no rate limits) and proves the extraction patterns for skills/agents/extensions. It produces `skills.json`, `agents.json`, `extensions.json`, and `commands.json`. This unblocks S03's quick-reference cards.

2. **Add GitHub docs extraction via tarball** — One API call, downloads all 126 docs. Extracts to `content/generated/docs/`. Add the tree API call for SHA manifest. This unblocks S04's deep-dive pages.

3. **Add releases extraction** — One API call, all 48 releases. Produces `releases.json`. This unblocks S05's changelog page.

4. **Add manifest diffing** — Compare current SHAs to previous `manifest.json`. Report which files changed. This enables S06's incremental rebuild.

### Verification Approach

```bash
# Run the extraction script
node scripts/extract.mjs

# Verify all output files exist
ls content/generated/skills.json
ls content/generated/agents.json
ls content/generated/extensions.json
ls content/generated/commands.json
ls content/generated/releases.json
ls content/generated/manifest.json
ls content/generated/docs/getting-started.md

# Verify skill count matches source (7 skills)
node -e "const d=JSON.parse(require('fs').readFileSync('content/generated/skills.json','utf8')); console.log(d.length, 'skills'); console.assert(d.length >= 7)"

# Verify agent count (5 agents)
node -e "const d=JSON.parse(require('fs').readFileSync('content/generated/agents.json','utf8')); console.log(d.length, 'agents'); console.assert(d.length >= 5)"

# Verify extension count (17 extensions, minus 'shared')
node -e "const d=JSON.parse(require('fs').readFileSync('content/generated/extensions.json','utf8')); console.log(d.length, 'extensions'); console.assert(d.length >= 14)"

# Verify docs count (126 markdown files)
find content/generated/docs -name "*.md" | wc -l

# Verify releases count (48)
node -e "const d=JSON.parse(require('fs').readFileSync('content/generated/releases.json','utf8')); console.log(d.length, 'releases'); console.assert(d.length >= 48)"

# Verify manifest has hashes
node -e "const d=JSON.parse(require('fs').readFileSync('content/generated/manifest.json','utf8')); console.log(Object.keys(d.files || d).length, 'entries in manifest')"

# Verify a skill has required fields
node -e "const d=JSON.parse(require('fs').readFileSync('content/generated/skills.json','utf8')); const s=d[0]; console.assert(s.name && s.description, 'Missing fields')"
```

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| YAML frontmatter parsing | `gray-matter` npm package | Standard frontmatter parser, handles edge cases (multiline descriptions, quoted strings). Used universally in the SSG ecosystem. |
| Tarball extraction | Node.js built-in `zlib` + `tar` npm package (`tar.extract()`) | `tar` is a well-tested npm package by isaacs. Avoid writing custom tar parsing. |
| GitHub API pagination | `@octokit/rest` or manual `Link` header parsing | For this project, manual fetch is fine — we only need 2-3 calls. Skip Octokit to avoid heavy deps. Use native `fetch()`. |
| Markdown heading extraction | Simple regex `^# (.+)$` | Docs use standard markdown. No need for a full parser just to extract the title. |
| Content hashing | Node.js built-in `crypto.createHash('sha256')` | Built into Node, no dependency needed. |

## Constraints

- **Node.js >= 20.6.0** — Required by the gsd-pi package. The extraction script can use ESM, top-level await, and native `fetch()`.
- **No `docs/` directory in the npm package** — The npm package only ships `dist/`, `packages/`, `pkg/`, and `src/resources/`. All narrative docs must come from GitHub.
- **GitHub rate limit: 60 requests/hour unauthenticated** — The tarball + tree + releases approach uses only 3 calls. With a `GITHUB_TOKEN`, this goes to 5,000/hour. Script should support optional token via env var.
- **Extension metadata is in TypeScript source, not a metadata file** — There's no `manifest.json` or `package.json` for most extensions. Tool names and descriptions must be regex-extracted from `.ts` files.
- **The `shared/` extension directory is a utility library, not an extension** — Should be excluded from the extensions list.
- **`gsd` extension directory has 221 .ts files** — It's the core GSD extension, not a simple tool. Extract the slash commands it registers, not the internal implementation.
- **Skills may include nested references** — e.g., `github-workflows/references/gh/SKILL.md` is a sub-skill. The extraction should handle the recursive structure.

## Common Pitfalls

- **Hardcoding the npm package path** — The path `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/` is machine-specific. Resolve it dynamically via `npm root -g` + `/gsd-pi` or `require.resolve('gsd-pi/package.json')`. The script should accept `--pkg-path` as an override.
- **Tarball directory prefix varies** — The tarball root directory is `gsd-build-gsd-2-{shortsha}/`, and the SHA changes on every commit. Strip the first path component when extracting.
- **YAML frontmatter with multi-line quoted descriptions** — Some agent files use quoted YAML strings (e.g., `description: "Modern JavaScript specialist..."`). `gray-matter` handles this; manual regex parsing would break.
- **Extension tool descriptions span multiple lines** — The `description:` field in TypeScript tool registrations often uses template literals or string concatenation. Regex should capture the full value, not just the first line.
- **Rate limit exhaustion during development** — While iterating on the script, repeated runs could burn through the 60/hour limit. Cache the tarball locally and skip re-download if the HEAD SHA hasn't changed.

## Open Risks

- **Extension tool extraction completeness** — Regex-based extraction from TypeScript may miss tools that are registered dynamically or use unusual patterns (e.g., `browser-tools` registers tools from separate sub-modules). May need manual annotation for complex extensions.
- **Content transformation quality for prompt-heavy files** — `GSD-WORKFLOW.md` (663 lines) and extension system prompts are written for LLMs. Deciding what to surface in human docs vs. what to skip is a curation call that may need iteration after S03/S04 consumption.
- **GitHub API authentication for CI** — The 60/hour unauthenticated limit is fine for local development with caching, but the S06 deployment pipeline will need a `GITHUB_TOKEN` for reliable CI builds.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Astro/Starlight | `astrolicious/agent-skills@astro` (2.2K installs) | available — relevant for S02, not needed for S01 |
| Node.js | `javascript-pro` agent | installed (bundled) |
| TypeScript | `typescript-pro` agent | installed (bundled) |

## Sources

- GitHub API rate limits: 60 requests/hour unauthenticated, 5,000/hour with token (source: [GitHub REST API docs](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting))
- Tarball download is a single redirect to a CDN-cached archive — 2.3 MB for the full repo (verified via `curl -sL` to `/tarball/main`)
- Tree API returns all 991 blobs with SHA hashes in a single non-truncated response (verified via `/git/trees/main?recursive=1`)
- All 48 releases fit in a single API response with `per_page=100` (verified; total body size 42 KB)
