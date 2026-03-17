---
id: T01
parent: S04
milestone: M002
provides:
  - 3 recipe MDX pages covering GSD happy-path workflows (fix-a-bug, small-change, new-milestone)
  - Consistent recipe structure template established for T02 to follow
key_files:
  - src/content/docs/recipes/fix-a-bug.mdx
  - src/content/docs/recipes/small-change.mdx
  - src/content/docs/recipes/new-milestone.mdx
key_decisions:
  - Used Cookmate search case-sensitivity as the fix-a-bug scenario — concrete and relatable
  - Used "back to top" button as the small-change scenario — simple enough to justify /gsd quick
  - Used social features M002 as the new-milestone scenario — builds on the M001 Cookmate context established in the walkthrough
patterns_established:
  - Recipe page structure: frontmatter → When to Use This → Prerequisites → Steps (numbered with terminal blocks + directory trees) → What Gets Created → Flow Diagram → Related links
  - Mermaid theme block using %%{init:{...}}%% with dark terminal colors, terminal nodes using fill:#0d180d,stroke:#39ff14,color:#39ff14
  - Cross-references to command pages use ../../commands/<slug>/ format
  - Cross-references between recipes use ../sibling-recipe/ format
observability_surfaces:
  - grep -l 'mermaid' src/content/docs/recipes/*.mdx confirms Mermaid presence
  - head -5 src/content/docs/recipes/*.mdx confirms frontmatter correctness
  - Build output at dist/recipes/*/index.html confirms pages render (verifiable after T03 wires sidebar)
duration: 20m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Author happy-path recipe pages (fix-a-bug, small-change, new-milestone)

**Created 3 recipe MDX pages covering the core GSD happy-path workflows with Mermaid flowcharts and Cookmate scenarios.**

## What Happened

Created `src/content/docs/recipes/` directory and authored three recipe pages:

1. **fix-a-bug.mdx** (~130 lines) — walks through fixing Cookmate's case-sensitive search using the full GSD lifecycle: `/gsd` discussion → context file → `/gsd auto` → research → plan → execute → verify. Shows `.gsd/` directory trees at three stages (post-discussion, mid-execution, completion). Mermaid flowchart shows the bug-fix decision flow with a test-pass/fail feedback loop.

2. **small-change.mdx** (~120 lines) — walks through adding a "back to top" button using `/gsd quick`. Shows the automatic branch creation, task directory, execution, and commit flow. Includes terminal output example matching the pattern from the `/gsd quick` command page. Cross-references `../../commands/quick/` for the full command reference.

3. **new-milestone.mdx** (~150 lines) — walks through adding social features (M002) to Cookmate after M001 is complete. Shows how GSD detects the completed milestone and prompts for new scope. Directory trees show M001 (complete with summaries) alongside M002 (in progress). Mermaid flowchart shows the slice loop: research → plan → execute → verify → reassess → next slice.

All three pages follow the consistent structure: When to Use This, Prerequisites, Steps, What Gets Created, Flow Diagram, and Related links. Studied GSD source prompts (discuss.md, quick-task.md, guided-discuss-milestone.md, plan-milestone.md) for accuracy of described behaviors.

## Verification

- `ls src/content/docs/recipes/*.mdx | wc -l` → 3 ✓
- `grep -l 'mermaid' src/content/docs/recipes/*.mdx | wc -l` → 3 ✓
- `grep -l 'Cookmate' src/content/docs/recipes/*.mdx | wc -l` → 3 ✓
- Each file has `---` frontmatter with title and description ✓
- Each file has exactly one Mermaid code block ✓
- Mermaid diagrams use correct dark terminal theme variables ✓
- Cross-reference to `/gsd quick` uses `../../commands/quick/` format ✓
- Cross-references between recipes use `../sibling/` format ✓

### Slice-level verification (partial — expected for T01):

- File count: 3/6 (T02 adds remaining 3)
- Sidebar entries: 0/6 (T03 wires these)
- Build: not run (T03 runs full build)

## Diagnostics

- Frontmatter correctness: `head -5 src/content/docs/recipes/*.mdx`
- Mermaid presence: `grep -l 'mermaid' src/content/docs/recipes/*.mdx`
- Link format: `grep -n '\.\./\.\./commands/' src/content/docs/recipes/*.mdx` shows cross-references
- If Mermaid renders as raw text in browser, check for syntax errors in the code block — build won't catch these

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/recipes/fix-a-bug.mdx` — bug fix workflow recipe with Mermaid flowchart
- `src/content/docs/recipes/small-change.mdx` — /gsd quick workflow recipe with Mermaid flowchart
- `src/content/docs/recipes/new-milestone.mdx` — new milestone workflow recipe with Mermaid flowchart
- `.gsd/milestones/M002/slices/S04/S04-PLAN.md` — added Observability / Diagnostics section
- `.gsd/milestones/M002/slices/S04/tasks/T01-PLAN.md` — added Observability Impact section
