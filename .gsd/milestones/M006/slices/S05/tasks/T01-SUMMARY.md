---
id: T01
parent: S05
milestone: M006
provides:
  - brownfield.mdx substantive content (128 lines) covering all four R065 brownfield topics
key_files:
  - src/content/docs/solo-guide/brownfield.mdx
key_decisions:
  - Concrete "invoice SaaS" scenario used as running thread across all four sections — grounds abstract advice in a tangible codebase with specific pain points
  - agent-instructions.md introduced via 3-line example block; full mechanics explicitly deferred to Section 5 (../context-engineering/) — scope boundary with S07 honoured
  - Markdown table used for issue cluster mapping (cleaner than prose list for the 4-cluster comparison)
patterns_established:
  - Brownfield sections use topical ## headings (not "Phase N:" prefix) matching when-things-go-wrong.mdx pattern
  - Pre-flight observability gaps (missing sections in plan files) should be fixed before writing content — added ## Observability / Diagnostics to S05-PLAN.md and ## Observability Impact to T01-PLAN.md
observability_surfaces:
  - wc -l src/content/docs/solo-guide/brownfield.mdx → 128 lines (length gate)
  - grep -c '→ gsd2-guide:' brownfield.mdx → 9 cross-references (count gate)
  - npm run build 2>&1 | grep "pages" → 113 pages
  - npm run check-links → 12,288 internal links, 0 broken
duration: 15m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Write brownfield onboarding section content

**Replaced the 8-line stub in brownfield.mdx with 128 lines of narrative covering the first discussion on existing code, constraining GSD, mapping existing issues, and the handoff spec approach — all verified by a clean build at 113 pages and zero broken links.**

## What Happened

Read `first-project.mdx` (tone/structure reference with Phase headings and `---` separators) and `when-things-go-wrong.mdx` (topical heading style without Phase prefix) before writing. Applied the topical heading pattern to brownfield since it's thematic guidance, not a sequential walkthrough.

Fixed the two pre-flight observability gaps first: added `## Observability / Diagnostics` to S05-PLAN.md and `## Observability Impact` to T01-PLAN.md as required by the task prompt.

Wrote the complete `brownfield.mdx` using a half-built contractor invoice SaaS as the running scenario (Node/Express backend, React frontend, PostgreSQL, 30 GitHub issues). The scenario threads consistently through all four sections:

1. **First discussion on existing code** — explains how `/gsd` detects no `.gsd/` folder and reads the codebase before asking what to change; contrasts with greenfield path
2. **Constraining GSD** — 3-line example `agent-instructions.md` with hard limits (invoices table, auth layer) and pattern rules; KNOWLEDGE.md for operational facts; explicit forward reference to Section 5 for full mechanics
3. **Mapping existing issues** — markdown table showing how 30 issues cluster into 4 themes; argues for one-cluster-first approach; distinguishes requirements (desired behaviour) from issues (observed problems)
4. **Handoff spec approach** — four-part structure: architecture overview, current pain points, what's working/off-limits, deployment setup — all grounded in the invoice SaaS example

Closing section points forward to Section 4 (daily-mix) and Section 5 (context-engineering).

All 9 cross-references use `→ gsd2-guide:` notation. Australian spelling used throughout (`behaviour`, `recognise`). No bare `{` literals — `/gsd` commands wrapped in backticks throughout.

## Verification

- `wc -l` confirmed 128 lines (requirement: >100)
- `grep -c '→ gsd2-guide:'` confirmed 9 cross-references (requirement: ≥6)
- `grep -Ei 'behavio[^u]r|recogniz|organiz'` returned 0 matches (no American spellings)
- `npm run build` exited 0 with Pagefind reporting exactly 113 HTML files
- `npm run check-links` exited 0 with 12,288 internal links and 0 broken

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `wc -l src/content/docs/solo-guide/brownfield.mdx` | 0 | ✅ 128 lines | <1s |
| 2 | `grep -c '→ gsd2-guide:' brownfield.mdx` | 0 | ✅ 9 cross-refs | <1s |
| 3 | `grep -Ei 'behavio[^u]r\|recogniz\|organiz' brownfield.mdx` | 0 | ✅ 0 matches | <1s |
| 4 | `npm run build 2>&1 \| grep "pages"` | 0 | ✅ 113 pages | 6.9s |
| 5 | `npm run check-links` | 0 | ✅ 0 broken / 12,288 checked | 3.5s |

## Diagnostics

Static content file — no runtime processes. Future agents can inspect:
- `wc -l brownfield.mdx` → length
- `grep -c '→ gsd2-guide:' brownfield.mdx` → cross-reference count
- `npm run check-links` → link validity (run after any page rename)
- `npm run build` → MDX parse validity (unclosed `{` produces a vite error naming file + line)

## Deviations

None. The plan was followed exactly.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/solo-guide/brownfield.mdx` — replaced 8-line stub with 128 lines of substantive narrative
- `.gsd/milestones/M006/slices/S05/S05-PLAN.md` — added `## Observability / Diagnostics` section (pre-flight fix)
- `.gsd/milestones/M006/slices/S05/tasks/T01-PLAN.md` — added `## Observability Impact` section (pre-flight fix)
