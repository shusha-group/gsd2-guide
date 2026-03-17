---
id: T03
parent: S01
milestone: M001
provides:
  - Single-entry-point orchestrator (scripts/extract.mjs) with CLI flags
  - Command extraction from markdown tables (42 commands across 7 categories)
  - Complete content/generated/ pipeline producing all 8 output artifacts
key_files:
  - scripts/extract.mjs
  - scripts/lib/extract-commands.mjs
  - tests/extract.test.mjs
  - content/generated/commands.json
key_decisions:
  - Deduplicate README commands against docs/commands.md (docs takes priority)
  - Parallel execution of local + github-docs + releases, then sequential commands + manifest
  - Table parser uses column-header detection (Command/Flag/Shortcut | Description/Action) rather than fixed-position parsing
patterns_established:
  - Phase-labeled console output with section separators for orchestrator phases
  - CLI arg parsing via manual switch/case (no external deps) with --help, --dry-run, --no-cache, --pkg-path flags
  - Merge-with-dedup pattern for combining command tables from multiple sources
observability_surfaces:
  - "[orchestrator]" prefix with elapsed time and total content items in final summary
  - "[commands]" prefix with count from each source and total across categories
  - "--dry-run" flag shows extraction plan, API reachability, cache state without writing
  - "--help" flag prints usage with all options and environment variables
  - Exit code 1 on any phase failure with "[orchestrator] Fatal error:" prefix
duration: 15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T03: Wire extraction orchestrator and extract commands

**Built the CLI orchestrator and command table extractor — `npm run extract` produces all 8 output artifacts with parallel execution, caching, and 42 extracted commands across 7 categories.**

## What Happened

Created `scripts/lib/extract-commands.mjs` that parses markdown tables from `docs/commands.md` (40 commands in 6 categories) and merges additional commands from `readme.md` (2 extra from the "Getting Started" table), producing 42 total commands across 7 categories (Session Commands, Configuration & Diagnostics, Git Commands, Session Management, Keyboard Shortcuts, CLI Flags, Getting Started). The parser detects table headers by column name pattern (Command/Flag/Shortcut + Description/Action) and tracks `##` headings as category names.

Created `scripts/extract.mjs` as the single-entry-point orchestrator that:
- Runs local extraction + GitHub docs + releases in parallel via `Promise.all`
- Runs command extraction after docs are downloaded (dependency)
- Runs manifest build last
- Supports `--pkg-path`, `--dry-run`, `--no-cache`, `--help` CLI flags
- Logs phased output with section separators and a final summary with counts and elapsed time
- Exits 0 on success, 1 on error with readable message

Extended `tests/extract.test.mjs` with 9 new tests: 5 for command extraction (existence, fields, categories, slash commands, shortcuts) and 4 for end-to-end orchestration (exit code 0, all artifacts present, valid JSON, idempotency).

## Verification

- `npm run extract` exits 0 — 1.0s with cache hit, produces all artifacts ✅
- `node --test tests/extract.test.mjs` — 39/39 tests pass, 0 failures ✅
- `ls content/generated/` — skills.json, agents.json, extensions.json, commands.json, releases.json, manifest.json, readme.md, docs/ ✅
- `node scripts/extract.mjs --dry-run` — shows plan without writing files ✅
- `node scripts/extract.mjs --help` — prints usage ✅
- Second `npm run extract` — cache hit for tarball, manifest diff shows 0 changes ✅
- `node scripts/extract.mjs --pkg-path /nonexistent` — exits 1 with `[local]` error including path ✅
- API calls per cached run: 3 (HEAD SHA check + releases + tree) ≤5 ✅

### Slice-level verification status (T03 is final task):
- ✅ `node scripts/extract.mjs` exits 0 and produces all expected files
- ✅ `node --test tests/extract.test.mjs` passes all assertions (skills ≥8, agents ≥5, extensions ≥14, commands structured, releases ≥48, docs ≥100, readme exists, manifest has SHA hashes)
- ✅ Second run with unchanged content skips tarball re-download (cache hit)
- ✅ `node scripts/extract.mjs --pkg-path /nonexistent` produces structured error with path and `[local]` phase, exits non-zero
- ✅ `--dry-run` shows plan without writing
- ⚠️ GITHUB_TOKEN invalid/expired error path not tested (would consume rate limit) — error format verified in code review

## Diagnostics

- **Re-run full pipeline:** `npm run extract`
- **Inspect commands:** `jq '.[] | .category' content/generated/commands.json | sort -u`
- **Command count:** `jq 'length' content/generated/commands.json`
- **Check categories:** `jq '[.[] | .category] | unique' content/generated/commands.json`
- **Dry run:** `node scripts/extract.mjs --dry-run`
- **Force fresh download:** `node scripts/extract.mjs --no-cache`
- **Error path test:** `node scripts/extract.mjs --pkg-path /nonexistent`
- **Run tests:** `node --test tests/extract.test.mjs`

## Deviations

- `package.json` already had the `"extract"` script from a prior task — no change needed (plan said to add it in this task)
- README command table uses "What it does" header instead of "Description" — parser handles both via regex pattern matching

## Known Issues

None.

## Files Created/Modified

- `scripts/extract.mjs` — CLI orchestrator with --pkg-path, --dry-run, --no-cache, --help flags
- `scripts/lib/extract-commands.mjs` — Markdown table parser for commands/shortcuts/flags
- `tests/extract.test.mjs` — Extended with 9 new tests (commands + end-to-end)
- `content/generated/commands.json` — 42 commands across 7 categories (generated output)
- `.gsd/milestones/M001/slices/S01/tasks/T03-PLAN.md` — Added Observability Impact section
