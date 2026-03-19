---
id: T02
parent: S07
milestone: M006
provides:
  - Substantive narrative content for Section 6 (controlling-costs.mdx) covering all five R068 topics
key_files:
  - src/content/docs/solo-guide/controlling-costs.mdx
key_decisions:
  - none
patterns_established:
  - Solo-guide pages end with "This is Section N of the GSD 2 Solo Guide." footer
  - Token profile framing: use budget/balanced/quality based on confidence in the work, not just cost
  - Cross-references from solo-guide cost section back to context-engineering reinforce that context discipline is cost discipline
observability_surfaces:
  - wc -l src/content/docs/solo-guide/controlling-costs.mdx — line count confirms content written
  - grep -c "→ gsd2-guide:" src/content/docs/solo-guide/controlling-costs.mdx — cross-reference count
  - npm run build 2>&1 | grep "pages" — build page count; must remain 113
  - npm run check-links — link resolution; must exit 0
  - grep "solo-guide" content/generated/page-source-map.json — D068 guard; must exit 1
duration: ~8m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T02: Write Section 6 — controlling-costs.mdx, build, and verify

**Wrote 114 lines of narrative prose for Section 6 covering all five R068 cost management topics, with 9 cross-references and Australian spelling; build exits 0 at 113 pages and link check passes.**

## What Happened

Pre-flight: added `## Observability Impact` section to T02-PLAN.md and expanded the failure-path diagnostic block in S07-PLAN.md with four concrete inspection commands, satisfying both observability gap flags.

Read the existing stub (8 lines), T01's context-engineering.mdx output (128 lines), why-gsd.mdx for cost landscape framing, and the three reference files that must not be duplicated (cost-management.md, token-optimization.md, dynamic-model-routing.md) plus prefs.mdx and export.mdx.

Wrote controlling-costs.mdx (114 lines) with:
1. Opening paragraph building on Section 1's landscape framing
2. Five major sections separated by `---` and `##` headings:
   - Flat-rate vs pay-per-use in practice (Claude Max, API, platform subscriptions — honest tradeoffs)
   - Token profiles in plain English (budget/balanced/quality as confidence-based choice, not reproduction of reference tables)
   - Per-phase model routing (dynamic routing, tier classification, budget pressure, interaction with token profiles)
   - Budget ceiling configuration (how to set it, enforcement modes, budget pressure, context_pause_threshold)
   - Typical cost patterns (milestone cost ranges, three drivers: profile, context size, model selection)
3. Natural reference to Section 5's context engineering as cost discipline
4. Footer: "This is Section 6 of the GSD 2 Solo Guide."

9 cross-references using `→ gsd2-guide:` notation: why-gsd, token-optimization, prefs, dynamic-model-routing, cost-management, export, context-engineering, building-rhythm, cost-management (repeated in final section).

## Verification

All seven plan verification checks passed:

- `wc -l` → 114 lines (>100 ✅)
- `grep -c "→ gsd2-guide:"` → 9 (≥5 ✅)
- Australian spelling grep → 1 match (`practise` in token profiles section) ✅
- `npm run build` → 113 pages, exit 0 ✅
- `npm run check-links` → 12,288 internal links checked, 0 broken, exit 0 ✅
- `grep "solo-guide" content/generated/page-source-map.json` → exit 1, no matches ✅
- `ls src/content/docs/solo-guide/*.mdx | wc -l` → 9 ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `wc -l src/content/docs/solo-guide/controlling-costs.mdx` | 0 | ✅ pass (114 lines) | <1s |
| 2 | `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/controlling-costs.mdx` | 0 | ✅ pass (9 refs) | <1s |
| 3 | `grep -c "behaviour\|recognise\|organise\|practise\|colour" controlling-costs.mdx` | 0 | ✅ pass (1 match) | <1s |
| 4 | `npm run build 2>&1 \| grep "pages"` | 0 | ✅ pass (113 pages) | 6.8s |
| 5 | `npm run check-links` | 0 | ✅ pass (0 broken) | 3.2s |
| 6 | `grep "solo-guide" content/generated/page-source-map.json` | 1 | ✅ pass (no matches) | <1s |
| 7 | `ls src/content/docs/solo-guide/*.mdx \| wc -l` | 0 | ✅ pass (9 files) | <1s |

## Diagnostics

- `wc -l src/content/docs/solo-guide/controlling-costs.mdx` — line count; >100 confirms content was written
- `npm run build 2>&1 | grep -i "error\|warn" | head -20` — MDX parse errors print file + line/column on non-zero exit
- `npm run check-links 2>&1 | grep -v "^$"` — lists failing slugs on non-zero exit
- `grep -n "[{}]" src/content/docs/solo-guide/controlling-costs.mdx` — detects unescaped curly braces (most common MDX parse failure)
- `grep "solo-guide" content/generated/page-source-map.json` — D068 guard; exit 1 is pass (no solo-guide entries in generated source map)

## Deviations

None. All steps executed per plan.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/solo-guide/controlling-costs.mdx` — 114-line substantive Section 6 replacing 8-line stub
- `.gsd/milestones/M006/slices/S07/tasks/T02-PLAN.md` — added `## Observability Impact` section (pre-flight fix)
- `.gsd/milestones/M006/slices/S07/S07-PLAN.md` — expanded failure-path verification block (pre-flight fix)
