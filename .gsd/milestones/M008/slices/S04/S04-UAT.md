# S04: Homepage Rewrite — UAT

**Milestone:** M008
**Written:** 2026-04-02T13:35:36.604Z

## UAT: S04 Homepage Rewrite

### Preconditions
- Built site available (`npm run build` exits 0)
- Link checker passes (`npm run check-links` exits 0, 0 broken)

### Test Cases

**TC01 — Persona cards render (Choose Your Starting Point)**
1. Open `/gsd2-guide/` in a browser
2. Expected: Section heading "Choose Your Starting Point" visible
3. Expected: Three cards present — "Solo Business Builder", "Developer New to AI Coding", "Experienced AI Developer"
4. Expected: Each card has a short description and a CTA link in the body

**TC02 — Persona card links resolve**
1. Click "Solo Business Builder" card link → expect `/gsd2-guide/solo-guide/` loads without 404
2. Click "Developer New to AI Coding" card link → expect `/gsd2-guide/getting-started/` loads without 404
3. Click "Experienced AI Developer" card link → expect `/gsd2-guide/commands/` loads without 404

**TC03 — How GSD Works mermaid diagram retained**
1. Open `/gsd2-guide/`
2. Expected: "How GSD Works" section heading present
3. Expected: Mermaid diagram renders as SVG (not raw code block)

**TC04 — Common Tasks section**
1. Open `/gsd2-guide/`
2. Expected: "Common Tasks" section with 4 LinkCards: Fix a Bug, Small Change, Error Recovery, Developing with GSD
3. Click each → confirm destinations: `/gsd2-guide/recipes/fix-a-bug/`, `/gsd2-guide/recipes/small-change/`, `/gsd2-guide/recipes/error-recovery/`, `/gsd2-guide/user-guide/developing-with-gsd/`

**TC05 — Go Deeper section**
1. Open `/gsd2-guide/`
2. Expected: "Go Deeper" section with 4 LinkCards: Architecture, Auto Mode, Quick Reference Cards, All Commands
3. Click each → confirm destinations: `/gsd2-guide/architecture/`, `/gsd2-guide/auto-mode/`, `/gsd2-guide/reference/`, `/gsd2-guide/commands/`

**TC06 — Hero actions unchanged**
1. Open `/gsd2-guide/`
2. Expected: Hero section present with "Getting Started", "Developing with GSD", and "GitHub" action buttons
3. All hero links resolve correctly

**TC07 — No old sections present**
1. Open `/gsd2-guide/`
2. Expected: No "Learn GSD", "Commands", "Recipes", or "Reference & Guides" section headings
3. Old content replaced by new structure

**TC08 — Build + link check**
1. Run `npm run build` → expect exit 0, 150 pages
2. Run `npm run check-links` → expect exit 0, 0 broken links

