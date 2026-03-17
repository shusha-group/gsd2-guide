---
estimated_steps: 5
estimated_files: 5
---

# T04: Create Placeholder Content Pages Demonstrating All Component Variants

**Slice:** S02 — Astro site scaffold with custom design
**Milestone:** M001

## Description

Creates placeholder pages that demonstrate every component variant downstream slices (S03, S04, S05) will use. This validates the full stack: custom theme + component overrides + Mermaid rendering + ExpressiveCode + Starlight built-in components. Also proves Pagefind search indexing (R009) and sitemap generation (R012) work at build time.

These placeholder pages live in `src/content/docs/placeholder/` — a directory that will be removed when real content arrives in S03/S04. They serve as both validation and as a reference for executors building real content pages.

## Steps

1. **Enhance `src/content/docs/index.mdx`** — Transform the minimal landing page from T01 into a proper hero page:
   - Use Starlight's `splash` template with hero section
   - Add descriptive tagline about GSD 2
   - Include link cards pointing to the placeholder sections
   - Import and use Starlight's `<CardGrid>` and `<Card>` components
   - This page should feel like a real documentation landing page, not a stub

2. **Create `src/content/docs/placeholder/components.mdx`** — Demonstrates Starlight built-in components:
   - All four aside/callout variants: `:::note`, `:::tip`, `:::caution`, `:::danger` with meaningful example content
   - Tabs component: `<Tabs>` / `<TabItem>` showing e.g. npm/yarn/pnpm install commands
   - Card and CardGrid: `<Card>` with title and icon, arranged in a `<CardGrid>`
   - Badge component if available
   - Link cards
   - Frontmatter: `title: "Component Gallery"`, `description: "All Starlight component variants"`

3. **Create `src/content/docs/placeholder/diagrams.mdx`** — Demonstrates Mermaid diagram rendering (R013):
   - Flowchart diagram (GSD auto-mode workflow)
   - Sequence diagram (agent interaction)
   - State diagram (slice lifecycle)
   - Each in a ````mermaid` code fence (this is how `@pasqal-io/starlight-client-mermaid` processes them)
   - Frontmatter: `title: "Diagrams"`, `description: "Mermaid diagram examples"`

4. **Create `src/content/docs/placeholder/code-examples.mdx`** — Demonstrates ExpressiveCode features:
   - Code blocks in multiple languages: JavaScript, TypeScript, Bash, JSON, YAML
   - Line highlighting: `{4-6}` syntax
   - File name labels: `title="astro.config.mjs"`
   - Diff markers: lines starting with `+` and `-`
   - Frame types: code vs terminal
   - Frontmatter: `title: "Code Examples"`, `description: "ExpressiveCode code block features"`

5. **Update sidebar and run final build verification:**
   - Update `astro.config.mjs` sidebar to include:
     ```js
     sidebar: [
       { label: 'Home', link: '/' },
       {
         label: 'Placeholder',
         items: [
           { label: 'Components', link: '/placeholder/components/' },
           { label: 'Diagrams', link: '/placeholder/diagrams/' },
           { label: 'Code Examples', link: '/placeholder/code-examples/' },
         ],
       },
       {
         label: 'Documentation',
         autogenerate: { directory: 'getting-started' },
       },
     ]
     ```
     Also add autogenerate entries for the S01 content subdirectories (building-coding-agents, extending-pi, etc.) so the prebuild content appears in the sidebar.
   - Run `npm run build` (which runs prebuild first) and verify:
     - Build completes without errors
     - `dist/sitemap-index.xml` exists (R012)
     - `dist/pagefind/` directory exists with index files (R009)
     - All placeholder pages render: `dist/placeholder/components/index.html`, `dist/placeholder/diagrams/index.html`, `dist/placeholder/code-examples/index.html`
     - Mermaid content present in diagrams page: check for mermaid-related markup in the HTML output
     - Total HTML page count > 10 (placeholder + generated content from prebuild)

## Must-Haves

- [ ] `src/content/docs/index.mdx` is a proper landing page with hero and card links
- [ ] `src/content/docs/placeholder/components.mdx` demonstrates all aside variants, tabs, cards
- [ ] `src/content/docs/placeholder/diagrams.mdx` has at least 3 Mermaid diagram types
- [ ] `src/content/docs/placeholder/code-examples.mdx` shows ExpressiveCode features (highlighting, filenames, diff)
- [ ] Sidebar config includes placeholder group and autogenerate entries for S01 content
- [ ] `npm run build` succeeds
- [ ] Sitemap exists at `dist/sitemap-index.xml`
- [ ] Pagefind index exists at `dist/pagefind/`
- [ ] All placeholder pages render as HTML in `dist/`

## Verification

- `npm run build` exits with code 0
- `test -f dist/sitemap-index.xml && echo "sitemap OK"` — passes
- `test -d dist/pagefind && echo "pagefind OK"` — passes
- `find dist -name "*.html" | wc -l` returns > 10
- `test -f dist/gsd2-guide/placeholder/components/index.html || test -f dist/placeholder/components/index.html` — one of these exists (path depends on base config)
- `test -f dist/gsd2-guide/placeholder/diagrams/index.html || test -f dist/placeholder/diagrams/index.html` — diagrams page exists
- Mermaid content present: `grep -l "mermaid" dist/gsd2-guide/placeholder/diagrams/index.html 2>/dev/null || grep -l "mermaid" dist/placeholder/diagrams/index.html 2>/dev/null`

## Inputs

- `astro.config.mjs` — from T03 (add sidebar entries)
- `src/styles/custom.css`, `src/styles/terminal.css` — from T02 (theme applied)
- `src/components/Header.astro`, `src/components/Footer.astro` — from T03
- `scripts/prebuild.mjs` — from T03 (generates S01 content into src/content/docs/)
- Working full Astro/Starlight site from T01 + T02 + T03

## Expected Output

- `src/content/docs/index.mdx` — Enhanced landing page with hero and navigation cards
- `src/content/docs/placeholder/components.mdx` — All component variant demonstrations
- `src/content/docs/placeholder/diagrams.mdx` — Mermaid diagram demonstrations
- `src/content/docs/placeholder/code-examples.mdx` — ExpressiveCode feature demonstrations
- `astro.config.mjs` — Updated sidebar with placeholder group and S01 content autogenerate entries
- `dist/` — Complete production build with all pages, sitemap, and Pagefind index
