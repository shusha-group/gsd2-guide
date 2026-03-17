---
estimated_steps: 5
estimated_files: 4
---

# T03: Wire extraction orchestrator and extract commands

**Slice:** S01 — Content extraction pipeline
**Milestone:** M001

## Description

Create the single-entry-point orchestrator `scripts/extract.mjs` that runs all extraction phases, add command extraction from the downloaded docs, and prove the complete pipeline works end-to-end. This is the integration task that wires T01's local extraction and T02's GitHub extraction into a unified pipeline with CLI flags, progress logging, and full verification.

Commands are extracted from the markdown files downloaded in T02 — specifically from `docs/commands.md` which contains consistent markdown tables (`| Command | Description |`), and cross-referenced with the README's command tables.

**Relevant installed skills:** None needed (pure Node.js scripting).

## Steps

1. **Write the command extractor.** Create `scripts/lib/extract-commands.mjs`. Export `extractCommands(options)` that:
   - Reads `content/generated/docs/commands.md` (downloaded by T02's tarball extraction)
   - Parses markdown tables — look for `| Command | Description |` header pattern, then parse each row
   - Tables are organized by category (Session Commands, Configuration & Diagnostics, Git Commands, Session Management, Keyboard Shortcuts, CLI Flags) — preserve the category
   - Each command: `{ command, description, category }`
   - Also scan the README (`content/generated/readme.md`) for any additional command tables and merge
   - Handle the `/command` slash-command format and `--flag` CLI flag format
   - Writes `content/generated/commands.json`
   - Logs `[commands]` prefix with count
   - Returns `{ count }`

2. **Write the orchestrator.** Create `scripts/extract.mjs` that:
   - Parses CLI args: `--pkg-path <path>` (npm package override), `--dry-run` (show plan without writing), `--no-cache` (force fresh downloads), `--help`
   - Resolves options from CLI args + env vars (`GITHUB_TOKEN`)
   - Runs local extraction and GitHub extraction in parallel using `Promise.all([extractLocal(opts), extractGithubDocs(opts), extractReleases(opts)])` — these are independent
   - After GitHub docs are downloaded, runs `extractCommands(opts)` — depends on docs being present
   - After all GitHub calls, runs `buildManifest(opts)` — depends on tree API
   - Logs a final summary: total files generated, counts per type, time elapsed
   - Exits with code 0 on success, 1 on any error
   - Wraps everything in a try/catch with readable error messages
   - In `--dry-run` mode: resolves paths, checks API reachability, reports what would happen, but doesn't write files

3. **Add the `extract` npm script.** Update `package.json` to set `"extract": "node scripts/extract.mjs"` in the scripts section.

4. **Add command extraction tests and end-to-end tests.** Extend `tests/extract.test.mjs` with:
   - `content/generated/commands.json` exists and has entries
   - Each command has `command`, `description`, `category` fields
   - Commands span multiple categories (Session Commands, CLI Flags, etc.)
   - End-to-end test: run `node scripts/extract.mjs` as a child process, verify exit code 0
   - All output files exist after e2e run
   - All JSON files are valid JSON (parse without throwing)
   - Manifest `diff` reports no changes on immediate second run (idempotency check)

5. **Run full end-to-end verification.** Execute `npm run extract` and then `node --test tests/extract.test.mjs`. Verify all counts match expectations. Run a second time to confirm caching works (tarball not re-downloaded). Confirm the total API calls ≤5 per run.

## Must-Haves

- [ ] `scripts/extract.mjs` runs all phases and exits 0
- [ ] `--pkg-path`, `--dry-run`, `--no-cache` CLI flags work
- [ ] Commands extracted from docs markdown tables with categories
- [ ] All 8 output files present: skills.json, agents.json, extensions.json, commands.json, releases.json, manifest.json, readme.md, docs/
- [ ] Progress logging with phase prefixes and final summary with counts
- [ ] `npm run extract` works as the one-command entry point
- [ ] All tests pass: `node --test tests/extract.test.mjs`

## Verification

- `npm run extract` exits 0 with progress output showing all phases
- `node --test tests/extract.test.mjs` — all assertions pass (local + GitHub + commands + e2e)
- `ls content/generated/` shows: `skills.json`, `agents.json`, `extensions.json`, `commands.json`, `releases.json`, `manifest.json`, `readme.md`, `docs/`
- `node scripts/extract.mjs --dry-run` shows plan without writing files
- Second `npm run extract` shows cache hit for tarball, manifest diff shows 0 changes

## Inputs

- `scripts/lib/extract-local.mjs` from T01 — exports `extractLocal(options)`
- `scripts/lib/extract-github-docs.mjs` from T02 — exports `extractGithubDocs(options)`
- `scripts/lib/extract-releases.mjs` from T02 — exports `extractReleases(options)`
- `scripts/lib/manifest.mjs` from T02 — exports `buildManifest(options)`
- `tests/extract.test.mjs` from T01+T02 — existing test file to extend
- `content/generated/docs/commands.md` — produced by T02's tarball extraction, contains markdown tables of GSD commands organized by category
- `content/generated/readme.md` — produced by T02, may contain additional command references
- `package.json` from T01 — to add the extract script

## Expected Output

- `scripts/extract.mjs` — CLI orchestrator with `--pkg-path`, `--dry-run`, `--no-cache` flags
- `scripts/lib/extract-commands.mjs` — command table parser for markdown docs
- `content/generated/commands.json` — array of `{command, description, category}` objects
- Updated `tests/extract.test.mjs` — command assertions + end-to-end assertions
- Updated `package.json` — `"extract"` script added
- Complete `content/generated/` directory with all 8 output artifacts

## Observability Impact

- **New signals:** `[commands]` phase prefix with extracted count; `[orchestrator]` prefix with total files and elapsed time in final summary
- **Inspection surface:** `node scripts/extract.mjs --dry-run` shows what would happen without writing; `jq '.[] | .category' content/generated/commands.json | sort -u` lists extracted command categories
- **Failure visibility:** Orchestrator wraps each phase in try/catch — errors include phase name and original error message; exit code 1 on any failure
- **Diagnostics:** `node scripts/extract.mjs --help` prints usage; `npm run extract` is the single-command entry point
