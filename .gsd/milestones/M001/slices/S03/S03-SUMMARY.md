---
id: S03
parent: M001
milestone: M001
provides:
  - 5 searchable reference pages (commands, skills, extensions, agents, shortcuts) with 76 total expandable cards
  - 3 reusable Astro components (ReferenceCard, ReferenceGrid, ToolList) for card-based reference UI
  - Client-side category filtering with vanilla JS (no framework dependency)
  - Reference index overview page with CardGrid navigation
  - Sidebar "Quick Reference" group and updated hero CTA
  - 180+ lines of terminal-themed CSS for reference card system
requires:
  - slice: S01
    provides: content/generated/commands.json (42 commands), skills.json (8 skills), extensions.json (17 extensions), agents.json (5 agents)
  - slice: S02
    provides: Astro/Starlight site scaffold, terminal-native CSS variables, Pagefind search infrastructure
affects:
  - S06
key_files:
  - src/components/ReferenceCard.astro
  - src/components/ReferenceGrid.astro
  - src/components/ToolList.astro
  - src/content/docs/reference/commands.mdx
  - src/content/docs/reference/skills.mdx
  - src/content/docs/reference/extensions.mdx
  - src/content/docs/reference/agents.mdx
  - src/content/docs/reference/shortcuts.mdx
  - src/content/docs/reference/index.mdx
  - src/styles/terminal.css
  - astro.config.mjs
  - src/content/docs/index.mdx
key_decisions:
  - Native <details>/<summary> for zero-JS expand/collapse (D021)
  - Vanilla JS category filter with data-category attributes and .hidden class (D020)
  - Relative path MDX imports from content/generated/*.json with export const for computed data (D022)
  - Starlight sidebar links omit base path (Starlight prepends automatically)
  - Sub-skill display with indented green-bordered nesting (gh under github-workflows)
  - Extensions sorted by tool count, filtered by Has Tools / No Tools categories
patterns_established:
  - ref-card class with data-category attribute for filterable card pattern
  - aria-pressed on filter buttons for accessible toggle state
  - MDX JSON import via ../../../../content/generated/ relative path
  - export const for computed data between MDX frontmatter and JSX
  - Conditional rendering sections (objective, arguments, detection) shown only when data present
  - Graceful empty-state handling (extensions with 0 tools show descriptive fallback text)
  - Dark/light mode CSS mirroring — each rule block has both theme variants
observability_surfaces:
  - Build-time: npm run build reports 137 pages, Pagefind indexes 137
  - Card count: grep -o 'class="ref-card"' dist/reference/*/index.html | wc -l per page
  - Filter JS: document.querySelectorAll('.ref-card:not(.hidden)').length in browser DevTools
  - CSS: grep -c 'ref-card|ref-grid|filter-bar|tool-list' src/styles/terminal.css returns 38
  - Import failures: Astro build fails with MODULE_NOT_FOUND pointing to exact MDX file
drill_down_paths:
  - .gsd/milestones/M001/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T04-SUMMARY.md
duration: 26m
verification_result: passed
completed_at: 2026-03-17
---

# S03: Quick-reference pages

**Searchable cheat-sheet cards for all 42 GSD commands, 8 skills, 17 extensions, 5 agents, and 4 keyboard shortcuts — rendered as expandable reference cards with category filtering, integrated into sidebar and hero navigation, indexed by Pagefind search.**

## What Happened

Built the complete quick-reference section in 4 tasks:

**T01: Component foundation.** Created 3 Astro components — ReferenceCard (details/summary expand/collapse with data-category, badge props), ReferenceGrid (CSS grid with vanilla JS category filter bar using aria-pressed buttons), and ToolList (compact extension tool display). Added ~180 lines of terminal-themed CSS to terminal.css covering all card variants with dark and light mode.

**T02: Commands and shortcuts pages.** Created commands.mdx importing all 42 commands from commands.json, grouped by 7 categories (Session Commands, Configuration & Diagnostics, Git Commands, Session Management, Keyboard Shortcuts, CLI Flags, Getting Started) with a working category filter bar. Created shortcuts.mdx filtering the same data for the 4 keyboard shortcuts.

**T03: Skills, extensions, and agents pages.** Created skills.mdx rendering 8 skills with conditional sections (objective, arguments, detection) — gh displayed as a sub-skill of github-workflows with green-bordered indentation. Created extensions.mdx with 17 extensions sorted by tool count, using ToolList for tools and graceful fallback for 4 extensions with no tools. Created agents.mdx with 5 agents showing summary and conditional model/memory/tools info.

**T04: Navigation wiring.** Created reference/index.mdx overview with CardGrid linking to all 5 reference pages with item counts. Added "Quick Reference" sidebar group to astro.config.mjs (Home → Quick Reference → Placeholder → autogenerate). Updated hero page with reference section as primary CTA and content cards.

## Verification

All slice-level checks passed:

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `npm run build` exits 0 | ≥137 pages | 137 pages | ✅ |
| Pagefind index | ≥137 pages | 137 pages | ✅ |
| `find dist/reference/ -name "*.html" \| wc -l` | 6 | 6 | ✅ |
| `grep -o '<details' dist/reference/commands/index.html \| wc -l` | ≥42 | 52 | ✅ |
| `grep -o 'data-category' dist/reference/commands/index.html \| wc -l` | ≥1 | 50 | ✅ |
| `/gsd auto` in commands page | present | found | ✅ |
| Skill names in skills page | ≥8 | 36 matches | ✅ |
| Extension names in extensions page | ≥4 | 10 matches | ✅ |
| All 5 agent names | 5 unique | 5 unique | ✅ |
| "Quick Reference" in hero | present | found | ✅ |
| Card counts: commands/skills/extensions/agents/shortcuts | 42/8/17/5/4 | 42/8/17/5/4 | ✅ |
| CSS rule blocks | ≥12 | 38 | ✅ |
| Build errors/warnings for reference pages | 0 | 0 | ✅ |

## Requirements Advanced

- R006 — Terminal-native design extended to reference cards: 38 CSS rule blocks with dark/light mode for ref-card, ref-grid, filter-bar, tool-list
- R018 — S01 extraction data (commands.json, skills.json, extensions.json, agents.json) renders meaningfully as user-facing reference cards, proving the transformation pipeline works for these content types

## Requirements Validated

- R003 — 76 searchable, filterable, expandable cheat-sheet cards across 5 reference pages (42 commands, 8 skills, 17 extensions, 5 agents, 4 shortcuts). Category filter works. Pagefind indexes all content.
- R014 — All 8 skills documented with conditional objective/arguments/detection sections, gh nested under github-workflows
- R015 — All 17 extensions documented with tool lists, graceful handling of 4 toolless extensions
- R016 — All 5 agents documented with role, summary, conditional model/memory/tools info

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- T01 added `astro:after-swap` event listener for Astro view transitions (not in original plan but required for filter re-initialization after page swaps)
- T01 used custom `::before` pseudo-element for expand indicator instead of `::marker` (better cross-browser control)
- T03 had no executor-written task summary (agent completed the work but didn't persist T03-SUMMARY.md)

## Known Limitations

- Category headings (`<h2>`) remain visible when filter hides all cards in that category — filter targets `.ref-card` elements only, not headings. Cosmetic issue, could be fixed by extending the filter script.
- Skills page doesn't use ReferenceGrid/filter since there's only one logical group — no category filtering for skills
- `grep -c` undercounts on minified HTML (counts lines, not occurrences) — use `grep -o | wc -l` pattern for accurate verification
- Reference cards show one-line descriptions only — no command option details, no usage examples (content limited to what S01 extraction provides)

## Follow-ups

- none — all planned work for S03 is complete

## Files Created/Modified

- `src/components/ReferenceCard.astro` — New. Expandable card with details/summary, data-category, badge
- `src/components/ReferenceGrid.astro` — New. CSS grid with category filter bar and vanilla JS
- `src/components/ToolList.astro` — New. Compact tool list for extension cards
- `src/content/docs/reference/commands.mdx` — New. 42 commands across 7 categories with filter
- `src/content/docs/reference/shortcuts.mdx` — New. 4 keyboard shortcuts
- `src/content/docs/reference/skills.mdx` — New. 8 skills with conditional sections, sub-skill nesting
- `src/content/docs/reference/extensions.mdx` — New. 17 extensions with ToolList, sorted by tool count
- `src/content/docs/reference/agents.mdx` — New. 5 agents with conditional info
- `src/content/docs/reference/index.mdx` — New. Overview page with CardGrid linking to 5 reference pages
- `src/styles/terminal.css` — Modified. Added ~180 lines of reference card CSS
- `astro.config.mjs` — Modified. Added Quick Reference sidebar group
- `src/content/docs/index.mdx` — Modified. Updated hero CTA and cards to reference section

## Forward Intelligence

### What the next slice should know
- The 3 reference components (ReferenceCard, ReferenceGrid, ToolList) are reusable for any card-based content. S04 deep-dive pages could use them for command/config reference sections within narrative docs.
- MDX imports from content/generated use `../../../../content/generated/` relative paths. This is fragile if the docs directory depth changes.
- The hero page (index.mdx) now links to reference sections. S04/S05 will need to add their own links here.
- Pagefind indexes reference content alongside all other pages — search works across all content types.

### What's fragile
- MDX relative import paths (`../../../../content/generated/*.json`) — any restructuring of the docs directory hierarchy breaks all 5 reference pages. Consider an Astro alias if this becomes a maintenance burden.
- The category filter script re-initializes on `astro:after-swap` — if Starlight changes its view transition event name, the filter silently stops working after page navigation.

### Authoritative diagnostics
- `grep -o 'class="ref-card"' dist/reference/*/index.html | wc -l` — most reliable count of rendered cards per page, immune to minification
- `npm run build` page count and Pagefind index count — if either drops below 137, a reference page was lost
- Build errors surface MODULE_NOT_FOUND with exact file+line when JSON import paths are wrong

### What assumptions changed
- Plan assumed `grep -c` would work for counting elements in build output — minified HTML collapses many elements onto single lines, making `grep -c` undercount. Must use `grep -o | wc -l` pattern instead (documented in KNOWLEDGE.md).
