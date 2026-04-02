# S01: Homepage Nav Fix

**Goal:** Confirm the homepage sidebar matches inner page sidebars exactly, validating R084.
**Demo:** After this: After this: homepage sidebar matches inner page sidebar exactly.

## Tasks
- [x] **T01: Verified homepage sidebar matches inner page sidebars exactly — R084 confirmed fixed via template: doc.** — The homepage sidebar bug (R084) was already fixed by quick task 6, which switched `src/content/docs/index.mdx` from `template: splash` to `template: doc`. This task verifies the fix is complete by building the site and comparing sidebar HTML between the homepage and an inner page.

Steps:
1. Confirm `src/content/docs/index.mdx` has `template: doc` in frontmatter (not `splash`).
2. Run `npm run build` — must exit 0.
3. Extract sidebar HTML from `dist/index.html` and `dist/getting-started/index.html`. Compare them, ignoring `aria-current="page"` attributes. They must be identical.
4. Run `npm run check-links` — must exit 0.
5. If all checks pass, R084 is validated.
  - Estimate: 5 min
  - Files: src/content/docs/index.mdx, dist/index.html, dist/getting-started/index.html
  - Verify: 1. `grep 'template: doc' src/content/docs/index.mdx` exits 0
2. `npm run build` exits 0
3. Sidebar diff between dist/index.html and dist/getting-started/index.html shows no differences (after stripping aria-current)
4. `npm run check-links` exits 0
