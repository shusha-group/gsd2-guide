# S02: Changelog Improvements — UAT

**Milestone:** M007
**Written:** 2026-04-02T01:12:29.143Z

## Preconditions

- `npm run build` has completed successfully (143 pages, 0 errors)
- `dist/` is present and up to date
- `content/generated/changelog-highlights.json` exists with at least 18 entries

## Test Cases

### TC1 — GitHub links in full changelog

1. Open `dist/changelog/index.html` in a browser or inspect with grep
2. Find any release entry that referenced a PR or issue (e.g., "fixes #412")
3. **Expected:** The #NNN text is wrapped in an anchor tag linking to `https://github.com/gsd-build/gsd-2/issues/NNN` with `target="_blank"` and `rel="noopener noreferrer"`
4. **Evidence check:** `grep -o 'github.com/gsd-build/gsd-2/issues/' dist/changelog/index.html | wc -l` returns 768

### TC2 — No double-linking

1. Inspect the changelog HTML for existing anchor tags that contain #NNN text
2. **Expected:** No anchor tag has its href text re-wrapped in another anchor (i.e., no `href="...#NNN..."` is double-linked)
3. The negative lookbehind in the regex prevents this

### TC3 — Highlights page exists and loads

1. Open `dist/changelog-highlights/index.html`
2. **Expected:** Page title contains "Changelog Highlights"; at least 18 release cards are present; each card shows a version string, a date, and a summary sentence

### TC4 — Highlights sidebar entry

1. Open any page in `dist/` that renders the full sidebar
2. **Expected:** Sidebar contains a "Changelog Highlights" link above the "Changelog" link

### TC5 — Generator is idempotent

1. Run `node scripts/generate-highlights.mjs` twice
2. **Expected:** `content/generated/changelog-highlights.json` is identical on both runs; no error output; exit code 0 both times

### TC6 — Generator runs in update pipeline

1. Inspect `scripts/update.mjs` for the generate-highlights step
2. **Expected:** A step calling generate-highlights.mjs appears after the extract step; running `npm run update` (dry-run or live) does not error on this step

### Edge cases

- Releases with no structured arrays (added/changed/fixed all empty): should not appear in changelog-highlights.json
- A #NNN that appears inside an existing href URL (e.g., `href="...issues/123"`): should NOT be linkified (lookbehind blocks it)

