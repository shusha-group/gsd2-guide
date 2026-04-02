# S03: Content Consolidation

**Goal:** Auto mode breakdown, .gsd/ directory structure, verification ladder, and v1→v2 comparison are integrated into the guide as standalone pages in the guide's own voice, with cross-references from existing solo-guide pages.
**Demo:** After this: After this: auto mode breakdown, .gsd/ directory structure, verification ladder, and v1→v2 comparison are integrated into existing guide pages in the guide's own voice.

## Tasks
- [x] **T01: Created three hand-authored deep-dive pages (auto mode, .gsd/ directory, v1→v2 comparison) and wired them into a new Deep Dives sidebar group.** — Create three new hand-authored MDX pages covering auto mode (12-point breakdown + verification ladder), .gsd/ directory structure, and v1→v2 comparison. Add all three to the sidebar in astro.config.mjs.

## Critical Constraints
- Files in `.generated-manifest.json` are overwritten on build — do NOT edit them. The generated pages include `auto-mode.md`, `migration.md`, `configuration.md`, `architecture.md`, `git-strategy.md`, `token-optimization.md`.
- New pages go in `src/content/docs/` (not inside `solo-guide/`).
- Use `../page-slug/` relative link format (Starlight convention).
- MDX curly braces: wrap any `{{variable}}` literals in backticks to avoid JSX parse errors.
- Available Starlight components: `Card`, `CardGrid`, `LinkCard`, `Badge`, `Tabs`, `TabItem`, `Steps`, `FileTree`, `Icon`, `LinkButton` from `@astrojs/starlight/components`. Callouts use `:::note`, `:::tip` directives.

## Voice & Style
- Second person, Australian English, practitioner-focused (match the solo-guide pages)
- Narrative integration per D073: write concepts in the guide's own voice, link to official docs for edge cases
- Cross-link to generated reference pages where appropriate (e.g. link to `../auto-mode/` for the full generated auto-mode reference)

## Page 1: `how-auto-mode-works.mdx` (~200 lines)
Frontmatter: title + description. Content covers:
1. The 12-point auto-mode breakdown (research → plan → execute → verify cycle, with the sub-phases: milestone planning, slice research, slice planning, task execution, task completion, slice completion, roadmap reassessment, milestone validation, milestone completion, quality gates, replanning, and the orchestration loop)
2. The verification ladder: contract verification (unit/type checks), integration verification (cross-boundary), operational verification (build + deploy), and how GSD uses all three
3. Link to the generated `../auto-mode/` page for the full reference

## Page 2: `gsd-directory.mdx` (~120 lines)
Frontmatter: title + description. Content covers:
1. Annotated directory tree of `.gsd/` using the `FileTree` Starlight component
2. What each file/directory does in plain language
3. Which files are human-authored vs machine-generated
4. How `.gsd/` accumulates as project memory across milestones
5. Link to `../architecture/` for system-level view

## Page 3: `v1-to-v2.mdx` (~100 lines)
Frontmatter: title + description. Content covers:
1. Narrative comparison of v1 vs v2 philosophy (not migration steps — those are in generated `migration.md`)
2. Key differences: fresh-context model, structured milestone lifecycle, quality gates, verification contracts
3. Why v2 exists — what problems v1 had that v2 solves
4. Link to `../migration/` for actual migration steps

## Sidebar
Add a new sidebar group in `astro.config.mjs` (after the Solo Builder's Guide group, before Getting Started) called 'Deep Dives' containing the 3 new pages. Follow existing sidebar item format: `{ label: 'Label', link: '/slug/' }`.
  - Estimate: 30 min
  - Files: src/content/docs/how-auto-mode-works.mdx, src/content/docs/gsd-directory.mdx, src/content/docs/v1-to-v2.mdx, astro.config.mjs
  - Verify: All 3 files exist with valid frontmatter. `grep -c 'how-auto-mode-works\|gsd-directory\|v1-to-v2' astro.config.mjs` returns 3. Quick scan of each file confirms narrative voice and cross-links.
- [ ] **T02: Add cross-reference sections to existing solo-guide pages and verify build** — Add short cross-reference subsections to 3 existing solo-guide MDX pages, then run full build + link verification.

## Cross-Reference Additions

### 1. `src/content/docs/solo-guide/context-engineering.mdx`
Append a 'Preferences' subsection before the final `*This is Section 5*` line. Content: 2-3 paragraphs explaining that GSD preferences let you tune behaviour per-project (token profiles, model routing, auto-mode depth). Link to `../../configuration/` for the full reference and to the new `../../how-auto-mode-works/` page.

### 2. `src/content/docs/solo-guide/controlling-costs.mdx`
Append a 'Token Optimisation Deep Dive' subsection before the final `*This is Section 6*` line. Content: 1-2 paragraphs noting that GSD applies token optimisation strategies (context compression, incremental delivery, selective file inclusion) and linking to `../../token-optimization/` for the full reference.

### 3. `src/content/docs/solo-guide/building-rhythm.mdx`
Append a 'Git Strategy' subsection before the final `*This is Section 8*` line. Content: 1-2 paragraphs noting GSD's git strategy (worktrees for isolation, atomic commits, branch-per-milestone) and linking to `../../git-strategy/` for the full reference. Also add a cross-link to `../../gsd-directory/` and `../../v1-to-v2/` where relevant.

## Voice
Match the existing page voice exactly — second person, practitioner-focused, Australian English.

## Verification
Run `npm run build` (must exit 0) and `npm run check-links` (must exit 0, 0 broken links). These verify all new pages render, all cross-links resolve, and no existing URLs are broken.
  - Estimate: 15 min
  - Files: src/content/docs/solo-guide/context-engineering.mdx, src/content/docs/solo-guide/controlling-costs.mdx, src/content/docs/solo-guide/building-rhythm.mdx
  - Verify: `npm run build` exits 0. `npm run check-links` exits 0 with 0 broken links.
