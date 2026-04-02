# S06: New Content Pages — UAT

**Milestone:** M008
**Written:** 2026-04-02T19:46:37.872Z

## UAT: S06 New Content Pages

### Preconditions
- Site built (`npm run build`) with 156 pages
- Link checker passes (`npm run check-links`) with 0 broken links

---

### Test 1: Choose Your Path page exists and is reachable
1. Open `/choose-your-path/` in the browser (or check `dist/choose-your-path/index.html` exists)
2. Verify sidebar shows "Choose Your Path" under Start Here section
3. Verify page contains 3 labelled paths: "Solo Business Builder", "Developer New to AI Coding", "Experienced AI Developer"
4. Verify each path is a numbered checklist with 7+ page links
5. Click a link in the Solo Builder path — should navigate to an existing page without 404

**Expected:** Page loads, 3 paths visible, links resolve correctly.

---

### Test 2: Is GSD Right for Me is a persona-routing decision tree
1. Open `/is-gsd-right-for-me/`
2. Verify page still contains a quick assessment table (retained from original)
3. Verify page has "Where are you coming from?" section with 3 personas
4. Verify each persona section links to Choose Your Path (e.g. `../choose-your-path/`)
5. Verify links to bridge pages (coming-from-replit, coming-from-lovable, coming-from-cursor) are present and resolve

**Expected:** Decision tree structure visible, all links resolve.

---

### Test 3: Bridge pages are unlisted (not in sidebar)
1. Check sidebar — "Coming from Replit", "Coming from Lovable", "Coming from Cursor" should NOT appear anywhere
2. Navigate directly to `/coming-from-replit/`, `/coming-from-lovable/`, `/coming-from-cursor/`
3. Each page should load without 404

**Expected:** Pages accessible via direct URL, absent from sidebar.

---

### Test 4: Bridge pages contain comparison tables and routing
1. Open `/coming-from-replit/`
2. Verify comparison table (Replit vs GSD) is present
3. Verify page links to `../choose-your-path/` for the Solo Builder path
4. Repeat for `/coming-from-lovable/` (Solo Builder route) and `/coming-from-cursor/` (Developer route)

**Expected:** Each bridge page has comparison table and routes to correct learning path.

---

### Test 5: FAQ page is in sidebar and contains 11+ questions
1. Open `/faq/`
2. Verify sidebar shows "FAQ" under Start Here section
3. Count question headings — should be at least 11
4. Verify at least one answer links to another page (e.g. pricing, getting-started)

**Expected:** FAQ accessible from sidebar, 11+ questions, links present.

---

### Test 6: Glossary page is in sidebar and contains defined terms
1. Open `/glossary/`
2. Verify sidebar shows "Glossary" under Learn More section
3. Verify alphabetical listing with ~25 terms
4. Spot-check: "milestone", "slice", "auto-mode", "UAT" should all be defined

**Expected:** Glossary accessible from sidebar, 25 terms present and defined.

---

### Test 7: Zero broken links (automated)
```
npm run check-links
```
**Expected:** `22208 internal links checked — 0 broken`

---

### Edge Cases
- Navigate to `/coming-from-replit/` without being logged in or having any auth — page loads as static HTML
- Check that `.generated-manifest.json` does NOT contain any of the 7 new pages (they are hand-authored)

