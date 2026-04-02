# S04: Brief Writing + Cost Examples

**Goal:** Solo builders can see bad-vs-good requirement examples and approximate dollar costs for 3 milestone scenarios.
**Demo:** After this: After this: solo builders can see bad-vs-good requirement examples and approximate dollar costs for 3 milestone scenarios.

## Tasks
- [x] **T01: Created writing-a-good-brief.mdx with 4 bad-vs-good requirement pairs and cost-examples.mdx with 3 milestone cost scenarios, both building successfully** — Create two new MDX pages at `src/content/docs/`:

1. **writing-a-good-brief.mdx** — A guide showing what makes a good requirement brief. Include:
   - Bad-vs-good requirement examples (at least 3 pairs showing vague vs specific)
   - What makes a discussion phase productive (linking to `../solo-guide/first-project/` for the full walkthrough)
   - Common mistakes (too vague, too prescriptive, missing acceptance criteria)
   - Use Starlight callouts (:::tip, :::caution) for key takeaways

2. **cost-examples.mdx** — Concrete dollar cost scenarios. Include:
   - 3 milestone scenarios: small (bug fix / small feature, ~$1-5), medium (new feature with tests, ~$5-20), large (multi-slice milestone, ~$20-80)
   - What drives the bill: token counts, model choice, verification loops, context size
   - Link to `../solo-guide/controlling-costs/` for the mechanics of controlling spend
   - Link to `../cost-management/` for the `/gsd status` cost tracking reference

**Patterns to follow:**
- Frontmatter: `title` and `description` fields only (match `gsd-directory.mdx`, `how-auto-mode-works.mdx`)
- Cross-links: use `../sibling/` relative format with trailing slash
- Australian English: "optimise", "recognise", "organisation", "behaviour"
- MDX curly-brace escaping: wrap any `{variable}` template literals in backticks
- Available Starlight components: `Card`, `CardGrid`, `Tabs`, `TabItem`, `Steps`, `FileTree` from `@astrojs/starlight/components`
- Callouts: `:::tip`, `:::caution`, `:::note` directives

**Important:** These are hand-authored content pages. Do NOT edit any generated files. The content should complement (not duplicate) existing solo-guide pages.
  - Estimate: 25 minutes
  - Files: src/content/docs/writing-a-good-brief.mdx, src/content/docs/cost-examples.mdx
  - Verify: npm run build && test -f dist/writing-a-good-brief/index.html && test -f dist/cost-examples/index.html && echo 'Both pages built successfully'
- [x] **T02: Verified 20368 internal links clean, both new pages present in build output, no broken cross-links or American spellings** — Run the full link checker to confirm all cross-links in the new pages resolve correctly, and verify both pages exist in the build output.

1. Run `npm run build` to rebuild
2. Run `npm run check-links` to verify no broken links
3. Verify `dist/writing-a-good-brief/index.html` contains expected content (bad-vs-good examples)
4. Verify `dist/cost-examples/index.html` contains expected content (dollar amounts)
5. Spot-check Australian English spelling in both files
  - Estimate: 10 minutes
  - Files: src/content/docs/writing-a-good-brief.mdx, src/content/docs/cost-examples.mdx
  - Verify: npm run build && npm run check-links && grep -l 'index.html' dist/writing-a-good-brief/index.html dist/cost-examples/index.html
