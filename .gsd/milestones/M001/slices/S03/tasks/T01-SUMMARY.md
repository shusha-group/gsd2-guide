---
id: T01
parent: S03
milestone: M001
provides:
  - ReferenceCard component (details/summary expand/collapse, data-category, badge)
  - ReferenceGrid component (CSS grid wrapper with vanilla JS category filter)
  - ToolList component (compact extension tool display)
  - Terminal-themed CSS for all reference card UI elements
key_files:
  - src/components/ReferenceCard.astro
  - src/components/ReferenceGrid.astro
  - src/components/ToolList.astro
  - src/styles/terminal.css
key_decisions:
  - Used native <details>/<summary> for zero-JS expand/collapse
  - Filter script uses querySelectorAll with .hidden class toggle — no framework
  - Custom ::before triangle indicator (▸) replaces default details marker for cross-browser consistency
  - Filter re-initializes on astro:after-swap for Astro view transitions support
patterns_established:
  - ref-card class with data-category attribute for filterable card pattern
  - aria-pressed on filter buttons for accessible toggle state
  - .hidden class for filter visibility (display:none)
  - Dark/light mode CSS mirroring pattern: each rule block has both :root[data-theme='dark'] and :root[data-theme='light'] variants
observability_surfaces:
  - Build-time: Astro compiler validates component syntax during npm run build
  - Runtime: document.querySelectorAll('.ref-card:not(.hidden)').length shows active filter state
  - CSS presence: grep -c 'ref-card|ref-grid|filter-bar|tool-list' src/styles/terminal.css returns 38
duration: 8m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Build reference card components and terminal-styled CSS

**Created 3 Astro components (ReferenceCard, ReferenceGrid, ToolList) and added ~180 lines of terminal-themed CSS for reference card UI.**

## What Happened

Built the foundational component layer for all S03 reference pages:

1. **ReferenceCard.astro** — Expandable card using `<details>/<summary>` with props for title, subtitle, category (data-category attr), and badge. Custom ▸ triangle indicator with rotation animation on open. No client JS for expand/collapse.

2. **ReferenceGrid.astro** — Grid container with optional category filter bar. When `categories` prop is provided, renders a toolbar of filter buttons with `data-filter` and `aria-pressed` attributes. Vanilla JS `<script>` adds click handlers that toggle `.hidden` class on `.ref-card` elements matching `data-category`. Re-initializes on `astro:after-swap` for view transitions.

3. **ToolList.astro** — Compact tool list that renders `<ul class="tool-list">` only when tools array is non-empty. Each item shows tool name in `<code>` and description as plain text.

4. **terminal.css** — Appended ~180 lines of CSS covering `.ref-grid`, `.ref-card` (with summary, subtitle, detail-content, badge variants), `.filter-bar` (with aria-pressed active state and hover), `.tool-list` (with li, code), and `.hidden`. Full dark and light mode coverage.

## Verification

- `npm run build` exits 0 with 131 pages, 0 errors — components parse cleanly ✅
- `grep -c 'ref-card|ref-grid|filter-bar|tool-list' src/styles/terminal.css` returns 38 (≥12 required) ✅
- ReferenceCard.astro contains `<details` and `<summary` ✅
- ReferenceGrid.astro contains `<script>` with `querySelectorAll` ✅
- ToolList.astro contains `<ul class="tool-list"` ✅
- Build log contains 0 `[ERROR]` or `[WARN]` lines related to reference components ✅

**Slice-level checks (partial, as expected for T01):**
- Build exits 0: ✅ (131 pages)
- Reference HTML files in dist: 0 (expected — pages created in T02-T04)
- CSS rule blocks present: ✅ (38 matches)
- No build errors/warnings: ✅

## Diagnostics

- **Component parse**: Import any component into an MDX file and run `npm run build` — Astro compiler will surface any prop or template errors with file+line context.
- **CSS presence**: `grep -c 'ref-card\|ref-grid\|filter-bar\|tool-list' src/styles/terminal.css` — should return ≥12.
- **Filter JS**: In browser DevTools, run `document.querySelectorAll('.filter-bar button[aria-pressed="true"]').length` to see active filter count, and `document.querySelectorAll('.ref-card.hidden').length` to see hidden card count.

## Deviations

- Added `astro:after-swap` event listener in ReferenceGrid filter script (not in plan) — needed for Astro view transitions to re-initialize filter handlers after page swaps.
- Used custom `::before` pseudo-element for triangle indicator instead of `::marker` — provides better cross-browser styling control and animation support.

## Known Issues

None.

## Files Created/Modified

- `src/components/ReferenceCard.astro` — New. Expandable card with details/summary, data-category, badge.
- `src/components/ReferenceGrid.astro` — New. Grid layout with optional category filter bar and vanilla JS.
- `src/components/ToolList.astro` — New. Compact tool list for extension cards.
- `src/styles/terminal.css` — Modified. Added ~180 lines of reference card, grid, filter bar, and tool list CSS with dark+light mode.
- `.gsd/milestones/M001/slices/S03/S03-PLAN.md` — Modified. Added Observability/Diagnostics section and failure-path verification check.
- `.gsd/milestones/M001/slices/S03/tasks/T01-PLAN.md` — Modified. Added Observability Impact section.
