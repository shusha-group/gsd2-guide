---
id: S04
parent: M002
milestone: M002
provides:
  - 6 recipe MDX pages covering core GSD workflows (fix-a-bug, small-change, new-milestone, uat-failures, error-recovery, working-in-teams)
  - Recipes sidebar section with 6 navigable entries
  - Pagefind search indexing for all recipe content
requires:
  - slice: S01
    provides: Sidebar structure with Recipes section placeholder, content authoring pattern (MDX with Mermaid, directory trees, terminal examples)
affects: []
key_files:
  - src/content/docs/recipes/fix-a-bug.mdx
  - src/content/docs/recipes/small-change.mdx
  - src/content/docs/recipes/new-milestone.mdx
  - src/content/docs/recipes/uat-failures.mdx
  - src/content/docs/recipes/error-recovery.mdx
  - src/content/docs/recipes/working-in-teams.mdx
  - astro.config.mjs
key_decisions:
  - Used Cookmate scenarios for all recipes — consistent with the walkthrough example project established in S01
  - Short action-oriented sidebar labels (e.g., "Fix a Bug") without "Recipe:" prefix for better scannability
patterns_established:
  - Recipe page structure: When to Use This → Prerequisites → Steps (numbered with terminal blocks + directory trees) → What Gets Created → Flow Diagram → Related links
  - Mermaid theme block using %%{init:{...}}%% with dark terminal colors (fill:#0d180d, stroke:#39ff14, color:#39ff14 for terminal nodes; fill:#1a3a1a for normal nodes)
  - Cross-references to command pages use ../../commands/<slug>/ format; between recipes use ../sibling-recipe/ format
observability_surfaces:
  - "grep -c \"'/recipes/\" astro.config.mjs" returns 6 — sidebar entry count matches recipe page count
  - "ls dist/recipes/*/index.html | wc -l" returns 6 — all recipes in built output
  - "node scripts/check-links.mjs" — 0 broken links across 3558 internal links
  - "ls dist/pagefind/" — search index exists with entry JSON, WASM, and JS files
drill_down_paths:
  - .gsd/milestones/M002/slices/S04/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S04/tasks/T02-SUMMARY.md
  - .gsd/milestones/M002/slices/S04/tasks/T03-SUMMARY.md
duration: 45m
verification_result: passed
completed_at: 2026-03-17
---

# S04: Core workflow recipes

**6 step-by-step recipe pages covering fix-a-bug, small-change, new-milestone, UAT-failures, error-recovery, and working-in-teams — all navigable via sidebar and indexed by Pagefind search.**

## What Happened

Authored 6 recipe MDX pages in `src/content/docs/recipes/`, split across two tasks by workflow type:

**T01 — Happy-path recipes (3 pages).** Fix-a-bug walks through fixing Cookmate's case-sensitive search using the full GSD lifecycle (discuss → auto → verify). Small-change shows adding a "back to top" button via `/gsd quick` without milestone ceremony. New-milestone covers adding social features (M002) to Cookmate after M001 completes. Each page has numbered steps, terminal output blocks, `.gsd/` directory trees at key stages, and a Mermaid flowchart. GSD source prompts (discuss.md, quick-task.md, guided-discuss-milestone.md, plan-milestone.md) were studied for accuracy.

**T02 — Recovery and collaboration recipes (3 pages).** UAT-failures covers the replan flow when acceptance testing reveals gaps (special characters breaking search). Error-recovery covers `/gsd doctor`, `/gsd forensics`, crash recovery locks, and manual state repair (rate limit crash scenario). Working-in-teams covers team mode setup, unique milestone IDs, push branches, and concurrent workflows (Alice+Bob dual-developer narrative). Source prompts (run-uat.md, replan-slice.md, doctor-heal.md, forensics.md) and the existing working-in-teams guide were consulted for accuracy.

**T03 — Sidebar wiring and verification.** Added 6 sidebar entries to astro.config.mjs in the Recipes section, positioned before existing guide entries. Full build (60 pages, 4.47s), link check (3558 links, 0 broken), and Pagefind indexing all confirmed.

## Verification

All slice-level checks pass:

- `npm run build` — exits 0, 60 pages built in 4.47s ✓
- `node scripts/check-links.mjs` — 0 broken links (3558 checked) ✓
- `ls src/content/docs/recipes/*.mdx | wc -l` — 6 ✓
- `grep -c "'/recipes/" astro.config.mjs` — 6 ✓
- `ls dist/recipes/*/index.html | wc -l` — 6 ✓
- `grep -l 'mermaid' src/content/docs/recipes/*.mdx | wc -l` — 6 ✓
- `ls dist/pagefind/` — search index with entry JSON, WASM, and JS files ✓

## Requirements Advanced

- R028 — All 6 core workflow recipe pages now exist with commands, artifacts, and expected outcomes. Ready for validation.
- R031 — Recipe pages complete the visual documentation coverage: 6 Mermaid flowcharts, directory trees at key stages, annotated terminal output. Pattern now spans walkthrough, 27 command pages, and 6 recipes.

## Requirements Validated

- R028 — 6 recipe pages in dist/ output, each with numbered steps, terminal examples, directory trees, Mermaid flowcharts, and expected outcomes. Build passes, links verified, search indexed.
- R031 — Visual approach applied across all M002 content: S01 walkthrough (2 Mermaid diagrams, 4 directory trees), S02 (9 command pages with flow diagrams), S03 (18 pages with 11 Mermaid diagrams), S04 (6 recipe pages with 6 Mermaid diagrams). Coverage is comprehensive.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- T03 used short labels ("Fix a Bug") instead of "Recipe: Fix a Bug" prefix — the slice plan mentioned the prefix but the task plan was more specific and the shorter labels are better UX.
- T02 added a cross-reference from working-in-teams recipe back to the existing Working in Teams guide page — not in the plan but consistent with cross-linking pattern.

## Known Limitations

- Mermaid diagrams render client-side — syntax errors in Mermaid blocks render as raw text with no build-time error. Visual verification in a browser is the only way to catch these.
- Recipe content accuracy is based on studying GSD source prompts and existing docs, not runtime verification of the described workflows.

## Follow-ups

- none

## Files Created/Modified

- `src/content/docs/recipes/fix-a-bug.mdx` — Bug fix workflow recipe with full GSD lifecycle steps and Mermaid flowchart
- `src/content/docs/recipes/small-change.mdx` — /gsd quick workflow recipe showing no-ceremony changes
- `src/content/docs/recipes/new-milestone.mdx` — New milestone workflow recipe showing project continuation
- `src/content/docs/recipes/uat-failures.mdx` — UAT failure/replan recipe with failure→recovery flow
- `src/content/docs/recipes/error-recovery.mdx` — Error recovery recipe covering doctor, forensics, and manual repair
- `src/content/docs/recipes/working-in-teams.mdx` — Team collaboration recipe covering parallel development
- `astro.config.mjs` — 6 recipe sidebar entries added to Recipes section

## Forward Intelligence

### What the next slice should know
- All 6 core recipes are complete. M002 milestone definition of done is now fully satisfied — the remaining work would be advanced recipes (parallel orchestration, headless/CI, custom hooks) which are explicitly deferred to M003 per D031.
- The site now has 60 pages total: 17 generated guide pages, 27 command deep-dives, 6 recipes, 1 walkthrough, plus reference/changelog/landing pages.

### What's fragile
- Mermaid diagrams — syntax errors are invisible at build time. If any recipe's flowchart appears as raw text in the browser, the Mermaid code block has a syntax issue. Check for unescaped special characters or missing node IDs.

### Authoritative diagnostics
- `npm run build` + `node scripts/check-links.mjs` — the combined exit codes are the authoritative signal that all content compiles and cross-references are intact.
- `grep -c "'/recipes/" astro.config.mjs` — must equal the number of recipe MDX files. A mismatch means a page exists but isn't navigable.

### What assumptions changed
- No assumptions changed. S04 was low-risk and executed as planned.
