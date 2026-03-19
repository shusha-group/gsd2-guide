---
id: T01
parent: S03
milestone: M005
provides:
  - Fully authored MDX pages for all 10 auto-mode-pipeline prompts
key_files:
  - src/content/docs/prompts/research-milestone.mdx
  - src/content/docs/prompts/research-slice.mdx
  - src/content/docs/prompts/plan-milestone.mdx
  - src/content/docs/prompts/plan-slice.mdx
  - src/content/docs/prompts/execute-task.mdx
  - src/content/docs/prompts/replan-slice.mdx
  - src/content/docs/prompts/complete-slice.mdx
  - src/content/docs/prompts/reassess-roadmap.mdx
  - src/content/docs/prompts/complete-milestone.mdx
  - src/content/docs/prompts/validate-milestone.mdx
key_decisions:
  - Mermaid diagrams show 5-7 nodes (current prompt + 2-3 neighbors on each side) rather than the full 10-stage pipeline — keeps diagrams readable and contextually focused
  - execute-task diagram includes a looping edge from execute-task back to itself (via replan-slice) to accurately represent the retry/replan cycle
  - validate-milestone diagram shows the remediation loop (validate → add-slices → research → validate again) since that's the most important behavioral nuance of that stage
  - Used camelCase node IDs (e.g. PlanSlice, ExecuteTask) with quoted hyphenated display labels (e.g. ["plan-slice"]) per the formatting spec
patterns_established:
  - Each prompt page follows the 4-section structure: What It Does (2-3 paragraphs, behavioral prose) → Pipeline Position (Mermaid + prose) → Variables (table from prompts.json) → Used By (links to command pages)
  - Mermaid highlight style: current prompt uses fill:#0d180d,stroke:#39ff14,color:#39ff14; neighbors use fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8
  - Decision/branch nodes in Mermaid diagrams (blocker?, more tasks?, etc.) use the same neighbor style rather than a third error color — keeps the pipeline diagrams clean
observability_surfaces:
  - npm run build stdout reports page count (104) and any MDX/Mermaid parse errors
  - grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l — quick section presence check
duration: 25m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Author auto-mode pipeline prompt pages (10 pages)

**Wrote authored MDX content for all 10 auto-mode-pipeline prompts — What It Does prose, Mermaid pipeline position diagrams, variable tables from prompts.json, and Used By links — replacing scaffold stubs. Build passes at 104 pages.**

## What Happened

Read all 10 source prompt `.md` files from the gsd-pi package and the corresponding `prompts.json` entries, then wrote each MDX file following the D056 4-section structure. The pipeline position diagrams show 5-7 nodes: the current prompt highlighted in terminal green, with 2-3 immediate neighbors on each side in the darker neighbor style. All node IDs are camelCase with hyphenated display labels.

Pre-flight observability sections were added to both `S03-PLAN.md` (Observability / Diagnostics) and `T01-PLAN.md` (Observability Impact) before beginning implementation.

Key content decisions: the `execute-task` diagram accurately models the retry/replan loop since that's the defining behavioral nuance of that stage. The `validate-milestone` diagram shows the full remediation cycle. The `replan-slice` diagram focuses on the blocker-triggered gate between two `execute-task` dispatches, which is its entire behavioral context.

## Verification

All must-haves confirmed by running:
- `npm run build` → **104 pages, 0 errors** (same page count as before, no new pages introduced by replacing stubs)
- `grep -l "## What It Does" src/content/docs/prompts/{execute-task,...,validate-milestone}.mdx | wc -l` → **10**
- `grep -l "## Pipeline Position" ...` → **10**
- `grep -l "## Variables" ...` → **10**
- `grep -l "## Used By" ...` → **10**
- `grep -c '|' src/content/docs/prompts/execute-task.mdx` → **22** (≥18 required: header + separator + 16 rows)
- `grep -c 'fill:#0d180d' src/content/docs/prompts/execute-task.mdx` → **1**
- Hyphen-in-node-ID check for all 10 files → **0 violations**

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` | 0 | ✅ pass | 20s |
| 2 | `grep -l "## What It Does" src/content/docs/prompts/{10 files} \| wc -l` | 0 | ✅ pass (10) | <1s |
| 3 | `grep -c '\|' src/content/docs/prompts/execute-task.mdx` | 0 | ✅ pass (22≥18) | <1s |
| 4 | `grep -c 'fill:#0d180d' src/content/docs/prompts/execute-task.mdx` | 0 | ✅ pass (1) | <1s |
| 5 | Hyphen-in-node-ID check (all 10 files) | 0 | ✅ pass (0 violations) | <1s |

## Diagnostics

Pages are inspectable at `/prompts/{slug}/` in the dev server (`npm run dev`). Build errors with file+line appear in `npm run build` stdout if MDX frontmatter or Mermaid code fences are malformed. Broken cross-links will surface in `npm run check-links` (run in T03 final verification).

## Deviations

None. All 10 files follow the plan exactly. The `hooks` command link in `execute-task.mdx` was verified to exist (`src/content/docs/commands/hooks.mdx` present).

## Known Issues

None. `npm run check-links` is deferred to T03 (the final task in the slice) per the slice plan — it validates cross-links across all 32 prompt pages together.

## Files Created/Modified

- `src/content/docs/prompts/research-milestone.mdx` — fully authored: What It Does, Pipeline Position, 7-variable table, Used By auto
- `src/content/docs/prompts/research-slice.mdx` — fully authored: What It Does, Pipeline Position, 10-variable table, Used By auto
- `src/content/docs/prompts/plan-milestone.mdx` — fully authored: What It Does, Pipeline Position, 11-variable table, Used By auto
- `src/content/docs/prompts/plan-slice.mdx` — fully authored: What It Does, Pipeline Position, 11-variable table, Used By auto
- `src/content/docs/prompts/execute-task.mdx` — fully authored: What It Does, Pipeline Position, 16-variable table, Used By auto + hooks
- `src/content/docs/prompts/replan-slice.mdx` — fully authored: What It Does, Pipeline Position, 8-variable table, Used By auto
- `src/content/docs/prompts/complete-slice.mdx` — fully authored: What It Does, Pipeline Position, 8-variable table, Used By auto
- `src/content/docs/prompts/reassess-roadmap.mdx` — fully authored: What It Does, Pipeline Position, 8-variable table, Used By auto
- `src/content/docs/prompts/complete-milestone.mdx` — fully authored: What It Does, Pipeline Position, 6-variable table, Used By auto
- `src/content/docs/prompts/validate-milestone.mdx` — fully authored: What It Does, Pipeline Position, 7-variable table, Used By auto
- `.gsd/milestones/M005/slices/S03/S03-PLAN.md` — added Observability / Diagnostics section (pre-flight fix)
- `.gsd/milestones/M005/slices/S03/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
