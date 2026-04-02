---
estimated_steps: 19
estimated_files: 2
skills_used: []
---

# T01: Create Writing a Good Brief page and Cost Examples page

Create two new MDX pages at `src/content/docs/`:

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

## Inputs

- ``src/content/docs/solo-guide/first-project.mdx` — existing page to cross-link to (don't edit)`
- ``src/content/docs/solo-guide/controlling-costs.mdx` — existing page to cross-link to (don't edit)`
- ``src/content/docs/gsd-directory.mdx` — frontmatter pattern reference`
- ``src/content/docs/how-auto-mode-works.mdx` — frontmatter pattern reference`

## Expected Output

- ``src/content/docs/writing-a-good-brief.mdx` — new page with bad-vs-good brief examples`
- ``src/content/docs/cost-examples.mdx` — new page with 3 milestone cost scenarios`
- ``dist/writing-a-good-brief/index.html` — built output confirming page renders`
- ``dist/cost-examples/index.html` — built output confirming page renders`

## Verification

npm run build && test -f dist/writing-a-good-brief/index.html && test -f dist/cost-examples/index.html && echo 'Both pages built successfully'
