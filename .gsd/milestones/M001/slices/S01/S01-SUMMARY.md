---
id: S01
parent: M001
milestone: M001
provides:
  - Node.js extraction pipeline producing 8 structured output artifacts from npm package + GitHub repo
  - skills.json (8 skills with YAML frontmatter, XML sections, nested reference handling)
  - agents.json (5 agents with descriptions and summaries)
  - extensions.json (17 extensions with full tool inventories — 47 browser tools, factory-pattern tools)
  - commands.json (42 commands across 7 categories parsed from markdown tables)
  - releases.json (48 releases with parsed Added/Changed/Fixed sections)
  - 126 markdown doc files across 6 subdirectories + readme.md
  - manifest.json (991 files with SHA hashes for diff tracking)
  - SHA-based tarball caching for rate-limit-safe incremental runs
requires: []
affects:
  - S03 (consumes commands.json, skills.json, extensions.json, agents.json for quick-reference cards)
  - S04 (consumes content/generated/docs/ markdown and readme.md for deep-dive pages)
  - S05 (consumes releases.json for changelog page)
  - S06 (consumes manifest.json for incremental rebuild diffing)
key_files:
  - scripts/extract.mjs — CLI orchestrator with --pkg-path, --dry-run, --no-cache, --help flags
  - scripts/lib/extract-local.mjs — npm package content extractor (skills, agents, extensions)
  - scripts/lib/extract-github-docs.mjs — tarball downloader + docs extractor with SHA-based caching
  - scripts/lib/extract-releases.mjs — releases fetcher with markdown body parser
  - scripts/lib/extract-commands.mjs — markdown table parser for commands/shortcuts/flags
  - scripts/lib/manifest.mjs — tree API manifest builder with diff tracking
  - tests/extract.test.mjs — 39 tests across 10 suites
  - package.json — Node.js project config with gray-matter and tar dependencies
key_decisions:
  - Dual regex pattern for extension tool extraction (pi.registerTool + ToolDefinition factory returns) to capture all registration styles
  - Single tarball download with SHA-based cache invalidation — 3 API calls per cached run vs 126+ per-file fetches
  - JSON output in content/generated/ directory (gitignored, always regenerated from source)
  - gray-matter for YAML frontmatter parsing, tar v7 ESM named imports
  - Parallel execution of independent phases (local + github-docs + releases), sequential for dependents (commands after docs, manifest last)
  - Include all 17 extensions in output even those with 0 tools (voice, ttsr, remote-questions, slash-commands)
patterns_established:
  - Phase-labeled console output ([local], [github-docs], [releases], [commands], [manifest], [orchestrator]) for extraction diagnostics
  - SHA-based cache invalidation pattern for GitHub API calls
  - gray-matter for YAML frontmatter parsing in .md files
  - Regex-based XML tag extraction for skill sections (<objective>, <arguments>, <detection>)
  - Markdown table parser with column-header detection (Command/Flag/Shortcut + Description/Action)
  - JSON output to content/generated/ with pretty-printed formatting
  - CLI arg parsing via manual switch/case (no external deps)
observability_surfaces:
  - "node scripts/extract.mjs" with phase-prefixed counts and elapsed time summary
  - "node scripts/extract.mjs --dry-run" shows plan without writing (API reachability, cache state)
  - ".cache/last-sha.txt" for inspecting cached HEAD SHA
  - "jq '.files | length' content/generated/manifest.json" for tracked file count
  - Rate limit remaining logged on every GitHub API response
  - Exit code 1 with "[orchestrator] Fatal error:" prefix on any phase failure
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T03-SUMMARY.md
duration: 52m
verification_result: passed
completed_at: 2026-03-17
---

# S01: Content extraction pipeline

**Node.js extraction pipeline that produces 1,238 structured content items from the installed gsd-pi npm package and GitHub repo in a single `npm run extract` command — 8 skills, 5 agents, 17 extensions, 42 commands, 48 releases, 126 docs, README, and a 991-file manifest with SHA hashes for diff tracking.**

## What Happened

Built a three-phase extraction pipeline orchestrated by `scripts/extract.mjs`:

**Phase 1 — Parallel extraction (local + GitHub).** `extract-local.mjs` dynamically resolves the globally installed gsd-pi package via `npm root -g`, then reads skills (YAML frontmatter + XML sections from SKILL.md files, including nested references like github-workflows/references/gh/), agents (frontmatter + first-paragraph summaries from agent .md files), and extensions (recursive .ts file scanning with dual regex patterns for both `pi.registerTool({})` calls and `ToolDefinition` factory return blocks). In parallel, `extract-github-docs.mjs` downloads the repo tarball in a single API call, extracts 126 markdown files across 6 subdirectories plus README.md, with SHA-based caching that skips re-download when HEAD SHA is unchanged. `extract-releases.mjs` fetches all 48 releases in one paginated call and parses markdown bodies into structured `{added, changed, fixed}` sections.

**Phase 2 — Command extraction (depends on docs).** `extract-commands.mjs` parses markdown tables from the downloaded `docs/commands.md` (40 commands in 6 categories) and merges 2 additional commands from README's "Getting Started" table, producing 42 total commands across 7 categories. The parser detects table headers by column name pattern rather than fixed positions.

**Phase 3 — Manifest build.** `manifest.mjs` uses the tree API to get SHA hashes for all 991 repo files, writes `manifest.json` with version, generatedAt, headSha, and a files map. Compares against previous manifest to compute added/changed/removed diff.

All modules support optional `GITHUB_TOKEN` for authenticated requests (5000/hr vs 60 unauthenticated). Rate limit remaining is logged on every API response. Token value is never logged.

## Verification

- `node scripts/extract.mjs` exits 0, produces all 8 output artifacts in 1.0s (cached) ✅
- `node --test tests/extract.test.mjs` — **39/39 tests pass**, 0 failures across 10 suites ✅
  - skills.json: 8 entries, each with name, description, path ✅
  - agents.json: 5 entries, each with name, description, summary ✅
  - extensions.json: 17 entries, each with name, tools[], description; shared/ excluded ✅
  - commands.json: 42 entries across 7 categories with command, description, category fields ✅
  - releases.json: 48 entries with tag_name, published_at, html_url, parsed sections ✅
  - docs/: 126 .md files preserving subdirectory structure ✅
  - readme.md: exists with 31,574 characters ✅
  - manifest.json: 991 file entries with SHA hashes, headSha, generatedAt ✅
- Second run demonstrates cache hit — tarball skipped, manifest diff shows 0 changes ✅
- `--pkg-path /nonexistent` exits 1 with structured error including path and `[local]` phase ✅
- `--dry-run` shows extraction plan without writing files ✅
- API calls per cached run: 3 (HEAD SHA check + releases + tree) ✅
- End-to-end idempotency verified by tests ✅

## Requirements Advanced

- R001 — **Validated.** Extraction produces skills.json (8), agents.json (5), extensions.json (17 with full tool inventories) from the installed gsd-pi npm package with dynamic path resolution and --pkg-path override.
- R002 — **Validated.** Pipeline pulls 126 markdown docs, README, 48 releases, and 991-file manifest from gsd-build/gsd-2 GitHub repo via tarball + releases + tree API with SHA-based caching.
- R018 — **Advanced.** Skills extracted with YAML frontmatter + XML sections (objective, arguments, detection), agents with frontmatter + summaries, extensions with tool inventories + JSDoc descriptions. Remaining work is presentation-layer transformation in S03.

## Requirements Validated

- R001 — Skills, agents, and extensions extracted from npm package with correct structure and counts. 39/39 tests pass.
- R002 — All GitHub content extracted with rate-limit-safe caching. 126 docs, 48 releases, 991-file manifest verified.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Extension count is 17 (not ≥14 as planned) — includes 4 extensions with 0 tools (voice, ttsr, remote-questions, slash-commands). These are valid extensions that use commands/shortcuts/hooks instead of tools.
- tar v7 required ESM named imports (`import { extract } from "tar"`) instead of default import — documented in KNOWLEDGE.md.
- README command table uses "What it does" header instead of "Description" — parser handles both via regex pattern matching.
- GITHUB_TOKEN invalid/expired error path not tested live (would consume rate limit) — error format verified in code review.

## Known Limitations

- **No prompt template extraction.** R018 mentions prompt templates as a source of behavioral truth, but the current pipeline only extracts skills, agents, and extensions. Prompt templates would need a separate extraction strategy — they're written in LLM-instruction format and need careful curation to be human-useful. This is a gap that S03 should consider when building quick-reference cards.
- **Unauthenticated rate limit is 60/hr.** Without GITHUB_TOKEN, the pipeline uses 3 API calls per cached run but a fresh run could use more. Heavy development without auth could hit limits.
- **No incremental doc extraction.** The tarball is all-or-nothing — if one doc changes, the entire tarball is re-downloaded and all 126 docs are re-extracted. The manifest tracks SHA changes but extraction doesn't use it yet. S06 could optimize this.

## Follow-ups

- S03 should consume the JSON files directly as Astro data sources — test early that the JSON schema matches what card components need.
- S04 should verify the 126 extracted markdown files render correctly in Starlight — some may have GSD-specific formatting that needs post-processing.
- S05 should use releases.json's parsed `{added, changed, fixed}` sections for structured changelog display.
- S06 should use manifest.json's diff tracking to enable incremental rebuild — the added/changed/removed computation is already implemented.

## Files Created/Modified

- `package.json` — Node.js project config with gray-matter, tar dependencies, extract script
- `.gitignore` — ignores node_modules/, content/generated/, .cache/
- `scripts/extract.mjs` — CLI orchestrator with --pkg-path, --dry-run, --no-cache, --help flags
- `scripts/lib/extract-local.mjs` — npm package extractor (skills, agents, extensions)
- `scripts/lib/extract-github-docs.mjs` — tarball downloader + docs extractor with SHA-based caching
- `scripts/lib/extract-releases.mjs` — releases fetcher with markdown body parser
- `scripts/lib/extract-commands.mjs` — markdown table parser for commands/shortcuts/flags
- `scripts/lib/manifest.mjs` — tree API manifest builder with diff tracking
- `tests/extract.test.mjs` — 39 tests across 10 suites using node:test
- `content/generated/.gitkeep` — ensures output directory exists in git
- `content/generated/skills.json` — 8 skill objects (generated, gitignored)
- `content/generated/agents.json` — 5 agent objects (generated, gitignored)
- `content/generated/extensions.json` — 17 extension objects with tool inventories (generated, gitignored)
- `content/generated/commands.json` — 42 commands across 7 categories (generated, gitignored)
- `content/generated/releases.json` — 48 structured release objects (generated, gitignored)
- `content/generated/manifest.json` — 991 file entries with SHA hashes (generated, gitignored)
- `content/generated/readme.md` — repo README (generated, gitignored)
- `content/generated/docs/**/*.md` — 126 markdown files across 6 subdirectories (generated, gitignored)

## Forward Intelligence

### What the next slice should know
- The JSON output schema is established and tested — `skills.json` has `{name, description, path, frontmatter, sections}`, `agents.json` has `{name, description, summary, frontmatter}`, `extensions.json` has `{name, description, tools: [{name, description}]}`, `commands.json` has `{command, description, category}`, `releases.json` has `{tag_name, published_at, html_url, body, added, changed, fixed}`.
- Run `npm run extract` before any Astro build — content/generated/ is gitignored and must be regenerated. Consider adding this as a prebuild hook in package.json.
- The manifest's diff computation (`added`, `changed`, `removed` arrays) is computed but not yet consumed — it's ready for S06's incremental rebuild logic.
- Extensions with 0 tools (voice, ttsr, remote-questions, slash-commands) are still in extensions.json — S03 cards should handle empty tool arrays gracefully.

### What's fragile
- **Extension regex extraction** — The dual regex pattern works for current gsd-pi code but would break if the TypeScript source changes its registration pattern significantly. The 17 extensions and tool counts are validated by tests that would catch regressions.
- **Markdown table parser** — Relies on `| Command | Description |` column header patterns. If upstream docs change table formatting, command extraction could silently produce fewer results. The test asserts ≥42 commands but doesn't check specific commands.
- **Tarball path stripping** — `strip: 1` removes the `gsd-build-gsd-2-{sha}/` prefix. If GitHub changes tarball structure, docs extraction would fail visibly (files would land in wrong locations).

### Authoritative diagnostics
- `node --test tests/extract.test.mjs` — 39 tests covering all output structures and counts. This is the single most trustworthy signal.
- `node scripts/extract.mjs --dry-run` — shows API reachability, cache state, and extraction plan without side effects.
- `cat .cache/last-sha.txt` — the cached HEAD SHA. Delete this file to force tarball re-download.
- `jq 'length' content/generated/commands.json` — quick count check. Should be 42.

### What assumptions changed
- Plan assumed ≥14 extensions; actual count is 17 — 4 extensions (voice, ttsr, remote-questions, slash-commands) register 0 tools but are valid extensions.
- Plan assumed `pi.registerTool({})` regex would capture all tools; actually needed a second pattern for ToolDefinition factory functions (documented in KNOWLEDGE.md).
- Plan estimated ≥100 docs; actual count is 126 across 6 subdirectories — more content than expected.
