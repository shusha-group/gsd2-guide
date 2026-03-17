---
estimated_steps: 6
estimated_files: 2
---

# T02: Build one-command update pipeline script

**Slice:** S06 — Update pipeline & GitHub Pages deployment
**Milestone:** M001

## Description

Create `scripts/update.mjs` — the one-command pipeline orchestrator that satisfies R007 (single command for update cycle) and R011 (content diff detection). Chains: `npm update gsd-pi` → `node scripts/extract.mjs` → `npm run build` → `node scripts/check-links.mjs`. Reports timing per step, manifest diff summary, and overall result.

**Critical constraints:**
- Do NOT call `node scripts/prebuild.mjs` explicitly — it runs automatically as part of `npm run build` via the npm `prebuild` lifecycle hook. Calling it explicitly would cause double execution.
- The extract script (`scripts/extract.mjs`) prints manifest diff information (added/changed/removed counts) to stdout. Parse or capture this to include in the summary.
- Each step must run synchronously — if any step fails (non-zero exit), abort immediately and report which step failed.

## Steps

1. Create `scripts/update.mjs` as an ESM module
2. Import `child_process` (for `execSync` or `spawnSync`) and `perf_hooks` (for timing)
3. Define the pipeline steps as an ordered array:
   ```
   [
     { name: 'npm update', cmd: 'npm update gsd-pi' },
     { name: 'extract', cmd: 'node scripts/extract.mjs' },
     { name: 'build', cmd: 'npm run build' },
     { name: 'check-links', cmd: 'node scripts/check-links.mjs' }
   ]
   ```
4. For each step: print a header with step name, run the command with `execSync` (inheriting stdio for real-time output), measure elapsed time, catch errors and exit with non-zero code if any step fails. Print elapsed time after each step completes.
5. After the extract step, read `content/generated/manifest.json` and compare against the previous manifest to report added/changed/removed counts. The extract script already computes this diff — capture its output or read the manifest directly. The extract script logs lines like `[manifest] Diff: N added, N changed, N removed` — parse this from the captured output.
6. After all steps pass, print a summary: total elapsed time, manifest diff summary, link check result (passed), and total page count (by counting HTML files in dist/).
7. Add `"update": "node scripts/update.mjs"` to `package.json` scripts

**Timing approach:** Use `Date.now()` or `performance.now()` around each step. Format elapsed times as human-readable (e.g., "12.3s").

**Output capture approach:** Use `execSync` with `{stdio: 'pipe'}` for extract step to capture stdout and parse manifest diff. Use `{stdio: 'inherit'}` for other steps so the user sees real-time output. Alternatively, use `{stdio: 'inherit'}` for all steps and read the manifest.json file after extract to compute diff, since the manifest module already writes both current and diff data.

## Must-Haves

- [ ] Chains npm update → extract → build → check-links in sequence
- [ ] Does NOT call prebuild explicitly (it's an npm lifecycle hook of build)
- [ ] Reports elapsed time per step and total
- [ ] Reports manifest diff summary (added/changed/removed counts)
- [ ] Exits non-zero immediately if any step fails, naming the failed step
- [ ] `npm run update` works as the one-command invocation
- [ ] Output is readable and structured (phase labels, timing, summary)

## Verification

- `npm run update` runs end-to-end and exits 0
- Output includes timing for each step (extract, build, check-links)
- Output includes total elapsed time
- Output includes manifest diff (added/changed/removed — likely all 0 for cached run)
- Output includes link check pass
- `find dist/ -name "*.html" | wc -l` returns 134+ after running
- Test failure path: temporarily rename `scripts/check-links.mjs` → run `npm run update` → should fail with clear error naming the failed step → rename back

## Observability Impact

- Signals added: Phase-labeled console output (`[update]`, `[extract]`, `[build]`, `[check-links]`) with timing per step
- How a future agent inspects this: `npm run update` output shows step-by-step progress, failures are labeled with step name
- Failure state exposed: Non-zero exit code + step name that failed + elapsed time up to failure

## Inputs

- `scripts/extract.mjs` — S01's extraction script (run as subprocess)
- `scripts/prebuild.mjs` — S02's content bridge (runs automatically via npm prebuild hook during build)
- `scripts/check-links.mjs` — T01's link checker (run as subprocess)
- `package.json` — needs `"update"` script added

## Expected Output

- `scripts/update.mjs` — ~80-120 line pipeline orchestrator script
- `package.json` — updated with `"update"` script entry
