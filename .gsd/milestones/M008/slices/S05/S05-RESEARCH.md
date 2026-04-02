# S05 Cross-linking & Wayfinding — Research

**Date:** 2026-04-03

## Summary

The slice has three deliverables: (1) prev/next pagination on Solo Guide pages, (2) "Next Steps" blocks on all content pages, and (3) audience-bridging callouts on 7+ pages. The critical discovery is that **prev/next pagination is completely broken site-wide** because the custom `src/components/Footer.astro` override replaces Starlight's default Footer without including the `<Pagination />` component. The default Footer at `node_modules/@astrojs/starlight/components/Footer.astro` imports and renders `Pagination`; our override does not. This is a one-line fix — import and render Pagination in the custom Footer.

The Solo Guide pages are already correctly ordered in the sidebar (Overview → 1-8), so once Pagination is restored, prev/next links will appear automatically on all pages site-wide, not just Solo Guide. The "Next Steps" blocks and audience-bridging callouts are straightforward content additions to existing pages.

## Recommendation

Three tasks in order: (1) Fix Footer.astro to include Pagination — this is the riskiest and most impactful change, (2) Add "Next Steps" sections to content pages that lack them, (3) Add audience-bridging callouts (:::tip blocks) to 7+ pages that serve multiple personas.

## Implementation Landscape

### Key Files

- `src/components/Footer.astro` — Must import Pagination from `'virtual:starlight/components/Pagination'` and render `<Pagination />` above the existing footer markup. The default Footer.astro in Starlight shows the pattern.
- `src/content/docs/solo-guide/*.mdx` (9 files) — Will automatically get prev/next once Footer is fixed. No frontmatter changes needed — sidebar order drives pagination.
- `src/content/docs/auto-mode.md` — Candidate for audience-bridging callout (links solo builders to simpler recipes, links devs to internals)
- `src/content/docs/getting-started.md` — Candidate for callout + Next Steps
- `src/content/docs/configuration.md` — Candidate for callout
- `src/content/docs/skills-extensions-agents.md` — Candidate for callout
- `src/content/docs/recipes/control-your-costs.md` — Candidate for callout
- `src/content/docs/is-gsd-right-for-me.md` — Candidate for callout
- `src/content/docs/quick-reference.md` — Candidate for callout + Next Steps

### Build Order

1. **Fix Footer.astro** — Unblocks prev/next site-wide. Verify by building and checking `grep 'pagination-links' dist/solo-guide/first-project/index.html`. This is the highest-risk item (component override pattern).
2. **Add Next Steps blocks** — Add `## Next Steps` with 2-3 LinkCards to pages that currently end abruptly. These are content-only edits, no structural risk.
3. **Add audience-bridging callouts** — Add `:::tip` callout blocks on 7+ pages that say things like "Solo builder? Start with [Solo Guide](../solo-guide/). Developer? Jump to [Commands](../commands/)." Pure content additions.

### Verification Approach

- `npm run build` — must exit 0 with 150 pages
- `npm run check-links` — must report 0 broken links
- `grep -c 'pagination-links' dist/solo-guide/first-project/index.html` — must be ≥1 (confirms pagination restored)
- `grep -c 'pagination-links' dist/auto-mode/index.html` — confirms pagination is site-wide
- `grep -rl '## Next Steps' src/content/docs/` — confirms Next Steps blocks were added
- `grep -rl ':::tip' src/content/docs/ | wc -l` — confirms callouts on 7+ pages

## Constraints

- Footer.astro must import Pagination from `'virtual:starlight/components/Pagination'` (not a relative path) — this is the Starlight virtual module pattern
- Solo Guide pages are `.mdx` (not `.md`) — callout syntax `:::tip` works in both but imports use MDX syntax
- Pages in `.generated-manifest.json` must not be edited directly — check before adding Next Steps to any page
- Australian English throughout

## Common Pitfalls

- **Editing Footer.astro incorrectly** — Must preserve existing custom footer markup AND add Pagination. The Pagination component should go above the custom footer div, matching Starlight's default layout where Pagination comes before the credits section.
- **Adding Next Steps to generated pages** — Check `.generated-manifest.json` before editing. Generated pages will have edits overwritten by `prebuild.mjs`. Only add Next Steps to hand-authored pages.
