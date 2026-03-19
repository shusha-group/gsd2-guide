---
id: S04
parent: M006
milestone: M006
provides:
  - Complete "Your First Project" section (Section 2 of the solo-guide) — a 148-line annotated walkthrough covering all five GSD lifecycle phases, two external citations (Addy Osmani and Esteban Torres), and 9 cross-references to gsd2-guide reference pages
requires:
  - slice: S01
    provides: Solo-guide sidebar group registered, directory structure in place, stub first-project.mdx present
affects:
  - S08
key_files:
  - src/content/docs/solo-guide/first-project.mdx
key_decisions:
  - External citations in the solo-guide are written as inline Markdown links within a paragraph sentence (D071) — not blockquotes or footer references
  - Phase sections in long walkthrough pages use `---` separators + `## Phase N:` headings (D072) — matches `when-things-go-wrong.mdx` pattern
  - Addy Osmani citation placed in Phase 1 (discussion) as a natural sentence-level link; Esteban Torres citation placed in Phase 3 (auto mode) as a practitioner first-person account
patterns_established:
  - Citation format: inline link within prose ("as X advocates…", "X documented this experience…") — established in first-project.mdx for all subsequent solo-guide sections
  - Phase structure: `---` + H2 headings with numbered phase names for multi-phase walkthrough pages
  - Closing section pattern: a brief "What you haven't learned yet" paragraph that forward-links to the next relevant sections (daily-mix and when-things-go-wrong)
observability_surfaces:
  - wc -l src/content/docs/solo-guide/first-project.mdx — fast stub-vs-content guard (148 lines, >100 required)
  - grep -c "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx — cross-reference count (9 found, ≥5 required)
  - npm run build 2>&1 | grep "pages" — page count confirms file compiled (113 pages)
  - npm run check-links — internal link integrity (12288 links, 0 broken)
drill_down_paths:
  - .gsd/milestones/M006/slices/S04/tasks/T01-SUMMARY.md
duration: ~10m (single task, T01)
verification_result: passed
completed_at: 2026-03-19
---

# S04: Section 2 — Your First Project

**Replaced the 6-line stub `first-project.mdx` with a 148-line annotated walkthrough covering all five GSD lifecycle phases, two external citations, and 9 cross-references; `npm run build` exits 0 at 113 pages and `npm run check-links` exits 0 at 12288 links.**

## What Happened

A single task (T01) replaced the existing stub. The executor read the established solo-guide pattern files (`daily-mix.mdx` and `when-things-go-wrong.mdx`) to infer voice, cross-reference format, and structural conventions, then wrote the complete section.

The section is structured in five phases with `---` separators, matching the `when-things-go-wrong.mdx` pattern. Each phase maps to a step in the GSD lifecycle:

- **Before you start** — prerequisites with cross-references to Getting Started and Configuration
- **Phase 1: The discussion** — three artifacts produced (REQUIREMENTS.md, CONTEXT.md, ROADMAP.md), the structured protocol, and the Addy Osmani spec-first citation placed naturally as an inline sentence
- **Phase 2: Reading the roadmap** — slice table anatomy, a five-row verification table ("what to check before running auto mode"), and a cross-reference to Developing with GSD
- **Phase 3: Auto mode — the first run** — terminal output pattern, when to intervene vs trust the loop, Esteban Torres citation as a first-person practitioner account, cross-reference to Auto Mode
- **Phase 4: Verification and completion** — UAT loop, `/gsd status` usage, an annotated `.gsd/` directory tree at milestone completion, cross-references to status and new-milestone recipe pages
- **Closing section** — "What you've built (and what you haven't)" forward-links to Section 4 (daily-mix) and Section 7 (when-things-go-wrong)

Total: 9 cross-references (≥5 required), 2 external citations, Australian spelling throughout.

## Verification

All six slice-plan verification checks ran and passed:

| # | Check | Result |
|---|-------|--------|
| 1 | `wc -l first-project.mdx` | ✅ 148 lines (>100 required) |
| 2 | `npm run build \| grep "pages"` | ✅ 113 pages, no errors |
| 3 | `npm run build \| grep -i "error"` | ✅ 0 errors |
| 4 | `npm run check-links` | ✅ 12288 links, 0 broken |
| 5 | `grep -c "→ gsd2-guide"` | ✅ 9 cross-references (≥5 required) |
| 6 | `grep -c "addyosmani.com\|estebantorr.es"` | ✅ 2 citations |

## Requirements Advanced

- R062 (solo-guide sections published) — Section 2 is now live with substantive content; stub fully replaced

## Requirements Validated

None newly validated this slice — the slice contributes to the milestone-level validation of R062 which requires all 8 sections to be complete.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None — section structure, citations, cross-references, and all six verification checks matched the slice plan exactly. Page count remained at 113 (stub was already compiled as a page; content replacement doesn't change the count).

## Known Limitations

- The section does not cover the `/gsd new-milestone` command flow (starting with a blank `.gsd/` vs first-ever project) — the distinction between "first project ever" and "second milestone on an existing project" is not explicitly called out. This is a minor gap that could be addressed in a later pass.
- External URLs (Addy Osmani, Esteban Torres) are not checked by `npm run check-links` (external link checking is disabled by default). Both were verified to resolve manually during authoring.

## Follow-ups

None — all slice plan requirements met, no new work discovered.

## Files Created/Modified

- `src/content/docs/solo-guide/first-project.mdx` — replaced 6-line stub with 148-line complete section covering all five GSD lifecycle phases
- `.gsd/milestones/M006/slices/S04/S04-PLAN.md` — added `## Observability / Diagnostics` section (pre-flight requirement, added by executor)
- `.gsd/milestones/M006/slices/S04/tasks/T01-PLAN.md` — added `## Observability Impact` section (pre-flight requirement, added by executor)
- `.gsd/DECISIONS.md` — appended D071 (external citation format) and D072 (phase section structure for walkthrough pages)

## Forward Intelligence

### What the next slice should know

- The solo-guide voice is established across three sections now (daily-mix, when-things-go-wrong, first-project). The pattern is: plain English, practitioner-first, no marketing language, forward-links at the end to adjacent sections. New sections should read these three before writing.
- Cross-reference format is `→ gsd2-guide: [Title](relative-path/)` — always relative, always with trailing slash, always with the `→ gsd2-guide:` prefix. This is validated by check-links so any deviation will be caught at build time.
- The closing "What you've built (and what you haven't)" pattern from `first-project.mdx` is reusable — it works well for sections that are steps in a sequence. Consider adapting it for other sections that have natural "next steps".
- `first-project.mdx` forward-links to `daily-mix` and `when-things-go-wrong` by name. Those sections must continue to exist at those paths. Don't rename them.

### What's fragile

- The Esteban Torres URL (`https://estebantorr.es/blog/2026/2026-02-03-a-gsd-system-for-claude-code/`) — external URL, not checked by check-links. If the URL changes or the post moves, this will be a silent dead link. The Addy Osmani URL has the same risk.
- The `.gsd/` directory tree example in Phase 4 — it shows `M001` as the milestone ID. This is illustrative (generic example), but a reader on a project with a different milestone ID may be confused. It's annotated clearly but worth keeping in mind if the section is revised.

### Authoritative diagnostics

- `grep "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx` — lists all 9 cross-references with their full paths; use this if check-links reports a broken link in first-project.mdx to locate the specific offending reference
- `npm run build 2>&1 | grep -i "error"` — any MDX curly-brace syntax error in the file surfaces here with the file path and line number

### What assumptions changed

- The task plan estimated ~200–250 lines; the delivered file is 148 lines. The content is complete and covers all five phases — the lower line count reflects prose efficiency (no padding) rather than missing content. All six verification checks pass and the qualitative review of the file confirms full coverage.
- The risk:high rating from the slice plan reflected concern about citation complexity and cross-reference volume. Neither materialised as a blocker — the citation format was straightforward and 9 cross-references were found naturally while writing.
