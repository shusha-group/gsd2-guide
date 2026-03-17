# S02: Command deep-dives — session and execution commands — UAT

**Milestone:** M002
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All deliverables are static MDX pages rendered to HTML. Build output, link checker, and filesystem checks fully verify that pages exist, render, link correctly, and are indexed by search. No runtime behavior to test.

## Preconditions

- `npm run build` has completed successfully (36 pages)
- `dist/` directory contains the built site
- A local dev server can be started with `npm run dev` for interactive spot-checks

## Smoke Test

Run `npm run build && node scripts/check-links.mjs` — should exit 0 with 36 pages built and 0 broken links. Then open `http://localhost:4321/gsd2-guide/commands/auto/` in the dev server and confirm the page renders with a Mermaid diagram visible.

## Test Cases

### 1. All 9 command pages exist in build output

1. Run `ls dist/commands/*/index.html | wc -l`
2. **Expected:** 9
3. Run `ls dist/commands/*/index.html` and verify these paths exist:
   - `dist/commands/auto/index.html`
   - `dist/commands/stop/index.html`
   - `dist/commands/pause/index.html`
   - `dist/commands/gsd/index.html`
   - `dist/commands/next/index.html`
   - `dist/commands/quick/index.html`
   - `dist/commands/discuss/index.html`
   - `dist/commands/status/index.html`
   - `dist/commands/visualize/index.html`
4. **Expected:** All 9 files exist

### 2. Every command page has a Mermaid diagram

1. Run `grep -l 'mermaid' src/content/docs/commands/*.mdx | wc -l`
2. **Expected:** 9
3. Start dev server, navigate to `/gsd2-guide/commands/auto/`
4. **Expected:** At least one rendered SVG diagram visible on the page (Mermaid renders as `<svg>` within a `<pre class="mermaid">` block)

### 3. Sidebar lists all command pages

1. Run `grep "'/commands/" astro.config.mjs | wc -l`
2. **Expected:** 10 (1 commands reference + 9 deep-dives)
3. In dev server, expand the Commands sidebar section
4. **Expected:** 10 entries visible — "Commands Reference" plus auto, stop, pause, gsd, next, quick, discuss, status, visualize

### 4. Commands landing page links to all deep-dives

1. Open `/gsd2-guide/commands/` in dev server
2. Check the Session Commands table
3. **Expected:** `/gsd auto`, `/gsd stop`, `/gsd pause`, `/gsd`, `/gsd next`, `/gsd quick`, `/gsd discuss`, `/gsd status`, `/gsd visualize` each have a "Deep dive →" link
4. Click each deep-dive link
5. **Expected:** Each navigates to the correct command page (e.g., `/gsd2-guide/commands/auto/`)

### 5. Cross-links between command pages resolve

1. Open `/gsd2-guide/commands/auto/` in dev server
2. Scroll to "Related Commands" section
3. Click the link to `/gsd stop`
4. **Expected:** Navigates to `/gsd2-guide/commands/stop/`
5. On stop page, find the link back to auto
6. **Expected:** Navigates back to `/gsd2-guide/commands/auto/`

### 6. Each page follows the consistent template structure

1. Open each of the 9 command pages in dev server
2. Check that each page has these sections (visible as headings):
   - What It Does
   - Usage
   - How It Works
   - What Files It Touches
   - Examples
   - Related Commands
3. **Expected:** All 9 pages have all 6 sections

### 7. Pagefind indexes command pages

1. Run `npm run build` (Pagefind runs at end)
2. Check build output for "Found 36 HTML files"
3. In dev server, use the search box and type "auto mode dispatch"
4. **Expected:** Search returns the `/gsd auto` deep-dive page in results
5. Type "quick task"
6. **Expected:** Search returns the `/gsd quick` deep-dive page

### 8. Content uses Cookmate as example project

1. Run `grep -l 'cookmate\|Cookmate' src/content/docs/commands/*.mdx | wc -l`
2. **Expected:** Multiple files reference Cookmate (at minimum auto.mdx, stop.mdx, pause.mdx which have terminal examples)

## Edge Cases

### Missing frontmatter produces clear error

1. Temporarily remove the `title:` line from any command `.mdx` file
2. Run `npm run build`
3. **Expected:** Build fails with an error message that includes the file path
4. Restore the file

### Broken cross-link detected by checker

1. Temporarily change a `../stop/` link in `auto.mdx` to `../nonexistent/`
2. Run `npm run build && node scripts/check-links.mjs`
3. **Expected:** Link checker reports the broken link with source file and target
4. Restore the file

## Failure Signals

- `npm run build` exits non-zero or reports fewer than 36 pages
- `node scripts/check-links.mjs` reports broken links
- Any command page missing from `dist/commands/*/index.html`
- Mermaid diagrams render as raw text instead of SVG (plugin misconfiguration)
- Sidebar shows fewer than 10 entries under Commands
- Search returns no results for command names

## Requirements Proved By This UAT

- R027 (partial) — 9 of ~25 command deep-dive pages verified with authored explanations, diagrams, and examples
- R030 (partial) — 9 command lifecycle pages showing triggers, files read/written, internal mechanics with diagrams
- R031 (partial) — Visual documentation pattern applied to 9 command pages with Mermaid flowcharts in dark terminal theme

## Not Proven By This UAT

- R027 complete coverage — remaining ~16 commands (S03 scope)
- R030 complete coverage — remaining commands (S03 scope)
- R031 full validation — needs S03 (remaining commands) and S04 (recipes) to apply the visual pattern across all content
- Content accuracy relative to GSD source code — this UAT verifies structure and rendering, not that the described mechanics are correct. Content accuracy requires human review against gsd-pi source.

## Notes for Tester

- Mermaid diagrams render client-side via JavaScript. If testing with JS disabled, diagrams will appear as code blocks — this is expected.
- The commands landing page is a generated file. If you edit `src/content/docs/commands.md` and rebuild, your changes will be overwritten. The source is `content/generated/docs/commands.md`.
- The `/gsd pause` command was added as a new table row in the commands reference because it previously only appeared as the Escape keyboard shortcut. Verify it appears in both places.
