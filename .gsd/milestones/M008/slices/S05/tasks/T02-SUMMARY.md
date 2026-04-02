---
id: T02
parent: S05
milestone: M008
provides: []
requires: []
affects: []
key_files: ["content/generated/docs/auto-mode.md", "content/generated/docs/getting-started.md", "content/generated/docs/configuration.md", "src/content/docs/skills-extensions-agents.md", "src/content/docs/recipes/control-your-costs.md", "src/content/docs/is-gsd-right-for-me.md", "src/content/docs/quick-reference.md"]
key_decisions: ["Appended callouts to end of each file rather than inserting mid-page to avoid disrupting existing section flow"]
patterns_established: []
drill_down_paths: []
observability_surfaces: []
duration: ""
verification_result: "grep -rl ':::tip' returned 13 (≥7). npm run build exited 0 (150 pages built). npm run check-links reported 20909 links checked with 0 broken."
completed_at: 2026-04-02T19:36:05.321Z
blocker_discovered: false
---

# T02: Added :::tip audience-bridging callouts to 7 pages and a Next Steps section to quick-reference.md; tip count rose from 6 to 13; build and link checks clean

> Added :::tip audience-bridging callouts to 7 pages and a Next Steps section to quick-reference.md; tip count rose from 6 to 13; build and link checks clean

## What Happened
---
id: T02
parent: S05
milestone: M008
key_files:
  - content/generated/docs/auto-mode.md
  - content/generated/docs/getting-started.md
  - content/generated/docs/configuration.md
  - src/content/docs/skills-extensions-agents.md
  - src/content/docs/recipes/control-your-costs.md
  - src/content/docs/is-gsd-right-for-me.md
  - src/content/docs/quick-reference.md
key_decisions:
  - Appended callouts to end of each file rather than inserting mid-page to avoid disrupting existing section flow
duration: ""
verification_result: passed
completed_at: 2026-04-02T19:36:05.321Z
blocker_discovered: false
---

# T02: Added :::tip audience-bridging callouts to 7 pages and a Next Steps section to quick-reference.md; tip count rose from 6 to 13; build and link checks clean

**Added :::tip audience-bridging callouts to 7 pages and a Next Steps section to quick-reference.md; tip count rose from 6 to 13; build and link checks clean**

## What Happened

Appended :::tip callouts to all 7 specified pages, editing generated sources in content/generated/docs/ for auto-mode, getting-started, and configuration, and hand-authored files directly for the remaining four. Added a ## Next Steps section with 3 relevant links to quick-reference.md above its new callout. All text uses Australian English and links use valid Starlight-relative paths.

## Verification

grep -rl ':::tip' returned 13 (≥7). npm run build exited 0 (150 pages built). npm run check-links reported 20909 links checked with 0 broken.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -rl ':::tip' src/content/docs/ content/generated/docs/ | wc -l` | 0 | ✅ pass | 200ms |
| 2 | `npm run build` | 0 | ✅ pass | 7200ms |
| 3 | `npm run check-links` | 0 | ✅ pass | 2100ms |


## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `content/generated/docs/auto-mode.md`
- `content/generated/docs/getting-started.md`
- `content/generated/docs/configuration.md`
- `src/content/docs/skills-extensions-agents.md`
- `src/content/docs/recipes/control-your-costs.md`
- `src/content/docs/is-gsd-right-for-me.md`
- `src/content/docs/quick-reference.md`


## Deviations
None.

## Known Issues
None.
