# S02: Astro Site Scaffold with Custom Design — UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: mixed (artifact-driven for build outputs + live-runtime for dev server + human-experience for design quality)
- Why this mode is sufficient: The slice delivers a running site with custom design. Build artifacts prove functionality (pages render, search indexes, sitemap generates). Live runtime proves dev server works. Human experience is needed for the "craft feel" design judgment (R006).

## Preconditions

- Node.js 18+ installed
- `npm install` has been run in the project root
- S01 extraction has been run (`npm run extract`) so `content/generated/docs/` contains 126 markdown files

## Smoke Test

Run `npm run build` — it should exit 0 and report "131 page(s) built". If this fails, nothing else will work.

## Test Cases

### 1. Production Build Succeeds

1. Run `npm run build`
2. **Expected:** Exit 0, stdout shows "131 page(s) built", `dist/` directory created

### 2. Prebuild Pipeline Works

1. Run `node scripts/prebuild.mjs`
2. **Expected:** stdout shows "Prebuild complete: 126 files processed"
3. Check `src/content/docs/.generated-manifest.json` exists
4. Check `head -5 src/content/docs/getting-started.md`
5. **Expected:** Shows `---\ntitle: "Getting Started"\n---` frontmatter, no duplicate `# Getting Started` heading in body

### 3. Prebuild Idempotent Re-run

1. Run `node scripts/prebuild.mjs` a second time
2. **Expected:** Same output — "126 files processed". No errors, no duplicate files.

### 4. Sitemap Generated (R012)

1. After build, check `test -f dist/sitemap-index.xml`
2. **Expected:** File exists, contains sitemap URL pointing to `gsd-build.github.io/gsd2-guide`

### 5. Pagefind Search Index Built (R009)

1. After build, check `test -d dist/pagefind`
2. Run `ls dist/pagefind/*.js | wc -l`
3. **Expected:** Directory exists, contains 4+ JavaScript files

### 6. Dark Theme Applied (R006)

1. Run `npm run dev`
2. Open `http://localhost:4321/gsd2-guide/` in a browser
3. **Expected:** Page has near-black background (not Starlight's default blue/purple), green accents, monospace headings
4. Open DevTools, select `<html>`, check computed `--sl-color-bg`
5. **Expected:** Value is `#0a0e0a` (not Starlight's default)
6. Check computed `--sl-color-text-accent`
7. **Expected:** Value is `#39ff14` (phosphor green)

### 7. Custom Fonts Loaded (R006)

1. On the dev server, open DevTools Console
2. Run `document.fonts.check('1em "JetBrains Mono Variable"')` and `document.fonts.check('1em "Outfit Variable"')`
3. **Expected:** Both return `true`
4. Inspect any heading element — font-family should include "JetBrains Mono Variable"
5. Inspect body text — font-family should include "Outfit Variable"

### 8. Light Mode Works

1. Click the theme toggle (sun/moon icon) in the top nav
2. **Expected:** Page switches to light mode with muted green palette, readable contrast. Not broken or unstyled.
3. Click toggle again to return to dark mode
4. **Expected:** Returns to phosphor green dark theme

### 9. Version Badge in Header

1. On any page, look at the top-right corner of the header
2. **Expected:** A badge showing "v0.0.0" with terminal-themed border (green accent)
3. Navigate to 2-3 different pages
4. **Expected:** Badge persists on every page

### 10. Custom Footer

1. Scroll to the bottom of any page
2. **Expected:** Footer shows "Built with GSD · Powered by Starlight" in monospace font with muted styling

### 11. Mermaid Diagrams Render as SVG (R013)

1. Navigate to `http://localhost:4321/gsd2-guide/placeholder/diagrams/`
2. **Expected:** Page shows three rendered diagrams (flowchart, sequence, state) — not raw mermaid code text
3. Right-click a diagram and "Inspect Element"
4. **Expected:** Contains `<svg>` elements (not `<pre>` or `<code>`)

### 12. Component Variants Display

1. Navigate to `http://localhost:4321/gsd2-guide/placeholder/components/`
2. **Expected:** All four aside types visible with distinct colors/icons: Note (blue/info), Tip (green/check), Caution (yellow/warning), Danger (red/alert)
3. **Expected:** Tabs component with npm/yarn/pnpm switching
4. **Expected:** Card grid with multiple cards
5. **Expected:** Badge variants (default, success, note, caution, danger)
6. **Expected:** Steps component with numbered steps

### 13. Code Block Features

1. Navigate to `http://localhost:4321/gsd2-guide/placeholder/code-examples/`
2. **Expected:** Syntax highlighting for multiple languages (JS, TS, Bash, JSON, YAML, Python)
3. **Expected:** At least one code block with a file name label in the header
4. **Expected:** Line highlighting visible (highlighted lines have distinct background)
5. **Expected:** At least one terminal-frame code block (different appearance from code frame)

### 14. Landing Page

1. Navigate to `http://localhost:4321/gsd2-guide/`
2. **Expected:** Hero section with "GSD 2" title, tagline, and action buttons
3. **Expected:** Card components linking to documentation sections
4. **Expected:** The page uses the splash template (no sidebar)

### 15. Sidebar Navigation

1. Navigate to any non-splash page (e.g., placeholder/components)
2. **Expected:** Sidebar shows a "Placeholder" group with 3 items (Components, Diagrams, Code Examples)
3. **Expected:** Additional groups for S01 content (What is Pi, Building Coding Agents, etc.)
4. Clicking sidebar items navigates to the correct page

### 16. S01 Content Renders

1. Navigate to `http://localhost:4321/gsd2-guide/getting-started/`
2. **Expected:** Page renders with content from S01's extracted docs, frontmatter title displayed as page heading, no duplicate `<h1>`
3. Navigate to `http://localhost:4321/gsd2-guide/building-coding-agents/01-work-decomposition/`
4. **Expected:** Subdirectory content renders correctly with sidebar navigation

### 17. HTML Page Count

1. After build, run `find dist/ -name "*.html" | wc -l`
2. **Expected:** 131 (126 S01 docs + 3 placeholder pages + index + 404)

## Edge Cases

### Prebuild With Missing Source Directory

1. Temporarily rename `content/generated/docs/` to `content/generated/docs_bak/`
2. Run `node scripts/prebuild.mjs`
3. **Expected:** Non-zero exit code or clear error message indicating source directory not found
4. Restore: rename `docs_bak/` back to `docs/`

### Prebuild With Empty Source File

1. Create an empty file: `touch content/generated/docs/empty-test.md`
2. Run `node scripts/prebuild.mjs`
3. **Expected:** Script completes without crashing. The empty file is handled (title derived from filename).
4. Clean up: `rm content/generated/docs/empty-test.md`

### Build After Clearing Cache

1. Run `rm -rf .astro dist`
2. Run `npm run build`
3. **Expected:** Build succeeds — stale cache does not prevent a clean build

## Failure Signals

- `npm run build` exits non-zero → broken config, missing deps, or content collection schema error
- Page count < 131 → prebuild failed to copy files, or content collection rejected some files
- `dist/pagefind/` missing → Pagefind integration broken (check Starlight version)
- `dist/sitemap-index.xml` missing → `site` config missing from `astro.config.mjs`
- No `<svg>` in diagrams page → Mermaid plugin misconfigured or not registered
- Default blue theme visible → `customCss` not wired in `astro.config.mjs`
- Version badge missing → `components.Header` not registered in Starlight config
- Fonts not loading → `@fontsource-variable` packages not installed or `@import` paths wrong in custom.css

## Requirements Proved By This UAT

- R006 — Custom dark-mode-first terminal design (tests 6, 7, 8, and overall visual quality)
- R009 — Pagefind search index builds and indexes all content (test 5)
- R012 — Semantic HTML + sitemap generated (test 4, test 17)
- R013 — Mermaid diagrams render as SVG (test 11)

## Not Proven By This UAT

- R006 "craft feel" — A human must make a subjective judgment about design quality. The tests verify the custom theme is applied, but not whether it achieves the desired aesthetic.
- R009 search relevance — We verify the index exists but don't test that search queries return relevant results. Full search testing happens when real content is in place (S03/S04).
- Pagefind search UI interaction — We verify the index builds but don't test the search input/results UI. This needs a browser test with actual query input.
- Production deployment — The build succeeds locally but GitHub Pages deployment is verified in S06.

## Notes for Tester

- **Dark mode is the hero** — test dark mode first and most thoroughly. Light mode should work but hasn't received the same design polish.
- **Missing favicon** — a 404 for `favicon.svg` in the dev console is expected. It's cosmetic and doesn't affect functionality.
- **`gitignore` language warning** — you may see a build warning about `gitignore` not being a recognized language in expressive-code. This is from an S01 ADR doc and is harmless.
- **Base path** — URLs include `/gsd2-guide/` prefix. If you navigate to `localhost:4321/` without the base path, you'll get a 404. Always use `http://localhost:4321/gsd2-guide/`.
- **Design judgment for R006** — The key question is: "Does this look like a custom terminal-native site, or does it look like default Starlight with a different color?" If the fonts, colors, code blocks, and overall vibe feel intentional and developer-focused, R006 passes. If it feels like a reskin, it doesn't.
