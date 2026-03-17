---
id: T01
parent: S04
milestone: M001
provides:
  - Link rewriting from .md format to Starlight /page/ routes in prebuild pipeline
  - README.md → index.md renaming with sidebar order frontmatter
  - Root README skip logic to preserve hand-authored index.mdx
key_files:
  - scripts/prebuild.mjs
key_decisions:
  - All links rewritten with ../ prefix (Starlight renders each page as /page/index.html so sibling navigation always goes up one level)
  - README.md targets become directory paths (./subdir/README.md → ../subdir/) rather than ../subdir/index/ since Starlight resolves directory URLs to index pages
patterns_established:
  - Fenced code block tracking via line-by-line processing with ``` toggle state to skip link rewriting in code blocks
  - isSubdirReadme flag passed through processMarkdown to conditionally inject sidebar ordering frontmatter
observability_surfaces:
  - Console output logs skipped root README, file count (125), and per-file errors to stderr
  - Manifest at src/content/docs/.generated-manifest.json lists all 125 generated files
  - Residual check: grep -r '\.md)' src/content/docs/ --include="*.md" | grep -v native/README | grep -v https — should return only prose mentions, not link syntax
duration: 15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Enhanced prebuild with link rewriting and README→index renaming

**Added `rewriteLinks()` function, README→index renaming, and root README skip to `scripts/prebuild.mjs` — 125 files processed with all internal `.md` links rewritten to Starlight `/page/` format.**

## What Happened

Enhanced `scripts/prebuild.mjs` with three new capabilities:

1. **`rewriteLinks()` function** — processes content line-by-line, tracking fenced code block state. Uses a single regex to match `](path.md)` and `](path.md#fragment)` patterns while excluding external URLs (http/https) and hash-only fragments. Rewrites `./file.md` → `../file/`, preserves hash fragments with trailing slash before hash (`../file/#section`), and converts README.md targets to directory paths (`./subdir/README.md` → `../subdir/`). Leaves the dead `../native/README.md` link untouched.

2. **README→index renaming** — subdirectory `README.md` files (5 total: building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, what-is-pi) are written as `index.md` with `sidebar: { order: 0 }` frontmatter so they sort first in their section.

3. **Root README skip** — `content/generated/docs/README.md` (GitHub repo index page) is skipped entirely to avoid overwriting the hand-authored `index.mdx` splash page. Logged to console.

## Verification

All task-level checks passed:

- `node scripts/prebuild.mjs` exits 0, logs "125 files processed" ✅
- `src/content/docs/building-coding-agents/index.md` exists with `sidebar: { order: 0 }` ✅
- `src/content/docs/getting-started.md` contains `](../auto-mode/)` not `](./auto-mode.md)` ✅
- `src/content/docs/configuration.md` contains `](../token-optimization/#complexity-based-task-routing)` ✅
- `src/content/docs/README.md` does not exist (root README skipped) ✅
- `src/content/docs/what-is-pi/09-the-customization-stack.md` external link `(https://agentskills.io)` untouched ✅
- `src/content/docs/cost-management.md` contains `](../token-optimization/#budget-pressure)` — trailing slash before hash ✅
- `src/content/docs/building-coding-agents/index.md` contains `](../01-work-decomposition/)` ✅
- Zero `](*.md)` link patterns remain in generated docs (only prose `.md` mentions in body text) ✅
- 5 index.md files created (one per subdirectory), 0 README.md files remain ✅

Slice-level checks (partial — T02 not done yet):
- `building-coding-agents/index.md` exists ✅
- `npm run build` — deferred to T02 (sidebar config not yet updated)
- No `/readme/` pages — deferred to T02 (requires build)
- Sidebar entries — deferred to T02 (requires sidebar reorganization)

## Diagnostics

- Run `node scripts/prebuild.mjs` — logs file count, skipped files, errors
- Inspect `src/content/docs/.generated-manifest.json` for list of all generated files
- Check for link rewriting residuals: `grep -rn '\]\([^)]*\.md\)' src/content/docs/ --include="*.md" | grep -v native/README | grep -v https`
- Check index files: `find src/content/docs/ -name "index.md" -not -path "*/node_modules/*" | sort`

## Deviations

None — implementation followed the plan exactly.

## Known Issues

None.

## Files Created/Modified

- `scripts/prebuild.mjs` — added `rewriteLinks()` function, README→index renaming, root README skip, sidebar order frontmatter injection
- `.gsd/milestones/M001/slices/S04/S04-PLAN.md` — added Observability/Diagnostics section and failure-path verification check (pre-flight fix)
- `.gsd/milestones/M001/slices/S04/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
