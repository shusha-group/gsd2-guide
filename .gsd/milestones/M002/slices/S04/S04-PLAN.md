# S04: Core workflow recipes

**Goal:** A "Recipes" sidebar section with 6 step-by-step workflow guides covering the most common GSD usage patterns, each showing exact commands, `.gsd/` artifacts produced, and expected outcomes with Mermaid flow diagrams.
**Demo:** A developer looking up "how do I fix a bug with GSD" finds a recipe page with numbered steps, directory trees, terminal output, and a flowchart — and can follow it on their own project.

## Must-Haves

- 6 recipe MDX pages in `src/content/docs/recipes/`: fix-a-bug, small-change, new-milestone, uat-failures, error-recovery, working-in-teams
- Each recipe has: scenario description, prerequisites, numbered steps with commands, directory trees showing `.gsd/` state, one Mermaid flowchart, expected outcomes
- Consistent structure across all 6 recipes (When to Use This, Prerequisites, Steps, What Gets Created, Flow Diagram)
- Cookmate example project used for recipe scenarios where natural
- Mermaid diagrams use dark terminal theme (fill:#1a3a1a, stroke:#39ff14, color:#e8f4e8)
- 6 new sidebar entries in `astro.config.mjs` under the Recipes section
- `npm run build` exits 0, `node scripts/check-links.mjs` passes
- Pagefind indexes the new recipe pages

## Verification

- `npm run build` exits 0
- `node scripts/check-links.mjs` — 0 broken links
- `ls src/content/docs/recipes/*.mdx | wc -l` — returns 6
- `grep -c "recipes/" astro.config.mjs` — returns 6 (one sidebar entry per recipe)
- `ls dist/recipes/*/index.html | wc -l` — returns 6 (all recipes in built output)
- Each recipe file contains at least one `mermaid` fenced code block
- Pagefind indexes recipe pages (verify via built output)

## Tasks

- [ ] **T01: Author happy-path recipe pages (fix-a-bug, small-change, new-milestone)** `est:45m`
  - Why: These three recipes cover the core GSD workflows that every user needs — fixing bugs via the full lifecycle, making small changes via `/gsd quick`, and starting new milestones on existing projects. They're the most-referenced patterns.
  - Files: `src/content/docs/recipes/fix-a-bug.mdx`, `src/content/docs/recipes/small-change.mdx`, `src/content/docs/recipes/new-milestone.mdx`
  - Do: Create `src/content/docs/recipes/` directory. Author 3 recipe MDX files following the consistent structure (When to Use This, Prerequisites, Steps, What Gets Created, Flow Diagram). Use Cookmate scenarios. Each recipe gets one Mermaid flowchart with dark terminal theme. Reference existing command deep-dive pages where relevant (e.g., link to `/commands/quick/` from small-change recipe). Study GSD source prompts for accuracy: `prompts/discuss.md`, `prompts/quick-task.md`, `prompts/guided-discuss-milestone.md`, `prompts/plan-milestone.md`.
  - Verify: All 3 `.mdx` files exist, each has frontmatter with title/description, each contains a mermaid code block
  - Done when: 3 recipe files in `src/content/docs/recipes/`, each with scenario, steps, directory trees, Mermaid diagram, and outcomes

- [ ] **T02: Author recovery and collaboration recipe pages (uat-failures, error-recovery, working-in-teams)** `est:45m`
  - Why: These three recipes cover what happens when things go wrong (UAT failures, errors/crashes) and how teams collaborate — the "what if" scenarios users need after learning the happy path.
  - Files: `src/content/docs/recipes/uat-failures.mdx`, `src/content/docs/recipes/error-recovery.mdx`, `src/content/docs/recipes/working-in-teams.mdx`
  - Do: Author 3 recipe MDX files following the same structure as T01. UAT failures recipe covers the replan flow (UAT fail → replan → re-execute). Error recovery covers `/gsd doctor`, `/gsd forensics`, crash recovery locks, manual state repair. Working in teams covers team mode setup, unique milestone IDs, push branches, concurrent workflows. Study GSD source for accuracy: `prompts/run-uat.md`, `prompts/replan-slice.md`, `auto-dispatch.ts` (UAT dispatch lines), `prompts/doctor-heal.md`, `prompts/forensics.md`, existing `working-in-teams.md` guide. Each recipe gets one Mermaid flowchart with dark terminal theme.
  - Verify: All 3 `.mdx` files exist, each has frontmatter with title/description, each contains a mermaid code block
  - Done when: 3 recipe files in `src/content/docs/recipes/`, each with scenario, steps, directory trees, Mermaid diagram, and outcomes

- [ ] **T03: Wire sidebar entries and verify full build** `est:15m`
  - Why: Recipe pages must be reachable from the sidebar and indexed by search. This task adds the sidebar entries and runs the full verification suite to confirm everything works end-to-end.
  - Files: `astro.config.mjs`
  - Do: Add 6 sidebar entries to the Recipes section in `astro.config.mjs`, positioned before the existing 8 guide entries. Use format `{ label: 'Recipe: <Title>', link: '/recipes/<slug>/' }`. Run `npm run build` and `node scripts/check-links.mjs`. Verify all 6 recipe pages appear in `dist/recipes/*/index.html`. Verify Pagefind indexes them.
  - Verify: `npm run build` exits 0, `node scripts/check-links.mjs` exits 0, `ls dist/recipes/*/index.html | wc -l` returns 6, `grep -c "recipes/" astro.config.mjs` returns 6
  - Done when: All 6 recipes reachable via sidebar, build passes, link check passes, Pagefind indexes recipe content

## Files Likely Touched

- `src/content/docs/recipes/fix-a-bug.mdx`
- `src/content/docs/recipes/small-change.mdx`
- `src/content/docs/recipes/new-milestone.mdx`
- `src/content/docs/recipes/uat-failures.mdx`
- `src/content/docs/recipes/error-recovery.mdx`
- `src/content/docs/recipes/working-in-teams.mdx`
- `astro.config.mjs`
