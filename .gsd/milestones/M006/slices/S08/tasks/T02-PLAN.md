---
estimated_steps: 5
estimated_files: 0
---

# T02: Full milestone verification and deploy to GitHub Pages

**Slice:** S08 — Section 8 — Building a Rhythm
**Milestone:** M006

## Description

This is the milestone-closing integration task. Verify that all 9 solo-guide files have substantive content (>100 lines each), confirm the pipeline hasn't been contaminated (`page-source-map.json` unchanged), run `npm run update` for the full pipeline deployment, commit and push to main.

No files are modified in this task — it is purely verification and deployment.

## Steps

1. Verify all 9 solo-guide files have >100 lines:
   ```bash
   wc -l src/content/docs/solo-guide/*.mdx | sort -n | head -1
   ```
   The smallest file must show >100 lines.

2. Verify `page-source-map.json` is unchanged (no pipeline contamination per D068):
   ```bash
   diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json
   ```
   Expect empty output.

3. Verify Australian spelling across all solo-guide pages:
   ```bash
   grep -ri "organize\|recognize\|behavior\|color[^:]" src/content/docs/solo-guide/*.mdx
   ```
   Expect no output.

4. Run `npm run update` — this chains: npm update → extract → diff report → regenerate → manage commands/prompts → build → check-links. Expect exit 0 with 113 pages and 0 broken links. Note: this command runs the full pipeline including npm package update; solo-guide pages are safe because they're excluded from `page-source-map.json`.

5. Commit all changes and push to main. Per KNOWLEDGE.md, "update gsd-guide" is a pre-approved end-to-end workflow — push directly to main, no PR needed.

## Must-Haves

- [ ] All 9 solo-guide files have >100 lines each
- [ ] `page-source-map.json` unchanged
- [ ] Australian spelling verified across all pages
- [ ] `npm run update` exits 0
- [ ] Changes committed and pushed to main

## Verification

- `wc -l src/content/docs/solo-guide/*.mdx | sort -n | head -1` → smallest >100 lines
- `npm run update` exit code is 0
- `git push` exits 0
- `git log --oneline -1` shows the deploy commit

## Inputs

- `src/content/docs/solo-guide/building-rhythm.mdx` — T01's output: substantive content >100 lines
- All other 8 solo-guide files — already written by S01–S07 with >100 lines each
- `content/generated/page-source-map.json` — must be unchanged from HEAD

## Expected Output

- No files modified — this task is verification and deployment only
- Full pipeline run proven via `npm run update` exit 0
- Changes pushed to main triggering GitHub Actions deploy

## Observability Impact

This task produces no runtime service — all signals are static build artefacts and git history.

**What changes after this task runs:**
- `git log --oneline -1` shows the M006 deploy commit (the visible proof of successful deploy)
- GitHub Actions triggers a Pages deployment visible at the repo's Deployments tab
- `npm run build` stdout shows page count (113 pages expected) confirming no regression

**How a future agent inspects this task:**
- `git log --oneline -5` — confirm the milestone commit is present in history
- `npm run build 2>&1 | grep "pages"` — re-verify the page count hasn't regressed
- `npm run check-links` — re-run link check to confirm 0 broken links still holds
- `diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json` — confirm pipeline is still uncontaminated post-update

**Failure state visibility:**
- If `npm run update` exits non-zero, the chained command that failed will be the last non-empty stderr line — look for `Error:` or a non-zero exit in the npm script output
- If GitHub Actions fails, the Pages deploy will not appear in the Deployments tab; check the Actions log for the failing step
- If `page-source-map.json` has a diff, the extraction pipeline was accidentally triggered — revert using `git checkout HEAD -- content/generated/page-source-map.json`
