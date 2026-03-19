---
id: S03
parent: M005
milestone: M005
provides:
  - All 32 prompt MDX pages with fully authored 4-section content (What It Does, Pipeline Position, Variables, Used By)
  - Mermaid pipeline position diagrams for all 32 prompts using terminal-native styling
  - Variable tables populated from prompts.json data
  - Used By sections with correct relative links to command pages
requires:
  - slice: S01
    provides: prompts.json (32 entries with name, slug, group, variables, pipelinePosition, usedByCommands)
  - slice: S02
    provides: 32 stub MDX files in src/content/docs/prompts/ with valid frontmatter and placeholder sections
affects:
  - S04 (command page backlinks — prompt page URLs confirmed stable at /prompts/{slug}/)
  - S05 (pipeline integration — prompt pages are real content that can be detected as stale)
key_files:
  - src/content/docs/prompts/execute-task.mdx
  - src/content/docs/prompts/research-milestone.mdx
  - src/content/docs/prompts/research-slice.mdx
  - src/content/docs/prompts/plan-milestone.mdx
  - src/content/docs/prompts/plan-slice.mdx
  - src/content/docs/prompts/complete-slice.mdx
  - src/content/docs/prompts/complete-milestone.mdx
  - src/content/docs/prompts/reassess-roadmap.mdx
  - src/content/docs/prompts/replan-slice.mdx
  - src/content/docs/prompts/validate-milestone.mdx
  - src/content/docs/prompts/guided-execute-task.mdx
  - src/content/docs/prompts/guided-plan-milestone.mdx
  - src/content/docs/prompts/guided-plan-slice.mdx
  - src/content/docs/prompts/guided-research-slice.mdx
  - src/content/docs/prompts/guided-resume-task.mdx
  - src/content/docs/prompts/guided-complete-slice.mdx
  - src/content/docs/prompts/guided-discuss-milestone.mdx
  - src/content/docs/prompts/guided-discuss-slice.mdx
  - src/content/docs/prompts/system.mdx
  - src/content/docs/prompts/discuss.mdx
  - src/content/docs/prompts/discuss-headless.mdx
  - src/content/docs/prompts/doctor-heal.mdx
  - src/content/docs/prompts/forensics.mdx
  - src/content/docs/prompts/heal-skill.mdx
  - src/content/docs/prompts/queue.mdx
  - src/content/docs/prompts/quick-task.mdx
  - src/content/docs/prompts/review-migration.mdx
  - src/content/docs/prompts/rewrite-docs.mdx
  - src/content/docs/prompts/run-uat.mdx
  - src/content/docs/prompts/triage-captures.mdx
  - src/content/docs/prompts/workflow-start.mdx
  - src/content/docs/prompts/worktree-merge.mdx
key_decisions:
  - Mermaid diagrams show 5-7 nodes (current prompt + 2-3 neighbors) rather than the full pipeline — readability over completeness
  - execute-task diagram includes a looping edge back through replan-slice to model the retry cycle accurately
  - validate-milestone diagram shows the full remediation loop (add-slices → research → validate again)
  - Guided variant diagrams use a fixed 5-node pattern (/gsd → select-unit → guided-{type} → user-interaction → artifact-written) not the auto-mode sequential pipeline
  - system.mdx uses a radiating LR flowchart (system → 5 representative prompts) and a prose Variables note (no table)
  - workflow-start and worktree-merge Used By sections note "Not directly invoked by a user-facing command — triggered internally by GSD workflows" rather than leaving empty
  - Template variable strings in MDX prose (e.g. {{milestoneId}}) must be wrapped in backticks — MDX interprets double curly braces as JSX, causing a ReferenceError at build time
  - Delegation-wrapper pages (1-3 line source files) are intentionally brief (~25-30 lines body) and explicitly use "compact dispatch wrapper" phrasing
  - rewrite-docs and run-uat use dispatcher-oriented diagrams (auto-mode context) not user-invocation diagrams, since they are dispatched internally not by direct command
patterns_established:
  - 4-section structure: What It Does (behavioral prose) → Pipeline Position (Mermaid + prose) → Variables (table) → Used By (links or internal-trigger note)
  - Mermaid highlight style: current prompt uses fill:#0d180d,stroke:#39ff14,color:#39ff14; neighbors use fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8
  - Decision/branch nodes (blocker?, more tasks?, etc.) use the neighbor fill style — no third error color
  - camelCase node IDs with quoted hyphenated display labels (e.g. ExecuteTask["execute-task"])
  - Relative link formats: command pages → ../../commands/{slug}/, sibling prompts → ../{slug}/
  - Guided variant pages: brief for delegation wrappers, proportionally longer for interactive workflow prompts
observability_surfaces:
  - npm run build stdout reports page count (104) and file+line context for any MDX/Mermaid parse failures
  - npm run check-links reports every broken internal link with source file + link text (10380 links checked)
  - grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l → quick presence check (should be 32)
  - grep -c '|' src/content/docs/prompts/execute-task.mdx → row count in variable table (should be ≥18)
drill_down_paths:
  - .gsd/milestones/M005/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M005/slices/S03/tasks/T03-SUMMARY.md
duration: ~90m (T01: 25m, T02: 20m, T03: 45m)
verification_result: passed
completed_at: 2026-03-19
---

# S03: Prompt page content generation

**All 32 prompt pages have fully authored 4-section content — behavioral prose, Mermaid pipeline position diagrams, variable tables, and Used By links — replacing the S02 scaffold stubs. `npm run build` passes at 104 pages (0 errors). `npm run check-links` passes with 10380 links verified (0 broken).**

## What Happened

S03 executed across three tasks, each targeting a distinct group of prompts defined by the D057 group taxonomy:

**T01 — Auto-mode pipeline (10 pages):** Read all 10 source `.md` files from the gsd-pi package, cross-referenced `prompts.json` for variable data, and wrote the 4-section MDX pages. These are the most complex pages — their Mermaid diagrams show 5-7 nodes of the pipeline loop with the current prompt highlighted in terminal green. Key behavioral nuances were captured in the diagrams: `execute-task` has a looping edge through `replan-slice` to represent the retry cycle; `validate-milestone` shows the full remediation loop. Build passed at 104 pages.

**T02 — Guided variants + foundation (9 pages):** Wrote 8 guided variant pages and `system.mdx`. Guided variants diverge from the auto-mode pipeline in diagram structure — they use a fixed 5-node session model (`/gsd → select-unit → guided-{type} → user-interaction → artifact-written`) since guided sessions are always dispatched directly by `/gsd`, not via the sequential stage loop. The 4 delegation-wrapper pages (1-3 line source files) are intentionally brief, explicitly noting the "compact dispatch wrapper" pattern. `system.mdx` uses a radiating LR diagram (system pointing to 5 representative prompts) and replaces the variable table with a prose note, since system has no template variables.

**T03 — Command prompts (13 pages) + final validation:** Wrote all 13 command-group prompt pages. Two prompts (`rewrite-docs`, `run-uat`) are dispatched by auto-mode rather than user commands, so their diagrams show the auto-mode dispatcher context. Two prompts (`workflow-start`, `worktree-merge`) have empty `usedByCommands` — their Used By sections explicitly state they're triggered internally. One unplanned debugging cycle: first build failed with `ReferenceError: milestoneId is not defined` in `discuss-headless.mdx`. Root cause: `{{milestoneId}}` in MDX prose is interpreted as `{milestoneId}` JSX expression. Fixed by wrapping all template-variable literals in backtick code spans across three files. The fix was documented in `.gsd/KNOWLEDGE.md`. Second build passed cleanly, and `npm run check-links` confirmed 0 broken links across all 10380 internal links.

## Verification

All slice plan checks passed:

| Check | Expected | Result |
|-------|----------|--------|
| `npm run build` | 104 pages, 0 errors | ✅ 104 pages, 0 errors |
| `npm run check-links` | exit 0, 0 broken | ✅ 10380 links, 0 broken |
| `ls src/content/docs/prompts/*.mdx \| wc -l` | 32 | ✅ 32 |
| `grep -l "## What It Does" *.mdx \| wc -l` | 32 | ✅ 32 |
| `grep -l "## Pipeline Position" *.mdx \| wc -l` | 32 | ✅ 32 |
| `grep -l "## Variables" *.mdx \| wc -l` | 32 | ✅ 32 |
| `grep -l "## Used By" *.mdx \| wc -l` | 32 | ✅ 32 |
| `grep -c '\|' execute-task.mdx` | ≥18 | ✅ 22 |
| `grep "no template variables" system.mdx` | matches | ✅ matches |
| `grep "Not directly invoked" workflow-start.mdx` | matches | ✅ matches |
| `grep "Not directly invoked" worktree-merge.mdx` | matches | ✅ matches |

## Requirements Advanced

- R057 — All 32 prompt pages now have authored content fulfilling the per-prompt deep-dive requirement
- R058 — Mermaid pipeline position diagrams present on all 32 pages with terminal-native styling
- R059 — Variable tables populated from prompts.json on all 32 pages (except system.mdx which uses prose)
- R060 — "Used By" sections on all 32 pages with links to command pages (or internal-trigger notes)
- R006 — Terminal-native Mermaid styling extended to 32 new prompt pages (phosphor green highlight, dark fills)
- R031 — Visual documentation approach extended: 32 new Mermaid diagrams showing pipeline positions

## Requirements Validated

- R057, R058, R059, R060 — The full set of prompt page content requirements is now provable: 32 pages exist with all 4 required sections, `npm run build` and `npm run check-links` both pass clean.

## New Requirements Surfaced

- None.

## Requirements Invalidated or Re-scoped

- None.

## Deviations

**MDX curly-brace escaping (T03):** First build attempt failed due to `{{milestoneId}}` in prose MDX. This was not anticipated in the plan. Fixed by wrapping template-variable literals in backticks across three files (`discuss-headless.mdx`, `quick-task.mdx`, `worktree-merge.mdx`). Added to `KNOWLEDGE.md` so future slices authoring MDX that quotes GSD prompt template syntax don't repeat the debugging cycle.

All other work followed the plan exactly. No structural deviations — same page count (104), same 4-section structure, same Mermaid highlight colors.

## Known Limitations

- The Mermaid diagrams show a simplified 5-7 node view of the pipeline, not the complete 10-stage auto-mode loop. This is intentional for readability, but readers who want the full pipeline picture need to consult the auto-mode documentation page.
- Variable description quality depends on the prose written during S01's `prompts.json` authoring. The descriptions are readable and accurate, but they were derived from reading source `.md` files — edge cases or implicit behaviors that aren't documented in the source prompt may be missing.
- Prompt→prompt cross-links (e.g. `execute-task` linking to `replan-slice`) exist in the diagrams' prose context but are not separately validated as navigable links in the current test suite (they are caught by `npm run check-links`, which passed).

## Follow-ups

- S04 can safely begin: all 32 prompt page URLs are stable at `/prompts/{slug}/` and confirmed valid by `check-links`.
- S05 pipeline integration: `workflow-start` and `worktree-merge` have empty `usedByCommands` — the pipeline's stale-detection logic for these pages should rely on the prompt `.md` source file hash only, not on command backlinks.
- If a new prompt is added to gsd-pi, the S05 `manage-pages.mjs` extension (once built) will auto-generate a stub; the stub must then have its content replaced following the 4-section structure established here.

## Files Created/Modified

**Auto-mode pipeline (10 files):**
- `src/content/docs/prompts/research-milestone.mdx` — 7-variable table, pipeline loop diagram (stage: research)
- `src/content/docs/prompts/research-slice.mdx` — 10-variable table, pipeline loop diagram (stage: research)
- `src/content/docs/prompts/plan-milestone.mdx` — 11-variable table, pipeline loop diagram (stage: plan)
- `src/content/docs/prompts/plan-slice.mdx` — 11-variable table, pipeline loop diagram (stage: plan)
- `src/content/docs/prompts/execute-task.mdx` — 16-variable table, pipeline loop diagram with retry edge
- `src/content/docs/prompts/replan-slice.mdx` — 8-variable table, pipeline loop diagram (gate: blocker)
- `src/content/docs/prompts/complete-slice.mdx` — 8-variable table, pipeline loop diagram (stage: complete)
- `src/content/docs/prompts/reassess-roadmap.mdx` — 8-variable table, pipeline loop diagram (stage: reassess)
- `src/content/docs/prompts/complete-milestone.mdx` — 6-variable table, pipeline loop diagram (stage: close)
- `src/content/docs/prompts/validate-milestone.mdx` — 7-variable table, pipeline loop with remediation loop

**Guided variants (8 files):**
- `src/content/docs/prompts/guided-execute-task.mdx` — brief (5-variable), delegation wrapper
- `src/content/docs/prompts/guided-plan-milestone.mdx` — moderate (3-variable), collaborative roadmap planning
- `src/content/docs/prompts/guided-plan-slice.mdx` — brief (4-variable), delegation wrapper
- `src/content/docs/prompts/guided-research-slice.mdx` — moderate (2-variable), interactive codebase exploration
- `src/content/docs/prompts/guided-resume-task.mdx` — brief (2-variable), delegation wrapper
- `src/content/docs/prompts/guided-complete-slice.mdx` — brief (5-variable), delegation wrapper
- `src/content/docs/prompts/guided-discuss-milestone.mdx` — fuller (2-variable), interview protocol with depth verification
- `src/content/docs/prompts/guided-discuss-slice.mdx` — fuller (2-variable), slice-scoped discovery with 6-section context output

**Foundation (1 file):**
- `src/content/docs/prompts/system.mdx` — radiating LR diagram, prose Variables note, 3-command Used By

**Command prompts (13 files):**
- `src/content/docs/prompts/discuss.mdx` — 7-variable, interactive milestone planning, used by gsd/discuss/steer
- `src/content/docs/prompts/discuss-headless.mdx` — 7-variable, headless milestone creation, used by headless
- `src/content/docs/prompts/doctor-heal.mdx` — 4-variable, workspace healing, used by doctor
- `src/content/docs/prompts/forensics.mdx` — 3-variable, forensic investigation, used by forensics
- `src/content/docs/prompts/heal-skill.mdx` — 4-variable, skill drift analysis, used by skill-health
- `src/content/docs/prompts/queue.mdx` — 4-variable, roadmap queuing, used by queue
- `src/content/docs/prompts/quick-task.mdx` — 6-variable, lightweight task execution, used by quick
- `src/content/docs/prompts/review-migration.mdx` — 3-variable, migration audit, used by migrate
- `src/content/docs/prompts/rewrite-docs.mdx` — 5-variable, documentation refresh, dispatched by auto-mode
- `src/content/docs/prompts/run-uat.mdx` — 7-variable, slice UAT execution, dispatched by auto-mode
- `src/content/docs/prompts/triage-captures.mdx` — 3-variable, capture triage, used by capture/triage
- `src/content/docs/prompts/workflow-start.mdx` — 10-variable, internal trigger only
- `src/content/docs/prompts/worktree-merge.mdx` — 11-variable, internal trigger only

**Support files:**
- `.gsd/KNOWLEDGE.md` — appended MDX curly-brace escaping pattern ({{variable}} → backtick wrapping)

## Forward Intelligence

### What the next slice should know
- All 32 prompt page URLs are `/prompts/{slug}/` — these are now confirmed stable and validated by `check-links`. S04 can safely write command pages that link to them.
- The relative link format for prompt→command links is `../../commands/{slug}/` (two `../` levels up from `prompts/` subdirectory). The format for command→prompt links will be `../prompts/{slug}/` (one `../` up from `commands/` subdirectory). These are the formats already used and validated in the 32 existing prompt pages.
- `prompts.json` `usedByCommands` arrays are the authoritative source for which command pages need backlinks. The 13 command-group prompts link to 15 unique command slugs — the `usedByCommands` field in each prompt's JSON entry is the ground truth S04 should read.
- `workflow-start` and `worktree-merge` have `usedByCommands: []` — their prompt pages explicitly note internal triggering. No command pages need backlinks to these two prompts.

### What's fragile
- MDX curly-brace escaping — any future prompt page that quotes GSD template syntax (e.g. `"Milestone {{milestoneId}} ready."`) will break the build unless the curly-brace literal is wrapped in backticks. The error surfaces at build time as `ReferenceError: X is not defined`, not at lint time. KNOWLEDGE.md documents the fix.
- Mermaid node ID hygiene — hyphens in Mermaid node IDs (`execute-task` as a bare node ID) cause silent diagram breakage, not build errors. All 32 existing pages use camelCase IDs (e.g. `ExecuteTask["execute-task"]`). Future edits to these pages must preserve this pattern.
- Variable description quality is bounded by the S01 `prompts.json` authoring. If `prompts.json` variable descriptions are inaccurate or vague, those inaccuracies propagate directly into the prompt page variable tables. The tables are not independently verified for semantic accuracy — only for structural correctness.

### Authoritative diagnostics
- `npm run check-links` — catches all broken cross-links including prompt→command, prompt→prompt, and command→prompt. This is the primary correctness signal after any link-related changes.
- `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l` — quick structural health check; should always return 32.
- `npm run build` stdout — reports page count and surfaces MDX/Mermaid syntax errors with file+line context from prerender `.mjs` chunk stack traces.

### What assumptions changed
- Original assumption: guided variant pages would reference the auto-mode pipeline diagrams. Actual: guided variants use a completely different 5-node session diagram because guided mode doesn't follow the auto-mode stage sequence at all. This produced more accurate documentation but required a different Mermaid template per group.
- Original assumption: all 32 pages would take equal effort. Actual: guided-discuss-milestone and guided-discuss-slice took proportionally more prose effort (50+ lines each) because their source files are 100+ lines with a rich interactive protocol. The 4 delegation-wrapper pages were very fast (~20 lines each).
