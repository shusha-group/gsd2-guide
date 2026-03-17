---
id: S01
parent: M002
milestone: M002
provides:
  - Prebuild exclusion list filtering 109 pi/agent files from content pipeline (EXCLUDED_DIRS + EXCLUDED_ROOT_FILES sets)
  - GSD-focused sidebar with 5 sections — User Guide, Commands (placeholder), Recipes, Reference, Guides
  - 467-line "Developing with GSD" end-to-end walkthrough with 2 Mermaid diagrams, 4 directory trees, annotated terminal examples
  - MDX authoring pattern for GSD content (prose + Mermaid + ASCII trees + terminal output blocks)
  - Cookmate example project identity threaded through the walkthrough
requires: []
affects:
  - S02
  - S03
  - S04
key_files:
  - scripts/prebuild.mjs
  - astro.config.mjs
  - src/content/docs/user-guide/developing-with-gsd.mdx
key_decisions:
  - Separated prebuild "excluded" vs "error" counters for clearer build diagnostics
  - Cookmate (recipe-sharing web app) as the concrete example project — complex enough for real decomposition, simple domain
  - Mermaid diagrams styled with dark terminal theme colors (#1a3a1a, #39ff14) matching site aesthetic
  - Pure MDX without Starlight component imports — walkthrough is prose-heavy, Card/TabItem patterns don't add value
  - Sidebar reorganized into 5 sections from 10 — User Guide, Commands, Recipes, Reference, Guides
patterns_established:
  - Prebuild exclusion pattern: EXCLUDED_DIRS Set + EXCLUDED_ROOT_FILES Set checked at top of copy loop, each exclusion logged to stdout
  - Content authoring pattern: MDX with mermaid fenced code blocks, indented ASCII directory trees, annotated terminal output in code blocks
  - Mermaid theming: %%{init: {'theme': 'base', 'themeVariables': {...}}}%% block at top of each diagram
observability_surfaces:
  - prebuild.mjs logs each excluded file to stdout (grep "Excluding" in build output, expect 109)
  - .generated-manifest.json file_count reflects post-exclusion count (17 files)
  - check-links.mjs catches broken sidebar or content links as non-zero exit
  - Build output shows /user-guide/developing-with-gsd/index.html in page list
drill_down_paths:
  - .gsd/milestones/M002/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S01/tasks/T02-SUMMARY.md
duration: 32m
verification_result: passed
completed_at: 2026-03-17
---

# S01: Site restructure and end-to-end walkthrough

**Removed 109 pi/agent files from the build pipeline, restructured the sidebar from 10 sections to 5 GSD-focused sections, and authored a 467-line end-to-end walkthrough following a Cookmate recipe app through every GSD phase with Mermaid diagrams, directory trees, and annotated terminal examples.**

## What Happened

**T01 (20m):** Added `EXCLUDED_DIRS` (6 directories: what-is-pi, building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals) and `EXCLUDED_ROOT_FILES` (3 files: agent-knowledge-index.md, ADR-001, PRD) to `scripts/prebuild.mjs`. Each exclusion is logged to stdout for observable filtering. Fixed the prebuild reporting by separating the "excluded" counter from "errors" — previously conflated. Restructured `astro.config.mjs` sidebar: removed all 6 pi/agent autogenerate sections plus the standalone Architecture section. Created 5 new sections: User Guide (Getting Started + walkthrough), Commands (placeholder for S02/S03), Recipes (operational guides), Reference (quick-reference cards), Guides (configuration, architecture, skills, etc.). Created a placeholder `developing-with-gsd.mdx` so the sidebar link resolves during build (24 broken links without it).

**T02 (12m):** Replaced the placeholder with a 467-line end-to-end walkthrough. Studied GSD source code (auto-dispatch.ts, state.ts, commands.ts, 7 prompt files) for accuracy. Used Cookmate (a recipe-sharing web app) as the concrete example project, threading it through all phases: overview with lifecycle flowchart, starting `/gsd`, discussion and CONTEXT.md, research, planning with roadmap/slice/task decomposition, auto-mode execution with dispatch state machine diagram, verification, summarization, and completion. Includes 2 Mermaid diagrams (lifecycle flowchart, dispatch state machine), 4 ASCII directory trees showing `.gsd/` state at discussion, planning, mid-execution, and completion phases, plus annotated terminal output examples.

## Verification

All slice-level verification checks pass:

- ✅ `npm run build` exits 0 — 27 pages built in 3.90s
- ✅ `node scripts/check-links.mjs` exits 0 — 720 internal links, 0 broken
- ✅ No pi/agent content in `src/content/docs/` (grep returns no results)
- ✅ Sidebar in `astro.config.mjs` has no pi/agent entries (0 matches)
- ✅ `developing-with-gsd.mdx` exists with 467 lines (>200 requirement met)
- ✅ Built site has walkthrough at `/user-guide/developing-with-gsd/index.html`
- ✅ 2 Mermaid diagrams in walkthrough
- ✅ Prebuild stdout shows 109 exclusion log lines
- ✅ Pagefind indexes 27 pages including the walkthrough

## Requirements Advanced

- R031 — Visual documentation pattern established: Mermaid flowcharts with dark terminal theme, ASCII directory trees, annotated terminal output. S02/S03/S04 extend this to commands and recipes.

## Requirements Validated

- R026 — 467-line walkthrough at /user-guide/developing-with-gsd/ follows Cookmate through all phases with 2 Mermaid diagrams, 4 directory trees, and annotated terminal examples.
- R029 — 109 pi/agent files excluded from prebuild, zero pi/agent sidebar entries, grep confirms no pi/agent content in build tree.
- R032 — All existing GSD guide pages accessible under reorganized 5-section sidebar. 720 links checked, 0 broken.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

- T01 created a placeholder `developing-with-gsd.mdx` not in the original task plan — required because the sidebar link creates 24 broken links if the target page doesn't exist.
- T01 fixed prebuild reporting (separated "excluded" from "errors" counter) — not planned but discovered during implementation.

## Known Limitations

- Walkthrough content quality and accuracy need human review (UAT) — written from source code study but not yet verified by a GSD user.
- Commands and Recipes sidebar sections are placeholders with minimal content — populated in S02/S03/S04.
- R031 (visual documentation) only partially proven — walkthrough establishes the pattern but command deep-dives in S02/S03 are needed for full validation.

## Follow-ups

None — all planned work completed. S02/S03/S04 continue from the established patterns.

## Files Created/Modified

- `scripts/prebuild.mjs` — Added EXCLUDED_DIRS/EXCLUDED_ROOT_FILES sets, exclusion logic, fixed excluded/error reporting
- `astro.config.mjs` — Restructured sidebar from 10 sections to 5 GSD-focused sections
- `src/content/docs/user-guide/developing-with-gsd.mdx` — 467-line end-to-end walkthrough (replaced placeholder)

## Forward Intelligence

### What the next slice should know
- The sidebar in `astro.config.mjs` uses explicit `items` arrays, not `autogenerate`. Adding command pages means adding explicit `{ label: '...', link: '/commands/...' }` entries under the Commands section.
- The walkthrough uses Cookmate as the example project. Command deep-dives can reference it for consistency: "When you ran `/gsd auto` on the Cookmate project..."
- Content authoring pattern is pure MDX — no Astro component imports needed. Mermaid goes in fenced code blocks, directory trees are indented text in code blocks, terminal output is plain code blocks.

### What's fragile
- The prebuild exclusion list is a hardcoded Set in `prebuild.mjs`. If new pi/agent directories appear in the GitHub repo docs, they won't be automatically excluded — someone needs to add them to the Set.
- The sidebar structure is manually maintained. Adding a page means adding both the `.mdx` file AND the sidebar entry in `astro.config.mjs` — missing either causes a broken link or an unreachable page.

### Authoritative diagnostics
- `node scripts/prebuild.mjs 2>&1 | grep "Excluding" | wc -l` — should return 109. If the number changes, either the source repo added/removed files or the exclusion list is wrong.
- `node scripts/check-links.mjs` — the single most useful diagnostic. Catches broken sidebar links, missing pages, and dead internal references in one pass.
- `cat src/content/docs/.generated-manifest.json | python3 -c "import json,sys; print(json.load(sys.stdin)['file_count'])"` — should return 17 (post-exclusion count).

### What assumptions changed
- Original plan assumed the walkthrough page would need an `astro.config.mjs` sidebar change in T02. T01's placeholder already added the sidebar entry, so T02 only replaced the content file — no config change needed.
