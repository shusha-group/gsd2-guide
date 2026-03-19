---
id: T01
parent: S02
milestone: M006
provides:
  - full Section 4 content in daily-mix.mdx with decision table, 6 subsections, and validated cross-references
key_files:
  - src/content/docs/solo-guide/daily-mix.mdx
key_decisions:
  - Used standard Markdown table (3 columns, 8 rows) — no custom components or Mermaid
  - Used → gsd2-guide: prefix notation for hand-off links per D070
patterns_established:
  - Decision table format: "The change looks like… | Use this | Why" with spectrum from trivial to complex
observability_surfaces:
  - npm run build 2>&1 | grep "pages" → 113 pages confirms no file count drift
  - npm run check-links → exit 0 confirms all cross-references resolve
  - grep -c "../../commands/" daily-mix.mdx → 6 cross-references wired
duration: ~10m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Write Section 4 content and verify cross-references

**Replaced the 7-line stub in `daily-mix.mdx` with 129 lines of full Section 4 decision-framework content; `npm run build` exits 0 at 113 pages and `npm run check-links` validates 12,288 internal links with 0 broken.**

## What Happened

Pre-flight: Added `## Observability / Diagnostics` to S02-PLAN.md and `## Observability Impact` to T01-PLAN.md before beginning execution.

Verified all cross-reference targets exist (`commands/quick.mdx`, `capture.mdx`, `steer.mdx`, `queue.mdx`, `status.mdx`, `next.mdx`; `auto-mode.md`, `git-strategy.md`, `captures-triage.md`; sibling solo-guide pages).

Rewrote `daily-mix.mdx` keeping the existing frontmatter and replacing the stub body with 6 sections:
1. **The three paths** — direct commit / `/gsd quick` / full milestone with concrete named examples
2. **The decision table** — 8-row Markdown table (3 columns: "The change looks like…", "Use this", "Why") covering the full spectrum from typo to infrastructure change
3. **What `/gsd quick` actually does** — plain-English 5-step walkthrough: no flags, plain-English description, branch creation, agent dispatch, atomic commit, summary written to `.gsd/quick/N-slug/N-SUMMARY.md`, STATE.md update
4. **When quick isn't enough** — two key heuristics (investigate-before-fix signal; multiple-concerns signal) with practical indicators
5. **Handling interruptions** — capture / steer / queue subsections with inline examples and → gsd2-guide: links
6. **The daily rhythm** — morning/session/end-of-day/weekly narrative linking to Section 8

All links use the correct depth format (`../../commands/slug/`, `../../slug/`, `../slug/`).

## Verification

Ran `npm run build` — 113 pages, exit 0. Ran `npm run check-links` — 12,288 internal links checked, 0 broken, exit 0. Spot-checks confirmed 129 lines, 6 command cross-references, and no American spellings.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build 2>&1 \| grep "pages"` | 0 | ✅ pass | 5.5s |
| 2 | `npm run check-links` | 0 | ✅ pass | 2.2s |
| 3 | `wc -l src/content/docs/solo-guide/daily-mix.mdx` | 0 | ✅ pass (129 lines) | <1s |
| 4 | `grep -c "../../commands/" daily-mix.mdx` | 0 | ✅ pass (6 matches) | <1s |
| 5 | `npm run build 2>&1 \| grep -iE "error\|warn\|fail" \| grep -i "solo-guide"` | 1 | ✅ pass (no output) | 5.5s |
| 6 | `grep -i "behavior\|recognize\|organize" daily-mix.mdx` | 1 | ✅ pass (no output) | <1s |

## Diagnostics

- `npm run build 2>&1 | grep "pages"` → page count
- `npm run check-links` → link validity across all 12k+ internal links
- `grep -c "../../commands/" src/content/docs/solo-guide/daily-mix.mdx` → cross-reference wiring
- Build errors in solo-guide surface as `grep -iE "error|warn|fail" | grep "solo-guide"` in build stderr

## Deviations

Decision table has 8 rows (plan required ≥6). Added extra rows for "exploratory work" and "infrastructure/deployment changes" to make the table more practically useful. No structural deviation from the plan.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/solo-guide/daily-mix.mdx` — full Section 4 content (129 lines), replacing 7-line stub
- `.gsd/milestones/M006/slices/S02/S02-PLAN.md` — added `## Observability / Diagnostics` section (pre-flight fix)
- `.gsd/milestones/M006/slices/S02/tasks/T01-PLAN.md` — added `## Observability Impact` section (pre-flight fix)
