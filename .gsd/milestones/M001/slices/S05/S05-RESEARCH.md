# S05 — Changelog & Release Tracking — Research

**Date:** 2026-03-17
**Depth:** Light — straightforward wiring of existing data into established page patterns.

## Summary

S05 needs two deliverables: (1) a browsable changelog page showing all 48 GitHub releases, and (2) the real version number in the site header replacing the "v0.0.0" placeholder. Both consume `content/generated/releases.json` produced by S01's extraction pipeline. The JSON is already well-structured — every release has `tag_name`, `published_at`, `html_url`, and a `body` field containing the raw markdown release notes. 14 of the 48 releases also have structured `added`/`changed`/`fixed` arrays, but all 48 have a populated `body` field.

The established pattern from S03's reference pages is: MDX file imports JSON via relative path, exports computed data, then renders with Astro components. The changelog page follows this same pattern. The Header.astro component already has the version badge wired — it just shows hardcoded "v0.0.0" and needs to read the latest version from releases data.

This is low-risk work. The data exists, the import pattern is proven, and the component patterns (details/summary expand/collapse, terminal-themed CSS) are established.

## Recommendation

Build two tasks: (1) changelog page with release rendering component, and (2) Header version badge wiring. The changelog page is the larger piece — it needs an Astro component to render release entries (date, version, body-as-HTML) and CSS styling. The Header update is small — read `releases.json`, extract `tag_name` from index 0. Both can be built independently.

For the release body content: use Astro's `set:html` directive to render the markdown body as HTML. Since the body is raw markdown, the component will need to convert it to HTML at build time. Use a lightweight markdown-to-HTML conversion — the project already has `@astrojs/markdown-remark` in the dependency tree (pulled by Starlight). Alternatively, since these are release notes with simple formatting (headers, lists, bold, code), a custom Astro component can use the `marked` library or import a markdown utility. The simplest approach: use `marked` (tiny, zero-config) to convert the body markdown to HTML in the Astro component's frontmatter script, then render with `set:html`.

Add a sidebar entry for the changelog page and a link from the home page.

## Implementation Landscape

### Key Files

- `content/generated/releases.json` — S01 output: 48 releases with `tag_name`, `name`, `published_at`, `html_url`, `added[]`, `changed[]`, `fixed[]`, `body` (raw markdown). Already exists, read-only for this slice.
- `src/components/Header.astro` — Currently shows hardcoded "v0.0.0". Needs to import releases.json and display `releases[0].tag_name`. The badge markup and styling already exist — only the version string changes.
- `src/content/docs/changelog.mdx` — **New file.** The browsable changelog page. Imports releases.json, renders each release with an Astro component.
- `src/components/ReleaseEntry.astro` — **New file.** Astro component that renders a single release: version heading (linked to GitHub), date, and body content as HTML. Uses `<details>/<summary>` pattern from ReferenceCard.astro for expand/collapse per release.
- `src/styles/terminal.css` — Needs new CSS rules for `.release-entry` styling (following the existing `.ref-card` pattern).
- `astro.config.mjs` — Add changelog sidebar entry.
- `src/content/docs/index.mdx` — Add changelog link to home page cards.

### Data Shape

```json
{
  "tag_name": "v2.22.0",
  "name": "v2.22.0", 
  "published_at": "2026-03-16T21:27:41Z",
  "html_url": "https://github.com/gsd-build/gsd-2/releases/tag/v2.22.0",
  "added": [{ "feature": "...", "description": "..." }],
  "changed": [],
  "fixed": [{ "feature": "", "description": "..." }],
  "body": "### Added\n- **feature** — description\n..."
}
```

Key data facts:
- 48 releases total, sorted newest-first (v2.22.0 → v0.2.9)
- All 48 have a populated `body` field (raw markdown, 142–3007 chars)
- Only 14 have structured `added`/`changed`/`fixed` arrays — the other 34 have empty arrays
- **Use `body` as the universal content source** — it's available for every release
- Dates range from 2026-03-11 to 2026-03-16 (6 days of development)

### Markdown-to-HTML for Release Body

The `body` field is raw GitHub-flavored markdown. In an Astro `.astro` component's frontmatter, we need to convert it to HTML for `set:html`. Options:

1. **`marked` library** — 32KB, zero-config, fast. `npm install marked`, then `import { marked } from 'marked'; const html = marked(body);` in frontmatter. Best option — lightweight, well-tested.
2. **`@astrojs/markdown-remark`** — Already in dep tree via Starlight, but its API is designed for Astro's build pipeline, not ad-hoc string conversion. Overkill.
3. **Render body as plain text in `<pre>`** — Avoids the conversion entirely but looks terrible.

**Recommendation: Install `marked` and use it in the ReleaseEntry component.** It's the standard approach for rendering markdown strings in Astro components.

### Header Version Badge

Current Header.astro:
```astro
<span>v0.0.0</span>
```

Needs to become:
```astro
---
import releases from '../../content/generated/releases.json';
const version = releases[0]?.tag_name ?? 'v0.0.0';
---
<span>{version}</span>
```

The import path from `src/components/Header.astro` to `content/generated/releases.json` is `../../content/generated/releases.json` (up from src/components/ to project root, then into content/generated/).

### Sidebar Entry

Add to `astro.config.mjs` sidebar — logical placement is as a top-level item after the existing groups, or within a new "Project" group:
```js
{ label: 'Changelog', link: '/changelog/' },
```

### Build Order

1. **T01: Changelog page + release component** — Install `marked`. Create `ReleaseEntry.astro` component. Create `changelog.mdx` page. Add CSS for release entries. This is the main deliverable (R005).
2. **T02: Header version badge + sidebar/home links** — Wire real version in Header.astro. Add sidebar entry. Add changelog link to index.mdx. This completes R010.

T01 is the larger task. T02 is small and can be done independently.

### Verification Approach

1. `npm run build` succeeds with no errors — page count should increase by 1 (changelog page)
2. `grep 'v2.22.0' dist/changelog/index.html` — latest version appears on changelog page
3. `grep -o '<details' dist/changelog/index.html | wc -l` returns 48 — all releases rendered (using `grep -o` not `grep -c` per knowledge base)
4. `grep 'v2.22.0' dist/index.html` — version badge appears in header on home page (confirms Header.astro wiring)
5. `grep 'v0.0.0' dist/index.html` should return nothing — placeholder is gone
6. `grep 'changelog' dist/index.html` — home page links to changelog
7. Visual check: `npm run dev` → browse to `/gsd2-guide/changelog/` — releases display with expand/collapse, dates formatted, links to GitHub

## Constraints

- **Use `body` field, not structured arrays** — Only 14 of 48 releases have structured data. The body field is the universal content source. Structured arrays could optionally enhance the 14 releases that have them, but body alone is sufficient.
- **`set:html` required** — Astro components can't render raw markdown strings. Must convert to HTML first, then use `set:html` directive.
- **Import path depth** — MDX at `src/content/docs/changelog.mdx` needs `../../../content/generated/releases.json` (3 levels up). Component at `src/components/` needs `../../content/generated/releases.json` (2 levels up).
- **grep -o for counting** — Per knowledge base, always use `grep -o pattern | wc -l` not `grep -c` for counting in Astro's minified HTML output.

## Common Pitfalls

- **Older releases expand to show all content by default** — With 48 releases, the page would be extremely long. Use `<details>` collapsed by default, optionally with latest 3-5 expanded via `open` attribute.
- **Date formatting** — `published_at` is ISO 8601 ("2026-03-16T21:27:41Z"). Needs human-readable formatting. Use `new Date(published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })` in Astro frontmatter or component script.
- **Missing releases.json at build time** — If extraction hasn't run, `releases.json` won't exist. The import will fail at build. This is the same constraint S03 reference pages have — extraction must run before build. Already handled by the existing `prebuild` / `extract` scripts.
