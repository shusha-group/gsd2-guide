---
id: T01
parent: S05
milestone: M001
provides:
  - Changelog page rendering all 48 GitHub releases with expand/collapse, formatted dates, GitHub links, and markdown body content
  - ReleaseEntry.astro component for rendering individual release entries
  - .release-entry CSS rules matching the terminal theme aesthetic (dark + light)
key_files:
  - src/components/ReleaseEntry.astro
  - src/content/docs/changelog.mdx
  - src/styles/terminal.css
key_decisions:
  - Used `marked` (v17) for markdown-to-HTML conversion in Astro frontmatter — lightweight, async API via `await marked(body)`
  - Used green border-left accent (instead of full border) to visually distinguish release entries from ref-cards while following the same pattern
patterns_established:
  - ReleaseEntry.astro pattern: props-based Astro component using `set:html` for pre-converted markdown, `<details>/<summary>` for expand/collapse
  - `.release-entry` CSS follows `.ref-card` pattern but with left-border accent for visual hierarchy
observability_surfaces:
  - Build-time: `grep -o '<details class="release-entry"' dist/changelog/index.html | wc -l` returns 48
  - Build-time: `grep 'github.com/gsd-build/gsd-2/releases' dist/changelog/index.html` confirms GitHub links
duration: 12m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Build changelog page with release entry component

**Changelog page renders all 48 GitHub releases with expand/collapse details, formatted dates, version links to GitHub, and markdown body content converted to HTML.**

## What Happened

1. Installed `marked` (v17.0.4) as a dependency for markdown-to-HTML conversion.
2. Created `src/components/ReleaseEntry.astro` — receives release props, converts body markdown via `await marked(body)`, formats dates with `toLocaleDateString`, renders in a `<details class="release-entry">` wrapper with summary containing version link and date.
3. Created `src/content/docs/changelog.mdx` — imports releases.json, maps over all 48 releases rendering ReleaseEntry components with `isLatest={index === 0}` controlling the open state.
4. Added `.release-entry` CSS rules to `src/styles/terminal.css` — dark theme (green-on-black, #0d120d background, #39FF14 accents, green border-left) and light theme (green-on-white, #f0f6f0 background, #0d6e0d accents). Includes styling for rendered markdown body (h2, h3, ul, li, code, a, strong).
5. Build succeeded with 134 pages. All verification checks passed.

## Verification

- `npm run build` exits 0 — 134 pages built ✓
- `test -f dist/changelog/index.html` — page exists ✓
- `grep -o '<details class="release-entry"' dist/changelog/index.html | wc -l` returns 48 ✓
- `grep 'v2.22.0' dist/changelog/index.html` — latest version present ✓
- `grep 'v0.2.9' dist/changelog/index.html` — oldest version present ✓
- `grep 'github.com/gsd-build/gsd-2/releases' dist/changelog/index.html` — 48 GitHub links present ✓
- Browser: v2.22.0 expanded by default, all others collapsed ✓
- Browser: 48 release-entry details elements, 48 GitHub links ✓
- Browser: dates formatted correctly (e.g. "March 17, 2026") ✓

### Slice-Level Checks (Partial — T01 of 2)

| Check | Result | Notes |
|-------|--------|-------|
| Build succeeds, page count 132+ | ✅ PASS | 134 pages |
| 48 releases on changelog | ✅ PASS | 48 `<details class="release-entry">` |
| v2.22.0 on changelog | ✅ PASS | |
| v0.2.9 on changelog | ✅ PASS | |
| v2.22.0 in header on home | ⏳ T02 | Header still shows v0.0.0 |
| v0.0.0 gone from home | ⏳ T02 | Still present |
| changelog linked from home | ⏳ T02 | Sidebar/home link not yet added |

## Diagnostics

- **Release count check:** `grep -o '<details class="release-entry"' dist/changelog/index.html | wc -l` — must return 48. Note: `grep -o '<details'` returns 58 because Starlight adds 10 `<details>` for sidebar sections.
- **Markdown rendering:** `grep '<h2>' dist/changelog/index.html` — confirms body markdown was converted to HTML headings.
- **Build failure mode:** Missing `marked` or malformed JSON in releases.json will fail `npm run build` with a traceable error in ReleaseEntry.astro frontmatter.

## Deviations

- The plan's verification check `grep -o '<details' | wc -l` returns 58 (not 48) because Starlight's sidebar contributes 10 additional `<details>` elements. Used `grep -o '<details class="release-entry"'` for accurate counting. This is a plan imprecision, not a code issue.

## Known Issues

None.

## Files Created/Modified

- `package.json` — added `marked` (v17.0.4) dependency
- `src/components/ReleaseEntry.astro` — new: renders a single release with details/summary, GitHub link, formatted date, and markdown body as HTML
- `src/content/docs/changelog.mdx` — new: changelog page importing releases.json and rendering all 48 releases
- `src/styles/terminal.css` — appended ~200 lines of `.release-entry` CSS (dark + light theme variants)
