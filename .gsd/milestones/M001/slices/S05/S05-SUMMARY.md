---
id: S05
parent: M001
milestone: M001
provides:
  - Browsable changelog page rendering all 48 GitHub releases with expand/collapse, formatted dates, GitHub links, and markdown body content
  - Header version badge showing real latest release version (v2.22.0) from releases.json, linked to changelog
  - Sidebar Changelog navigation entry and home page Changelog LinkCard
  - ReleaseEntry.astro component for rendering individual release entries
  - .release-entry CSS rules matching the terminal theme aesthetic (dark + light)
requires:
  - slice: S01
    provides: content/generated/releases.json (structured release data from GitHub API)
  - slice: S02
    provides: Site scaffold with Header.astro, terminal theme CSS, Starlight sidebar configuration
affects:
  - S06
key_files:
  - src/components/ReleaseEntry.astro
  - src/content/docs/changelog.mdx
  - src/styles/terminal.css
  - src/components/Header.astro
  - astro.config.mjs
  - src/content/docs/index.mdx
key_decisions:
  - Used `marked` (v17) for markdown-to-HTML conversion in Astro frontmatter — lightweight, async API, avoids heavier remark/rehype pipeline
  - Made version badge a clickable anchor linking to /gsd2-guide/changelog/ (not a static display) for better discoverability
patterns_established:
  - ReleaseEntry.astro pattern: props-based Astro component using `set:html` for pre-converted markdown, `<details>/<summary>` for expand/collapse
  - Header.astro imports generated JSON data at build time — same pattern available for other generated content needing header display
  - `.release-entry` CSS follows `.ref-card` pattern but with left-border accent for visual hierarchy differentiation
observability_surfaces:
  - "Build-time release count: `grep -o '<details class=\"release-entry\"' dist/changelog/index.html | wc -l` — must return 48"
  - "Version badge check: `grep 'v2.22.0' dist/index.html` — confirms header wiring from releases.json"
  - "Placeholder elimination: `grep -c 'v0.0.0' dist/index.html` — must return 0"
  - "Changelog navigation: `grep -i 'changelog' dist/index.html` — confirms sidebar and home page links"
drill_down_paths:
  - .gsd/milestones/M001/slices/S05/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S05/tasks/T02-SUMMARY.md
duration: 20m
verification_result: passed
completed_at: 2026-03-17
---

# S05: Changelog & Release Tracking

**Browsable changelog page with all 48 GitHub releases (expand/collapse, dates, GitHub links, rendered markdown bodies) and live version badge (v2.22.0) in the site header linked to the changelog.**

## What Happened

Two tasks delivered the complete changelog and version display capability:

**T01 (12m)** built the changelog page. Installed `marked` v17 as a dependency. Created `ReleaseEntry.astro` — a props-based component that converts each release's body markdown to HTML via `await marked(body)`, formats dates with `toLocaleDateString`, and wraps everything in a `<details class="release-entry">` with the summary showing a version link to GitHub and the formatted date. The latest release (index 0) renders with `open` attribute so it's expanded by default. Created `changelog.mdx` that imports `releases.json` and maps over all 48 entries. Added ~200 lines of `.release-entry` CSS to `terminal.css` following the `.ref-card` pattern but with a green border-left accent for visual hierarchy.

**T02 (8m)** wired the header and navigation. Updated `Header.astro` to import `releases.json` and display `releases[0]?.tag_name` (v2.22.0) instead of the hardcoded "v0.0.0" placeholder. Converted the version badge from a non-interactive `<div>` to a clickable `<a>` linking to `/gsd2-guide/changelog/`. Added a top-level "Changelog" entry to the sidebar in `astro.config.mjs` (after Home). Added a Changelog `<LinkCard>` to the home page in the Deep-Dive Guides section.

Build produces 134 pages (up from 131 before S05 started — the changelog page plus Starlight's routing).

## Verification

All slice-level checks passed:

| Check | Result | Detail |
|-------|--------|--------|
| `npm run build` succeeds, 132+ pages | ✅ PASS | 134 pages |
| 48 releases on changelog | ✅ PASS | `grep -o '<details class="release-entry"' dist/changelog/index.html \| wc -l` → 48 |
| v2.22.0 on changelog page | ✅ PASS | Latest version present |
| v0.2.9 on changelog page | ✅ PASS | Oldest version present |
| v2.22.0 in header on home page | ✅ PASS | Version badge shows real version |
| v0.0.0 eliminated from home page | ✅ PASS | `grep -c 'v0.0.0' dist/index.html` → 0 |
| Changelog linked from home page | ✅ PASS | Sidebar entry + LinkCard both present |
| Changelog page exists | ✅ PASS | `dist/changelog/index.html` exists |
| Markdown body rendered as HTML | ✅ PASS | 44 `<h2>` tags in changelog output |
| GitHub release links | ✅ PASS | 48 links to `github.com/gsd-build/gsd-2/releases` |

Observability surfaces confirmed:
- Release count diagnostic returns 48 (note: raw `<details` count returns 58 due to Starlight sidebar — always scope with class name)
- Version badge grep confirms real version in header
- Placeholder grep confirms v0.0.0 fully eliminated

## Requirements Advanced

- R005 (Changelog from GitHub releases) — All 48 releases rendered with expand/collapse, dates, version links to GitHub, and markdown body content as rendered HTML. Added/Fixed/Changed sections from release notes display correctly.
- R010 (Current version prominently displayed) — Header shows v2.22.0 from releases.json, updated at build time. Badge links to changelog for discoverability.

## Requirements Validated

- R005 — Changelog page at `/changelog/` renders all 48 GitHub releases with version numbers, dates, GitHub links, expand/collapse, and rendered markdown bodies. Verified by build output + grep checks.
- R010 — Version v2.22.0 visible in site header, sourced from releases.json at build time. Placeholder v0.0.0 fully eliminated. Verified by grep on dist/index.html.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Version badge made into a clickable link to changelog (plan said "display" but didn't prohibit interactivity). This is a UX improvement, not a plan violation.
- Verification count for `<details>` elements needed scoping by class name (`<details class="release-entry"`) because Starlight sidebar contributes ~10 additional `<details>` elements. Plan's original grep was imprecise — documented in KNOWLEDGE.md.

## Known Limitations

- Release body markdown rendering uses `marked` which converts raw markdown to HTML. Any release notes with non-standard markdown (e.g., GitHub-specific admonitions) may not render perfectly.
- Version badge always shows `releases[0]?.tag_name` — assumes releases.json is sorted newest-first (which it is, from S01 extraction).

## Follow-ups

- none — S06 (update pipeline & deployment) is the natural next step and will wire the version update cycle end-to-end.

## Files Created/Modified

- `package.json` — added `marked` (v17.0.4) dependency
- `src/components/ReleaseEntry.astro` — new: renders a single release with details/summary, GitHub link, formatted date, and markdown body as HTML
- `src/content/docs/changelog.mdx` — new: changelog page importing releases.json and rendering all 48 releases
- `src/styles/terminal.css` — appended ~200 lines of `.release-entry` CSS (dark + light theme variants)
- `src/components/Header.astro` — imports releases.json, displays real version, badge is now a clickable link to changelog
- `astro.config.mjs` — added Changelog top-level sidebar entry after Home
- `src/content/docs/index.mdx` — added Changelog LinkCard in Deep-Dive Guides section

## Forward Intelligence

### What the next slice should know
- The changelog page and version badge are fully wired and building. S06 only needs to ensure `releases.json` gets refreshed by the update pipeline — no changelog-specific work needed in S06.
- The site now builds 134 pages. S06's broken link detection should account for this count.
- `marked` is the only new npm dependency from S05. It's used only in `ReleaseEntry.astro` frontmatter at build time — zero client-side JavaScript impact.

### What's fragile
- `releases.json` sort order assumption — ReleaseEntry expansion logic and Header version extraction both assume index 0 is the latest release. If S01's extraction ever changes sort order, both break silently (version badge shows wrong version, wrong release expanded).
- `marked` version — v17 has an async API (`await marked(body)`). If upgraded to a future major version, the API may change.

### Authoritative diagnostics
- `grep -o '<details class="release-entry"' dist/changelog/index.html | wc -l` — must return 48. If it returns less, releases.json is incomplete or ReleaseEntry.astro has a rendering error.
- `grep -c 'v0.0.0' dist/index.html` — must return 0. Non-zero means Header.astro import failed and the fallback is being used.
- Build failure from missing/malformed releases.json surfaces as an Astro import error in ReleaseEntry.astro frontmatter — not a silent failure.

### What assumptions changed
- Plan assumed `grep -o '<details'` would count only custom elements, but Starlight contributes ~10 sidebar `<details>`. Always use `grep -o '<details class="release-entry"'` for accurate counts. This was captured in KNOWLEDGE.md.
