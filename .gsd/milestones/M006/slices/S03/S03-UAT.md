# S03: Section 7 — When Things Go Wrong — UAT

**Milestone:** M006
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S03 produces a single static MDX page. All success criteria are verifiable from the built artifacts: line count, cross-reference counts, build success, link resolution, and Australian spelling. No runtime server behaviour or user interaction required to prove delivery.

## Preconditions

1. Working directory is `/Users/davidspence/dev/gsd2-guide`
2. Node.js and npm are available
3. `src/content/docs/solo-guide/when-things-go-wrong.mdx` exists and is non-empty
4. `npm run build` has been run at least once (to produce `dist/`)

## Smoke Test

Run `npm run build 2>&1 | grep "pages"` — should output `113 page(s) built` with exit code 0. This confirms the file parses as valid MDX and the full site renders without errors.

## Test Cases

### 1. Content depth and substantive coverage

1. Run: `wc -l src/content/docs/solo-guide/when-things-go-wrong.mdx`
2. **Expected:** Output shows 150 or more lines (actual: 183). Confirms the stub has been replaced with substantive content.

---

### 2. Cross-reference callout count (companion voice completeness)

1. Run: `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/when-things-go-wrong.mdx`
2. **Expected:** Output is `18` (target ≥8). Confirms the companion voice is present and each scenario hands off to the relevant reference documentation.

---

### 3. Command page links (reference integration)

1. Run: `grep -c "../../commands/" src/content/docs/solo-guide/when-things-go-wrong.mdx`
2. **Expected:** Output is `9` (target ≥6). Confirms integration with the command reference documentation.

---

### 4. All cross-reference paths resolve (no broken links)

1. Run: `npm run build` (if not already built)
2. Run: `npm run check-links`
3. **Expected:** Output ends with `✅ N internal links checked — 0 broken` with exit code 0. Any non-zero exit or broken link count is a failure.

---

### 5. Build produces exactly 113 pages (no regressions, no new pages)

1. Run: `npm run build 2>&1 | grep "pages"`
2. **Expected:** `113 page(s) built in Xs`. Confirms no new pages were inadvertently added (all stubs were created in S01) and no existing pages were broken.

---

### 6. No MDX parse errors for solo-guide pages

1. Run: `npm run build 2>&1 | grep -A5 "solo-guide"`
2. **Expected:** Output shows the 9 solo-guide pages rendering (e.g., `├─ /solo-guide/when-things-go-wrong/index.html`) with no error lines following. No `error` or `warning` lines immediately after any solo-guide path.

---

### 7. Australian spelling — no American variants

1. Run: `grep -iE "recognize|behavior|organize" src/content/docs/solo-guide/when-things-go-wrong.mdx`
2. **Expected:** No output, exit code 1. Any output means an American spelling slipped through.

---

### 8. All 8 failure scenarios are present

1. Run: `grep -c "^### " src/content/docs/solo-guide/when-things-go-wrong.mdx`
2. **Expected:** Output is `8`. Confirms all 8 required scenario subsections exist.

---

### 9. Quick-lookup table is present

1. Run: `grep -c "^| What you're seeing" src/content/docs/solo-guide/when-things-go-wrong.mdx`
2. **Expected:** Output is `1`. Confirms the quick-lookup table header row exists.

---

### 10. Section renders in browser at correct URL

1. Run `npm run build` then serve dist locally OR navigate to the GitHub Pages deployment.
2. Navigate to `/gsd2-guide/solo-guide/when-things-go-wrong/`
3. **Expected:**
   - Page title reads "When Things Go Wrong"
   - Quick-lookup table renders with 8 rows
   - Eight `###` subsection headings are visible
   - Each scenario subsection ends with one or more "→ gsd2-guide:" cross-reference links
   - No raw MDX syntax visible (no unrendered `---` markers, no raw link syntax)
   - Page is reachable from the "Solo Builder's Guide" sidebar group

## Edge Cases

### American spelling in a quoted command or code block

1. Inspect the file: `grep -n "recognize\|behavior\|organize" src/content/docs/solo-guide/when-things-go-wrong.mdx`
2. **Expected:** No matches at all — even quoted command output or inline code should use Australian variants (or avoid spelling-sensitive words entirely).

---

### Cross-reference to a page that doesn't exist yet

1. Extract all relative links: `grep -oE '\.\./\.\./[^)]+' src/content/docs/solo-guide/when-things-go-wrong.mdx | sort -u`
2. For each path, confirm the built HTML exists: `ls dist/{path}/index.html`
3. **Expected:** All 14 unique cross-reference targets have corresponding `index.html` files in `dist/`. The `npm run check-links` test (Test Case 4) proves this programmatically.

---

### Stub frontmatter accidentally overwritten

1. Run: `grep "^title:" src/content/docs/solo-guide/when-things-go-wrong.mdx`
2. **Expected:** `title: "When Things Go Wrong"` — exact match. Any other value means frontmatter was corrupted.

---

### Page excluded from pipeline (not in page-source-map.json)

1. Run: `grep "when-things-go-wrong" src/page-source-map.json`
2. **Expected:** No output (exit 1 = pass). Confirms the page is excluded from the LLM regeneration pipeline and cannot be overwritten by `npm run update`.

## Failure Signals

- `npm run build` exits non-zero → MDX parse error or frontmatter missing; check build output for the specific file and line
- `npm run check-links` reports broken links → a cross-reference path is wrong; the output names the exact broken URL
- `wc -l` returns fewer than 150 → stub content wasn't replaced; file may have been accidentally reverted
- `grep -c "→ gsd2-guide:"` returns fewer than 8 → companion voice cross-references are incomplete or were edited out
- `grep -iE "recognize|behavior|organize"` returns matches → American spelling was introduced; fix before marking complete
- `grep "pages"` build output shows anything other than 113 → unexpected page count change; investigate what was added or removed
- Page title shows "Section 7" or something other than "When Things Go Wrong" in browser → frontmatter title field is wrong

## Requirements Proved By This UAT

- R063 — When Things Go Wrong section is fully documented: 8 failure scenarios with symptom recognition, recovery steps, and cross-references; link checker proves all paths resolve; Australian spelling verified
- R070 — Cross-reference notation "→ gsd2-guide: [Title](../../path/)" is consistently applied (18 callouts confirmed by grep); pattern proven across S02 + S03
- R072 — Australian spelling passes grep verification; no American variants in when-things-go-wrong.mdx

## Not Proven By This UAT

- Whether the content accurately describes real GSD behaviour for each failure scenario — this requires human review against actual GSD usage (operational/UAT concern for the full guide, not this slice alone)
- Browser rendering at the live GitHub Pages URL (deferred to S08 operational verification)
- `npm run update` end-to-end deploy (deferred to S08)
- That all 8 sections are complete and cross-linked (deferred to S08 final integration)

## Notes for Tester

The quick-lookup table at the top is the fastest sanity check for human reviewers — if it has 8 rows and each row makes sense, the section content is structurally sound.

The "Coming back after time away" scenario (scenario 5) is intentionally framed as an orientation problem rather than a technical failure — this is deliberate. The recovery steps are `/gsd status` then `/gsd next`, not a repair procedure. This framing is correct; don't "fix" it to look more like the other recovery scenarios.

The "UAT failed and the slice is replanning" scenario (scenario 3) tells users to wait, not to intervene. This is also intentional — GSD's replan mechanism is self-correcting, and the most common mistake is users intervening when they shouldn't. The content is written to address that failure mode.
