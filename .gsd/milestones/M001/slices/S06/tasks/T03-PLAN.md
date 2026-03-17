---
estimated_steps: 4
estimated_files: 1
---

# T03: Create GitHub Actions deployment workflow

**Slice:** S06 — Update pipeline & GitHub Pages deployment
**Milestone:** M001

## Description

Create `.github/workflows/deploy.yml` — the GitHub Actions workflow that automates deployment to GitHub Pages on push to main. This satisfies R008 (GitHub Pages deployment via git push). Uses `withastro/action@v5` for the build step and `actions/deploy-pages@v4` for deployment.

**Key design choices:**
- The `withastro/action@v5` handles `npm install` and runs the build. Use its `build` input to override the default build command with one that includes extraction and link checking.
- The build command should be: `npm run extract && npm run build && npm run check-links`
- The `npm run build` internally triggers `prebuild` via npm lifecycle hook, so extract → prebuild → astro build → check-links all execute in the right order.
- Set `node-version: 22` since the project uses Node.js 22 features.
- The workflow file can be created now. Deployment will work once the repo is pushed to `gsd-build/gsd2-guide` on GitHub and Pages is enabled.
- Public repos can be read without authentication for the GitHub API calls in extract, so no special token configuration is needed for content extraction.

## Steps

1. Create `.github/workflows/deploy.yml`
2. Configure triggers: `push` to `main` branch + `workflow_dispatch` for manual runs
3. Set top-level permissions: `contents: read`, `pages: write`, `id-token: write`
4. Add concurrency group `pages` with `cancel-in-progress: false` to prevent parallel deployments
5. Define `build` job on `ubuntu-latest`:
   - Use `withastro/action@v5` step with inputs: `build: "npm run extract && npm run build && npm run check-links"`, `node-version: "22"`
6. Define `deploy` job on `ubuntu-latest` that `needs: build`:
   - Uses `actions/deploy-pages@v4`
   - Has an `environment` block pointing to `github-pages` with the deployment URL
7. Verify YAML syntax is valid

## Must-Haves

- [ ] Triggers on push to main and workflow_dispatch
- [ ] Permissions include pages: write and id-token: write
- [ ] Build job uses withastro/action@v5 with custom build command
- [ ] Build command includes extract + build + check-links
- [ ] Deploy job uses actions/deploy-pages@v4
- [ ] Node version set to 22
- [ ] Concurrency group prevents parallel deployments

## Verification

- `.github/workflows/deploy.yml` exists and is valid YAML
- File contains: `withastro/action@v5`, `actions/deploy-pages@v4`, `npm run extract`, `npm run check-links`
- File has `pages: write` and `id-token: write` permissions
- File triggers on `push` to `main` and `workflow_dispatch`
- Verify YAML parses without error: `node -e "const fs=require('fs'); const y=require('yaml'); y.parse(fs.readFileSync('.github/workflows/deploy.yml','utf8')); console.log('YAML valid')"` (or use a simple JSON.parse check if yaml module not available — alternatively just confirm the file structure manually)

## Inputs

- `package.json` — has `extract`, `build`, `check-links` scripts (from T01 and T02)
- Knowledge: `withastro/action@v5` runs `npm install` automatically, then the custom `build` command
- Knowledge: `actions/deploy-pages@v4` deploys the artifact uploaded by the Astro action
- Knowledge: Site is configured for `gsd-build.github.io/gsd2-guide` in `astro.config.mjs`

## Expected Output

- `.github/workflows/deploy.yml` — Complete GitHub Actions workflow file for GitHub Pages deployment
