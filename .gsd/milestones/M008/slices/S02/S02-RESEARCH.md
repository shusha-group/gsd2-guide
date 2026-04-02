# S02 Research: Sidebar Restructure

## Calibration: Light Research

This is a configuration change to one file (`astro.config.mjs`). Starlight sidebar config is well-understood, `collapsed: true` is confirmed supported (D078 context), and the target structure is fully specified in D074. No new technology, no ambiguous requirements.

## Requirements Owned

- **R085** (primary): Five-section sidebar — Start Here, Solo Builder's Guide, Recipes, Commands, Learn More. Old sections removed.

## Summary

The entire slice is a rewrite of the `sidebar` array in `astro.config.mjs`. The current config has 8+ top-level entries (Home, Getting Started, Solo Builder's Guide, Deep Dives, Changelog, Commands, Prompts, Recipes, Reference, How-to Guides). The target has exactly 5 top-level sections per D074.

## Current State

The sidebar in `astro.config.mjs` (lines ~22–262) has these top-level entries:
1. Home (link)
2. Getting Started (7 items)
3. Solo Builder's Guide (9 items)
4. Deep Dives (4 items)
5. Changelog (link)
6. Commands (large nested group, ~22 sub-items across 8 sub-groups)
7. Prompts (4 sub-groups, ~32 items)
8. Recipes (13 items)
9. Reference (6 items)
10. How-to Guides (9 items)

Total: 10 top-level entries → needs to become 5.

## Target Structure (from D074)

1. **Start Here** — absorbs Getting Started content: Home, Is GSD Right for Me, Quick Reference, Writing a Good Brief, Cost Examples, Installation, Developing with GSD, Discussing a Milestone
2. **Solo Builder's Guide** — unchanged (9 items)
3. **Recipes** — absorbs some how-to content: current 13 recipe items + Auto Mode, Git Strategy, cost-related links, etc.
4. **Commands** — stays as-is (large nested group). Prompts become a collapsed sub-group within Commands or within Learn More.
5. **Learn More** — absorbs Deep Dives, Reference, How-to Guides, Prompts, Changelog: architecture, configuration, custom models, skills, extensions, agents, web interface, visualizer, migration, troubleshooting, v1-to-v2, story-of-gsd, gsd-directory, how-auto-mode-works, changelog, all prompts, all reference pages

## Recommendation

### Single task approach
This is one atomic change to `astro.config.mjs`. Splitting into multiple tasks adds no value — every rearrangement is interdependent (removing a section means its items must land somewhere else in the same commit). One task: rewrite sidebar config, build, check links.

### Key decisions for the planner
1. **Where do Prompts go?** They're 32+ items. Options: (a) collapsed sub-group under Learn More, (b) collapsed sub-group under Commands. Recommend (a) under Learn More with `collapsed: true` since prompts are deep reference material.
2. **Where does Changelog go?** Recommend top of Learn More as a standalone link.
3. **`collapsed: true` on large groups** — Use on Prompts sub-groups and possibly Reference items within Learn More to keep the sidebar scannable.

### Implementation pattern
```js
sidebar: [
  { label: 'Start Here', items: [ /* Getting Started items + Home */ ] },
  { label: "Solo Builder's Guide", items: [ /* unchanged */ ] },
  { label: 'Recipes', items: [ /* current recipes */ ] },
  { label: 'Commands', items: [ /* current commands structure */ ] },
  { label: 'Learn More', items: [
    { label: 'Changelog', link: '/changelog/' },
    // Deep Dives items
    // How-to Guides items  
    // Reference items
    { label: 'Prompts', collapsed: true, items: [ /* 4 sub-groups */ ] },
  ]},
]
```

### Verification
1. `npm run build` exits 0 (should still be 148 pages — no pages added or removed)
2. `npm run check-links` exits 0
3. Sidebar HTML identical between homepage and inner pages (same check as S01)

## Risks

- **Broken links: NONE expected.** Sidebar restructure only changes navigation grouping, not page slugs. All `link:` values stay identical.
- **Page count change: NONE expected.** No files are created, moved, or deleted.
- **Collapsed groups:** Starlight's `collapsed: true` is confirmed supported (milestone context). Sub-groups within a collapsed parent auto-collapse too.

## Files Touched

- `astro.config.mjs` — sidebar array rewrite (only file changed)

## Skills Discovered

None needed. This is pure Starlight sidebar configuration — no new technology.
