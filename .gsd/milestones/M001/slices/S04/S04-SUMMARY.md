---
id: S04
parent: M001
milestone: M001
provides:
  - 125 generated doc pages from GitHub repo rendered as navigable Starlight pages with working internal links
  - Prebuild link rewriting from .md format to Starlight /page/ routes (../page/, ../page/#section)
  - README.md → index.md renaming with sidebar order frontmatter for 5 subdirectories
  - Sidebar organized into 10 logical groups (Guides, Architecture, + 6 autogenerate subdirectory groups)
  - Landing page updated with Getting Started hero CTA and deep-dive LinkCards
  - Placeholder scaffolding removed
requires:
  - slice: S01
    provides: content/generated/docs/ (126 markdown files extracted from GitHub repo)
  - slice: S02
    provides: Astro/Starlight scaffold with sidebar navigation, Mermaid diagram support, custom theme
affects:
  - S06
key_files:
  - scripts/prebuild.mjs
  - astro.config.mjs
  - src/content/docs/index.mdx
key_decisions:
  - All internal .md links rewritten with ../ prefix and trailing slashes (../page/, ../page/#section) because Starlight renders each page as /page/index.html
  - README.md targets become directory paths (../subdir/) not ../subdir/index/ since Starlight resolves directory URLs to index pages
  - Root-level doc pages split into explicit Guides (15 pages) and Architecture (4 pages) sidebar groups; subdirectories use autogenerate
  - Root README.md skipped entirely to preserve hand-authored index.mdx splash page
patterns_established:
  - Fenced code block tracking via line-by-line processing with ``` toggle state to skip link rewriting inside code blocks
  - isSubdirReadme flag passed through processMarkdown to conditionally inject sidebar ordering frontmatter
  - Explicit sidebar entries for root-level pages; autogenerate groups only for multi-file subdirectories with numbered files
observability_surfaces:
  - "Prebuild console output: logs file count (125), skipped files, and per-file errors"
  - "Generated manifest: src/content/docs/.generated-manifest.json lists every generated file with timestamp"
  - "Link residual check: grep -r '\\.md)' src/content/docs/ --include='*.md' | grep -v native/README | grep -v https"
  - "Index file check: find src/content/docs/ -name 'index.md' — should return 5 subdirectory index files"
  - "Build page count: npm run build reports total pages (expect ≥130)"
  - "Failure path: prebuild exits non-zero with descriptive error when content/generated/docs/ is missing"
drill_down_paths:
  - .gsd/milestones/M001/slices/S04/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S04/tasks/T02-SUMMARY.md
duration: 20m
verification_result: passed
completed_at: 2026-03-17
---

# S04: Deep-dive documentation pages

**All 125 GitHub repo doc files rendered as navigable Starlight pages with rewritten internal links, logical 10-group sidebar, and updated landing page — 133 total pages build successfully.**

## What Happened

Two tasks transformed the raw extracted docs from S01 into a fully navigable documentation site.

**T01 enhanced the prebuild pipeline** (`scripts/prebuild.mjs`) with three capabilities: (1) A `rewriteLinks()` function that processes content line-by-line, tracking fenced code block state to avoid rewriting links inside code. A single regex matches `](path.md)` and `](path.md#fragment)` patterns while excluding external URLs and hash-only fragments. Links are rewritten from `./file.md` → `../file/` with hash fragments placed after trailing slashes (`../file/#section`). README.md targets become directory paths (`../subdir/`). (2) Subdirectory README.md files (5 total) are renamed to `index.md` with `sidebar: { order: 0 }` frontmatter so they sort first in their sections. (3) The root README.md is skipped to avoid overwriting the hand-authored `index.mdx` splash page.

**T02 reorganized the sidebar and landing page.** The sidebar in `astro.config.mjs` was restructured: the empty "Getting Started" autogenerate group (no matching directory) and "Placeholder" group were removed. A "Guides" group with 15 explicit entries covers root-level user-facing pages in logical reading order. An "Architecture" group holds 4 technical pages. Six autogenerate groups handle the numbered subdirectories. Placeholder scaffolding (3 demo files from S02) was deleted. The landing page (`index.mdx`) was updated with Getting Started as the primary hero CTA and a new "Deep-Dive Guides" section with LinkCards for Getting Started, Auto Mode, Architecture, and Troubleshooting.

## Verification

All slice-level verification checks passed:

| Check | Result |
|-------|--------|
| `npm run build` exits 0 with ≥130 pages | ✅ 133 pages |
| `.md)` residuals only external/code-block references | ✅ 17 content filename refs only, 0 broken navigation links |
| No `/readme/` pages in dist | ✅ 0 |
| Sidebar contains getting-started, auto-mode, architecture, troubleshooting | ✅ all present |
| `building-coding-agents/index.html` exists (README became index) | ✅ |
| Internal link spot-checks: getting-started→auto-mode, auto-mode→git-strategy, configuration→token-optimization | ✅ all 3 pass |
| Failure-path: prebuild with missing docs directory exits non-zero | ✅ exits 1 with descriptive error |
| No placeholder pages in dist | ✅ 0 |
| Landing page links to Getting Started, Auto Mode, Architecture, Troubleshooting | ✅ |
| Prebuild produces 125 files, manifest has 125 entries | ✅ |
| 5 index.md files, 0 README.md files in generated docs | ✅ |

## Requirements Advanced

- R002 — GitHub repo docs now rendered as navigable site pages (was extraction only in S01)
- R006 — 125 doc pages now render within the terminal-native dark theme with Mermaid diagram support
- R013 — Mermaid diagrams in doc pages render correctly via the Starlight plugin (proven by build success of pages containing mermaid fences)

## Requirements Validated

- R004 — Full narrative documentation pages: 133 pages covering getting started, auto mode, configuration, architecture, git strategy, skills, troubleshooting, extending pi, building coding agents, TUI/UI, and more. Sidebar organized into 10 navigable groups.
- R017 — Architecture overview pages: architecture.md, ADR-001, PRD render in Architecture sidebar group. Building-coding-agents essay series (10 pages) renders as its own section.
- R019 — Troubleshooting section: troubleshooting.md renders in Guides sidebar group with a prominent LinkCard on the landing page.
- R020 — Getting started page: renders as first Guides entry, landing page hero CTA links directly to it, cross-link to auto-mode verified.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

None — both tasks executed exactly as planned.

## Known Limitations

- The 17 `.md)` occurrences in built HTML are content references to filenames (DECISIONS.md, SYSTEM.md, etc.) in prose text, not navigation links. These are correct and expected — the source docs mention GSD file conventions.
- The dead `../native/README.md` link in one source doc was intentionally left untouched (refers to a non-existent native API directory that was never created upstream).
- Some pages contain both sidebar absolute links (`/gsd2-guide/page/`) and in-content relative links (`../page/`). Both resolve correctly but the dual format is a cosmetic artifact.

## Follow-ups

- none

## Files Created/Modified

- `scripts/prebuild.mjs` — Added `rewriteLinks()` function, README→index renaming, root README skip, sidebar order frontmatter injection
- `astro.config.mjs` — Restructured sidebar: added Guides (15 items) and Architecture (4 items) groups, removed Placeholder and empty Getting Started groups
- `src/content/docs/index.mdx` — Added Getting Started hero CTA, deep-dive LinkCards section
- `src/content/docs/placeholder/` — Deleted (3 files: components.mdx, diagrams.mdx, code-examples.mdx)

## Forward Intelligence

### What the next slice should know
- The site now builds 133 pages. S05 (changelog) will add pages on top of this. The sidebar in `astro.config.mjs` uses explicit entries for root pages and autogenerate for subdirectories — a changelog page would need an explicit entry or its own autogenerate group.
- The prebuild script (`scripts/prebuild.mjs`) processes only `content/generated/docs/`. Changelog/release content from `content/generated/releases.json` is consumed by different page templates, not by prebuild.
- The landing page (`index.mdx`) now has two sections of LinkCards: Quick Reference and Deep-Dive Guides. S05 might want to add a "Latest Release" or "What's New" card.

### What's fragile
- The link rewriting regex in `rewriteLinks()` handles the known patterns from the current GitHub docs. If upstream docs introduce new link patterns (e.g., links to files outside docs/, anchor-only links to headings with special characters), the regex may not catch them. The residual check command is the diagnostic: `grep -r '\.md)' src/content/docs/ --include="*.md" | grep -v native/README | grep -v https`.
- The explicit sidebar entries in `astro.config.mjs` reference exact page slugs. If the upstream repo renames or removes a doc file, the build will fail with a missing content collection entry. This is actually desirable — it surfaces broken references at build time.

### Authoritative diagnostics
- `npm run build` exit code and page count — if it exits 0 with ≥133 pages, all content and links are valid
- `src/content/docs/.generated-manifest.json` — authoritative list of all generated files with timestamps
- `node scripts/prebuild.mjs` console output — reports file count, skips, and errors

### What assumptions changed
- The plan expected 126 docs producing 130+ pages. Actual: 125 generated docs (root README skipped) + 8 hand-authored pages = 133 total pages. The page count exceeded expectations because S03's reference pages contribute to the total.
