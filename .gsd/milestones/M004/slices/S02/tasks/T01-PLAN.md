---
estimated_steps: 4
estimated_files: 1
---

# T01: Restore skills.mdx and verify clean build with zero broken links

**Slice:** S02 — Pipeline Integration and End-to-End Proof
**Milestone:** M004

## Description

`reference/skills.mdx` was accidentally deleted in S01/T02 (commit `224767c`). This causes 65 broken links across the site because multiple pages link to `/reference/skills/`. The file must be restored from `main` before any pipeline run — the check-links step in `npm run update` will exit non-zero without it.

This is a quick prerequisite fix: restore the file, rebuild, verify zero broken links.

## Steps

1. Restore the file from main: `git checkout main -- src/content/docs/reference/skills.mdx`
2. Verify the file exists: `ls -la src/content/docs/reference/skills.mdx`
3. Run `npm run build` — should produce 66+ pages (was 65 without skills.mdx)
4. Run `node scripts/check-links.mjs` — must exit 0 with 0 broken links
5. Run `node --test tests/regenerate-page.test.mjs` — all 20 tests must still pass (regression gate)
6. Commit: `git add src/content/docs/reference/skills.mdx && git commit -m "fix: restore reference/skills.mdx deleted in S01/T02"`

## Must-Haves

- [ ] `src/content/docs/reference/skills.mdx` exists and matches the version on `main`
- [ ] `npm run build` produces 66+ pages
- [ ] `node scripts/check-links.mjs` shows 0 broken links
- [ ] `node --test tests/regenerate-page.test.mjs` passes 20/20

## Verification

- `ls src/content/docs/reference/skills.mdx` returns the file
- `npm run build 2>&1 | grep "page(s) built"` shows 66+
- `node scripts/check-links.mjs` exits 0
- `node --test tests/regenerate-page.test.mjs` shows 20 pass, 0 fail

## Inputs

- `main` branch has the original `src/content/docs/reference/skills.mdx` — restore it with `git checkout main --`
- The sidebar entry in `astro.config.mjs` already references skills.mdx (line 88) — no config changes needed
- The `page-source-map.json` already has an entry for `reference/skills.mdx` — no map changes needed

## Observability Impact

- **Signals changed:** Build page count increases from 65 to 66+; `check-links.mjs` broken-link count drops from 65 to 0.
- **Inspection:** `ls src/content/docs/reference/skills.mdx` confirms file presence; `npm run build 2>&1 | grep "page(s) built"` shows page count; `node scripts/check-links.mjs` reports link health.
- **Failure visibility:** If the file is missing or malformed, `npm run build` may still succeed but `check-links.mjs` will exit non-zero listing all pages that link to `/reference/skills/`.

## Expected Output

- `src/content/docs/reference/skills.mdx` — restored file, identical to the version on `main`
- Clean build with 66+ pages and 0 broken links — the prerequisite for T02's pipeline run
