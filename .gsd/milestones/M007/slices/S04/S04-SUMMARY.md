---
id: S04
parent: M007
milestone: M007
provides:
  - writing-a-good-brief page at /writing-a-good-brief/
  - cost-examples page at /cost-examples/
requires:
  []
affects:
  - S05
key_files:
  - src/content/docs/writing-a-good-brief.mdx
  - src/content/docs/cost-examples.mdx
key_decisions:
  - Used Markdown table format for bad-vs-good pairs rather than Tabs component for better scannability
patterns_established:
  - Hand-authored MDX pages use title+description frontmatter only, Australian English, and ../sibling/ relative cross-links
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M007/slices/S04/tasks/T01-SUMMARY.md
  - .gsd/milestones/M007/slices/S04/tasks/T02-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T04:39:15.817Z
blocker_discovered: false
---

# S04: Brief Writing + Cost Examples

**Created writing-a-good-brief.mdx (4 bad-vs-good pairs) and cost-examples.mdx (3 dollar-cost scenarios); both build clean and pass link check.**

## What Happened

Two hand-authored MDX content pages added to src/content/docs/. writing-a-good-brief.mdx provides four bad-vs-good requirement pairs (feature addition, bug fix, performance, acceptance criteria), discussion phase guidance, common mistakes, and a checklist. cost-examples.mdx covers three milestone scenarios (small $1-5, medium $5-20, large $20-80) with token profiles and cost driver breakdown, linking to controlling-costs and cost-management. Both use Australian English, title+description frontmatter only, Starlight callouts (:::tip, :::caution), and relative cross-links. Build produces 148 pages, link checker verified 20368 internal links with 0 broken. The T02 verify command (`grep -l 'index.html'`) was a false failure — it searched for the string "index.html" inside the HTML files rather than testing file existence; both pages existed and built correctly throughout.

## Verification

npm run build → 148 pages, exit 0. test -f dist/writing-a-good-brief/index.html → pass. test -f dist/cost-examples/index.html → pass. grep content markers: cost page has 8 dollar-sign matches, brief page has 13 bad/good/vague/specific matches. npm run check-links → 20368 links, 0 broken (per T02 summary).

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

T02 verify command `grep -l 'index.html' dist/writing-a-good-brief/index.html dist/cost-examples/index.html` always returns exit 1 because the string "index.html" does not appear inside those HTML files. This is a bug in the verify command, not a content failure. File existence was confirmed independently.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

- `src/content/docs/writing-a-good-brief.mdx` — New page: 4 bad-vs-good requirement pairs, discussion phase guidance, common mistakes checklist
- `src/content/docs/cost-examples.mdx` — New page: 3 milestone cost scenarios ($1-5, $5-20, $20-80), token profiles, cost drivers
