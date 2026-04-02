---
estimated_steps: 12
estimated_files: 3
skills_used: []
---

# T02: Add cross-reference sections to existing solo-guide pages and verify build

Add short cross-reference subsections to 3 existing solo-guide MDX pages, then run full build + link verification.

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

## Inputs

- `src/content/docs/solo-guide/context-engineering.mdx`
- `src/content/docs/solo-guide/controlling-costs.mdx`
- `src/content/docs/solo-guide/building-rhythm.mdx`
- `src/content/docs/how-auto-mode-works.mdx`
- `src/content/docs/gsd-directory.mdx`
- `src/content/docs/v1-to-v2.mdx`

## Expected Output

- `src/content/docs/solo-guide/context-engineering.mdx`
- `src/content/docs/solo-guide/controlling-costs.mdx`
- `src/content/docs/solo-guide/building-rhythm.mdx`

## Verification

`npm run build` exits 0. `npm run check-links` exits 0 with 0 broken links.
