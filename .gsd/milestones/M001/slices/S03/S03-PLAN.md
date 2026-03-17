# S03: Quick-reference pages

**Goal:** Searchable cheat-sheet cards for all GSD commands (42), skills (8), extensions (17), agents (5), and keyboard shortcuts (4), rendered as expandable reference cards grouped by category with client-side filtering.

**Demo:** Navigate to `/gsd2-guide/reference/commands/` and see 42 command cards grouped by 7 categories. Click a category filter to narrow the list. Click a card to expand and see details. Navigate to skills, extensions, agents, shortcuts pages — each renders its full dataset with appropriate detail sections. Pagefind search returns results from reference page content.

## Must-Haves

- ReferenceCard component using `<details>/<summary>` for zero-JS expand/collapse
- ReferenceGrid component with CSS grid layout and category filter bar (vanilla JS)
- ToolList component for compact extension tool display
- Commands page with 42 commands across 7 categories, filterable
- Shortcuts page with 4 keyboard shortcuts extracted from commands.json
- Skills page with 8 skills, conditional objective/arguments/detection sections, gh nested under github-workflows
- Extensions page with 17 extensions, ToolList for tools[], graceful empty-tool handling
- Agents page with 5 agents, role/model/tools info where available
- Reference index page linking to all 5 reference sections
- Sidebar "Quick Reference" group before autogenerate groups
- Hero page updated to link to reference section
- All reference content indexed by Pagefind search
- Terminal-native card styling consistent with S02 design

## Proof Level

- This slice proves: integration (S01 JSON data → Astro components → rendered searchable pages)
- Real runtime required: yes (Astro build + Pagefind indexing)
- Human/UAT required: no (structural verification sufficient, visual polish is S02's domain)

## Verification

- `npm run build` exits 0 with 137+ pages (up from 131)
- `find dist/reference/ -name "*.html" | wc -l` returns 6 (index + 5 reference pages)
- `grep -c '<details' dist/reference/commands/index.html` returns ≥42
- `grep -c 'data-category' dist/reference/commands/index.html` returns ≥1 (filter bar renders)
- `grep -l '/gsd auto' dist/reference/commands/index.html` succeeds (commands render)
- `grep -c 'debug-like-expert\|frontend-design\|lint\|review\|test\|swiftui\|github-workflows\|gh' dist/reference/skills/index.html` returns ≥8
- `grep -c 'browser-tools\|gsd\|mac-tools\|bg-shell' dist/reference/extensions/index.html` returns ≥4
- `grep -c 'scout\|researcher\|worker\|javascript-pro\|typescript-pro' dist/reference/agents/index.html` returns 5
- `grep 'Quick Reference' dist/index.html` succeeds (hero links to reference)
- Pagefind search index reports 137+ pages

## Integration Closure

- Upstream surfaces consumed: `content/generated/commands.json` (42 commands), `content/generated/skills.json` (8 skills), `content/generated/extensions.json` (17 extensions), `content/generated/agents.json` (5 agents) from S01; Astro site scaffold, custom CSS, Pagefind search from S02
- New wiring introduced: 3 Astro components, 6 MDX reference pages, sidebar group, hero links
- What remains before the milestone is truly usable end-to-end: S04 (deep-dive docs), S05 (changelog), S06 (deploy pipeline)

## Tasks

- [ ] **T01: Build reference card components and terminal-styled CSS** `est:35m`
  - Why: All 5 reference pages depend on shared card components. This unblocks everything.
  - Files: `src/components/ReferenceCard.astro`, `src/components/ReferenceGrid.astro`, `src/components/ToolList.astro`, `src/styles/terminal.css`
  - Do: Create ReferenceCard (details/summary, props: title/subtitle/category/badge), ReferenceGrid (CSS grid wrapper with data-category filter bar + vanilla JS script), ToolList (ul with tool name in mono + description). Add `.ref-card`, `.ref-grid`, `.filter-bar`, `details`/`summary` styles to terminal.css using existing theme variables (#39ff14 accent, #0a0e0a backgrounds, green-tinted borders). No JS framework dependencies — filter uses vanilla JS in an Astro `<script>` tag.
  - Verify: Create a minimal test MDX page at `src/content/docs/reference/commands.mdx` that imports one component with hardcoded data to confirm the component renders in `npm run build`
  - Done when: All 3 components exist, render without build errors, card styling uses terminal theme

- [ ] **T02: Create commands and shortcuts reference pages** `est:30m`
  - Why: Commands are the primary user loop (R003) — "what does this command do?" is the #1 query. Shortcuts are a subset of the same data.
  - Files: `src/content/docs/reference/commands.mdx`, `src/content/docs/reference/shortcuts.mdx`
  - Do: In commands.mdx, import commands.json (path: `../../../../content/generated/commands.json`), group by category, render ReferenceGrid with filter bar + ReferenceCards for all 42 commands. In shortcuts.mdx, filter commands.json for category "Keyboard Shortcuts" (4 items), render without filter bar. Each card shows command name as title, description as summary.
  - Verify: `npm run build` succeeds, `grep -c '<details' dist/reference/commands/index.html` ≥ 42, `grep -c '<details' dist/reference/shortcuts/index.html` ≥ 4
  - Done when: 42 commands render across 7 categories with working filter, 4 shortcuts on their own page

- [ ] **T03: Create skills, extensions, and agents reference pages** `est:35m`
  - Why: Satisfies R014 (skills docs), R015 (extensions docs), R016 (agents docs). Each has a different data shape requiring conditional rendering.
  - Files: `src/content/docs/reference/skills.mdx`, `src/content/docs/reference/extensions.mdx`, `src/content/docs/reference/agents.mdx`
  - Do: Skills page — import skills.json, render cards with conditional sections (objective, arguments, detection shown only when present). Display `gh` as a sub-skill of `github-workflows` (check `parentSkill` field). Extensions page — import extensions.json, render cards with ToolList for tools[]. Handle 4 extensions with 0 tools gracefully ("Uses hooks/commands instead of tools" or similar). Handle 2 extensions with empty descriptions (slash-commands, voice). Agents page — import agents.json, render cards showing summary, with conditional model/memory/tools info.
  - Verify: `npm run build` succeeds. Skills: grep finds all 8 skill names. Extensions: grep finds extension names, extensions with 0 tools don't show empty lists. Agents: grep finds all 5 agent names.
  - Done when: All 3 pages render complete data with graceful empty-state handling

- [ ] **T04: Create reference index, wire sidebar, and update hero** `est:20m`
  - Why: Integration task — makes reference pages discoverable via sidebar navigation, hero links, and the reference index overview page.
  - Files: `src/content/docs/reference/index.mdx`, `astro.config.mjs`, `src/content/docs/index.mdx`
  - Do: Create reference/index.mdx with CardGrid linking to all 5 reference pages (use Starlight LinkCard component, include item counts). Add "Quick Reference" sidebar group in astro.config.mjs — place it after Home, before Placeholder. Items: Commands (42), Skills (8), Extensions (17), Agents (5), Shortcuts (4), with Overview linking to index. Update hero page (index.mdx) to replace placeholder links with reference section links. All internal hrefs must include `/gsd2-guide/` base prefix.
  - Verify: `npm run build` exits 0 with 137+ pages. `find dist/reference/ -name "*.html" | wc -l` = 6. `grep 'Quick Reference' dist/index.html` succeeds. Pagefind reports 137+ pages in index.
  - Done when: Reference section is discoverable from sidebar, hero, and index page. Full build succeeds with all reference pages.

## Files Likely Touched

- `src/components/ReferenceCard.astro` (new)
- `src/components/ReferenceGrid.astro` (new)
- `src/components/ToolList.astro` (new)
- `src/content/docs/reference/index.mdx` (new)
- `src/content/docs/reference/commands.mdx` (new)
- `src/content/docs/reference/skills.mdx` (new)
- `src/content/docs/reference/extensions.mdx` (new)
- `src/content/docs/reference/agents.mdx` (new)
- `src/content/docs/reference/shortcuts.mdx` (new)
- `src/styles/terminal.css` (modify — add reference card styles)
- `astro.config.mjs` (modify — add Quick Reference sidebar group)
- `src/content/docs/index.mdx` (modify — update hero links)
