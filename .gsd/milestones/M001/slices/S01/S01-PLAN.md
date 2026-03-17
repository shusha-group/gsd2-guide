# S01: Commands quick-reference with extraction pipeline and custom design

**Goal:** Build the complete foundation — content extraction from npm package + GitHub repo, Astro/Starlight site with terminal-native dark custom design, and a fully functional Commands quick-reference page. This proves the entire pipeline end-to-end: extraction → structured data → custom components → styled site with search.
**Demo:** A developer opens the site in a browser, sees a polished dark-themed docs site, navigates to the Commands reference, searches for "auto", and finds `/gsd auto` with its description and usage. Pagefind search works across the site.

## Must-Haves

- Content extraction script runs successfully, producing `data/commands.json` with all 20+ GSD commands
- Content extraction script produces `data/manifest.json` with content hashes for future diff tracking
- Astro/Starlight site builds and serves with custom dark theme (not default Starlight skin)
- Commands quick-reference page renders searchable/filterable cheat-sheet cards
- Each command card shows: name, description, category, keyboard shortcut (if applicable)
- Cards expand to show detailed info and examples
- Pagefind search returns results for command queries
- Mermaid diagram support is configured and renders a test diagram
- Site uses semantic HTML with proper heading hierarchy

## Proof Level

- This slice proves: integration (extraction → data → rendering → search all work together)
- Real runtime required: yes (dev server, build, browser verification)
- Human/UAT required: yes (design quality visual review)

## Verification

- `npm run build` completes without errors
- `node scripts/extract-content.mjs` produces valid JSON files in `data/`
- `data/commands.json` contains 20+ command entries with name, description, and category fields
- `data/manifest.json` exists with content hashes
- Dev server serves the site and Commands page renders all commands as cards
- Pagefind search for "auto" returns the `/gsd auto` command
- Custom dark theme is visually distinct from default Starlight

## Observability / Diagnostics

- Runtime signals: extraction script logs progress per source (npm package, GitHub API) with counts
- Inspection surfaces: `data/manifest.json` shows what was extracted and when, `data/commands.json` is human-readable
- Failure visibility: extraction script exits with non-zero code and descriptive error on failure
- Redaction constraints: GitHub token not logged

## Tasks

- [x] **T01: Astro/Starlight project scaffold with terminal-native dark theme** `est:1h`
  - Why: Establishes the site foundation — project structure, Starlight config, custom dark theme, Mermaid integration, and dev server. Everything downstream builds on this.
  - Files: `package.json`, `astro.config.mjs`, `src/styles/custom.css`, `src/content/docs/index.mdx`, `tsconfig.json`
  - Do: Initialize Astro project with Starlight template. Configure sidebar structure, Mermaid plugin, sitemap. Create custom CSS with terminal-native dark palette (dark backgrounds, monospace accents, green/cyan terminal colors). Override Starlight's default theme tokens. Add a placeholder index page with a test Mermaid diagram. Use the frontend-design skill for design quality.
  - Verify: `npm run dev` serves the site, placeholder page renders with custom dark theme, Mermaid diagram renders as SVG
  - Done when: Dev server runs, custom dark theme is visually distinct from Starlight defaults, Mermaid works

- [x] **T02: Content extraction script — commands from npm package and GitHub repo** `est:1h`
  - Why: Builds the extraction pipeline that transforms raw GSD source artifacts into structured data. Commands are the first and most important content type. Also establishes the manifest pattern for incremental rebuilds.
  - Files: `scripts/extract-content.mjs`, `data/commands.json`, `data/manifest.json`
  - Do: Write a Node.js extraction script that: (1) reads the installed gsd-pi README and the GitHub repo's `docs/commands.md` to extract command tables, (2) parses command names, descriptions, categories (session, config, git, shortcuts), options, and keyboard shortcuts into structured JSON, (3) writes `data/commands.json`, (4) generates `data/manifest.json` with SHA-256 hashes per content file for future diff tracking. Use `gh api` or `@octokit/rest` for GitHub content. Handle rate limits with conditional requests (If-None-Match/ETag).
  - Verify: `node scripts/extract-content.mjs` produces valid `data/commands.json` with 20+ entries and `data/manifest.json` with hashes
  - Done when: Commands JSON has all commands from the reference, each with name/description/category, manifest tracks content hashes

- [x] **T03: Commands quick-reference page with cheat-sheet cards** `est:1h`
  - Why: The first real content page — proves the full pipeline from extracted data through custom components to rendered page with search.
  - Files: `src/components/CheatSheetCard.astro`, `src/components/FilterBar.astro`, `src/content/docs/reference/commands.mdx`, `src/styles/components.css`
  - Do: Build CheatSheetCard component (expandable, shows name/description/category/shortcut, detail section). Build FilterBar component for category filtering (Session, Config, Git, Shortcuts). Create Commands reference page that imports data from `data/commands.json` and renders cards with client-side filtering. Style components with the terminal-native dark theme. Ensure Pagefind indexes the page content.
  - Verify: Commands page renders all 20+ commands as cards, filter by category works, clicking a card expands it, Pagefind search for "auto" finds `/gsd auto`
  - Done when: A developer can open the Commands page, filter by category, search for a command, and see its full details

## Files Likely Touched

- `package.json` — project deps (astro, starlight, mermaid plugin)
- `astro.config.mjs` — Starlight configuration, sidebar, plugins
- `tsconfig.json` — TypeScript config for Astro
- `src/styles/custom.css` — Custom dark theme overrides
- `src/styles/components.css` — Component-specific styles
- `src/content/docs/index.mdx` — Placeholder landing page
- `src/content/docs/reference/commands.mdx` — Commands quick-reference
- `src/components/CheatSheetCard.astro` — Expandable card component
- `src/components/FilterBar.astro` — Category filter component
- `scripts/extract-content.mjs` — Content extraction pipeline
- `data/commands.json` — Extracted command data
- `data/manifest.json` — Content hash manifest
