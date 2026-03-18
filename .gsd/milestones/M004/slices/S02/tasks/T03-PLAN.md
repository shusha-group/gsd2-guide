---
estimated_steps: 6
estimated_files: 2
---

# T03: End-to-end deploy proof and fast path verification

**Slice:** S02 — Pipeline Integration and End-to-End Proof
**Milestone:** M004

## Description

Proves R053 (zero-intervention deploy) and R055 (fast path <15s). This task merges the worktree branch into `main`, pushes, verifies GitHub Pages deploys, then runs `npm run update` again to prove the fast path (no stale pages → skip regeneration → complete quickly).

**Important context:** We're on the `milestone/M004` worktree branch, not `main`. The main repo checkout is at `/Users/davidspence/dev/gsd2-guide`. The merge and push must happen from there. After merging and pushing, the fast path proof should run on `main` in the main repo checkout.

## Steps

1. **Verify preconditions** — Confirm T02 completed successfully:
   ```bash
   # All from the worktree at /Users/davidspence/dev/gsd2-guide/.gsd/worktrees/M004
   npm run build 2>&1 | grep "page(s) built"    # 66+ pages
   node scripts/check-links.mjs                   # 0 broken links
   node --test tests/regenerate-page.test.mjs     # 20/20 tests
   ```

2. **Commit all changes in the worktree** — Stage and commit any remaining regenerated content:
   ```bash
   git add -A
   git status
   git commit -m "feat(M004/S02): regenerate stale pages via claude -p, verify end-to-end pipeline"
   ```

3. **Merge worktree branch to main** — From the main repo:
   ```bash
   cd /Users/davidspence/dev/gsd2-guide
   git checkout main
   git merge milestone/M004 --no-ff -m "feat(M004): Claude Code–powered documentation regeneration"
   ```

4. **Push to main** — This triggers the GitHub Actions deploy workflow:
   ```bash
   git push origin main
   ```

5. **Verify GitHub Pages deployment** — Check the GitHub Actions workflow:
   ```bash
   # Wait a moment for the workflow to trigger, then check:
   # Use github_prs or gh CLI to check the deploy workflow status
   # The deploy.yml workflow builds and deploys on push to main
   ```
   The deployment is successful when the Actions workflow shows a green check.

6. **Fast path proof** — From the main repo on `main`, run the pipeline again:
   ```bash
   cd /Users/davidspence/dev/gsd2-guide
   time npm run update
   ```
   Expected behavior:
   - `getStalePages()` returns 0 stale pages (all were stamped in T02)
   - Regenerate step logs: "All N pages are current — no regeneration needed."
   - Pipeline completes in under 15 seconds total
   - Record the actual wall-clock time

   If the total exceeds 15s due to `npm i -g gsd-pi@latest` network latency (not pipeline logic), note it. The R055 requirement targets pipeline logic time, not network fetch time.

## Must-Haves

- [ ] All worktree changes committed
- [ ] Worktree branch merged to `main`
- [ ] `git push origin main` succeeds
- [ ] GitHub Actions deploy workflow succeeds
- [ ] Fast path `npm run update` logs "All N pages are current" and completes under 15 seconds (pipeline logic time)

## Verification

- `git log --oneline -1 origin/main` shows the merge commit
- GitHub Actions deploy.yml workflow shows green check
- Fast path `npm run update` output contains "pages are current — no regeneration needed"
- Fast path total time < 15 seconds (or pipeline-logic portion < 15s if npm fetch is slow)

## Inputs

- T02 completed: all 3 target pages regenerated, build passes, link check passes, pages stamped fresh
- Worktree branch `milestone/M004` has all changes from S01 and S02
- Main repo at `/Users/davidspence/dev/gsd2-guide` — merge target
- `.github/workflows/deploy.yml` — triggers on push to main, builds + deploys to GitHub Pages

## Expected Output

- `main` branch updated with all M004 changes (SDK removal, claude -p engine, regenerated pages)
- GitHub Pages site deployed with regenerated documentation
- Fast path timing recorded proving R055
- M004 milestone fully proven end-to-end
