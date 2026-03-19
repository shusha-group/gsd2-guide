---
id: S03
parent: M006
milestone: M006
provides:
  - Full Section 7 failure guide — 183 lines, 8 failure scenarios, quick-lookup table, 18 cross-reference callouts, 9 command page links
requires:
  - slice: S01
    provides: Solo-guide sidebar group registered; when-things-go-wrong.mdx stub in place
affects:
  - S08
key_files:
  - src/content/docs/solo-guide/when-things-go-wrong.mdx
key_decisions:
  - Backslash line continuation (\) for multi-link cross-reference blocks — keeps each "→ gsd2-guide:" callout on one visual line without redundant headings (same implicit pattern as daily-mix.mdx)
  - Horizontal rules (---) between scenarios for visual separation without extra heading levels — matches common Starlight companion page patterns
patterns_established:
  - Companion guide structure: opening framing paragraph → quick-lookup table → ### scenario subsections separated by --- → closing escalation paragraph
  - Each scenario follows: symptom paragraph + cause paragraph + numbered/prose recovery steps + cross-reference callouts
  - "→ gsd2-guide: [Title](../../path/)" notation with backslash continuation for multi-link blocks
observability_surfaces:
  - wc -l src/content/docs/solo-guide/when-things-go-wrong.mdx → 183 lines
  - grep -c "→ gsd2-guide:" src/content/docs/solo-guide/when-things-go-wrong.mdx → 18
  - grep -c "../../commands/" src/content/docs/solo-guide/when-things-go-wrong.mdx → 9
  - npm run check-links → 12,288 links checked, 0 broken
drill_down_paths:
  - .gsd/milestones/M006/slices/S03/tasks/T01-SUMMARY.md
duration: 15m
verification_result: passed
completed_at: 2026-03-19T21:17:00+11:00
---

# S03: Section 7 — When Things Go Wrong

**Replaced the 7-line stub with a 183-line companion-voice failure guide covering 8 failure scenarios, a quick-lookup table, and 18 cross-reference callouts — all verified by full build and link check.**

## What Happened

T01 replaced the `when-things-go-wrong.mdx` stub in a single focused pass. The executor read four reference files first (error-recovery recipe, auto-mode.md, daily-mix.mdx for style reference, current stub) to absorb the companion voice and cross-reference notation before writing anything.

The content architecture is:
- **Opening framing paragraph** — establishes the companion stance ("these are predictable, recoverable situations")
- **Quick-lookup table** — 8-row summary mapping symptom → cause → immediate action for fast scanning
- **8 scenario subsections** at `###` depth, each covering: what you're seeing, what's happening, what to do (numbered steps), and 1–3 cross-reference callouts
- **Closing escalation paragraph** — directs readers to the error-recovery recipe for anything not covered

The 8 scenarios documented:
1. Auto-mode went quiet (stale lock / process crash)
2. The same unit keeps failing (stuck loop detection)
3. UAT failed and the slice is replanning (expected GSD behaviour)
4. Costs are spiking (token profile / model routing / stuck loop causes)
5. Coming back after time away (orientation problem, not technical failure)
6. The agent wrote the wrong thing (underspecified brief / wrong judgement call)
7. Provider errors (rate limits vs auth errors — different handling)
8. Full state corruption (doctor heal → forensics → manual repair escalation ladder)

Cross-reference targets validated by `npm run check-links`:
- `../../recipes/error-recovery/` (×2)
- `../../recipes/uat-failures/`
- `../../commands/doctor/` (×2)
- `../../commands/skip/`
- `../../commands/steer/` (×2)
- `../../commands/status/`
- `../../commands/next/`
- `../../commands/undo/`
- `../../commands/forensics/`
- `../../cost-management/`
- `../controlling-costs/`
- `../../troubleshooting/` (×2)

Backslash line continuation was used for multi-link cross-reference blocks — the same pattern implicit in daily-mix.mdx — keeping each callout on its own visual line without needing repeated `→ gsd2-guide:` prefixes on a single continuation.

## Verification

All 7 slice-level verification commands passed:

| # | Command | Result | Verdict |
|---|---------|--------|---------|
| 1 | `npm run build 2>&1 \| grep "pages"` | 113 pages, exit 0 | ✅ |
| 2 | `npm run check-links` | 12,288 links, 0 broken | ✅ |
| 3 | `wc -l ... when-things-go-wrong.mdx` | 183 lines (≥150 target) | ✅ |
| 4 | `grep -c "../../commands/" ...` | 9 (≥6 target) | ✅ |
| 5 | `grep -c "→ gsd2-guide:" ...` | 18 (≥8 target) | ✅ |
| 6 | `npm run build 2>&1 \| grep -A5 "solo-guide"` | All 9 solo-guide pages render, no parse errors | ✅ |
| 7 | `grep -iE "recognize\|behavior\|organize" ...` | No matches (exit 1 = pass) | ✅ |

## Requirements Advanced

- R063 — When Things Go Wrong section now exists with 8 failure scenarios, symptom/recovery/cross-ref structure; link checker proves all 14 target paths resolve

## Requirements Validated

- R063 — Fully delivered: 183 lines covering all 8 required failure scenarios (stuck detection, auto-mode crash, UAT replan, cost spikes, orientation, wrong output, provider errors, state corruption); `npm run check-links` exits 0 proving all cross-references valid; Australian spelling verified
- R070 — Further advanced: 18 "→ gsd2-guide:" callouts in when-things-go-wrong.mdx confirm the cross-reference notation pattern is consistently applied across both companion guide sections now live (S02 + S03)
- R072 — Further advanced: Australian spelling grep passes for S03 content; pattern confirmed working for companion guide pages

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

- Improved the stub's `description` frontmatter field from generic to specific ("How to recognise and recover from the 8 most common failure scenarios you'll hit as a solo builder using GSD.") — strict improvement, not a deviation from intent.
- Used horizontal rules (`---`) between scenarios for visual separation. The plan was silent on inter-scenario spacing; this matches common Starlight companion page patterns and the daily-mix.mdx aesthetic.

## Known Limitations

None. The section is fully substantive — not a stub, not placeholder content. All 8 required failure scenarios are documented with symptom recognition, recovery steps, and cross-references.

The one intentional content decision: no Mermaid diagram (per plan constraint). The error-recovery recipe already has the definitive recovery ladder flowchart; duplicating it here would be maintenance burden without reader value.

## Follow-ups

None from S03 itself. S08 (final integration slice) will perform end-to-end browser verification of the full guide including this section.

## Files Created/Modified

- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — 7-line stub replaced with full 183-line Section 7 companion guide
- `.gsd/milestones/M006/slices/S03/S03-PLAN.md` — added `## Observability / Diagnostics` section (pre-flight improvement)
- `.gsd/milestones/M006/slices/S03/tasks/T01-PLAN.md` — added `## Observability Impact` section (pre-flight improvement)

## Forward Intelligence

### What the next slice should know

- The companion guide voice is now established and verified across two sections (S02 daily-mix, S03 when-things-go-wrong). The pattern is: opening framing → structure element (table or list) → ### subsections → closing handoff. Future sections (S04, S05, S06) should follow this same architecture.
- Cross-reference notation `→ gsd2-guide: [Title](../../path/)` with backslash continuation for multi-link blocks is the proven, validated format. Don't invent variations — use exactly this.
- The `../../commands/{slug}/` path format is validated by check-links for all 9 command references in S03. The `../sibling/` format for solo-guide siblings is also validated (`../controlling-costs/`). Both patterns are safe to use in subsequent sections.
- `npm run build` consistently exits 0 at 113 pages as of S03 completion. Any section that adds a page (they shouldn't — all stubs were created in S01) would change this count.

### What's fragile

- The 12,288 link count is stable across S02 and S03 (both arrived at 12,288). A future section with cross-references to pages that don't yet exist (e.g., `../../recipes/something-new/`) would cause check-links to fail. Always verify target paths exist in `dist/` before referencing them.
- The `../controlling-costs/` sibling link (referencing S07's output) currently resolves because S01 created the stub. If the stub were ever removed and S07 hadn't shipped yet, this would break check-links.

### Authoritative diagnostics

- `npm run check-links` is the single most trustworthy signal — it proves every relative path in the file resolves to a real built page. If anything is wrong with cross-references, this catches it.
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/when-things-go-wrong.mdx` → should return 18. If it returns less, companion voice cross-referencing is incomplete.

### What assumptions changed

- T01 plan estimated 30 minutes; execution took 15 minutes. The companion voice and cross-reference pattern were well-established from daily-mix.mdx, reducing the authoring friction substantially. Subsequent companion guide sections (S04, S05, S06, S07, S08) should expect similar or shorter execution times since the patterns are now fully proven.
