# S04: Core workflow recipes — Research

**Date:** 2026-03-17

## Summary

This is straightforward content authoring following the patterns established in S01-S03. Six recipe pages need to be created in a new `src/content/docs/recipes/` directory, the sidebar in `astro.config.mjs` updated to include them, and each page authored with the same MDX + Mermaid + directory tree + terminal output pattern used throughout the site.

The existing "Recipes" sidebar section currently contains 8 generated guide pages (auto-mode, git-strategy, working-in-teams, etc.). The 6 new recipe pages are workflow-focused step-by-step guides — a different format. The sidebar needs restructuring: the new recipes should be added, and the existing items kept (they're valid guides that complement the recipes).

The recipes are (from the roadmap): fix a bug, make a small change without milestone ceremony, start a new milestone on an existing project, handle UAT failures, recover from errors, work in teams.

## Recommendation

Create a `src/content/docs/recipes/` directory with 6 `.mdx` files. Each recipe follows a consistent structure: scenario description, prerequisites, step-by-step commands, directory trees showing `.gsd/` state at key points, expected outcomes. Include one Mermaid flowchart per recipe showing the decision/workflow path. Use the Cookmate example project for consistency with the walkthrough.

Update the sidebar to add the 6 new recipe pages to the Recipes section alongside the existing guide entries. Keep existing items — they're complementary operational guides, not duplicates.

## Implementation Landscape

### Key Files

- `astro.config.mjs` — Sidebar config. Lines 64-74 define the Recipes section. Add 6 new entries pointing to `/recipes/<slug>/`. Keep existing 8 entries.
- `src/content/docs/recipes/fix-a-bug.mdx` — New. Step-by-step: discuss the bug, research it, `/gsd auto`, verify the fix, summarize.
- `src/content/docs/recipes/small-change.mdx` — New. `/gsd quick` workflow — when to use it, what it produces, how it differs from full milestone flow.
- `src/content/docs/recipes/new-milestone.mdx` — New. Starting a milestone on an existing project — `/gsd`, discuss, research, plan, auto.
- `src/content/docs/recipes/uat-failures.mdx` — New. What happens when UAT fails — the replan flow, blocker_discovered flag, re-execution cycle.
- `src/content/docs/recipes/error-recovery.mdx` — New. Using `/gsd doctor`, `/gsd forensics`, crash recovery locks, manual state repair.
- `src/content/docs/recipes/working-in-teams.mdx` — New. Team mode setup, unique milestone IDs, push branches, pre-merge checks, concurrent workflows.

### Patterns to Follow

**Recipe page structure** (consistent across all 6):
```
---
title: "Recipe: <Title>"
description: "<one-line description>"
---

## When to Use This

<1-2 paragraphs describing the scenario>

## Prerequisites

<what must exist before starting>

## Steps

<numbered steps with command examples, directory trees, and expected output>

## What Gets Created

<directory tree showing final .gsd/ state>

## Flow Diagram

<Mermaid flowchart showing decision/workflow path>
```

**Mermaid styling** — per-node style statements (not global init):
- Terminal nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- Normal steps: `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`
- Error/failure: `fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8`

**Content format** — Pure MDX, no Starlight component imports. Mermaid in fenced code blocks. Directory trees as indented text in code blocks. Terminal output as plain code blocks.

**Example project** — Use Cookmate for consistency (D032). Recipes reference scenarios from the Cookmate project where natural.

### Build Order

1. **T01: Create recipe pages** — Author all 6 recipe MDX files in `src/content/docs/recipes/`. This is the bulk of the work. Can be done as a single task since the pages are independent and follow the same pattern.
2. **T02: Sidebar and verification** — Add 6 recipe entries to `astro.config.mjs` sidebar. Run `npm run build` and `node scripts/check-links.mjs`. Verify Pagefind indexes the new pages.

Alternatively, T01 could be split into two tasks (3 recipes each) if the content volume is too large for one context window. Each recipe is ~100-150 lines, so 6 recipes is ~600-900 lines of authored content — this fits in one task but it's near the upper bound. The planner should decide based on its estimate.

### Content Source Material

The recipes draw from GSD source code already studied in S01-S03. Key sources for recipe accuracy:

- **Fix a bug:** `prompts/discuss.md`, `prompts/research-slice.md`, `prompts/execute-task.md` — the full lifecycle
- **Small change:** `prompts/quick-task.md` — `/gsd quick` flow, branch naming, artifact structure
- **New milestone:** `prompts/guided-discuss-milestone.md`, `prompts/plan-milestone.md` — milestone setup on existing project
- **UAT failures:** `prompts/run-uat.md`, `prompts/replan-slice.md`, `auto-dispatch.ts` lines 105-119 (UAT dispatch), 228-235 (replan dispatch) — the UAT → replan → re-execute cycle
- **Error recovery:** `prompts/doctor-heal.md`, `prompts/forensics.md`, `auto-recovery.ts`, `crash-recovery.ts` — doctor/forensics/crash lock flows
- **Working in teams:** Existing `working-in-teams.md` guide page (generated from GitHub docs) — covers mode:team, unique IDs, push branches, pre-merge checks. The recipe distills this into step-by-step with Cookmate context.

### Verification Approach

1. `npm run build` exits 0
2. `node scripts/check-links.mjs` — 0 broken links
3. 6 recipe files exist in `src/content/docs/recipes/`
4. 6 new sidebar entries in `astro.config.mjs` under Recipes section
5. Built output contains `/recipes/<slug>/index.html` for all 6 recipes
6. Pagefind indexes the recipe pages (search for "recipe" or "bug fix" returns results)

## Constraints

- Sidebar entries must be manually added to `astro.config.mjs` — there's no autogenerate for this section.
- Recipe pages live in `src/content/docs/recipes/` (hand-authored MDX), not in `content/generated/docs/` — they aren't managed by prebuild.
- Starlight link format: cross-references between recipes and command pages use `../../commands/quick/` etc. (the `../` prefix rule from KNOWLEDGE.md).
