# S04: Core workflow recipes — UAT

**Milestone:** M002
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: Recipe pages are static documentation — correctness is verified by build success, link integrity, structural checks, and content review. No runtime behavior to test.

## Preconditions

- `npm run build` exits 0 (confirms all 6 recipe MDX files compile)
- `node scripts/check-links.mjs` reports 0 broken links
- A browser available for visual verification of rendered pages

## Smoke Test

Run `npx astro preview` and navigate to `/gsd2-guide/recipes/fix-a-bug/`. The page should render with a title, numbered steps, at least one directory tree, and a Mermaid diagram rendered as an SVG (not raw text).

## Test Cases

### 1. All 6 recipe pages render and are navigable from sidebar

1. Start preview server: `npx astro preview`
2. Navigate to the site root
3. Open the sidebar — locate the "Recipes" section
4. Click each of the 6 recipe entries: Fix a Bug, Small Change, New Milestone, Handle UAT Failures, Error Recovery, Working in Teams
5. **Expected:** Each click navigates to a distinct recipe page with a title, introductory text, and structured content. No 404s, no blank pages.

### 2. Recipe page structure is consistent across all 6 pages

1. Visit each recipe page in sequence
2. Check that each page contains these sections: "When to Use This", "Prerequisites", numbered "Steps", "What Gets Created", a Mermaid flowchart, and related links
3. **Expected:** All 6 pages follow the same structural pattern. Section headings are present and in the same order.

### 3. Mermaid diagrams render as SVGs

1. Visit `/gsd2-guide/recipes/fix-a-bug/`
2. Scroll to the flow diagram section
3. **Expected:** A rendered SVG flowchart appears with dark terminal theme colors (green nodes on dark background), not a raw code block showing mermaid syntax text
4. Repeat for all 6 recipe pages
5. **Expected:** Each page has exactly one rendered Mermaid diagram

### 4. Directory trees show .gsd/ state at key stages

1. Visit `/gsd2-guide/recipes/fix-a-bug/`
2. Locate the directory tree code blocks within the Steps section
3. **Expected:** At least one code block shows a `.gsd/` directory tree with milestone, slice, and task files appropriate to the described workflow stage
4. Visit `/gsd2-guide/recipes/new-milestone/`
5. **Expected:** Directory tree shows both a completed M001 and an in-progress M002

### 5. Cross-references link to correct command pages

1. Visit `/gsd2-guide/recipes/small-change/`
2. Find the link to `/gsd quick` command reference
3. Click it
4. **Expected:** Navigates to `/gsd2-guide/commands/quick/` — the command deep-dive page, not a 404
5. Visit `/gsd2-guide/recipes/error-recovery/`
6. Find links to `/gsd doctor` and `/gsd forensics`
7. **Expected:** Both link to their respective command deep-dive pages

### 6. Cross-references between recipes work

1. Visit `/gsd2-guide/recipes/fix-a-bug/`
2. Look for "Related" links at the bottom
3. Click any link to another recipe page
4. **Expected:** Navigates to the linked recipe page, not a 404

### 7. Pagefind search returns recipe content

1. Navigate to the site
2. Use the search box (Ctrl+K or click search icon)
3. Search for "fix a bug"
4. **Expected:** The "Fix a Bug" recipe page appears in search results
5. Search for "UAT failures"
6. **Expected:** The "Handle UAT Failures" recipe page appears in search results
7. Search for "working in teams"
8. **Expected:** The "Working in Teams" recipe page appears in search results

## Edge Cases

### Cookmate scenario consistency

1. Read through fix-a-bug, small-change, and new-milestone recipes
2. **Expected:** All three use "Cookmate" as the example project. The scenarios are distinct but consistent — Cookmate is a recipe-sharing app, M001 covers core features, M002 covers social features.

### Terminal output examples look realistic

1. Visit `/gsd2-guide/recipes/small-change/`
2. Find the terminal output code blocks
3. **Expected:** Terminal examples show realistic GSD output (commit messages, branch names, file paths) that match how GSD actually behaves — not generic placeholder text.

## Failure Signals

- A recipe page returns 404 → sidebar entry in astro.config.mjs has wrong path or MDX file has invalid frontmatter
- Mermaid diagram shows as raw text → Mermaid code block has syntax errors (unescaped characters, missing node IDs, malformed init block)
- Broken link on a recipe page → cross-reference uses wrong path format (should be `../../commands/<slug>/` for command links)
- Recipe missing from search results → Pagefind didn't index the page (check that `dist/recipes/<slug>/index.html` exists)
- Sidebar shows wrong recipe count → `grep -c "'/recipes/" astro.config.mjs` doesn't match 6

## Requirements Proved By This UAT

- R028 — All 6 core recipe pages exist with commands, artifacts, and expected outcomes
- R031 — Visual documentation approach applied to recipes (Mermaid flowcharts, directory trees, terminal output)

## Not Proven By This UAT

- Content accuracy against actual GSD runtime behavior — recipes were authored from source study, not verified by running the described workflows end-to-end
- Advanced recipe coverage (parallel orchestration, headless/CI, custom hooks) — explicitly deferred to M003

## Notes for Tester

- Mermaid diagrams require JavaScript — they won't render in a browser with JS disabled or in a pure HTML inspection.
- The preview server needs `npx astro preview` after a successful build. It serves from `dist/`.
- Recipe pages are static content — if the build passes, the content exists. The main thing to verify visually is that Mermaid diagrams render (not raw text) and that the content reads well as instructional material.
