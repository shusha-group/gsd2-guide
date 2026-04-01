---
estimated_steps: 11
estimated_files: 5
skills_used: []
---

# T02: Create changelog highlights page with per-release summaries

Create a scannable changelog highlights page that shows 1-2 sentence solo-builder-perspective summaries per release.

**Step 1: Create highlights generator script**
Create `scripts/generate-highlights.mjs` that reads `content/generated/releases.json` and writes `content/generated/changelog-highlights.json`. For each release, generate a summary by concatenating the first item from each of `added`, `changed`, `fixed` arrays (heuristic approach — no LLM needed). Output format: `[{ tag_name, published_at, html_url, summary }]`. Skip releases where all three arrays are empty and body is minimal.

**Step 2: Wire into update pipeline**
Add a call to the highlights generator in `update.mjs` after the extract step. Follow the existing pattern of sequential step functions with timing.

**Step 3: Create MDX page**
Create `src/content/docs/changelog-highlights.mdx` that imports the generated JSON and renders a compact list. Each entry: version (linked to GitHub), date, summary text. Style consistently with existing changelog page.

**Step 4: Add sidebar entry**
In `astro.config.mjs`, add a 'Changelog Highlights' entry above the existing 'Changelog' entry in the sidebar.

**Step 5: Run generator and build**
Run the generator to create the JSON, then `npm run build` to verify everything works.

## Inputs

- ``content/generated/releases.json` — source release data with structured added/changed/fixed arrays`
- ``astro.config.mjs` — sidebar configuration (line 22 has existing Changelog entry)`
- ``update.mjs` — pipeline script to add highlights generation step`

## Expected Output

- ``scripts/generate-highlights.mjs` — highlights generator script`
- ``content/generated/changelog-highlights.json` — generated highlights data`
- ``src/content/docs/changelog-highlights.mdx` — highlights page`
- ``astro.config.mjs` — updated sidebar with Changelog Highlights entry`
- ``update.mjs` — updated pipeline with highlights generation step`

## Verification

node scripts/generate-highlights.mjs && npm run build && test -f dist/changelog-highlights/index.html && grep -q 'Changelog Highlights' dist/changelog-highlights/index.html
