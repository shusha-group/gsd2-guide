# S04 Brief Writing + Cost Examples — Research

**Date:** 2026-04-02
**Depth:** Light — two new hand-authored MDX pages using established patterns from S01–S03.

## Summary

This slice delivers two new pages: a "Writing a Good Brief" guide (R078) and a "Cost Examples" page (R079). Both are hand-authored MDX files placed directly in `src/content/docs/`. The patterns are identical to those used by S01's quick-reference and decision-guide pages — standalone MDX with Starlight frontmatter, Australian English, cross-links using `../sibling/` format.

The existing content provides strong foundations. `src/content/docs/solo-guide/first-project.mdx` already covers the discussion phase and what makes good requirements (Phase 1). `src/content/docs/solo-guide/controlling-costs.mdx` has detailed coverage of token profiles, model routing, and budget management. The new pages should complement these — not duplicate them — by providing concrete examples (bad-vs-good requirements) and dollar-denominated cost scenarios that the existing pages don't include.

## Recommendation

Create two new MDX files at the root of `src/content/docs/`:
1. `writing-a-good-brief.mdx` — bad-vs-good requirement examples, what makes a discussion productive, common mistakes
2. `cost-examples.mdx` — 3 milestone scenarios (small/medium/large) with approximate dollar costs, token counts, and what drives the bill

Both pages link to the existing Solo Guide sections for deeper coverage. No sidebar changes needed in this slice (S05 handles navigation). No pipeline integration — these are static hand-authored content.

## Implementation Landscape

### Key Files

- `src/content/docs/writing-a-good-brief.mdx` — **new**. Bad-vs-good requirement examples, discussion tips. Links to `../solo-guide/first-project/` for the full walkthrough.
- `src/content/docs/cost-examples.mdx` — **new**. Three milestone cost scenarios with dollar ranges. Links to `../solo-guide/controlling-costs/` and `../cost-management/` for the mechanics.
- `src/content/docs/solo-guide/first-project.mdx` — existing. Covers the discussion protocol, what REQUIREMENTS.md / CONTEXT.md / ROADMAP.md are. The new brief-writing page should reference this, not repeat it.
- `src/content/docs/solo-guide/controlling-costs.mdx` — existing. Covers token profiles, model routing, budget ceilings. The new cost-examples page should reference this for the "how to control costs" side, while itself focusing on "what does it actually cost?"
- `src/content/docs/cost-management.md` — existing reference page. Covers `/gsd status` cost tracking, budget ceiling, metrics.json. Generated content — don't edit.
- `src/content/docs/token-optimization.md` — existing reference page. Token profile tables, compression details. Generated content — don't edit.

### Build Order

1. **Writing a Good Brief page first** — independent, no dependencies. Create the MDX, verify it builds.
2. **Cost Examples page second** — independent, no dependencies. Create the MDX, verify it builds.
3. **Build + link check** — `npm run build && npm run check-links` to confirm both pages render and all cross-links resolve.

### Patterns to Follow

- Frontmatter: `title` and `description` fields, matching the pattern in `quick-reference.mdx` and `is-gsd-right-for-me.mdx` from S01.
- Cross-links: `→ gsd2-guide: [Label](../path/)` format used throughout the solo guide.
- Australian English: "optimise", "recognise", "colour", etc.
- Starlight components: `Card`, `CardGrid`, `Tabs`, `TabItem` available from `@astrojs/starlight/components`. Callouts via `:::tip`, `:::caution` directives.
- MDX curly-brace escaping: wrap any `{variable}` template literals in backticks per KNOWLEDGE.md.

### Verification

- `npm run build` exits 0
- `dist/writing-a-good-brief/index.html` exists
- `dist/cost-examples/index.html` exists
- `npm run check-links` exits 0

### Requirements Targeted

- **R078** — Writing a good brief guide (primary owner: M007/S04). Bad-vs-good examples, discussion tips.
- **R079** — Concrete cost examples (primary owner: M007/S04). Dollar ranges for 3 milestone scenarios.

### Skills Discovered

No new skills needed. Astro Starlight patterns are well-established in the codebase.
