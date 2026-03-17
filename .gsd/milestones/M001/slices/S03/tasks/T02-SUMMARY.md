---
id: T02
parent: S03
milestone: M001
provides:
  - Commands reference page with 42 commands across 7 filterable categories
  - Keyboard Shortcuts reference page with 4 shortcut cards
key_files:
  - src/content/docs/reference/commands.mdx
  - src/content/docs/reference/shortcuts.mdx
key_decisions:
  - Category headings rendered inside ReferenceGrid alongside cards — headings remain visible when filter hides cards (filter targets .ref-card only)
  - Shortcuts page uses ReferenceCard without ReferenceGrid wrapper since 4 items don't need filtering
patterns_established:
  - MDX JSON import from content/generated via ../../../../content/generated/ relative path
  - MDX component import via ../../../../src/components/ relative path
  - export const for computed data in MDX (categories, filtered arrays) between frontmatter and JSX
observability_surfaces:
  - grep -o 'class="ref-card"' dist/reference/commands/index.html | wc -l → should return 42
  - grep -o 'class="ref-card"' dist/reference/shortcuts/index.html | wc -l → should return 4
  - Browser DevTools: document.querySelectorAll('.ref-card.hidden').length changes when category filter is clicked
  - Build failure on wrong import path produces MODULE_NOT_FOUND with exact file+line
duration: 8m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Create commands and shortcuts reference pages

**Built commands reference page (42 commands, 7 categories, client-side filter) and keyboard shortcuts page (4 shortcuts) — both render from commands.json data.**

## What Happened

Created two MDX reference pages that import `content/generated/commands.json` and render expandable reference cards using the T01 components.

**commands.mdx**: Imports the full 42-command dataset, extracts unique categories via `[...new Set()]`, renders a `ReferenceGrid` with category filter bar wrapping all commands grouped under `<h2>` category headings. Each command renders as a `ReferenceCard` with the command name as title and description as subtitle.

**shortcuts.mdx**: Filters commands.json for `category === "Keyboard Shortcuts"` (4 items), renders cards without `ReferenceGrid` since filtering isn't needed for 4 items.

Both pages use `export const` for computed data between the frontmatter fence and JSX content — this is the correct Astro/MDX pattern for derived data.

## Verification

- `npm run build` exits 0 — 133 pages built
- `find dist/reference/ -name "*.html" | wc -l` → 2 (commands + shortcuts)
- `grep -o 'class="ref-card"' dist/reference/commands/index.html | wc -l` → 42 ✅
- `grep -o 'class="ref-card"' dist/reference/shortcuts/index.html | wc -l` → 4 ✅
- `grep -o 'data-category' dist/reference/commands/index.html | wc -l` → 50 (42 cards + 7 headings + filter buttons) ✅
- `grep '/gsd auto' dist/reference/commands/index.html` → found ✅
- All 7 category headings present: Session Commands, Configuration & Diagnostics, Git Commands, Session Management, Keyboard Shortcuts, CLI Flags, Getting Started ✅
- Browser: filter bar click on "CLI Flags" → 38 cards hidden, 4 visible ✅
- Browser: card expand → description text renders inside details ✅
- No build errors/warnings related to reference components ✅

### Slice-level verification (partial — T02 is intermediate)

| Check | Status |
|-------|--------|
| `npm run build` exits 0 | ✅ PASS (133 pages) |
| `find dist/reference/ -name "*.html" \| wc -l` = 6 | ⏳ 2/6 (T03+T04 will add remaining 4) |
| `grep -c '<details' dist/reference/commands/index.html` ≥42 | ✅ PASS (51 total, 42 ref-cards) |
| `grep -c 'data-category' dist/reference/commands/index.html` ≥1 | ✅ PASS (50) |
| `grep -l '/gsd auto' dist/reference/commands/index.html` | ✅ PASS |
| Skills/extensions/agents pages | ⏳ Not yet created (T03) |
| Quick Reference in hero | ⏳ Not yet wired (T04) |
| 137+ pages | ⏳ 133 currently |

## Diagnostics

- **Rendered output**: `grep -o 'class="ref-card"' dist/reference/commands/index.html | wc -l` confirms all 42 commands rendered. Same pattern for shortcuts page with expected count 4.
- **Filter runtime**: Click any category filter button → `document.querySelectorAll('.ref-card.hidden').length` should change. `document.querySelector('.filter-bar button[aria-pressed="true"]').textContent` shows active filter.
- **Import failures**: Wrong JSON path → Astro build fails with `MODULE_NOT_FOUND` pointing to exact MDX file and import line. Wrong component path → template compilation error with file context.
- **Note on grep -c**: The minified HTML puts multiple `<details` on the same line, so `grep -c` (line count) returns lower than actual. Use `grep -o '<details' | wc -l` for occurrence count.

## Deviations

None. Implementation matches the plan exactly.

## Known Issues

- Category headings (`<h2>`) remain visible when the filter hides all cards in that category. The filter script targets `.ref-card` elements only, not headings. This is cosmetic and could be addressed by extending the filter script to also hide headings with matching `data-category` when no visible cards remain in that group. Not in scope for T02.

## Files Created/Modified

- `src/content/docs/reference/commands.mdx` — New. 42 commands across 7 categories with ReferenceGrid filter bar
- `src/content/docs/reference/shortcuts.mdx` — New. 4 keyboard shortcuts as expandable reference cards
- `.gsd/milestones/M001/slices/S03/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix)
