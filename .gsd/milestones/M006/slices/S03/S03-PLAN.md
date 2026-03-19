# S03: Section 7 — When Things Go Wrong

**Goal:** Replace the 7-line stub in `when-things-go-wrong.mdx` with a full practitioner-oriented failure guide covering 8 common failure scenarios, each with symptom recognition, recovery steps, and cross-references to the relevant reference documentation.
**Demo:** `when-things-go-wrong.mdx` has 150+ lines of substantive content. `npm run build` exits 0 at 113 pages. `npm run check-links` exits 0. At least 8 cross-reference callouts using "→ gsd2-guide:" notation and at least 6 command cross-references link to existing reference pages.

## Must-Haves

- 8 failure scenarios documented: auto-mode silence, stuck loops, UAT replan, cost spikes, orientation after time away, wrong output, provider errors, full state corruption
- Each scenario has: symptom recognition (how you notice it), recovery steps (1-3 concrete actions), and a cross-reference to the relevant deep-dive page
- Quick-lookup summary table at the top mapping symptoms to recovery actions
- Companion voice — plain English, not reference-doc procedural steps; links to `recipes/error-recovery/`, `commands/doctor/`, etc. instead of duplicating them
- No Mermaid diagram (the error-recovery recipe already has the definitive flowchart)
- Australian spelling throughout: recognise, behaviour, organise, practise (verb)
- Cross-references use proven format: `../../commands/slug/` for command pages, `../../slug/` for root pages, `../slug/` for sibling solo-guide pages
- All cross-references use "→ gsd2-guide:" prefix notation per D070

## Verification

- `npm run build 2>&1 | grep "pages"` → 113 pages, exit 0
- `npm run check-links` → exit 0
- `wc -l src/content/docs/solo-guide/when-things-go-wrong.mdx` → 150+ lines
- `grep -c "../../commands/" src/content/docs/solo-guide/when-things-go-wrong.mdx` → ≥6
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/when-things-go-wrong.mdx` → ≥8
- `npm run build 2>&1 | grep -A5 "solo-guide"` → no output (no MDX parse errors)
- `grep -iE "recognize|behavior|organize" src/content/docs/solo-guide/when-things-go-wrong.mdx` → no output (no American spellings)

## Tasks

- [ ] **T01: Write Section 7 failure guide with recovery scenarios and cross-references** `est:30m`
  - Why: This is the entire slice — replace the stub with the full Section 7 content covering 8 failure scenarios, each with symptom recognition, recovery steps, and cross-references to reference documentation.
  - Files: `src/content/docs/solo-guide/when-things-go-wrong.mdx`
  - Do: Rewrite the stub with 8 failure scenarios in companion voice (see T01-PLAN.md for full content structure, cross-reference targets, and style constraints). Include a summary table at the top. Follow daily-mix.mdx patterns for cross-reference notation, prose style, and Australian spelling.
  - Verify: `npm run build` exits 0 at 113 pages; `npm run check-links` exits 0; 150+ lines; ≥6 command cross-refs; ≥8 "→ gsd2-guide:" callouts; no American spellings; no build errors referencing solo-guide
  - Done when: All 7 verification commands in the slice verification section pass

## Files Likely Touched

- `src/content/docs/solo-guide/when-things-go-wrong.mdx`
