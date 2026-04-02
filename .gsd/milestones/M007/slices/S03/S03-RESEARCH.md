# S03 Research: Content Consolidation

## Summary

This is **targeted research**. The work involves writing narrative MDX content integrating 7 official-docs topics into the guide. The technology (Astro Starlight MDX) and patterns (solo-guide section pages) are well-established in this codebase. The main constraint is that many existing pages are pipeline-generated and cannot be edited directly.

## Requirement

**R076** — Cross-referenced content consolidation. Seven content areas must be integrated in the guide's own voice:
1. Auto mode 12-point breakdown
2. `.gsd/` directory structure
3. Verification ladder (contract/integration/operational)
4. v1→v2 comparison
5. Git strategy gaps (what the solo guide doesn't cover from git-strategy.md)
6. Token optimisation gaps (what the solo guide doesn't cover from token-optimization.md)
7. Preferences summary with link

**D073** — Narrative integration in the guide's own voice, linking to official docs for edge cases.

## Critical Constraint: Generated vs Hand-Authored Files

The following pages are in `.generated-manifest.json` and are **overwritten on every build**:
- `auto-mode.md` (303 lines)
- `migration.md` (50 lines)
- `git-strategy.md` (189 lines)
- `token-optimization.md` (328 lines)
- `configuration.md` (791 lines — contains preferences)
- `architecture.md` (164 lines)

**These files CANNOT be edited.** All new content must go into:
- Existing hand-authored solo-guide MDX files (`src/content/docs/solo-guide/*.mdx`)
- New hand-authored MDX files in `src/content/docs/`

## Existing Coverage in Solo Guide

The solo guide already touches these topics lightly:
- **Auto mode**: `first-project.mdx` line 71 mentions the 4-phase loop (research→plan→execute→verify). `why-gsd.mdx` covers context window motivation.
- **`.gsd/` directory**: `first-project.mdx` lines 114-142 show a directory tree. `building-rhythm.mdx` line 89 discusses `.gsd/` as project memory. `when-things-go-wrong.mdx` references `.gsd/auto.lock` and `STATE.md`.
- **Verification**: `first-project.mdx` line 29 mentions REQUIREMENTS.md as the "capability contract" and line 104 mentions milestone validation.
- **Costs/tokens**: `controlling-costs.mdx` is a full section (Section 6).
- **Git strategy**: Not covered in solo guide beyond passing mentions.
- **v1→v2**: Not covered in solo guide at all.
- **Preferences**: Not covered in solo guide.

## Recommendation: Content Placement

Rather than adding subsections to existing solo-guide pages (which are already well-structured narratives), create **new standalone pages** that live alongside the solo guide and are cross-linked from it. This avoids bloating the existing 8-section narrative arc.

Proposed new pages (hand-authored, in `src/content/docs/`):

| Page | Content Areas Covered | Lines (est.) |
|------|----------------------|-------------|
| `how-auto-mode-works.mdx` | Auto mode 12-point breakdown, verification ladder | ~200 |
| `gsd-directory.mdx` | `.gsd/` directory structure with annotated tree | ~120 |
| `v1-to-v2.mdx` | Narrative v1→v2 comparison (not migration steps — those are in generated migration.md) | ~100 |

For the remaining areas (git strategy gaps, token optimisation gaps, preferences summary), add **short cross-reference sections** at the bottom of existing solo-guide pages:
- `context-engineering.mdx` — add a "Preferences" subsection linking to configuration.md
- `controlling-costs.mdx` — add "Token Optimisation Deep Dive" subsection linking to token-optimization.md
- `building-rhythm.mdx` or `daily-mix.mdx` — add "Git Strategy" subsection linking to git-strategy.md

## Implementation Landscape

### File locations
- New pages: `src/content/docs/how-auto-mode-works.mdx`, `src/content/docs/gsd-directory.mdx`, `src/content/docs/v1-to-v2.mdx`
- Modified pages: 2-3 existing solo-guide MDX files (append cross-ref sections)
- Sidebar: `astro.config.mjs` — add new pages to appropriate sidebar groups

### Patterns to follow
- Frontmatter: `title` + `description` fields (see any solo-guide MDX)
- Voice: Second person, Australian English, practitioner-focused (see solo-guide pages)
- Cross-links: Use `../page-slug/` relative format per knowledge base
- Starlight components: Can import `Card`, `CardGrid`, `LinkCard`, `Tabs`, `TabItem`, `Steps`, `FileTree` from `@astrojs/starlight/components`
- Callouts: Use `:::note`, `:::tip` directives

### Verification
- `npm run build` must pass (exits 0)
- `npm run check-links` must pass (0 broken links)
- New pages must appear in sidebar
- No existing URLs broken

### Seams for task decomposition
1. **New standalone pages** (3 new MDX files) — independent, can be written in parallel
2. **Cross-reference additions** to existing solo-guide pages — light edits, depends on knowing final page slugs from task 1
3. **Sidebar configuration** — add new pages to astro.config.mjs
4. **Build verification** — `npm run build` + `npm run check-links`

Tasks 1-3 can be combined into 2-3 tasks. Task 4 is verification only.

## Skills Discovered

No new skills needed — Astro Starlight MDX authoring uses standard patterns already in the codebase.
