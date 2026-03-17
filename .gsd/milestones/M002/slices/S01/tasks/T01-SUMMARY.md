---
id: T01
parent: S01
milestone: M002
provides:
  - Prebuild exclusion list filtering 109 pi/agent files from content pipeline
  - GSD-focused sidebar structure with User Guide, Commands, Recipes, Reference, Guides sections
  - Placeholder developing-with-gsd page for T02 to replace
key_files:
  - scripts/prebuild.mjs
  - astro.config.mjs
  - src/content/docs/user-guide/developing-with-gsd.mdx
key_decisions:
  - Separated prebuild "excluded" count from "error" count in reporting for clearer diagnostics
  - Created placeholder MDX page for developing-with-gsd so sidebar link resolves (T02 replaces content)
  - Moved Getting Started from Guides to User Guide section, Architecture from its own section into Guides
  - Placed operational recipes (auto-mode, git-strategy, cost-management, etc.) in Recipes section
patterns_established:
  - Prebuild exclusion pattern: EXCLUDED_DIRS Set + EXCLUDED_ROOT_FILES Set checked at top of copy loop
  - Each exclusion logged to stdout for observable filtering
observability_surfaces:
  - prebuild.mjs logs each excluded file to stdout (grep "Excluding" in build output)
  - .generated-manifest.json file_count reflects post-exclusion count (17 vs previous ~126)
  - check-links.mjs catches any broken sidebar or content links as non-zero exit
duration: 20m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Strip pi/agent content and restructure sidebar

**Removed 109 pi/agent files from prebuild pipeline, restructured sidebar from 10 sections to 5 GSD-focused sections, zero broken links.**

## What Happened

Added `EXCLUDED_DIRS` (6 directories) and `EXCLUDED_ROOT_FILES` (3 files) sets to `scripts/prebuild.mjs`. The copy loop checks each source file's top-level directory against `EXCLUDED_DIRS` and root filenames against `EXCLUDED_ROOT_FILES`, logging each exclusion for observability. Also separated the "excluded" counter from the "errors" counter — previously both used `skipped`, making the build output misleading ("109 files skipped due to errors" when they were intentional exclusions).

Restructured `astro.config.mjs` sidebar: removed all 6 pi/agent autogenerate sections (What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI/TUI, Proposals) and the Architecture section. Created 5 new sections: User Guide (Getting Started + placeholder for Developing with GSD), Commands (Commands Reference), Recipes (operational guides like auto-mode, git-strategy, cost-management), Reference (existing quick-reference cards), and Guides (configuration, architecture, skills, visualizer, etc.). Home and Changelog remain at top.

Created a placeholder `src/content/docs/user-guide/developing-with-gsd.mdx` so the sidebar link resolves. T02 will replace this with the full walkthrough content.

## Verification

- `npm run build` exits 0 — 27 pages built in 3.59s
- `node scripts/check-links.mjs` exits 0 — 720 internal links checked, 0 broken
- `find src/content/docs/{what-is-pi,building-coding-agents,context-and-hooks,extending-pi,pi-ui-tui,proposals} -name '*.md' 2>/dev/null | wc -l` returns 0
- `grep -r 'what-is-pi|building-coding-agents|...' src/content/docs/` returns no results (excluding manifest)
- Sidebar in `astro.config.mjs` has no pi/agent entries (0 matches for pi/agent labels)
- Sidebar has User Guide, Commands, Recipes, Reference, Guides sections (7 matches)
- Prebuild stdout shows 109 "Excluding" log lines — filtering is observable

### Slice-level verification (T01 partial)

- ✅ `npm run build` exits 0
- ✅ `node scripts/check-links.mjs` exits 0
- ✅ No pi/agent content grep matches in src/content/docs/
- ✅ Sidebar has no pi/agent entries
- ⏳ `src/content/docs/user-guide/developing-with-gsd.mdx` exists (placeholder — T02 fills content, needs >200 lines)
- ⏳ Built site has walkthrough page at `/user-guide/developing-with-gsd/` (page exists but is placeholder)
- ✅ Prebuild stdout includes exclusion log lines

## Diagnostics

- Run `node scripts/prebuild.mjs 2>&1 | grep "Excluding" | wc -l` to verify exclusion count (should be 109)
- Check `cat src/content/docs/.generated-manifest.json | grep file_count` to verify only 17 files copied
- Run `node scripts/check-links.mjs` to verify no broken links after any content changes

## Deviations

- Created placeholder `developing-with-gsd.mdx` page — not in original task plan but required because the sidebar link creates 24 broken links across all pages if the target doesn't exist. T02 replaces the placeholder content.
- Fixed prebuild reporting: separated `excluded` counter from `errors` counter. Original script conflated intentional exclusions with processing errors in the "skipped" count.

## Known Issues

None.

## Files Created/Modified

- `scripts/prebuild.mjs` — Added EXCLUDED_DIRS/EXCLUDED_ROOT_FILES sets, exclusion logic in copy loop, fixed skipped/excluded reporting
- `astro.config.mjs` — Restructured sidebar from 10 sections to 5 GSD-focused sections
- `src/content/docs/user-guide/developing-with-gsd.mdx` — Placeholder page for T02 walkthrough (resolves sidebar link)
- `.gsd/milestones/M002/slices/S01/S01-PLAN.md` — Added Observability / Diagnostics section
- `.gsd/milestones/M002/slices/S01/tasks/T01-PLAN.md` — Added Observability Impact section
