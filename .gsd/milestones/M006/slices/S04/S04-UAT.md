# S04: Section 2 — Your First Project — UAT

**Milestone:** M006
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S04 produces a single static MDX file. All acceptance criteria are verifiable against the built artefact — line count, cross-reference count, citation count, build success, and link validity. No runtime server state, database, or user session is involved.

## Preconditions

1. `npm run build` must have been run at least once after the file was written (dist/ must be current)
2. The solo-guide sidebar must be registered in `astro.config.mjs` (delivered by S01 — confirm `first-project` entry is present)
3. Node.js LTS installed; `gsd-pi` globally installed is NOT required for this UAT (content is static)

## Smoke Test

Run: `wc -l src/content/docs/solo-guide/first-project.mdx`

Expected: a number greater than 100. If this returns ≤6, the stub is still in place and nothing else will pass. Stop here and investigate.

---

## Test Cases

### 1. Build succeeds at the correct page count

1. Run: `npm run build 2>&1 | grep "pages"`
2. **Expected:** `113 page(s) built` — no increase or decrease from 113 (the stub was already a compiled page; replacing it with content does not change the count)
3. If the count is lower, a file was deleted or has bad frontmatter. If higher, an unexpected file was added.

### 2. No MDX parse errors

1. Run: `npm run build 2>&1 | grep -i "error"`
2. **Expected:** no output (exit 0, empty grep result)
3. A curly-brace syntax error from `first-project.mdx` would surface here with the file path and line number. Any output means an MDX parse failure.

### 3. Internal link integrity — check-links passes

1. Run: `npm run check-links`
2. **Expected:** `✅ 12288 internal links checked — 0 broken` (or equivalent count ≥12288 — count may increase as other sections are completed)
3. Exit code must be 0. Any non-zero exit means a broken cross-reference. Run with verbose output to identify the specific broken link and its source file.

### 4. Cross-reference count ≥5

1. Run: `grep -c "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx`
2. **Expected:** 9 (or ≥5 as the minimum threshold)
3. A count below 5 means cross-references were removed without replacement. Inspect the file directly to confirm the `→ gsd2-guide:` notation is present in the correct sections.

### 5. External citations present

1. Run: `grep -c "addyosmani.com\|estebantorr.es" src/content/docs/solo-guide/first-project.mdx`
2. **Expected:** 2
3. A count below 2 means one or both citations were removed. Grep the file without `-c` to find which citation is missing.

### 6. Five lifecycle phases present

1. Run: `grep "## Phase\|## Before\|## What you" src/content/docs/solo-guide/first-project.mdx`
2. **Expected:** Six headings — `## Before you start`, `## Phase 1: The discussion`, `## Phase 2: Reading the roadmap`, `## Phase 3: Auto mode`, `## Phase 4: Verification and completion`, `## What you've built`
3. Missing any phase heading means structural content was lost.

### 7. Forward links to daily-mix and when-things-go-wrong present

1. Run: `grep "daily-mix\|when-things-go-wrong" src/content/docs/solo-guide/first-project.mdx`
2. **Expected:** at least one match for each path
3. These are the two forward-links in the closing section. If absent, the section does not connect to the rest of the solo-guide correctly.

### 8. Australian spelling check (spot check)

1. Run: `grep -n "behavior\|recognize\|organization\|color\b" src/content/docs/solo-guide/first-project.mdx`
2. **Expected:** no output (exit 1 from grep means no matches — this is the passing state)
3. Any match means American spelling crept in. Check the surrounding context — `colour`, `behaviour`, `recognise`, `organisation` are the correct Australian spellings.

### 9. Section renders in browser at expected URL

1. Run `npm run dev` (or use the already-built `dist/` files)
2. Navigate to `/solo-guide/first-project/`
3. **Expected:** Page renders with title "Your First Project", five visible phase sections with `---` horizontal rules between them, and a visible "What you've built (and what you haven't)" closing section
4. Confirm the sidebar shows "Solo Builder's Guide" group with "Your First Project" listed and active

---

## Edge Cases

### MDX curly-brace collision

If any future edit to `first-project.mdx` introduces template variable syntax (e.g. `{{milestoneId}}`), the build will fail with `ReferenceError: milestoneId is not defined`.

1. Introduce `{{milestoneId}}` into the file in plain prose
2. Run `npm run build`
3. **Expected:** build fails with `ReferenceError`
4. **Fix:** wrap the literal in backticks: `` `{milestoneId}` ``

This is documented in KNOWLEDGE.md (MDX curly-brace escaping) and in D061.

### Stub regression check

If a prebuild script incorrectly regenerates `first-project.mdx` from a stale source map entry:

1. Run `wc -l src/content/docs/solo-guide/first-project.mdx` after any `npm run update` or `npm run build`
2. **Expected:** 148 (never ≤6)
3. `first-project.mdx` is NOT in `page-source-map.json` (D068 — solo-guide pages excluded from pipeline). If it appears there, remove it immediately.

---

## Failure Signals

- `wc -l first-project.mdx` returns ≤6 → stub still in place; T01 did not execute
- `npm run build` exits non-zero → MDX parse error; grep build output for `[ERROR]` or `ReferenceError`
- `npm run check-links` exits non-zero → broken cross-reference; check-links output names the file and broken URL
- `grep -c "→ gsd2-guide"` returns <5 → cross-references were removed; inspect file manually
- `grep -c "addyosmani.com\|estebantorr.es"` returns <2 → citations missing; grep without `-c` to find which one
- Page count drops below 113 after build → a file in `src/content/docs/` was deleted

---

## Requirements Proved By This UAT

- R062 (solo-guide sections published) — Section 2 content is live, not a stub, and the build passes with it present

## Not Proven By This UAT

- Full milestone completion of R062 — all 8 sections must be present; this UAT only validates Section 2
- Operational verification (GitHub Pages deployment) — deferred to S08 end-to-end deploy
- Human-quality UAT (does the prose actually teach a new GSD user what to do?) — this requires a human reader and is deferred to the S08 milestone close

---

## Notes for Tester

- The page count of 113 includes the stub-replacement: the stub was already compiled as a page, so replacing its content doesn't change the count. If you see 114+ pages, an extra file was added somewhere outside the solo-guide directory.
- The Australian spelling check uses word-boundary `\b` on `color` to avoid false positives from class names like `backgroundColor`. Run the grep manually and read the context if you get an unexpected match.
- External URLs (addyosmani.com, estebantorr.es) are NOT checked by `npm run check-links`. They were verified to resolve during authoring but should be spot-checked manually if this UAT is run much later.
- The `---` separator lines in the MDX file are standard horizontal rules. They render as `<hr>` in the browser and give each phase visual separation. They are not page breaks and do not affect the sidebar or navigation.
