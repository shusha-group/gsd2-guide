---
id: S05
parent: M006
milestone: M006
provides:
  - brownfield.mdx — 128 lines of substantive narrative covering all four R065 brownfield onboarding topics
requires:
  - slice: S01
    provides: Solo-guide sidebar group registered; brownfield.mdx stub in place
affects:
  - S08
key_files:
  - src/content/docs/solo-guide/brownfield.mdx
key_decisions:
  - Concrete "invoice SaaS" scenario (Node/Express, React, PostgreSQL, 30 GitHub issues) used as running thread — grounds abstract advice in a tangible codebase across all four sections
  - agent-instructions.md introduced via a 3-line example block; full mechanics explicitly deferred to Section 5 (../context-engineering/) — scope boundary with S07 honoured
  - Topical ## headings (not "Phase N:" prefix) matching when-things-go-wrong.mdx pattern — Phase prefix is for sequential walkthroughs, brownfield guidance is thematic
  - Markdown table used for issue cluster mapping — four clusters (payment reliability, mobile UI, devex, future features) comparing more cleanly as a table than as prose list
  - Two pre-flight observability gaps fixed before writing: added ## Observability / Diagnostics to S05-PLAN.md and ## Observability Impact to T01-PLAN.md
patterns_established:
  - Brownfield/thematic sections use topical ## headings; walkthrough sections use ## Phase N: prefix — both use --- separators between major sections per D072
  - The "handoff spec" is introduced as a four-part structure: architecture overview, current pain points, what's working/off-limits, deployment setup
  - Issue cluster mapping is expressed as a markdown table with Cluster and Issues columns, not a prose enumeration
observability_surfaces:
  - wc -l src/content/docs/solo-guide/brownfield.mdx → 128 lines
  - grep -c '→ gsd2-guide:' src/content/docs/solo-guide/brownfield.mdx → 9 cross-references
  - npm run build 2>&1 | grep "pages" → 113 pages
  - npm run check-links → 12,288 internal links, 0 broken
drill_down_paths:
  - .gsd/milestones/M006/slices/S05/tasks/T01-SUMMARY.md
duration: 15m
verification_result: passed
completed_at: 2026-03-19
---

# S05: Section 3 — Brownfield Reality

**Replaced the 8-line stub with 128 lines of substantive narrative covering all four brownfield onboarding topics — clean build at 113 pages, zero broken links across 12,288 internal link checks.**

## What Happened

A single task (T01) replaced the stub `brownfield.mdx` with the full Section 3 content. Before writing, the executor read `first-project.mdx` and `when-things-go-wrong.mdx` as tone/structure references, then applied the topical heading pattern (matching when-things-go-wrong) rather than the Phase-prefix walkthrough pattern (matching first-project). Brownfield guidance is thematic advice, not a sequential procedure.

The executor also fixed two pre-flight observability gaps — adding required `## Observability / Diagnostics` and `## Observability Impact` sections to the slice plan and task plan respectively — before beginning the content writing.

The content uses a half-built contractor invoice SaaS (Node/Express backend, React frontend, PostgreSQL, 30 GitHub issues) as a running scenario that threads through all four sections. This grounds abstract onboarding advice in something concrete and recognisable.

**Section structure:**

1. **The first discussion on existing code** — explains how `/gsd` detects no `.gsd/` folder and adapts its discussion protocol; contrasts brownfield scoping with greenfield requirement definition; gives concrete examples of the right questions to answer
2. **Constraining GSD on an existing codebase** — shows a 3-line example `agent-instructions.md` with hard limits and pattern rules; introduces KNOWLEDGE.md for operational facts; explicitly defers full mechanics to Section 5 via forward reference
3. **Mapping existing issues to milestones** — markdown table showing 30 issues sorted into 4 clusters; advocates one-cluster-first approach; distinguishes requirements (desired behaviour) from issues (observed problems)
4. **The handoff spec approach** — four-part structure for a pre-discussion brief: architecture overview, current pain points, what's working/off-limits, deployment setup; closes with advice on brevity over exhaustiveness

The closing prose ties forward to Section 4 (daily-mix) and Section 5 (context-engineering), creating coherent reading flow across sections.

All 9 cross-references use `→ gsd2-guide:` notation per D070. Australian spelling throughout. No bare `{` literals — `/gsd` commands are backtick-wrapped throughout.

## Verification

All slice-plan verification commands passed:

| Check | Command | Result |
|---|---|---|
| Length gate | `wc -l brownfield.mdx` | 128 lines (>100 ✅) |
| Cross-reference count | `grep -c '→ gsd2-guide:' brownfield.mdx` | 9 (≥6 ✅) |
| Australian spelling | `grep -Ei 'behavio[^u]r\|recogniz\|organiz' brownfield.mdx` | 0 matches ✅ |
| Build | `npm run build 2>&1 \| grep "pages"` | 113 pages, exit 0 ✅ |
| Link check | `npm run check-links` | 0 broken / 12,288 checked ✅ |

## Requirements Advanced

- R065 — brownfield onboarding guidance now published covering all four required topics (existing-code discussion, constraining GSD, issue-to-milestone mapping, handoff spec approach)

## Requirements Validated

- R065 — fully validated: `brownfield.mdx` exists with >100 lines covering all four R065 brownfield topics, builds cleanly, passes link check

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None. The plan was followed exactly. The only preparatory work was fixing two pre-flight observability gaps in plan files before writing the content — that is maintenance, not deviation.

## Known Limitations

- `brownfield.mdx` exists as a stub in the sidebar for `../context-engineering/` (forward-referenced in Section 3) — that page is authored in S07. The forward reference is a live cross-reference; the target page exists as a stub and will not produce a broken link until S07 writes substantive content, but the link itself resolves.
- The handoff spec approach is described in prose but there is no MDX template or downloadable artefact — readers must construct their own from the description.

## Follow-ups

None. All S05 obligations are complete. S07 authors `context-engineering.mdx` which is the forward-reference destination from this section.

## Files Created/Modified

- `src/content/docs/solo-guide/brownfield.mdx` — replaced 8-line stub with 128 lines of substantive narrative
- `.gsd/milestones/M006/slices/S05/S05-PLAN.md` — added `## Observability / Diagnostics` section (pre-flight fix)
- `.gsd/milestones/M006/slices/S05/tasks/T01-PLAN.md` — added `## Observability Impact` section (pre-flight fix)

## Forward Intelligence

### What the next slice should know
- `brownfield.mdx` cross-references `../context-engineering/` nine times (including two in the closing section). S07 must ensure `context-engineering.mdx` exists with substantive content before the final S08 build verification — the link resolves now because the stub exists, but readers following the link will hit a sparse page until S07 completes.
- The four-part handoff spec structure (architecture overview, pain points, what's working/off-limits, deployment setup) is original content that could be reused as an example in `context-engineering.mdx` if S07 covers brownfield context initialisation.
- The issue cluster mapping table pattern (Cluster | Issues) is worth reusing for any page that needs to map a large set of items into categories — markdown tables in MDX build cleanly with no escaping required.

### What's fragile
- The 9 cross-references in `brownfield.mdx` will break if any of the target pages are renamed or removed. The specific targets are: `../first-project/`, `../../user-guide/discussing-a-milestone/`, `../../configuration/`, `../../commands/knowledge/`, `../context-engineering/`, `../../commands/capture/`, `../../recipes/fix-a-bug/`, `../daily-mix/`, `../context-engineering/` (again). Any sidebar or filename change to those pages requires updating `brownfield.mdx`.

### Authoritative diagnostics
- `npm run check-links` — most authoritative signal for cross-reference health; run after any page rename
- `npm run build 2>&1 | grep "pages"` — confirms page count; if this changes from 113 it means a page was added or removed unexpectedly
- `wc -l src/content/docs/solo-guide/brownfield.mdx` — quick length sanity check

### What assumptions changed
- None. All plan assumptions proved correct: the stub was 8 lines, the sidebar was already wired, and the build confirmed 113 pages exactly as expected.
