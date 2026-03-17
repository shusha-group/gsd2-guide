# S01: Site restructure and end-to-end walkthrough

**Goal:** Strip pi/agent content, restructure the sidebar to be GSD-focused, and author the centerpiece "Developing with GSD" walkthrough that follows a real example project through every GSD phase with directory trees, Mermaid diagrams, and annotated terminal output.
**Demo:** Developer opens the site, sees a clean GSD-focused sidebar (no pi/agent sections), navigates to the "Developing with GSD" walkthrough, and follows a real project from `/gsd` through milestone completion — seeing what happens at each phase, what `.gsd/` artifacts appear, and how the pieces connect.

## Must-Haves

- Pi/agent sidebar sections removed: What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI/TUI, Proposals
- `scripts/prebuild.mjs` excludes the 6 pi/agent subdirectories from content copy (what-is-pi, building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals)
- Sidebar restructured with "User Guide", "Commands" (placeholder), "Recipes" (placeholder), "Reference", and "Guides" sections
- `src/content/docs/user-guide/developing-with-gsd.mdx` exists with end-to-end walkthrough content
- Walkthrough includes: Mermaid diagram of the GSD lifecycle, directory trees showing `.gsd/` state at each phase, annotated terminal output examples for key commands
- Walkthrough follows a concrete example project (not abstract/conceptual)
- `npm run build` succeeds
- `npm run check-links` passes (no broken links from removed content)
- Pagefind indexes the walkthrough page

## Proof Level

- This slice proves: integration (prebuild exclusions + sidebar restructure + authored content + build + link check)
- Real runtime required: yes (build, link checker)
- Human/UAT required: yes (content quality, walkthrough clarity)

## Verification

- `npm run build` exits 0
- `node scripts/check-links.mjs` exits 0 (no broken links)
- `grep -r 'what-is-pi\|building-coding-agents\|context-and-hooks\|extending-pi\|pi-ui-tui\|proposals' src/content/docs/ | grep -v node_modules` returns no results (pi/agent content not in build tree)
- Sidebar in `astro.config.mjs` has no entries for What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI/TUI, Proposals
- `src/content/docs/user-guide/developing-with-gsd.mdx` exists and has >200 lines
- Built site has the walkthrough page at `/user-guide/developing-with-gsd/`

## Tasks

- [ ] **T01: Strip pi/agent content and restructure sidebar** `est:45m`
  - Why: Clears out 106 pages of irrelevant content and establishes the new GSD-focused sidebar structure that all subsequent slices extend.
  - Files: `scripts/prebuild.mjs`, `astro.config.mjs`
  - Do: Add an exclusion list to `prebuild.mjs` that skips the 6 pi/agent directories (what-is-pi, building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals) during the content copy. Also exclude non-GSD root pages (agent-knowledge-index.md, ADR-001-branchless-worktree-architecture.md, PRD-branchless-worktree-architecture.md). Restructure `astro.config.mjs` sidebar: remove all pi/agent section entries; organize remaining content into "User Guide" (with developing-with-gsd placeholder), "Commands" (empty, populated in S02/S03), "Recipes" (empty, populated in S04), "Reference" (existing quick-reference cards), and "Guides" (existing GSD guide pages like getting-started, auto-mode, configuration, etc.). Fix any broken internal links in remaining pages that pointed to removed content. Run `npm run build` and `npm run check-links` to verify.
  - Verify: `npm run build` exits 0, `npm run check-links` exits 0, sidebar has no pi/agent entries
  - Done when: Site builds cleanly with no pi/agent content, sidebar is GSD-focused, no broken links

- [ ] **T02: Author the "Developing with GSD" end-to-end walkthrough** `est:1.5h`
  - Why: The centerpiece content — proves the authoring pattern (MDX + Mermaid + directory trees + terminal examples) and delivers the most valuable single page on the site.
  - Files: `src/content/docs/user-guide/developing-with-gsd.mdx`
  - Do: Write a comprehensive walkthrough following a real example project (e.g., building a task tracking CLI) through every GSD phase. Study the GSD source code to ensure accuracy: read `auto-dispatch.ts` for the state machine flow, `commands.ts` for command routing, `prompts/` for what each phase prompt contains, `state.ts` for state derivation. Structure the walkthrough as: (1) Overview — what GSD is and its lifecycle with a Mermaid flowchart, (2) Starting — running `/gsd` for the first time, what the wizard does, (3) Discussion — what `/gsd discuss` asks, what M###-CONTEXT.md looks like, (4) Research — what the agent investigates, what M###-RESEARCH.md contains, (5) Planning — how slices are decomposed, what the roadmap and plans look like, show directory tree, (6) Execution — what `/gsd auto` does step-by-step, how tasks execute, what files appear, show `.gsd/` directory tree mid-execution, (7) Verification — how must-haves are checked, (8) Summarization — what summaries capture, (9) Completion — what happens when a milestone finishes. Each section should include an ASCII directory tree showing the `.gsd/` state at that phase and annotated terminal output showing what the user sees. Add the walkthrough to the sidebar under "User Guide". Use the frontend-design skill for content quality.
  - Verify: `npm run build` exits 0, walkthrough page renders at `/user-guide/developing-with-gsd/`, has Mermaid diagrams and directory trees, `npm run check-links` passes
  - Done when: Walkthrough covers all GSD phases with a real project example, includes Mermaid diagrams and directory trees, builds without errors

## Files Likely Touched

- `scripts/prebuild.mjs` — Add exclusion list for pi/agent directories
- `astro.config.mjs` — Complete sidebar restructure
- `src/content/docs/user-guide/developing-with-gsd.mdx` — End-to-end walkthrough (new)
- Various existing `.md` pages — Fix broken internal links
