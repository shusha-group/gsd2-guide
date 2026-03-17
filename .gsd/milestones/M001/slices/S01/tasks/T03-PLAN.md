---
estimated_steps: 8
estimated_files: 5
---

# T03: Commands quick-reference page with cheat-sheet cards

**Slice:** S01 — Commands quick-reference with extraction pipeline and custom design
**Milestone:** M001

## Description

Build the Commands quick-reference page — the first real content page that proves the full pipeline works. Create the CheatSheetCard and FilterBar components, wire them to the extracted `data/commands.json`, and render a searchable, filterable reference page. Style everything with the terminal-native dark theme. Verify Pagefind indexes the content for site-wide search.

## Steps

1. Read the frontend-design skill before building components
2. Create `src/components/CheatSheetCard.astro` — expandable card showing command name (monospace, terminal green), description, category badge, keyboard shortcut badge (if applicable). Collapsed state shows name + one-liner. Expanded state shows full description, options, and examples. Use CSS transitions for expand/collapse. Client-side JS for toggle behavior.
3. Create `src/components/FilterBar.astro` — horizontal bar with category buttons (All, Session, Config, Git, Shortcuts, CLI). Active state highlighted. Client-side JS for filter logic. Styled to match terminal aesthetic.
4. Create `src/content/docs/reference/commands.mdx` — imports `data/commands.json`, renders FilterBar and CheatSheetCard for each command. Group by category. Add page frontmatter for Starlight sidebar placement.
5. Create `src/styles/components.css` — card styles (subtle border, hover glow, monospace name), filter button styles, expand animation, responsive layout (cards stack on mobile, grid on desktop)
6. Wire the Astro config sidebar to include `reference/commands` under the Reference group
7. Verify Pagefind indexes the command content by building the site (`npm run build`) and checking search
8. Test in browser: filter by category, expand a card, search for "auto"

## Must-Haves

- [ ] Commands page renders all 20+ commands as CheatSheetCard components
- [ ] Each card shows: command name, description, category badge
- [ ] Cards expand on click to show detailed info
- [ ] FilterBar filters cards by category (All, Session, Config, Git, Shortcuts, CLI)
- [ ] Components styled with terminal-native dark theme (monospace names, terminal green accents, dark card backgrounds)
- [ ] `npm run build` succeeds and Pagefind search for "auto" returns the /gsd auto command
- [ ] Page is responsive — cards stack on mobile, grid on desktop

## Verification

- Dev server: Commands page shows all commands as styled cards
- Clicking "Session" filter shows only session commands
- Clicking a card expands to show detail
- `npm run build` succeeds without errors
- Open built site, Pagefind search for "auto" returns `/gsd auto` command

## Inputs

- `data/commands.json` — extracted command data from T02
- `src/styles/custom.css` — theme variables from T01
- Astro/Starlight config from T01
- D007 (cheat-sheet cards, searchable, filterable, expandable) from DECISIONS.md

## Expected Output

- `src/components/CheatSheetCard.astro` — Reusable expandable card component
- `src/components/FilterBar.astro` — Category filter bar component
- `src/content/docs/reference/commands.mdx` — Commands quick-reference page
- `src/styles/components.css` — Component-specific styles
- Updated `astro.config.mjs` sidebar with Reference → Commands entry
