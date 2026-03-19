# S02: Section 4 — The Daily Mix — UAT

**Milestone:** M006
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S02 produces a static MDX page. The observable outputs are the built HTML, link-checker exit code, and file content. No runtime server, no interactive state, no API. Artifact-driven UAT covers all verification surfaces.

## Preconditions

1. `npm run build` has been run at least once after S02 completed — `dist/` is current.
2. The built site includes 113 pages (confirm with `npm run build 2>&1 | grep "pages"`).
3. `src/content/docs/solo-guide/daily-mix.mdx` exists and is >100 lines.

## Smoke Test

Run `npm run check-links`. It should exit 0 with "12288 internal links checked — 0 broken" (or a similar count ≥12000 — count grows as guide expands). This is the primary proof that the cross-reference format risk is retired.

---

## Test Cases

### 1. File exists and has substantive content

1. Run: `wc -l src/content/docs/solo-guide/daily-mix.mdx`
2. **Expected:** ≥100 lines (actual: 129)

### 2. Build exits 0 at 113 pages

1. Run: `npm run build 2>&1 | grep "pages"`
2. **Expected:** output includes "113 page(s)" and build exits 0
3. **Note:** 113 is the stable count from S01 — no pages were added or removed in S02

### 3. Link checker passes

1. Run: `npm run check-links`
2. **Expected:** exit 0 with "0 broken" — this retires the cross-reference format risk

### 4. Command cross-references meet density requirement

1. Run: `grep -c "../../commands/" src/content/docs/solo-guide/daily-mix.mdx`
2. **Expected:** ≥4 (actual: 6 — quick, capture, steer, queue, status, next)

### 5. No build errors in solo-guide files

1. Run: `npm run build 2>&1 | grep -iE "error|warn|fail" | grep -i "solo-guide"`
2. **Expected:** no output (exit code 1 from grep means no matches — that's a pass)

### 6. No American spellings

1. Run: `grep -i "behavior\|recognize\|organize" src/content/docs/solo-guide/daily-mix.mdx`
2. **Expected:** no output (exit code 1 from grep is a pass)

### 7. Decision table is present and has ≥6 rows

1. Run: `grep -c "| " src/content/docs/solo-guide/daily-mix.mdx`
2. **Expected:** count includes the table rows (≥6 data rows plus header)
3. Alternative: `grep "| Direct commit\|| Full milestone\|/gsd quick" src/content/docs/solo-guide/daily-mix.mdx | wc -l`
4. **Expected:** ≥4 rows mentioning the three paths

### 8. All six required sections are present

1. Run:
   ```
   grep "^## " src/content/docs/solo-guide/daily-mix.mdx
   ```
2. **Expected:** output includes all six sections:
   - `## The three paths`
   - `## The decision table`
   - `## What `/gsd quick` actually does`
   - `## When quick isn't enough`
   - `## Handling interruptions`
   - `## The daily rhythm`

### 9. Sibling cross-reference to Section 8 is present

1. Run: `grep "building-rhythm" src/content/docs/solo-guide/daily-mix.mdx`
2. **Expected:** at least one match containing `../building-rhythm/`

### 10. Root-level cross-references are present (auto-mode, git-strategy)

1. Run: `grep -E "../../auto-mode/|../../git-strategy/" src/content/docs/solo-guide/daily-mix.mdx`
2. **Expected:** at least 2 matches (one for auto-mode, one for git-strategy)

---

## Edge Cases

### MDX does not contain unescaped curly-brace template expressions

1. Run: `grep -E '\{\{[a-z]' src/content/docs/solo-guide/daily-mix.mdx`
2. **Expected:** no output — any `{{variable}}` patterns in the file are inside backticks (as code), not in prose

### Page renders correctly in browser (visual check)

1. Run `npm run dev` (or `npm run preview` after a build)
2. Navigate to `/gsd2-guide/solo-guide/daily-mix/`
3. **Expected:**
   - Page title "The Daily Mix" visible in sidebar
   - Decision table renders as a 3-column table with 8 rows (not as raw Markdown)
   - All `→ gsd2-guide:` cross-reference links are clickable and navigate to existing pages
   - No `{undefined}` or JSX error text visible on the page

### Cross-references from daily-mix.mdx resolve on the built site

1. After `npm run build`, confirm these paths exist in `dist/`:
   - `dist/commands/quick/index.html`
   - `dist/commands/capture/index.html`
   - `dist/commands/steer/index.html`
   - `dist/commands/queue/index.html`
   - `dist/commands/status/index.html`
   - `dist/commands/next/index.html`
   - `dist/auto-mode/index.html`
   - `dist/git-strategy/index.html`
2. **Expected:** all 8 files exist

---

## Failure Signals

- `npm run check-links` exits non-zero → a cross-reference in `daily-mix.mdx` is broken. Check the output for the specific href and fix the link depth.
- `npm run build` exits non-zero → MDX parse error. Check `build 2>&1 | grep "solo-guide"` for the file and line number.
- `wc -l daily-mix.mdx` returns <100 → file was accidentally truncated or replaced with a stub.
- `grep -c "../../commands/"` returns <4 → command cross-references are missing or malformed.
- American spelling grep returns output → a word like "behaviour" was incorrectly written as "behavior".

---

## Requirements Proved By This UAT

- **R062** — Section 4: The Daily Mix decision framework is live with decision table (≥6 rows), `/gsd quick` walkthrough, interruption handling, daily rhythm narrative, and all cross-references validated by link checker.
- **R070** (partially) — Cross-reference format `../../commands/slug/` + `../../slug/` + `../slug/` proven valid by link checker. Pattern established for all remaining S03–S08 sections.

---

## Not Proven By This UAT

- Whether the decision table rows accurately reflect the actual `/gsd quick` behaviour as of the current gsd-pi release (requires human judgment / operational verification against a live GSD session).
- Whether `/gsd quick` flags (`--research`, `--full`) mentioned in R062's description exist in the current CLI — the section documents no-flag usage based on S01 inspection.
- Browser visual rendering (table layout, font, dark mode) — requires `npm run dev` and a visual check in a browser.
- GitHub Pages deployment — not performed in S02; that is the S08 milestone close.

---

## Notes for Tester

- The decision table deliberately has 8 rows, not the plan's minimum of 6. The extra rows (exploratory work, infrastructure/deployment) make the table more useful — this is not a defect.
- The "→ gsd2-guide:" prefix on all cross-references is intentional notation from D070. It's a visual marker, not an error.
- `../building-rhythm/` links to the S01-created stub for Section 8. It resolves correctly but the page is not yet substantive. This is expected until S08 runs.
- Australian spelling: "behaviour", "organisation", "recognise", "authorised" are correct. American spellings are the defect.
