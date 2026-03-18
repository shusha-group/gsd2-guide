# S02: Pipeline Integration and End-to-End Proof — Research

**Date:** 2026-03-18
**Depth:** Light-to-targeted — S01 did the hard work (engine rewrite). S02 is integration wiring and end-to-end proof on known code with known patterns. The one surprise is a deleted file that needs restoring.

## Summary

S02 integrates S01's `regeneratePage()` / `regenerateStalePages()` engine into the `npm run update` pipeline and proves the end-to-end cycle works. The pipeline code (`update.mjs`) is **already wired** — S01/T03 replaced the `ANTHROPIC_API_KEY` guard with `findClaude()` and updated the result logging. No calling-code changes are needed.

The real work in S02 is: (1) restore `reference/skills.mdx` which was accidentally deleted in S01/T02 — this currently causes 65 broken links, (2) run `npm run update` to regenerate the stale pages via `claude -p` (currently 37 stale pages, including the 3 originally targeted: `commands/config.mdx`, `reference/skills.mdx`, `reference/extensions.mdx`), (3) verify build passes with 0 broken links, (4) commit and push to main, (5) verify GitHub Pages deployment, and (6) confirm the fast path (no stale pages → skip regeneration → <15s total).

The "update gsd-guide" workflow is manual-agent-driven: `npm run update` → `git add -A` → `git commit` → `git push origin main`. GitHub Actions triggers deployment on push to main. No new code needed for this — the KNOWLEDGE.md entry documents it as a pre-approved workflow.

## Recommendation

Structure as 3 tasks:

1. **Fix & verify preconditions** — Restore `reference/skills.mdx` from main, verify build passes and link check passes with 0 broken links. This unblocks everything.
2. **Run full `npm run update` with real regeneration** — Execute the pipeline, let `claude -p` regenerate stale pages, verify build + link check pass. This is the core proof (R049, R050, R052).
3. **End-to-end deploy + fast path proof** — Commit, push to main, verify GitHub Pages deployment. Then run `npm run update` again to prove the fast path (<15s, R055). Verify R053.

## Implementation Landscape

### Key Files

- `scripts/update.mjs` — Pipeline orchestrator. **Already wired** with `findClaude()` guard and `regeneratePage()` calls. No code changes needed for the pipeline itself.
- `scripts/lib/regenerate-page.mjs` — S01's output. Exports `regeneratePage()`, `regenerateStalePages()`, `findClaude()`, `parseStreamJson()`. All working. No changes expected.
- `scripts/check-page-freshness.mjs` — Exports `getStalePages()` and `stampPages()`. Used by the regenerate and stamp steps. Working as-is.
- `src/content/docs/reference/skills.mdx` — **Missing** (accidentally deleted in S01/T02 commit `224767c`). Must be restored from main. The page exists on main as a working reference card using `content/generated/skills.json`.
- `content/generated/page-source-map.json` — 43 pages mapped including `reference/skills.mdx`. Structurally valid but `reference/skills.mdx` currently has no target file.
- `page-versions.json` — Freshness tracking. 43 pages stamped. After successful regeneration, `stampPages()` updates this to mark all pages current.
- `.github/workflows/deploy.yml` — GitHub Actions workflow that builds and deploys on push to main. No changes needed.

### Build Order

1. **Restore `reference/skills.mdx`** → Rebuild → link check must show 0 broken links. This is a blocking prerequisite — the pipeline's check-links step will fail without it. Simple `git checkout main -- src/content/docs/reference/skills.mdx`.

2. **Run `npm run update` end-to-end** → This runs all 9 steps: update gsd-pi, extract, diff report, manage commands, regenerate (spawns `claude -p` per stale page), build, check-links, audit-content, stamp pages. Budget ~140s per stale page for regeneration (capture.mdx took 139.7s in S01). With 37 stale pages, this could take ~85 minutes. However, the roadmap only requires proving the 3 originally-stale pages work — the rest are stale because of upstream version bumps since page-versions.json was last stamped.

   **Alternative approach**: Stamp all pages fresh first (via `node scripts/check-page-freshness.mjs --stamp`), then manually mark only the 3 target pages stale, to limit regeneration to just those 3. This saves ~80 minutes of claude -p invocations and reduces risk. However, the stamp step at the end of the pipeline will re-stamp everything anyway.

   **Pragmatic approach**: Run the full pipeline and let it regenerate all stale pages. The pipeline is designed for this. If cost/time is a concern, stamp first and selectively un-stamp the targets.

3. **Commit + push + verify deployment** → After successful pipeline run, commit all changes and push to main. Verify GitHub Pages deployment via the Actions workflow.

4. **Fast path proof** → Run `npm run update` again immediately. All pages are freshly stamped, so `getStalePages()` should return 0 stale pages, the regenerate step should log "All N pages are current", and the pipeline should complete in under 15 seconds. Current timing: extract ~2.5s, build ~5.7s, check-links ~0.07s, audit-content ~instant, stamp ~instant. Total pipeline without regeneration: ~10-12s including `npm i -g gsd-pi@latest` overhead. Should be under 15s.

### Verification Approach

| Check | How | Requirement |
|-------|-----|-------------|
| skills.mdx restored | `ls src/content/docs/reference/skills.mdx` | Prerequisite |
| Build passes | `npm run build` exits 0, 65+ pages built | R050 |
| Link check passes | `node scripts/check-links.mjs` exits 0, 0 broken | R052 |
| Pipeline runs end-to-end | `npm run update` exits 0 with regeneration log output | R049, R052 |
| 3 stale pages regenerated | Pipeline log shows ✓ for config.mdx, skills.mdx, extensions.mdx | R052 |
| All tests pass | `node --test tests/regenerate-page.test.mjs` — 20/20 | Regression |
| Commit + push succeeds | `git push origin main` succeeds | R053 |
| GitHub Pages deploys | GitHub Actions deploy.yml workflow succeeds | R053 |
| Fast path under 15s | Second `npm run update` run with no stale pages, total <15s | R055 |
| SDK fully gone | `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` returns nothing | R054 (already validated) |
| Claude CLI absent graceful | `findClaude('/nonexistent')` returns false | R056 (already validated) |

## Constraints

- **Worktree branch**: We're on `milestone/M004`, not `main`. The actual push-to-main and GitHub Pages deployment can only be verified after merging to main. S02 tasks should prepare the worktree for merge, and the final verification (push + deploy) happens on main post-merge or by cherry-picking.
- **Regeneration time**: ~140s per page. 37 stale pages = ~85 min. If budget is tight, stamp all-but-3 first.
- **`reference/skills.mdx` must be restored before any pipeline run** — without it, build succeeds (65 pages) but check-links fails (65 broken links), which makes the pipeline exit non-zero at step 7.

## Common Pitfalls

- **Restoring skills.mdx to worktree** — Use `git checkout main -- src/content/docs/reference/skills.mdx` not `git restore`, since the file was deleted in this branch. Verify the sidebar entry in `astro.config.mjs` still references it (it does — line 88).
- **R055 "fast path under 15 seconds"** — This measures total pipeline time including `npm i -g gsd-pi@latest`. If npm is slow (network), the 15s target may fail due to npm latency, not pipeline code. The requirement should be interpreted as pipeline logic time, not wall clock including npm fetch. Consider whether `npm i -g gsd-pi@latest` is already cached and instant.
- **37 stale pages vs 3 target pages** — The roadmap says "3 currently stale pages" but the worktree now has 37 stale pages due to upstream version bumps. The requirement (R052) specifically names 3 pages: `commands/config.mdx`, `reference/skills.mdx`, `reference/extensions.mdx`. Regenerating all 37 is fine but the verification should specifically confirm these 3.

## Open Risks

- **Regeneration quality for reference pages** — S01 proved quality on `commands/capture.mdx` (a command page). `reference/skills.mdx` and `reference/extensions.mdx` are structurally different — they import JSON, use custom Astro components (`ReferenceCard`), and have different section structure. The system prompt's quality rules are tuned for command pages (6-section order). Reference pages may need different handling. If `claude -p` produces bad output for reference pages, the prompt may need tuning.
- **Regeneration of `reference/skills.mdx` from scratch** — The file doesn't exist on the branch. Either restore it first (recommended) so `claude -p` can "update" it, or rely on Claude to create it from scratch. The former is safer and consistent with the prompt instruction ("Read the current page... Update the page to reflect...").
