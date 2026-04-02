# S05: Cross-linking & Wayfinding — UAT

**Milestone:** M008
**Written:** 2026-04-02T19:37:05.303Z

## UAT: S05 Cross-linking & Wayfinding

### Preconditions
- `npm run build` exits 0 with 150 pages
- Site served locally or checked via dist/

### Test Cases

**TC-01: Prev/Next pagination present on Solo Guide pages**
1. Check `dist/solo-guide/first-project/index.html`
2. Run: `grep -c 'pagination-links' dist/solo-guide/first-project/index.html`
3. Expected: returns 1 (pagination present)

**TC-02: Prev/Next pagination present on non-Solo Guide pages**
1. Check `dist/auto-mode/index.html`
2. Run: `grep -c 'pagination-links' dist/auto-mode/index.html`
3. Expected: returns 1

**TC-03: Audience-bridging callouts on 7+ pages**
1. Run: `grep -rl ':::tip' src/content/docs/ content/generated/docs/ | wc -l`
2. Expected: ≥7 (actual: 16)

**TC-04: Next Steps section on quick-reference.md**
1. Run: `grep -c '## Next Steps' src/content/docs/quick-reference.md`
2. Expected: ≥1

**TC-05: Generated files edited in correct location**
1. Run: `grep -c ':::tip' content/generated/docs/auto-mode.md content/generated/docs/getting-started.md content/generated/docs/configuration.md`
2. Expected: each file has ≥1 tip

**TC-06: All links valid**
1. Run: `npm run check-links`
2. Expected: 0 broken links

**TC-07: Custom footer markup preserved**
1. Run: `grep -c 'site-footer' dist/index.html`
2. Expected: ≥1 (custom footer class still rendered)

