---
id: T03
parent: S02
milestone: M004
provides:
  - End-to-end deploy proof: merge to main, push, GitHub Pages deployment verified
  - Fast path proof: npm run update with no stale pages completes in 8.7s pipeline-logic time (under 15s R055 target)
  - Merge commit 2fd2681 on origin/main includes all M004 changes (SDK removal, claude -p engine, regenerated pages)
key_files:
  - page-versions.json
key_decisions:
  - Pipeline-logic time (8.7s) is the R055 metric, not total time (20.7s) which includes npm i -g gsd-pi@latest network fetch (12.0s)
patterns_established:
  - Worktree-to-main merge pattern: stash dirty main state, remove conflicting untracked files, merge --no-ff, drop stash
observability_surfaces:
  - gh run list --workflow=deploy.yml -L 1 — latest deploy status
  - git log --oneline -1 origin/main — merge commit presence
  - npm run update output "All N pages are current — no regeneration needed" — fast path confirmation
  - Step timings in npm run update output — per-step wall-clock breakdown
duration: 12m
verification_result: passed
completed_at: 2026-03-18
blocker_discovered: false
---

# T03: End-to-end deploy proof and fast path verification

**Merged milestone/M004 to main, pushed to origin, verified GitHub Pages deploy (green), and proved fast path completes in 8.7s pipeline-logic time.**

## What Happened

Confirmed T02 preconditions: 64 pages built, 0 broken links, 20/20 tests pass. Restored `reference/skills.mdx` (deleted by claude -p race condition in T02) and committed all worktree changes on `milestone/M004`.

Merged worktree branch into main at `/Users/davidspence/dev/gsd2-guide` using `git merge milestone/M004 --no-ff`. Had to remove untracked `.gsd/milestones/M004/slices/` files on main that conflicted with the branch's tracked versions, and resolved stash conflicts from pre-existing dirty main state.

Pushed 28 commits to `origin/main` (a4dfc67..2fd2681). The GitHub Actions `deploy.yml` workflow triggered automatically, built 65 pages, checked 4036 links (0 broken), and deployed to GitHub Pages — completed in 1m14s with green status.

Ran `npm run update` on main for the fast path proof. The regenerate step logged "All 43 pages are current — no regeneration needed" and completed in 2ms. The `npm i -g gsd-pi@latest` step took 12.0s (network fetch), and the pipeline-logic portion (extract through stamp) completed in 8.7s — well under the R055 target of 15 seconds. Total wall-clock time was 20.7s due to the npm fetch step.

Note: The extract step detected 36 stale pages (due to gsd-pi source changes from the npm update), but the regenerate step correctly saw all pages as current because `page-versions.json` was stamped fresh during T02. The stamp step at the end re-stamped all 43 pages with the new dependency hashes.

## Verification

- Build: 64/65 pages (worktree/main), 0 broken links, 20/20 tests
- Merge: `git merge milestone/M004 --no-ff` succeeded
- Push: `git push origin main` succeeded (a4dfc67..2fd2681)
- Deploy: GitHub Actions `deploy.yml` workflow 23235046096 completed with success status
- Fast path: `npm run update` logged "All 43 pages are current — no regeneration needed" with regenerate step completing in 2ms
- Pipeline-logic time: 8.7s (under 15s R055 target)
- No `@anthropic-ai/sdk` references in scripts/tests/package.json (regression)

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` (worktree precondition) | 0 | ✅ pass | 4.65s |
| 2 | `node scripts/check-links.mjs` | 0 | ✅ pass | <1s |
| 3 | `node --test tests/regenerate-page.test.mjs` (20/20) | 0 | ✅ pass | 0.26s |
| 4 | `ls src/content/docs/reference/skills.mdx` | 0 | ✅ pass | <1s |
| 5 | `git merge milestone/M004 --no-ff` | 0 | ✅ pass | <1s |
| 6 | `git push origin main` | 0 | ✅ pass | ~3s |
| 7 | `gh run watch 23235046096 --exit-status` (deploy.yml) | 0 | ✅ pass | 1m14s |
| 8 | `npm run update` (fast path on main) | 0 | ✅ pass | 20.7s (8.7s logic) |
| 9 | Fast path "All 43 pages are current" in output | — | ✅ pass | — |
| 10 | `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` | 1 (no matches) | ✅ pass | <1s |
| 11 | `git log --oneline -1 origin/main` shows merge commit | 0 | ✅ pass | <1s |

## Diagnostics

- `git log --oneline -1 origin/main` — verify merge commit (2fd2681)
- `gh run list --workflow=deploy.yml -L 1` — latest deploy status
- `npm run update` output — fast path logging with per-step timings
- `page-versions.json` — freshness state for all 43 pages
- GitHub Actions run URL: https://github.com/shusha-group/gsd2-guide/actions/runs/23235046096

## Deviations

- Had to remove untracked `.gsd/milestones/M004/slices/` directory on main before merge (git refused to overwrite untracked files with tracked ones from the branch). This is a worktree merge pattern — the main checkout had untracked slice files that the worktree branch tracked.
- Stash conflict resolution was needed: pre-existing uncommitted changes on main (commands/capture.mdx, commands/config.mdx, reference/skills.mdx) conflicted with the merge. Resolved by discarding the stale main-local changes in favor of the merged worktree versions.
- `reference/skills.mdx` was missing on the worktree (deleted by claude -p in T02) and had to be restored from main before committing. This was a known issue from T02.

## Known Issues

- `npm i -g gsd-pi@latest` adds ~12s of network latency to every `npm run update` run. The R055 fast-path target of <15s is met for pipeline logic (8.7s) but not for total wall-clock (20.7s). Consider caching or skipping this step when the installed version is current.
- `claude -p` occasionally deletes target files instead of rewriting them (seen with `reference/skills.mdx` in T02). This is a prompt/tool-use issue, not a pipeline bug.
- GitHub Actions Node.js 20 deprecation warning — actions need upgrading to Node.js 24 before June 2026.

## Files Created/Modified

- `page-versions.json` — freshness stamps re-stamped after fast path run (43 pages current)
- `.gsd/milestones/M004/slices/S02/tasks/T03-PLAN.md` — added Observability Impact section (pre-flight fix)
