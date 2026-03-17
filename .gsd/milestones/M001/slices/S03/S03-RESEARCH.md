# S03: Quick-reference pages — Research

**Date:** 2026-03-17

## Summary

S03 builds searchable cheat-sheet cards for all GSD commands (42), skills (8), extensions (17), agents (5), and keyboard shortcuts (4). The data is fully available from S01's JSON output in `content/generated/`. The S02 site scaffold provides the Astro/Starlight framework, custom terminal-green theme, and Pagefind search. The core work is creating Astro components for card rendering and MDX pages that wire the JSON data into the theme.

The approach is straightforward: create Astro components for "reference cards" (the expandable cheat-sheet items), then build MDX pages under `src/content/docs/reference/` that import the generated JSON and render cards grouped by category. Each card shows a one-liner summary and expands for detail (tool list, objective, arguments, examples). Pagefind already indexes all rendered HTML, so search comes for free. Client-side category filtering uses a small `<script>` block with `data-category` attributes — no framework needed.

This is **light-to-targeted research**. The technology is known (Astro components + MDX), the data schema is established (S01 JSON), and the design system is in place (S02 CSS). The only moderate complexity is designing card components that handle the varied data shapes across commands/skills/extensions/agents, and wiring up client-side filtering without adding JS dependencies.

## Recommendation

**Use MDX content pages with Astro components, not `src/pages/` with `StarlightPage`.** The content should live in `src/content/docs/reference/` as MDX files that import custom Astro components and pass them the JSON data. This approach gets Starlight sidebar integration for free, Pagefind search indexing automatically, and keeps the same content-in-docs pattern established by S02.

## Implementation Landscape

### Key Files

- `content/generated/commands.json` — 42 commands, 7 categories
- `content/generated/skills.json` — 8 skills, variable fields
- `content/generated/extensions.json` — 17 extensions, 0-47 tools each
- `content/generated/agents.json` — 5 agents, variable fields
- `astro.config.mjs` — Sidebar config needs Reference group
- New: `src/components/ReferenceCard.astro`, `ReferenceGrid.astro`, `ToolList.astro`
- New: `src/content/docs/reference/{index,commands,skills,extensions,agents,shortcuts}.mdx`

### Build Order

1. T01: Reference card components (unblocks all pages)
2. T02: Commands & shortcuts pages (highest value — R003)
3. T03: Skills, extensions, agents pages (R014, R015, R016)
4. T04: Reference index, sidebar, hero updates

### Verification Approach

- `npm run build` exits 0 with 137+ pages
- 6 HTML files in `dist/reference/`
- Known content appears in built HTML
- Pagefind indexes all reference pages
- `<details>` elements present for expandable cards