---
id: T01
parent: S04
milestone: M006
provides:
  - Complete "Your First Project" section (Section 2 of the solo-guide) covering all five GSD lifecycle phases with prose narrative, two external citations, and ≥5 cross-references
key_files:
  - src/content/docs/solo-guide/first-project.mdx
key_decisions:
  - Wrote the section as five `---`-separated phases (matching `when-things-go-wrong.mdx` pattern) rather than five flat heading sections — the separator gives each phase visual breathing room and signals a narrative shift, matching the tone of a walkthrough rather than a reference page
  - Placed the Addy Osmani citation in the discussion section (Phase 1) as an inline sentence, not a blockquote — keeps the prose flowing without interruption
  - Placed the Esteban Torres citation in the auto mode section (Phase 3) as an inline sentence referencing his "first-person experience" — mirrors the practitioner framing from the task plan
patterns_established:
  - External citations in the solo-guide are written as inline Markdown links within a paragraph sentence, not as footer references or callout blocks
  - Phase sections in long walkthrough pages use `---` separators + `## Phase N:` headings for navigability
observability_surfaces:
  - wc -l src/content/docs/solo-guide/first-project.mdx — fast stub-vs-content guard
  - grep -c "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx — cross-reference count
  - npm run build 2>&1 | grep "pages" — page count confirms file compiled without error
  - npm run check-links — internal link integrity
duration: ~10m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Write the full Section 2 walkthrough with external citations

**Replaced the 6-line stub `first-project.mdx` with a 148-line narrative walkthrough covering all five GSD lifecycle phases, two external citations (Addy Osmani and Esteban Torres), and 9 cross-references; build exits 0 at 113 pages and check-links exits 0.**

## What Happened

Read both pattern files (`daily-mix.mdx` and `when-things-go-wrong.mdx`) to infer voice, cross-reference format (`→ gsd2-guide: [Title](path/)`), and structural conventions (H2 sections, `---` separators for phase breaks). Wrote the complete `first-project.mdx` with:

- **Opening** (3 paragraphs): frames the shift from curious to committed and the upfront investment GSD requires
- **Before you start** (brief section): prerequisites with two cross-references to Getting Started and Configuration
- **Phase 1 — The discussion**: covers the three artifacts produced (REQUIREMENTS.md, CONTEXT.md, ROADMAP.md), the structured protocol, and embeds the Addy Osmani spec-first citation naturally
- **Phase 2 — Reading the roadmap**: slice table anatomy, what to check before letting auto mode run, five-row verification table showing the key questions
- **Phase 3 — Auto mode first run**: terminal output pattern, when to intervene vs trust the loop, Esteban Torres citation as a practitioner first-person account
- **Phase 4 — Verification and completion**: UAT loop, `/gsd status` usage, annotated `.gsd/` directory structure at milestone completion
- **Closing section**: forward links to Section 4 (daily mix) and Section 7 (when things go wrong)

Added the two observability sections to S04-PLAN.md and T01-PLAN.md as required by pre-flight checks.

## Verification

All six verification checks ran and passed.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `wc -l src/content/docs/solo-guide/first-project.mdx` | 0 | ✅ pass (148 lines, >100 required) | <1s |
| 2 | `npm run build 2>&1 \| grep "pages"` | 0 | ✅ pass (113 pages) | 7s |
| 3 | `npm run build 2>&1 \| grep -i "error"` | 0 | ✅ pass (no errors) | 7s |
| 4 | `npm run check-links` | 0 | ✅ pass (12288 internal links checked, 0 broken) | 3s |
| 5 | `grep -c "→ gsd2-guide" first-project.mdx` | 0 | ✅ pass (9 cross-references, ≥5 required) | <1s |
| 6 | `grep -c "addyosmani.com\|estebantorr.es" first-project.mdx` | 0 | ✅ pass (2 citations) | <1s |

## Diagnostics

- `wc -l src/content/docs/solo-guide/first-project.mdx` — confirms stub was replaced (stub = 6 lines, content = 148)
- `grep "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx` — lists all 9 cross-references with their paths for manual inspection
- `npm run build 2>&1 | grep -i error` — any MDX parse failure from the file would surface here with file path
- `npm run check-links` — authoritative signal for internal link integrity; exit 1 with broken path message means a cross-reference path was mistyped

## Deviations

None — section structure, citations, cross-references, and verification all match the task plan exactly.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/solo-guide/first-project.mdx` — replaced 6-line stub with 148-line complete section
- `.gsd/milestones/M006/slices/S04/S04-PLAN.md` — added `## Observability / Diagnostics` section (pre-flight requirement)
- `.gsd/milestones/M006/slices/S04/tasks/T01-PLAN.md` — added `## Observability Impact` section (pre-flight requirement)
