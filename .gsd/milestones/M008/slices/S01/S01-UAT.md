# S01: Homepage Nav Fix — UAT

**Milestone:** M008
**Written:** 2026-04-02T13:13:17.534Z

## UAT: S01 Homepage Nav Fix

### Preconditions
- Project cloned and dependencies installed (`npm install`)
- No local uncommitted changes to `src/content/docs/index.mdx`

### Test Cases

**TC-01: Frontmatter uses template:doc**
1. Run: `grep 'template: doc' src/content/docs/index.mdx`
2. Expected: exits 0, prints `template: doc`
3. Failure signal: exits 1 or prints `template: splash` — homepage would render without sidebar

**TC-02: Site builds successfully**
1. Run: `npm run build`
2. Expected: exits 0, output shows 148 pages built
3. Failure signal: non-zero exit or build errors

**TC-03: Sidebar HTML parity between homepage and inner page**
1. Run: `npm run build` (if not already built)
2. Extract sidebar from `dist/index.html` and `dist/getting-started/index.html`
3. Strip `aria-current="page"` attributes from both
4. Diff the two sidebar sections
5. Expected: zero differences
6. Failure signal: any sidebar structural difference means homepage is not using the standard sidebar

**TC-04: No broken links**
1. Run: `npm run check-links`
2. Expected: exits 0, 0 broken links reported
3. Failure signal: any broken link count > 0

### Edge Cases
- If `template: splash` appears anywhere in index.mdx frontmatter (even commented), verify the active value is `doc`
- Sidebar diff must be scoped to the `<nav>` or sidebar `<aside>` element, not the full page HTML

