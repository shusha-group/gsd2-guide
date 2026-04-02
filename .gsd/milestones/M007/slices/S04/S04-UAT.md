# S04: Brief Writing + Cost Examples — UAT

**Milestone:** M007
**Written:** 2026-04-02T04:39:15.817Z

## UAT: S04 — Brief Writing + Cost Examples

### Preconditions
- `npm run build` completes with exit 0
- Both pages exist at `dist/writing-a-good-brief/index.html` and `dist/cost-examples/index.html`

### Test Cases

**TC1: writing-a-good-brief page builds and contains bad-vs-good pairs**
1. Run `test -f dist/writing-a-good-brief/index.html`
2. Expected: exit 0

3. Run `grep -c 'Bad\|Good\|vague\|specific' dist/writing-a-good-brief/index.html`
4. Expected: count > 0 (confirmed: 13)

**TC2: cost-examples page builds and contains dollar amounts**
1. Run `test -f dist/cost-examples/index.html`
2. Expected: exit 0

3. Run `grep -c '\$' dist/cost-examples/index.html`
4. Expected: count > 0 (confirmed: 8)

**TC3: No broken cross-links**
1. Run `npm run check-links`
2. Expected: 0 broken links (confirmed: 20368 links checked, 0 broken)

**TC4: Australian English — no American spellings**
1. Run `grep -i 'organize\|recognize\|behavior\b\|color\b' src/content/docs/writing-a-good-brief.mdx src/content/docs/cost-examples.mdx`
2. Expected: no matches

**TC5: Frontmatter — title and description only**
1. Run `head -5 src/content/docs/writing-a-good-brief.mdx`
2. Expected: frontmatter contains `title:` and `description:` fields

**TC6: Build count unchanged at 148 pages**
1. Run `npm run build 2>&1 | grep 'page(s) built'`
2. Expected: `148 page(s) built`

