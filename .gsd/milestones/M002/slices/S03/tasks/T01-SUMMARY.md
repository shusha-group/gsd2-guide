---
id: T01
parent: S03
milestone: M002
provides:
  - 6 command deep-dive pages (queue, steer, capture, triage, knowledge, cleanup)
  - 6 sidebar entries in astro.config.mjs
  - 6 deep-dive links in commands landing page
key_files:
  - src/content/docs/commands/queue.mdx
  - src/content/docs/commands/steer.mdx
  - src/content/docs/commands/capture.mdx
  - src/content/docs/commands/triage.mdx
  - src/content/docs/commands/knowledge.mdx
  - src/content/docs/commands/cleanup.mdx
key_decisions:
  - Mermaid diagrams for queue, steer, and triage; prose+tables for capture, knowledge, and cleanup — matches complexity levels
patterns_established:
  - S03 pages follow identical structure to S02 template (frontmatter, What It Does, Usage, How It Works, What Files It Touches, Examples, Related Commands)
observability_surfaces:
  - "ls src/content/docs/commands/*.mdx | wc -l → 15 confirms page count"
  - "grep \"'/commands/\" astro.config.mjs | wc -l → 16 confirms sidebar entries"
  - "node scripts/check-links.mjs validates all cross-links including 6 new pages"
duration: 20m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Author planning and queue command deep-dives

**Created 6 command deep-dive pages for the "during execution" planning commands with Mermaid diagrams for queue, steer, and triage.**

## What Happened

Read source handlers in `guided-flow.ts`, `commands.ts`, and `captures.ts` to understand internals for all 6 commands. Created MDX pages following the established S02 template exactly:

- **queue.mdx** — Queue management hub with Mermaid diagram showing the reorder/add flow paths, dependency cleanup, and QUEUE-ORDER.json persistence
- **steer.mdx** — Hard-steer override flow with Mermaid diagram showing the active vs inactive auto-mode paths and document rewrite trigger
- **capture.mdx** — Fire-and-forget capture with worktree awareness, entry format, and classification table (prose + tables, no Mermaid)
- **triage.mdx** — LLM triage pipeline with Mermaid diagram showing context building, prompt dispatch, and classification. Documented the response parser's graceful handling of messy LLM output
- **knowledge.mdx** — Rule/pattern/lesson entry flow with scope derivation (prose + tables)
- **cleanup.mdx** — Two sub-commands (branches + snapshots) with merge detection and ref pruning logic (prose + tables)

Added 6 sidebar entries after the existing S02 entries. Converted 6 plain-text commands in `content/generated/docs/commands.md` to linked deep-dive references.

## Verification

- `npm run build` → 42 pages built, 0 errors ✓
- `node scripts/check-links.mjs` → 1740 internal links checked, 0 broken ✓
- `ls src/content/docs/commands/*.mdx | wc -l` → 15 ✓
- `grep "'/commands/" astro.config.mjs | wc -l` → 16 ✓
- All 6 new pages present in `dist/commands/*/index.html` ✓
- Pagefind indexed 42 pages ✓

### Slice-level checks (partial — T01 is 1 of 3 tasks):
- Build succeeds: ✓ (42 pages, target ~54 at slice end)
- Link check passes: ✓
- MDX count: 15/27
- Sidebar count: 16/28

## Diagnostics

- Check page presence: `ls dist/commands/{queue,steer,capture,triage,knowledge,cleanup}/index.html`
- Verify cross-links: `node scripts/check-links.mjs`
- Count sidebar entries: `grep "'/commands/" astro.config.mjs | wc -l`
- Inspect landing page links: `grep -c '\](queue/\|steer/\|capture/\|triage/\|knowledge/\|cleanup/)' content/generated/docs/commands.md`

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/commands/queue.mdx` — Queue hub deep-dive with reorder/add Mermaid diagram
- `src/content/docs/commands/steer.mdx` — Hard-steer deep-dive with active/inactive path Mermaid diagram
- `src/content/docs/commands/capture.mdx` — Capture deep-dive (prose + tables)
- `src/content/docs/commands/triage.mdx` — Triage pipeline deep-dive with Mermaid diagram
- `src/content/docs/commands/knowledge.mdx` — Knowledge entry deep-dive (prose + tables)
- `src/content/docs/commands/cleanup.mdx` — Cleanup sub-commands deep-dive (prose + tables)
- `astro.config.mjs` — 6 new sidebar entries added under Commands section
- `content/generated/docs/commands.md` — 6 commands converted from plain text to deep-dive links
- `.gsd/milestones/M002/slices/S03/S03-PLAN.md` — Added Observability / Diagnostics section
- `.gsd/milestones/M002/slices/S03/tasks/T01-PLAN.md` — Added Observability Impact section
