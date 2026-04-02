---
estimated_steps: 7
estimated_files: 3
skills_used: []
---

# T01: Verify homepage sidebar matches inner pages

The homepage sidebar bug (R084) was already fixed by quick task 6, which switched `src/content/docs/index.mdx` from `template: splash` to `template: doc`. This task verifies the fix is complete by building the site and comparing sidebar HTML between the homepage and an inner page.

Steps:
1. Confirm `src/content/docs/index.mdx` has `template: doc` in frontmatter (not `splash`).
2. Run `npm run build` — must exit 0.
3. Extract sidebar HTML from `dist/index.html` and `dist/getting-started/index.html`. Compare them, ignoring `aria-current="page"` attributes. They must be identical.
4. Run `npm run check-links` — must exit 0.
5. If all checks pass, R084 is validated.

## Inputs

- ``src/content/docs/index.mdx``
- ``astro.config.mjs``

## Expected Output

- ``dist/index.html``
- ``dist/getting-started/index.html``

## Verification

1. `grep 'template: doc' src/content/docs/index.mdx` exits 0
2. `npm run build` exits 0
3. Sidebar diff between dist/index.html and dist/getting-started/index.html shows no differences (after stripping aria-current)
4. `npm run check-links` exits 0
