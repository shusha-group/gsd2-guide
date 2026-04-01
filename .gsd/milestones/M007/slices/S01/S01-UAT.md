# S01: Quick Reference + Decision Guide — UAT

**Milestone:** M007
**Written:** 2026-04-01T23:39:41.722Z

## UAT: S01 — Quick Reference + Decision Guide

### Preconditions
- `npm run build` completes successfully (exit 0)
- `dist/` directory is populated

### Test Cases

**TC-01: Quick Reference page renders**
1. Check `dist/quick-reference/index.html` exists → file present
2. Open the built site and navigate to `/quick-reference/`
3. Expected: Page loads with title "Quick Reference" and lists commands grouped under workflow phase headings (Start, Plan, Execute, Monitor, Manage)

**TC-02: Decision Guide page renders**
1. Check `dist/is-gsd-right-for-me/index.html` exists → file present
2. Navigate to `/is-gsd-right-for-me/`
3. Expected: Page loads with fit-assessment content including positive use cases and what GSD is NOT for

**TC-03: Sidebar placement**
1. On any page in the built site, inspect the left sidebar
2. Expected: "Getting Started" group contains "Is GSD Right for Me?" as first item, "Quick Reference" as second item (both before Installation)

**TC-04: Link integrity**
1. Run `npm run check-links`
2. Expected: exit 0, 0 broken links (verified: 18975 links, 0 broken)

**TC-05: Pages not in generated manifest**
1. Run `grep -r "quick-reference\|is-gsd-right-for-me" src/content/docs/.generated-manifest.json`
2. Expected: no matches (hand-authored pages must not be in the generated manifest)

**TC-06: Build with no errors**
1. Run `npm run build`
2. Expected: exit 0, 142 pages built, no errors or warnings about the new pages

