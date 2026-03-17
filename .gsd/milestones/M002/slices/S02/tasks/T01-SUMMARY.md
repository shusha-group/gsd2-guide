---
id: T01
parent: S02
milestone: M002
provides:
  - /gsd auto deep-dive page (template-setting page for all command pages)
  - /gsd stop deep-dive page
  - /gsd pause deep-dive page
  - 3 sidebar entries under Commands section
key_files:
  - src/content/docs/commands/auto.mdx
  - src/content/docs/commands/stop.mdx
  - src/content/docs/commands/pause.mdx
  - astro.config.mjs
key_decisions:
  - Decision nodes in Mermaid use fill:#0d180d, action nodes use fill:#1a3a1a — consistent with walkthrough page
  - Error/unreachable nodes use fill:#3a1a1a,stroke:#ff4444 (red theme) for contrast — introduced in stop.mdx "NoOp" node
patterns_established:
  - Command deep-dive page structure: frontmatter → What It Does → Usage → How It Works (Mermaid + prose subsections) → What Files It Touches (table) → Examples (terminal blocks) → Related Commands (links)
  - Terminal example style: bullet points with ● prefix, checkmarks with ✓, indented sub-items, box-drawn summary tables
  - Internal cross-links between command pages use ../sibling/ format
observability_surfaces:
  - Build page count: npm run build reports page count (expect 30 after T01, 36 after all slice tasks)
  - Link checker: node scripts/check-links.mjs validates all sidebar and cross-page links
  - Mermaid presence: grep -l 'mermaid' src/content/docs/commands/*.mdx
duration: 12m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Author /gsd auto, /gsd stop, /gsd pause deep-dive pages

**Created 3 command deep-dive MDX pages covering the auto-mode lifecycle, establishing the content template for all subsequent command pages.**

## What Happened

Created `src/content/docs/commands/` directory and authored 3 MDX files:

- **auto.mdx** (~200 lines) — Full treatment: initialization sequence (stale check → resume → git → crash recovery → derive state → smart entry → worktree → metrics), dispatch loop (dispatch → execute → commit → doctor → sync → next), stuck detection, files-touched tables, Cookmate terminal examples for fresh start and resume-after-pause. Mermaid flowchart covers the complete lifecycle with 17 styled nodes.
- **stop.mdx** (~110 lines) — Teardown sequence, local vs remote stop paths, cost summary display. Mermaid diagram with 12 nodes including a red "NoOp" node for the nothing-to-stop case.
- **pause.mdx** (~110 lines) — Pause sequence, state preservation, resume path, "what you can do while paused" section. Mermaid diagram split into pause flow (5 nodes) and resume flow (4 nodes).

Added 3 sidebar entries to `astro.config.mjs` under the Commands section, after the existing "Commands Reference" entry.

Applied pre-flight observability fixes to S02-PLAN.md (added Observability/Diagnostics section and diagnostic verification step) and T01-PLAN.md (added Observability Impact section).

## Verification

- `npm run build` exits 0 — 30 pages built (up from 27)
- `ls dist/commands/auto/index.html dist/commands/stop/index.html dist/commands/pause/index.html` — all 3 exist
- `grep -l 'mermaid' src/content/docs/commands/*.mdx | wc -l` → 3
- `grep "'/commands/auto/'" astro.config.mjs` → match found
- `node scripts/check-links.mjs` → 888 internal links, 0 broken

### Slice-level verification (partial — T01 of 3 tasks)

| Check | Expected (final) | Current | Status |
|-------|-------------------|---------|--------|
| MDX files in commands/ | 9 | 3 | Partial ✓ |
| Mermaid in all files | 9 | 3 | Partial ✓ |
| Sidebar entries | 10 | 4 | Partial ✓ |
| HTML pages in dist/commands/ | 9+ | 3 | Partial ✓ |
| Build page count | 36 | 30 | Partial ✓ |
| Link check | 0 broken | 0 broken | ✓ |

## Diagnostics

- Build failure on missing frontmatter: Astro reports the file path in the error message
- Broken cross-links: `node scripts/check-links.mjs` catches missing link targets
- Sidebar audit: `grep "'/commands/" astro.config.mjs | wc -l` should return 4 after T01

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/commands/auto.mdx` — New: /gsd auto deep-dive page (template-setting)
- `src/content/docs/commands/stop.mdx` — New: /gsd stop deep-dive page
- `src/content/docs/commands/pause.mdx` — New: /gsd pause deep-dive page
- `astro.config.mjs` — Added 3 sidebar entries under Commands section
- `.gsd/milestones/M002/slices/S02/S02-PLAN.md` — Added Observability/Diagnostics section, diagnostic verification step
- `.gsd/milestones/M002/slices/S02/tasks/T01-PLAN.md` — Added Observability Impact section
