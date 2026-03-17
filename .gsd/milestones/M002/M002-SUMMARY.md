---
id: M002
provides:
  - 467-line end-to-end walkthrough following Cookmate through all GSD phases with Mermaid diagrams and directory trees
  - 27 command deep-dive MDX pages covering every GSD command with flow diagrams, files-touched tables, and terminal examples
  - 6 core workflow recipe pages (fix-a-bug, small-change, new-milestone, uat-failures, error-recovery, working-in-teams)
  - GSD-focused sidebar restructured from 10 sections to 5 (User Guide, Commands, Recipes, Reference, Guides)
  - Prebuild exclusion pipeline filtering 109 pi/agent files from content
  - Established content authoring patterns — per-command template, recipe template, Mermaid dark terminal theme
key_decisions:
  - D028 — Remove 109 pi/agent pages, GSD-only content focus
  - D029 — Command docs authored from source study, not prompt dumps
  - D030 — Walkthrough uses concrete example project (Cookmate)
  - D031 — Core recipes now, advanced recipes deferred to M003
  - D032 — Cookmate (recipe-sharing web app) as the example project identity
  - D033/D034 — Reference-table format for keyboard-shortcuts, cli-flags, headless
patterns_established:
  - Per-command page template — frontmatter → What It Does → Usage → How It Works (Mermaid) → What Files It Touches → Examples → Related Commands
  - Recipe page template — When to Use This → Prerequisites → Steps → What Gets Created → Flow Diagram → Related links
  - Mermaid dark terminal theme — decision nodes fill:#0d180d, action nodes fill:#1a3a1a, error nodes fill:#3a1a1a,stroke:#ff4444, all stroke:#39ff14
  - Content authoring — pure MDX with fenced Mermaid blocks, ASCII directory trees in code blocks, annotated terminal output
  - Prebuild exclusion — EXCLUDED_DIRS/EXCLUDED_ROOT_FILES Sets in prebuild.mjs with per-file exclusion logging
observability_surfaces:
  - "npm run build → 60 pages, 0 errors — page count is the primary health signal"
  - "node scripts/check-links.mjs → 3558 links, 0 broken — catches cross-reference breakage"
  - "prebuild.mjs stdout → 109 'Excluding' lines — confirms pi/agent filtering is active"
  - ".generated-manifest.json file_count → 17 — post-exclusion generated page count"
  - "ls dist/pagefind/ — search index presence confirms Pagefind built"
requirement_outcomes:
  - id: R026
    from_status: active
    to_status: validated
    proof: 467-line walkthrough at /user-guide/developing-with-gsd/ follows Cookmate through discuss → research → plan → execute → verify → summarize with 2 Mermaid diagrams, 4 directory trees, annotated terminal examples. Built and link-checked.
  - id: R027
    from_status: active
    to_status: validated
    proof: 27 command deep-dive MDX pages in src/content/docs/commands/ with Mermaid diagrams, files-touched tables, and terminal examples. 28 sidebar entries, 54→60 pages built, 2880→3558 links verified.
  - id: R028
    from_status: active
    to_status: validated
    proof: 6 recipe pages in dist/recipes/ — fix-a-bug, small-change, new-milestone, uat-failures, error-recovery, working-in-teams. Each has numbered steps, terminal examples, directory trees, Mermaid flowcharts. Sidebar-navigable and Pagefind-indexed.
  - id: R029
    from_status: active
    to_status: validated
    proof: 109 pi/agent files excluded via EXCLUDED_DIRS/EXCLUDED_ROOT_FILES in prebuild.mjs. Zero pi/agent entries in sidebar. grep confirms no pi/agent content references in src/content/docs/.
  - id: R030
    from_status: active
    to_status: validated
    proof: All 27 command pages show lifecycle — triggers, files read/written, internal mechanics with Mermaid diagrams for complex commands, annotated terminal examples. Prose + tables for simple commands.
  - id: R031
    from_status: active
    to_status: validated
    proof: Visual approach across all M002 content — S01 walkthrough (2 Mermaid, 4 directory trees), S02 (9 command flow diagrams), S03 (11 Mermaid diagrams), S04 (6 recipe flowcharts + directory trees). 27 files with Mermaid blocks total.
  - id: R032
    from_status: active
    to_status: validated
    proof: All existing GSD guide pages (getting-started, auto-mode, configuration, git-strategy, troubleshooting, working-in-teams, skills, etc.) accessible under reorganized 5-section sidebar. 3558 links verified, 0 broken.
duration: 160m
verification_result: passed
completed_at: 2026-03-17
---

# M002: GSD User Guide

**Transformed the documentation site from a 135-page generic pi/agent reference into a 60-page GSD-focused user guide with an end-to-end walkthrough, 27 command deep-dive pages, and 6 workflow recipes — all with Mermaid diagrams, directory trees, and annotated terminal examples.**

## What Happened

Four slices executed sequentially, each building on the content patterns and sidebar structure established by S01.

**S01 (32m)** did the structural surgery. Added exclusion sets to `prebuild.mjs` that filter 109 pi/agent files from the content pipeline — 6 directory exclusions (what-is-pi, building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals) plus 3 root file exclusions. Restructured the sidebar from 10 sections to 5 GSD-focused sections: User Guide, Commands, Recipes, Reference, Guides. Authored the 467-line "Developing with GSD" walkthrough following a Cookmate recipe app through every GSD phase — discuss, research, plan, execute, verify, summarize, complete — with 2 Mermaid diagrams (lifecycle flowchart, auto-mode dispatch state machine), 4 ASCII directory trees showing `.gsd/` state evolution, and annotated terminal output. This established the content authoring pattern all subsequent slices used.

**S02 (30m)** created the first 9 command deep-dive pages covering session and execution commands: `/gsd auto`, `/gsd stop`, `/gsd pause`, `/gsd`, `/gsd next`, `/gsd quick`, `/gsd discuss`, `/gsd status`, `/gsd visualize`. Each page follows the template locked in T01 — What It Does, Usage, How It Works (with Mermaid flow diagram), What Files It Touches (table), Examples (annotated terminal output), Related Commands. The auto page got the fullest treatment (~200 lines, 17-node flowchart covering dispatch loop, stuck detection, crash recovery). Read-only commands (status, visualize) used a data-flow diagram pattern instead of decision trees.

**S03 (53m)** completed command coverage with 18 more pages: planning commands (queue, steer, capture, triage, knowledge, cleanup), diagnostic commands (doctor, forensics, prefs, mode, skill-health, config), utility commands (hooks, run-hook, migrate), and special topic reference pages (keyboard-shortcuts, cli-flags, headless). Doctor was the richest — three-mode Mermaid diagram plus 27 issue codes. Special topic pages used reference-table format instead of the standard command template, a deliberate pattern decision (D033). All commands now linked from the commands landing page.

**S04 (45m)** added the 6 core workflow recipe pages: fix-a-bug (full lifecycle with Cookmate case-sensitive search), small-change (`/gsd quick` without milestone ceremony), new-milestone (continuing after M001), uat-failures (replan flow), error-recovery (doctor/forensics/manual repair), working-in-teams (Alice+Bob dual-developer narrative). Each recipe has numbered steps, terminal examples, `.gsd/` directory trees at key stages, and a Mermaid flowchart. All studied from GSD source prompts for accuracy.

## Cross-Slice Verification

Each success criterion from the roadmap verified with specific evidence:

| Success Criterion | Evidence | Status |
|---|---|---|
| Developer can understand any GSD command internally by reading its deep-dive page | 27 command pages with Mermaid diagrams, files-touched tables, internal mechanics | ✅ |
| Newcomer can follow end-to-end walkthrough | 467-line walkthrough at /user-guide/developing-with-gsd/ with 2 Mermaid diagrams, 4 directory trees | ✅ |
| Common workflows have step-by-step recipe pages | 6 recipe pages in dist/recipes/ with numbered steps, terminal output, directory trees, flowcharts | ✅ |
| No pi/agent content sections remain in sidebar | `grep` returns 0 matches for pi/agent section names in astro.config.mjs | ✅ |
| All new content indexed by Pagefind search | Pagefind reports "Found 60 HTML files" — all pages indexed | ✅ |

**Definition of Done verification:**

- ✅ Pi/agent content sections removed — 109 files excluded, 0 sidebar entries
- ✅ End-to-end walkthrough exists — 467 lines, Cookmate example, all GSD phases
- ✅ Every GSD command has a deep-dive page — 27 MDX files, 27 dist pages, 28 sidebar entries
- ✅ 6 core workflow recipe pages exist — fix-a-bug, small-change, new-milestone, uat-failures, error-recovery, working-in-teams
- ✅ Existing GSD guide pages preserved — getting-started, auto-mode, configuration, git-strategy, troubleshooting, working-in-teams, skills all present in dist/
- ✅ `npm run build` succeeds — 60 pages in 4.55s, 0 errors
- ✅ `npm run check-links` passes — 3558 links, 0 broken
- ✅ Pagefind indexes all content — 60 HTML files indexed

## Requirement Changes

- R026: active → validated — 467-line walkthrough follows Cookmate through all GSD phases with diagrams and directory trees
- R027: active → validated — 27 command deep-dive pages with Mermaid diagrams, files-touched tables, terminal examples
- R028: active → validated — 6 recipe pages with numbered steps, terminal examples, directory trees, flowcharts
- R029: active → validated — 109 pi/agent files excluded, zero sidebar entries, grep confirms no pi/agent content
- R030: active → validated — All 27 command pages show lifecycle: triggers, files, mechanics, examples
- R031: active → validated — Mermaid diagrams and directory trees across all M002 content (walkthrough + 27 commands + 6 recipes)
- R032: active → validated — All existing GSD guide pages accessible under reorganized 5-section sidebar, 3558 links verified

## Forward Intelligence

### What the next milestone should know
- The site has 60 pages total: 17 generated guide pages, 27 command deep-dives, 6 recipes, 1 walkthrough, plus reference/changelog/landing pages. Content is split between generated (prebuild copies from content/generated/docs/) and hand-authored (MDX files directly in src/content/docs/).
- Cookmate (recipe-sharing web app) is the example project threaded through the walkthrough, command examples, and recipes. Maintain consistency if adding more content.
- The per-command page template and recipe template are well-established. New pages should follow the same structure — start by reading an existing page in the same category.
- R033 (advanced recipes: parallel orchestration, headless/CI, custom hooks, cost optimization) is explicitly deferred from M002 and ready for M003.

### What's fragile
- Sidebar in `astro.config.mjs` is manually maintained — adding a page means adding the MDX file AND a sidebar entry. Missing either produces a broken link or an unreachable page.
- `content/generated/docs/commands.md` is the source of truth for the commands landing page, but lives in a non-obvious location. Edits to `src/content/docs/commands.md` are silently overwritten by prebuild.
- Prebuild exclusion list is a hardcoded Set. New pi/agent directories in the upstream repo won't be automatically excluded.
- Mermaid diagrams render client-side — syntax errors show as raw text with no build-time error. Visual verification in a browser is the only reliable check.

### Authoritative diagnostics
- `npm run build` page count (60) + `node scripts/check-links.mjs` (3558 links, 0 broken) — the combined exit codes are the single most reliable signal that the site is healthy.
- `node scripts/prebuild.mjs 2>&1 | grep "Excluding" | wc -l` → 109 — confirms pi/agent exclusion is active.
- `ls src/content/docs/commands/*.mdx | wc -l` → 27 — quick command page count.
- `ls src/content/docs/recipes/*.mdx | wc -l` → 6 — quick recipe count.

### What assumptions changed
- Original plan estimated ~25 command pages. Actual delivery was 27 — 15 slash commands + 3 special topic reference pages (keyboard-shortcuts, cli-flags, headless) + 9 session/execution commands. The special topics needed a different structure (reference tables, not lifecycle docs).
- The commands landing page source lives in `content/generated/docs/commands.md`, not `src/content/docs/commands.md`. This caught S02/S03 off guard and is now documented in KNOWLEDGE.md.

## Files Created/Modified

- `scripts/prebuild.mjs` — EXCLUDED_DIRS/EXCLUDED_ROOT_FILES sets filtering 109 pi/agent files
- `astro.config.mjs` — Sidebar restructured to 5 sections with 28 command entries and 6 recipe entries
- `src/content/docs/user-guide/developing-with-gsd.mdx` — 467-line end-to-end walkthrough
- `src/content/docs/commands/*.mdx` (27 files) — Per-command deep-dive pages
- `src/content/docs/recipes/*.mdx` (6 files) — Core workflow recipe pages
- `content/generated/docs/commands.md` — Commands landing page with deep-dive links
