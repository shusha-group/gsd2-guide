---
estimated_steps: 8
estimated_files: 6
---

# T01: Astro/Starlight project scaffold with terminal-native dark theme

**Slice:** S01 — Commands quick-reference with extraction pipeline and custom design
**Milestone:** M001

## Description

Initialize the Astro + Starlight project with all foundational configuration: custom terminal-native dark theme, Mermaid diagram support, Pagefind search, sidebar structure, and sitemap. This is the base everything else builds on. Use the frontend-design skill for design quality — the theme should feel like a CLI tool's documentation, not a generic docs template.

## Steps

1. Initialize Astro project with Starlight starter template (`npm create astro@latest -- --template starlight`)
2. Install dependencies: `@astrojs/starlight`, `astro-expressive-code`, Mermaid integration (`rehype-mermaid` or `remark-mermaid`), `@astrojs/sitemap`
3. Configure `astro.config.mjs` — Starlight with: title "GSD 2", sidebar groups (Reference, Guides, Advanced, Changelog), social links (GitHub, Discord, npm), custom head tags, sitemap, site URL for GitHub Pages
4. Read the frontend-design skill before designing the theme
5. Create `src/styles/custom.css` — terminal-native dark palette: near-black backgrounds (#0a0a0f, #12121a), monospace font for code/headings, terminal green (#00ff88) and cyan (#00ccff) accent colors, tighter line-height, subtle borders with low-opacity white. Override Starlight CSS custom properties.
6. Create placeholder `src/content/docs/index.mdx` with a welcome message and a test Mermaid diagram to verify the integration works
7. Configure `public/` directory structure and favicon
8. Verify: `npm run dev` serves the site, custom theme renders, Mermaid diagram shows as SVG

## Must-Haves

- [ ] Astro + Starlight project builds and serves via `npm run dev`
- [ ] Custom dark theme is visually distinct from default Starlight (dark backgrounds, terminal accent colors, monospace accents)
- [ ] Mermaid diagram renders as SVG on the placeholder page
- [ ] Sidebar navigation structure has placeholder groups for Reference, Guides, Advanced, Changelog
- [ ] Pagefind search is enabled (built-in to Starlight)
- [ ] Sitemap generation is configured

## Verification

- `npm run dev` starts without errors and serves on localhost
- Browser shows custom dark theme, not Starlight default blue/white
- Mermaid diagram on index page renders as SVG (not raw markdown code block)
- Sidebar shows navigation groups

## Inputs

- Starlight documentation (Context7) for configuration options and theme customization
- Frontend-design skill for design quality guidance
- D001 (Astro + Starlight), D006 (terminal-native dark with visual aids) from DECISIONS.md

## Expected Output

- `package.json` — Astro project with all dependencies
- `astro.config.mjs` — Fully configured Starlight with sidebar, plugins, site URL
- `src/styles/custom.css` — Terminal-native dark theme overrides
- `src/content/docs/index.mdx` — Placeholder page with Mermaid test
- `tsconfig.json` — TypeScript config for Astro
