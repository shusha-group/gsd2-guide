---
id: T01
parent: S01
milestone: M008
provides: []
requires: []
affects: []
key_files: ["src/content/docs/index.mdx"]
key_decisions: []
patterns_established: []
drill_down_paths: []
observability_surfaces: []
duration: ""
verification_result: "All four checks passed: grep for template:doc (exit 0), npm run build (exit 0, 148 pages), sidebar diff after stripping aria-current (identical), npm run check-links (exit 0, 0 broken)."
completed_at: 2026-04-02T13:12:39.985Z
blocker_discovered: false
---

# T01: Verified homepage sidebar matches inner page sidebars exactly — R084 confirmed fixed via template: doc.

> Verified homepage sidebar matches inner page sidebars exactly — R084 confirmed fixed via template: doc.

## What Happened
---
id: T01
parent: S01
milestone: M008
key_files:
  - src/content/docs/index.mdx
key_decisions:
  - (none)
duration: ""
verification_result: passed
completed_at: 2026-04-02T13:12:39.987Z
blocker_discovered: false
---

# T01: Verified homepage sidebar matches inner page sidebars exactly — R084 confirmed fixed via template: doc.

**Verified homepage sidebar matches inner page sidebars exactly — R084 confirmed fixed via template: doc.**

## What Happened

The fix for R084 was already in place (template: doc in index.mdx frontmatter). Built the site, extracted the Main nav from both dist/index.html and dist/getting-started/index.html, stripped aria-current attributes, and confirmed byte-for-byte equality. Also confirmed 0 broken links across 20,661 internal links.

## Verification

All four checks passed: grep for template:doc (exit 0), npm run build (exit 0, 148 pages), sidebar diff after stripping aria-current (identical), npm run check-links (exit 0, 0 broken).

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep 'template: doc' src/content/docs/index.mdx` | 0 | ✅ pass | 50ms |
| 2 | `npm run build` | 0 | ✅ pass | 6700ms |
| 3 | `python3 sidebar diff (strip aria-current)` | 0 | ✅ pass | 100ms |
| 4 | `npm run check-links` | 0 | ✅ pass | 3100ms |


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
