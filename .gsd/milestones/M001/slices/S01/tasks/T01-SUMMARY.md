---
id: T01
parent: S01
milestone: M001
provides:
  - Node.js project scaffold with gray-matter dependency
  - Local content extractor (skills, agents, extensions from gsd-pi npm package)
  - JSON output files in content/generated/
  - Test framework with structural assertions
key_files:
  - package.json
  - scripts/lib/extract-local.mjs
  - tests/extract.test.mjs
  - content/generated/skills.json
  - content/generated/agents.json
  - content/generated/extensions.json
key_decisions:
  - Used recursive TS file scanning + regex for extension tool extraction (handles both pi.registerTool({ and factory function patterns)
  - Include all extensions (even those with 0 tools) in output, not just tool-bearing ones
  - Parse ToolDefinition return blocks for factory-pattern tools (e.g., async-jobs createAsyncBashTool)
patterns_established:
  - gray-matter for YAML frontmatter parsing in .md files
  - Regex-based XML tag extraction for skill sections (<objective>, <arguments>, <detection>)
  - Phase-prefixed console logging ([local]) for extraction diagnostics
  - JSON output to content/generated/ with pretty-printed formatting
observability_surfaces:
  - Console output: "[local] Skills: N, Agents: N, Extensions: N"
  - Error messages include path and [local] phase prefix
  - JSON files in content/generated/ serve as durable inspection surfaces
duration: 12m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Scaffold project and extract local content from npm package

**Built the Node.js project scaffold and local content extractor that reads 8 skills, 5 agents, and 17 extensions from the installed gsd-pi npm package.**

## What Happened

Initialized the project with `package.json` (type: module, gray-matter dep), `.gitignore`, and `content/generated/.gitkeep`. Wrote `scripts/lib/extract-local.mjs` with four exports:

- `resolvePackagePath(override?)` — dynamically resolves gsd-pi via `npm root -g`, validates `src/resources/` exists
- `extractSkills(pkgPath)` — recursively finds SKILL.md files, parses YAML frontmatter with gray-matter, extracts XML-like sections (`<objective>`, `<arguments>`, `<detection>`), handles nested references with `parentSkill` field
- `extractAgents(pkgPath)` — reads agent .md files, parses frontmatter, extracts first paragraph as summary
- `extractExtensions(pkgPath)` — lists extension dirs (excluding `shared/`), scans all .ts files recursively for `pi.registerTool({` blocks and `ToolDefinition` factory return blocks, extracts JSDoc descriptions from index.ts

The tool extraction handles two patterns: (1) direct `pi.registerTool({ name: "...", description: "..." })` calls and (2) factory functions returning `ToolDefinition` objects (e.g., async-jobs' `createAsyncBashTool`). Multi-line string concatenation and template literals are parsed correctly.

## Verification

- `npm install` — clean install, 0 vulnerabilities
- `node --test tests/extract.test.mjs` — **19/19 tests pass** across 5 suites (skills, agents, extensions, package path resolution, output files)
- `extractLocal({})` returns: skills: 8, agents: 5, extensions: 17
- skills.json: 8 entries including nested `gh` skill with `parentSkill: "github-workflows"`
- agents.json: 5 entries (scout, researcher, worker, javascript-pro, typescript-pro) all with name, description, summary
- extensions.json: 17 entries, `shared/` excluded, browser-tools has 47 tools
- Error path verified: `resolvePackagePath('/nonexistent')` throws structured error with path and `[local]` prefix

**Slice-level verification (3/8 passing — T02/T03 items expected pending):**
- ✅ skills.json ≥8 entries with name, description, path
- ✅ agents.json ≥5 entries with name, description
- ✅ extensions.json ≥14 entries with name, tools[], description
- ⏳ commands.json (T03)
- ⏳ releases.json (T02)
- ⏳ docs/ ≥100 files (T02)
- ⏳ readme.md (T02)
- ⏳ manifest.json (T02)

## Diagnostics

- **Inspect extraction output:** `cat content/generated/skills.json | jq '.[] | .name'`
- **Re-run extraction:** `node -e "import('./scripts/lib/extract-local.mjs').then(m => m.extractLocal({}).then(r => console.log(r)))"`
- **Test error path:** `node -e "import('./scripts/lib/extract-local.mjs').then(m => m.resolvePackagePath('/bad')).catch(e => console.error(e.message))"`
- **Run tests:** `node --test tests/extract.test.mjs`

## Deviations

- Extension tool extraction was enhanced beyond the plan's `pi.registerTool({` regex to also handle factory function patterns (`return { name:... }` in files with `ToolDefinition`). This captures async-jobs' 3 tools that would otherwise be missed.
- Plan estimated ≥14 extensions; actual count is 17 (includes extensions with 0 tools like voice, ttsr, remote-questions, slash-commands).

## Known Issues

None.

## Files Created/Modified

- `package.json` — Node.js project config with gray-matter dependency, type: module
- `.gitignore` — ignores node_modules/, content/generated/, .cache/
- `scripts/lib/extract-local.mjs` — local content extractor with resolvePackagePath, extractSkills, extractAgents, extractExtensions, extractLocal exports
- `tests/extract.test.mjs` — 19 tests across 5 suites using node:test
- `content/generated/.gitkeep` — ensures output directory exists in git
- `content/generated/skills.json` — 8 skill objects with frontmatter and XML sections
- `content/generated/agents.json` — 5 agent objects with frontmatter and summaries
- `content/generated/extensions.json` — 17 extension objects with tool inventories
- `.gsd/milestones/M001/slices/S01/S01-PLAN.md` — added failure-path verification step
- `.gsd/milestones/M001/slices/S01/tasks/T01-PLAN.md` — added Observability Impact section
