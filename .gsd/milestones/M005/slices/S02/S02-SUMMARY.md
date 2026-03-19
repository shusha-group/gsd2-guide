---
id: S02
parent: M005
milestone: M005
provides:
  - 32 stub MDX pages in src/content/docs/prompts/ (one per prompt slug from prompts.json)
  - Prompts sidebar section in astro.config.mjs with 4 nested sub-groups (Auto-mode Pipeline, Guided Variants, Commands, Foundation)
  - page-source-map.json extended from 48 to 80 entries (32 new prompts/ entries)
  - build-page-map.mjs Section 6 generating prompt page entries from prompts.json
  - Fixed test suite (12 tests, 0 failures) with correct 33-command count and 3 new prompt page assertions
requires:
  - slice: S01
    provides: content/generated/prompts.json with 32 entries (slug, name, group, variables, pipelinePosition, usedByCommands)
affects:
  - S03
  - S04
  - S05
key_files:
  - src/content/docs/prompts/*.mdx (32 new stub files)
  - astro.config.mjs
  - scripts/lib/build-page-map.mjs
  - content/generated/page-source-map.json
  - tests/page-map.test.mjs
key_decisions:
  - D058: page-source-map key format for prompt pages is prompts/{slug}.mdx (consistent with commands/{slug}.mdx)
  - Node script generation (not manual writes) for all 32 MDX stubs ensures consistency and correctness from prompts.json
  - fs.existsSync guard in Section 6 of build-page-map.mjs keeps the script safe in fresh checkouts without prompts.json
patterns_established:
  - MDX stub format: frontmatter with title/description + :::caution scaffold notice (matches manage-pages.mjs pattern)
  - Sidebar sub-group nesting: top-level { label: 'Prompts', items: [{ label, items }] } with 4 groups ordered Auto-mode Pipeline → Guided Variants → Commands → Foundation
  - build-page-map.mjs Section pattern: header comment + existsSync guard on generated JSON + iterate array + addPage per entry
  - Test fix pattern: update COMMAND_SLUGS in alphabetical order matching actual command dir contents, then update all dependent assertions
observability_surfaces:
  - "ls src/content/docs/prompts/*.mdx | wc -l → 32"
  - "grep -c \"'/prompts/\" astro.config.mjs → 32"
  - "node scripts/lib/build-page-map.mjs → stdout: Page source map: 80 pages mapped, 941 total deps"
  - "python3 -c \"import json; d=json.load(open('content/generated/page-source-map.json')); print(len([k for k in d if k.startswith('prompts/')]))\" → 32"
  - "node --test tests/page-map.test.mjs → 12 tests, 0 failures"
  - "npm run build → 104 page(s) built in ~5s"
drill_down_paths:
  - .gsd/milestones/M005/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S02/tasks/T02-SUMMARY.md
duration: ~18 minutes (T01: 8m, T02: 10m)
verification_result: passed
completed_at: 2026-03-19
---

# S02: Page scaffold, sidebar, and source map

**32 stub MDX prompt pages are live, the Astro sidebar has a 4-group Prompts section, and page-source-map.json has 80 entries — `npm run build` succeeds at 104 pages with 12/12 tests passing.**

## What Happened

S02 had two tasks executed in sequence. T01 built the user-visible deliverables (MDX stubs + sidebar); T02 wired the infrastructure (source map + tests + build verification).

**T01 — MDX stubs and sidebar:**  
Read `content/generated/prompts.json` for all 32 slugs and group assignments, then used a Node.js generation script to create all 32 stub MDX files in one pass under `src/content/docs/prompts/`. Each file has valid Starlight frontmatter (`title`, `description`) and a `:::caution` scaffold notice indicating the content will be filled in by S03. The stub pattern mirrors what `manage-pages.mjs` produces for command stubs, keeping the page types consistent.

Inserted the Prompts sidebar section into `astro.config.mjs` with a surgical edit immediately before the `{ label: 'Recipes' }` block. The section uses a 2-level nesting: top-level "Prompts" label containing 4 sub-group items, each with its own label and items array. Sub-group order: Auto-mode Pipeline (10 prompts), Guided Variants (8), Commands (13), Foundation (1). `npm run build` at the end of T01 produced 104 pages with 0 errors.

**T02 — Source map, tests, and build verification:**  
Added Section 6 to `build-page-map.mjs` (after Section 5 "Other pages", before the validation summary). Section 6 reads `content/generated/prompts.json` via an `fs.existsSync` guard, iterates the 32 entries, and calls `addPage()` with key `prompts/{slug}.mdx` and a single source dep `src/resources/extensions/gsd/prompts/{name}.md`. Regenerating the map produced 80 total entries (48 core + 32 prompts), 941 total deps.

Fixed pre-existing test rot in `tests/page-map.test.mjs`: added 5 missing command slugs (`keys`, `logs`, `new-milestone`, `skip`, `undo`) to `COMMAND_SLUGS` in alphabetical order, updated the sanity check from 28 to 33, updated the page count assertion from 43 to 80. Added `PROMPT_SLUGS` (32 entries) and 3 new test assertions: all 32 `prompts/*.mdx` keys present, exactly 1 `.md` dep per prompt page, all deps starting with `src/resources/extensions/gsd/prompts/`. Final test suite: 12 tests, 0 failures.

## Verification

All four slice-level checks passed in the closer verification run:

| Check | Command | Result |
|-------|---------|--------|
| 32 MDX stubs | `ls src/content/docs/prompts/*.mdx \| wc -l` | **32** ✅ |
| Tests pass | `node --test tests/page-map.test.mjs` | **12/12, 0 failures** ✅ |
| 32 source-map entries | `python3 -c "... page-source-map.json ..."` | **32** ✅ |
| Build succeeds | `npm run build` | **104 pages, exit 0** ✅ |

## Requirements Advanced

- R057 — Prompt pages exist as navigable MDX pages with valid frontmatter, wired into the sidebar under 4 role-based groups. (Stubs only — real content is S03.)
- R058 — Pipeline position Mermaid diagram infrastructure is in place (page slots reserved). Content generation is S03.
- R051 — `page-source-map.json` coverage extended from 48 to 80 entries, adding all 32 prompt pages for staleness detection.

## Requirements Validated

None validated in this slice (stubs, not full content).

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None. Both tasks executed exactly as planned.

## Known Limitations

- Prompt page stubs have only scaffold placeholder content — no real What It Does prose, no Mermaid pipeline diagrams, no variable tables, no Used By links. All content is deferred to S03.
- Command backlinks ("Prompts used" section on command pages) are deferred to S04.
- `manage-pages.mjs` is not yet extended for prompt pages — stale detection via `npm run update` is deferred to S05.
- `npm run build` produces 104 pages but `page-source-map.json` tracks only 80 — the 24 untracked pages are non-source-mapped content (superpowers, user-guide, landing pages, etc.) that don't participate in the regeneration pipeline.

## Follow-ups

- S03 must replace all 32 stub files with authored content (What It Does, Mermaid diagram, variable table, Used By links). The stubs are currently passing `npm run build` only because Astro doesn't validate MDX body content beyond frontmatter.
- S04: 15 command pages need "Prompts used" sections. The prompt URL slugs are now confirmed — `/prompts/{slug}/` — safe to hardcode in command pages.
- S05: `manage-pages.mjs` extension for prompt directory should consume `prompts.json` and `page-source-map.json` as built in this slice.

## Files Created/Modified

- `src/content/docs/prompts/complete-milestone.mdx` — new stub
- `src/content/docs/prompts/complete-slice.mdx` — new stub
- `src/content/docs/prompts/discuss.mdx` — new stub
- `src/content/docs/prompts/discuss-headless.mdx` — new stub
- `src/content/docs/prompts/doctor-heal.mdx` — new stub
- `src/content/docs/prompts/execute-task.mdx` — new stub
- `src/content/docs/prompts/forensics.mdx` — new stub
- `src/content/docs/prompts/guided-complete-slice.mdx` — new stub
- `src/content/docs/prompts/guided-discuss-milestone.mdx` — new stub
- `src/content/docs/prompts/guided-discuss-slice.mdx` — new stub
- `src/content/docs/prompts/guided-execute-task.mdx` — new stub
- `src/content/docs/prompts/guided-plan-milestone.mdx` — new stub
- `src/content/docs/prompts/guided-plan-slice.mdx` — new stub
- `src/content/docs/prompts/guided-research-slice.mdx` — new stub
- `src/content/docs/prompts/guided-resume-task.mdx` — new stub
- `src/content/docs/prompts/heal-skill.mdx` — new stub
- `src/content/docs/prompts/plan-milestone.mdx` — new stub
- `src/content/docs/prompts/plan-slice.mdx` — new stub
- `src/content/docs/prompts/queue.mdx` — new stub
- `src/content/docs/prompts/quick-task.mdx` — new stub
- `src/content/docs/prompts/reassess-roadmap.mdx` — new stub
- `src/content/docs/prompts/replan-slice.mdx` — new stub
- `src/content/docs/prompts/research-milestone.mdx` — new stub
- `src/content/docs/prompts/research-slice.mdx` — new stub
- `src/content/docs/prompts/review-migration.mdx` — new stub
- `src/content/docs/prompts/rewrite-docs.mdx` — new stub
- `src/content/docs/prompts/run-uat.mdx` — new stub
- `src/content/docs/prompts/system.mdx` — new stub
- `src/content/docs/prompts/triage-captures.mdx` — new stub
- `src/content/docs/prompts/validate-milestone.mdx` — new stub
- `src/content/docs/prompts/workflow-start.mdx` — new stub
- `src/content/docs/prompts/worktree-merge.mdx` — new stub
- `astro.config.mjs` — added Prompts sidebar section (4 sub-groups, 32 entries) before Recipes
- `scripts/lib/build-page-map.mjs` — added Section 6 for prompt pages; updated header comment (48→80)
- `content/generated/page-source-map.json` — regenerated: 48 → 80 entries (+32 prompt pages)
- `tests/page-map.test.mjs` — fixed COMMAND_SLUGS (28→33), page count (43→80); added PROMPT_SLUGS and 3 new tests (12 total)

## Forward Intelligence

### What the next slice should know

- **S03 (content generation):** All 32 stub files follow a uniform pattern — frontmatter with `title` matching the prompt filename (without `.md`) and `description: "Prompt reference: {name}"`. The stub body is a single `:::caution` notice. S03 should replace the entire body (not just the caution block) with the 4-section structure (What It Does → Pipeline Position → Variables → Used By). The frontmatter `title` and `description` should be updated to something more useful than the placeholder.
- **S04 (command backlinks):** All 32 prompt page slugs are confirmed stable at `/prompts/{slug}/`. The slug list is in `content/generated/prompts.json` under the `slug` key. The `usedByCommands` field on each prompt entry already maps which command pages need updating.
- **S05 (pipeline integration):** `page-source-map.json` now has 32 `prompts/{slug}.mdx` entries, each with exactly 1 `.md` source dep at `src/resources/extensions/gsd/prompts/{name}.md`. The stale detection logic in `manage-pages.mjs` needs to handle this directory just like `commands/`.

### What's fragile

- **Sidebar position** — Prompts is inserted immediately before Recipes using an exact string match on `label: 'Recipes'`. If the Recipes label changes or is removed, the sidebar insertion logic in any future automation would need to be updated.
- **build-page-map.mjs Section 6** — uses `fs.existsSync('content/generated/prompts.json')` as a guard. If `prompts.json` is deleted or moved, prompt pages silently drop from the source map with no warning. The test suite would catch this (`node --test tests/page-map.test.mjs` would fail the "includes all 32 prompt pages" assertion).
- **Test suite COMMAND_SLUGS** — was stale (28 entries vs 33 actual) before T02 fixed it. Future command additions must update this array or the "includes all 33 command pages" test will catch the discrepancy (correctly). The fix pattern is: add the slug alphabetically to COMMAND_SLUGS, increment the sanity count.

### Authoritative diagnostics

- `node --test tests/page-map.test.mjs` — the primary health check. 12 tests cover page count, command page completeness, prompt page completeness, source dep format, and cross-cutting page dep counts. Any regression in page-source-map.json shows up here immediately.
- `node scripts/lib/build-page-map.mjs` — stdout reports `Page source map: N pages mapped, M total deps`. Regression: N < 80 means Section 6 is broken or prompts.json is absent.
- `npm run build` — Astro validates all MDX frontmatter at build time. A missing or malformed stub MDX produces a named build error. Currently: 104 pages, 0 errors.

### What assumptions changed

- **Build page count:** The slice plan said "80+ pages" but the actual build produces **104 pages**. The 24 extra pages are non-source-mapped pages already in the repo (superpowers/, user-guide/, etc.) that exist in `src/content/docs/` but aren't tracked in `page-source-map.json`. The 80-entry source map is correct — it covers exactly the pages that participate in the regeneration pipeline. Build count (104) and source-map count (80) are different things.
- **Test count:** The plan said "update page count assertion from 43 to 80" — this is the page-source-map count assertion, not the Astro build count. The test suite now has 12 tests (was 8 before T02), not the "8 tests" referenced in the plan.
