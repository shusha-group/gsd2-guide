# S01: Content extraction pipeline — UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: This slice produces data files (JSON + markdown) from external sources (npm package + GitHub API). All outputs are deterministic given the same inputs, and structural assertions cover correctness. No UI, no server, no user interaction to test.

## Preconditions

- Node.js ≥18 installed
- `gsd-pi` npm package installed globally (`npm i -g gsd-pi`)
- `npm install` has been run in the project root
- Network access to `api.github.com` (for GitHub API calls)
- Optionally: `GITHUB_TOKEN` env var set for authenticated API calls (higher rate limits)

## Smoke Test

Run `npm run extract` and verify it exits 0 with a summary showing non-zero counts for all content types:

```bash
npm run extract
```

Expected: exits 0, final summary shows Skills: 8, Agents: 5, Extensions: 17, Commands: 42, Releases: 48, Docs: 126, README: yes, Manifest: 991 files tracked.

## Test Cases

### 1. Full extraction produces all 8 output artifacts

1. Delete `content/generated/` directory: `rm -rf content/generated`
2. Run: `npm run extract`
3. List outputs: `ls content/generated/`
4. **Expected:** Directory contains exactly: `agents.json`, `commands.json`, `docs/`, `extensions.json`, `manifest.json`, `readme.md`, `releases.json`, `skills.json`

### 2. Skills JSON has correct structure and count

1. Run: `jq 'length' content/generated/skills.json`
2. **Expected:** 8
3. Run: `jq '.[0] | keys' content/generated/skills.json`
4. **Expected:** Each skill has at minimum `name`, `description`, `path` fields
5. Run: `jq '.[] | select(.parentSkill != null) | .name' content/generated/skills.json`
6. **Expected:** At least one nested reference skill (e.g., `gh` with `parentSkill: "github-workflows"`)

### 3. Agents JSON has correct structure and count

1. Run: `jq 'length' content/generated/agents.json`
2. **Expected:** 5
3. Run: `jq '.[].name' content/generated/agents.json`
4. **Expected:** Includes scout, researcher, worker, javascript-pro, typescript-pro
5. Run: `jq '.[] | select(.description == null or .description == "")' content/generated/agents.json`
6. **Expected:** Empty (all agents have descriptions)

### 4. Extensions JSON has correct structure and tool inventories

1. Run: `jq 'length' content/generated/extensions.json`
2. **Expected:** 17
3. Run: `jq '.[] | select(.name == "shared")' content/generated/extensions.json`
4. **Expected:** Empty (shared/ directory excluded)
5. Run: `jq '.[] | select(.name == "browser-tools") | .tools | length' content/generated/extensions.json`
6. **Expected:** ≥40 (browser-tools has 47 tools)
7. Run: `jq '[.[] | select(.tools | length == 0) | .name]' content/generated/extensions.json`
8. **Expected:** Includes voice, ttsr, remote-questions, slash-commands (4 extensions with 0 tools)

### 5. Commands JSON parsed from markdown tables

1. Run: `jq 'length' content/generated/commands.json`
2. **Expected:** 42
3. Run: `jq '[.[] | .category] | unique' content/generated/commands.json`
4. **Expected:** 7 categories including "Session Commands", "Keyboard Shortcuts", "CLI Flags"
5. Run: `jq '.[] | select(.command == null or .description == null or .category == null)' content/generated/commands.json`
6. **Expected:** Empty (all commands have required fields)

### 6. Releases JSON with parsed sections

1. Run: `jq 'length' content/generated/releases.json`
2. **Expected:** ≥48
3. Run: `jq '.[0] | keys' content/generated/releases.json`
4. **Expected:** Includes `tag_name`, `published_at`, `html_url`, `body`, `added`, `changed`, `fixed`
5. Run: `jq '[.[] | select(.added | length > 0)] | length' content/generated/releases.json`
6. **Expected:** Multiple releases have non-empty `added` arrays

### 7. GitHub docs extracted with directory structure

1. Run: `find content/generated/docs -name '*.md' | wc -l`
2. **Expected:** 126
3. Run: `ls content/generated/docs/`
4. **Expected:** Subdirectories include building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals, what-is-pi
5. Run: `wc -c content/generated/readme.md`
6. **Expected:** >10,000 characters

### 8. Manifest tracks all repo files with SHA hashes

1. Run: `jq '.files | length' content/generated/manifest.json`
2. **Expected:** 991
3. Run: `jq '.headSha' content/generated/manifest.json`
4. **Expected:** Non-null SHA string
5. Run: `jq '.generatedAt' content/generated/manifest.json`
6. **Expected:** ISO timestamp string
7. Run: `jq '.files["README.md"]' content/generated/manifest.json`
8. **Expected:** Object with `sha` and `size` fields

### 9. Cached tarball reused on second run

1. Run: `npm run extract` (first run to populate cache)
2. Run: `npm run extract` again
3. **Expected:** Output includes `[github-docs] Cache hit — HEAD SHA unchanged`
4. Check: `.cache/last-sha.txt` exists and contains a SHA hash
5. Check: `.cache/tarball.tar.gz` exists

### 10. Test suite passes completely

1. Run: `node --test tests/extract.test.mjs`
2. **Expected:** 39/39 tests pass, 0 failures, 0 cancelled

## Edge Cases

### Invalid package path

1. Run: `node scripts/extract.mjs --pkg-path /nonexistent`
2. **Expected:** Exits with code 1, error message includes `/nonexistent` and `[local]` phase prefix

### Dry run mode

1. Run: `node scripts/extract.mjs --dry-run`
2. **Expected:** Shows extraction plan (package path, GITHUB_TOKEN status, cache state, API reachability, phases) but writes no files
3. Check: No files modified in `content/generated/`

### No-cache flag

1. Run: `node scripts/extract.mjs --no-cache`
2. **Expected:** Re-downloads tarball even if cached, output does NOT show "Cache hit"

### Help flag

1. Run: `node scripts/extract.mjs --help`
2. **Expected:** Prints usage information including all flags (--pkg-path, --dry-run, --no-cache) and GITHUB_TOKEN env var

### Rate limit visibility

1. Run `npm run extract` without GITHUB_TOKEN
2. **Expected:** Console output includes `rate limit remaining:` after each GitHub API call
3. **Expected:** GITHUB_TOKEN value is never printed (even if set)

## Failure Signals

- `npm run extract` exits with non-zero code
- Any test fails in `node --test tests/extract.test.mjs`
- JSON file counts are lower than expected (skills <8, agents <5, extensions <14, commands <42, releases <48, docs <100)
- `content/generated/` is missing any of the 8 expected artifacts
- Phase output shows `Fatal error:` prefix
- Rate limit remaining drops below 10 on unauthenticated runs (approaching rate limit)

## Requirements Proved By This UAT

- R001 — Content extraction from installed npm package (skills, agents, extensions with full structural validation)
- R002 — Content extraction from GitHub repo docs/ (tarball, releases, manifest with SHA tracking and caching)
- R018 — Partial: structured extraction of skills/agents/extensions from agent-format artifacts (presentation transformation deferred to S03)

## Not Proven By This UAT

- R003 — Quick-reference card rendering (S03)
- R004 — Deep-dive page rendering (S04)
- R005 — Changelog page display (S05)
- R018 — Full content transformation from agent-instruction format to human-facing documentation (S03 presentation layer)
- Prompt template extraction (not implemented — only skills, agents, extensions extracted)
- Site rendering of any extracted content (S02+)

## Notes for Tester

- The exact counts (8 skills, 5 agents, 17 extensions, 42 commands, 48 releases, 126 docs) reflect the current state of the gsd-pi package and GitHub repo. These may increase as the upstream project evolves — tests assert `≥` thresholds, not exact equality.
- Unauthenticated GitHub API has a 60 request/hour rate limit. If running tests repeatedly, set `GITHUB_TOKEN` to avoid hitting limits.
- The `.cache/` directory is not gitignored accidentally — check `.gitignore` includes it if you see cache files in git status.
- Extensions with 0 tools (voice, ttsr, remote-questions, slash-commands) are intentionally included — they're valid extensions that register commands or hooks instead of tools.
