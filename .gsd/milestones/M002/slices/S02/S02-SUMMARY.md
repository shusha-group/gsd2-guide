---
id: S02
parent: M002
milestone: M002
provides:
  - 9 command deep-dive MDX pages covering session and execution commands
  - Established per-command page template (What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands)
  - Mermaid flow diagrams for all 9 commands with dark terminal theme
  - Commands landing page links to all 9 deep-dive pages
  - Sidebar entries for all 9 command pages under Commands section
requires:
  - slice: S01
    provides: Sidebar structure with Commands section, content authoring pattern (MDX with Mermaid), prebuild pipeline with exclusion list, Cookmate example project convention
affects:
  - S03
key_files:
  - src/content/docs/commands/auto.mdx
  - src/content/docs/commands/stop.mdx
  - src/content/docs/commands/pause.mdx
  - src/content/docs/commands/gsd.mdx
  - src/content/docs/commands/next.mdx
  - src/content/docs/commands/quick.mdx
  - src/content/docs/commands/discuss.mdx
  - src/content/docs/commands/status.mdx
  - src/content/docs/commands/visualize.mdx
  - astro.config.mjs
  - content/generated/docs/commands.md
key_decisions:
  - "Error/unreachable Mermaid nodes use fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8 (red theme) for contrast against the green action nodes"
  - "Read-only commands (status, visualize) use data-flow diagram pattern showing sources → derivation → rendering, rather than decision-tree pattern"
  - "/gsd and /gsd next share mechanics (both call startAuto with step:true) — gsd.mdx carries full explanation, next.mdx references it and focuses on --dry-run"
  - "/gsd pause added as new row in commands landing page table — was only represented as Escape shortcut previously"
patterns_established:
  - "Command deep-dive page structure: frontmatter → What It Does → Usage → How It Works (Mermaid + prose subsections) → What Files It Touches (table) → Examples (annotated terminal output) → Related Commands (cross-links)"
  - "Terminal example style: bullet points with ● prefix, checkmarks with ✓, indented sub-items, box-drawn summary tables"
  - "Decision nodes: fill:#0d180d; action nodes: fill:#1a3a1a; error nodes: fill:#3a1a1a,stroke:#ff4444"
  - "Internal cross-links between command pages use ../sibling/ format"
  - "Source of truth for generated pages is content/generated/docs/, not src/content/docs/"
observability_surfaces:
  - "Build page count: npm run build → 36 pages (up from 27 pre-S02)"
  - "Link checker: node scripts/check-links.mjs → 1278 links, 0 broken"
  - "Mermaid coverage: grep -l 'mermaid' src/content/docs/commands/*.mdx | wc -l → 9"
  - "Sidebar entry count: grep \"'/commands/\" astro.config.mjs | wc -l → 10"
  - "HTML page count: ls dist/commands/*/index.html | wc -l → 9"
  - "Pagefind indexes 36 HTML files"
drill_down_paths:
  - .gsd/milestones/M002/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M002/slices/S02/tasks/T03-SUMMARY.md
duration: 30m
verification_result: passed
completed_at: 2026-03-17
---

# S02: Command deep-dives — session and execution commands

**9 command deep-dive pages authored for all session and execution commands, each with Mermaid flow diagrams, files-touched tables, and annotated terminal examples following a consistent template.**

## What Happened

Built the `src/content/docs/commands/` directory with 9 MDX deep-dive pages covering the complete set of session and execution commands. Work proceeded in three tasks:

**T01** established the template with the three auto-mode lifecycle commands. `auto.mdx` (~200 lines) got the fullest treatment — initialization sequence, dispatch loop, stuck detection, crash recovery — with a 17-node Mermaid flowchart. `stop.mdx` and `pause.mdx` covered teardown and state preservation respectively, introducing the red-themed error node pattern for unreachable/no-op states.

**T02** applied the template to the remaining 6 commands. `/gsd` and `/gsd next` share the same `startAuto(step:true)` mechanics — `gsd.mdx` carries the full explanation while `next.mdx` references it and focuses on `--dry-run`. `/gsd quick` documents the lightweight no-milestone path. `/gsd discuss` covers the slice discussion picker. `/gsd status` and `/gsd visualize` use a data-flow diagram pattern (sources → derivation → rendering) rather than decision trees, since they're read-only display commands.

**T03** updated the commands landing page (`content/generated/docs/commands.md`) to link all 9 commands to their deep-dive pages, and added `/gsd pause` as a new table row (it had only been represented as the Escape keyboard shortcut). Discovered and applied the generated-page source-of-truth pattern — edits go to `content/generated/docs/`, not `src/content/docs/`.

All 9 pages use Cookmate as the example project, consistent with the S01 walkthrough. All sidebar entries added to `astro.config.mjs` under the Commands section.

## Verification

All slice-level checks pass:

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| MDX files in commands/ | 9 | 9 | ✅ |
| Mermaid blocks in all files | 9 | 9 | ✅ |
| Sidebar entries | 10 | 10 | ✅ |
| HTML pages in dist/commands/ | 9 | 9 | ✅ |
| Build page count | 36 | 36 | ✅ |
| Link check | 0 broken | 0 broken (1278 checked) | ✅ |
| Pagefind indexing | 36 | 36 | ✅ |
| Deep-dive links in commands.md | 9 | 9 | ✅ |

## Requirements Advanced

- R027 — 9 of ~25 command deep-dive pages delivered. Session/execution commands complete; planning/maintenance/utility commands remain for S03.
- R030 — 9 commands now have lifecycle documentation showing triggers, file reads/writes, internal mechanics with diagrams, and annotated examples.
- R031 — Visual documentation pattern applied to 9 command pages. Each has at least one Mermaid flowchart with the dark terminal theme. Builds on the 2 diagrams established in S01.

## Requirements Validated

- None moved to validated — R027, R030, R031 all require S03 (and S04 for R031) to complete coverage.

## New Requirements Surfaced

- None

## Requirements Invalidated or Re-scoped

- None

## Deviations

- T03 edited `content/generated/docs/commands.md` instead of `src/content/docs/commands.md` — the latter is overwritten by the prebuild script. The plan specified the wrong target. This is a known pattern documented in KNOWLEDGE.md.
- T03 added `/gsd pause` as a new table row in the commands reference — the original table only had it as an Escape keyboard shortcut. This was a gap in the reference page, not a plan deviation.

## Known Limitations

- Only session/execution commands are covered. The remaining ~16 planning, maintenance, and utility commands have no deep-dive pages yet (S03 scope).
- Command pages document mechanics based on source study — if GSD internals change significantly, these pages need manual updates (no automated content extraction for authored MDX).

## Follow-ups

- None — S03 picks up the remaining commands directly.

## Files Created/Modified

- `src/content/docs/commands/auto.mdx` — /gsd auto deep-dive (template-setting, ~200 lines)
- `src/content/docs/commands/stop.mdx` — /gsd stop deep-dive
- `src/content/docs/commands/pause.mdx` — /gsd pause deep-dive
- `src/content/docs/commands/gsd.mdx` — bare /gsd deep-dive (step mode entry)
- `src/content/docs/commands/next.mdx` — /gsd next deep-dive (--dry-run focus)
- `src/content/docs/commands/quick.mdx` — /gsd quick deep-dive
- `src/content/docs/commands/discuss.mdx` — /gsd discuss deep-dive
- `src/content/docs/commands/status.mdx` — /gsd status deep-dive
- `src/content/docs/commands/visualize.mdx` — /gsd visualize deep-dive
- `astro.config.mjs` — 9 new sidebar entries under Commands section (10 total)
- `content/generated/docs/commands.md` — deep-dive links for 9 commands, added /gsd pause row

## Forward Intelligence

### What the next slice should know
- The per-command page template is locked: frontmatter → What It Does → Usage → How It Works (Mermaid + subsections) → What Files It Touches (table) → Examples → Related Commands. Follow this structure exactly for S03 pages.
- Mermaid node styling: decision nodes `fill:#0d180d`, action nodes `fill:#1a3a1a`, error/unreachable nodes `fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8`. All nodes use `stroke:#39ff14,color:#e8f4e8` except error nodes.
- Read-only/display commands use a data-flow diagram pattern (sources → rendering). Interactive/stateful commands use decision-tree flowcharts.
- The commands landing page source is `content/generated/docs/commands.md`, NOT `src/content/docs/commands.md`. The prebuild overwrites the latter.

### What's fragile
- `content/generated/docs/commands.md` is the source of truth but lives in a non-obvious location. If someone edits `src/content/docs/commands.md` directly, changes will be silently lost on next build.
- Sidebar entry order in `astro.config.mjs` is manual — adding S03 entries requires inserting them in the right position within the Commands group.

### Authoritative diagnostics
- `npm run build` page count (expect 36 + N for S03 pages) — a count mismatch means pages failed to render
- `node scripts/check-links.mjs` — catches broken cross-links between command pages immediately
- `grep -l 'mermaid' src/content/docs/commands/*.mdx | wc -l` — quick mermaid coverage check

### What assumptions changed
- Plan assumed `src/content/docs/commands.md` was directly editable — actually it's generated from `content/generated/docs/commands.md`. This is documented in KNOWLEDGE.md but easy to forget.
- Plan expected 27→36 page increase — this held exactly.
