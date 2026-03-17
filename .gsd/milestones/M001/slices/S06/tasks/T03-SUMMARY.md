---
id: T03
parent: S06
milestone: M001
provides:
  - .github/workflows/deploy.yml — GitHub Actions workflow for automated GitHub Pages deployment on push to main
key_files:
  - .github/workflows/deploy.yml
key_decisions:
  - Use withastro/action@v5 build input to chain extract + build + check-links in a single step rather than separate workflow steps — the action handles checkout, npm install, and artifact upload automatically
  - Set cancel-in-progress: false on the concurrency group — ensures in-progress deployments complete rather than being cancelled by newer pushes, preventing partial deploys
patterns_established:
  - Workflow build command mirrors the update script pipeline order: extract → build → check-links
observability_surfaces:
  - GitHub Actions run logs show per-step output for extract, build, and check-links
  - Deploy job exposes the live deployment URL via steps.deployment.outputs.page_url
  - Build failures surface as failed workflow runs with the failing command's output visible in logs
duration: 5m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T03: Create GitHub Actions deployment workflow

**Created `.github/workflows/deploy.yml` — deploys to GitHub Pages on push to main using withastro/action@v5 (extract + build + check-links) and actions/deploy-pages@v4.**

## What Happened

Created the GitHub Actions workflow file at `.github/workflows/deploy.yml`. The workflow:

1. **Triggers** on push to `main` branch and `workflow_dispatch` (manual)
2. **Permissions** set at top level: `contents: read`, `pages: write`, `id-token: write`
3. **Concurrency** group `pages` with `cancel-in-progress: false` prevents parallel deployments
4. **Build job** uses `withastro/action@v5` with custom build command `npm run extract && npm run build && npm run check-links` and `node-version: "22"`. The action handles checkout, npm install, and artifact upload automatically.
5. **Deploy job** depends on build, uses `actions/deploy-pages@v4` with the `github-pages` environment and exposes the deployment URL.

No special token configuration needed — the extract script reads from public GitHub API endpoints.

## Verification

- YAML parsed successfully via `require('yaml').parse()` — all top-level keys, job structure, triggers, permissions, and action references validated programmatically
- Confirmed all 7 must-haves:
  - ✅ Push to main + workflow_dispatch triggers
  - ✅ pages: write + id-token: write permissions
  - ✅ withastro/action@v5 with custom build command
  - ✅ Build command includes extract + build + check-links
  - ✅ actions/deploy-pages@v4 for deployment
  - ✅ node-version: "22"
  - ✅ Concurrency group with cancel-in-progress: false
- Slice verification check for workflow structure: **PASS**

## Diagnostics

- **Inspect:** `cat .github/workflows/deploy.yml` to review workflow structure
- **Validate YAML:** `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/deploy.yml','utf8'))"`
- **Deployment status:** Check GitHub Actions tab after pushing to main — build job logs show extract/build/check-links output, deploy job shows Pages URL
- **Failure state:** Build job fails if any of extract/build/check-links exits non-zero; the failing command's stderr/stdout is visible in the Actions log

## Deviations

None.

## Known Issues

- Deployment requires the repo to be pushed to GitHub with Pages enabled — the workflow file is ready but won't run until the remote is configured
- The `withastro/action@v5` will need its checkout step to have appropriate permissions if the repo ever becomes private (currently public, so no auth needed for extract)

## Files Created/Modified

- `.github/workflows/deploy.yml` — GitHub Actions workflow for GitHub Pages deployment (new)
- `.gsd/milestones/M001/slices/S06/tasks/T03-PLAN.md` — Added Observability Impact section (pre-flight fix)
