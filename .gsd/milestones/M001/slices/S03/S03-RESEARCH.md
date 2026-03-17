# S03: Quick-reference pages — Research

**Date:** 2026-03-17

## Summary

S03 builds searchable cheat-sheet cards for all GSD commands (42), skills (8), extensions (17), agents (5), and keyboard shortcuts (4). The data is fully available from S01's JSON output in `content/generated/`. The S02 site scaffold provides the Astro/Starlight framework, custom terminal-green theme, and Pagefind search. The core work is creating Astro components for card rendering and MDX pages that wire the JSON data into the theme.

The approach is straightforward: create Astro components for "reference cards" (the expandable cheat-sheet items), then build MDX pages under `src/content/docs/reference/` that import the generated JSON and render cards grouped by category. Each card shows a one-liner summary and expands for detail (tool list, objective, arguments, examples). Pagefind already indexes all rendered HTML, so search comes for free. Client-side category filtering uses a small `<script>` block with `data-category` attributes — no framework needed.

This is **light-to-targeted research**. The technology is known (Astro components + MDX), the data schema is established (S01 JSON), and the design system is in place (S02 CSS). The only moderate complexity is designing card components that handle the varied data shapes across commands/skills/extensions/agents, and wiring up client-side filtering without adding JS dependencies.

## Recommendation

**Use MDX content pages with Astro components, not `src/pages/` with `StarlightPage`.** The content should live in `src/content/docs/reference/` as MDX files that import custom Astro components and pass them the JSON data. This approach:

1. Gets Starlight sidebar integration for free (autogenerate works)
2. Gets Pagefind search indexing automatically
3. Keeps the same content-in-docs pattern established by S02
4. Avoids the complexity of `StarlightPage` routing in `src/pages/`

Astro `.astro` components handle the card rendering logic. MDX pages import these components and the JSON data, passing data as props. Client-side filtering uses vanilla JS in a `<script>` tag — Astro ships zero JS by default, so a small filter script is acceptable and avoids any framework dependency.

**Page structure:**
- `src/content/docs/reference/commands.mdx` — 42 commands grouped by 7 categories
- `src/content/docs/reference/skills.mdx` — 8 skills with objectives, arguments, detection
- `src/content/docs/reference/extensions.mdx` — 17 extensions with tool inventories
- `src/content/docs/reference/agents.mdx` — 5 agents with roles and capabilities
- `src/content/docs/reference/shortcuts.mdx` — Keyboard shortcuts (subset of commands.json where category is "Keyboard Shortcuts")
- `src/content/docs/reference/index.mdx` — Overview page linking to all reference sections

## Implementation Landscape

### Key Files

**Existing (read, do not modify unless noted):**

- `content/generated/commands.json` — 42 commands with `{command, description, category}`. Categories: Session Commands (14), Configuration & Diagnostics (10), Session Management (7), CLI Flags (4), Keyboard Shortcuts (4), Getting Started (2), Git Commands (1).
- `content/generated/skills.json` — 8 skills. Variable fields: all have `{name, description, path}`, some have `{objective, arguments, detection}`, one has `{parentSkill}` (gh → github-workflows).
- `content/generated/extensions.json` — 17 extensions with `{name, description, tools: [{name, description}]}`. Tool counts: 0 to 47. 4 extensions have 0 tools (voice, ttsr, remote-questions, slash-commands) and 2 have empty descriptions (slash-commands, voice).
- `content/generated/agents.json` — 5 agents. Variable fields: all have `{name, description, summary}`, some have `{model, memory}` (javascript-pro, typescript-pro), some have `{tools}` (researcher, scout).
- `src/styles/custom.css` — Theme variables: `--sl-color-accent: #39ff14`, `--sl-color-bg: #0a0e0a`, etc.
- `src/styles/terminal.css` — Terminal effects, table styling, heading glow.
- `astro.config.mjs` — Sidebar config needs a new "Reference" group added.

**New files to create:**

- `src/components/ReferenceCard.astro` — Single expandable card component. Props: `{title, subtitle, category, badge?, children}`. Uses `<details>/<summary>` for native expand/collapse (zero JS, accessible, keyboard-navigable). Styled with terminal theme variables.
- `src/components/ReferenceGrid.astro` — Grid layout wrapper with optional category filter bar. Renders children (cards) in a responsive CSS grid. Filter bar uses `data-category` attributes + vanilla JS `<script>`.
- `src/components/ToolList.astro` — Compact tool listing for extensions. Renders `tools[]` as a styled `<ul>` with tool name in mono and description.
- `src/content/docs/reference/index.mdx` — Overview with CardGrid linking to all 5 reference pages.
- `src/content/docs/reference/commands.mdx` — Imports commands.json, groups by category, renders ReferenceCards.
- `src/content/docs/reference/skills.mdx` — Imports skills.json, renders cards with optional objective/arguments/detection sections.
- `src/content/docs/reference/extensions.mdx` — Imports extensions.json, renders cards with ToolList for each.
- `src/content/docs/reference/agents.mdx` — Imports agents.json, renders cards with role/model/tools info.
- `src/content/docs/reference/shortcuts.mdx` — Keyboard shortcuts extracted from commands.json.

**Files to modify:**

- `astro.config.mjs` — Add "Quick Reference" sidebar group with links to reference pages (before the autogenerate groups, after Home).
- `src/content/docs/index.mdx` — Update hero page to link to reference section instead of placeholder components.
- `src/styles/terminal.css` — Add styles for reference cards (`.ref-card`, `.ref-grid`, `.filter-bar`, `details/summary` styling).

### Data Import Pattern

Astro/Vite supports direct JSON imports in `.astro` and `.mdx` files:

```astro
---
import commands from '../../../content/generated/commands.json';
---
```

For MDX files, the import path is relative to the file. From `src/content/docs/reference/commands.mdx`, the path to `content/generated/commands.json` is `../../../../content/generated/commands.json`.

### Build Order

1. **T01: Reference card components** — Create `ReferenceCard.astro`, `ReferenceGrid.astro`, `ToolList.astro` in `src/components/`. Add card-specific CSS to `terminal.css`. Verify with a minimal test page. This unblocks all 5 reference pages.

2. **T02: Commands & shortcuts reference pages** — Create `commands.mdx` and `shortcuts.mdx`. These are the highest-value pages (R003's primary user loop — "what does this command do"). Verify 42 commands render across 7 categories, filter works.

3. **T03: Skills, extensions, agents reference pages** — Create `skills.mdx`, `extensions.mdx`, `agents.mdx`. These satisfy R014, R015, R016. Handle variable data shapes (skills with/without objective, extensions with 0 tools, agents with/without model).

4. **T04: Reference index, sidebar, and hero updates** — Create `reference/index.mdx` overview. Update `astro.config.mjs` sidebar. Update `index.mdx` hero. Verify Pagefind indexes all reference content.

### Verification Approach

- `npm run build` exits 0 with increased page count (131 → ~137+)
- `find dist/reference/ -name "*.html" | wc -l` — should find 6 HTML files (index + 5 reference pages)
- Grep for known commands in built HTML: `grep -l '/gsd auto' dist/reference/commands/index.html`
- Grep for all skill names: `grep -c 'debug-like-expert\|frontend-design\|lint\|review\|test\|swiftui\|github-workflows\|gh' dist/reference/skills/index.html` should return 8+
- Grep for extension count: `grep -c 'browser-tools\|gsd\|mac-tools\|bg-shell' dist/reference/extensions/index.html`
- Pagefind indexes reference pages: `npm run build` reports 137+ pages in search index
- `<details>` elements exist: `grep -c '<details' dist/reference/commands/index.html` should be ≥42
- Category filter renders: `grep 'data-category' dist/reference/commands/index.html`
- Visual spot-check: `npm run dev`, navigate to `/gsd2-guide/reference/commands/`, verify card styling matches terminal theme

## Constraints

- **Zero JS framework dependency.** Astro ships 0 client JS by default. The filter functionality must use vanilla JS in a `<script>` tag (Astro `<script>` tags are bundled and deduped automatically). No React/Vue/Svelte islands.
- **JSON import paths in MDX.** MDX files in `src/content/docs/reference/` need relative paths `../../../../content/generated/*.json` to reach the generated JSON. This is unavoidable with Starlight's content directory structure. Alternatively, the prebuild script could copy JSON into `src/data/` — but the direct import is simpler and already works for Vite.
- **Extensions with empty data.** 4 extensions have 0 tools and 2 have empty descriptions. Cards must handle these gracefully — show "No registered tools (uses hooks/commands)" or similar.
- **Skills with variable sections.** Only some skills have `objective`, `arguments`, `detection`. Card rendering must conditionally show these sections.
- **`gh` skill has `parentSkill: "github-workflows"`.** Should be displayed as a sub-skill or nested under github-workflows, not as a top-level peer.
- **Sidebar ordering.** The "Quick Reference" group should appear early in the sidebar — after Home, before the autogenerate groups — as it's the primary user loop.

## Common Pitfalls

- **`<details>` inside MDX** — Astro MDX treats raw HTML elements differently. Use `.astro` components that render `<details>` rather than writing raw `<details>` in MDX. The Astro component approach handles this cleanly.
- **JSON import in MDX frontmatter** — MDX does NOT support imports in the frontmatter fence. Imports must be ESM `import` statements below the frontmatter. Pattern: `---\ntitle: Commands\n---\nimport commands from '...';`
- **Pagefind indexing of `<details>` content** — Content inside collapsed `<details>` IS indexed by Pagefind because it processes the HTML source, not the rendered visual state. This is correct behavior — users should find commands via search even when cards are collapsed.
- **Base path in internal links** — All internal `href` values must include `/gsd2-guide/` prefix since `base: '/gsd2-guide'` is set. Use Starlight's `<LinkCard>` component or manual `/gsd2-guide/reference/...` paths.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Astro | astrolicious/agent-skills@astro | available (2.2K installs) — could help with Astro component patterns |
| Frontend design | frontend-design | installed — reference for card styling quality |

## Sources

- Starlight `StarlightPage` component docs (considered but rejected in favor of MDX content pages — StarlightPage is for pages outside the content collection)
- Starlight sidebar `autogenerate` configuration (used for existing S02 content groups, will add a manual Reference group)
