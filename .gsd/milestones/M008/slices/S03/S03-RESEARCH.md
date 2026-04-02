# S03: Content Consolidation — Research

**Depth:** Targeted — known codebase, known patterns, moderate content merging work.

## Summary

S03 owns two requirements: R086 (cost consolidation) and R087 (skills/extensions/agents merge). It also handles auto-mode deduplication and cross-links. The work is content-focused — creating one new recipe, merging four pages into one, deciding on auto-mode overlap, and updating sidebar entries + cross-links.

## Owned Requirements

- **R086** — Cost content consolidated into 3 canonical locations: Solo Guide §6 (exists), Cost Examples (exists), new "Control Your Costs" recipe (must create). Existing pages `cost-management.md` (95 lines), `token-optimization.md` (328 lines), `dynamic-model-routing.md` (129 lines) currently sit in Recipes sidebar. These three get consolidated into a single new recipe page.
- **R087** — Skills/Extensions/Agents merged into single page. Four source pages: `skills.md` (190 lines), `reference/skills.mdx` (73 lines), `reference/extensions.mdx` (43 lines), `reference/agents.mdx` (45 lines). Merge into one "Skills, Extensions & Agents" page under Learn More.

## Implementation Landscape

### Task 1: Create "Control Your Costs" Recipe

- **New file:** `src/content/docs/recipes/control-your-costs.md` (or .mdx)
- **Content sources:** Pull actionable content from `cost-management.md` (95 lines — cost tracking, budget enforcement), `token-optimization.md` (328 lines — context management, model selection, caching), `dynamic-model-routing.md` (129 lines — routing rules, cost tiers)
- **Structure:** Single recipe page with sections: Setting Budgets, Token Optimisation Strategies, Dynamic Model Routing, Monitoring Costs
- **Sidebar:** Replace the 3 separate entries (lines 59-61 of astro.config.mjs) with one `{ label: 'Control Your Costs', link: '/recipes/control-your-costs/' }` entry
- **Old pages:** Keep old files but add frontmatter redirects or "this content has moved" notices pointing to the new recipe + Solo Guide §6 + Cost Examples. Alternatively, delete and rely on the new page. Decision for planner: whether to keep old URLs alive via Starlight `slug` or remove pages entirely.
- **Cross-links:** Solo Guide §6 (`solo-guide/controlling-costs.md`) and Cost Examples (`cost-examples.md`) should link to the new recipe for detailed how-to.

### Task 2: Merge Skills/Extensions/Agents

- **New file:** `src/content/docs/skills-extensions-agents.md` (or similar slug)
- **Content sources:** `skills.md` (190 lines — authoring guide, triggers, detection), `reference/skills.mdx` (73 lines — generated cards), `reference/extensions.mdx` (43 lines — generated cards), `reference/agents.mdx` (45 lines — generated cards)
- **Key constraint:** The reference pages (`reference/skills.mdx`, `reference/extensions.mdx`, `reference/agents.mdx`) are pipeline-generated from `.generated-manifest.json`. The merged page needs to either import/include their content or replicate their card rendering. Check whether these use Astro components that can be imported.
- **Sidebar:** Remove the 4 separate entries from Learn More (lines 175, 182-184) and add one entry for the merged page
- **Old pages:** Same redirect/removal decision as costs

### Task 3: Auto-mode Deduplication

- `auto-mode.md` (303 lines) is in Recipes sidebar (line 57), covers how it works + practical usage
- `how-auto-mode-works.mdx` (104 lines) is in Learn More sidebar (line 167), covers the 12-phase pipeline
- **Overlap assessment:** Both open with "Auto mode is GSD's autonomous execution engine/loop." `auto-mode.md` has a broader "How It Works" section plus practical guidance. `how-auto-mode-works.mdx` is a focused 12-point pipeline breakdown using Starlight Steps component.
- **Recommendation:** Keep both but differentiate clearly. `auto-mode.md` in Recipes = practical "how to use auto mode" (when to run it, what to expect, how to intervene). `how-auto-mode-works.mdx` in Learn More = deep dive into the pipeline internals. Add cross-links between them. Remove duplicate introductory content from one.

### Task 4: Cross-links & Sidebar Cleanup

- After creating/merging pages, update sidebar in `astro.config.mjs`
- Add cross-links: cost recipe ↔ Solo Guide §6 ↔ Cost Examples; merged extensibility page links from any page that references skills/extensions/agents; auto-mode pages link to each other
- Run `npm run build` and `npm run check-links` to verify

## Constraints

- **Pipeline-generated pages:** `reference/skills.mdx`, `reference/extensions.mdx`, `reference/agents.mdx` are managed by the build pipeline. Check `.generated-manifest.json` to confirm. If they're generated, the merged page may need to coexist with or replace them carefully.
- **URL preservation:** Per M008 context, preserve existing slugs where possible. Old cost page URLs should ideally redirect.
- **Australian English throughout**

## Risks

- **Reference page generation:** If the pipeline regenerates `reference/skills.mdx` etc. on each build, removing them from sidebar but keeping files may cause confusion. Need to check `scripts/prebuild.mjs` and `.generated-manifest.json`.
- **Token-optimization is 328 lines** — largest source page. Condensing into a recipe section without losing important detail needs care.

## Recommendation

4 tasks in order:
1. Create "Control Your Costs" recipe (new page + sidebar update + old page notices)
2. Merge Skills/Extensions/Agents (new page + sidebar update)
3. Deduplicate auto-mode (edit both pages for clear differentiation + cross-links)
4. Final verification (build + link check + cross-link audit)

Tasks 1-3 are independent and could parallelise, but sequential is safer to avoid sidebar merge conflicts. Task 4 must be last.
