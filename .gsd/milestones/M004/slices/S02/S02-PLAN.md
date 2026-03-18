# S02: Pipeline Integration and End-to-End Proof

**Goal:** The `npm run update` pipeline detects stale pages, regenerates them via `claude -p`, builds, link-checks, and stamps — all with zero intervention. The end-to-end cycle (including commit, push, GitHub Pages deploy) is proven on the 3 originally-stale pages. The fast path (no stale pages) completes in under 15 seconds.

**Demo:** Running `npm run update` regenerates stale pages via Claude Code, build passes with 0 broken links. "Update gsd-guide" commits, pushes to main, and GitHub Pages deploys. A second `npm run update` (no stale pages) completes in <15s.

## Must-Haves

- `reference/skills.mdx` restored from main so the build has 0 broken links
- `npm run update` runs end-to-end: stale pages detected → `claude -p` regenerates them → build passes → link check passes → pages stamped
- The 3 target pages (`commands/config.mdx`, `reference/skills.mdx`, `reference/extensions.mdx`) are specifically regenerated and verified
- Commit + push to main triggers GitHub Pages deployment
- Fast path (no stale pages) completes under 15 seconds
- Existing 20/20 tests still pass (regression gate)

## Proof Level

- This slice proves: operational + final-assembly
- Real runtime required: yes — real `claude -p` invocations, real GitHub Pages deployment
- Human/UAT required: no (visual quality check is a follow-up, not a gate)

## Verification

- `ls src/content/docs/reference/skills.mdx` — file exists after T01
- `npm run build` exits 0, 65+ pages built
- `node scripts/check-links.mjs` exits 0, 0 broken links
- `npm run update` exits 0 with regeneration log output showing ✓ for stale pages
- Pipeline log confirms the 3 target pages: `commands/config.mdx`, `reference/skills.mdx`, `reference/extensions.mdx`
- `node --test tests/regenerate-page.test.mjs` — 20/20 tests pass (regression)
- `git push origin main` succeeds
- GitHub Actions `deploy.yml` workflow succeeds (visible in Actions tab)
- Second `npm run update` run with no stale pages completes under 15 seconds
- `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` returns nothing (regression)

## Observability / Diagnostics

- Runtime signals: `npm run update` logs per-step timing, per-page regeneration status (✓/✗/⊘), stale count, total duration
- Inspection surfaces: `node scripts/lib/regenerate-page.mjs <page>` for single-page debug; `page-versions.json` for freshness state
- Failure visibility: Pipeline step name + error on failure; subprocess stderr in error result `details` field
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: S01's `regeneratePage()`, `findClaude()`, `parseStreamJson()` in `scripts/lib/regenerate-page.mjs`; `update.mjs` pipeline steps; `check-page-freshness.mjs` `getStalePages()`/`stampPages()`; `page-source-map.json`
- New wiring introduced in this slice: none — S01/T03 already wired `findClaude()` into `update.mjs`
- What remains before the milestone is truly usable end-to-end: nothing — this is the final slice

## Tasks

- [x] **T01: Restore skills.mdx and verify clean build with zero broken links** `est:10m`
  - Why: `reference/skills.mdx` was accidentally deleted in S01/T02, causing 65 broken links. This blocks the pipeline's check-links step and must be fixed before any `npm run update` run.
  - Files: `src/content/docs/reference/skills.mdx`
  - Do: `git checkout main -- src/content/docs/reference/skills.mdx` to restore the file. Run `npm run build` to verify it builds (should be 66+ pages now). Run `node scripts/check-links.mjs` to verify 0 broken links. Run `node --test tests/regenerate-page.test.mjs` to confirm 20/20 tests still pass.
  - Verify: `npm run build` exits 0; `node scripts/check-links.mjs` exits 0 with 0 broken links; 20/20 tests pass
  - Done when: Build produces 66+ pages, link check shows 0 broken links, all tests pass

- [ ] **T02: Run full `npm run update` pipeline with real page regeneration** `est:20m`
  - Why: This is the core proof for R049 and R052. The pipeline must detect stale pages, invoke `claude -p` for each, and pass build + link check. The 3 target pages must be among those regenerated.
  - Files: `src/content/docs/commands/config.mdx`, `src/content/docs/reference/skills.mdx`, `src/content/docs/reference/extensions.mdx`, `page-versions.json`
  - Do: First, stamp all pages fresh via `node -e "import('./scripts/check-page-freshness.mjs').then(m => m.stampPages())"`, then manually zero-out the version hashes for only the 3 target pages in `page-versions.json` so they are detected as stale. Run `npm run update`. Verify the pipeline output shows regeneration of those 3 pages with ✓ status. Verify build passes and link check passes. If any reference page regeneration produces poor quality, note it as a known limitation — prompt tuning is out of scope for this task.
  - Verify: `npm run update` exits 0; pipeline log shows ✓ for `commands/config.mdx`, `reference/skills.mdx`, `reference/extensions.mdx`; build passes; link check 0 broken
  - Done when: Pipeline completes end-to-end with 3 stale pages regenerated, build passes, 0 broken links

- [ ] **T03: End-to-end deploy proof and fast path verification** `est:15m`
  - Why: Proves R053 (zero-intervention deploy cycle) and R055 (fast path <15s). The final proof that "update gsd-guide" works end-to-end.
  - Files: `page-versions.json` (verified fresh after T02's stamp step)
  - Do: Merge the `milestone/M004` worktree branch to `main` (from the main repo checkout at `/Users/davidspence/dev/gsd2-guide`). Push to main. Verify GitHub Actions `deploy.yml` workflow triggers and succeeds. Then, from the main repo on `main`, run `npm run update` with all pages fresh to prove the fast path — should log "All N pages are current" and complete in under 15 seconds. Record the total pipeline time.
  - Verify: `git push origin main` succeeds; GitHub Actions deploy workflow passes; second `npm run update` completes in <15s with "All N pages are current" log message
  - Done when: GitHub Pages deployment verified, fast path run completes under 15 seconds

## Files Likely Touched

- `src/content/docs/reference/skills.mdx` (restored from main)
- `src/content/docs/commands/config.mdx` (regenerated by claude -p)
- `src/content/docs/reference/extensions.mdx` (regenerated by claude -p)
- `page-versions.json` (freshness stamps updated)
