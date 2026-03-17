---
estimated_steps: 7
estimated_files: 3
---

# T02: Content extraction script — commands from npm package and GitHub repo

**Slice:** S01 — Commands quick-reference with extraction pipeline and custom design
**Milestone:** M001

## Description

Build the Node.js content extraction script that reads the installed gsd-pi package and the GitHub repo to produce structured JSON data. For this task, focus on commands extraction — parsing the command tables from `docs/commands.md` and the README into structured `data/commands.json`. Also establish the manifest pattern (`data/manifest.json`) with SHA-256 hashes for every content file, enabling incremental rebuilds in S06.

The extraction script is architected as a module with exported functions per content type (`extractCommands()`, `extractSkills()`, etc.) so S02 can extend it without rewriting.

## Steps

1. Create `scripts/extract-content.mjs` with the module structure: individual extraction functions exported, a `main()` that runs all extractors, CLI invocation via `import.meta.url`
2. Implement `extractCommands()`: use the `gh` CLI to fetch `docs/commands.md` from `gsd-build/gsd-2` repo. Parse the markdown tables (Session Commands, Configuration & Diagnostics, Git Commands, Session Management, Keyboard Shortcuts, CLI Flags) into structured objects: `{ name, description, category, shortcut?, flags? }`
3. Also parse the README.md commands table (already installed locally at the gsd-pi package path) as a fallback/supplementary source
4. Write results to `data/commands.json` — array of command objects, sorted by category then name
5. Implement `writeManifest()`: after all extraction, compute SHA-256 hash of each file in `data/`, write `data/manifest.json` with `{ version, timestamp, files: { path: hash } }`
6. Read the installed gsd-pi `package.json` to get the current version number, include it in the manifest
7. Add error handling: descriptive messages if GitHub API fails, if files are missing, or if parsing produces zero results. Exit with non-zero code on failure.

## Must-Haves

- [ ] `node scripts/extract-content.mjs` runs successfully and produces `data/commands.json`
- [ ] `data/commands.json` contains 20+ command entries, each with `name`, `description`, `category` fields
- [ ] Command categories include: session, config, git, shortcuts, cli
- [ ] `data/manifest.json` exists with SHA-256 hashes for all data files and a version field
- [ ] Script exports individual functions (`extractCommands`, `writeManifest`) for reuse by later tasks
- [ ] Script exits with non-zero code and descriptive error on failure

## Verification

- `node scripts/extract-content.mjs` exits with code 0
- `cat data/commands.json | node -e "const d=require('./data/commands.json'); console.log(d.length + ' commands'); console.log(new Set(d.map(c=>c.category)))"` shows 20+ commands across 5+ categories
- `cat data/manifest.json` shows version, timestamp, and file hashes

## Inputs

- `docs/commands.md` from `gsd-build/gsd-2` GitHub repo (fetched via `gh api`)
- Installed gsd-pi README.md at npm global package path
- Installed gsd-pi `package.json` for version number
- D003 (content source of truth: npm package + GitHub repo) from DECISIONS.md

## Expected Output

- `scripts/extract-content.mjs` — Extraction pipeline (modular, extensible)
- `data/commands.json` — Structured command reference data
- `data/manifest.json` — Content hashes for incremental rebuild
