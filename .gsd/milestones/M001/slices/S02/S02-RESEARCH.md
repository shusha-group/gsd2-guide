# S02: Astro Site Scaffold with Custom Design — Research

**Date:** 2026-03-17
**Depth:** Deep research (high-risk slice, Starlight customization ceiling is a named risk)

## Summary

This slice scaffolds the entire Astro/Starlight site: project structure, custom terminal-native dark design, Mermaid diagram support, Pagefind search, and placeholder content demonstrating all component variants. It owns R006 (custom dark design), R009 (Pagefind search), R012 (semantic HTML/sitemap), and R013 (Mermaid diagrams).

The approach is straightforward: initialize Astro 6 + Starlight 0.38 into the existing project root, use Starlight's CSS variable system + component overrides for the terminal-native aesthetic, and integrate `@pasqal-io/starlight-client-mermaid` for diagram support. The highest risk — Starlight customization ceiling — is manageable because Starlight exposes CSS variables for every visual property, plus a component override system that lets you replace any built-in component with a custom `.astro` file. The terminal-native dark design can be achieved entirely within these mechanisms without ejecting from Starlight.

The key integration challenge is connecting S01's generated content (`content/generated/`) with Starlight's `docsLoader()`, which reads from `src/content/docs/`. This requires a build-time copy step or symlink. A prebuild script that copies/transforms generated content into `src/content/docs/` is cleanest — it can also inject missing frontmatter (S01 docs have no YAML frontmatter; Starlight requires at minimum a `title` field).

## Recommendation

**Initialize Starlight manually into the existing project** (not `create astro`), since we already have `package.json`, scripts, and S01 output. Add Astro 6 + Starlight 0.38 as dependencies, create the required `src/` directory structure, and configure `astro.config.mjs` with the custom design.

**For Mermaid:** Use `@pasqal-io/starlight-client-mermaid` — it's a Starlight plugin (not a remark/rehype plugin), supports Starlight ≥0.31, renders client-side (no Playwright dependency), and respects Starlight's dark/light theme switching.

**For fonts:** Use `@fontsource` packages via Starlight's `customCss` array. Pick a distinctive monospace for headings/code (e.g. JetBrains Mono or IBM Plex Mono) and a clean sans for body (e.g. IBM Plex Sans or Geist Sans). The frontend-design skill mandates avoiding generic choices like Inter/Roboto/Arial — choose characterful fonts that reinforce the terminal aesthetic.

**For the content bridge:** Add a `scripts/prebuild.mjs` that copies `content/generated/docs/` into `src/content/docs/` and injects frontmatter where missing (extracting the `# Title` from the first line). This runs before `astro build` or `astro dev`.

**For GitHub Pages:** Set `site` and `base` in `astro.config.mjs` for the `gsd-build.github.io/gsd2-guide` path. Astro's built-in sitemap generation handles R012.

## Implementation Landscape

### Key Files

- `astro.config.mjs` — Starlight integration config: title, sidebar, customCss, components overrides, expressiveCode, Mermaid plugin, site/base for GitHub Pages
- `src/content.config.ts` — Content collection definition using `docsLoader()` + `docsSchema()`
- `src/content/docs/index.mdx` — Landing/home page (Starlight requires this)
- `src/content/docs/placeholder/` — Placeholder pages demonstrating all component variants (callouts, tabs, cards, code blocks, Mermaid diagrams)
- `src/styles/custom.css` — CSS variable overrides for the terminal-native dark theme (colors, fonts, spacing, backgrounds)
- `src/styles/terminal.css` — Additional custom CSS for terminal-specific effects (scanline overlays, glow effects, custom scrollbar, code block styling)
- `src/components/Header.astro` — Component override for version display slot (consumed by S05)
- `src/components/Footer.astro` — Component override for custom footer
- `scripts/prebuild.mjs` — Copies `content/generated/docs/` → `src/content/docs/`, injects frontmatter
- `tsconfig.json` — TypeScript config (Astro requires this)
- `package.json` — Updated with astro/starlight deps and `dev`/`build`/`preview` scripts
- `.gitignore` — Updated to ignore `src/content/docs/` (generated) and `.astro/` (build cache)
- `public/` — Static assets (favicon, OG images)

### Build Order

1. **Astro + Starlight initialization** — Install deps, create `astro.config.mjs`, `src/content.config.ts`, `tsconfig.json`. Add a minimal `src/content/docs/index.mdx` placeholder. Verify `npm run dev` starts and renders.  
   *Why first: everything else depends on a running dev server.*

2. **Custom CSS theme** — Create `src/styles/custom.css` with CSS variable overrides for the dark terminal aesthetic. Wire up via `customCss` in astro config. Add `@fontsource` packages. Use the frontend-design skill guidelines (bold aesthetic, distinctive fonts, no generic AI look).  
   *Why second: design is the primary risk this slice retires. Prove it early.*

3. **Component overrides** — Create custom `Header.astro` (with version display slot) and `Footer.astro`. Configure in `starlight.components`.  
   *Why third: depends on base theme being stable.*

4. **Mermaid integration** — Add `@pasqal-io/starlight-client-mermaid` plugin. Create a placeholder page with Mermaid diagrams to verify rendering in both dark/light themes.  
   *Why fourth: independent of design, but needs the site running.*

5. **Prebuild script** — Create `scripts/prebuild.mjs` that copies generated content into `src/content/docs/` and injects frontmatter. Wire into package.json scripts.  
   *Why fifth: bridges S01 and S02 output. Needed before S03/S04 consume content.*

6. **Placeholder content pages** — Create demonstration pages showing all component variants: asides/callouts (note, tip, caution, danger), tabs, cards/CardGrid, code blocks with expressive code features, Mermaid diagrams, tables, and nested sidebar navigation.  
   *Why last: validates the full stack works together.*

### Verification Approach

- `npm run dev` starts dev server on localhost without errors
- `npm run build` produces a complete static site in `dist/`
- All placeholder pages render correctly (no 404s, no broken layouts)
- Mermaid diagrams render as SVG in both dark and light modes
- Pagefind search indexes placeholder content and returns results
- CSS variable overrides produce the terminal-native dark aesthetic (visual check)
- Sitemap is generated at `/sitemap-index.xml`
- The version display slot in the Header renders (can show placeholder text)
- `scripts/prebuild.mjs` successfully copies S01 content and injects frontmatter
- ExpressiveCode code blocks render with proper syntax highlighting and dark theme

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Mermaid diagrams | `@pasqal-io/starlight-client-mermaid` | Starlight plugin — respects theme switching, no Playwright dep, client-side rendering. Alternatives: `rehype-mermaid` needs Playwright for SSR, `astro-mermaid` has Astro 5 peer dep (incompatible with Astro 6). |
| Font loading | `@fontsource/*` packages | Starlight-native approach via `customCss`. Self-hosted, no Google Fonts GDPR issues, correct weight subsetting. |
| Search | Pagefind (built into Starlight) | Zero config. Starlight includes Pagefind out of the box — just works at build time. |
| Sitemap | Astro built-in | Set `site` in `astro.config.mjs` and sitemap is auto-generated. |
| Code highlighting | Expressive Code (built into Starlight) | Starlight bundles Expressive Code with Shiki. Configure via `expressiveCode` option. |

## Constraints

- **Starlight `docsLoader()` reads from `src/content/docs/` only** — Cannot point it at `content/generated/docs/`. Must copy/symlink content into the expected location. A prebuild script is the cleanest solution.
- **S01 extracted docs have no YAML frontmatter** — They start with `# Title`. Starlight requires at minimum a `title` field in frontmatter. The prebuild script must inject `---\ntitle: "..."\n---\n` by extracting the first `#` heading.
- **Astro 6 is required** — Starlight 0.38.1 has `peerDependencies: { astro: '^6.0.0' }`. Current Astro is 6.0.5.
- **`content/generated/` is gitignored** — Per D011, always regenerated from source. So `src/content/docs/` (the copy target) should also be gitignored for generated content. Placeholder pages that ship with S02 should live separately or be marked as non-generated.
- **Dark-mode-first per D006** — Starlight defaults to dark mode when user has system dark preference, but the design should be optimized for dark viewing. Light mode should work but dark is the hero.
- **Frontend-design skill is mandatory per R006 notes** — "Uses the frontend-design skill for high design quality." The skill requires: no generic AI aesthetic, distinctive fonts (NOT Inter/Roboto/Arial), bold color choices, and intentional design direction.

## Common Pitfalls

- **Starlight CSS variables have `dark` AND `light` variants** — Overriding `:root` alone only affects light mode. Dark mode uses `:root[data-theme='dark']`. For a dark-first design, set both, or set only dark if light mode is deprioritized.
- **Component override import paths** — When overriding a Starlight component, import the default with `import Default from '@astrojs/starlight/components/Header.astro'` (the actual component path, not the package export). Getting the path wrong produces a cryptic build error.
- **`docsLoader()` ID generation** — Starlight generates page IDs from file paths relative to `src/content/docs/`. Files like `01-what-are-extensions.md` produce slugs like `01-what-are-extensions`. The prebuild script should preserve the S01 directory structure so sidebar `autogenerate` works correctly.
- **Frontmatter `title` vs `#` heading** — If both frontmatter `title` and a `# Title` heading exist, Starlight renders the frontmatter title in the page header AND the markdown `# Title` as a duplicate. The prebuild should either strip the first `#` heading after extracting it as the frontmatter title, or set `title` in frontmatter and leave the `#` heading for content (Starlight handles this if the `title` field is set — it uses frontmatter and ignores the first `#`). **Testing needed** — Starlight may or may not auto-strip the duplicate. Safest: extract `#` heading → set as frontmatter `title` → strip it from the markdown body.
- **Nested sidebar groups need explicit label** — `autogenerate: { directory: 'extending-pi' }` will create links but needs a `label` for the group title. The subdirectory names from S01 (`extending-pi`, `building-coding-agents`, etc.) should map to readable sidebar labels.

## Open Risks

- **Font rendering on different OSes** — `@fontsource` fonts are self-hosted WOFF2 but may render differently across macOS/Windows/Linux. Low risk — standard web font behavior.
- **Mermaid client-side rendering performance** — Client-side Mermaid parsing on pages with many diagrams could cause layout shift. The `@pasqal-io/starlight-client-mermaid` plugin is relatively new (v0.1.0). May need to test with complex diagrams. Fallback: `rehype-mermaid` for SSR, but that adds Playwright as a build dependency.
- **Placeholder vs generated content coexistence** — Placeholder pages created in S02 live in `src/content/docs/`. When S03/S04 generate real content into the same directory, need to avoid collisions. Recommend: placeholders go in `src/content/docs/placeholder/` and are removed when real content arrives.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Astro/Starlight | `astrolicious/agent-skills@astro` | available (2.2K installs) — covers Astro project setup, components, deployment |
| Frontend design | `frontend-design` | installed — loaded and referenced throughout this research |

## Sources

- Starlight CSS variables and customCss (source: [Starlight docs — CSS customization](https://starlight.astro.build/guides/css-and-tailwind/))
- Starlight component overrides (source: [Starlight docs — Overriding components](https://starlight.astro.build/guides/overriding-components/))
- Starlight sidebar configuration (source: [Starlight docs — Sidebar](https://starlight.astro.build/guides/sidebar/))
- `@pasqal-io/starlight-client-mermaid` — Starlight plugin for client-side Mermaid, peer dep `@astrojs/starlight >=0.31` (source: [npm registry](https://www.npmjs.com/package/@pasqal-io/starlight-client-mermaid))
- `docsLoader()` reads from `src/content/docs/` only (source: [Starlight configuration reference](https://starlight.astro.build/reference/configuration/))
- Fontsource integration via `customCss` (source: [Starlight docs — Custom fonts](https://starlight.astro.build/guides/customization/#custom-fonts))
