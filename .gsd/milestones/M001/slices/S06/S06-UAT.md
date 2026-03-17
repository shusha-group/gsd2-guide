# S06: Update pipeline & GitHub Pages deployment — UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: The pipeline scripts must actually execute — link checking scans real dist/ files, update script chains real commands, and the workflow YAML must be structurally valid. Artifact inspection alone can't verify the pipeline works end-to-end.

## Preconditions

- `npm install` has been run (node_modules present)
- `dist/` exists from a prior build (or will be created during the pipeline)
- Node.js 22+ available
- Internet access for GitHub API calls during extract

## Smoke Test

Run `npm run update` — it should complete in under 30s with all four steps passing and a summary block at the end showing manifest diff, page count, and link check status.

## Test Cases

### 1. Full pipeline end-to-end

1. Run `npm run update`
2. Wait for completion
3. **Expected:** Exit code 0. Output includes:
   - `[update] ✅ npm update completed`
   - `[update] ✅ extract completed`
   - `[update] ✅ build completed`
   - `[update] ✅ check-links completed`
   - Summary block with step timings, manifest diff line, pages built count (135+), link check: passed, total time

### 2. Standalone link checker

1. Run `npm run build` (ensure dist/ is fresh)
2. Run `npm run check-links`
3. **Expected:** Exit code 0. Output: `[link-check] ✅ NNNNN internal links checked — 0 broken` where NNNNN is 17000+

### 3. Link checker detects broken links

1. Open any HTML file in `dist/` (e.g. `dist/getting-started/index.html`)
2. Insert `<a href="/gsd2-guide/nonexistent-broken-page/">bad link</a>` somewhere in the body
3. Run `npm run check-links`
4. **Expected:** Exit code 1. Output includes:
   - `[link-check] ❌ 1 broken internal link(s) found`
   - A line showing the source file, the broken href, and the resolved path
5. Revert the injected link

### 4. Pipeline failure propagation

1. Temporarily rename `scripts/check-links.mjs` to `scripts/check-links.mjs.bak`
2. Run `npm run update`
3. **Expected:** Exit code 1. Output includes:
   - `[update] ❌ Step "check-links" failed after` with elapsed time
   - `[update] Total elapsed:` with total time
   - `[update] Exit code: 1`
4. Rename back: `mv scripts/check-links.mjs.bak scripts/check-links.mjs`

### 5. Manifest diff reporting

1. Run `npm run update` on a clean state (no content changes)
2. **Expected:** Output includes `Manifest diff: +0 added, ~0 changed, -0 removed` (or similar counts if content actually changed)
3. The diff line appears in the summary section at the end of pipeline output

### 6. GitHub Actions workflow structure

1. Open `.github/workflows/deploy.yml`
2. Verify the following structure:
   - `on:` has `push: branches: [main]` and `workflow_dispatch`
   - `permissions:` has `contents: read`, `pages: write`, `id-token: write`
   - `concurrency:` has `group: pages` and `cancel-in-progress: false`
   - `jobs.build` uses `withastro/action@v5` with `build: "npm run extract && npm run build && npm run check-links"` and `node-version: "22"`
   - `jobs.deploy` uses `actions/deploy-pages@v4` with `needs: build` and `environment: name: github-pages`
3. **Expected:** All structural elements present and correct

### 7. Page count verification

1. Run `npm run build`
2. Run `find dist/ -name "*.html" | wc -l`
3. **Expected:** 134 or more HTML files

## Edge Cases

### Extract step fails (network error)

1. Disconnect from the internet
2. Run `npm run update`
3. **Expected:** Pipeline exits non-zero at the extract step with `[update] ❌ Step "extract" failed` — the pipeline does not proceed to build

### Build step fails (Astro error)

1. Introduce a syntax error in an .mdx file (e.g., add `{{{` to `src/content/docs/index.mdx`)
2. Run `npm run update`
3. **Expected:** Pipeline exits non-zero at the build step with `[update] ❌ Step "build" failed` — check-links is never reached
4. Revert the syntax error

## Failure Signals

- `npm run update` exits with code 1 — check which step failed in the output
- `npm run check-links` exits with code 1 — broken links exist, see the per-link report
- Fewer than 134 HTML files in `dist/` after build — content extraction or prebuild may have failed
- No manifest diff line in update output — extract script output format may have changed
- GitHub Actions workflow fails on push — check the Actions tab for the build job's error output

## Requirements Proved By This UAT

- R007 — Test cases 1, 4, 5 prove the one-command pipeline works, reports diffs, and handles failures
- R008 — Test case 6 proves the deployment workflow has correct structure for GitHub Pages
- R011 — Test case 5 proves manifest diff reporting works (content change detection)
- R021 — Test cases 2, 3 prove broken link detection works with correct exit codes and reporting

## Not Proven By This UAT

- R008 live deployment — the workflow file is validated structurally but actual GitHub Pages deployment requires pushing to GitHub and enabling Pages in repository settings
- Performance under load — pipeline timing (~6.6s) was measured once, not benchmarked across varying content volumes
- Authenticated GitHub API — all tests use unauthenticated requests; rate limit behavior with GITHUB_TOKEN not tested

## Notes for Tester

- The extract step makes GitHub API calls — if rate limited (60/hour unauthenticated), the extract step may fail. Wait or set `GITHUB_TOKEN` environment variable.
- The link count (17975) may change slightly between runs if content is updated. The important thing is that broken count is 0.
- The workflow file can't be tested locally (it's a GitHub Actions YAML). Structural validation via YAML parsing is the best we can do without a GitHub runner.
- After running edge case tests, always restore modified files to their original state.
