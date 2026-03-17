---
estimated_steps: 5
estimated_files: 1
---

# T03: Wire sidebar entries and verify full build

**Slice:** S04 — Core workflow recipes
**Milestone:** M002

## Description

Add the 6 new recipe pages to the sidebar in `astro.config.mjs` and run the full verification suite: build, link check, file counts, Pagefind indexing. This is the integration step that makes the recipes discoverable.

## Steps

1. Open `astro.config.mjs` and locate the Recipes sidebar section (around line 64). Add 6 new entries at the **top** of the items array, before the existing 8 guide entries. Use this format:
   ```js
   { label: 'Fix a Bug', link: '/recipes/fix-a-bug/' },
   { label: 'Small Change', link: '/recipes/small-change/' },
   { label: 'New Milestone', link: '/recipes/new-milestone/' },
   { label: 'Handle UAT Failures', link: '/recipes/uat-failures/' },
   { label: 'Error Recovery', link: '/recipes/error-recovery/' },
   { label: 'Working in Teams', link: '/recipes/working-in-teams/' },
   ```
   The labels should be short and action-oriented (not prefixed with "Recipe:").

2. Run `npm run build` and verify it exits 0.

3. Run `node scripts/check-links.mjs` and verify 0 broken links.

4. Verify built output contains all 6 recipe pages:
   ```bash
   ls dist/recipes/*/index.html | wc -l
   # expect: 6
   ```

5. Verify Pagefind indexes the recipe pages by checking the built search index includes recipe content (check that `dist/pagefind/` exists and the index references recipe pages).

## Must-Haves

- [ ] 6 new sidebar entries in `astro.config.mjs` under the Recipes section
- [ ] Entries positioned before existing guide entries (new recipes are the primary content)
- [ ] `npm run build` exits 0
- [ ] `node scripts/check-links.mjs` exits 0 — no broken links
- [ ] All 6 recipe pages appear in `dist/recipes/*/index.html`

## Verification

- `npm run build` exits 0
- `node scripts/check-links.mjs` exits 0
- `grep -c "'/recipes/" astro.config.mjs` returns 6
- `ls dist/recipes/*/index.html | wc -l` returns 6
- `ls dist/pagefind/` confirms search index exists

## Inputs

- 6 recipe MDX files from T01 and T02 in `src/content/docs/recipes/`
- Current `astro.config.mjs` sidebar structure — Recipes section at ~line 64 with 8 existing entries

## Observability Impact

- **Sidebar entry count:** `grep -c "'/recipes/" astro.config.mjs` is the canonical check for whether all recipe pages are wired. A count mismatch (e.g., 5 instead of 6) means a page exists but isn't navigable from the sidebar.
- **Build output presence:** Each recipe produces `dist/recipes/<slug>/index.html`. Missing files mean the MDX page failed to compile — check `npm run build` stderr for the file path and error.
- **Pagefind indexing:** `dist/pagefind/` directory existence confirms search works. If absent, Pagefind integration may be misconfigured in `astro.config.mjs`.
- **Link integrity:** `node scripts/check-links.mjs` output lists every broken link with source file and target path — zero-output means clean.

## Expected Output

- `astro.config.mjs` — modified with 6 new sidebar entries in the Recipes section
- Successful build with all 6 recipe pages in `dist/recipes/*/index.html`
- Clean link check with 0 broken links
