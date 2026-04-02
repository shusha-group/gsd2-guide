---
id: T01
parent: S03
milestone: M008
provides: []
requires: []
affects: []
key_files: ["src/content/docs/recipes/control-your-costs.md", "astro.config.mjs", "src/content/docs/cost-management.md", "src/content/docs/token-optimization.md", "src/content/docs/dynamic-model-routing.md", "src/content/docs/solo-guide/controlling-costs.mdx", "src/content/docs/cost-examples.mdx"]
key_decisions: ["Used Starlight :::caution[Page moved] admonition on old pages so they remain accessible at original URLs while clearly directing users to the consolidated recipe", "New recipe uses .md extension (plain markdown, no JSX components needed)"]
patterns_established: []
drill_down_paths: []
observability_surfaces: []
duration: ""
verification_result: "npm run build exits 0 (149 pages, /recipes/control-your-costs/index.html present). test -f src/content/docs/recipes/control-your-costs.md passes."
completed_at: 2026-04-02T13:25:28.962Z
blocker_discovered: false
---

# T01: Merged cost-management, token-optimization, and dynamic-model-routing into a single /recipes/control-your-costs/ page; sidebar reduced to one entry; old pages show redirect notices; cross-links added; build exits 0

> Merged cost-management, token-optimization, and dynamic-model-routing into a single /recipes/control-your-costs/ page; sidebar reduced to one entry; old pages show redirect notices; cross-links added; build exits 0

## What Happened
---
id: T01
parent: S03
milestone: M008
key_files:
  - src/content/docs/recipes/control-your-costs.md
  - astro.config.mjs
  - src/content/docs/cost-management.md
  - src/content/docs/token-optimization.md
  - src/content/docs/dynamic-model-routing.md
  - src/content/docs/solo-guide/controlling-costs.mdx
  - src/content/docs/cost-examples.mdx
key_decisions:
  - Used Starlight :::caution[Page moved] admonition on old pages so they remain accessible at original URLs while clearly directing users to the consolidated recipe
  - New recipe uses .md extension (plain markdown, no JSX components needed)
duration: ""
verification_result: passed
completed_at: 2026-04-02T13:25:28.963Z
blocker_discovered: false
---

# T01: Merged cost-management, token-optimization, and dynamic-model-routing into a single /recipes/control-your-costs/ page; sidebar reduced to one entry; old pages show redirect notices; cross-links added; build exits 0

**Merged cost-management, token-optimization, and dynamic-model-routing into a single /recipes/control-your-costs/ page; sidebar reduced to one entry; old pages show redirect notices; cross-links added; build exits 0**

## What Happened

Read all three source pages and the solo guide controlling-costs section. Created src/content/docs/recipes/control-your-costs.md with four sections (Setting Budgets & Tracking Costs, Token Optimisation Strategies, Dynamic Model Routing, Monitoring & Alerts) using Australian English. Replaced the three sidebar entries in astro.config.mjs with a single 'Control Your Costs' entry. Added Starlight caution admonition redirect notices to the three old pages. Added cross-links in solo-guide/controlling-costs.mdx and cost-examples.mdx. Both target files used .mdx extension (not .md as the plan stated); adapted paths accordingly.

## Verification

npm run build exits 0 (149 pages, /recipes/control-your-costs/index.html present). test -f src/content/docs/recipes/control-your-costs.md passes.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` | 0 | ✅ pass | 6500ms |
| 2 | `test -f src/content/docs/recipes/control-your-costs.md` | 0 | ✅ pass | 50ms |


## Deviations

File extensions for controlling-costs and cost-examples were .mdx not .md as the task plan stated. Adapted paths with no impact on outcome.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/recipes/control-your-costs.md`
- `astro.config.mjs`
- `src/content/docs/cost-management.md`
- `src/content/docs/token-optimization.md`
- `src/content/docs/dynamic-model-routing.md`
- `src/content/docs/solo-guide/controlling-costs.mdx`
- `src/content/docs/cost-examples.mdx`


## Deviations
File extensions for controlling-costs and cost-examples were .mdx not .md as the task plan stated. Adapted paths with no impact on outcome.

## Known Issues
None.
