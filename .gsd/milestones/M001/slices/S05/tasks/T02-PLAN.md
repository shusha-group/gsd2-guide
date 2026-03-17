---
estimated_steps: 4
estimated_files: 3
---

# T02: Wire header version badge and add changelog navigation links

**Slice:** S05 — Changelog & Release Tracking
**Milestone:** M001

## Description

Replace the hardcoded "v0.0.0" placeholder in the site Header with the real latest version from `releases.json`, and add changelog navigation links to the sidebar and home page. This delivers R010 (version in header) and completes changelog discoverability.

**Relevant skills:** None needed — straightforward Astro component edit and config changes.

## Steps

1. **Update `src/components/Header.astro`** — Add an import in the frontmatter to load the releases data: `import releases from '../../content/generated/releases.json';` and extract the version: `const version = releases[0]?.tag_name ?? 'v0.0.0';`. Replace the hardcoded `<span>v0.0.0</span>` with `<span>{version}</span>`. The import path is 2 levels up from `src/components/` to the project root, then into `content/generated/`. Optionally, wrap the version badge in an anchor linking to `/gsd2-guide/changelog/` so clicking the version navigates to the changelog.

2. **Add changelog to sidebar in `astro.config.mjs`** — In the `sidebar` array, add `{ label: 'Changelog', link: '/changelog/' }` as a top-level entry. Place it after the Home entry (line ~21) so it's prominent. The sidebar currently has: Home, Quick Reference group, Guides group, Architecture group, then autogenerate groups.

3. **Add changelog LinkCard to `src/content/docs/index.mdx`** — In the home page's card sections, add a `<LinkCard>` for the changelog. Add it to an appropriate card grid — either the existing "Deep-Dive Guides" grid or as a standalone entry. Example: `<LinkCard title="Changelog" description="Release history — what's new, fixed, and changed in each version" href="/gsd2-guide/changelog/" />`.

4. **Build and verify** — Run `npm run build`. Check: `grep 'v2.22.0' dist/index.html` should find the version badge. `grep -c 'v0.0.0' dist/index.html` should return 0 (placeholder gone). `grep 'changelog' dist/index.html` should find the link. Check that the sidebar entry appears: `grep -i 'changelog' dist/index.html`.

## Must-Haves

- [ ] Header.astro imports releases.json and displays the real latest version (currently "v2.22.0")
- [ ] The "v0.0.0" placeholder no longer appears anywhere in the built site header
- [ ] Sidebar has a Changelog entry that links to `/changelog/`
- [ ] Home page has a link/card pointing to the changelog
- [ ] `npm run build` succeeds

## Verification

- `npm run build` exits 0
- `grep 'v2.22.0' dist/index.html` — real version in header on home page
- `grep -c 'v0.0.0' dist/index.html` returns 0 — placeholder is gone
- `grep -i 'changelog' dist/index.html` — changelog link present on home page
- `grep -i 'changelog' dist/changelog/index.html` — sidebar entry visible on changelog page itself

## Inputs

- `content/generated/releases.json` — Same releases data as T01. `releases[0].tag_name` is `"v2.22.0"`.
- `src/components/Header.astro` — Current header with hardcoded "v0.0.0" on line 9: `<span>v0.0.0</span>`. Import path from this file to releases.json: `../../content/generated/releases.json`.
- `astro.config.mjs` — Sidebar config starts at line 20. Current top-level entry: `{ label: 'Home', link: '/' }` at ~line 21.
- `src/content/docs/index.mdx` — Home page with hero + card grids. Has "Deep-Dive Guides" CardGrid at the bottom.
- T01 must complete first — the changelog page (`/changelog/`) must exist before links to it will resolve in the build.

## Expected Output

- `src/components/Header.astro` — imports releases.json, displays `releases[0].tag_name` instead of "v0.0.0"
- `astro.config.mjs` — sidebar has Changelog entry
- `src/content/docs/index.mdx` — includes a Changelog link card
- Build output: version badge shows "v2.22.0", no "v0.0.0" remnants, changelog links present

## Observability Impact

- **Version badge signal:** After this task, `grep 'v2.22.0' dist/index.html` confirms the header reads live release data. If absent, the Header.astro import path or releases.json structure is broken — check the Astro build log for import errors.
- **Changelog navigation:** `grep -i 'changelog' dist/index.html` confirms both the sidebar entry and the home-page LinkCard resolved. Absence means the sidebar config or index.mdx edit didn't take effect.
- **Placeholder elimination:** `grep -c 'v0.0.0' dist/index.html` returning 0 proves no hardcoded fallback leaked into the build. A non-zero result means the Header.astro edit was incomplete or the import returned undefined.
- **Failure mode:** A broken import path to releases.json will cause `npm run build` to fail with a clear Astro module-not-found error, not a silent fallback.
