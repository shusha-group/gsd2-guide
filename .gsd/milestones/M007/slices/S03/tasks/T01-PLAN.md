---
estimated_steps: 31
estimated_files: 4
skills_used: []
---

# T01: Create 3 standalone MDX pages and add sidebar entries

Create three new hand-authored MDX pages covering auto mode (12-point breakdown + verification ladder), .gsd/ directory structure, and v1→v2 comparison. Add all three to the sidebar in astro.config.mjs.

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

## Inputs

- `src/content/docs/solo-guide/first-project.mdx`
- `src/content/docs/solo-guide/why-gsd.mdx`
- `src/content/docs/solo-guide/building-rhythm.mdx`
- `astro.config.mjs`

## Expected Output

- `src/content/docs/how-auto-mode-works.mdx`
- `src/content/docs/gsd-directory.mdx`
- `src/content/docs/v1-to-v2.mdx`
- `astro.config.mjs`

## Verification

All 3 files exist with valid frontmatter. `grep -c 'how-auto-mode-works\|gsd-directory\|v1-to-v2' astro.config.mjs` returns 3. Quick scan of each file confirms narrative voice and cross-links.
