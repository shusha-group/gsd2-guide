# M002: GSD User Guide

**Gathered:** 2026-03-17
**Status:** Ready for planning

## Project Description

The GSD 2 documentation site (built in M001) has 135 pages but the content is misaligned with its audience. 101 pages cover generic pi extension development, agent architecture, TUI components, and context hooks — content irrelevant to someone learning to use GSD. The command reference shows name + one-line description with zero depth on what commands actually do. There's no guide showing how to develop a project end-to-end with GSD.

M002 strips the generic content, replaces the shallow command reference with per-command deep-dive pages, adds an end-to-end walkthrough following a real example project, and provides workflow recipes for common patterns.

## Why This Milestone

Users can run GSD commands but don't understand what they do. The user's exact frustration: "gsd quick has code or a prompt for running but I have no idea what or how it is doing it." This applies across all GSD commands. The site needs to *teach* GSD, not just list features.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Open the site and see a GSD-focused sidebar with no pi/agent noise
- Follow an end-to-end walkthrough that shows a real project going through discuss → research → plan → execute → verify → summarize, with actual `.gsd/` artifacts at each phase
- Navigate to any GSD command and understand: what it does, what happens under the hood, what files it reads/writes, what the agent sees, with Mermaid diagrams and terminal examples
- Find step-by-step recipes for common workflows: fixing a bug, making a quick change, starting a new milestone, handling UAT failures, recovering from errors

### Entry point / environment

- Entry point: Browser at the GitHub Pages URL
- Environment: Static site served via GitHub Pages
- Live dependencies involved: none (static HTML)

## Completion Class

- Contract complete means: `npm run build` succeeds, link checker passes, Pagefind indexes all new pages, pi/agent sidebar sections are gone
- Integration complete means: new pages are accessible via sidebar navigation and Pagefind search
- Operational complete means: `npm run update` pipeline still works end-to-end

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Every GSD command (~25) has its own deep-dive page reachable from the sidebar
- The end-to-end walkthrough follows a real project through all GSD phases with directory trees and diagrams
- All pi/agent content sections are removed from sidebar (What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI/TUI, Proposals)
- `npm run build` succeeds and `npm run check-links` passes
- Pagefind search returns results for command queries (e.g., searching "quick" finds the `/gsd quick` deep-dive)

## Risks and Unknowns

- **Content volume** — ~25 per-command pages + walkthrough + 6 recipes = ~32 authored pages. Each needs diagrams and examples. This is significant content authoring work.
- **Prebuild pipeline interaction** — Removing pi/agent docs from the site requires changes to `scripts/prebuild.mjs` (which copies extracted docs into src/content/docs/). Must not break existing GSD-relevant pages.
- **Internal link breakage** — Removing 101 pages will break any internal links pointing to them from remaining pages.

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R026 — End-to-end walkthrough (primary deliverable)
- R027, R030 — Per-command deep-dives with internals (primary deliverable)
- R028 — Core workflow recipes (primary deliverable)
- R029 — Remove pi/agent content (structural change)
- R031 — Visual approach: Mermaid diagrams, directory trees, terminal examples
- R032 — Preserve existing GSD guide pages under new sidebar

## Scope

### In Scope

- End-to-end "Developing with GSD" walkthrough with real project example
- Per-command deep-dive pages for all ~25 GSD commands
- Core workflow recipes (6 scenarios)
- Removal of pi/agent content sections from sidebar and build
- Sidebar restructure to GSD-focused navigation
- Mermaid flow diagrams for command internals
- ASCII directory trees showing `.gsd/` state at each GSD phase
- Annotated terminal output examples
- Preserving existing GSD-relevant guide pages (getting-started, auto-mode, configuration, etc.)

### Out of Scope / Non-Goals

- Advanced workflow recipes (parallel orchestration, headless/CI, custom hooks) — deferred to M003
- Rewriting existing guide pages — they stay as-is unless absorbed by new content
- New extraction pipeline features — M001 pipeline is stable
- Interactive elements or client-side JavaScript — static content only

## Technical Constraints

- Content is hand-authored MDX, not extracted. Source code is studied for accuracy.
- Mermaid diagrams render via @pasqal-io/starlight-client-mermaid (already configured)
- `scripts/prebuild.mjs` must be updated to exclude pi/agent subdirectories from the copy
- Starlight sidebar is configured in `astro.config.mjs` — needs restructuring

## Integration Points

- `scripts/prebuild.mjs` — Must update exclusion list to stop copying pi/agent docs
- `astro.config.mjs` — Sidebar config needs complete restructure
- `scripts/check-links.mjs` — Must pass after content removal (no broken links)
- GSD source code at `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/` — Read for command internals during content authoring

## Open Questions

- How to handle the existing `commands.md` guide page vs new per-command deep-dives — likely superseded
- Whether the Architecture section stays (it's GSD-adjacent) or goes with the pi content — leaning toward keeping architecture.md and removing the rest
