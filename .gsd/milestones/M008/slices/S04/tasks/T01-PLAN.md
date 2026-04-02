---
estimated_steps: 31
estimated_files: 1
skills_used: []
---

# T01: Rewrite homepage with persona cards, Common Tasks, and Go Deeper sections

Rewrite `src/content/docs/index.mdx` to replace the current section layout with: (1) persona cards section using `Card` + `CardGrid` for three personas, (2) retained How GSD Works mermaid diagram, (3) Common Tasks section with recipe LinkCards, (4) Go Deeper section with architecture/reference LinkCards.

The file currently has 82 lines. The new structure replaces Learn GSD, Commands, Recipes, and Reference & Guides sections while keeping the hero and mermaid diagram.

## Steps

1. Read `src/content/docs/index.mdx` to confirm current state
2. Add `Card` to the existing import: `import { Card, CardGrid, LinkCard } from '@astrojs/starlight/components';`
3. Replace the `## Learn GSD` section with a `## Choose Your Starting Point` section containing 3 `Card` components in a `CardGrid`:
   - **Solo Business Builder** — description about non-developers building with AI, links to `/gsd2-guide/solo-guide/`
   - **Developer New to AI Coding** — description about getting started with AI-assisted development, links to `/gsd2-guide/getting-started/`
   - **Experienced AI Developer** — description about advanced features and architecture, links to `/gsd2-guide/commands/`
   Each Card body should have a 1-2 sentence description and a markdown link as CTA.
4. Keep the `## How GSD Works` section and its mermaid diagram exactly as-is
5. Replace `## Commands` and `## Recipes` with a single `## Common Tasks` section containing 3-4 recipe LinkCards:
   - Fix a Bug → `/gsd2-guide/recipes/fix-a-bug/`
   - Small Change → `/gsd2-guide/recipes/small-change/`
   - Error Recovery → `/gsd2-guide/recipes/error-recovery/`
   - Developing with GSD → `/gsd2-guide/user-guide/developing-with-gsd/`
6. Replace `## Reference & Guides` with `## Go Deeper` containing 3-4 LinkCards:
   - Architecture → `/gsd2-guide/architecture/`
   - Auto Mode → `/gsd2-guide/auto-mode/`
   - Quick Reference Cards → `/gsd2-guide/reference/`
   - All Commands → `/gsd2-guide/commands/`
7. Keep hero actions as-is (Getting Started, Developing with GSD, GitHub) — S06 will create Choose Your Path page later
8. Ensure `template: doc` remains in frontmatter
9. Run `npm run build` — must exit 0
10. Run `npm run check-links` — must exit 0, no broken links

## Constraints
- All `href` values must use `/gsd2-guide/` prefix (base path)
- Australian English throughout
- Do NOT add pages to `.generated-manifest.json`
- Do NOT modify `astro.config.mjs` or any other file
- `Card` component allows rich body content (description + link) unlike `LinkCard` which is a single link target

## Inputs

- ``src/content/docs/index.mdx` — current homepage to rewrite`

## Expected Output

- ``src/content/docs/index.mdx` — rewritten homepage with persona cards, Common Tasks, Go Deeper sections`

## Verification

npm run build && npm run check-links
