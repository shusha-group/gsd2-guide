---
id: T02
parent: S04
milestone: M002
provides:
  - 3 recipe MDX pages covering GSD recovery and collaboration workflows (uat-failures, error-recovery, working-in-teams)
key_files:
  - src/content/docs/recipes/uat-failures.mdx
  - src/content/docs/recipes/error-recovery.mdx
  - src/content/docs/recipes/working-in-teams.mdx
key_decisions:
  - Used special characters in search queries as the UAT failure scenario — demonstrates a realistic gap between task-level and acceptance-level verification
  - Used rate limit / tool error as the crash scenario — common real-world failure mode
  - Used Alice and Bob dual-developer narrative for the team recipe — makes concurrent workflow tangible
patterns_established:
  - Recovery recipe structure follows same template as happy-path recipes from T01 — When to Use This, Prerequisites, Steps, What Gets Created, Flow Diagram
  - UAT recipe shows both the failure state and the post-recovery state directory trees side by side
observability_surfaces:
  - none — static documentation pages only
duration: ~20m
verification_result: passed
completed_at: 2025-03-17
blocker_discovered: false
---

# T02: Author recovery and collaboration recipe pages

**Created 3 recipe MDX pages covering GSD recovery and collaboration workflows — UAT failure handling, error recovery with doctor/forensics, and team-mode parallel development.**

## What Happened

Authored three recipe pages following the same structure established in T01. Read the actual GSD source prompts (`run-uat.md`, `replan-slice.md`, `doctor-heal.md`, `forensics.md`) to ensure technical accuracy — the UAT recipe accurately reflects the PASS/FAIL/PARTIAL verdict system and the replan's constraint of preserving completed tasks; the error recovery recipe reflects doctor's deterministic-then-heal flow and forensics' structured investigation approach; the team recipe draws from the existing `working-in-teams.md` guide for accurate preferences and gitignore patterns.

Each recipe uses Cookmate as the example project with a concrete scenario: special characters breaking search for UAT failures, rate limit crash for error recovery, and Alice+Bob concurrent development for teams.

## Verification

- `ls src/content/docs/recipes/*.mdx | wc -l` → 6 ✓
- Each file has `---` frontmatter with `title` and `description` ✓
- `grep -l 'mermaid' ...` for all 3 files → 3 ✓
- Each file has exactly 1 `mermaid` code block ✓
- Mermaid theme uses correct colors: terminal nodes `fill:#0d180d`, normal nodes `fill:#1a3a1a` ✓
- All 5 required sections present in each file (When to Use This, Prerequisites, Steps, What Gets Created, Flow Diagram) ✓
- Cross-references use `../../commands/<slug>/` format ✓
- No Starlight component imports ✓
- Sidebar entries: 0 (expected — T03's responsibility)

## Diagnostics

- Frontmatter: `head -5 src/content/docs/recipes/{uat-failures,error-recovery,working-in-teams}.mdx`
- Mermaid presence: `grep -l 'mermaid' src/content/docs/recipes/*.mdx`
- Cross-references: `grep -n '../../commands/' src/content/docs/recipes/*.mdx`
- If Mermaid renders as raw text in browser, check for syntax errors in the code block — build won't catch these

## Deviations

- Added cross-reference from working-in-teams recipe back to the existing Working in Teams guide page — not in the plan but consistent with how T01's fix-a-bug recipe references the small-change recipe.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/recipes/uat-failures.mdx` — UAT failure/replan recipe with Mermaid flowchart
- `src/content/docs/recipes/error-recovery.mdx` — Error recovery recipe covering doctor, forensics, and manual repair
- `src/content/docs/recipes/working-in-teams.mdx` — Team collaboration recipe covering mode setup, parallel milestones, and merging
- `.gsd/milestones/M002/slices/S04/S04-PLAN.md` — Added failure-path verification steps (pre-flight fix)
- `.gsd/milestones/M002/slices/S04/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix)
