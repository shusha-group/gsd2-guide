# S01: Guide Structure & Navigation — UAT

**Milestone:** M006
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 is entirely structural — files, sidebar config, build output. All success signals are machine-verifiable (page count, file count, diff output, grep). No runtime server or human-experience judgment needed for these checks.

## Preconditions

- Working directory: `/Users/davidspence/dev/gsd2-guide`
- Node.js and npm available
- `git` available with the repository's HEAD commit accessible (needed for the diff check)
- No uncommitted changes to `page-source-map.json` (it should match HEAD)

## Smoke Test

Run `npm run build 2>&1 | grep "pages"` — output must contain `113 page(s) built`. If you see 113, the entire S01 delivery is functioning: all 9 MDX files exist, Starlight found them, frontmatter parsed correctly, and the sidebar group registered without error.

## Test Cases

### 1. File count — 9 MDX files in solo-guide directory

1. Run: `ls /Users/davidspence/dev/gsd2-guide/src/content/docs/solo-guide/*.mdx`
2. Run: `ls /Users/davidspence/dev/gsd2-guide/src/content/docs/solo-guide/*.mdx | wc -l`
3. **Expected:** Exactly 9 files listed: `brownfield.mdx`, `building-rhythm.mdx`, `context-engineering.mdx`, `controlling-costs.mdx`, `daily-mix.mdx`, `first-project.mdx`, `index.mdx`, `when-things-go-wrong.mdx`, `why-gsd.mdx`. Line count returns `9`.

### 2. Build passes at 113 pages

1. Run: `cd /Users/davidspence/dev/gsd2-guide && npm run build 2>&1 | tail -10`
2. **Expected:** Output includes `113 page(s) built in` and `[build] Complete!`. Exit code is 0.

### 3. No MDX parse errors scoped to solo-guide pages

1. Run: `cd /Users/davidspence/dev/gsd2-guide && npm run build 2>&1 | grep -i "error\|warn" | grep -i "solo-guide"`
2. **Expected:** No output. Exit code is 1 (grep found nothing). Any output here indicates a frontmatter or JSX parse error in one of the solo-guide MDX files.

### 4. Sidebar group registered correctly

1. Run: `grep -c "Solo Builder" /Users/davidspence/dev/gsd2-guide/astro.config.mjs`
2. **Expected:** Output is `1`.
3. Run: `grep -A 12 "Solo Builder" /Users/davidspence/dev/gsd2-guide/astro.config.mjs`
4. **Expected:** Shows the full group with 9 item entries: Overview, 1. Why GSD 2, 2. Your First Project, 3. Brownfield Reality, 4. The Daily Mix, 5. Context Engineering, 6. Controlling Costs, 7. When Things Go Wrong, 8. Building a Rhythm. All link values use `/solo-guide/slug/` format with no `/gsd2-guide/` prefix.

### 5. Pipeline uncontaminated — page-source-map.json unchanged

1. Run: `diff <(git show HEAD:content/generated/page-source-map.json) /Users/davidspence/dev/gsd2-guide/content/generated/page-source-map.json`
2. **Expected:** No output. Exit code is 0 (files identical). Any diff output means solo-guide pages were injected into the regeneration pipeline — investigate immediately.

### 6. Pipeline uncontaminated — solo-guide absent from generated manifest

1. Run: `grep "solo-guide" /Users/davidspence/dev/gsd2-guide/src/content/docs/.generated-manifest.json`
2. **Expected:** No output. Exit code is 1 (grep found nothing). Any match here means a solo-guide page was added to the generated-file manifest and will be overwritten on next build.

### 7. Index page has LinkCard navigation

1. Run: `cat /Users/davidspence/dev/gsd2-guide/src/content/docs/solo-guide/index.mdx`
2. **Expected:** File imports `CardGrid` and `LinkCard` from `@astrojs/starlight/components`. Contains `<CardGrid>` block with 8 `<LinkCard>` components, each with a `title`, `href` (using `../slug/` format), and `description`. Title is "Solo Builder's Guide".

### 8. Each stub has valid frontmatter and body text

1. For each of the 8 section stubs, run: `head -10 /Users/davidspence/dev/gsd2-guide/src/content/docs/solo-guide/why-gsd.mdx` (repeat for each slug)
2. **Expected for each file:** Opens with `---` frontmatter block containing at minimum `title:` and `description:`. Followed by at least one paragraph of body text (not just the frontmatter). Australian spelling must appear in stubs that have placeholder text (`behaviour` in brownfield.mdx, `recognise` in context-engineering.mdx, `organisation` in building-rhythm.mdx).

## Edge Cases

### MDX curly-brace injection check

If any stub was authored with `{{variable}}` syntax in body text (e.g. quoting GSD template variables), the build would fail with a JSX ReferenceError.

1. Run `npm run build 2>&1 | grep "ReferenceError"` after the full build.
2. **Expected:** No output. If output appears, locate the file and line via the stack trace, then wrap the offending `{{...}}` in backticks.

### Sidebar item missing from browser navigation

If the build passes at 113 but a sidebar entry doesn't appear in the rendered site:

1. Check `astro.config.mjs` — confirm the specific `{ label: ..., link: ... }` entry exists.
2. Confirm the corresponding `.mdx` file exists in `src/content/docs/solo-guide/` with the matching slug.
3. Confirm the frontmatter `title` field is present (missing title causes Starlight to silently drop the page from the sidebar).

### Build page count wrong (not 113)

- Count is **less than 113** (e.g. 104): One or more solo-guide MDX files are missing or have invalid frontmatter. Run `ls src/content/docs/solo-guide/*.mdx | wc -l` to check file count. Run `npm run build 2>&1 | grep -A5 "solo-guide"` to find parse errors.
- Count is **more than 113** (e.g. 114+): An unexpected file was added to a content directory. Run `ls src/content/docs/**/*.mdx | wc -l` to locate the extra file.

## Failure Signals

- `npm run build` exits non-zero → MDX parse error or missing frontmatter in a solo-guide file
- `npm run build` exits 0 but reports fewer than 113 pages → a solo-guide file has invalid frontmatter or wasn't discovered
- `grep "ReferenceError"` in build output → a stub contains unescaped `{{...}}` template variable syntax (MDX treats it as JSX)
- `diff` on page-source-map.json shows any output → pipeline contamination; solo-guide pages should never appear in this file
- `grep "solo-guide" .generated-manifest.json` returns output → a solo-guide page was registered in the generated-file manifest and will be overwritten on next build

## Requirements Proved By This UAT

- R061 — "Solo Builder's Guide" sidebar group exists with index/landing page and links to all 8 sections. Navigation works end-to-end; all 9 pages build and are reachable from the sidebar. Tests 1–4 and 7–8 collectively prove this.

## Not Proven By This UAT

- R062–R069 — Substantive section content is not yet written (stubs only). These requirements are proved by S02–S08.
- R070 — Cross-references to gsd2-guide pages not yet present; first validated in S02 via `npm run check-links`.
- R071 — External citations (Addy Osmani, Esteban Torres, New Stack) not yet present; validated in S04.
- R072 — Australian spelling is present in stubs but full coverage only provable once all sections are written.
- Live site deployment — `npm run update` → GitHub Actions → GitHub Pages end-to-end proof is reserved for S08 (final integration slice).
- Browser navigation UX — visual confirmation that the sidebar renders correctly in a browser is not covered by these artifact-driven checks. Human verification can be done by running `npm run dev` and navigating to `http://localhost:4321/gsd2-guide/solo-guide/`.

## Notes for Tester

- The 113 page count is the single most reliable signal. If it's right, everything else is almost certainly fine.
- The `diff` on `page-source-map.json` requires `git` to be available and the HEAD commit to be accessible. If the repo has no commits yet, skip Test 5 and instead just confirm the file doesn't mention "solo-guide" directly.
- The `.generated-manifest.json` file lives at `src/content/docs/.generated-manifest.json` — note the dot prefix. Don't confuse it with `content/generated/` (which is the extracted content directory, not a manifest of generated Starlight pages).
- All 8 stubs are intentionally minimal — a single placeholder paragraph each. This is by design. Don't be alarmed by thin content.
