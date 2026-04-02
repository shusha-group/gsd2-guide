---
id: T01
parent: S04
milestone: M008
provides: []
requires: []
affects: []
key_files: ["src/content/docs/index.mdx"]
key_decisions: ["Used Card+CardGrid for persona cards (rich body with description + CTA link), LinkCard for Common Tasks and Go Deeper (single-link navigation items)"]
patterns_established: []
drill_down_paths: []
observability_surfaces: []
duration: ""
verification_result: "npm run build (exit 0, 150 pages) and npm run check-links (exit 0, 20,639 links, 0 broken)"
completed_at: 2026-04-02T13:34:46.540Z
blocker_discovered: false
---

# T01: Replaced homepage sections with persona cards (Choose Your Starting Point), retained How GSD Works mermaid diagram, and added Common Tasks + Go Deeper LinkCard sections

> Replaced homepage sections with persona cards (Choose Your Starting Point), retained How GSD Works mermaid diagram, and added Common Tasks + Go Deeper LinkCard sections

## What Happened
---
id: T01
parent: S04
milestone: M008
key_files:
  - src/content/docs/index.mdx
key_decisions:
  - Used Card+CardGrid for persona cards (rich body with description + CTA link), LinkCard for Common Tasks and Go Deeper (single-link navigation items)
duration: ""
verification_result: passed
completed_at: 2026-04-02T13:34:46.540Z
blocker_discovered: false
---

# T01: Replaced homepage sections with persona cards (Choose Your Starting Point), retained How GSD Works mermaid diagram, and added Common Tasks + Go Deeper LinkCard sections

**Replaced homepage sections with persona cards (Choose Your Starting Point), retained How GSD Works mermaid diagram, and added Common Tasks + Go Deeper LinkCard sections**

## What Happened

Read the existing 82-line index.mdx, then rewrote it: added Card to the import, replaced Learn GSD with Choose Your Starting Point (3 persona Cards), kept How GSD Works mermaid unchanged, replaced Commands+Recipes with Common Tasks (4 LinkCards), replaced Reference & Guides with Go Deeper (4 LinkCards). Hero actions and template: doc frontmatter untouched. All hrefs use /gsd2-guide/ prefix.

## Verification

npm run build (exit 0, 150 pages) and npm run check-links (exit 0, 20,639 links, 0 broken)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` | 0 | ✅ pass | 6700ms |
| 2 | `npm run check-links` | 0 | ✅ pass | 3400ms |


## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/index.mdx`


## Deviations
None.

## Known Issues
None.
