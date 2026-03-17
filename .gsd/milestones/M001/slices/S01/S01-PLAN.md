# S01: Content extraction pipeline

**Goal:** A Node.js extraction script that pulls structured content from the installed `gsd-pi` npm package (skills, agents, extensions) and the `gsd-build/gsd-2` GitHub repo (docs, README, releases), producing JSON data files and markdown for downstream slices (S03 quick-reference cards, S04 deep-dive pages, S05 changelog).
**Demo:** Running `node scripts/extract.mjs` produces all output files in `content/generated/` — structured JSON for skills (8), agents (5), extensions (≥14), commands, and releases (≥48), plus ~126 markdown doc files and a content manifest with SHA hashes for diff tracking.

## Must-Haves

- Dynamically resolves the `gsd-pi` npm package path (not hardcoded) with `--pkg-path` override flag
- Extracts skills from YAML frontmatter of `SKILL.md` files, including nested references (e.g., `github-workflows/references/gh/`)
- Extracts agents from YAML frontmatter of agent `.md` files with human-facing descriptions
- Extracts extension metadata (name, tools, descriptions) via regex from TypeScript `pi.registerTool()` patterns, excluding `shared/`
- Downloads GitHub repo content via single tarball API call (not per-file fetches)
- Fetches all releases in one paginated API call, parses Added/Changed/Fixed sections
- Generates content manifest with SHA hashes for diff tracking
- Supports optional `GITHUB_TOKEN` env var for authenticated API calls
- Caches tarball locally to avoid redundant downloads during development
- All output written to `content/generated/` directory

## Proof Level

- This slice proves: integration (npm package reads + GitHub API calls + structured output)
- Real runtime required: yes (reads real filesystem, makes real API calls)
- Human/UAT required: no (automated count and structure assertions are sufficient)

## Verification

- `node scripts/extract.mjs` exits 0 and produces all expected files
- `node --test tests/extract.test.mjs` passes all assertions:
  - `content/generated/skills.json` has ≥8 entries, each with `name`, `description`, `path`
  - `content/generated/agents.json` has ≥5 entries, each with `name`, `description`
  - `content/generated/extensions.json` has ≥14 entries, each with `name`, `tools[]`, `description`
  - `content/generated/commands.json` has structured command data
  - `content/generated/releases.json` has ≥48 entries with `tag_name`, `body`, parsed sections
  - `content/generated/docs/` contains ≥100 markdown files
  - `content/generated/readme.md` exists and has content
  - `content/generated/manifest.json` has file entries with SHA hashes
- Second run with unchanged content skips tarball re-download (cache hit)
- `node scripts/extract.mjs --pkg-path /nonexistent` produces a structured error message including the invalid path and phase `[local]`, exits non-zero
- If `GITHUB_TOKEN` is invalid/expired, error output includes HTTP status code and `rate limit remaining` value

## Observability / Diagnostics

- Runtime signals: console output with phase labels (`[local]`, `[github-docs]`, `[releases]`) and counts for each extraction phase
- Inspection surfaces: `node scripts/extract.mjs --dry-run` to show what would be extracted without writing; direct inspection of JSON output files
- Failure visibility: extraction errors include the source file path and phase name; GitHub API errors include status code and rate limit remaining
- Redaction constraints: `GITHUB_TOKEN` must not be logged

## Integration Closure

- Upstream surfaces consumed: `gsd-pi` npm package filesystem (`src/resources/skills/`, `src/resources/agents/`, `src/resources/extensions/`), GitHub API (`/repos/gsd-build/gsd-2/tarball/main`, `/repos/gsd-build/gsd-2/releases`, `/repos/gsd-build/gsd-2/git/trees/main?recursive=1`)
- New wiring introduced in this slice: `scripts/extract.mjs` entrypoint, `content/generated/` output directory
- What remains before the milestone is truly usable end-to-end: S02 (site scaffold), S03 (cards consuming JSON), S04 (pages consuming docs), S05 (changelog consuming releases), S06 (pipeline wiring + deploy)

## Tasks

- [x] **T01: Scaffold project and extract local content from npm package** `est:1h`
  - Why: Establishes the project structure, test framework, and extraction of skills/agents/extensions from the installed npm package — the zero-risk, zero-API-call foundation that proves extraction patterns work.
  - Files: `package.json`, `scripts/lib/extract-local.mjs`, `tests/extract.test.mjs`, `content/generated/.gitkeep`
  - Do: Initialize Node.js project with `gray-matter` dep. Write `extract-local.mjs` that dynamically resolves the npm package path, reads SKILL.md files (with recursive reference handling), agent .md files, and extension .ts files. Parse YAML frontmatter with gray-matter for skills/agents. Regex-extract `pi.registerTool({ name:, description: })` patterns from extension TypeScript. Exclude `shared/` directory. Write `skills.json`, `agents.json`, `extensions.json`. Set up Node.js built-in test runner with structural assertions.
  - Verify: `node --test tests/extract.test.mjs` — skills ≥8, agents ≥5, extensions ≥14, all have required fields
  - Done when: Running the local extractor produces valid JSON files with correct counts and all required fields populated

- [ ] **T02: Extract GitHub docs via tarball and fetch releases** `est:1h`
  - Why: Pulls all narrative documentation and release history from the GitHub repo using minimal API calls (tarball + releases + tree), with caching to stay within rate limits.
  - Files: `scripts/lib/extract-github-docs.mjs`, `scripts/lib/extract-releases.mjs`, `scripts/lib/manifest.mjs`, `tests/extract.test.mjs`
  - Do: Write `extract-github-docs.mjs` that fetches the repo tarball (single API call), extracts `docs/**/*.md` and `README.md` to `content/generated/docs/` and `content/generated/readme.md`. Strip the variable-prefix root directory from the tarball. Add local caching (`.cache/tarball.tar.gz`) with HEAD SHA check to skip re-download. Write `extract-releases.mjs` that fetches all releases (`per_page=100`), parses markdown bodies into structured `{added, changed, fixed}` sections. Write `manifest.mjs` using the tree API (`/git/trees/main?recursive=1`) to get SHA hashes for all files, write `manifest.json`. Support `GITHUB_TOKEN` via env var for all API calls. Add tests for docs count, releases count, and manifest structure.
  - Verify: `node --test tests/extract.test.mjs` — docs ≥100 .md files, releases ≥48, manifest has entries with SHA hashes, README exists
  - Done when: All GitHub content is extracted to `content/generated/`, manifest tracks file hashes, and cached tarball is reused on second run

- [ ] **T03: Wire extraction orchestrator and extract commands** `est:45m`
  - Why: Creates the single entry point `extract.mjs` that runs all extraction phases, adds command extraction from downloaded docs, and proves the complete pipeline works end-to-end.
  - Files: `scripts/extract.mjs`, `scripts/lib/extract-commands.mjs`, `tests/extract.test.mjs`
  - Do: Write `extract.mjs` as the orchestrator that runs local extraction and GitHub extraction in parallel (using `Promise.all`), then runs command extraction (depends on docs being downloaded). Parse commands from `content/generated/docs/` command tables (consistent `| Command | Description |` markdown table format). Accept `--pkg-path` flag for npm package path override. Add `--dry-run` flag. Log phase progress with `[local]`, `[github-docs]`, `[releases]`, `[commands]` prefixes and counts. Add `"extract"` script to package.json. Run full end-to-end verification: all output files present, all counts correct, all structures valid.
  - Verify: `node scripts/extract.mjs && node --test tests/extract.test.mjs` — all assertions pass including commands.json structure
  - Done when: `npm run extract` produces the complete content/generated/ directory with all expected files, counts, and structures; second run demonstrates cache hit for tarball

## Files Likely Touched

- `package.json`
- `scripts/extract.mjs`
- `scripts/lib/extract-local.mjs`
- `scripts/lib/extract-github-docs.mjs`
- `scripts/lib/extract-releases.mjs`
- `scripts/lib/extract-commands.mjs`
- `scripts/lib/manifest.mjs`
- `tests/extract.test.mjs`
- `content/generated/.gitkeep`
- `.gitignore`
