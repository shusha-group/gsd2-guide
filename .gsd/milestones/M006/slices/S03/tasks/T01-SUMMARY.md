---
id: T01
parent: S03
milestone: M006
provides:
  - Full Section 7 failure guide with 8 scenarios, summary table, and 18 cross-reference callouts
key_files:
  - src/content/docs/solo-guide/when-things-go-wrong.mdx
key_decisions:
  - Used backslash line continuation (\) for multi-link cross-reference blocks (same pattern as daily-mix.mdx) to keep each gsd2-guide callout on one visual line without redundant headings
patterns_established:
  - Companion guide structure: opening framing → quick-lookup table → ### scenario subsections → closing escalation paragraph
  - Each scenario: symptom paragraph + cause paragraph + numbered/prose recovery steps + gsd2-guide cross-refs
  - Horizontal rule (---) between scenarios for visual separation without adding extra heading levels
observability_surfaces:
  - wc -l src/content/docs/solo-guide/when-things-go-wrong.mdx → 183 lines
  - grep -c "→ gsd2-guide:" ... → 18
  - grep -c "../../commands/" ... → 9
  - npm run check-links → 0 broken links
duration: 15m
verification_result: passed
completed_at: 2026-03-19T21:15:00+11:00
blocker_discovered: false
---

# T01: Write Section 7 failure guide with recovery scenarios and cross-references

**Replaced the 7-line stub in `when-things-go-wrong.mdx` with 183 lines of companion-voice failure guide covering 8 scenarios, a quick-lookup table, and 18 cross-reference callouts to reference documentation.**

## What Happened

Read the four reference files (error-recovery recipe, auto-mode.md, daily-mix.mdx style reference, current stub) to understand the voice, cross-reference notation, and what content already existed in the deep-dive pages. The key constraint was "companion voice, not reference doc" — describe the mental model and link to the step-by-step, don't duplicate it.

Fixed the observability gaps in S03-PLAN.md and T01-PLAN.md first (added `## Observability / Diagnostics` and `## Observability Impact` sections respectively).

Wrote the full content in one pass: opening paragraph establishing the companion framing, quick-lookup table (8 rows), 8 failure scenario subsections with `###` headings separated by horizontal rules, and a closing escalation paragraph. Used backslash line continuation for multi-link cross-reference blocks — the same pattern implicit in daily-mix.mdx — which keeps each "→ gsd2-guide:" callout visually clear without needing repeated headings.

Verified Australian spelling, cross-reference counts, and ran the full build + check-links suite before writing the summary.

## Verification

All 7 verification commands passed:

1. `npm run build 2>&1 | grep "pages"` — 113 pages, exit 0
2. `npm run check-links` — 12,288 internal links, 0 broken, exit 0
3. `wc -l ... when-things-go-wrong.mdx` — 183 lines (target: 150+)
4. `grep -c "../../commands/" ...` — 9 (target: ≥6)
5. `grep -c "→ gsd2-guide:" ...` — 18 (target: ≥8)
6. `npm run build 2>&1 | grep -A5 "solo-guide"` — all solo-guide pages render without errors
7. `grep -iE "recognize|behavior|organize" ...` — no output (exit 1, no matches = pass)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build 2>&1 \| grep "pages"` | 0 | ✅ pass | 5.6s |
| 2 | `npm run check-links` | 0 | ✅ pass | 3.8s |
| 3 | `wc -l src/content/docs/solo-guide/when-things-go-wrong.mdx` | 0 | ✅ pass (183 lines) | <1s |
| 4 | `grep -c "../../commands/" ...` | 0 | ✅ pass (9 matches) | <1s |
| 5 | `grep -c "→ gsd2-guide:" ...` | 0 | ✅ pass (18 matches) | <1s |
| 6 | `npm run build 2>&1 \| grep -A5 "solo-guide"` | 0 | ✅ pass (no errors) | 5.6s |
| 7 | `grep -iE "recognize\|behavior\|organize" ...` | 1 | ✅ pass (no matches) | <1s |

## Diagnostics

- File is pure MDX content — no runtime signals beyond the build system
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/when-things-go-wrong.mdx` → should return 18
- `npm run check-links` verifies all 14 cross-reference target paths resolve correctly
- Any future edit that breaks a relative path will surface immediately in check-links as a broken URL with the exact path

## Deviations

- Improved the frontmatter `description` field from the stub's generic phrasing to a more specific one ("How to recognise and recover from the 8 most common failure scenarios you'll hit as a solo builder using GSD.") — this is a strict improvement, not a deviation from intent.
- Used horizontal rules (`---`) between scenarios for visual separation; plan was silent on spacing, and this matches common Starlight companion page patterns.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — replaced 7-line stub with full 183-line Section 7 companion guide
- `.gsd/milestones/M006/slices/S03/S03-PLAN.md` — added `## Observability / Diagnostics` section (pre-flight fix)
- `.gsd/milestones/M006/slices/S03/tasks/T01-PLAN.md` — added `## Observability Impact` section (pre-flight fix)
