---
id: T03
parent: S02
milestone: M001
provides:
  - Custom Header component with version badge slot (placeholder "v0.0.0" for S05)
  - Custom Footer component with site branding
  - Prebuild script that bridges 126 S01 docs into Starlight content directory with injected YAML frontmatter
  - Manifest-based cleanup to avoid deleting non-generated files (placeholder pages)
key_files:
  - src/components/Header.astro
  - src/components/Footer.astro
  - scripts/prebuild.mjs
  - astro.config.mjs
  - package.json
key_decisions:
  - "Prebuild uses .generated-manifest.json to track its own files — only cleans files it created, safe for T04 placeholder pages"
  - "Version badge uses fixed positioning in top-right with terminal-themed border — S05 replaces the hardcoded v0.0.0"
  - "Title extraction strips leading # heading and uses it as frontmatter title to prevent Starlight duplicate h1"
patterns_established:
  - "Starlight component overrides use import from @astrojs/starlight/components/X.astro + wrapper pattern"
  - "Prebuild script runs before both dev and build via && chaining in package.json scripts"
  - "Generated content tracked via manifest JSON — enables idempotent re-runs without collateral deletion"
observability_surfaces:
  - "scripts/prebuild.mjs logs 'Prebuild complete: N files processed' to stdout; non-zero exit on errors"
  - "src/content/docs/.generated-manifest.json lists all generated files with timestamp — inspect for coverage"
  - "Version badge v0.0.0 visible in browser header — absence means component override wiring broken"
  - "Footer 'Built with GSD · Powered by Starlight' visible at page bottom — absence means Footer override missing"
duration: 15m
verification_result: passed
completed_at: 2026-03-17T10:41:00+11:00
blocker_discovered: false
---

# T03: Add Header/Footer Component Overrides, Prebuild Script, and Mermaid Wiring

**Implemented Header/Footer component overrides with terminal-themed version badge and custom footer, plus a content bridge script that copies 126 S01 docs into Starlight with injected YAML frontmatter and stripped duplicate headings.**

## What Happened

Created three integration surfaces:

1. **Header.astro** — Wraps the default Starlight Header component and adds a fixed-position version badge ("v0.0.0") in the top-right corner. Styled with the terminal theme variables (phosphor green border, accent-low background, monospace font). S05 will replace the hardcoded version.

2. **Footer.astro** — Custom footer with "Built with GSD · Powered by Starlight" branding. Uses monospace font, muted colors, and theme CSS variables for consistent terminal aesthetic.

3. **prebuild.mjs** — The content bridge script that:
   - Reads all 126 `.md` files from `content/generated/docs/` recursively
   - Extracts the first `# Heading` line as the YAML frontmatter `title`
   - Strips that heading from the body to prevent Starlight rendering a duplicate `<h1>`
   - Handles edge cases: files with no heading (derives title from filename), files with existing frontmatter (passes through), YAML-unsafe characters in titles (escaped)
   - Writes a `.generated-manifest.json` tracking all generated files
   - Cleans only its own files on re-run (manifest-based), never touching placeholder pages
   - Cleans empty directories left behind after file removal

Both components registered in `astro.config.mjs` under `starlight.components`. Package.json scripts updated to chain prebuild before dev and build.

## Verification

- `node scripts/prebuild.mjs` → "Prebuild complete: 126 files processed" (exit 0)
- `find src/content/docs/ -name "*.md" | wc -l` → 126
- `head -5 src/content/docs/getting-started.md` → shows `---\ntitle: "Getting Started"\n---`
- `grep -c "^# " src/content/docs/getting-started.md` → 0 (heading stripped)
- `npm run build` → succeeded, 128 pages built in 5.54s
- `find dist/ -name "*.html" | wc -l` → 128
- `test -f dist/sitemap-index.xml` → PASS
- `test -d dist/pagefind` → PASS (4 JS files)
- Browser: version badge "v0.0.0" visible in header (PASS via browser_assert)
- Browser: footer "Built with GSD · Powered by Starlight" visible (PASS via browser_assert)
- Browser: Getting Started page renders with frontmatter title, no duplicate heading

### Slice-level verification status (T03 is task 3 of 4):

| Check | Status |
|-------|--------|
| `npm run dev` starts without errors | ✅ PASS |
| `npm run build` completes, producing `dist/` | ✅ PASS |
| `node scripts/prebuild.mjs` copies docs with frontmatter | ✅ PASS |
| `find dist/ -name "*.html" \| wc -l` > 10 | ✅ PASS (128) |
| `test -f dist/sitemap-index.xml` | ✅ PASS |
| Dark theme with custom fonts and terminal aesthetic | ✅ PASS (from T02) |
| Mermaid diagram renders as SVG | ⏳ Deferred to T04 (needs placeholder page with mermaid block) |
| Pagefind search works | ✅ PASS (index files exist) |

## Diagnostics

- **Prebuild health:** Run `node scripts/prebuild.mjs` — logs file count. Check `src/content/docs/.generated-manifest.json` for file list and timestamp.
- **Version badge:** Visible in browser top-right on every page. If missing, check `components.Header` in `astro.config.mjs`.
- **Footer:** Visible at bottom of every page. If missing, check `components.Footer` in `astro.config.mjs`.
- **Duplicate headings:** If any page shows two `<h1>` elements with the same text, the prebuild failed to strip the `#` heading for that file. Check the source file in `content/generated/docs/` and the processed output in `src/content/docs/`.
- **Content collection errors:** Malformed frontmatter surfaces in `npm run build` stderr with file path.

## Deviations

- Added `.generated-manifest.json` to `.gitignore` — not in plan but necessary to keep generated tracking files out of version control.
- Used `display: contents` wrapper pattern for Header instead of direct slot injection — Starlight's Header component renders better with this approach.
- `package.json` `build` script uses npm's `prebuild` lifecycle hook instead of explicit `&&` chain — avoids running the prebuild twice. `dev` still chains explicitly since `predev` isn't a standard npm lifecycle hook.

## Known Issues

- Minor warning during build: `gitignore` language not recognized by astro-expressive-code syntax highlighter in `ADR-001-branchless-worktree-architecture.md`. Benign — falls back to `txt`.
- None significant.

## Files Created/Modified

- `src/components/Header.astro` — Custom Header wrapping Starlight default, adds version badge
- `src/components/Footer.astro` — Custom Footer with GSD/Starlight branding
- `scripts/prebuild.mjs` — Content bridge: extracts titles, injects frontmatter, copies 126 docs
- `astro.config.mjs` — Added `components` config for Header and Footer overrides
- `package.json` — Added `prebuild` script, wired into `dev` and `build`
- `.gitignore` — Added entry for `.generated-manifest.json`
- `.gsd/milestones/M001/slices/S02/tasks/T03-PLAN.md` — Added Observability Impact section
