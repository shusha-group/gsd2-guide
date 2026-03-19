---
id: S07
parent: M006
milestone: M006
provides:
  - Substantive narrative content for Section 5 (context-engineering.mdx) covering all five R067 topics
  - Substantive narrative content for Section 6 (controlling-costs.mdx) covering all five R068 topics
requires:
  - slice: S01
    provides: Solo-guide sidebar group registered and navigable; context-engineering.mdx and controlling-costs.mdx stubs exist
affects:
  - S08
key_files:
  - src/content/docs/solo-guide/context-engineering.mdx
  - src/content/docs/solo-guide/controlling-costs.mdx
key_decisions:
  - none
patterns_established:
  - Solo-guide pages end with "This is Section N of the GSD 2 Solo Guide." footer
  - Token profile framing: budget/balanced/quality as confidence-based choice, not just cost optimisation
  - Cross-references from controlling-costs back to context-engineering reinforce that context discipline is cost discipline
  - Agent-instructions.md evolution framing: constitution that grows more precise across milestones, not a one-time artefact
observability_surfaces:
  - wc -l src/content/docs/solo-guide/context-engineering.mdx → 128 (>100 ✅)
  - wc -l src/content/docs/solo-guide/controlling-costs.mdx → 114 (>100 ✅)
  - grep -c "→ gsd2-guide:" context-engineering.mdx → 8 (≥5 ✅)
  - grep -c "→ gsd2-guide:" controlling-costs.mdx → 9 (≥5 ✅)
  - npm run build → 113 pages, exit 0 ✅
  - npm run check-links → 12,288 internal links, 0 broken ✅
  - grep "solo-guide" content/generated/page-source-map.json → exit 1 (no matches) ✅
  - ls src/content/docs/solo-guide/*.mdx | wc -l → 9 ✅
drill_down_paths:
  - .gsd/milestones/M006/slices/S07/tasks/T01-SUMMARY.md
  - .gsd/milestones/M006/slices/S07/tasks/T02-SUMMARY.md
duration: ~28m
verification_result: passed
completed_at: 2026-03-19
---

# S07: Sections 5 & 6 — Context Engineering + Costs

**Wrote 128 lines of context engineering narrative (Section 5) and 114 lines of cost management narrative (Section 6); build exits 0 at 113 pages, link check passes at 12,288 internal links with 0 broken.**

## What Happened

T01 replaced the 8-line context-engineering.mdx stub with 128 lines of narrative prose covering all five R067 topics. The author read sibling pages (brownfield.mdx, why-gsd.mdx, daily-mix.mdx) to calibrate voice and then read the reference pages that must not be duplicated (configuration.md, knowledge.mdx, prefs.mdx, export.mdx) to know what to link rather than reproduce. The result treats context engineering from the practitioner's perspective — not "here are the files" but "here is how you think about and maintain them over time."

T02 replaced the 8-line controlling-costs.mdx stub with 114 lines covering all five R068 topics. It began with pre-flight observability fixes to both the S07 plan and T02 plan (adding concrete diagnostic commands for failure investigation), then read the three reference pages that must not be duplicated (cost-management.md, token-optimization.md, dynamic-model-routing.md). After writing the page it ran the full slice-level verification suite: build, link check, D068 guard, and file count.

Both pages share a structural pattern: opening paragraph that positions the section relative to its companion sections → five major topics separated by `---` and `##` headings → footer sentence. Neither page duplicates the reference page tables — they link to them and then explain the practitioner reasoning behind the mechanics. The cross-referencing is bidirectional: context-engineering links forward to controlling-costs, and controlling-costs links back to context-engineering in the cost patterns section to reinforce that context discipline is cost discipline.

The key thematic insight in Section 6's token profiles coverage — framing budget/balanced/quality as confidence-based choices rather than cost tiers — was established as a pattern for this slice and should inform Section 8's rhythm guidance.

## Verification

All nine slice-level verification checks passed:

| Check | Command | Result |
|---|---|---|
| context-engineering.mdx line count | `wc -l src/content/docs/solo-guide/context-engineering.mdx` | ✅ 128 (>100) |
| controlling-costs.mdx line count | `wc -l src/content/docs/solo-guide/controlling-costs.mdx` | ✅ 114 (>100) |
| context-engineering cross-ref count | `grep -c "→ gsd2-guide:" context-engineering.mdx` | ✅ 8 (≥5) |
| controlling-costs cross-ref count | `grep -c "→ gsd2-guide:" controlling-costs.mdx` | ✅ 9 (≥5) |
| Australian spelling (context-engineering) | `grep -c "behaviour\|recognise\|organise\|practise\|colour"` | ✅ 4 matches |
| Australian spelling (controlling-costs) | `grep -c "behaviour\|recognise\|organise\|practise\|colour"` | ✅ 1 match (`practise`) |
| Build | `npm run build 2>&1 \| grep "pages"` | ✅ 113 pages, exit 0 |
| Link check | `npm run check-links` | ✅ 12,288 links, 0 broken |
| D068 guard | `grep "solo-guide" content/generated/page-source-map.json` | ✅ exit 1 (no entries) |
| File count | `ls src/content/docs/solo-guide/*.mdx \| wc -l` | ✅ 9 |

## Requirements Advanced

- R067 — All five context engineering topics covered with substantive narrative prose (agent-instructions.md lifecycle, DECISIONS.md reasoning, KNOWLEDGE.md types/habit, reading GSD output, discussion quality)
- R068 — All five cost management topics covered with substantive narrative prose (flat-rate vs API landscape, token profiles as confidence-based choices, dynamic model routing, budget ceiling enforcement, typical cost patterns)
- R070 — `→ gsd2-guide:` notation applied: 8 cross-references in context-engineering.mdx, 9 in controlling-costs.mdx; all resolve
- R072 — Australian spelling confirmed in both files (recognise, behaviour, practise, colour)

## Requirements Validated

- R067 — context-engineering.mdx: 128 lines, 5 major sections, 8 cross-references, Australian spelling; build exits 0, link check exits 0
- R068 — controlling-costs.mdx: 114 lines, 5 major sections, 9 cross-references, Australian spelling; build exits 0, link check exits 0

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

None. Both pages were written in one pass per plan. No steering corrections needed.

## Known Limitations

- R066 (Section 1: Why GSD 2) and R071 (external citations) remain active — they are assigned to S06 which is still pending completion. S07 makes no attempt to close those requirements.
- R064 (Section 2) and R069 (Section 8) also remain active. S07 is not responsible for them.
- The controlling-costs.mdx cross-reference to `../building-rhythm/` (Section 8) will remain a forward reference until S08 writes that page. The link check confirms it resolves correctly because building-rhythm.mdx already exists as a stub.

## Follow-ups

- S08 should note that `../building-rhythm/` is cross-referenced from controlling-costs.mdx — the rhythm page should carry that expectation explicitly when written
- S08's closing verification should confirm all 9 solo-guide cross-references still resolve end-to-end before the milestone closes

## Files Created/Modified

- `src/content/docs/solo-guide/context-engineering.mdx` — replaced 8-line stub with 128-line narrative covering all five R067 topics
- `src/content/docs/solo-guide/controlling-costs.mdx` — replaced 8-line stub with 114-line narrative covering all five R068 topics
- `.gsd/milestones/M006/slices/S07/S07-PLAN.md` — added `## Observability / Diagnostics` section with concrete failure-path diagnostic commands
- `.gsd/milestones/M006/slices/S07/tasks/T01-PLAN.md` — added `## Observability Impact` section
- `.gsd/milestones/M006/slices/S07/tasks/T02-PLAN.md` — added `## Observability Impact` section

## Forward Intelligence

### What the next slice should know

- Both sections establish a reading arc: Section 5 ends by pointing to Section 6, Section 6 ends by pointing to Section 8 (building-rhythm). Section 8 should open by acknowledging that context engineering and cost management are already established — it builds on them, doesn't re-explain them.
- The token profile framing (budget/balanced/quality as confidence-based choices, not cost tiers) is a deliberate departure from how the reference docs frame them. Section 8's rhythm guidance should use the same framing if it references profiles.
- Australian spelling: both pages use `practise` (verb form, not `practice`), `recognise`, `behaviour`, `colour`. Section 8 should continue the same pattern.
- The `→ gsd2-guide:` notation with a space before the link, inside square-bracket label format, is now established across 6 completed sections. Use it identically in Section 8.

### What's fragile

- `../building-rhythm/` forward reference in controlling-costs.mdx — this link resolves because the stub exists. If S08 renames the file (it shouldn't — the stub was registered in S01), the link check will fail.
- No MDX imports or JSX in either page — pure prose. Any future edit that introduces curly braces in prose context (e.g. quoting template variables) needs backtick wrapping per the KNOWLEDGE.md MDX escaping note.

### Authoritative diagnostics

- `npm run build 2>&1 | grep -i "error"` — names file and line on MDX parse failure; first signal on any edit to these pages
- `npm run check-links 2>&1 | grep -v "^$"` — lists failing slugs; most likely failure if a cross-reference target is renamed
- `grep "solo-guide" content/generated/page-source-map.json` — D068 guard; must stay at exit 1 after S08

### What assumptions changed

- The plan assumed both pages would cross-reference each other. This was confirmed: context-engineering links to controlling-costs (in the final paragraph of the discussion answers section), and controlling-costs links back to context-engineering in the cost patterns section. The bidirectionality reinforces the core argument that context discipline is cost discipline.
