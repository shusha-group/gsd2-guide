# S04: Deep-dive documentation pages

**Goal:** All 126 doc files from the GitHub repo rendered as navigable, interlinked sections in the documentation site — with working internal links, logical sidebar organization, and no orphan pages.
**Demo:** Running `npm run build` produces 130+ pages. Every sidebar group has entries. Clicking an internal link (e.g., Getting Started → Auto Mode) navigates correctly. No `/readme/` pages appear in the sidebar — subdirectory index pages sort first.

## Must-Haves

- Prebuild rewrites all internal `.md` links to Starlight-compatible `/page/` routes (with hash fragment support)
- README.md files in subdirectories become `index.md` with `sidebar.order: 0` frontmatter
- Root-level `docs/README.md` does NOT overwrite the hand-authored `index.mdx` splash page
- All 20 root-level doc pages appear in the sidebar under logical groups (Guides, Architecture)
- Placeholder pages (`src/content/docs/placeholder/`) removed — real content replaces them
- Landing page (`index.mdx`) links updated to point to key doc pages (Getting Started, Auto Mode, etc.)
- `npm run build` exits 0 with ≥130 pages
- No remaining `.md)` link patterns in built HTML output

## Proof Level

- This slice proves: integration
- Real runtime required: yes (Astro build verifies link resolution and page rendering)
- Human/UAT required: no (structural verification via build output inspection)

## Verification

- `npm run build` exits 0 with ≥130 pages
- `grep -r '\.md)' dist/ --include="*.html" | grep -v 'node_modules' | grep -v '.github' | wc -l` returns 0 or only external/code-block references
- `find dist/ -path "*/readme/index.html" | wc -l` returns 0 (no `/readme/` pages)
- Sidebar contains entries for `getting-started`, `auto-mode`, `architecture`, `troubleshooting` (spot-check built HTML nav)
- `find dist/building-coding-agents/ -name "index.html" -path "*/building-coding-agents/index.html"` exists (README became index)
- Internal link spot-checks in built HTML: getting-started links to auto-mode, auto-mode links to git-strategy, configuration links to token-optimization
- **Failure-path check:** `node scripts/prebuild.mjs` with a missing `content/generated/docs/` directory exits non-zero with descriptive error. With a malformed file, logs filename and error to stderr and continues processing other files.

## Observability / Diagnostics

- **Prebuild console output:** `scripts/prebuild.mjs` logs file count, skipped files, and errors to stdout/stderr. A non-zero exit code means at least one file failed processing.
- **Generated manifest:** `src/content/docs/.generated-manifest.json` lists every generated file with timestamp — inspect to verify which files were written and when.
- **Link rewriting residuals:** `grep -r '\.md)' src/content/docs/ --include="*.md" | grep -v 'native/README' | grep -v 'https'` surfaces any internal `.md` links that survived rewriting. Should return 0 lines after T01.
- **README→index verification:** `find src/content/docs/ -name "README.md"` should return nothing after T01. `find src/content/docs/ -name "index.md"` should return 5 subdirectory index files.
- **Build failure diagnostics:** `npm run build` stderr contains Astro/Starlight error messages including broken link warnings and missing content collection entries. Inspect stderr for `[ERROR]` or `404` patterns.
- **Failure-path check:** If prebuild encounters a read/write error on any file, it logs the filename and error message to stderr and increments a skip counter. The final log line distinguishes `N files processed` from `M files skipped due to errors`. Non-zero exit on any error.

## Integration Closure

- Upstream surfaces consumed: `content/generated/docs/` (126 markdown files from S01), Astro/Starlight scaffold with sidebar and Mermaid support (S02)
- New wiring introduced in this slice: enhanced `scripts/prebuild.mjs` with link rewriting + README→index renaming; restructured sidebar in `astro.config.mjs`
- What remains before the milestone is truly usable end-to-end: S05 (changelog/version display), S06 (update pipeline + deployment)

## Tasks

- [x] **T01: Enhance prebuild with link rewriting and README→index renaming** `est:40m`
  - Why: The 126 extracted docs have internal links using `./page.md` format that 404 in Starlight (which uses `/page/` routes). README.md files render as `/readme/` instead of section index pages. The prebuild script is the sole transformation point — all fixes must happen here.
  - Files: `scripts/prebuild.mjs`
  - Do: Add three transformations to prebuild: (1) Rewrite markdown links — `](./file.md)` → `](../file/)`, `](./file.md#section)` → `](../file/#section)`, `](file.md)` → `](../file/)` (bare references), within-subdirectory links `](./NN-page.md)` → `](./NN-page/)`, README.md links `](./subdir/README.md)` → `](../subdir/)`. Must only match markdown link syntax `](...)`, not code blocks. (2) Rename README.md → index.md in subdirectories, inject `sidebar: { order: 0 }` frontmatter so they sort first. Skip root-level README.md to avoid collision with index.mdx. (3) Handle the dead `../native/README.md` link by stripping or leaving as-is.
  - Verify: `node scripts/prebuild.mjs` exits 0. Check `src/content/docs/building-coding-agents/index.md` exists with `sidebar` frontmatter. Check `src/content/docs/getting-started.md` contains `](../auto-mode/)` not `](./auto-mode.md)`. No `src/content/docs/README.md` file (skipped).
  - Done when: Prebuild produces 125 files (126 minus skipped root README), all README.md→index.md, all `.md` links rewritten to `/page/` format with trailing slashes.

- [ ] **T02: Reorganize sidebar, remove placeholders, and verify build** `est:30m`
  - Why: 20 root-level doc pages have no sidebar entry (the "Getting Started" autogenerate looks for a `getting-started/` directory that doesn't exist). Placeholder pages are now superseded by real content. The landing page still points only to reference pages, not the deep-dive docs.
  - Files: `astro.config.mjs`, `src/content/docs/index.mdx`, `src/content/docs/placeholder/` (delete)
  - Do: (1) Replace the sidebar config in `astro.config.mjs` — remove the Placeholder group, replace empty "Getting Started" autogenerate with explicit sidebar entries organized into logical groups: Guides (getting-started, auto-mode, configuration, commands, git-strategy, working-in-teams, cost-management, token-optimization, dynamic-model-routing, captures-triage, visualizer, skills, remote-questions, migration, troubleshooting), Architecture (architecture, agent-knowledge-index, ADR-001, PRD), keep existing autogenerate groups for subdirectories (what-is-pi, building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals). (2) Delete `src/content/docs/placeholder/` directory. (3) Update `index.mdx` to add LinkCards for Getting Started, Auto Mode, Architecture, and Troubleshooting as primary entry points alongside the existing reference cards. (4) Run full build and verify: ≥130 pages, no `/readme/` routes, sidebar completeness, link integrity spot-checks.
  - Verify: `npm run build` exits 0 with ≥130 pages. `find dist/ -path "*/placeholder/*" | wc -l` returns 0. Sidebar HTML contains "Getting Started", "Auto Mode", "Architecture", "Troubleshooting" entries. `grep -ro '\.md)' dist/ --include="*.html" | wc -l` shows only external/code references (not internal links).
  - Done when: Build succeeds with ≥130 pages, all doc pages reachable via sidebar, no placeholder pages remain, landing page links to key doc sections.

## Files Likely Touched

- `scripts/prebuild.mjs`
- `astro.config.mjs`
- `src/content/docs/index.mdx`
- `src/content/docs/placeholder/` (deleted)
