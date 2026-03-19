# S02: Section 4 — The Daily Mix

**Goal:** The decision framework, flag explanations in plain English, and the decision table are live in `daily-mix.mdx`. `npm run check-links` passes with Section 4's cross-references, retiring the "cross-reference format" risk from the milestone proof strategy.
**Demo:** `npm run build` exits 0 at 113 pages; `npm run check-links` exits 0; `daily-mix.mdx` has >100 lines of substantive content with a decision table and multiple cross-references to command, recipe, and root-level gsd2-guide pages.

## Must-Haves

- Decision table mapping change characteristics → GSD path (git commit, `/gsd quick`, full milestone) with at least 6 rows covering the spectrum from trivial to complex
- Plain-English walkthrough of what `/gsd quick` actually does (not duplicating the command page — linking to it)
- "When quick isn't enough" heuristic: if you'd investigate before fixing, or the change crosses multiple concerns, use a milestone
- Interruption handling section covering `/gsd capture`, `/gsd steer`, and `/gsd queue` with links
- Daily rhythm narrative linking to Section 8 (Building a Rhythm)
- Cross-references to at least 4 command pages (quick, capture, steer, queue) plus recipes and root-level pages
- Australian spelling throughout (behaviour, organisation, recognise — no American spellings)
- All cross-references use correct depth: `../../commands/slug/` for command pages, `../../slug/` for root-level pages, `../slug/` for sibling solo-guide pages

## Verification

- `npm run build 2>&1 | grep "pages"` → **113 pages** (no new files — stub replaced with content)
- `npm run check-links` exits 0 — all cross-references from `daily-mix.mdx` resolve (this retires the cross-reference format risk)
- `wc -l src/content/docs/solo-guide/daily-mix.mdx` → **>100 lines**
- `grep -c "../../commands/" src/content/docs/solo-guide/daily-mix.mdx` → **≥4** (multiple command cross-references)
- `npm run build 2>&1 | grep -A5 "solo-guide"` → **no output** (no MDX parse errors)
- `grep -i "behavior\|recognize\|organize" src/content/docs/solo-guide/daily-mix.mdx` → **no output** (no American spellings)

## Tasks

- [ ] **T01: Write Section 4 content and verify cross-references** `est:45m`
  - Why: This is the entire slice — replace the stub with the full decision framework, decision table, quick-mode walkthrough, interruption handling, and daily rhythm narrative. Then build and link-check to retire the cross-reference format risk.
  - Files: `src/content/docs/solo-guide/daily-mix.mdx`
  - Do: Rewrite the file keeping existing frontmatter. Write 6 sections in order: (1) The three paths, (2) Decision table, (3) What `/gsd quick` actually does, (4) When quick isn't enough, (5) Handling interruptions, (6) The daily rhythm. Use `../../commands/slug/` for command links, `../../slug/` for root pages, `../slug/` for sibling solo-guide pages. Australian spelling. Decision table as standard Markdown table (3 columns). Link to command pages, recipes, and root-level pages. Use companion voice — don't duplicate reference content. Wrap any `{{variable}}` in backticks to avoid MDX JSX errors.
  - Verify: `npm run build` exits 0 at 113 pages; `npm run check-links` exits 0; `wc -l` >100; `grep -c "../../commands/"` ≥4; no American spellings; no build errors mentioning solo-guide
  - Done when: All 6 verification checks in the slice Verification section pass

## Files Likely Touched

- `src/content/docs/solo-guide/daily-mix.mdx`
