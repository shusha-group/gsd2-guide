# S02: Pipeline Integration and End-to-End Proof — UAT

**Milestone:** M004
**Written:** 2026-03-18

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: This slice proves operational behavior — real `claude -p` invocations, real builds, real GitHub Pages deployment. Artifact-driven testing cannot verify subprocess invocation, API latency, or deployment success.

## Preconditions

- `claude` CLI is installed and available in PATH (`which claude` succeeds)
- Working internet connection (for `npm i -g gsd-pi@latest` and `claude -p` API calls)
- Git remote `origin` points to `shusha-group/gsd2-guide` on GitHub
- GitHub Actions `deploy.yml` workflow is enabled on the repository
- Current branch is `main` (or can be merged to main)

## Smoke Test

Run `npm run update` from the project root. It should complete with exit code 0, logging per-step timing and a summary line showing the page count and link check result.

## Test Cases

### 1. Stale page detection and regeneration

1. From the project root, stamp all pages fresh:
   ```
   node -e "import('./scripts/check-page-freshness.mjs').then(m => m.stampPages())"
   ```
2. Edit `page-versions.json` — set the `depHash` for `commands/config.mdx` to `"stale"`
3. Run `npm run update`
4. **Expected:** Pipeline detects 1 stale page, invokes `claude -p` for `commands/config.mdx`, logs ✓ with model name and duration, builds successfully, link check passes (0 broken), stamps all pages fresh. Exit code 0.

### 2. Multiple stale pages — partial failure tolerance

1. Stamp all pages, then set `depHash` to `"stale"` for both `commands/config.mdx` and `reference/extensions.mdx`
2. Run `npm run update`
3. **Expected:** Pipeline detects 2 stale pages, attempts regeneration for both. If one fails (timeout, file deleted), pipeline continues and builds with existing content for the failed page. Log shows ✓ for succeeded and ✗ for failed pages. Build still passes (exit 0) unless the failure caused missing files.

### 3. Fast path — no stale pages

1. Run `npm run update` immediately after a successful run that stamped all pages
2. Time the pipeline-logic portion (extract through stamp steps, excluding `npm i -g gsd-pi@latest`)
3. **Expected:** Regenerate step logs "All 43 pages are current — no regeneration needed" and completes in <100ms. Total pipeline-logic time under 15 seconds. Exit code 0.

### 4. Claude CLI missing — graceful degradation

1. Run `npm run update` with `claude` not in PATH:
   ```
   PATH=/usr/bin:/bin npm run update
   ```
2. **Expected:** Pipeline logs "claude CLI not available" (or similar), skips regeneration step, builds with existing content, link check passes. Exit code 0.

### 5. End-to-end deploy cycle

1. Make a trivial change (e.g., touch `page-versions.json`) and commit
2. Push to `origin/main`
3. Check GitHub Actions: `gh run list --workflow=deploy.yml -L 1`
4. **Expected:** `deploy.yml` workflow triggers automatically, completes with success status. Site is live at the GitHub Pages URL.

### 6. Build integrity after regeneration

1. After any regeneration run, verify build output:
   ```
   npm run build
   node scripts/check-links.mjs
   node --test tests/regenerate-page.test.mjs
   ```
2. **Expected:** Build produces 65+ pages, link check shows 0 broken links, 20/20 tests pass.

### 7. SDK removal regression

1. Run: `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json`
2. **Expected:** No matches (exit code 1). The `@anthropic-ai/sdk` dependency is fully removed.

## Edge Cases

### Reference page with many dependencies (skills.mdx — 295 deps)

1. Set `reference/skills.mdx` depHash to `"stale"` in `page-versions.json`
2. Run `npm run update`
3. **Expected:** `claude -p` processes the page (may take 60-120s due to dep count). If the file is deleted by the subprocess instead of rewritten, the pipeline should ideally detect the missing file (currently does not — known limitation). Verify the file exists after completion: `ls src/content/docs/reference/skills.mdx`

### Timeout on long regeneration

1. Set a page with many deps as stale and run with elevated API latency (e.g., during peak hours)
2. **Expected:** If the 300s timeout is hit, the page shows ✗ in logs with SIGTERM. Pipeline continues with other pages (if any) and builds with existing content.

### No pages in source map

1. This is not expected to occur in normal operation. If `page-source-map.json` is empty or missing, the freshness check should return 0 stale pages and the fast path should activate.

## Failure Signals

- `npm run update` exits non-zero — pipeline step failure
- Link check reports broken links — a regenerated page has invalid internal links or a file was deleted
- Build fails — regenerated MDX has invalid frontmatter or syntax errors
- ✗ in pipeline log for a page — `claude -p` subprocess failed (timeout, error, file deleted)
- `reference/skills.mdx` missing after run — known `claude -p` file deletion issue
- Tests fail (< 20/20) — regression in regeneration engine

## Requirements Proved By This UAT

- R049 — Test 1 proves `claude -p` invocation with zero intervention
- R050 — Test 6 proves regenerated pages have valid structure (build + link check pass)
- R052 — Tests 1 + 5 together prove the full detect → regenerate → build → link-check → commit → push → deploy cycle
- R053 — Test 5 proves "update gsd-guide" zero-intervention deploy
- R055 — Test 3 proves fast path under 15 seconds
- R054 — Test 7 proves SDK removal
- R056 — Test 4 proves graceful degradation when claude CLI is absent

## Not Proven By This UAT

- Visual quality of regenerated pages against M002 originals — requires human assessment of content quality, Mermaid diagram accuracy, and explanation clarity. Deferred as a follow-up.
- CI auto-trigger (R024/R047) — intentionally deferred; pipeline is local-only by design (D051).
- Retry logic for failed regenerations — pipeline tolerates partial failure (D053) but does not retry.

## Notes for Tester

- `claude -p` regeneration is non-deterministic. The same page may produce different output quality across runs. Focus on structural validity (frontmatter, build passing, links) rather than content byte-equality.
- Reference page regeneration is slower and more failure-prone than command pages. `reference/skills.mdx` is the most fragile — `claude -p` has been observed deleting it instead of rewriting it.
- The `npm i -g gsd-pi@latest` step adds ~12s of network latency. When timing the fast path (Test 3), measure from the extract step to the stamp step, not total wall-clock.
- Test 2 (partial failure) may pass on the first try if API latency is low. To force a timeout, temporarily reduce the subprocess timeout in `regenerate-page.mjs`.
