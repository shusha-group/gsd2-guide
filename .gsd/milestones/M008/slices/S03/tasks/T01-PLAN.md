---
estimated_steps: 9
estimated_files: 7
skills_used: []
---

# T01: Create 'Control Your Costs' recipe and update sidebar

Merge content from cost-management.md (95 lines), token-optimization.md (328 lines), and dynamic-model-routing.md (129 lines) into a single new recipe page. Update astro.config.mjs sidebar to replace the 3 separate entries with one. Add redirect notices to old pages pointing to the new recipe.

Steps:
1. Read all 3 source pages fully: `src/content/docs/cost-management.md`, `src/content/docs/token-optimization.md`, `src/content/docs/dynamic-model-routing.md`
2. Create `src/content/docs/recipes/control-your-costs.md` with consolidated content organised into sections: Setting Budgets & Tracking Costs, Token Optimisation Strategies, Dynamic Model Routing, Monitoring & Alerts. Pull the best actionable content from each source page. Use Australian English throughout.
3. In `astro.config.mjs`, replace the 3 sidebar entries (lines 59-61: Cost Management, Token Optimization, Dynamic Model Routing) with one entry: `{ label: 'Control Your Costs', link: '/recipes/control-your-costs/' }`
4. Update the 3 old pages to add a frontmatter redirect or a prominent notice at the top pointing to the new recipe page and to Solo Guide §6 for context.
5. Add a cross-link in `src/content/docs/solo-guide/controlling-costs.md` pointing to the new recipe for detailed how-to.
6. Add a cross-link in `src/content/docs/cost-examples.md` pointing to the new recipe.
7. Verify: `npm run build` exits 0.

## Inputs

- ``src/content/docs/cost-management.md` — source content for budget/tracking sections`
- ``src/content/docs/token-optimization.md` — source content for token strategies`
- ``src/content/docs/dynamic-model-routing.md` — source content for routing rules`
- ``astro.config.mjs` — sidebar config (S02 established the 5-section structure)`
- ``src/content/docs/solo-guide/controlling-costs.md` — cross-link target`
- ``src/content/docs/cost-examples.md` — cross-link target`

## Expected Output

- ``src/content/docs/recipes/control-your-costs.md` — new consolidated recipe page`
- ``astro.config.mjs` — sidebar updated with single cost recipe entry`
- ``src/content/docs/cost-management.md` — updated with redirect notice`
- ``src/content/docs/token-optimization.md` — updated with redirect notice`
- ``src/content/docs/dynamic-model-routing.md` — updated with redirect notice`
- ``src/content/docs/solo-guide/controlling-costs.md` — added cross-link to recipe`
- ``src/content/docs/cost-examples.md` — added cross-link to recipe`

## Verification

npm run build exits 0 and `test -f src/content/docs/recipes/control-your-costs.md`
