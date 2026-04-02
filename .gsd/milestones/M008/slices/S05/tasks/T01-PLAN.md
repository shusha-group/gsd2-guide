---
estimated_steps: 13
estimated_files: 1
skills_used: []
---

# T01: Restore Pagination in custom Footer.astro

The custom Footer.astro override completely replaces Starlight's default Footer without including the Pagination component. This breaks prev/next navigation site-wide. Fix by importing Pagination from the Starlight virtual module and rendering it above the custom footer markup.

Steps:
1. Read `src/components/Footer.astro` to confirm current state (no Pagination import).
2. Add `import Pagination from 'virtual:starlight/components/Pagination';` to the frontmatter.
3. Render `<Pagination {...Astro.props} />` immediately before the `<footer class="site-footer">` element.
4. Run `npm run build` — must exit 0.
5. Run `grep -c 'pagination-links' dist/solo-guide/first-project/index.html` — must return ≥1.
6. Run `grep -c 'pagination-links' dist/auto-mode/index.html` — must return ≥1 (confirms site-wide).
7. Run `npm run check-links` — must report 0 broken links.

Constraints:
- Import MUST use `'virtual:starlight/components/Pagination'` (the Starlight virtual module pattern), NOT a relative path.
- Preserve ALL existing custom footer markup — only add the Pagination component above it.
- Pass `{...Astro.props}` to Pagination so it receives page context.

## Inputs

- ``src/components/Footer.astro` — current custom footer without Pagination`

## Expected Output

- ``src/components/Footer.astro` — updated with Pagination import and render`

## Verification

npm run build && grep -c 'pagination-links' dist/solo-guide/first-project/index.html && grep -c 'pagination-links' dist/auto-mode/index.html && npm run check-links
