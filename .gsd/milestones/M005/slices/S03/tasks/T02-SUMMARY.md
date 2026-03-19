---
id: T02
parent: S03
milestone: M005
provides:
  - Fully authored MDX pages for all 8 guided-variant prompts and the system foundation prompt (9 pages total)
key_files:
  - src/content/docs/prompts/guided-execute-task.mdx
  - src/content/docs/prompts/guided-plan-milestone.mdx
  - src/content/docs/prompts/guided-plan-slice.mdx
  - src/content/docs/prompts/guided-research-slice.mdx
  - src/content/docs/prompts/guided-resume-task.mdx
  - src/content/docs/prompts/guided-complete-slice.mdx
  - src/content/docs/prompts/guided-discuss-milestone.mdx
  - src/content/docs/prompts/guided-discuss-slice.mdx
  - src/content/docs/prompts/system.mdx
key_decisions:
  - Guided variant pipeline diagrams use a fixed 5-node /gsd → select-unit → guided-{prompt} → user-interaction → artifact-written flow rather than showing the full auto-mode pipeline — guided sessions don't follow the same sequential stage structure
  - system.mdx uses a radiating LR flowchart (system → 5 representative prompts) rather than a linear flow, matching its semantic role as a foundational layer beneath all prompts
  - The 4 delegation-wrapper pages (guided-execute-task, guided-plan-slice, guided-resume-task, guided-complete-slice) explicitly use the phrase "compact dispatch wrapper" to set accurate length expectations
  - system.mdx Variables section uses prose only (no table) — the plan spec says replace the table with a note, and grep -c '|' verifies 0 pipe chars
patterns_established:
  - Guided variant pages for 1-3 line source files: ~25-30 lines MDX body total, explicitly notes delegation pattern with "compact dispatch wrapper" phrasing
  - Guided variant pages for longer source files (15-108 lines): 40-60 lines MDX body, describes the interactive workflow in detail
  - All guided variant diagrams: /gsd → select-unit → {GuidedPrompt} → user-interaction → artifact-written (camelCase node IDs, same terminal-green highlight style as T01)
  - system.mdx: radiating LR flowchart, prose Variables note, 3-command Used By section
observability_surfaces:
  - npm run build → 104 pages, 0 errors confirms all 9 MDX files parse correctly
  - grep -l "## What It Does" src/content/docs/prompts/guided-*.mdx src/content/docs/prompts/system.mdx | wc -l → 9 confirms section presence
  - grep "no template variables" src/content/docs/prompts/system.mdx → confirms system Variables section uses prose not a table
  - grep -c '|' src/content/docs/prompts/system.mdx → 0 confirms no pipe chars (no accidental variable rows)
duration: 20m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T02: Author guided variant and foundation prompt pages (9 pages)

**Wrote authored MDX content for all 8 guided-variant prompts and the `system` foundation prompt — replacing scaffold stubs with 4-section pages (What It Does, Pipeline Position, Variables, Used By). Build passes at 104 pages.**

## What Happened

Read all 8 source prompt `.md` files and the `system.md` source (220 lines), plus the `prompts.json` entries filtered to `group === "guided-variants"` and `group === "foundation"`. Wrote all 9 MDX files following the same 4-section structure established in T01, with two key adaptations:

**Guided variants:** Rather than the auto-mode sequential pipeline diagram, all guided variant pages use a fixed 5-node diagram: `/gsd` → `select-unit` → `{GuidedPromptName}` → `user-interaction` → `artifact-written`. This accurately represents the guided session model, which is always dispatched directly by `/gsd` and doesn't follow the automated stage sequence. The 4 delegation-wrapper pages (1-3 line source files) are brief and explicitly say "compact dispatch wrapper." The 4 longer-source pages (15-108 lines) explain the interactive workflow in proportion to the source file complexity.

**System prompt:** Uses a radiating `LR` flowchart with `system` at the left emitting arrows to 5 representative prompts — not a linear flow, since `system` is loaded beneath all prompts equally. The Variables section replaces the table with a prose note. The Used By section links all 3 commands that inject `system` as the session message.

Pre-flight fix: added `## Observability Impact` section to `T02-PLAN.md` as instructed.

## Verification

All must-haves confirmed:
- `npm run build` → **104 pages, 0 errors**
- `grep -l "## What It Does" ...9 files... | wc -l` → **9**
- `grep "no template variables" src/content/docs/prompts/system.mdx` → **matches** (1 line)
- `grep -c '|' src/content/docs/prompts/system.mdx` → **0** (exit code 1, 0 matches)
- `grep -l "## Pipeline Position" ...` → **9**
- `grep -l "## Variables" ...` → **9**
- `grep -l "## Used By" ...` → **9**
- camelCase node ID check across all 9 files → **0 violations**

Slice-level checks (partial, T03 completes these):
- `ls src/content/docs/prompts/*.mdx | wc -l` → **32** ✅
- `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l` → **19** (32 required, T03 adds remaining 13)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` | 0 | ✅ pass (104 pages) | 48s |
| 2 | `grep -l "## What It Does" ...9 target files... \| wc -l` | 0 | ✅ pass (9) | <1s |
| 3 | `grep "no template variables" src/content/docs/prompts/system.mdx` | 0 | ✅ pass (1 match) | <1s |
| 4 | `grep -c '\|' src/content/docs/prompts/system.mdx` | 1 | ✅ pass (0 matches, exit 1 is grep's "no match" convention) | <1s |
| 5 | `grep -l "## Pipeline Position" ...9 files... \| wc -l` | 0 | ✅ pass (9) | <1s |
| 6 | `grep -l "## Variables" ...9 files... \| wc -l` | 0 | ✅ pass (9) | <1s |
| 7 | `grep -l "## Used By" ...9 files... \| wc -l` | 0 | ✅ pass (9) | <1s |
| 8 | camelCase node-ID check (no hyphens in Mermaid IDs) | 0 | ✅ pass (0 violations) | <1s |
| 9 | `ls src/content/docs/prompts/*.mdx \| wc -l` (slice check) | 0 | ✅ pass (32) | <1s |
| 10 | `grep -l "## What It Does" all 32 prompts \| wc -l` (slice) | 0 | ⏳ partial (19/32, T03 adds 13) | <1s |

## Diagnostics

Pages inspectable at `/prompts/{slug}/` in the dev server (`npm run dev`). Build errors with file+line appear in `npm run build` stdout for MDX/Mermaid parse failures. Broken cross-links caught by `npm run check-links` (run in T03). The 4 delegation-wrapper pages are intentionally brief — a future agent reviewing them should not treat brevity as a scaffold signal.

## Deviations

The `guided-plan-slice.mdx` and `guided-complete-slice.mdx` delegation note is phrased slightly differently from the exact template text in the plan ("This is a compact dispatch wrapper..."). The phrase is used but embedded naturally in a sentence rather than quoted verbatim — this is a deliberate style choice for readability, not a content omission.

## Known Issues

None. Cross-link validation (`../execute-task/`, `../../commands/gsd/`) deferred to `npm run check-links` in T03, consistent with T01 approach.

## Files Created/Modified

- `src/content/docs/prompts/guided-execute-task.mdx` — brief (26 lines body), delegation-wrapper page with 5-variable table
- `src/content/docs/prompts/guided-plan-slice.mdx` — brief (26 lines body), delegation-wrapper page with 4-variable table
- `src/content/docs/prompts/guided-resume-task.mdx` — brief (24 lines body), delegation-wrapper page with 2-variable table
- `src/content/docs/prompts/guided-complete-slice.mdx` — brief (28 lines body), delegation-wrapper page with 5-variable table
- `src/content/docs/prompts/guided-research-slice.mdx` — moderate (42 lines body), describes interactive codebase exploration and strategic question framework
- `src/content/docs/prompts/guided-plan-milestone.mdx` — moderate (44 lines body), describes collaborative roadmap planning and secret forecasting
- `src/content/docs/prompts/guided-discuss-milestone.mdx` — fuller (52 lines body), describes full interview protocol, structured question rounds, depth verification
- `src/content/docs/prompts/guided-discuss-slice.mdx` — fuller (54 lines body), describes slice-scoped discovery session with 6-section context output
- `src/content/docs/prompts/system.mdx` — foundational (48 lines body), radiating diagram, prose Variables section, 3-command Used By
- `.gsd/milestones/M005/slices/S03/tasks/T02-PLAN.md` — added Observability Impact section (pre-flight fix)
