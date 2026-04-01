---
id: T01
parent: S02
milestone: M007
provides: []
requires: []
affects: []
key_files: ["src/components/ReleaseEntry.astro"]
key_decisions: ["Used negative lookbehind (?<![\w/"']) to avoid double-linking text already inside anchor tags or URLs"]
patterns_established: []
drill_down_paths: []
observability_surfaces: []
duration: ""
verification_result: "Built the site and grep-counted occurrences of the GitHub issue URL pattern in the output HTML: 768 matches found vs requirement of >10."
completed_at: 2026-04-01T23:42:46.955Z
blocker_discovered: false
---

# T01: Added #NNN → GitHub issue/PR auto-linking to ReleaseEntry.astro, producing 768 clickable links in the built changelog

> Added #NNN → GitHub issue/PR auto-linking to ReleaseEntry.astro, producing 768 clickable links in the built changelog

## What Happened
---
id: T01
parent: S02
milestone: M007
key_files:
  - src/components/ReleaseEntry.astro
key_decisions:
  - Used negative lookbehind (?<![\w/"']) to avoid double-linking text already inside anchor tags or URLs
duration: ""
verification_result: passed
completed_at: 2026-04-01T23:42:46.956Z
blocker_discovered: false
---

# T01: Added #NNN → GitHub issue/PR auto-linking to ReleaseEntry.astro, producing 768 clickable links in the built changelog

**Added #NNN → GitHub issue/PR auto-linking to ReleaseEntry.astro, producing 768 clickable links in the built changelog**

## What Happened

Added a regex replace pass immediately after the existing /gsd X command linkification block in ReleaseEntry.astro. The pattern (?<![\w\/"'])#(\d+)\b matches bare #NNN references while avoiding double-linking text already wrapped in anchor tags or embedded in URLs. Each match links to https://github.com/gsd-build/gsd-2/issues/$1 with target=_blank and rel=noopener noreferrer. GitHub auto-redirects issue URLs to /pull/ for PRs.

## Verification

Built the site and grep-counted occurrences of the GitHub issue URL pattern in the output HTML: 768 matches found vs requirement of >10.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` | 0 | ✅ pass | 6800ms |
| 2 | `grep -c 'github.com/gsd-build/gsd-2/issues/' dist/changelog/index.html` | 0 | ✅ pass (768 > 10) | 100ms |


## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/components/ReleaseEntry.astro`


## Deviations
None.

## Known Issues
None.
