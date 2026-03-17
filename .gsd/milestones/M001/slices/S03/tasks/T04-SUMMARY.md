---
id: T04
parent: S03
milestone: M001
provides:
  - Reference index overview page with CardGrid linking to all 5 reference pages
  - Sidebar "Quick Reference" group with 6 links (overview + 5 pages)
  - Hero page updated with reference section as primary content and CTA
key_files:
  - src/content/docs/reference/index.mdx
  - astro.config.mjs
  - src/content/docs/index.mdx
key_decisions:
  - Starlight sidebar links omit base path — Starlight prepends /gsd2-guide/ automatically
  - Hero CardGrid uses Starlight Card component (non-linking) for overview, LinkCard row below for navigation
patterns_established:
  - Starlight LinkCard used for index-to-subpage navigation with item counts in titles
  - Sidebar group ordering convention — Home, Quick Reference, Placeholder, then autogenerate groups
observability_surfaces:
  - grep 'Quick Reference' dist/index.html — confirms sidebar and hero render
  - grep '/gsd2-guide/reference/' dist/index.html — confirms hero links point to reference
  - find dist/reference/ -name '*.html' | wc -l — confirms 6 reference HTML pages exist
duration: 10m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T04: Create reference index, wire sidebar, and update hero

**Created reference index page, wired Quick Reference sidebar group, and updated hero to feature reference content as primary CTA**

## What Happened

Created `src/content/docs/reference/index.mdx` as an overview page with a Starlight `<CardGrid>` containing 5 `<LinkCard>` entries (Commands 42, Skills 8, Extensions 17, Agents 5, Keyboard Shortcuts 4) — each with counts in titles and descriptive text.

Updated `astro.config.mjs` to add a "Quick Reference" sidebar group after Home and before Placeholder, with 6 manual links: Overview, Commands, Skills, Extensions, Agents, Shortcuts. Sidebar links use relative paths without the `/gsd2-guide/` base prefix per Starlight convention.

Updated `src/content/docs/index.mdx` hero page: changed primary CTA from "Get Started → /placeholder/components/" to "Quick Reference → /reference/", replaced placeholder-focused Card/LinkCard content with reference section cards (Commands, Skills, Extensions, Agents), and kept the GitHub external link.

## Verification

All slice-level verification checks pass — this is the final task of S03:

- `npm run build` exits 0 — **137 pages built**, Pagefind indexed 137
- `find dist/reference/ -name "*.html" | wc -l` = **6** (index + 5 reference pages)
- `grep -o '<details' dist/reference/commands/index.html | wc -l` = **52** (≥42 ✅)
- `grep -c 'data-category' dist/reference/commands/index.html` = **1** (filter bar ✅)
- `grep '/gsd auto' dist/reference/commands/index.html` — **found** ✅
- Skills names grep = **36** matches (≥8 ✅)
- Extension names grep = **10** matches (≥4 ✅)
- Agent names (unique) = **5** (scout, researcher, worker, javascript-pro, typescript-pro ✅)
- `grep 'Quick Reference' dist/index.html` — **found** ✅
- `grep '/gsd2-guide/reference/' dist/index.html` — **found** ✅
- No build errors/warnings related to reference pages ✅

Browser verification:
- Hero page shows "Quick Reference" primary CTA button linking to `/gsd2-guide/reference/`
- Hero CardGrid displays Commands, Skills, Extensions, Agents cards
- Hero LinkCard row links to all 4 reference sub-pages
- Reference index page renders all 5 LinkCards with correct hrefs
- Sidebar shows Quick Reference group expanded with all 6 links
- Sidebar ordering: Home → Quick Reference → Placeholder → Getting Started → ...

## Diagnostics

- **Sidebar presence**: `grep 'Quick Reference' dist/index.html` or any built page confirms the sidebar group rendered. Look for `<a href="/gsd2-guide/reference/">` in sidebar HTML.
- **Hero links**: `grep '/gsd2-guide/reference/' dist/index.html` confirms hero CTA and LinkCards point to reference section.
- **Reference index completeness**: `grep -c '/gsd2-guide/reference/' dist/reference/index.html` should return ≥5 (one per sub-page link).
- **Page count regression**: Build output reports page count and Pagefind index size. If either drops below 137, a reference page was removed or a build error occurred.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/reference/index.mdx` — New reference index overview page with CardGrid of 5 LinkCards
- `astro.config.mjs` — Added "Quick Reference" sidebar group with 6 entries after Home
- `src/content/docs/index.mdx` — Updated hero CTA to reference section, replaced placeholder cards with reference content
- `.gsd/milestones/M001/slices/S03/tasks/T04-PLAN.md` — Added Observability Impact section (pre-flight fix)
