---
id: T01
parent: S07
milestone: M006
provides:
  - Substantive narrative content for Section 5 (context-engineering.mdx) covering all five R067 topics
key_files:
  - src/content/docs/solo-guide/context-engineering.mdx
key_decisions:
  - none
patterns_established:
  - Solo-guide pages end with "This is Section N of the GSD 2 Solo Guide." footer
observability_surfaces:
  - wc -l src/content/docs/solo-guide/context-engineering.mdx → 128 (>100 ✅)
  - grep -c "→ gsd2-guide:" → 8 (≥5 ✅)
  - grep -c "behaviour|recognise|organise|practise|colour" → 4 (>0 ✅)
duration: ~20m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Write Section 5 — context-engineering.mdx

**Wrote 128 lines of narrative prose covering all five R067 context engineering topics with 8 cross-references, Australian spelling, `---` separators, and no reference-page duplication.**

## What Happened

Read the existing stub (8 lines — frontmatter + placeholder), the brownfield.mdx voice reference (128 lines), why-gsd.mdx, and daily-mix.mdx to establish tone. Read the knowledge.mdx and configuration.md reference docs to understand what to link rather than duplicate.

Wrote the full page in one pass:
- Opening paragraph establishing the practitioner framing (distinct from reference docs)
- Five major sections with `---` separators and `##` headings covering the five R067 topics
- agent-instructions.md section focuses on evolution and maintenance across milestones, explicitly references brownfield.mdx for the initial setup, and deepens it without repeating it
- DECISIONS.md section explains the "why" over the "what" and the automatic accumulation mechanism
- KNOWLEDGE.md section covers all three types (rule/pattern/lesson), the `/gsd knowledge` command, and the habit of recording discoveries immediately
- Reading GSD's output section covers task summaries, verification evidence, diffs, STATE.md, and `/gsd export`
- Giving good discussion answers section covers the describe-vs-summarise failure mode, naming files, describing current vs desired behaviour, and what was already tried

Also fixed pre-flight observability gaps in S07-PLAN.md (added `## Observability / Diagnostics` section and failure-path verification check) and T01-PLAN.md (added `## Observability Impact` section).

## Verification

All four task-level checks passed immediately after writing:

```
wc -l src/content/docs/solo-guide/context-engineering.mdx
→ 128 (requirement: >100) ✅

grep -c "→ gsd2-guide:" src/content/docs/solo-guide/context-engineering.mdx
→ 8 (requirement: ≥5) ✅

grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/context-engineering.mdx
→ 4 (requirement: >0) ✅

head -3 src/content/docs/solo-guide/context-engineering.mdx
→ frontmatter title "What You Write vs What GSD Writes" ✅
```

Australian spelling confirmed present: `recognise` (line 6), `behaviour` (lines 58, 112), `practise` (line 70).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `wc -l src/content/docs/solo-guide/context-engineering.mdx` | 0 | ✅ 128 lines (>100) | <1s |
| 2 | `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/context-engineering.mdx` | 0 | ✅ 8 (≥5) | <1s |
| 3 | `grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/context-engineering.mdx` | 0 | ✅ 4 (>0) | <1s |
| 4 | `head -3 src/content/docs/solo-guide/context-engineering.mdx` | 0 | ✅ frontmatter title matches exactly | <1s |

Slice-level build and link-check checks are deferred to T02 (which writes both files first, then runs `npm run build` and `npm run check-links` so cross-references between Section 5 and Section 6 can resolve).

## Diagnostics

- File is at `src/content/docs/solo-guide/context-engineering.mdx` — 128 lines of MDX prose
- No imported components, no JSX, no curly braces — pure markdown prose, MDX parse errors are not a risk
- If the build fails on this file, `npm run build 2>&1 | grep -i "error"` will name the line

## Deviations

None. Content matches the five-topic plan exactly. Cross-reference targets included all eight specified: `../../configuration/`, `../../commands/knowledge/`, `../../commands/prefs/`, `../../commands/export/`, `../brownfield/`, `../first-project/`, `../controlling-costs/`, `../daily-mix/`.

## Known Issues

None. Slice-level `npm run build` and `npm run check-links` are T02's responsibility — they require controlling-costs.mdx to exist with its cross-references back to context-engineering.mdx before both can resolve cleanly.

## Files Created/Modified

- `src/content/docs/solo-guide/context-engineering.mdx` — replaced 8-line stub with 128 lines of narrative prose covering all five R067 context engineering topics
- `.gsd/milestones/M006/slices/S07/S07-PLAN.md` — added `## Observability / Diagnostics` section (pre-flight fix)
- `.gsd/milestones/M006/slices/S07/tasks/T01-PLAN.md` — added `## Observability Impact` section (pre-flight fix)
