# S02: Changelog Improvements

**Goal:** Every `#NNN` in the changelog is a clickable GitHub link; a new highlights page shows scannable per-release summaries for solo builders.
**Demo:** After this: After this: every release has a solo-builder-perspective summary on a highlights page; every #NNN is a clickable GitHub link in the full changelog.

## Tasks
- [x] **T01: Added #NNN → GitHub issue/PR auto-linking to ReleaseEntry.astro, producing 768 clickable links in the built changelog** — Add a regex replace to `ReleaseEntry.astro` that converts `#NNN` references in changelog entry HTML into clickable GitHub links. The component already post-processes `bodyHtml` with a regex for `/gsd X` command linkification (lines 68-75). Add a second regex pass immediately after that block.

The regex must:
- Match `#` followed by digits (`#(\d+)`) 
- Not match inside existing `<a>` tags or URLs (negative lookbehind for word chars and quotes)
- Link to `https://github.com/gsd-build/gsd-2/issues/$1` (GitHub auto-redirects to /pull/ for PRs)
- Add `target="_blank"` and `rel="noopener noreferrer"`

Pattern: `(?<![\w\/"'])#(\d+)\b` → `<a href="https://github.com/gsd-build/gsd-2/issues/$1" target="_blank" rel="noopener noreferrer">#$1</a>`
  - Estimate: 15m
  - Files: src/components/ReleaseEntry.astro
  - Verify: npm run build && grep -c 'github.com/gsd-build/gsd-2/issues/' dist/changelog/index.html | xargs test 10 -lt
- [x] **T02: Created changelog highlights page with 18 per-release summaries, generator script, sidebar entry, and pipeline hook** — Create a scannable changelog highlights page that shows 1-2 sentence solo-builder-perspective summaries per release.

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
  - Estimate: 45m
  - Files: scripts/generate-highlights.mjs, content/generated/changelog-highlights.json, src/content/docs/changelog-highlights.mdx, astro.config.mjs, update.mjs
  - Verify: node scripts/generate-highlights.mjs && npm run build && test -f dist/changelog-highlights/index.html && grep -q 'Changelog Highlights' dist/changelog-highlights/index.html
