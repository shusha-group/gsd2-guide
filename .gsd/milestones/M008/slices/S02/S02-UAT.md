# S02: Sidebar Restructure — UAT

**Milestone:** M008
**Written:** 2026-04-02T13:19:00.617Z

## Preconditions
- `npm run build` has been run and `dist/` is current
- `npm run check-links` is available

## Test Cases

### TC-01: Build succeeds with 148 pages
**Steps:**
1. Run `npm run build` from project root
**Expected:** Exit 0, "148 page(s) built" in output, no errors

### TC-02: Zero broken links
**Steps:**
1. Run `npm run check-links` from project root
**Expected:** Exit 0, "20661 internal links checked — 0 broken" (or similar ≥20000 with 0 broken)

### TC-03: Exactly 5 top-level sidebar sections
**Steps:**
1. Run: `node -e "const fs=require('fs'); const h=fs.readFileSync('dist/index.html','utf8'); const spans=h.match(/<span[^>]*class=\"large[^\"]*\"[^>]*>[^<]+<\/span>/g); console.log(spans);"`
**Expected:** Array of exactly 5 elements: "Start Here", "Solo Builder's Guide", "Recipes", "Commands", "Learn More"

### TC-04: Sections appear in correct order
**Steps:**
1. From TC-03 output, verify order: Start Here → Solo Builder's Guide → Recipes → Commands → Learn More
**Expected:** Order matches exactly

### TC-05: Old top-level sections are gone
**Steps:**
1. Open `dist/index.html` and search for these terms as large/top-level labels: "Getting Started", "Deep Dives", "How-to Guides", "Reference", "Prompts", "Changelog"
**Expected:** None appear as `class="large"` top-level sidebar sections (they may appear as flat items inside Learn More or as page content)

### TC-06: Prompts group is collapsed by default
**Steps:**
1. Run: `node -e "const fs=require('fs'); const h=fs.readFileSync('dist/learn-more/index.html','utf8'); const details=h.match(/<details[^>]*>/g); console.log(details ? details.filter(d => !d.includes('open')) : 'none');"`
**Expected:** Prompts-related details elements do NOT have `open` attribute (they are collapsed)

### TC-07: Homepage and inner page sidebars are identical
**Steps:**
1. Run: `node -e "const fs=require('fs'); const h=fs.readFileSync('dist/index.html','utf8'); const g=fs.readFileSync('dist/getting-started/index.html','utf8'); const re=/aria-label=\"Main\"[\s\S]*?<\/nav>/; const hNav=h.match(re); const gNav=g.match(re); console.log('match:', hNav && gNav && hNav[0].replace(/aria-current=\"page\"/g,'')===gNav[0].replace(/aria-current=\"page\"/g,''));"`
**Expected:** "match: true" — sidebars are identical

### TC-08: All Getting Started items appear under Start Here
**Steps:**
1. View `dist/index.html` in browser or inspect HTML
2. Locate "Start Here" section in sidebar
3. Expand it and verify presence of: Is GSD Right for Me, Quick Reference, Writing a Good Brief, Cost Examples, Installation, Developing with GSD, Discussing a Milestone
**Expected:** All 7 items (plus Home link) present under Start Here

### TC-09: Deep Dives / How-to Guides / Reference items appear under Learn More
**Steps:**
1. Inspect sidebar HTML under Learn More section
2. Check that items from former Deep Dives, How-to Guides, and Reference groups appear as flat items
**Expected:** Items like "Auto Mode", "Skills", "Extensions" etc. accessible under Learn More without sub-group nesting

### TC-10: Solo Builder's Guide unchanged (9 items)
**Steps:**
1. Inspect sidebar under "Solo Builder's Guide"
**Expected:** Same 9 items as before restructure — no items added or removed
