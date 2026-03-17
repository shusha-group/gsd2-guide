---
estimated_steps: 5
estimated_files: 4
---

# T01: Build changelog page with release entry component

**Slice:** S05 — Changelog & Release Tracking
**Milestone:** M001

## Description

Create the browsable changelog page that renders all 48 GitHub releases from `content/generated/releases.json`. This is the primary deliverable for R005. The page uses an Astro component (ReleaseEntry.astro) to render each release with version heading linked to GitHub, formatted date, and the body field converted from markdown to HTML. Releases use native `<details>/<summary>` expand/collapse (matching the existing `.ref-card` pattern from S03). The latest release is expanded by default; all others are collapsed.

**Relevant skills:** None needed — this is Astro component authoring with established patterns.

## Steps

1. **Install `marked`** — Run `npm install marked` in the project root. This is the lightweight markdown-to-HTML converter needed because the release `body` field is raw GitHub-flavored markdown and Astro components can't render raw markdown strings directly — they need `set:html` with pre-converted HTML.

2. **Create `src/components/ReleaseEntry.astro`** — An Astro component that receives props: `tagName` (string), `name` (string), `publishedAt` (string — ISO 8601), `htmlUrl` (string — GitHub release URL), `body` (string — raw markdown), and `isLatest` (boolean — controls whether `<details>` is open). In the frontmatter:
   - Import `marked` from 'marked' and use `marked(body)` to convert the body to HTML
   - Format the date: `new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })`
   - Render as: `<details class="release-entry" open={isLatest}>` containing a `<summary>` with the version tag (as an anchor linked to `htmlUrl`) and the formatted date, then a `<div class="release-body">` with `set:html={bodyHtml}` for the converted markdown content.

3. **Create `src/content/docs/changelog.mdx`** — The changelog page. Frontmatter with `title: Changelog` and `description: Release history for GSD 2...`. Import releases from `../../../content/generated/releases.json` (3 levels up from `src/content/docs/`). Import the ReleaseEntry component. Render a brief intro paragraph, then map over all releases rendering `<ReleaseEntry>` for each, passing `isLatest={index === 0}`.

4. **Add `.release-entry` CSS to `src/styles/terminal.css`** — Follow the existing `.ref-card` CSS pattern closely. The release entry styles need:
   - Dark theme (`:root[data-theme='dark'] .release-entry`): dark background (`#0d120d`), green border-left, summary with flex layout (version + date), hover glow effect, hidden details-marker, custom `::before` triangle indicator, smooth transitions
   - Light theme (`:root[data-theme='light'] .release-entry`): inverted colors following the existing light `.ref-card` pattern
   - `.release-body` inner content: padding, standard typography, links styled green
   - The rendered markdown body will contain `<h3>`, `<ul>`, `<li>`, `<strong>`, `<code>` etc. — ensure these inherit the terminal theme styles naturally

5. **Build and verify** — Run `npm run build`. Check that the changelog page is in the output: `test -f dist/changelog/index.html`. Count releases: `grep -o '<details' dist/changelog/index.html | wc -l` should return 48. Check version presence: `grep 'v2.22.0' dist/changelog/index.html` and `grep 'v0.2.9' dist/changelog/index.html`.

## Must-Haves

- [ ] `marked` is installed as a dependency
- [ ] ReleaseEntry.astro renders version (linked to GitHub), formatted date, and body-as-HTML in a details/summary wrapper
- [ ] changelog.mdx imports releases.json and renders all 48 releases
- [ ] Latest release (index 0) is expanded by default; all others collapsed
- [ ] CSS styles for `.release-entry` follow the terminal theme aesthetic
- [ ] `npm run build` succeeds with the changelog page in output

## Verification

- `npm run build` exits 0
- `test -f dist/changelog/index.html` — page exists in build output
- `grep -o '<details' dist/changelog/index.html | wc -l` returns 48
- `grep 'v2.22.0' dist/changelog/index.html` — latest version present
- `grep 'v0.2.9' dist/changelog/index.html` — oldest version present
- `grep 'github.com/gsd-build/gsd-2/releases' dist/changelog/index.html` — GitHub links present

## Inputs

- `content/generated/releases.json` — 48 releases with `tag_name`, `name`, `published_at`, `html_url`, `body` fields. Already exists from S01 extraction. Read-only for this task.
- `src/styles/terminal.css` — Existing terminal theme CSS. Lines 256–440 contain `.ref-card` styles that serve as the pattern to follow for `.release-entry`. Uses `:root[data-theme='dark']` and `:root[data-theme='light']` selectors.
- S02 established patterns: `<details>/<summary>` for expand/collapse, hidden details-marker with custom `::before` triangle, phosphor green (#39FF14) accent, near-black (#0d120d) backgrounds.

## Expected Output

- `package.json` — `marked` added to dependencies
- `src/components/ReleaseEntry.astro` — new Astro component for rendering release entries
- `src/content/docs/changelog.mdx` — new changelog page rendering all 48 releases
- `src/styles/terminal.css` — `.release-entry` CSS rules appended (both dark and light theme variants)
- `dist/changelog/index.html` — build output containing all 48 releases as `<details>` elements
