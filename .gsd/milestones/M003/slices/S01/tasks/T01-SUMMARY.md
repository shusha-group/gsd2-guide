---
id: T01
parent: S01
milestone: M003
provides:
  - page-source-map generator mapping all 42 authored doc pages to gsd-pi source file deps
  - content/generated/page-source-map.json with validated source paths
key_files:
  - scripts/lib/build-page-map.mjs
  - content/generated/page-source-map.json
  - tests/page-map.test.mjs
key_decisions:
  - Commands without a dedicated slug.ts file (discuss, next, pause, stop) map to shared deps (commands.ts, state.ts, types.ts) plus any existing prompt
  - All command overrides include shared deps (commands.ts, state.ts, types.ts) for consistency
  - Added commands.ts to recipes/small-change to meet the ≥3 deps requirement for cross-cutting pages
patterns_established:
  - Page keys use path-relative format (e.g. "commands/auto.mdx", "recipes/fix-a-bug.mdx") without the src/content/docs prefix
  - Source deps use repo-relative paths matching manifest.json keys (e.g. "src/resources/extensions/gsd/auto.ts")
  - Reference pages (skills, agents, extensions) dynamically pull all matching files from manifest rather than hardcoding
observability_surfaces:
  - content/generated/page-source-map.json (human-readable, 42 entries)
  - Console warnings for missing source paths during build
  - Error if >50% paths missing (suggests stale manifest)
duration: 20m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Build page-source-map generator with tests

**Created ESM module that maps all 42 authored doc pages to their gsd-pi source file dependencies, validated against manifest.json**

## What Happened

Built `scripts/lib/build-page-map.mjs` with three mapping strategies:
1. **27 command pages** — 22 have explicit override mappings (special multi-file commands like auto, doctor, migrate, visualize, etc.) and 5 use the algorithmic fallback (shared deps + slug.ts if exists + prompts/slug.md if exists).
2. **6 recipes + 1 walkthrough** — static lookup with broad cross-cutting dependencies (3-16 deps each).
3. **6 reference pages + 2 other pages** — reference/skills, reference/agents, reference/extensions dynamically pull all matching files from the manifest; reference/index, changelog, index have empty deps.

Key discovery: most command slugs (discuss, next, pause, stop) don't have a dedicated `.ts` file — they're implemented within `commands.ts`. The algorithmic fallback handles this gracefully, mapping them to just the shared deps plus any existing prompt file.

The generator validates all source paths against `manifest.json` at build time, logging warnings for missing paths and erroring if >50% are invalid.

## Verification

- `node scripts/lib/build-page-map.mjs` — runs without errors, outputs "42 pages mapped, 483 total deps"
- `node --test tests/page-map.test.mjs` — all 9 tests pass (42 pages, 27 commands, 6 recipes, walkthrough+reference+other, all paths in manifest, ≥1 .ts per command, ≥3 deps per cross-cutting, 0 deps for static, 0 warnings)
- `python3 -c "import json; m=json.load(open('content/generated/page-source-map.json')); print(f'{len(m)} pages mapped')"` — outputs "42 pages mapped"

Slice-level verification: 2/4 checks pass (page-map test + build-page-map CLI). Remaining 2 checks are for T02 (diff-sources).

## Diagnostics

- Inspect the map: `cat content/generated/page-source-map.json | python3 -m json.tool`
- Check deps for a specific page: `node -e "import fs from 'fs'; const m = JSON.parse(fs.readFileSync('content/generated/page-source-map.json','utf8')); console.log(m['commands/auto.mdx'])"`
- Re-validate after manifest changes: `node scripts/lib/build-page-map.mjs` (warnings printed to stderr)

## Deviations

- Added `commands.ts` to `recipes/small-change.mdx` deps (plan listed only `quick.ts` + `prompts/quick-task.md`) to meet the ≥3 deps must-have for cross-cutting pages. The `/quick` command is registered in commands.ts, making it a valid dependency.

## Known Issues

None.

## Files Created/Modified

- `scripts/lib/build-page-map.mjs` — ESM module exporting `buildPageSourceMap()` with CLI entry point
- `content/generated/page-source-map.json` — generated map with 42 page entries and 483 total source deps
- `tests/page-map.test.mjs` — 9 test cases using node:test + node:assert/strict
- `.gsd/milestones/M003/slices/S01/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
