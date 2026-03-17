# S04: Deep-dive documentation pages — Research

**Date:** 2026-03-17
**Depth:** Targeted

## Summary

S04's job is to make all 126 extracted docs **navigable, linked, and organized** — not just rendered. The build already works: `npm run build` produces 137 pages including all 126 docs. The content flows through the prebuild pipeline (S01 → prebuild → Starlight). But the site has three structural problems that make the docs unusable as a documentation resource:

1. **20 root-level pages are orphaned from the sidebar.** Pages like getting-started, auto-mode, architecture, configuration, troubleshooting, etc. exist as rendered HTML but have no sidebar entry. The current sidebar `autogenerate: { directory: 'getting-started' }` expects a `getting-started/` folder, but the file is at `src/content/docs/getting-started.md` (root level). Users can only find these pages through search or direct URL.

2. **144 internal links are broken.** Source docs use `[link text](./page.md)` and `[link text](./page.md#section)` format. Starlight routes pages as `/page-name/` not `/page-name.md`. Every relative `.md` link 404s. The prebuild script must rewrite these.

3. **README.md files appear as `/readme/` instead of section index pages.** Each subdirectory has a README.md that serves as a table of contents. Starlight renders them as `/building-coding-agents/readme/` — awkward and at the bottom of each sidebar group. They should become `index.md` pages.

The work is fundamentally about **enhancing the prebuild script** to handle these three issues, then **reorganizing the sidebar** in `astro.config.mjs` to give all 126 pages logical homes. No new Astro components, no new npm dependencies, no new architecture.

## Recommendation

Enhance `scripts/prebuild.mjs` with three new transformations, reorganize the sidebar, and remove the placeholder pages that are superseded by real content:

1. **Link rewriting in prebuild** — Replace `](./file.md)` with `](../file/)` (or appropriate relative path), handling hash fragments and cross-directory references. This is a string replacement pass on every file's content.

2. **README → index renaming** — When prebuild encounters a `README.md` in a subdirectory, write it as `index.md` instead. Add `sidebar.order: 0` frontmatter so it sorts first in autogenerate groups.

3. **Root-level doc organization** — Route root-level docs into logical sidebar groups using a content mapping in prebuild that places files into subdirectories (e.g., `getting-started.md` → `guides/getting-started.md`). Alternatively, use explicit sidebar entries in `astro.config.mjs` since there are only 20 root-level files.

4. **Sidebar restructure** — Replace the empty "Getting Started" autogenerate with explicit sidebar entries organized into logical groups (Guides, Architecture, Proposals, etc.). Remove the Placeholder group since its demo pages are no longer needed.

5. **Frontmatter enhancement** — Inject `sidebar.order` and optionally `description` into frontmatter for key pages (getting-started, troubleshooting, architecture) to control ordering and improve SEO/search.

## Implementation Landscape

### Key Files

- `scripts/prebuild.mjs` — The sole file that transforms S01 output into Starlight content. Currently handles frontmatter injection and heading stripping. Needs: link rewriting, README→index renaming, root-level doc routing, sidebar ordering frontmatter.
- `astro.config.mjs` — Sidebar configuration. Currently has an empty "Getting Started" autogenerate and subdirectory autogenerates. Needs: reorganized sidebar with groups for root-level docs, removal of Placeholder group.
- `src/content/docs/index.mdx` — Landing page. Needs: updated links pointing to the new doc organization (Getting Started, Auto Mode, Architecture, Troubleshooting as hero-level entry points).
- `src/content/docs/placeholder/` — Three placeholder pages (components.mdx, diagrams.mdx, code-examples.mdx). Should be removed — they were scaffolding demos from S02. The real content now fills the site.

### Key Transformations in Prebuild

**Link rewriting rules:**
- `](./file.md)` → `](../file/)` (root-level docs link to peers)
- `](./file.md#section)` → `](../file/#section)` (with hash fragments)
- `](./01-subpage.md)` → `](./01-subpage/)` (within-subdirectory links, already relative)
- `](../native/README.md)` → dead link to content that doesn't exist — should be left as-is or stripped
- Within subdirectory README→index files: `](./01-page.md)` → `](./01-page/)` (same directory)

**README handling:**
- `content/generated/docs/building-coding-agents/README.md` → `src/content/docs/building-coding-agents/index.md`
- Root-level `content/generated/docs/README.md` → skip (the landing page `index.mdx` already exists)
- Inject `sidebar: { order: 0 }` into README-derived index pages so they sort first

**Sidebar frontmatter for numbered pages:**
- Pages like `01-work-decomposition.md` already sort correctly by filename prefix. No intervention needed.
- README pages need `sidebar.order: 0` to sort before `01-*`.

### Root-Level Docs Sidebar Strategy

Two approaches, recommend the **explicit sidebar** approach:

**Option A: Move files into subdirectories during prebuild** — e.g., `getting-started.md` → `guides/getting-started.md`. Pro: autogenerate works. Con: more complex prebuild, internal links between root-level docs break and need additional rewriting, creates unexpected paths.

**Option B (recommended): Explicit sidebar entries in astro.config.mjs** — List each root-level page explicitly in logical sidebar groups. Pro: simple, precise control over ordering and grouping, no file moves. Con: sidebar config is longer but only 20 entries.

Proposed sidebar groups:
```
- Home
- Quick Reference (existing S03)
- Getting Started (link: /getting-started/)
- Guides
  - Auto Mode
  - Configuration
  - Commands Reference
  - Git Strategy
  - Working in Teams
  - Cost Management
  - Token Optimization
  - Dynamic Model Routing
  - Captures & Triage
  - Workflow Visualizer
  - Skills
  - Remote Questions
  - Migration from v1
  - Troubleshooting
- Architecture
  - Architecture Overview
  - Agent Knowledge Index
  - ADR-001: Branchless Worktree Architecture
  - PRD: Branchless Worktree Architecture
- What Is Pi (autogenerate)
- Building Coding Agents (autogenerate)
- Context and Hooks (autogenerate)
- Extending Pi (autogenerate)
- Pi UI / TUI (autogenerate)
- Proposals (autogenerate)
```

### Build Order

1. **T01: Prebuild link rewriting + README→index.** This is the riskiest work — link rewriting has edge cases (hash fragments, cross-directory links, dead links). Prove it works by building and checking a sample of links in the HTML output. Also rename README→index and inject sidebar ordering frontmatter.

2. **T02: Sidebar reorganization + placeholder cleanup.** Update `astro.config.mjs` sidebar with explicit entries for root-level docs, grouped logically. Remove `src/content/docs/placeholder/` directory. Update `index.mdx` landing page links.

3. **T03: Build verification + broken link check.** Full build, verify page count, spot-check link resolution in HTML output, verify sidebar completeness.

### Verification Approach

- `npm run build` exits 0 with ≥130 pages (126 docs + index + reference pages; placeholder pages removed)
- **Sidebar completeness:** Every page in `src/content/docs/` has a sidebar entry (no orphans). Verify by checking built HTML sidebar `<nav>` contains entries for getting-started, troubleshooting, architecture, auto-mode, etc.
- **Link integrity:** Sample 10+ internal links from built HTML and verify they resolve. Key test cases:
  - `getting-started` → `auto-mode` link
  - `auto-mode` → `git-strategy` link  
  - `auto-mode` → `token-optimization#section` link with hash fragment
  - `building-coding-agents/README` → `building-coding-agents/01-work-decomposition` within-directory link
  - `README` → `what-is-pi/README` cross-directory link
- **No `/readme/` pages in sidebar:** Verify that autogenerate groups show index pages, not `/readme/` entries
- **Sidebar ordering:** Subdirectory index pages (from README) appear first in their groups, numbered pages follow in order
- **Pagefind indexes all pages:** Search index entry count ≥ build page count

## Constraints

- **Prebuild is the only transformation point.** Content lives in `content/generated/docs/` (gitignored, regenerated by extract). The prebuild script is the sole bridge to `src/content/docs/`. All transformations (link rewriting, renaming, frontmatter enhancement) must happen here.
- **Must not break S03 reference pages.** The `src/content/docs/reference/` directory contains hand-authored MDX files from S03 that import JSON data. Prebuild must not touch these (it already doesn't — it only copies from `content/generated/docs/`).
- **Root-level docs/ README.md must not overwrite index.mdx.** The root `content/generated/docs/README.md` would collide with the hand-authored `src/content/docs/index.mdx` splash page if renamed to `index.md`. Prebuild should skip it or route it to a non-colliding path.
- **Starlight sidebar `autogenerate` only reads from subdirectories of `src/content/docs/`.** Root-level `.md` files are not picked up by any autogenerate group — they must be listed explicitly in sidebar config.
- **Link rewriting must handle both relative and sibling patterns.** Root-level docs link to siblings via `./page.md`. Subdirectory docs link to siblings via `./NN-page.md` and to parent-level docs via none currently (no `../` links exist except one dead reference to `../native/README.md`).

## Common Pitfalls

- **Link rewriting regex must avoid code blocks.** A naive `content.replace(/\.md\)/g, '/')` would rewrite `.md` references inside code blocks and inline code. The regex should only match markdown link syntax `](path.md)`, not arbitrary occurrences of `.md`.
- **README→index renaming and link coherence.** If a page links to `./README.md`, the link must become `./` (directory index) not `./README/`. The link rewriter must know about the README→index rename.
- **Hash fragment links need the trailing slash before the hash.** `./page.md#section` must become `../page/#section`, not `../page#section` (Starlight requires trailing slash).
- **The root `docs/README.md` page.** This is the GitHub repo's docs index — a table linking to all other docs. It must NOT become `index.md` (would collide with the splash page). Either skip it, or route it to a dedicated path like `docs-index.md`.
- **Double prebuild execution.** The `prebuild` npm lifecycle hook runs before `build` automatically. The `dev` script chains explicitly. Don't add prebuild to the `build` script string — it's already handled. This is documented in KNOWLEDGE.md.

## Open Risks

- **Link rewriting correctness for edge cases.** The 144 links span multiple patterns. While the common cases (same-directory `.md` links, hash fragments) are predictable, unusual patterns could slip through. Mitigation: build and grep the HTML output for any remaining `.md)` strings.
- **README pages as index may duplicate sidebar entries.** If autogenerate picks up both `index.md` (from README) and numbered pages, the index might appear both as the group label link and as a list item. Need to test whether Starlight's autogenerate treats `index.md` as the group's landing page or as a regular list item.
