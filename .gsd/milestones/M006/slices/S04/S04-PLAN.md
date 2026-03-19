# S04: Section 2 — Your First Project

**Goal:** The complete annotated new-project walkthrough is live — discussion phase, roadmap reading, auto mode first run, verification, and completion — with external citations to Addy Osmani and Esteban Torres.
**Demo:** `npm run build` exits 0, `npm run check-links` exits 0, `first-project.mdx` has >100 lines and ≥5 cross-references and ≥2 external citations.

## Must-Haves

- `src/content/docs/solo-guide/first-project.mdx` replaced with substantive content (~200–250 lines)
- Five lifecycle phases covered: discussion, roadmap reading, auto mode first run, verification, completion
- External citation to Addy Osmani's spec-first workflow (`https://addyosmani.com/blog/ai-coding-workflow/`)
- External citation to Esteban Torres's first-person GSD account (`https://estebantorr.es/blog/2026/2026-02-03-a-gsd-system-for-claude-code/`)
- ≥5 cross-references to existing gsd2-guide pages using `→ gsd2-guide:` notation
- Forward link to Section 4 (daily-mix) and Section 7 (when-things-go-wrong) within solo-guide
- Australian spelling throughout (behaviour, recognise, organisation, colour, practise/practice)
- `npm run build` exits 0 (no MDX parse errors)
- `npm run check-links` exits 0 (all cross-references valid)

## Verification

- `wc -l src/content/docs/solo-guide/first-project.mdx` — >100 lines
- `npm run build 2>&1 | grep "pages"` — 113 pages (same count, stub replaced with content)
- `npm run build 2>&1 | grep -i "error"` — no MDX parse errors
- `npm run check-links` — exits 0
- `grep -c "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx` — ≥5
- `grep -c "addyosmani.com\|estebantorr.es" src/content/docs/solo-guide/first-project.mdx` — ≥2

## Tasks

- [x] **T01: Write the full Section 2 walkthrough with external citations** `est:45m`
  - Why: This is the entire slice — replace the stub `first-project.mdx` with a complete annotated walkthrough covering all five GSD lifecycle phases, with external citations and cross-references.
  - Files: `src/content/docs/solo-guide/first-project.mdx`
  - Do: Write ~200–250 lines of MDX prose following the established patterns from `daily-mix.mdx` and `when-things-go-wrong.mdx`. Cover discussion, roadmap reading, auto mode, verification, and completion phases. Include Addy Osmani spec-first citation in the discussion section and Esteban Torres first-person account in the auto mode section. Use `→ gsd2-guide:` cross-reference notation for ≥5 links to reference pages. Forward-link to Section 4 and Section 7. Australian spelling throughout.
  - Verify: `npm run build` exits 0 at 113 pages; `npm run check-links` exits 0; `wc -l` >100; `grep -c` confirms ≥5 cross-refs and ≥2 external citations
  - Done when: All six verification checks pass

## Files Likely Touched

- `src/content/docs/solo-guide/first-project.mdx`

## Observability / Diagnostics

**Runtime signals:**
- `npm run build 2>&1 | grep "pages"` — page count tells you the file was picked up and compiled; if the count drops or errors appear the MDX has a parse problem
- `npm run check-links` stdout — lists every broken link with file and line number; exit code 0 is the authoritative pass signal
- `wc -l src/content/docs/solo-guide/first-project.mdx` — fast stub-replacement guard; <100 lines means the stub is still in place

**Inspection surfaces:**
- The built file at `.astro/` (or `dist/`) after `npm run build` renders the full HTML; open locally with `npm run dev` to visually verify formatting, callout rendering, and link targets
- `grep "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx` — lists every cross-reference; count and inspect targets manually if `check-links` is noisy

**Failure visibility:**
- MDX curly-brace syntax errors surface as `[ERROR]` lines in the build output; grep for `error` (case-insensitive) after `npm run build`
- A broken external URL won't fail `check-links` (external links are not checked by default); verify external URLs resolve by hand if needed
- Missing frontmatter title or description causes Astro to warn or skip the page in the sitemap

**Redaction:**
- No secrets or credentials involved; all content is static prose
