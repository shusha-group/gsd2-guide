---
id: T02
parent: S04
milestone: M001
provides:
  - Sidebar with 10 logical groups covering all 133 pages — Guides (15 root pages), Architecture (4 pages), plus 6 autogenerate subdirectory groups
  - Landing page with Getting Started primary CTA and deep-dive LinkCards
  - Placeholder scaffolding removed (3 files deleted)
key_files:
  - astro.config.mjs
  - src/content/docs/index.mdx
key_decisions:
  - Root-level doc pages split into Guides (15 user-facing pages) and Architecture (4 technical pages) sidebar groups for logical navigation
  - Getting Started promoted to primary hero CTA above Quick Reference
patterns_established:
  - Explicit sidebar entries for root-level pages; autogenerate groups only for multi-file subdirectories
observability_surfaces:
  - "Build page count: `npm run build` reports total pages (expect ≥130)"
  - "Placeholder check: `find dist/ -path '*/placeholder/*' | wc -l` must return 0"
  - "Sidebar groups: grep for 'Guides' or 'Architecture' in any built HTML page's nav"
  - "Landing CTA: `grep 'getting-started' dist/index.html` confirms hero link"
duration: 5 minutes
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Reorganize sidebar, remove placeholders, and verify build

**Restructured sidebar into 10 logical groups (Guides + Architecture + 6 autogenerate), deleted placeholder scaffolding, added deep-dive links to landing page — 133 pages build successfully.**

## What Happened

1. **Sidebar restructured** in `astro.config.mjs`: Removed empty "Getting Started" autogenerate group (no matching directory) and "Placeholder" group. Added "Guides" group with 15 explicit entries for root-level doc pages in logical reading order. Added "Architecture" group with 4 explicit entries. Kept all 6 autogenerate subdirectory groups (what-is-pi, building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals).

2. **Placeholder directory deleted**: Removed `src/content/docs/placeholder/` with its 3 files (components.mdx, diagrams.mdx, code-examples.mdx). These were S02 scaffolding demos superseded by real content.

3. **Landing page updated** in `src/content/docs/index.mdx`: Added "Getting Started" as primary hero CTA (with arrow icon). Demoted "Quick Reference" to minimal variant. Added "Deep-Dive Guides" section with 4 LinkCards (Getting Started, Auto Mode, Architecture, Troubleshooting) below existing Quick Reference cards.

4. **Build verified**: `npm run build` exited 0, producing 133 HTML pages. No slug collisions between `commands.md` (root) and `reference/commands.mdx` — they resolve to different slugs.

## Verification

All checks passed:

- `npm run build` — exit 0, 133 pages built
- `find dist/ -name "*.html" | wc -l` → **133** (≥130 ✓)
- `find dist/ -path "*/placeholder/*" | wc -l` → **0** ✓
- `find dist/ -path "*/readme/index.html" | wc -l` → **0** ✓
- `grep -l 'Getting Started' dist/index.html` → found ✓
- Sidebar spot-check: `grep 'getting-started' dist/auto-mode/index.html` → shows `/gsd2-guide/getting-started/` sidebar link ✓
- Link rewrite: `grep -o 'href="[^"]*auto-mode[^"]*"' dist/getting-started/index.html` → `/gsd2-guide/auto-mode/` (not `.md`) ✓
- `.md)` residuals: 17 occurrences — all are content references to filenames (AGENTS.md, SYSTEM.md, DECISIONS.md, etc.), not broken navigation links ✓
- Cross-page links: getting-started→auto-mode ✓, auto-mode→git-strategy ✓, configuration→token-optimization ✓
- `dist/building-coding-agents/index.html` exists (README became index) ✓
- Sidebar contains Guides, Architecture, What Is Pi, Building Coding Agents, etc. groups ✓

### Slice-level verification status (S04)

| Check | Status |
|-------|--------|
| `npm run build` exits 0 with ≥130 pages | ✅ 133 pages |
| `.md)` residuals only external/code-block | ✅ 17 content refs only |
| No `/readme/` pages | ✅ 0 |
| Sidebar has getting-started, auto-mode, architecture, troubleshooting | ✅ all present |
| building-coding-agents/index.html exists | ✅ |
| Internal link spot-checks | ✅ all 3 pass |
| Failure-path check (prebuild error handling) | ✅ (verified in T01) |

## Diagnostics

- **Build page count**: `npm run build` reports total in final output line
- **Sidebar groups**: `grep -c 'group-label' dist/getting-started/index.html` — shows count of collapsible sidebar groups
- **Placeholder removal**: `find dist/ -path "*/placeholder/*" | wc -l` — must be 0
- **Landing CTA**: `grep 'getting-started' dist/index.html | head -1` — confirms hero link

## Deviations

None. All steps executed as planned.

## Known Issues

- The `auto-mode/index.html` contains both sidebar links (`/gsd2-guide/git-strategy/`) and in-content relative links (`../git-strategy/`). Both resolve correctly but the dual format is a cosmetic artifact of T01's relative link rewriting vs Starlight's sidebar absolute paths. Not a functional issue.

## Files Created/Modified

- `astro.config.mjs` — Restructured sidebar: added Guides (15 items) and Architecture (4 items) groups, removed Placeholder and empty Getting Started groups
- `src/content/docs/index.mdx` — Added Getting Started hero CTA, deep-dive LinkCards section
- `src/content/docs/placeholder/` — Deleted (3 files: components.mdx, diagrams.mdx, code-examples.mdx)
