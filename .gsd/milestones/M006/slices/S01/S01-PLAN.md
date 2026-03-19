# S01: Guide Structure & Navigation

**Goal:** A "Solo Builder's Guide" sidebar group exists in the gsd2-guide site with a landing page and 8 section stubs. The build passes and the update pipeline is unaffected.

**Demo:** `npm run build` exits 0 with 113 pages (104 + 9 new). The sidebar shows "Solo Builder's Guide" with all 9 entries. `page-source-map.json` and `.generated-manifest.json` are untouched.

## Must-Haves

- 9 MDX files exist in `src/content/docs/solo-guide/` (index + 8 sections)
- Each file has valid frontmatter (`title` + `description`) and ≥3 lines of body text
- Index page uses `LinkCard` components from `@astrojs/starlight/components` to link to all 8 sections
- Sidebar group "Solo Builder's Guide" registered in `astro.config.mjs` with 9 entries
- Australian spelling in all stub text (behaviour, colour, recognise, organisation, etc.)
- `npm run build` exits 0
- `page-source-map.json` unchanged (solo-guide pages not in pipeline per D068)
- `.generated-manifest.json` contains no `solo-guide/` paths

## Verification

- `ls src/content/docs/solo-guide/*.mdx | wc -l` → 9
- `npm run build 2>&1 | grep "pages"` → shows 113 pages
- `diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json` → no diff
- `grep "solo-guide" src/content/docs/.generated-manifest.json` → no output (exit 1)
- `grep -c "Solo Builder" astro.config.mjs` → 1

## Tasks

- [ ] **T01: Create solo-guide directory, 9 MDX files, and sidebar group** `est:30m`
  - Why: This is the entire slice — create the directory structure, landing page with LinkCards, 8 section stubs with placeholder content, and the sidebar registration. All must exist together for the build to pass.
  - Files: `src/content/docs/solo-guide/index.mdx`, `src/content/docs/solo-guide/why-gsd.mdx`, `src/content/docs/solo-guide/first-project.mdx`, `src/content/docs/solo-guide/brownfield.mdx`, `src/content/docs/solo-guide/daily-mix.mdx`, `src/content/docs/solo-guide/context-engineering.mdx`, `src/content/docs/solo-guide/controlling-costs.mdx`, `src/content/docs/solo-guide/when-things-go-wrong.mdx`, `src/content/docs/solo-guide/building-rhythm.mdx`, `astro.config.mjs`
  - Do: Create all 9 MDX files following the frontmatter pattern from existing hand-authored pages. Index page imports `CardGrid` and `LinkCard` from `@astrojs/starlight/components` and links to all 8 sections. Each stub has a placeholder paragraph (Australian spelling). Add the sidebar group to `astro.config.mjs` before the closing `],` of the sidebar array (around line 169). Sidebar link values use `/solo-guide/{slug}/` format — no `/gsd2-guide/` prefix. Run `npm run build` and verify 113 pages. Confirm pipeline files are untouched.
  - Verify: `npm run build` exits 0 with 113 pages. `ls src/content/docs/solo-guide/*.mdx | wc -l` returns 9. `diff` on `page-source-map.json` shows no changes. `grep "solo-guide" src/content/docs/.generated-manifest.json` returns nothing.
  - Done when: Build passes at 113 pages, sidebar group visible, pipeline uncontaminated.

## Files Likely Touched

- `src/content/docs/solo-guide/index.mdx` (new)
- `src/content/docs/solo-guide/why-gsd.mdx` (new)
- `src/content/docs/solo-guide/first-project.mdx` (new)
- `src/content/docs/solo-guide/brownfield.mdx` (new)
- `src/content/docs/solo-guide/daily-mix.mdx` (new)
- `src/content/docs/solo-guide/context-engineering.mdx` (new)
- `src/content/docs/solo-guide/controlling-costs.mdx` (new)
- `src/content/docs/solo-guide/when-things-go-wrong.mdx` (new)
- `src/content/docs/solo-guide/building-rhythm.mdx` (new)
- `astro.config.mjs` (edit — add sidebar group)
