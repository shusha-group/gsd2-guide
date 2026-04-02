# S05: Navigation Polish — Research

**Date:** 2026-04-02

## Summary

S05 is a straightforward sidebar restructuring task in `astro.config.mjs`. The current sidebar has structural issues: two new pages from S04 (`writing-a-good-brief` and `cost-examples`) are not in the sidebar at all, three misplaced prompt entries sit inside the Commands group, and the new M007 content (Deep Dives, Getting Started pages) could be better ordered for a new-user reading flow. No pages need to be created or moved on disk — this is purely sidebar config editing plus verifying no URLs break.

The work is a single-file edit to `astro.config.mjs`'s sidebar array, plus a build and link-check verification pass.

## Recommendation

Single task: restructure the sidebar in `astro.config.mjs` to surface all M007 content, fix misplaced items, and establish a logical top-to-bottom flow for new users. Verify with `npm run build` + `npm run check-links`. No cross-links need adding beyond what S01-S04 already wired.

## Implementation Landscape

### Key Files

- `astro.config.mjs` — The only file that needs editing. Contains the full sidebar config (~200 lines). All sidebar groups and links defined here.

### Current Sidebar Issues

1. **Missing pages:** `writing-a-good-brief` and `cost-examples` (from S04) are not in the sidebar
2. **Misplaced prompts:** Three prompt entries (`gate-evaluate`, `reactive-execute`, `rethink`) are dangling at the bottom of the Commands group instead of inside the Prompts group
3. **Proposed group order for new-user flow:**
   - Home
   - Getting Started (Decision Guide → Quick Reference → Installation → ...)
   - Solo Builder's Guide (the main narrative)
   - Deep Dives (auto mode, .gsd/ directory, v1 vs v2)
   - Guides group (merge "Writing a Good Brief", "Cost Examples" with existing how-to content — or add them to a new "Planning" subgroup under Solo Builder's Guide)
   - Changelog Highlights → Changelog
   - Commands / Prompts / Recipes / Reference / How-to Guides (existing)

4. **S04 pages placement:** `writing-a-good-brief` and `cost-examples` fit logically in the Getting Started group (they help new users plan their first milestone) or a new "Planning" group near the Solo Builder's Guide.

### Build Order

1. Edit `astro.config.mjs` sidebar — add missing pages, fix misplaced prompts, reorder groups
2. `npm run build` — confirm pages still build (page count should remain 148)
3. `npm run check-links` — confirm 0 broken links

### Verification Approach

- `npm run build` exits 0, page count ≥ 148
- `npm run check-links` exits 0, 0 broken links
- `grep` for `writing-a-good-brief` and `cost-examples` in `astro.config.mjs` confirms they're present
- `grep` for `gate-evaluate` confirms it's inside the Prompts section, not Commands

## Constraints

- No existing URLs may break — Starlight URLs come from file paths, not sidebar config, so reordering sidebar groups is safe
- Sidebar entries are just links — moving them between groups doesn't affect the generated URL
- The three misplaced prompt entries must go into the correct Prompts subgroup

## Common Pitfalls

- **Misplaced closing brackets** — the sidebar config is deeply nested JS arrays; a bracket error breaks the entire build. Edit carefully with exact text matching.
