---
estimated_steps: 12
estimated_files: 3
skills_used: []
---

# T03: Build verification and cross-link audit

Run full build and link check to verify all content changes from T01 and T02 are consistent. Audit that cross-links exist between the key page pairs.

Steps:
1. Run `npm run build` — must exit 0 with no errors.
2. Run `npm run check-links` — must exit 0 with 0 broken links.
3. Verify cross-links exist:
   - `grep -q 'control-your-costs' src/content/docs/solo-guide/controlling-costs.md` (Solo Guide links to recipe)
   - `grep -q 'control-your-costs' src/content/docs/cost-examples.md` (Cost Examples links to recipe)
   - `grep -q 'how-auto-mode-works' src/content/docs/auto-mode.md` (Auto-mode recipe links to deep dive)
   - `grep -q 'auto-mode' src/content/docs/how-auto-mode-works.mdx` (Deep dive links back to recipe)
   - `grep -q 'reference/skills' src/content/docs/skills-extensions-agents.md` (Guide links to reference)
4. If any link check fails, fix the broken links and re-run build + check-links.
5. Confirm sidebar has exactly 1 cost recipe entry and the skills-extensions-agents entry in Learn More.

## Inputs

- ``src/content/docs/recipes/control-your-costs.md` — created in T01`
- ``src/content/docs/skills-extensions-agents.md` — created in T02`
- ``astro.config.mjs` — modified in T01 and T02`
- ``src/content/docs/solo-guide/controlling-costs.md` — cross-linked in T01`
- ``src/content/docs/cost-examples.md` — cross-linked in T01`
- ``src/content/docs/auto-mode.md` — deduplicated in T02`
- ``src/content/docs/how-auto-mode-works.mdx` — cross-linked in T02`

## Expected Output

- ``astro.config.mjs` — verified correct (may be fixed if issues found)`

## Verification

`npm run build` exits 0 && `npm run check-links` exits 0
