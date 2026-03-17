# S02: Astro Site Scaffold with Custom Design

**Goal:** A running Astro/Starlight site with terminal-native dark design, custom components, Mermaid diagram support, Pagefind search, and a prebuild script that bridges S01 extracted content into Starlight's content directory.
**Demo:** `npm run dev` starts a Starlight dev server showing placeholder pages with custom dark theme, Mermaid diagrams, all component variants (callouts, tabs, cards, code blocks), working Pagefind search, version display slot in header, and S01 content rendered via the prebuild pipeline.

## Must-Haves

- Astro 6 + Starlight 0.38 site builds and serves without errors
- Terminal-native dark-mode-first design using distinctive fonts and bold color palette (not default Starlight theme)
- Mermaid diagrams render as SVG via `@pasqal-io/starlight-client-mermaid`
- Pagefind search indexes all content and returns results (built into Starlight — just needs to work at build time)
- Custom Header component with version display slot for S05
- Custom Footer component
- `scripts/prebuild.mjs` copies `content/generated/docs/` → `src/content/docs/` and injects YAML frontmatter
- Placeholder pages demonstrate all component variants: asides (note/tip/caution/danger), tabs, cards, code blocks, Mermaid diagrams
- Sitemap generated at build time
- Semantic HTML output (inherent to Starlight)
- `site` and `base` configured for GitHub Pages at `gsd-build.github.io/gsd2-guide`

## Proof Level

- This slice proves: integration (Starlight customization ceiling risk — can the terminal-native design be achieved within Starlight's CSS variable + component override system?)
- Real runtime required: yes (dev server + production build)
- Human/UAT required: yes (design quality review per R006 — "craft feel")

## Verification

- `npm run dev` starts without errors and serves on localhost
- `npm run build` completes without errors, producing `dist/` directory
- `node scripts/prebuild.mjs` copies S01 docs and injects frontmatter without errors
- `find dist/ -name "*.html" | wc -l` returns > 10 (placeholder + generated pages render)
- `test -f dist/sitemap-index.xml` — sitemap exists
- Visual check: dark theme renders with custom fonts and terminal aesthetic (not default Starlight blue)
- Mermaid diagram on placeholder page renders as SVG (check for `<svg>` in output HTML)
- Pagefind search works: `test -d dist/pagefind/` and index files exist

## Integration Closure

- Upstream surfaces consumed: `content/generated/docs/` (126 markdown files from S01), `content/generated/commands.json`, `content/generated/skills.json`, `content/generated/extensions.json`, `content/generated/agents.json`, `content/generated/releases.json`
- New wiring introduced in this slice: `scripts/prebuild.mjs` (content bridge), `astro.config.mjs` (site config), custom Starlight component overrides, `npm run dev` / `npm run build` / `npm run preview` scripts
- What remains before the milestone is truly usable end-to-end: S03 (quick-reference pages from JSON data), S04 (deep-dive pages from generated docs), S05 (changelog + version display), S06 (update pipeline + deployment)

## Tasks

- [x] **T01: Initialize Astro + Starlight with minimal running dev server** `est:45m`
  - Why: Everything else depends on a working Astro/Starlight project. This gets the foundation in place — dependencies, config, content collection, and a minimal index page that proves `npm run dev` works.
  - Files: `package.json`, `astro.config.mjs`, `src/content.config.ts`, `src/content/docs/index.mdx`, `tsconfig.json`, `.gitignore`
  - Do: Install Astro 6, Starlight 0.38, and `@pasqal-io/starlight-client-mermaid` as dependencies. Create `astro.config.mjs` with Starlight integration (title, sidebar placeholder, site/base for GitHub Pages, Mermaid plugin). Create `src/content.config.ts` with `docsLoader()` + `docsSchema()`. Create minimal `src/content/docs/index.mdx` landing page. Create `tsconfig.json` extending Astro's strict preset. Update `.gitignore` to ignore `.astro/` build cache and `src/content/docs/generated/` (but NOT the placeholder pages). Add `dev`, `build`, `preview` scripts to `package.json`.
  - Verify: `npm run dev` starts on localhost without errors; visiting the URL shows the default Starlight page with the index content
  - Done when: `npm run dev` starts cleanly, index page renders, `npm run build` produces `dist/` without errors

- [x] **T02: Apply terminal-native dark theme with distinctive fonts and bold color palette** `est:1h`
  - Why: Custom design is the primary risk this slice retires (R006). Proves the Starlight customization ceiling is not a blocker. Must use the `frontend-design` skill for design quality. Dark-mode-first per D006.
  - Files: `src/styles/custom.css`, `src/styles/terminal.css`, `astro.config.mjs`, `package.json`
  - Do: Load the **frontend-design** skill before implementing. Install `@fontsource` packages for two distinctive fonts — a monospace for headings/code (e.g. JetBrains Mono, IBM Plex Mono, or similar characterful choice — NOT Inter/Roboto/Arial) and a clean sans for body (e.g. IBM Plex Sans, Geist Sans, or similar). Create `src/styles/custom.css` with CSS variable overrides targeting both `:root` and `:root[data-theme='dark']` — override Starlight's color tokens, font families, border radii, and spacing. Create `src/styles/terminal.css` with additional effects: custom scrollbar styling, code block enhancements, subtle glow/scanline effects for the terminal aesthetic, and any background textures. Wire both CSS files via `customCss` array in `astro.config.mjs`. The design must feel intentional, bold, and developer-focused — not a skin on default Starlight.
  - Verify: `npm run dev` shows the custom dark theme with distinctive fonts, non-default colors, and terminal aesthetic. Light mode should work but dark is the hero. No CSS variable override errors in console.
  - Done when: Visual inspection confirms the site does NOT look like default Starlight — distinctive fonts render, dark terminal palette is applied, code blocks have enhanced styling

- [ ] **T03: Add Header/Footer component overrides, prebuild script, and Mermaid wiring** `est:1h`
  - Why: Wires three integration surfaces that downstream slices consume: (1) Header with version slot for S05, (2) Footer for site branding, (3) prebuild script that bridges S01 extracted content into Starlight's `src/content/docs/` directory with injected frontmatter. Also verifies Mermaid rendering (R013).
  - Files: `src/components/Header.astro`, `src/components/Footer.astro`, `scripts/prebuild.mjs`, `astro.config.mjs`, `package.json`
  - Do: Create `src/components/Header.astro` that extends the default Starlight Header (import from `@astrojs/starlight/components/Header.astro`), adding a version display slot (can show placeholder "v0.0.0" text, S05 wires the real value). Create `src/components/Footer.astro` with custom footer content. Register both in `astro.config.mjs` under `starlight.components`. Create `scripts/prebuild.mjs` that: (a) reads all `.md` files from `content/generated/docs/` recursively, (b) for each file, extracts the first `# Heading` line as the title, (c) prepends YAML frontmatter (`---\ntitle: "..."\n---\n`) and strips the duplicate `# Heading` from the body, (d) writes the result to `src/content/docs/` preserving the directory structure, (e) creates subdirectories as needed. Add `prebuild` script to `package.json` and wire it: `"dev": "node scripts/prebuild.mjs && astro dev"`, `"build": "node scripts/prebuild.mjs && astro build"`. Verify Mermaid is properly configured (already added in T01 as a Starlight plugin).
  - Verify: `node scripts/prebuild.mjs` runs without errors and populates `src/content/docs/` with frontmatter-injected markdown files. `npm run dev` shows the custom header (with version placeholder) and footer. Mermaid code block renders as SVG on a test page.
  - Done when: Prebuild creates files in `src/content/docs/` with valid frontmatter, Header shows version slot, Footer renders custom content, `npm run build` succeeds with the prebuild content

- [ ] **T04: Create placeholder content pages demonstrating all component variants** `est:45m`
  - Why: Validates the full stack works together and provides a reference for downstream slices (S03, S04, S05). Demonstrates every component variant that real content will use. Proves Pagefind search works (R009) and sitemap generates (R012).
  - Files: `src/content/docs/index.mdx` (enhance), `src/content/docs/placeholder/components.mdx`, `src/content/docs/placeholder/diagrams.mdx`, `src/content/docs/placeholder/code-examples.mdx`, `astro.config.mjs` (sidebar update)
  - Do: Create placeholder pages in `src/content/docs/placeholder/` demonstrating: (1) `components.mdx` — all Starlight aside variants (note, tip, caution, danger), tabs component, card/CardGrid layout, and inline links. (2) `diagrams.mdx` — multiple Mermaid diagram types (flowchart, sequence diagram, state diagram) to prove rendering works. (3) `code-examples.mdx` — ExpressiveCode code blocks with syntax highlighting for multiple languages, line highlighting, file names, and diff markers. Enhance `index.mdx` to be a proper landing page with hero content and links to placeholder sections. Update sidebar config in `astro.config.mjs` to include the placeholder group. Run `npm run build` and verify: sitemap exists at `dist/sitemap-index.xml`, Pagefind index exists at `dist/pagefind/`, all placeholder pages render as HTML without errors, Mermaid SVGs are present in output.
  - Verify: `npm run build` succeeds. `test -f dist/sitemap-index.xml` passes. `test -d dist/pagefind` passes. `find dist/ -name "*.html" | wc -l` returns > 5. `grep -l "mermaid" dist/placeholder/diagrams/index.html` finds Mermaid content.
  - Done when: Production build succeeds with all placeholder pages, Pagefind search index generated, sitemap present, Mermaid diagrams render, all component variants display correctly

## Observability / Diagnostics

- **Dev server health:** `npm run dev` emits startup URL and port to stdout — watch for `Local http://localhost:` line as readiness signal.
- **Build success:** `npm run build` exits 0 and writes `dist/` with HTML files. Non-zero exit + stderr indicates failure.
- **Prebuild pipeline:** `node scripts/prebuild.mjs` logs copied file count to stdout. Missing source directory → non-zero exit.
- **Mermaid rendering:** Grep built HTML for `<svg` inside Mermaid containers — absence means plugin misconfiguration.
- **Pagefind index:** `test -d dist/pagefind && ls dist/pagefind/*.js` — empty means Pagefind didn't run.
- **Sitemap:** `test -f dist/sitemap-index.xml` — absence means `site` config is missing or wrong.
- **CSS variable overrides:** Browser DevTools → computed styles on `html[data-theme='dark']` — check font-family and color tokens differ from Starlight defaults.
- **Content collection errors:** Astro surfaces schema validation errors at build time in stderr with file path + line number.
- **Failure artifacts:** Astro writes `.astro/` cache; deleting it (`rm -rf .astro`) resolves stale-cache build failures.
- **Redaction:** No secrets in this slice. All config is public.

## Files Likely Touched

- `package.json` — Astro/Starlight deps, font packages, scripts
- `astro.config.mjs` — Starlight config, customCss, components, sidebar, site/base
- `src/content.config.ts` — Content collection with docsLoader/docsSchema
- `src/content/docs/index.mdx` — Landing page
- `src/content/docs/placeholder/components.mdx` — Component variant demos
- `src/content/docs/placeholder/diagrams.mdx` — Mermaid diagram demos
- `src/content/docs/placeholder/code-examples.mdx` — Code block demos
- `src/styles/custom.css` — CSS variable overrides for dark terminal theme
- `src/styles/terminal.css` — Terminal-specific effects and enhancements
- `src/components/Header.astro` — Custom header with version slot
- `src/components/Footer.astro` — Custom footer
- `scripts/prebuild.mjs` — Content bridge: generated docs → Starlight content dir
- `tsconfig.json` — TypeScript config
- `.gitignore` — Updated for .astro/ and generated content paths
