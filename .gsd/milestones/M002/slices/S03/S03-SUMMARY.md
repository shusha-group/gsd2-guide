---
id: S03
parent: M002
milestone: M002
provides:
  - 18 command deep-dive/reference MDX pages completing full command coverage (27 total)
  - 28 sidebar entries in astro.config.mjs Commands section
  - Fully linked commands landing page — all GSD commands with deep-dive pages linked
  - Mermaid diagrams for 11 complex commands (queue, steer, triage, doctor, forensics, prefs, skill-health, config, run-hook, migrate, headless)
  - 3 special topic reference pages (keyboard-shortcuts, cli-flags, headless)
requires:
  - slice: S01
    provides: Sidebar structure, content authoring pattern, MDX conventions
  - slice: S02
    provides: Per-command page template (frontmatter → What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands), 9 existing command pages, sidebar pattern
affects:
  - S04
key_files:
  - src/content/docs/commands/queue.mdx
  - src/content/docs/commands/steer.mdx
  - src/content/docs/commands/capture.mdx
  - src/content/docs/commands/triage.mdx
  - src/content/docs/commands/knowledge.mdx
  - src/content/docs/commands/cleanup.mdx
  - src/content/docs/commands/doctor.mdx
  - src/content/docs/commands/forensics.mdx
  - src/content/docs/commands/prefs.mdx
  - src/content/docs/commands/mode.mdx
  - src/content/docs/commands/skill-health.mdx
  - src/content/docs/commands/config.mdx
  - src/content/docs/commands/hooks.mdx
  - src/content/docs/commands/run-hook.mdx
  - src/content/docs/commands/migrate.mdx
  - src/content/docs/commands/keyboard-shortcuts.mdx
  - src/content/docs/commands/cli-flags.mdx
  - src/content/docs/commands/headless.mdx
  - astro.config.mjs
  - content/generated/docs/commands.md
key_decisions:
  - Mermaid diagrams for commands with non-trivial logic (11 of 18 pages); prose + tables for simple commands where Mermaid adds no value
  - Doctor page is the richest — three-mode Mermaid diagram (doctor/fix/heal) plus 27 issue codes grouped by scope
  - Complex diagnostic commands (doctor, forensics) need both a pipeline diagram AND a reference table for types/codes
  - Data-flow pattern (sources → derivation → rendering) works well for read-only dashboard commands like skill-health
  - Mode uses comparison table instead of Mermaid — solo vs team settings are better as a table
  - Special topic pages (keyboard-shortcuts, cli-flags, headless) use reference-table structure instead of standard command template
  - skill-health subcommand variants linked to the main skill-health deep-dive page rather than creating separate pages
patterns_established:
  - S02 template (frontmatter, What It Does, Usage, How It Works, What Files It Touches, Examples, Related Commands) applies consistently across all command types
  - Reference pages omit sections that don't apply (e.g. keyboard-shortcuts has no "What Files It Touches") — replaced with flag tables and examples
  - Landing page section headings can be linked directly to their deep-dive counterparts
observability_surfaces:
  - "npm run build reports 54 pages with 0 errors"
  - "node scripts/check-links.mjs → 2880 links checked, 0 broken"
  - "ls src/content/docs/commands/*.mdx | wc -l → 27"
  - "grep \"'/commands/\" astro.config.mjs | wc -l → 28"
  - "ls dist/commands/*/index.html | wc -l → 27"
drill_down_paths:
  - .gsd/milestones/M002/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M002/slices/S03/tasks/T03-SUMMARY.md
duration: 53m
verification_result: passed
completed_at: 2026-03-17
---

# S03: Command deep-dives — planning, maintenance, and utility commands

**18 new command deep-dive and reference pages completing full GSD command coverage — 27 command pages total with Mermaid diagrams, files-touched tables, terminal examples, and cross-links, all wired into the sidebar and commands landing page.**

## What Happened

Three tasks executed in sequence, each adding 6 pages and wiring them into the sidebar and landing page.

**T01 — Planning and queue commands** (queue, steer, capture, triage, knowledge, cleanup). These are the "during execution" commands that modify `.gsd/` state. Mermaid diagrams for queue (reorder/add flow), steer (active/inactive auto-mode paths), and triage (LLM classification pipeline). Capture, knowledge, and cleanup used prose + tables matching their simpler mechanics. 42 pages built after T01.

**T02 — Diagnostics and config commands** (doctor, forensics, prefs, mode, skill-health, config). The most complex commands in GSD. Doctor got the richest page — three-mode Mermaid diagram showing doctor→report, fix→auto-repair, and heal→LLM dispatch paths, plus a 27-issue-code reference table grouped by scope. Forensics shows a 5-source anomaly detection pipeline feeding 7 detectors. Prefs documents the subcommand routing with category wizard. Skill-health uses a data-flow pattern (telemetry + activity + prefs → report). Config shows the interactive setup loop. Mode is a comparison table — solo vs team settings. T02 also fixed 5 missing T01 landing page links. 48 pages after T02.

**T03 — Utility commands and special topics** (hooks, run-hook, migrate, keyboard-shortcuts, cli-flags, headless). Hooks is read-only display (prose). Run-hook has a 3-stage validation dispatch diagram. Migrate documents the 5-stage pipeline (validate → parse → transform → preview → write) with directory mapping table. Special topic pages use reference-table format: keyboard-shortcuts covers terminal compatibility (Kitty protocol), cli-flags lists all flags with examples, headless documents the RPC lifecycle with spawn→event loop→exit codes Mermaid diagram. 54 pages after T03.

## Verification

All slice-level acceptance criteria pass:

- `ls src/content/docs/commands/*.mdx | wc -l` → **27** ✅
- `grep "'/commands/" astro.config.mjs | wc -l` → **28** ✅
- `npm run build` → **54 pages built, 0 errors** ✅
- `node scripts/check-links.mjs` → **2880 internal links checked, 0 broken** ✅
- `ls dist/commands/*/index.html | wc -l` → **27** ✅
- Pagefind indexes **54 pages** ✅
- Commands landing page: all GSD commands with deep-dive pages linked ✅

Remaining unlinked commands in landing page: `/gsd help` (inline help text, no deep-dive needed), `/gsd parallel *` (covered by dedicated parallel-orchestration page). These are intentional and appropriate.

## Requirements Advanced

- R031 — S03 adds Mermaid diagrams for 11 more commands using the established dark terminal theme. S04 (recipes) will complete coverage.

## Requirements Validated

- R027 — All ~25 GSD commands now have deep-dive pages. 27 MDX pages in src/content/docs/commands/ with authored explanations, Mermaid flow diagrams, files-touched tables, and terminal examples. 54 pages built, 2880 links verified.
- R030 — Every command page shows the full lifecycle: triggers, files read/written, internal mechanics (with Mermaid diagrams for complex commands), and annotated terminal examples. Coverage complete across all 27 pages.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- T02 fixed 5 missing T01 landing page links (steer, queue, capture, cleanup, knowledge) that T01's summary claimed were converted but weren't actually linked in `content/generated/docs/commands.md`.
- T03 linked skill-health subcommand variants to the main skill-health page and linked the Headless Mode section heading — minor scope additions not in the original plan.

## Known Limitations

- `/gsd help` and `/gsd parallel *` remain unlinked in the commands landing page. These are intentional — help is simple inline text and parallel commands are covered by the parallel-orchestration page.
- Command deep-dives are authored from source study, not auto-generated. If command internals change significantly in future GSD versions, pages need manual updates.

## Follow-ups

- none

## Files Created/Modified

- `src/content/docs/commands/queue.mdx` — Queue management deep-dive with reorder/add Mermaid diagram
- `src/content/docs/commands/steer.mdx` — Hard-steer override deep-dive with active/inactive path diagram
- `src/content/docs/commands/capture.mdx` — Capture deep-dive (prose + tables)
- `src/content/docs/commands/triage.mdx` — Triage pipeline deep-dive with LLM classification diagram
- `src/content/docs/commands/knowledge.mdx` — Knowledge entry deep-dive (prose + tables)
- `src/content/docs/commands/cleanup.mdx` — Cleanup sub-commands deep-dive (prose + tables)
- `src/content/docs/commands/doctor.mdx` — Doctor deep-dive with three-mode Mermaid diagram and 27 issue codes
- `src/content/docs/commands/forensics.mdx` — Forensics deep-dive with anomaly detection pipeline diagram
- `src/content/docs/commands/prefs.mdx` — Preferences deep-dive with subcommand routing and category wizard
- `src/content/docs/commands/mode.mdx` — Mode deep-dive with solo/team comparison table
- `src/content/docs/commands/skill-health.mdx` — Skill-health deep-dive with data-flow diagram
- `src/content/docs/commands/config.mdx` — Config deep-dive with interactive setup flow diagram
- `src/content/docs/commands/hooks.mdx` — Hooks display deep-dive (prose + tables)
- `src/content/docs/commands/run-hook.mdx` — Run-hook deep-dive with dispatch flow diagram
- `src/content/docs/commands/migrate.mdx` — Migrate deep-dive with 5-stage pipeline diagram
- `src/content/docs/commands/keyboard-shortcuts.mdx` — Reference page with shortcut table and terminal compatibility
- `src/content/docs/commands/cli-flags.mdx` — Reference page with flag and subcommand tables
- `src/content/docs/commands/headless.mdx` — Reference page with RPC lifecycle diagram and exit codes
- `astro.config.mjs` — 18 sidebar entries added (28 total in Commands section)
- `content/generated/docs/commands.md` — All commands converted to deep-dive links

## Forward Intelligence

### What the next slice should know
- All 27 command deep-dive pages are in `src/content/docs/commands/`. The Commands section of the sidebar in `astro.config.mjs` has 28 entries (27 pages + 1 Commands Reference link). The established page template works — S04 recipes can link to any command page using `../commands/<name>/` format.
- The Cookmate example project is used consistently — S04 recipes should continue using it for consistency with the walkthrough and command examples.

### What's fragile
- `content/generated/docs/commands.md` is a generated file managed by prebuild — edits to the source in `content/generated/docs/` persist, but if you edit `src/content/docs/commands.md` directly your changes will be overwritten on next build.
- Mermaid diagrams use specific dark terminal styling (fill:#1a3a1a, stroke:#39ff14, etc.) — new diagrams should copy the style block from an existing page rather than guessing.

### Authoritative diagnostics
- `npm run build` page count (54) — confirms all pages render without errors
- `node scripts/check-links.mjs` — validates all 2880 internal cross-links including new command pages
- `grep "'/commands/" astro.config.mjs | wc -l` → 28 — confirms all sidebar entries present

### What assumptions changed
- Original plan estimated ~16 remaining commands. Actual count was 15 slash commands + 3 special topic pages = 18 pages total. The special topic pages (keyboard-shortcuts, cli-flags, headless) needed a different structure than the standard command template — reference tables instead of lifecycle documentation.
