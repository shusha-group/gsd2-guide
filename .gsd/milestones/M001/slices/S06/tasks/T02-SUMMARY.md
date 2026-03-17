---
id: T02
parent: S06
milestone: M001
provides:
  - scripts/update.mjs — one-command pipeline orchestrator (npm update → extract → build → check-links)
  - "update" npm script entry
key_files:
  - scripts/update.mjs
  - package.json
key_decisions:
  - Capture extract stdout via pipe to parse manifest diff, inherit stdio for all other steps — balances parsability with real-time user output
  - Use Date.now() for timing rather than performance.now() — simpler, sufficient precision for multi-second pipeline steps
patterns_established:
  - Pipeline uses [update] prefix for structured console output, consistent with [link-check] and [orchestrator] patterns
  - Step failure format: `[update] ❌ Step "NAME" failed after Ns` with total elapsed and exit code
  - Summary format includes step timings, manifest diff, page count, and link check result
observability_surfaces:
  - "npm run update" — full pipeline with per-step timing and manifest diff summary
  - Exit code 0/1 for CI integration
  - Failed step identification with elapsed time on failure
duration: 10m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Build one-command update pipeline script

**Created `scripts/update.mjs` — chains npm update → extract → build → check-links in sequence, reports per-step timing, manifest diff (+22/~63/-0), 134 pages built, link check passed, total time 8.7s.**

## What Happened

Created an ESM Node.js script using `child_process.execSync` that orchestrates the four pipeline steps in sequence:

1. `npm update gsd-pi` — pulls latest package (stdio: inherit)
2. `node scripts/extract.mjs` — re-extracts content (stdio: pipe to capture manifest diff)
3. `npm run build` — triggers prebuild via lifecycle hook then astro build (stdio: inherit)
4. `node scripts/check-links.mjs` — validates all internal links (stdio: inherit)

Key design decisions:
- Extract step uses `{stdio: ['inherit', 'pipe', 'inherit']}` to capture stdout for manifest diff parsing while still showing stderr. Captured output is echoed to stdout after parsing.
- Manifest diff regex parses `Manifest Δ: +N added, ~N changed, -N removed` from extract output.
- Does NOT call prebuild explicitly — it runs automatically via npm lifecycle hook during `npm run build`.
- On failure, immediately exits with the failed step name, elapsed time for that step, and total elapsed time.

Added `"update": "node scripts/update.mjs"` to package.json scripts.

## Verification

- `npm run update` runs end-to-end, exits 0 ✅
- Output includes per-step timing (npm update 1.3s, extract 1.9s, build 5.4s, check-links 59ms) ✅
- Output includes total elapsed time (8.7s) ✅
- Output includes manifest diff (+22 added, ~63 changed, -0 removed) ✅
- Output includes link check pass message ✅
- Output includes page count (134) ✅
- `find dist/ -name "*.html" | wc -l` → 134 ✅
- Failure path: renamed check-links.mjs → `npm run update` exits 1 with `[update] ❌ Step "check-links" failed after 20ms` ✅

### Slice verification (partial — T02 of 3):
- ✅ `npm run build && node scripts/check-links.mjs` exits 0, reports 17840+ links checked
- ✅ `node scripts/update.mjs` runs the full pipeline end-to-end and exits 0
- ✅ `npm run update` works as the one-command invocation
- ✅ Update script output includes manifest diff summary (added/changed/removed counts)
- ✅ Update script output includes link check pass message
- ✅ Update script output includes elapsed time
- ✅ Update script exits non-zero when a step fails (tested by renaming check-links.mjs)
- ✅ Update script names the failed step in error output
- ⬜ `.github/workflows/deploy.yml` — not yet built (T03)
- ✅ `find dist/ -name "*.html" | wc -l` returns 134
- ✅ Link checker reports 0 broken internal page links
- ✅ Link checker exits 1 with structured broken-link report (verified in T01)

## Diagnostics

- **Inspect:** `npm run update` for full pipeline with structured output
- **Failure state:** Exit 1 with `[update] ❌ Step "NAME" failed after Ns` + total elapsed + exit code
- **Summary format:** Step timings table, manifest diff line, pages built count, link check status, total time
- **Per-step output:** Real-time for npm update/build/check-links; buffered-then-echoed for extract (to enable diff parsing)

## Deviations

None — implementation matches the task plan exactly.

## Known Issues

None.

## Files Created/Modified

- `scripts/update.mjs` — new one-command pipeline orchestrator (~100 lines)
- `package.json` — added `"update": "node scripts/update.mjs"` to scripts
- `.gsd/milestones/M001/slices/S06/S06-PLAN.md` — added failure-path diagnostic verification step (pre-flight fix)
