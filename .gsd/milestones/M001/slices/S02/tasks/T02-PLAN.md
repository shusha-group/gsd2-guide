---
estimated_steps: 5
estimated_files: 4
---

# T02: Apply Terminal-Native Dark Theme with Distinctive Fonts and Bold Color Palette

**Slice:** S02 — Astro site scaffold with custom design
**Milestone:** M001

## Description

This is the design task — the primary risk this slice retires. The Starlight customization ceiling is a named milestone risk, and R006 requires a "custom dark-mode-first design with terminal-native aesthetic." The frontend-design skill is mandatory per R006 notes.

**Load the `frontend-design` skill** before implementing. The skill is at `/Users/davidspence/.gsd/agent/skills/frontend-design/SKILL.md`. Its key directives: choose distinctive fonts (NOT Inter/Roboto/Arial/system fonts), commit to a bold aesthetic direction, avoid generic AI aesthetics, use CSS variables for consistency, dominant colors with sharp accents.

**Design direction:** Terminal-native dark. Think phosphor-green-on-black CRT heritage reinterpreted for modern web — but NOT literally a terminal emulator. The dark foundation should feel like a developer tool: tight typography, high information density, code-heavy. The "craft feel" the user emphasized means intentional design choices, not defaults.

**Critical CSS variable pattern:** Starlight has separate selectors for light and dark mode. Dark mode uses `:root[data-theme='dark']`. For a dark-first design, BOTH must be set or dark mode will inherit Starlight defaults. Prioritize dark mode styling; light mode should be functional but dark is the hero.

## Steps

1. **Install font packages.** Choose two `@fontsource` packages — one monospace for headings and code, one sans-serif for body text. These must NOT be Inter, Roboto, Arial, or system fonts. Good choices include JetBrains Mono, IBM Plex Mono, Space Mono (for mono), and IBM Plex Sans, Geist Sans, Outfit (for sans). Install via npm:
   ```bash
   npm install @fontsource-variable/jetbrains-mono @fontsource-variable/outfit
   ```
   (Or substitute with other distinctive choices that reinforce the terminal aesthetic.)

2. **Create `src/styles/custom.css`** — the primary theme override file. This must:
   - Import the font CSS files at the top (e.g. `@import '@fontsource-variable/jetbrains-mono';`)
   - Override Starlight CSS variables under `:root` (light mode) and `:root[data-theme='dark']` (dark mode, the hero)
   - Dark mode variables to override:
     - `--sl-color-bg` — page background (very dark, near-black)
     - `--sl-color-bg-nav` — sidebar/nav background
     - `--sl-color-bg-sidebar` — sidebar background
     - `--sl-color-text` — primary text color
     - `--sl-color-text-accent` — accent text (the distinctive color — green, amber, cyan, etc.)
     - `--sl-color-accent-high` / `--sl-color-accent-low` — accent color range
     - `--sl-font` — body font family (the sans-serif choice)
     - `--sl-font-mono` — code font family (the monospace choice)
     - `--sl-text-xs` through `--sl-text-4xl` — tighten line heights for developer density
   - Light mode: set complementary but functional values (the dark-mode palette inverted or muted)
   - Border styles, border-radius (keep sharp/minimal for terminal feel)
   - Link colors, hover states

3. **Create `src/styles/terminal.css`** — additional terminal aesthetic effects:
   - Custom scrollbar styling (thin, colored to match accent)
   - Code block enhancements: custom background, border treatment, subtle glow or border-accent on `:hover`
   - Sidebar enhancements: tighter padding, active-link highlight style
   - Any subtle background textures or effects (noise overlay, subtle grid pattern) — keep performant
   - Custom selection color (`::selection`)
   - Heading styles: monospace font for headings, letter-spacing adjustments
   - Table styling: developer-tool-like grid appearance

4. **Wire CSS into Astro config.** Update `astro.config.mjs` to add both files to the `customCss` array:
   ```js
   starlight({
     // ...existing config...
     customCss: [
       './src/styles/custom.css',
       './src/styles/terminal.css',
     ],
   })
   ```

5. **Verify visually.** Run `npm run dev` and confirm:
   - Dark mode is the default and looks intentionally designed (not default Starlight blue)
   - Fonts are distinctive — headings use the monospace choice, body uses the sans choice
   - Code blocks have enhanced styling
   - Colors are cohesive and bold (dominant accent with sharp contrast)
   - Light mode toggle works and is functional (doesn't have to be beautiful, just usable)
   - No CSS errors in browser console

## Must-Haves

- [ ] Two distinctive `@fontsource` font packages installed (one mono, one sans — NOT Inter/Roboto/Arial)
- [ ] `src/styles/custom.css` overrides ALL key Starlight CSS variables for both dark and light modes
- [ ] `src/styles/terminal.css` adds terminal aesthetic effects (scrollbar, code blocks, selection, headings)
- [ ] Both CSS files wired into `astro.config.mjs` via `customCss`
- [ ] Dark mode renders with custom palette and fonts (visually distinct from default Starlight)
- [ ] No CSS errors in browser dev console

## Verification

- `npm run dev` renders the site with custom fonts and dark palette
- Dark mode does not look like default Starlight (blue accent replaced, fonts changed)
- `npm run build` still succeeds with the CSS changes
- Browser dev console shows no CSS-related errors

## Observability Impact

- **CSS variable overrides:** Browser DevTools → Computed Styles on `html[data-theme='dark']` should show custom `--sl-font`, `--sl-font-mono`, `--sl-color-bg`, and accent color tokens. If these still show Starlight defaults (e.g. blue accent, system fonts), the `customCss` wiring or variable names are wrong.
- **Font loading:** Network tab should show `.woff2` requests for JetBrains Mono and Outfit (or chosen fonts). Missing requests → font imports are broken or tree-shaken.
- **Build output:** `npm run build` exit code 0 confirms CSS parses without fatal errors. Stderr warnings about unknown properties or missing files indicate broken imports.
- **Console errors:** Browser console should be free of CSS-related errors (e.g. `@import` failures, missing font files). Check with `browser_get_console_logs`.
- **Visual regression signal:** A future agent can screenshot the dev server and compare against the terminal-native aesthetic description: near-black background, green/amber/cyan accent, monospace headings, tight line-heights. Default Starlight blue accent = regression.

## Inputs

- `astro.config.mjs` — from T01 (add `customCss` array)
- `package.json` — from T01 (add font deps)
- Working Astro/Starlight dev server from T01

## Expected Output

- `src/styles/custom.css` — Complete CSS variable override file for terminal-native dark theme
- `src/styles/terminal.css` — Terminal aesthetic effects and enhancements
- `astro.config.mjs` — Updated with `customCss` array
- `package.json` — Updated with `@fontsource` dependencies
