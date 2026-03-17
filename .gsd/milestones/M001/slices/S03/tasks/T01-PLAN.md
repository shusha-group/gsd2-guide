---
estimated_steps: 5
estimated_files: 4
---

# T01: Build reference card components and terminal-styled CSS

**Slice:** S03 — Quick-reference pages
**Milestone:** M001

## Description

Create the three Astro components that all reference pages depend on: ReferenceCard (expandable cheat-sheet item), ReferenceGrid (grid layout with category filter), and ToolList (compact tool display). Add corresponding CSS to the existing terminal.css stylesheet. These components use `<details>/<summary>` for native expand/collapse (zero client JS for expand) and a small vanilla JS `<script>` for the category filter. No React/Vue/Svelte — Astro ships zero client JS by default.

**Relevant skill:** `frontend-design` — reference for card styling quality and terminal aesthetic consistency.

## Steps

1. **Create `src/components/ReferenceCard.astro`** — An expandable card component using `<details>/<summary>`. Props: `title` (string, required), `subtitle` (string, optional — one-liner description), `category` (string, optional — used for filtering via `data-category` attribute), `badge` (string, optional — small label like tool count). The `<summary>` shows title + badge. Below the summary, render subtitle as a paragraph, then a `<slot />` for additional detail content (arguments, tools, etc.). Wrap in a div with class `ref-card` and `data-category={category}`.

2. **Create `src/components/ReferenceGrid.astro`** — A grid layout wrapper. Props: `categories` (string array, optional — if provided, renders a filter bar). The filter bar is a row of buttons, each with a `data-filter` attribute matching a category name, plus an "All" button. Children (cards) are rendered in a CSS grid via `<slot />`. Includes a vanilla JS `<script>` tag that:
   - Attaches click handlers to filter buttons
   - On filter click, hides/shows `.ref-card` elements by matching `data-category` against the active filter
   - "All" shows everything
   - Updates `aria-pressed` on the active button for accessibility
   - The script uses `document.querySelectorAll` — no framework.

3. **Create `src/components/ToolList.astro`** — A compact list for extension tools. Props: `tools` (array of `{name: string, description: string}`). Renders a `<ul class="tool-list">` where each `<li>` has the tool name in a `<code>` tag and description as plain text. If tools array is empty, renders nothing (the parent card handles the empty state message).

4. **Add reference card CSS to `src/styles/terminal.css`** — Append new style rules at the end of terminal.css. Styles needed:
   - `.ref-grid` — CSS grid, `grid-template-columns: 1fr` (single column, cards are full-width for readability)
   - `.ref-card` — border `1px solid #1a2e1a`, background `#0d120d`, margin-bottom, border-radius 2px
   - `.ref-card summary` — cursor pointer, padding, font-family mono, color `#39ff14`, font-weight 600. Include a `::marker` or custom triangle indicator.
   - `.ref-card[open]` — border-color changes to `#39ff1440` to show active state
   - `.ref-card .subtitle` — color `#b4c8b4`, font-size 0.9rem
   - `.ref-card .detail-content` — padding, border-top `1px dashed #1a2e1a`
   - `.ref-card .badge` — inline-block, background `#39ff1420`, color `#39ff14`, font-size 0.75rem, padding, border-radius, font-family mono
   - `.filter-bar` — flex row, gap, margin-bottom, flex-wrap
   - `.filter-bar button` — background `#141e14`, border `1px solid #1a2e1a`, color `#7a9a7a`, padding, font-family mono, font-size 0.8rem, cursor pointer
   - `.filter-bar button[aria-pressed="true"]` — background `#39ff1420`, color `#39ff14`, border-color `#39ff14`
   - `.filter-bar button:hover` — color `#b8ffb0`
   - `.tool-list` — list-style none, padding 0, margin 0.5rem 0
   - `.tool-list li` — padding 0.25rem 0, border-bottom `1px dashed #1a2e1a40`, font-size 0.85rem
   - `.tool-list code` — color `#39ff14`, font-weight 600
   - Light mode overrides for all of the above using `:root[data-theme='light']` selector with appropriate inverted colors
   - `.ref-card.hidden` — `display: none` (used by filter JS)

5. **Verify** — Run `npm run build` to confirm the components parse correctly. No reference pages exist yet at this point; the build just needs to succeed without errors from the new files. Verify terminal.css has the new rule blocks.

## Must-Haves

- [ ] ReferenceCard uses `<details>/<summary>` — no client JS for expand/collapse
- [ ] ReferenceGrid filter uses vanilla JS `<script>` — no framework dependency
- [ ] ToolList handles empty arrays gracefully (renders nothing)
- [ ] All CSS uses existing terminal theme variables/colors (#39ff14, #0a0e0a, #1a2e1a, #b4c8b4, etc.)
- [ ] Filter bar buttons have `aria-pressed` for accessibility
- [ ] Card elements include `data-category` attribute for filtering
- [ ] Light mode CSS overrides included for all new rules

## Verification

- `npm run build` exits 0 (no broken imports or syntax errors in new files)
- `cat src/components/ReferenceCard.astro` exists and contains `<details` and `<summary`
- `cat src/components/ReferenceGrid.astro` exists and contains `<script>` with `querySelectorAll`
- `cat src/components/ToolList.astro` exists and contains `<ul class="tool-list"`
- `grep -c 'ref-card\|ref-grid\|filter-bar\|tool-list' src/styles/terminal.css` returns ≥12 (multiple rule blocks)

## Inputs

- `src/styles/custom.css` — Theme variable definitions (accent colors, backgrounds, fonts)
- `src/styles/terminal.css` — Existing terminal effects CSS (append new rules)
- S02 design patterns: phosphor green #39FF14 accent, near-black #0a0e0a bg, JetBrains Mono for headings/code, Outfit for body, green-tinted gray scale
- Data shape knowledge: commands have `{command, description, category}`, skills have `{name, description, path, objective?, arguments?, detection?, parentSkill?}`, extensions have `{name, description, tools: [{name, description}]}`, agents have `{name, description, summary, model?, memory?, tools?}`

## Observability Impact

- **Build-time verification**: New `.astro` component files are validated by the Astro compiler during `npm run build`. Any prop type mismatch, broken template syntax, or import error produces a build failure with file/line context.
- **CSS rule presence**: `grep -c 'ref-card\|ref-grid\|filter-bar\|tool-list' src/styles/terminal.css` returns ≥12, confirming all rule blocks exist. A future agent can verify the CSS is loaded by inspecting computed styles in the browser.
- **Filter JS inspectability**: The vanilla JS filter script in ReferenceGrid uses `aria-pressed` on buttons and `.hidden` class toggling on cards. Both are observable via DevTools accessibility tree and `document.querySelectorAll('.ref-card:not(.hidden)').length`.
- **Failure state**: If components are imported but data props are wrong shape, Astro renders empty slots or missing text — the built HTML will have empty `<details>` blocks, detectable by `grep -c '<details' dist/...` returning fewer than expected.

## Expected Output

- `src/components/ReferenceCard.astro` — Expandable card with details/summary, data-category, badge support
- `src/components/ReferenceGrid.astro` — Grid layout with optional category filter bar and vanilla JS filtering
- `src/components/ToolList.astro` — Compact tool list for extension cards
- `src/styles/terminal.css` — Extended with ~80 lines of reference card, grid, filter, and tool-list CSS
