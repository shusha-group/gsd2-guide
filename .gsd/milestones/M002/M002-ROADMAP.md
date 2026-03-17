# M002: GSD User Guide

**Vision:** Strip the generic pi/agent content, replace it with authored GSD-focused user guide content — an end-to-end walkthrough, per-command deep-dive pages, and workflow recipes. Every GSD command gets a page that explains what it actually does under the hood, with Mermaid diagrams, directory trees, and annotated terminal examples.

## Success Criteria

- Developer can understand what any GSD command does internally by reading its deep-dive page
- A newcomer can follow the end-to-end walkthrough to understand the full GSD lifecycle on a real project
- Common workflows (fix a bug, quick change, new milestone, UAT failure, error recovery, teams) have step-by-step recipe pages
- No pi/agent content sections remain in the sidebar
- All new content is indexed by Pagefind search

## Key Risks / Unknowns

- **Content volume** — ~32 authored pages with diagrams and examples is significant writing work. Risk is schedule, not feasibility.
- **Prebuild pipeline changes** — Excluding pi/agent docs from prebuild must not break GSD-relevant pages or the build.
- **Link breakage** — Removing 101 pages will break internal links from remaining pages.

## Proof Strategy

- Content volume → retire in S01 by authoring the walkthrough (largest single page) and restructuring the sidebar. If that works, the per-command pages in S02/S03 are straightforward repetition.
- Prebuild/link breakage → retire in S01 by removing content and fixing all broken links before writing new pages.

## Verification Classes

- Contract verification: `npm run build` succeeds, `npm run check-links` passes, Pagefind search indexes new content
- Integration verification: sidebar navigation reaches all new pages, search returns command queries
- Operational verification: `npm run update` pipeline still works end-to-end
- UAT / human verification: content quality, accuracy of command internals, diagram clarity

## Milestone Definition of Done

This milestone is complete only when all are true:

- Pi/agent content sections removed from sidebar (What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI/TUI, Proposals)
- End-to-end walkthrough page exists following a real project through all GSD phases
- Every GSD command (~25) has a dedicated deep-dive page with internals, examples, and diagrams
- 6 core workflow recipe pages exist with step-by-step instructions
- Existing GSD guide pages preserved under reorganized sidebar
- `npm run build` succeeds and `npm run check-links` passes
- Pagefind search returns results for command queries

## Requirement Coverage

- Covers: R026, R027, R028, R029, R030, R031, R032
- Partially covers: none
- Leaves for later: R033 (advanced recipes, deferred to M003)
- Orphan risks: none

## Slices

- [x] **S01: Site restructure and end-to-end walkthrough** `risk:high` `depends:[]`
  > After this: The site has a GSD-focused sidebar (pi/agent sections gone), existing GSD guides reorganized, and a "Developing with GSD" walkthrough page that follows a real project through discuss → research → plan → execute → verify → summarize with directory trees, Mermaid diagrams, and annotated terminal output at each phase. Build and link check pass.

- [ ] **S02: Command deep-dives — session and execution commands** `risk:medium` `depends:[S01]`
  > After this: Every session and execution command has its own deep-dive page — `/gsd`, `/gsd auto`, `/gsd stop`, `/gsd pause`, `/gsd next`, `/gsd quick`, `/gsd discuss`, `/gsd status`, `/gsd visualize`. Each page shows what the command does, how it works internally, what files it reads/writes, Mermaid flow diagrams, and terminal examples. Reachable via sidebar and search.

- [ ] **S03: Command deep-dives — planning, maintenance, and utility commands** `risk:medium` `depends:[S01]`
  > After this: All remaining GSD commands have deep-dive pages — `/gsd queue`, `/gsd steer`, `/gsd doctor`, `/gsd forensics`, `/gsd capture`, `/gsd triage`, `/gsd prefs`, `/gsd mode`, `/gsd knowledge`, `/gsd cleanup`, `/gsd hooks`, `/gsd run-hook`, `/gsd skill-health`, `/gsd migrate`, `/gsd config`, keyboard shortcuts, CLI flags, and headless mode. Full command coverage.

- [ ] **S04: Core workflow recipes** `risk:low` `depends:[S01]`
  > After this: A "Recipes" sidebar section with 6 step-by-step guides: fix a bug, make a small change without milestone ceremony, start a new milestone on an existing project, handle UAT failures, recover from errors, work in teams. Each recipe shows the exact commands, the `.gsd/` artifacts produced, and the expected outcomes.

## Boundary Map

### S01 → S02

Produces:
- Restructured `astro.config.mjs` sidebar with "Commands" section placeholder and pattern for adding per-command pages
- Updated `scripts/prebuild.mjs` with exclusion list for pi/agent content directories
- `src/content/docs/user-guide/developing-with-gsd.mdx` — walkthrough page establishing the content authoring pattern (MDX with Mermaid, directory trees, terminal examples)
- GSD-focused sidebar structure that S02 extends with command pages

Consumes: nothing (first slice)

### S01 → S03

Produces:
- Same sidebar pattern and content directory structure as S01 → S02
- Established MDX authoring pattern for command deep-dives

Consumes: nothing (first slice)

### S01 → S04

Produces:
- Sidebar structure with "Recipes" section placeholder
- Content authoring pattern established in the walkthrough

Consumes: nothing (first slice)

### S02 → S03

Produces:
- `src/content/docs/commands/` directory with ~9 command deep-dive MDX pages
- Established per-command page template (sections: What It Does, How It Works, What Files It Touches, Examples, Flow Diagram)
- Sidebar entries for session/execution commands

Consumes from S01:
- Sidebar structure, content authoring pattern, build pipeline

### S03 → (terminal)

Produces:
- Remaining ~16 command deep-dive MDX pages in `src/content/docs/commands/`
- Complete sidebar command listing

Consumes from S01:
- Sidebar structure, content authoring pattern
Consumes from S02:
- Per-command page template, established pattern

### S04 → (terminal)

Produces:
- `src/content/docs/recipes/` directory with 6 recipe MDX pages
- Sidebar "Recipes" section populated

Consumes from S01:
- Sidebar structure, content authoring pattern
