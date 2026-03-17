---
estimated_steps: 6
estimated_files: 3
---

# T01: Build page-source-map generator with tests

**Slice:** S01 — Source Diff and Page Mapping
**Milestone:** M003

## Description

Create the page-source-map generator that maps all 42 authored doc pages to their gsd-pi source file dependencies. This is the core data structure that downstream slices (S02 for regeneration, S03 for new/removed commands, S04 for pipeline integration) consume.

The mapping has three categories:
- **27 command deep-dives** — algorithmic: command name → `.ts` implementation + prompt `.md` + shared deps
- **6 recipes + 1 walkthrough** — static lookup with broad cross-cutting dependencies
- **6 reference pages + 2 other pages** — static lookup depending on generated JSON or nothing

The script reads the current `content/generated/manifest.json` to validate that all mapped source paths actually exist. It writes `content/generated/page-source-map.json`.

## Steps

1. Create `scripts/lib/build-page-map.mjs` as an ESM module. Export a `buildPageSourceMap()` function and a CLI entry point (runs when executed directly).

2. Implement the **command page mapping rules**. For each of the 27 command pages at `src/content/docs/commands/<slug>.mdx`, map to:
   - `src/resources/extensions/gsd/<slug>.ts` (primary implementation)
   - `src/resources/extensions/gsd/prompts/<slug>.md` (prompt, if exists in manifest)
   - Shared dependencies: `src/resources/extensions/gsd/commands.ts`, `src/resources/extensions/gsd/state.ts`, `src/resources/extensions/gsd/types.ts`
   
   Override the algorithmic mapping for these special cases (from research):
   - `gsd.mdx` → `commands.ts`, `state.ts`, `guided-flow.ts`, `prompts/discuss.md`, `prompts/system.md`
   - `auto.mdx` → `auto.ts`, `auto-dispatch.ts`, `auto-recovery.ts`, `auto-worktree.ts`, `auto-prompts.ts`, `auto-supervisor.ts`, `auto-dashboard.ts`, `unit-runtime.ts`
   - `doctor.mdx` → `doctor.ts`, `doctor-proactive.ts`, `prompts/doctor-heal.md`
   - `migrate.mdx` → all 8 `migrate/*.ts` files
   - `visualize.mdx` → `visualizer-data.ts`, `visualizer-overlay.ts`, `visualizer-views.ts`
   - `hooks.mdx` → `post-unit-hooks.ts`, `prompts/execute-task.md`
   - `capture.mdx` → `captures.ts`, `prompts/triage-captures.md`
   - `triage.mdx` → `triage-ui.ts`, `triage-resolution.ts`, `prompts/triage-captures.md`
   - `queue.mdx` → `queue-order.ts`, `queue-reorder-ui.ts`, `prompts/queue.md`
   - `forensics.mdx` → `forensics.ts`, `session-forensics.ts`, `prompts/forensics.md`
   - `knowledge.mdx` → `prompts/system.md`, `files.ts`
   - `config.mdx` → `preferences.ts`, `prompts/system.md`
   - `prefs.mdx` → `preferences.ts`
   - `mode.mdx` → `guided-flow.ts`, `preferences.ts`
   - `steer.mdx` → `prompts/discuss.md`, `guided-flow.ts`
   - `status.mdx` → `state.ts`, `session-status-io.ts`
   - `cleanup.mdx` → `worktree-manager.ts`, `worktree.ts`, `git-service.ts`
   - `headless.mdx` → `commands.ts`, `prompts/discuss-headless.md`
   - `cli-flags.mdx` → `commands.ts`
   - `keyboard-shortcuts.mdx` → `commands.ts`
   - `skill-health.mdx` → `skill-health.ts`, `skill-telemetry.ts`, `skill-discovery.ts`, `prompts/heal-skill.md`
   - `run-hook.mdx` → `post-unit-hooks.ts`

3. Implement the **recipe page mappings** (static lookup, from research):
   - `recipes/new-milestone.mdx` → `commands.ts`, `state.ts`, `prompts/discuss.md`, `prompts/research-milestone.md`, `prompts/plan-milestone.md`, `templates/roadmap.md`, `templates/project.md`
   - `recipes/fix-a-bug.mdx` → `commands.ts`, `state.ts`, `prompts/discuss.md`, `prompts/execute-task.md`, `doctor.ts`
   - `recipes/small-change.mdx` → `quick.ts`, `prompts/quick-task.md`
   - `recipes/error-recovery.mdx` → `auto-recovery.ts`, `crash-recovery.ts`, `doctor.ts`, `prompts/doctor-heal.md`
   - `recipes/uat-failures.mdx` → `prompts/run-uat.md`, `unit-runtime.ts`, `prompts/replan-slice.md`
   - `recipes/working-in-teams.mdx` → `worktree.ts`, `worktree-manager.ts`, `git-service.ts`, `prompts/worktree-merge.md`

4. Implement the **walkthrough, reference, and other page mappings**:
   - `user-guide/developing-with-gsd.mdx` → broad set (see research: state.ts, commands.ts, 10+ prompt/template files, auto.ts)
   - `reference/commands.mdx` → `docs/commands.md`
   - `reference/skills.mdx` → `src/resources/skills/` (skill files from manifest)
   - `reference/agents.mdx` → `src/resources/agents/` (agent files from manifest)
   - `reference/extensions.mdx` → `src/resources/extensions/` (extension files from manifest)
   - `reference/shortcuts.mdx` → `docs/commands.md`
   - `reference/index.mdx` → empty array (static landing)
   - `changelog.mdx` → empty array (depends on GitHub releases, not source files)
   - `index.mdx` → empty array (static homepage)

5. Add **validation**: after building the map, load `content/generated/manifest.json` and verify every source path exists. Log warnings for missing paths. If >50% are missing, log an error suggesting repo restructure.

6. Write `tests/page-map.test.mjs` using `node:test` + `node:assert/strict`:
   - Test: map has exactly 42 page entries
   - Test: all 27 command pages present (check each slug)
   - Test: all 6 recipe pages present
   - Test: walkthrough, 6 reference pages, changelog, homepage present
   - Test: every source path in every entry exists in `manifest.json` (cross-validation)
   - Test: command pages each have ≥1 `.ts` file in their deps
   - Test: cross-cutting pages (recipes, walkthrough) have ≥3 deps each
   - Test: static pages (index, reference/index, changelog) have 0 or appropriate deps

**Important path conventions:** All source paths use the repo-relative format from `manifest.json`. The extension files are at `src/resources/extensions/gsd/<file>`, prompts at `src/resources/extensions/gsd/prompts/<file>`, templates at `src/resources/extensions/gsd/templates/<file>`. Verify exact prefixes by checking actual manifest entries.

**Important:** Before writing the mapping, load the actual manifest and check which paths exist. The research doc lists expected mappings but some filenames may be slightly different in the actual manifest. The script should validate as it builds.

## Must-Haves

- [ ] `scripts/lib/build-page-map.mjs` generates `content/generated/page-source-map.json`
- [ ] All 42 authored pages are mapped (27 commands + 6 recipes + 1 walkthrough + 6 reference + 2 other)
- [ ] Every source path in the map exists in `content/generated/manifest.json`
- [ ] Cross-cutting pages (recipes, walkthrough) have broad dependency sets (≥3 files each)
- [ ] `node --test tests/page-map.test.mjs` passes all assertions

## Verification

- `node scripts/lib/build-page-map.mjs` runs without errors and writes `content/generated/page-source-map.json`
- `node --test tests/page-map.test.mjs` — all tests pass
- `python3 -c "import json; m=json.load(open('content/generated/page-source-map.json')); print(f'{len(m)} pages mapped')"` outputs "42 pages mapped"

## Inputs

- `content/generated/manifest.json` — the current repo file manifest with SHA hashes and file paths. Used to validate that mapped source paths exist.
- Research doc S01-RESEARCH.md — contains the complete page-to-source mapping rules (inlined in steps above).
- Authored page list: 27 command pages in `src/content/docs/commands/`, 6 recipes in `src/content/docs/recipes/`, 1 walkthrough in `src/content/docs/user-guide/`, 6 reference pages in `src/content/docs/reference/`, `changelog.mdx`, `index.mdx`.

## Expected Output

- `scripts/lib/build-page-map.mjs` — new ESM module exporting `buildPageSourceMap()` and runnable as CLI
- `content/generated/page-source-map.json` — JSON object with 42 keys (page paths) mapping to arrays of source file paths
- `tests/page-map.test.mjs` — test file with ≥6 test cases, all passing
