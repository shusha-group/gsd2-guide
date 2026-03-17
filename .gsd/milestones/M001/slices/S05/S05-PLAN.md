# S05: Changelog & Release Tracking

**Goal:** Browsable release history page showing all 48 GitHub releases with expand/collapse, and the real version number displayed in the site header.
**Demo:** Navigate to `/gsd2-guide/changelog/` — see all 48 releases with dates, version links, and markdown bodies. The site header shows "v2.22.0" (the latest release) instead of "v0.0.0".

## Must-Haves

- Changelog page renders all 48 releases from `content/generated/releases.json`
- Each release shows version (linked to GitHub), formatted date, and body content as rendered HTML
- Releases use `<details>/<summary>` expand/collapse — latest expanded by default, rest collapsed
- Header version badge shows the real latest version from releases data (not "v0.0.0")
- Changelog is accessible from sidebar navigation and home page
- `npm run build` succeeds with the new page included

## Verification

- `npm run build` succeeds — page count increases (was 131, should be 132+)
- `grep -o '<details' dist/changelog/index.html | wc -l` returns 48 — all releases rendered
- `grep 'v2.22.0' dist/changelog/index.html` — latest version on changelog page
- `grep 'v0.2.9' dist/changelog/index.html` — oldest version on changelog page
- `grep 'v2.22.0' dist/index.html` — version badge in header on home page
- `grep -c 'v0.0.0' dist/index.html` returns 0 — placeholder version is gone
- `grep 'changelog' dist/index.html` — home page links to changelog

## Integration Closure

- Upstream surfaces consumed: `content/generated/releases.json` (from S01), site scaffold with Header.astro and terminal theme CSS (from S02)
- New wiring introduced: `marked` npm dependency for markdown-to-HTML conversion in ReleaseEntry component, releases.json import in Header.astro
- What remains before the milestone is truly usable end-to-end: S06 (update pipeline & deployment)

## Tasks

- [ ] **T01: Build changelog page with release entry component** `est:30m`
  - Why: Delivers R005 — the browsable changelog aggregating all 48 GitHub releases with Added/Fixed/Changed sections rendered from the body markdown field.
  - Files: `src/components/ReleaseEntry.astro`, `src/content/docs/changelog.mdx`, `src/styles/terminal.css`, `package.json`
  - Do: Install `marked`. Create ReleaseEntry.astro component that receives release data as props, converts body markdown to HTML via `marked`, renders version heading linked to GitHub, formatted date, and body content in a `<details>/<summary>` wrapper. Create changelog.mdx that imports releases.json and renders all 48 releases. Add `.release-entry` CSS rules to terminal.css following the `.ref-card` pattern. Latest release (index 0) has `open` attribute on `<details>`.
  - Verify: `npm run build` succeeds. `grep -o '<details' dist/changelog/index.html | wc -l` returns 48. `grep 'v2.22.0' dist/changelog/index.html` finds latest version. `grep 'v0.2.9' dist/changelog/index.html` finds oldest version.
  - Done when: Changelog page renders all 48 releases with expand/collapse, dates, GitHub links, and rendered markdown body content.

- [ ] **T02: Wire header version badge and add changelog navigation links** `est:15m`
  - Why: Delivers R010 (version in header) and completes navigation — sidebar entry and home page link to changelog.
  - Files: `src/components/Header.astro`, `astro.config.mjs`, `src/content/docs/index.mdx`
  - Do: Update Header.astro to import `releases.json` and display `releases[0].tag_name` instead of hardcoded "v0.0.0". Add `{ label: 'Changelog', link: '/changelog/' }` to the sidebar in astro.config.mjs (as a top-level entry after Home). Add a Changelog LinkCard to the home page index.mdx.
  - Verify: `npm run build` succeeds. `grep 'v2.22.0' dist/index.html` finds version in header. `grep -c 'v0.0.0' dist/index.html` returns 0. `grep 'changelog' dist/index.html` finds link.
  - Done when: Header shows real version "v2.22.0", sidebar has Changelog entry, home page links to changelog.

## Files Likely Touched

- `package.json` — add `marked` dependency
- `src/components/ReleaseEntry.astro` — new: renders a single release entry
- `src/content/docs/changelog.mdx` — new: browsable changelog page
- `src/styles/terminal.css` — add `.release-entry` CSS rules
- `src/components/Header.astro` — wire real version from releases.json
- `astro.config.mjs` — add changelog sidebar entry
- `src/content/docs/index.mdx` — add changelog link card
