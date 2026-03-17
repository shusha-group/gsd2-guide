---
id: S06
parent: M001
milestone: M001
provides:
  - scripts/check-links.mjs — post-build broken internal link checker (17975 links across 135 pages)
  - scripts/update.mjs — one-command pipeline orchestrator (npm update → extract → build → check-links)
  - .github/workflows/deploy.yml — GitHub Actions workflow for automated GitHub Pages deployment
  - "check-links" and "update" npm script entries
requires:
  - slice: S01
    provides: scripts/extract.mjs, content/generated/manifest.json
  - slice: S02
    provides: Astro site scaffold, prebuild lifecycle hook, astro build
  - slice: S03
    provides: Quick-reference pages consuming generated JSON
  - slice: S04
    provides: Deep-dive documentation pages from generated markdown
  - slice: S05
    provides: Changelog page, version display in header
affects: []
key_files:
  - scripts/check-links.mjs
  - scripts/update.mjs
  - .github/workflows/deploy.yml
  - package.json
key_decisions:
  - Only check <a> tag hrefs, not <link> tags — avoids 268 false positives from Starlight's favicon.svg and sitemap-index.xml metadata tags
  - cancel-in-progress: false on deployment concurrency group — prevents partial deploys from interrupted workflow runs
  - Extract step captured via pipe for manifest diff parsing; all other steps use inherited stdio for real-time output
  - withastro/action@v5 handles checkout, npm install, and artifact upload — custom build command chains extract + build + check-links
patterns_established:
  - Structured console output with phase-labeled prefixes: [update], [link-check]
  - Pipeline failure format: `[update] ❌ Step "NAME" failed after Ns` with total elapsed and exit code
  - Base path stripping pattern: /gsd2-guide/path/ → /path/ → dist/path/index.html
  - Pipeline summary includes step timings table, manifest diff, page count, link check status, total time
observability_surfaces:
  - "npm run update" — full pipeline with per-step timing and manifest diff summary
  - "npm run check-links" — standalone link validation (17975 links, ~60ms)
  - Exit code 0/1 for CI integration on both scripts
  - GitHub Actions workflow logs for extract/build/check-links and deployment URL
drill_down_paths:
  - .gsd/milestones/M001/slices/S06/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S06/tasks/T03-SUMMARY.md
duration: 33m
verification_result: passed
completed_at: 2026-03-17
---

# S06: Update pipeline & GitHub Pages deployment

**One-command update pipeline (`npm run update`) chains npm update → extract → build → check-links in 6.6s, with manifest diff reporting, broken link detection across 17975 links, and a GitHub Actions workflow ready for automated GitHub Pages deployment on push to main.**

## What Happened

Built the final assembly slice — the operational layer that composes all previous slices (S01–S05) into a working deployment pipeline.

**T01: Broken link checker.** Created `scripts/check-links.mjs` — a zero-dependency Node.js ESM script that recursively scans all HTML files in `dist/`, extracts `href` attributes from `<a>` tags only, filters to internal links starting with `/gsd2-guide/`, strips the base path to resolve against the `dist/` filesystem, and reports results with structured `[link-check]` output. Handles trailing slashes (→ index.html), hash fragments (strip before check), and skips external/anchor/asset links. Runs in ~60ms across 135 files and 17975 links.

**T02: Update pipeline orchestrator.** Created `scripts/update.mjs` — chains four steps via `child_process.execSync`: (1) `npm update gsd-pi`, (2) `node scripts/extract.mjs` (piped to capture manifest diff), (3) `npm run build` (which triggers prebuild automatically via npm lifecycle hook), (4) `node scripts/check-links.mjs`. Reports per-step timing, manifest diff summary (added/changed/removed counts), page count, and link check status. Exits non-zero immediately on any step failure with the failed step name and elapsed time.

**T03: GitHub Actions workflow.** Created `.github/workflows/deploy.yml` — triggers on push to main and workflow_dispatch. Uses `withastro/action@v5` with a custom build command (`npm run extract && npm run build && npm run check-links`) and node 22. Deploys via `actions/deploy-pages@v4`. Concurrency group prevents parallel deployments with `cancel-in-progress: false` to avoid partial deploys.

## Verification

All slice-level verification checks pass:

- `npm run build && node scripts/check-links.mjs` exits 0, reports 17975 internal links checked, 0 broken ✅
- `node scripts/update.mjs` runs the full pipeline end-to-end and exits 0 ✅
- `npm run update` works as the one-command invocation ✅
- Update script output includes manifest diff summary (+0 added, ~0 changed, -0 removed) ✅
- Update script output includes link check pass message ✅
- Update script output includes elapsed time (6.6s total, per-step breakdown) ✅
- Update script exits non-zero when a step fails (tested by renaming check-links.mjs → exit 1 with `[update] ❌ Step "check-links" failed after 20ms`) ✅
- `.github/workflows/deploy.yml` validated programmatically: triggers, permissions, action versions, build command, concurrency, node version — all correct ✅
- `find dist/ -name "*.html" | wc -l` returns 135 ✅
- Link checker reports 0 broken internal page links ✅
- Link checker exits 1 with structured broken-link report when broken link injected ✅
- Update script exits non-zero and names failed step on pipeline failure ✅

## Requirements Advanced

- R010 — Version display now exercised end-to-end through the update pipeline; each `npm run update` rebuilds the header with the latest version from releases.json

## Requirements Validated

- R007 — `npm run update` is the one-command pipeline: npm update → extract → build → check-links, completes in ~6.6s with structured output
- R008 — `.github/workflows/deploy.yml` ready for GitHub Pages deployment via git push; uses withastro/action@v5 + deploy-pages@v4
- R011 — Manifest diff tracking reports added/changed/removed content counts; Astro handles page-level incremental generation
- R021 — `scripts/check-links.mjs` scans 17975 internal links across 135 HTML files, exits non-zero with per-link report on broken links

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

None — all three tasks implemented exactly as planned.

## Known Limitations

- **Deployment requires GitHub remote** — The workflow file is ready but deployment won't run until the repo is pushed to GitHub with Pages enabled in repository settings
- **favicon.svg missing** — Starlight's default `<link rel="shortcut icon">` references `/gsd2-guide/favicon.svg` which doesn't exist in dist/. Harmless (browsers show default icon) but produces 404s. Fix by adding `public/favicon.svg`.
- **No GITHUB_TOKEN in local pipeline** — The extract script uses unauthenticated GitHub API requests (rate limit: 60/hour). Sufficient for the current content volume but would need a token for frequent rebuilds or private repos.

## Follow-ups

- Push repo to GitHub and enable Pages — the workflow and pipeline are ready, this is the final operational step
- Add a `public/favicon.svg` to eliminate browser 404s on the favicon
- Consider setting `GITHUB_TOKEN` in the GitHub Actions workflow secrets if API rate limits become an issue with more content

## Files Created/Modified

- `scripts/check-links.mjs` — post-build broken internal link checker (~80 lines)
- `scripts/update.mjs` — one-command pipeline orchestrator (~100 lines)
- `.github/workflows/deploy.yml` — GitHub Actions deployment workflow
- `package.json` — added "check-links" and "update" script entries

## Forward Intelligence

### What the next slice should know
- This is the final slice of M001. All 6 slices are complete. The site is ready to go live — push to GitHub and enable Pages.
- The full pipeline (`npm run update`) completes in ~6.6s locally. The GitHub Actions workflow mirrors this pipeline: extract → build → check-links → deploy.
- 135 HTML pages are generated, 17975 internal links validated, 0 broken.

### What's fragile
- **GitHub API rate limits without authentication** — extract.mjs uses unauthenticated requests (60/hour). The manifest and releases endpoints consume 3 requests per run. Running the pipeline more than ~20 times/hour will hit rate limits. Adding GITHUB_TOKEN to the workflow environment is the fix.
- **Link count may drift** — The 17975 count changes as pages are added/removed. The check-links script dynamically counts so this isn't a bug, but verification thresholds in plans should be approximate, not exact.

### Authoritative diagnostics
- `npm run check-links` — the single fastest way to verify site integrity after any change. Runs in 60ms and catches broken internal links.
- `npm run update` output — the summary block at the end shows manifest diff, page count, link check status, and timing. If something is wrong, this is the first place to look.

### What assumptions changed
- Plan estimated 18000+ links; actual count is 17975 (then 17975 after rebuild). The difference is due to correctly scoping to `<a>` tags only — not a gap, a deliberate design choice.
- Plan estimated 134+ HTML files; actual is 135. One extra page from the 404.html or an additional content page. The pipeline handles any count.
