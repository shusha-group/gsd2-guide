---
estimated_steps: 4
estimated_files: 2
---

# T02: Create commands and shortcuts reference pages

**Slice:** S03 — Quick-reference pages
**Milestone:** M001

## Description

Build the two highest-value reference pages: the commands page (42 commands across 7 categories with filtering) and the shortcuts page (4 keyboard shortcuts). These are the primary user loop for R003 — "what does this command do?" Commands uses the full ReferenceGrid with category filter; shortcuts is a simpler single-group listing.

The data lives in `content/generated/commands.json`. Each entry has `{command, description, category}`. The JSON must be imported via relative path from the MDX file.

**Important Astro/MDX patterns:**
- MDX imports must be ESM `import` statements BELOW the frontmatter fence, not inside it
- Path from `src/content/docs/reference/commands.mdx` to `content/generated/commands.json` is `../../../../content/generated/commands.json`
- Component imports use relative paths to `src/components/`
- Components created in T01: `ReferenceCard.astro` (props: title, subtitle, category, badge), `ReferenceGrid.astro` (props: categories string[]), `ToolList.astro`

## Steps

1. **Create `src/content/docs/reference/commands.mdx`** — Frontmatter: `title: "Commands"`, `description: "All 42 GSD commands — searchable, filterable cheat-sheet cards."`. Below frontmatter, import the JSON and components:
   ```
   import commands from '../../../../content/generated/commands.json';
   import ReferenceCard from '../../../../src/components/ReferenceCard.astro';
   import ReferenceGrid from '../../../../src/components/ReferenceGrid.astro';
   ```
   Extract unique categories from the data: `const categories = [...new Set(commands.map(c => c.category))]`. Render a brief intro paragraph ("42 commands across 7 categories. Click to expand for details."). Then render `<ReferenceGrid categories={categories}>` containing, for each category, an `<h2>` heading with the category name, followed by `<ReferenceCard>` for each command in that category. Card props: `title={cmd.command}`, `subtitle={cmd.description}`, `category={cmd.category}`. The card body (slot) can be empty for commands — the subtitle (description) is the main content.

2. **Create `src/content/docs/reference/shortcuts.mdx`** — Frontmatter: `title: "Keyboard Shortcuts"`, `description: "GSD keyboard shortcuts for quick actions."`. Import commands.json and ReferenceCard. Filter for `category === "Keyboard Shortcuts"` (4 items). Render cards without ReferenceGrid (no filter needed for 4 items — just a simple list). Each card: `title={shortcut.command}`, `subtitle={shortcut.description}`.

3. **Build and verify** — Run `npm run build`. Check:
   - `dist/reference/commands/index.html` exists
   - `dist/reference/shortcuts/index.html` exists
   - Commands page has ≥42 `<details` elements
   - Shortcuts page has ≥4 `<details` elements
   - Category filter data attributes present: `grep 'data-category' dist/reference/commands/index.html`
   - Known command renders: `grep '/gsd auto' dist/reference/commands/index.html`

4. **Fix any import path issues** — If the build fails due to JSON import paths or component import paths, adjust the relative paths. The path depth from `src/content/docs/reference/` to project root is 4 levels (`../../../../`). Component imports from MDX in content dirs use the same relative path approach: `../../../../src/components/ReferenceCard.astro`.

## Must-Haves

- [ ] commands.mdx renders all 42 commands from commands.json
- [ ] Commands grouped by 7 categories with section headings
- [ ] Category filter bar renders and uses data-category attributes
- [ ] shortcuts.mdx renders exactly the 4 "Keyboard Shortcuts" category items
- [ ] Both pages have Starlight frontmatter (title, description) for sidebar/search
- [ ] `npm run build` succeeds with both pages

## Verification

- `npm run build` exits 0
- `find dist/reference/ -name "*.html" | wc -l` ≥ 2
- `grep -c '<details' dist/reference/commands/index.html` returns ≥42
- `grep -c '<details' dist/reference/shortcuts/index.html` returns ≥4
- `grep 'data-category' dist/reference/commands/index.html` returns matches
- `grep '/gsd auto' dist/reference/commands/index.html` succeeds
- `grep 'Session Commands\|CLI Flags\|Keyboard Shortcuts' dist/reference/commands/index.html` returns matches for all 3

## Inputs

- `content/generated/commands.json` — 42 entries, each `{command: string, description: string, category: string}`. Categories: "Session Commands" (14), "Configuration & Diagnostics" (10), "Session Management" (7), "CLI Flags" (4), "Keyboard Shortcuts" (4), "Getting Started" (2), "Git Commands" (1).
- `src/components/ReferenceCard.astro` — from T01. Props: title, subtitle, category, badge.
- `src/components/ReferenceGrid.astro` — from T01. Props: categories (string[]).

## Expected Output

- `src/content/docs/reference/commands.mdx` — 42 commands in 7 category groups with filter bar
- `src/content/docs/reference/shortcuts.mdx` — 4 keyboard shortcuts as expandable cards
- Both pages render in the Astro build and are indexed by Pagefind
