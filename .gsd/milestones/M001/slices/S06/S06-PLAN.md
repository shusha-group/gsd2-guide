# S06: Update pipeline & GitHub Pages deployment

**Goal:** One command updates the npm package, diffs content against the last build, regenerates changed pages, builds the site, runs broken link detection, and deploys to GitHub Pages. Site is live.
**Demo:** `npm run update` runs the full pipeline end-to-end — extract → build (with prebuild) → link-check — reporting timing, manifest diff summary, and link check results. `.github/workflows/deploy.yml` is ready for GitHub Pages deployment on push to main.

## Must-Haves

- `scripts/check-links.mjs` scans dist/ HTML for broken internal links and exits non-zero with a report if any are found
- `scripts/update.mjs` chains: npm update gsd-pi → extract → build → link-check, reporting timing and manifest diff
- `npm run update` and `npm run check-links` scripts in package.json
- `.github/workflows/deploy.yml` using `withastro/action@v5` with extract + build + link-check
- Link checker strips `/gsd2-guide/` base path prefix when resolving against dist/ filesystem
- Update script reports added/changed/removed content counts from manifest diff
- Update script exits non-zero if any step fails
- Workflow triggers on push to main and manual workflow_dispatch
- Workflow has `pages: write` and `id-token: write` permissions

## Proof Level

- This slice proves: operational + final-assembly
- Real runtime required: yes — `npm run update` must execute the full pipeline
- Human/UAT required: no

## Verification

- `npm run build && node scripts/check-links.mjs` exits 0, reports count of links checked (expect 18000+)
- `node scripts/update.mjs` runs the full pipeline end-to-end and exits 0
- `npm run update` works as the one-command invocation
- Update script output includes manifest diff summary (added/changed/removed counts)
- Update script output includes link check pass message
- Update script output includes elapsed time
- Update script exits non-zero when a step fails (test by injecting a broken step)
- `.github/workflows/deploy.yml` has correct structure: triggers on push/main + workflow_dispatch, uses withastro/action@v5, has pages permissions
- `find dist/ -name "*.html" | wc -l` returns 134+ after pipeline run
- Link checker reports 0 broken internal page links
- Link checker exits 1 and prints structured broken-link report when a broken link exists (inject a bad href to test, then revert)

## Observability / Diagnostics

- Runtime signals: Phase-labeled console output with timing per step ([extract], [build], [link-check], [update])
- Inspection surfaces: `npm run check-links` standalone for link validation; `npm run update` for full pipeline; manifest diff in update output
- Failure visibility: Non-zero exit code with step name that failed, elapsed time up to failure point
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: `scripts/extract.mjs` (S01), `scripts/prebuild.mjs` (S02, via npm prebuild hook), `content/generated/manifest.json` (S01), all dist/ HTML output (S01-S05)
- New wiring introduced: `scripts/update.mjs` composes extract → build → link-check into one command; `.github/workflows/deploy.yml` automates deployment
- What remains before the milestone is truly usable end-to-end: Push repo to GitHub and enable Pages — the workflow file is ready but deployment requires the remote

## Tasks

- [x] **T01: Build broken internal link checker** `est:20m`
  - Why: R021 requires broken link detection before deployment. The link checker is standalone — it validates dist/ HTML and is consumed by both the update script (T02) and the GitHub Actions workflow (T03).
  - Files: `scripts/check-links.mjs`, `package.json`
  - Do: Create a Node.js ESM script that scans all HTML files in `dist/`, extracts internal `href` attributes matching the `/gsd2-guide/` base path, strips the prefix to resolve against `dist/` filesystem, and reports broken links. Add `"check-links": "node scripts/check-links.mjs"` to package.json. Must handle: trailing slashes (resolve to index.html), hash fragments (strip before file check), anchor-only links (skip), external links (skip). Exit 0 with link count on success, exit 1 with broken link report on failure. Use only Node.js built-ins (fs, path, url — no npm deps).
  - Verify: `npm run build && npm run check-links` exits 0 and reports 18000+ links checked with 0 broken
  - Done when: Link checker exits 0 on current dist/ with count of links checked reported to stdout

- [ ] **T02: Build one-command update pipeline script** `est:25m`
  - Why: R007 requires a single command for the full update cycle. R011 requires content diff reporting. This script composes all existing pieces into the one-command pipeline.
  - Files: `scripts/update.mjs`, `package.json`
  - Do: Create a Node.js ESM script that chains steps sequentially using child_process.execSync or spawn: (1) `npm update gsd-pi` to pull latest, (2) `node scripts/extract.mjs` to re-extract content — capture its output to parse manifest diff, (3) `npm run build` which triggers prebuild automatically via npm lifecycle hook then runs astro build, (4) `node scripts/check-links.mjs` to validate. IMPORTANT: do NOT call prebuild explicitly — it runs automatically as part of `npm run build`. Report: elapsed time per step, total elapsed time, manifest diff summary (added/changed/removed counts from extract output), link check results. Exit non-zero immediately if any step fails, reporting which step failed. Add `"update": "node scripts/update.mjs"` to package.json.
  - Verify: `npm run update` runs end-to-end, exits 0, output includes timing + diff summary + link check pass
  - Done when: `npm run update` completes the full pipeline in one command with structured output showing all phases passed

- [ ] **T03: Create GitHub Actions deployment workflow** `est:15m`
  - Why: R008 requires GitHub Pages deployment. The workflow file is the deployment mechanism — it runs on push to main and uses the Astro official action.
  - Files: `.github/workflows/deploy.yml`
  - Do: Create a GitHub Actions workflow that: (1) triggers on push to main branch and workflow_dispatch, (2) sets permissions for `contents: read`, `pages: write`, `id-token: write`, (3) has a build job using `withastro/action@v5` with the `build` input set to run extract + build + check-links (the action handles npm install + the custom build command), (4) has a deploy job using `actions/deploy-pages@v4`. The build input should be: `npm run extract && npm run build && npm run check-links`. The action's node-version input should be set to 22. Use `ubuntu-latest` runner. Add concurrency group to prevent parallel deployments.
  - Verify: YAML syntax is valid (no parse errors). Workflow has correct triggers, permissions, build command, and deploy action. Manual review of the file structure.
  - Done when: `.github/workflows/deploy.yml` exists with correct structure for withastro/action@v5 + deploy-pages, ready to run when repo is pushed to GitHub

## Files Likely Touched

- `scripts/check-links.mjs`
- `scripts/update.mjs`
- `.github/workflows/deploy.yml`
- `package.json`
