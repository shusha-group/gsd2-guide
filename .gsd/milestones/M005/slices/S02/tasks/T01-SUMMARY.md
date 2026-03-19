---
id: T01
parent: S02
milestone: M005
provides:
  - 32 stub MDX pages in src/content/docs/prompts/ (one per prompt slug)
  - Prompts sidebar section in astro.config.mjs with 4 nested sub-groups
key_files:
  - src/content/docs/prompts/*.mdx (32 files)
  - astro.config.mjs
key_decisions:
  - Used node script (not manual writes) to generate all 32 MDX stubs from prompts.json for consistency and correctness
  - Inserted Prompts sidebar between Commands and Recipes using exact anchor text match on `label: 'Recipes'`
patterns_established:
  - MDX stub format: frontmatter with title/description + :::caution scaffold notice (matches manage-pages.mjs pattern)
  - Sidebar sub-group nesting: top-level { label, items: [{ label, items }] } with 4 groups ordered Auto-mode Pipeline → Guided Variants → Commands → Foundation
observability_surfaces:
  - ls src/content/docs/prompts/*.mdx | wc -l → 32
  - grep -c "'/prompts/" astro.config.mjs → 32
  - npm run build → 104 pages built (32 new prompt stubs included)
duration: 8m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Create 32 prompt stub MDX pages and wire sidebar config

**Created 32 prompt stub MDX pages in `src/content/docs/prompts/` and wired a 4-group "Prompts" sidebar section into `astro.config.mjs`, with `npm run build` succeeding at 104 pages.**

## What Happened

Applied pre-flight fixes to S02-PLAN.md (added `## Observability / Diagnostics`) and T01-PLAN.md (added `## Observability Impact`) before beginning implementation.

Read `content/generated/prompts.json` to get all 32 slugs and group assignments. Used a Node.js script to generate all 32 MDX stubs from the JSON in one pass, ensuring each file has the correct `title`, `description`, and `:::caution` scaffold notice. Created `src/content/docs/prompts/` directory automatically.

Updated `astro.config.mjs` with a surgical edit: inserted the full Prompts section (4 nested sub-groups, 32 entries) immediately before `{ label: 'Recipes', ...}`. Sub-groups in order: Auto-mode Pipeline (10), Guided Variants (8), Commands (13), Foundation (1).

Ran `npm run build` which completed successfully at **104 pages** with 0 errors, confirming all 32 new prompt pages are valid and renderable.

## Verification

All 5 task-plan checks passed:

1. `ls src/content/docs/prompts/*.mdx | wc -l` → **32** ✅
2. `head -6 src/content/docs/prompts/execute-task.mdx` → valid frontmatter with `title: "execute-task"` and `description: "Prompt reference: execute-task"` ✅
3. `grep -c "'/prompts/" astro.config.mjs` → **32** ✅
4. `grep "label: 'Prompts'" astro.config.mjs` → match found ✅
5. `grep -A2 "label: 'Auto-mode Pipeline'" astro.config.mjs` → match found ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `ls src/content/docs/prompts/*.mdx \| wc -l` | 0 | ✅ pass (32) | <1s |
| 2 | `head -6 src/content/docs/prompts/execute-task.mdx` | 0 | ✅ pass | <1s |
| 3 | `grep -c "'/prompts/" astro.config.mjs` | 0 | ✅ pass (32) | <1s |
| 4 | `grep "label: 'Prompts'" astro.config.mjs` | 0 | ✅ pass | <1s |
| 5 | `grep -A2 "label: 'Auto-mode Pipeline'" astro.config.mjs` | 0 | ✅ pass | <1s |
| 6 | `npm run build` | 0 | ✅ pass (104 pages, 0 errors) | 9.3s |

**Slice-level checks status (intermediate task):**
- `ls src/content/docs/prompts/*.mdx | wc -l` → 32 ✅
- `node --test tests/page-map.test.mjs` → not yet (T02 creates/fixes tests)
- `python3 -c "... page-source-map.json prompts/ count"` → 0 (T02 extends build-page-map.mjs)
- `npm run build` → 0 (104 pages) ✅

## Diagnostics

- `ls src/content/docs/prompts/*.mdx | wc -l` — confirms all 32 stubs present
- `grep -c "'/prompts/" astro.config.mjs` — confirms all 32 sidebar entries wired
- `npm run build` — Astro errors on missing MDX; sidebar mis-wiring shows as 404s in dev server
- Each MDX file has standard Starlight frontmatter; Astro content collection validation runs at build time

## Deviations

None. Task executed exactly as planned.

## Known Issues

None.

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
- `astro.config.mjs` — added Prompts sidebar section with 4 sub-groups (32 entries)
- `.gsd/milestones/M005/slices/S02/S02-PLAN.md` — added Observability/Diagnostics section (pre-flight fix)
- `.gsd/milestones/M005/slices/S02/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
