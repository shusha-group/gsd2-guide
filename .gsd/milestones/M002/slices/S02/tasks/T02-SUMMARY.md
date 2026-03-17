---
id: T02
parent: S02
milestone: M002
provides:
  - /gsd deep-dive page (step mode entry point)
  - /gsd next deep-dive page (explicit step mode with --dry-run)
  - /gsd quick deep-dive page (lightweight task without milestone ceremony)
  - /gsd discuss deep-dive page (mid-milestone slice discussion)
  - /gsd status deep-dive page (TUI progress dashboard)
  - /gsd visualize deep-dive page (7-tab TUI visualizer)
key_files:
  - src/content/docs/commands/gsd.mdx
  - src/content/docs/commands/next.mdx
  - src/content/docs/commands/quick.mdx
  - src/content/docs/commands/discuss.mdx
  - src/content/docs/commands/status.mdx
  - src/content/docs/commands/visualize.mdx
key_decisions:
  - "/gsd and /gsd next pages share mechanics (both call startAuto with step:true) — gsd.mdx is the primary explanation, next.mdx references it and focuses on --dry-run as its differentiator"
  - "Mermaid subgraph used for visualize.mdx tab layout — subgraph Tabs[] with 7 child nodes shows the tab structure without needing a separate diagram per tab"
patterns_established:
  - "Error/unreachable nodes (NoOp, Fail) use fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8 — consistent with stop.mdx pattern from T01"
  - "Read-only commands (status, visualize) use a data-flow diagram pattern rather than a decision-tree pattern — shows data sources flowing into the rendering layer"
observability_surfaces:
  - "Build page count: 36 (up from 30 pre-S02). Count below 36 signals missing pages."
  - "Sidebar entry count: grep \"'/commands/\" astro.config.mjs | wc -l → 10"
  - "Mermaid coverage: grep -l 'mermaid' src/content/docs/commands/*.mdx | wc -l → 9"
  - "Link checker: node scripts/check-links.mjs validates all cross-links"
duration: 8 minutes
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Author /gsd, /gsd next, /gsd quick, /gsd discuss, /gsd status, /gsd visualize deep-dive pages

**Created 6 command deep-dive MDX pages covering step mode, quick tasks, slice discussion, progress dashboard, and workflow visualizer — completing all 9 command pages for S02.**

## What Happened

Authored 6 MDX files following the template established by T01 (auto.mdx). Each page follows the consistent structure: frontmatter → What It Does → Usage → How It Works (Mermaid + prose) → What Files It Touches → Examples → Related Commands.

Content approach by complexity tier:
- **Shared mechanics** (`gsd.mdx`, `next.mdx`): Both call `startAuto()` with `step: true`. gsd.mdx carries the full explanation (smart entry wizard, step wizard, unit types). next.mdx references gsd.mdx and focuses on its distinguishing feature: `--dry-run`.
- **Self-contained flow** (`quick.mdx`): Linear flow from description to execution. Mermaid shows the full setup→execute→commit pipeline with error node for missing `.gsd/`.
- **Interactive flow** (`discuss.mdx`): Slice picker → guided discussion → CONTEXT.md output. Explains integration with auto mode's `needs-discussion` phase.
- **Read-only displays** (`status.mdx`, `visualize.mdx`): Data-flow diagrams showing sources → derivation → rendering. Visualize uses a Mermaid subgraph to represent the 7-tab layout.

All pages use Cookmate as the example project. Internal links use `../sibling/` format. Mermaid diagrams follow the dark terminal theme from T01.

Added 6 sidebar entries to astro.config.mjs under the Commands section.

## Verification

- `npm run build` → exits 0, 36 pages built
- `node scripts/check-links.mjs` → 1278 internal links, 0 broken
- `ls src/content/docs/commands/*.mdx | wc -l` → 9
- `grep -l 'mermaid' src/content/docs/commands/*.mdx | wc -l` → 9
- `ls dist/commands/*/index.html | wc -l` → 9
- `grep "'/commands/" astro.config.mjs | wc -l` → 10

All slice-level verification checks pass.

## Diagnostics

- Build page count should be 36. Lower count means a page failed to render.
- `node scripts/check-links.mjs` catches broken cross-links between command pages.
- Missing frontmatter `title` field causes Astro build failure with file path in error message.
- Individual page verification: `test -f dist/commands/<name>/index.html` for any of: gsd, next, quick, discuss, status, visualize.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/commands/gsd.mdx` — deep-dive for bare `/gsd` (step mode entry point)
- `src/content/docs/commands/next.mdx` — deep-dive for `/gsd next` (explicit step mode + --dry-run)
- `src/content/docs/commands/quick.mdx` — deep-dive for `/gsd quick` (lightweight task path)
- `src/content/docs/commands/discuss.mdx` — deep-dive for `/gsd discuss` (slice discussion)
- `src/content/docs/commands/status.mdx` — deep-dive for `/gsd status` (TUI dashboard)
- `src/content/docs/commands/visualize.mdx` — deep-dive for `/gsd visualize` (7-tab visualizer)
- `astro.config.mjs` — 6 new sidebar entries under Commands (10 total)
- `.gsd/milestones/M002/slices/S02/tasks/T02-PLAN.md` — added Observability Impact section
