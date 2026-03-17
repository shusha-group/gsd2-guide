---
id: T02
parent: S02
milestone: M001
provides:
  - Terminal-native dark theme with phosphor-green accent palette on near-black backgrounds
  - JetBrains Mono Variable font for headings and code, Outfit Variable for body text
  - Complete Starlight CSS variable overrides for both dark (hero) and light (functional) modes
  - Terminal aesthetic effects layer (scrollbar, code blocks, selection, headings, tables, scanlines)
key_files:
  - src/styles/custom.css
  - src/styles/terminal.css
  - astro.config.mjs
key_decisions:
  - "Phosphor green (#39FF14) as primary accent color — CRT heritage reinterpreted for modern web"
  - "JetBrains Mono Variable for headings + code, Outfit Variable for body — both distinctive, variable-weight fonts"
  - "Green-tinted gray scale throughout — all grays carry subtle green undertone for cohesion"
patterns_established:
  - "Starlight dark mode overrides use :root[data-theme='dark'] selector; light uses :root[data-theme='light']"
  - "CSS split into two layers: custom.css (variables + typography) and terminal.css (effects + component styles)"
  - "Expressive Code theme variables prefixed with --ec-* for code block customization"
observability_surfaces:
  - "Browser DevTools computed styles on html[data-theme='dark'] show custom --sl-font, --sl-color-bg, --sl-color-text-accent values"
  - "Network tab shows .woff2 requests for JetBrains Mono and Outfit font files"
  - "npm run build exit 0 confirms CSS parses without fatal errors"
duration: 15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Apply Terminal-Native Dark Theme with Distinctive Fonts and Bold Color Palette

**Implemented phosphor-green-on-black terminal-native dark theme with JetBrains Mono + Outfit fonts, fully overriding Starlight's default blue palette.**

## What Happened

Loaded the `frontend-design` skill to guide design decisions. Installed `@fontsource-variable/jetbrains-mono` and `@fontsource-variable/outfit` as font packages — both are distinctive variable-weight fonts that reinforce the developer-tool aesthetic without being generic.

Created `src/styles/custom.css` as the primary theme override:
- Imports both font packages via `@import`
- Dark mode (hero): near-black backgrounds (#0a0e0a), phosphor green accent (#39FF14), green-tinted gray scale, custom link styles with bottom-border transitions
- Light mode (functional): inverted green palette with muted tones, readable contrast
- Typography: Outfit Variable for body, JetBrains Mono Variable for code/mono, tightened line heights, 2px border-radius for terminal sharpness
- Inline code styling for both modes

Created `src/styles/terminal.css` as the effects layer:
- Custom thin scrollbar colored to match accent
- Selection color with green tint
- Monospace headings (JetBrains Mono) with letter-spacing and subtle text-shadow glow on h1
- Code block enhancements via Expressive Code variables: custom backgrounds, border treatment, hover border accent
- Sidebar tightening: smaller font, active-link green left-border highlight
- Developer-grid table styling: monospace font, uppercase headers, row hover
- Subtle scanline texture overlay (repeating-linear-gradient, mix-blend-mode overlay, pointer-events none)
- Blockquote and horizontal rule styling
- Site title forced to mono font with green color
- Accessible focus-visible outlines in green

Wired both CSS files into `astro.config.mjs` via `customCss` array in the Starlight config.

## Verification

All checks passed:

- **CSS variables applied:** Browser DevTools confirmed `--sl-color-bg: #0a0e0a`, `--sl-color-text-accent: #39ff14`, `--sl-font` includes Outfit Variable, `--sl-font-mono` includes JetBrains Mono Variable
- **Fonts loaded:** `document.fonts` API confirmed both `JetBrains Mono Variable` and `Outfit Variable` active
- **Dark mode visual:** Screenshot confirms near-black background, green nav title, green theme selector outline — clearly NOT default Starlight blue
- **Light mode toggle:** Theme selector switches to light mode successfully with muted green palette
- **No CSS errors:** Browser console shows zero CSS-related errors (only a pre-existing missing favicon.svg 404)
- **Build succeeds:** `npm run build` exits 0, produces 2 HTML pages, sitemap, and Pagefind index
- **Slice checks:** sitemap exists ✓, pagefind directory exists ✓, HTML page count = 2 (expected at T02 stage)

## Diagnostics

- **CSS variable inspection:** Open DevTools → select `<html>` → Computed Styles → filter for `--sl-`. If `--sl-color-bg` is not `#0a0e0a` in dark mode, the customCss wiring is broken.
- **Font loading:** Network tab → filter `.woff2` → should see requests to JetBrains Mono and Outfit files. If missing, check `@import` paths in custom.css.
- **Scanline overlay:** The `body::before` pseudo-element creates a fixed overlay. If it causes performance issues, it can be removed from terminal.css without affecting the theme.
- **Theme toggle:** Starlight's `<starlight-theme-select>` element controls `data-theme` attribute on `<html>`. Both `dark` and `light` selectors must be present in custom.css or mode switching breaks.

## Deviations

None. Implementation followed the plan exactly.

## Known Issues

- Missing `favicon.svg` causes a 404 in dev console — pre-existing from T01, not introduced by this task
- Homepage uses Starlight's hero layout which has its own background band — the dark theme applies but the hero section has Starlight's built-in gradient treatment. This will be addressed when the index page is enhanced in T04.

## Files Created/Modified

- `src/styles/custom.css` — Primary CSS variable override file (font imports, dark/light mode tokens, typography, link styles, inline code)
- `src/styles/terminal.css` — Terminal aesthetic effects (scrollbar, selection, headings, code blocks, sidebar, tables, scanlines, blockquotes, focus styles)
- `astro.config.mjs` — Added `customCss` array pointing to both CSS files
- `package.json` — Added `@fontsource-variable/jetbrains-mono` and `@fontsource-variable/outfit` dependencies
- `.gsd/milestones/M001/slices/S02/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix)
