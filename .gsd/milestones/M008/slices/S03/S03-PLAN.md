# S03: Content Consolidation

**Goal:** Consolidate cost content into a single "Control Your Costs" recipe, merge the Skills/Extensions/Agents guide page, deduplicate auto-mode content, and wire cross-links — leaving the site with fewer redundant pages, cleaner sidebar entries, and 0 broken links.
**Demo:** After this: After this: Control Your Costs recipe exists, Skills/Extensions/Agents merged, auto-mode deduplicated, cross-links in place.

## Tasks
- [x] **T01: Merged cost-management, token-optimization, and dynamic-model-routing into a single /recipes/control-your-costs/ page; sidebar reduced to one entry; old pages show redirect notices; cross-links added; build exits 0** — Merge content from cost-management.md (95 lines), token-optimization.md (328 lines), and dynamic-model-routing.md (129 lines) into a single new recipe page. Update astro.config.mjs sidebar to replace the 3 separate entries with one. Add redirect notices to old pages pointing to the new recipe.

Steps:
1. Read all 3 source pages fully: `src/content/docs/cost-management.md`, `src/content/docs/token-optimization.md`, `src/content/docs/dynamic-model-routing.md`
2. Create `src/content/docs/recipes/control-your-costs.md` with consolidated content organised into sections: Setting Budgets & Tracking Costs, Token Optimisation Strategies, Dynamic Model Routing, Monitoring & Alerts. Pull the best actionable content from each source page. Use Australian English throughout.
3. In `astro.config.mjs`, replace the 3 sidebar entries (lines 59-61: Cost Management, Token Optimization, Dynamic Model Routing) with one entry: `{ label: 'Control Your Costs', link: '/recipes/control-your-costs/' }`
4. Update the 3 old pages to add a frontmatter redirect or a prominent notice at the top pointing to the new recipe page and to Solo Guide §6 for context.
5. Add a cross-link in `src/content/docs/solo-guide/controlling-costs.md` pointing to the new recipe for detailed how-to.
6. Add a cross-link in `src/content/docs/cost-examples.md` pointing to the new recipe.
7. Verify: `npm run build` exits 0.
  - Estimate: 45m
  - Files: src/content/docs/recipes/control-your-costs.md, src/content/docs/cost-management.md, src/content/docs/token-optimization.md, src/content/docs/dynamic-model-routing.md, astro.config.mjs, src/content/docs/solo-guide/controlling-costs.md, src/content/docs/cost-examples.md
  - Verify: npm run build exits 0 and `test -f src/content/docs/recipes/control-your-costs.md`
- [x] **T02: Created unified Skills, Extensions & Agents guide page, updated sidebar, deduplicated auto-mode.md with mutual cross-links to how-auto-mode-works.mdx** — Create a single 'Skills, Extensions & Agents' guide page merging content from skills.md. Deduplicate auto-mode by differentiating the recipe (practical) from the deep-dive (internals). Update sidebar and add cross-links.

IMPORTANT: The reference pages (`reference/skills.mdx`, `reference/extensions.mdx`, `reference/agents.mdx`) are pipeline-generated from JSON and must stay untouched. The new guide page should explain skills/extensions/agents conceptually and link TO the reference pages for card listings.

Steps:
1. Read `src/content/docs/skills.md` (190 lines) — this is the main guide content about skill directories, authoring, detection, triggers.
2. Create `src/content/docs/skills-extensions-agents.md` with sections: What Are Skills (from skills.md content), What Are Extensions (brief explanation + link to reference/extensions), What Are Agents (brief explanation + link to reference/agents), Creating Your Own Skills (from skills.md authoring guide). Use Australian English.
3. In `astro.config.mjs` Learn More section, replace the `{ label: 'Skills', link: '/skills/' }` entry (line 175) with `{ label: 'Skills, Extensions & Agents', link: '/skills-extensions-agents/' }`. Keep the reference page entries (lines 182-184) as they are.
4. Update `src/content/docs/skills.md` to add a redirect notice pointing to the new page.
5. Deduplicate auto-mode: Edit `src/content/docs/auto-mode.md` to focus on practical usage (when to use it, what to expect, how to intervene, tips). Remove the detailed pipeline walkthrough that duplicates how-auto-mode-works.mdx. Add a cross-link: 'For a detailed breakdown of the 12-phase pipeline, see [How Auto Mode Works](/gsd2-guide/how-auto-mode-works/)'.
6. Edit `src/content/docs/how-auto-mode-works.mdx` to add a cross-link at top: 'For practical tips on running auto mode, see [Auto Mode](/gsd2-guide/auto-mode/)'.
7. Verify: `npm run build` exits 0.
  - Estimate: 45m
  - Files: src/content/docs/skills-extensions-agents.md, src/content/docs/skills.md, astro.config.mjs, src/content/docs/auto-mode.md, src/content/docs/how-auto-mode-works.mdx
  - Verify: npm run build exits 0 and `test -f src/content/docs/skills-extensions-agents.md`
- [ ] **T03: Build verification and cross-link audit** — Run full build and link check to verify all content changes from T01 and T02 are consistent. Audit that cross-links exist between the key page pairs.

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
  - Estimate: 20m
  - Files: astro.config.mjs, src/content/docs/recipes/control-your-costs.md, src/content/docs/skills-extensions-agents.md
  - Verify: `npm run build` exits 0 && `npm run check-links` exits 0
