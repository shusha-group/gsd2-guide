# S04 Research: Homepage Rewrite

**Depth:** Light — straightforward content restructure using established Starlight components on a single file.

## Summary

The homepage (`src/content/docs/index.mdx`, 82 lines) needs rewriting to add persona cards, retain the How GSD Works mermaid diagram, restructure the link cards into Common Tasks and Go Deeper sections, and ensure all links resolve to existing pages. This is a single-file content change using components already imported (`CardGrid`, `LinkCard`). Additional components available: `Card`, `Tabs`, `TabItem`, `Badge`, `Aside`, `LinkButton`.

## Relevant Requirements

- **R088** (primary owner) — Homepage with persona-aware cards: three self-selecting persona cards (solo builder, developer, experienced AI dev) routing to appropriate starting points, plus How GSD Works section, Common Tasks recipes, and Go Deeper links.
- **R097** (supports) — Zero broken internal links after restructure.

## Implementation Landscape

### Current State
- **File:** `src/content/docs/index.mdx` — 82 lines, uses `template: doc` frontmatter
- **Hero:** Title "GSD 2", tagline, 3 action buttons (Getting Started, Developing with GSD, GitHub)
- **Sections:** Learn GSD (2 LinkCards), How GSD Works (Mermaid diagram), Commands (4 LinkCards), Recipes (4 LinkCards), Reference & Guides (5 LinkCards)
- **Components used:** `CardGrid`, `LinkCard` from `@astrojs/starlight/components`

### Target State (per R088 and milestone context)
1. **Persona cards** — 3 cards for self-selection:
   - Solo Business Builder → `/gsd2-guide/solo-guide/` (existing)
   - Developer New to AI Coding → `/gsd2-guide/getting-started/` (existing)
   - Experienced AI Developer → `/gsd2-guide/commands/` or similar (existing)
2. **How GSD Works** — keep the existing Mermaid diagram (already present)
3. **Common Tasks** — recipe links (subset of existing Recipes cards)
4. **Go Deeper** — architecture, auto-mode, reference links

### Available Starlight Components
All in `@astrojs/starlight/components`: `Card`, `CardGrid`, `LinkCard`, `LinkButton`, `Tabs`, `TabItem`, `Badge`, `Aside`, `Steps`, `Icon`.

`Card` (vs `LinkCard`) allows richer content inside — better for persona cards that need a description + CTA link rather than being a single link target.

### Link Targets (all verified to exist)
- `/gsd2-guide/solo-guide/` — Solo Builder's Guide overview
- `/gsd2-guide/getting-started/` — Getting Started page
- `/gsd2-guide/commands/` — Commands reference
- `/gsd2-guide/auto-mode/` — Auto Mode
- `/gsd2-guide/architecture/` — Architecture
- `/gsd2-guide/reference/` — Quick Reference Cards
- `/gsd2-guide/recipes/fix-a-bug/` — Fix a Bug recipe
- `/gsd2-guide/recipes/small-change/` — Small Change recipe
- `/gsd2-guide/recipes/error-recovery/` — Error Recovery recipe
- `/gsd2-guide/is-gsd-right-for-me/` — Is GSD Right for Me
- `/gsd2-guide/user-guide/developing-with-gsd/` — Developing with GSD walkthrough

### Hero Actions
Consider updating hero CTAs to reflect persona routing — e.g. primary CTA "Choose Your Path" pointing to a future choose-your-path page (S06), or keep "Getting Started" as safe default until S06 delivers.

**Decision needed:** S06 creates the Choose Your Path page. The homepage hero CTA could link to it, but S06 may not be complete when S04 ships. Safe approach: keep hero CTA as "Getting Started" or link to "Is GSD Right for Me" which already exists.

## Recommendation

Single task: rewrite `index.mdx`. Structure:
1. Hero — keep or lightly update tagline, adjust CTAs
2. Persona cards section — 3 `Card` components inside `CardGrid`, each with title, 1-2 sentence description, and a link to the appropriate entry point
3. How GSD Works — keep existing Mermaid diagram as-is
4. Common Tasks — 3-4 `LinkCard` recipe links
5. Go Deeper — 3-4 `LinkCard` links to architecture, auto-mode, reference, troubleshooting

Verify with `npm run build` (0 errors) + `npm run check-links` (0 broken links).

## Constraints
- `template: doc` must remain in frontmatter for consistent sidebar rendering (S01 fix)
- All `href` values must use `/gsd2-guide/` prefix (base path)
- Australian English throughout
- Do NOT add pages to `.generated-manifest.json`

## Skills Discovered
None needed — standard Starlight/Astro MDX authoring with established patterns.
