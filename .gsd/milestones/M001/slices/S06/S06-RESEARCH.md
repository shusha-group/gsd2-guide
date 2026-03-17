# S06 — Research

**Date:** 2026-03-17

## Summary

S06 is straightforward integration work — composing existing, proven components (extract, prebuild, build) into a one-command pipeline script and adding a GitHub Actions deployment workflow. All the hard parts are already solved: extraction works (S01), prebuild works (S02), build produces 134 pages (S03-S05). What remains is wiring, a lightweight link checker, and the deployment workflow.

The pipeline needs three new artifacts: (1) a `scripts/update.mjs` orchestrator that chains `npm update gsd-pi` → extract → prebuild → build → link-check, (2) a `scripts/check-links.mjs` post-build validator that scans dist/ HTML for broken internal links, and (3) a `.github/workflows/deploy.yml` GitHub Actions workflow using Astro's official `withastro/action@v5`. No new dependencies needed — the link checker uses Node.js built-ins (fs, path, child_process).

The incremental rebuild requirement (R011) is partially addressed by existing infrastructure: S01's manifest already computes added/changed/removed file diffs between runs, and the extract script's SHA-based tarball cache skips re-download when HEAD is unchanged. Full Astro incremental page builds are not feasible (Astro rebuilds all pages each time), but the content diffing provides the "detect what changed" part of R011. The update script should report the diff summary so the operator sees what changed.

## Recommendation

Build three artifacts in sequence:

1. **Link checker script** (`scripts/check-links.mjs`) — a ~60-line Node script that scans all HTML files in `dist/`, extracts internal `href` attributes matching the `/gsd2-guide/` base path, and resolves each against `dist/` file system. Exits non-zero with a report if any broken links are found. Prototype testing shows this checks 18,601 links in milliseconds with zero false positives (only the missing favicon.svg). No npm dependency needed.

2. **Update pipeline script** (`scripts/update.mjs`) — the one-command orchestrator. Chains: (a) `npm update gsd-pi` to pull latest, (b) `node scripts/extract.mjs` to re-extract content, (c) `node scripts/prebuild.mjs` to bridge docs, (d) `astro build` to produce dist/, (e) `node scripts/check-links.mjs` to validate. Reports timing, manifest diff summary, and link check results. Exits non-zero on any step failure. Add `npm run update` to package.json.

3. **GitHub Actions workflow** (`.github/workflows/deploy.yml`) — uses `withastro/action@v5` with a custom build command that runs extract + prebuild + build + link-check. Triggers on push to main and manual workflow_dispatch. Deploys to GitHub Pages via `actions/deploy-pages@v4`. Requires GITHUB_TOKEN secret for extraction API calls (the default `github.token` may suffice for public repo reads, but extraction fetches from gsd-build/gsd-2 which is a different repo).

## Implementation Landscape

### Key Files

- `scripts/update.mjs` — **New.** One-command update pipeline orchestrator. Imports child_process to spawn each step sequentially. Reports timing and diff summary.
- `scripts/check-links.mjs` — **New.** Post-build broken internal link checker. Scans `dist/**/*.html` for `href="/gsd2-guide/..."` and resolves against dist/ filesystem.
- `.github/workflows/deploy.yml` — **New.** GitHub Actions workflow for GitHub Pages deployment.
- `package.json` — **Modify.** Add `"update"` and `"check-links"` scripts.
- `scripts/extract.mjs` — **Read only.** Already handles extraction with caching and diff reporting.
- `scripts/prebuild.mjs` — **Read only.** Already handles content bridging.
- `astro.config.mjs` — **Read only.** Already configured with `site` and `base` for GitHub Pages.

### Build Order

1. **T01: Link checker** — Build and test `check-links.mjs` against current dist/ output. Confirm it catches the known favicon.svg issue and reports clean for all internal page links. This is standalone with no dependencies on other new code.

2. **T02: Update pipeline script** — Build `update.mjs` that chains all steps including the link checker. Add `npm run update` script. Test end-to-end by running the full pipeline. This depends on T01 (link checker) being available.

3. **T03: GitHub Actions workflow** — Create `.github/workflows/deploy.yml`. This depends on understanding the exact build command from T02. Also needs the git remote to be configured (currently no origin remote — the workflow file can be created regardless, deployment will work once the repo is pushed to `gsd-build/gsd2-guide`).

### Verification Approach

**T01 verification:**
- `npm run build && node scripts/check-links.mjs` exits 0 with count of links checked
- Inject a broken link into a test HTML file, confirm non-zero exit

**T02 verification:**
- `node scripts/update.mjs` runs the full pipeline end-to-end and exits 0
- Output shows manifest diff summary (added/changed/removed counts)
- Output shows link check pass
- Total elapsed time reported
- `npm run update` works as the one-command invocation

**T03 verification:**
- `.github/workflows/deploy.yml` passes `actionlint` or manual YAML syntax review
- Workflow references correct build commands
- Permissions include `pages: write` and `id-token: write`

**Slice-level verification:**
- `npm run update` from clean state → extracts → prebuilds → builds → checks links → reports summary
- dist/ contains 134+ pages
- Link checker reports 0 broken internal links (excluding favicon which can be fixed as a bonus)
- `.github/workflows/deploy.yml` has correct structure for withastro/action@v5

## Constraints

- **Astro has no incremental page build.** `astro build` always rebuilds all pages. R011's "regenerates only changed pages" can only be satisfied at the content level (only re-extract changed content) — not at the HTML generation level. The manifest diff reporting satisfies the spirit of R011.
- **No origin remote configured.** The GitHub Actions workflow can be written but won't run until the repo is pushed to GitHub. This is fine — the workflow file is correct and ready.
- **favicon.svg is missing.** The link checker will flag this. Either add a favicon or exclude asset links from the check. Recommendation: add a simple favicon as part of T01 so the link checker reports clean.
- **`withastro/action@v5` runs npm install + astro build.** It doesn't know about the extract step. The workflow must either: (a) run extract as a separate step before the action, or (b) use the action's `build` input to override the build command. Option (b) is cleaner — set `build` to `npm run extract && npm run build && npm run check-links`.

## Common Pitfalls

- **Double prebuild execution** — `npm run build` already triggers prebuild via npm lifecycle hook. The update script should NOT call prebuild explicitly; it's handled by the build step. The extract → build chain is sufficient.
- **GitHub API rate limits in CI** — The extraction script makes 3 API calls per cached run, more on first run. The GitHub Actions `GITHUB_TOKEN` has 1000 requests/hr for the default token but it's scoped to the current repo. For fetching from `gsd-build/gsd-2` (a different repo), a personal access token or the default token with public repo read access may be needed. Public repos can be read without authentication, so the 60/hr unauthenticated limit applies — this is fine for CI since it runs infrequently.
- **Base path in link checking** — Internal links in the HTML use `/gsd2-guide/` prefix. The checker must strip this prefix when resolving against `dist/`. Don't forget that `dist/` does NOT have a `gsd2-guide/` subdirectory (per KNOWLEDGE.md).

## Sources

- Astro GitHub Pages deployment uses `withastro/action@v5` + `actions/deploy-pages@v4` (source: Astro docs)
- Prototype link checker tested against current dist/: 18,601 internal links, only `favicon.svg` missing
