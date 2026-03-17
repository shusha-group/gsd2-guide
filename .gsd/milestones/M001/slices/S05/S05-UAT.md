# S05: Changelog & Release Tracking — UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: The changelog page and header version badge are fully static build artifacts. All behavior is verifiable from `dist/` output and the dev server — no runtime state, APIs, or user interaction flows to test.

## Preconditions

- `npm install` has been run (all dependencies including `marked` are installed)
- `npm run build` succeeds with exit code 0
- `content/generated/releases.json` exists and contains 48 release entries
- `dist/` directory contains the built site

## Smoke Test

Run `npm run build && test -f dist/changelog/index.html && grep -o '<details class="release-entry"' dist/changelog/index.html | wc -l` — should output 48 and exit cleanly.

## Test Cases

### 1. Changelog page renders all 48 releases

1. Run `npm run build`
2. Run `grep -o '<details class="release-entry"' dist/changelog/index.html | wc -l`
3. **Expected:** Output is `48` — every GitHub release from releases.json has a corresponding details element.

### 2. Latest release is expanded by default

1. Open `http://localhost:4321/gsd2-guide/changelog/` in a browser (run `npm run dev` first)
2. Observe the first release entry (v2.22.0)
3. **Expected:** The first `<details>` element has the `open` attribute — v2.22.0 is expanded, showing its body content. All other 47 releases are collapsed.

### 3. Oldest release is present

1. Run `grep 'v0.2.9' dist/changelog/index.html`
2. **Expected:** Match found — the oldest release (v0.2.9) is rendered on the page.

### 4. Release entries have GitHub links

1. Run `grep -o 'github.com/gsd-build/gsd-2/releases' dist/changelog/index.html | wc -l`
2. **Expected:** Output is `48` — each release has a link to its GitHub release page.

### 5. Release body markdown is rendered as HTML

1. Run `grep -c '<h2>' dist/changelog/index.html`
2. **Expected:** Output is greater than 0 — release body markdown (containing `## Added`, `## Fixed`, etc.) is converted to HTML headings.

### 6. Header version badge shows real version

1. Run `grep 'v2.22.0' dist/index.html`
2. **Expected:** Match found — the header version badge on the home page displays v2.22.0.

### 7. Placeholder version v0.0.0 is eliminated

1. Run `grep -c 'v0.0.0' dist/index.html`
2. **Expected:** Output is `0` — no trace of the placeholder version remains.

### 8. Version badge links to changelog

1. Open `http://localhost:4321/gsd2-guide/` in a browser
2. Click the version badge (v2.22.0) in the header
3. **Expected:** Navigates to `/gsd2-guide/changelog/` — the changelog page loads.

### 9. Changelog appears in sidebar navigation

1. Open `http://localhost:4321/gsd2-guide/changelog/` in a browser
2. Check the sidebar navigation
3. **Expected:** "Changelog" appears as a top-level sidebar entry, positioned after "Home".

### 10. Changelog linked from home page

1. Run `grep -i 'changelog' dist/index.html`
2. **Expected:** Match found — the home page contains a LinkCard pointing to the changelog.

### 11. Release dates are formatted

1. Open `http://localhost:4321/gsd2-guide/changelog/` in a browser
2. Check any release entry's date display
3. **Expected:** Dates are formatted as human-readable strings (e.g., "March 17, 2026"), not raw ISO timestamps.

## Edge Cases

### Empty release body

1. Check if any release in releases.json has an empty or null `body` field
2. Open the changelog page and find that release
3. **Expected:** The release still renders with its version and date. The body section is empty but no rendering error occurs.

### Special characters in release notes

1. Check for releases containing code blocks, HTML entities, or special markdown (backticks, angle brackets)
2. View those releases on the changelog page
3. **Expected:** Content renders correctly — code blocks are formatted, HTML entities are properly escaped, no raw markdown syntax visible.

### Version badge fallback

1. Temporarily rename `content/generated/releases.json` to something else
2. Run `npm run build`
3. **Expected:** Build fails with a clear import error in Header.astro — not a silent fallback to v0.0.0.

## Failure Signals

- `npm run build` exits non-zero — check for import errors in ReleaseEntry.astro or Header.astro (likely missing/malformed releases.json)
- `grep -o '<details class="release-entry"'` returns fewer than 48 — releases.json has fewer entries than expected or ReleaseEntry component has a rendering bug
- `grep -c 'v0.0.0' dist/index.html` returns non-zero — Header.astro failed to import releases.json, falling back to placeholder
- Changelog page missing from `dist/` — changelog.mdx has a syntax error or is not in the content collection
- No `<h2>` tags in changelog HTML — `marked` dependency is missing or body markdown conversion failed

## Requirements Proved By This UAT

- R005 — Tests 1-5 and 11 prove the browsable changelog with all 48 releases, expand/collapse, dates, GitHub links, and rendered markdown bodies
- R010 — Tests 6-8 prove the current version is prominently displayed in the header and links to the changelog

## Not Proven By This UAT

- R007 (one-command update pipeline) — S06 will prove the full update cycle including releases.json regeneration
- R008 (GitHub Pages deployment) — S06 will prove the live deployment
- End-to-end version update cycle — this UAT proves the display layer, not the extraction-to-display pipeline triggered by a new release

## Notes for Tester

- When counting `<details>` elements, always scope with the class name `release-entry`. A raw `grep -o '<details'` returns ~58 because Starlight's sidebar uses its own `<details>` elements for collapsible sections.
- The version number v2.22.0 is the latest at time of writing. If releases.json has been regenerated with a newer version, substitute accordingly in all version-specific checks.
- Light theme styling exists for `.release-entry` — toggle the theme picker to verify both dark and light mode appearance if doing visual review.
