# S04: Deep-dive documentation pages — Research

**Date:** 2026-03-17
**Depth:** Targeted

## Summary

S04's job is to make all 126 extracted docs **navigable, linked, and organized** — not just rendered. The build already works: `npm run build` produces 137 pages including all 126 docs. The content flows through the prebuild pipeline (S01 → prebuild → Starlight). But the site has three structural problems that make the docs unusable as a documentation resource:

1. **20 root-level pages are orphaned from the sidebar.** Pages like getting-started, auto-mode, architecture, configuration, troubleshooting, etc. exist as rendered HTML but have no sidebar entry. The current sidebar `autogenerate: { directory: 'getting-started' }` expects a `getting-started/` folder, but the file is at `src/content/docs/getting-started.md` (root level). Users can only find these pages through search or direct URL.

2. **144 internal links are broken.** Source docs use `[link text](./page.md)` and `[link text](./page.md#section)` format. Starlight routes pages as `/page-name/` not `/page-name.md`. Every relative `.md` link 404s. The prebuild script must rewrite these.

3. **README.md files appear as `/readme/` instead of section index pages.** Each subdirectory has a README.md that serves as a table of contents. Starlight renders them as `/building-coding-agents/readme/` — awkward and at the bottom of each sidebar group. They should become `index.md` pages.

The work is fundamentally about **enhancing the prebuild script** to handle these three issues, then **reorganizing the sidebar** in `astro.config.mjs` to give all 126 pages logical homes. No new Astro components, no new npm dependencies, no new architecture.

## Recommendation

Enhance `scripts/prebuild.mjs` with three new transformations, reorganize the sidebar, and remove the placeholder pages that are superseded by real content.

## Implementation Landscape

### Key Files

- `scripts/prebuild.mjs` — The sole file that transforms S01 output into Starlight content. Currently handles frontmatter injection and heading stripping. Needs: link rewriting, README→index renaming, root-level doc routing, sidebar ordering frontmatter.
- `astro.config.mjs` — Sidebar configuration. Currently has an empty "Getting Started" autogenerate and subdirectory autogenerates. Needs: reorganized sidebar with groups for root-level docs, removal of Placeholder group.
- `src/content/docs/index.mdx` — Landing page. Needs: updated links pointing to the new doc organization.
- `src/content/docs/placeholder/` — Three placeholder pages. Should be removed — they were scaffolding demos from S02.

### Build Order

1. **T01: Prebuild link rewriting + README→index.** Riskiest work — link rewriting has edge cases. Also rename README→index and inject sidebar ordering frontmatter.
2. **T02: Sidebar reorganization + placeholder cleanup.** Update sidebar config, remove placeholders, update landing page links.
3. **T03: Build verification + broken link check.** Full build, verify page count, link resolution, sidebar completeness.

### Verification Approach

- `npm run build` exits 0 with ≥130 pages
- Every page has a sidebar entry (no orphans)
- Sample 10+ internal links resolve correctly in HTML output
- No `/readme/` pages in sidebar
- Pagefind indexes all pages