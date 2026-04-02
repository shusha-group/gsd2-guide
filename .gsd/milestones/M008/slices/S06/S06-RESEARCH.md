# S06: New Content Pages — Research

**Date:** 2026-04-03

## Summary

S06 creates 7 new hand-authored pages and rewrites 1 existing page. The pages are: Choose Your Path (3 learning paths), rewritten Is GSD Right for Me (decision tree), 3 bridge pages (Coming from Replit/Lovable/Cursor), FAQ, and Glossary. All are straightforward MDX/MD content authoring following established patterns from S03–S05. No new technology, no pipeline changes, no component work.

The primary risk is link integrity — every page links to existing content and must be wired into the sidebar. The bridge pages are unlisted in the sidebar (linked from Is GSD Right for Me only per R094). FAQ goes under Start Here, Glossary under Learn More, Choose Your Path under Start Here.

## Recommendation

Author all pages as hand-authored `.mdx` files in `src/content/docs/`. Do NOT add them to `.generated-manifest.json`. Wire sidebar entries in `astro.config.mjs`. Build and link-check after each logical batch. Natural batches: (1) Choose Your Path + Is GSD Right for Me rewrite (they cross-reference heavily), (2) 3 bridge pages (unlisted, linked from Is GSD Right for Me), (3) FAQ + Glossary (independent).

## Implementation Landscape

### Key Files

- `src/content/docs/is-gsd-right-for-me.md` — Existing page, needs full rewrite to decision-tree format per R093. Currently 35 lines of prose with "built for this / not built for this" structure. Rewrite to "Where are you coming from?" with 3 persona sections routing to learning paths.
- `src/content/docs/choose-your-path.mdx` — **New.** Core routing page per R092. Three numbered reading-order checklists. Use Starlight `Steps` or numbered lists. Every link must resolve.
- `src/content/docs/coming-from-replit.mdx` — **New.** Bridge page per R094. Comparison table + path recommendation → Solo Builder path.
- `src/content/docs/coming-from-lovable.mdx` — **New.** Bridge page per R094. Same pattern → Solo Builder path.
- `src/content/docs/coming-from-cursor.mdx` — **New.** Bridge page per R094. Same pattern → Developer path.
- `src/content/docs/faq.mdx` — **New.** Per R095. 11 common objections/anxieties. Direct, reassuring tone. Under Start Here.
- `src/content/docs/glossary.md` — **New.** Per R096. ~25 GSD terms defined. Under Learn More.
- `astro.config.mjs` — Add sidebar entries: Choose Your Path and FAQ under Start Here, Glossary under Learn More. Bridge pages are unlisted (no sidebar entry).

### Build Order

1. **Choose Your Path + Is GSD Right for Me rewrite** — these cross-reference each other and are the core persona routing. Build first, verify links.
2. **3 bridge pages** — linked from Is GSD Right for Me. Build together, verify links.
3. **FAQ + Glossary** — independent pages. Build last, final link check.
4. **Sidebar wiring** — add entries to astro.config.mjs for Choose Your Path (Start Here, after "Is GSD Right for Me?"), FAQ (Start Here, after Choose Your Path), Glossary (Learn More, near end).

### Verification Approach

- `npm run build` — must exit 0 with no broken page errors
- `npm run check-links` — must report 0 broken internal links
- Manual: confirm new sidebar entries appear in correct positions
- Manual: confirm bridge pages do NOT appear in sidebar
- Verify every link in Choose Your Path checklists resolves to an existing page

## Constraints

- Hand-authored pages must NOT go in `.generated-manifest.json` or `page-source-map.json`
- Bridge pages are unlisted in sidebar (R094) — they exist as pages but get no sidebar entry
- Australian English throughout
- MDX curly braces must be escaped in code blocks (knowledge base item)
- Starlight link format: use `../sibling/` relative links (knowledge base item)

## Common Pitfalls

- **Adding hand-authored pages to generated-manifest** — prebuild.mjs will overwrite them. Only add to `src/content/docs/`.
- **Broken relative links in MDX** — Starlight needs `../page/` format, not `/page/`. Use relative links consistently.
- **Choose Your Path links to non-existent pages** — every item in the 3 checklists must point to a real page. Cross-check against sidebar items in astro.config.mjs.