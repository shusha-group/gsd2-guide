# S02: Page scaffold, sidebar, and source map

**Goal:** 32 stub MDX pages exist in `src/content/docs/prompts/`, the Astro sidebar has a "Prompts" section with 4 sub-groups, and `page-source-map.json` has 32 new prompt entries — all verifiable by `npm run build` succeeding and tests passing.
**Demo:** `npm run build` produces 80+ pages including 32 new prompt stubs. Sidebar shows "Prompts" with 4 nested groups. `page-source-map.json` has 32 `prompts/` entries.

## Must-Haves

- 32 stub MDX files in `src/content/docs/prompts/` — one per prompt from `prompts.json`, with valid frontmatter and scaffold notice
- `astro.config.mjs` sidebar has a "Prompts" section with 4 sub-groups: Auto-mode Pipeline (10), Guided Variants (8), Commands (13), Foundation (1)
- `page-source-map.json` has 32 new `prompts/{slug}.mdx` entries mapping to `src/resources/extensions/gsd/prompts/{name}.md`
- `build-page-map.mjs` extended with a Section 6 that reads `prompts.json` and generates prompt page entries
- `npm run build` exits 0 with all 32 new pages
- `tests/page-map.test.mjs` passes with updated counts and prompt page assertions

## Verification

- `ls src/content/docs/prompts/*.mdx | wc -l` → 32
- `node --test tests/page-map.test.mjs` → all tests pass (0 failures)
- `python3 -c "import json; d=json.load(open('content/generated/page-source-map.json')); print(len([k for k in d if k.startswith('prompts/')]))"` → 32
- `npm run build` exits 0 (80+ pages, 0 errors)

## Observability / Diagnostics

- **Runtime signals:** `npm run build` stdout shows page count (look for "80+ pages built" in Astro output). Build failures surface as non-zero exit with Astro diagnostics naming the offending MDX file.
- **Inspection surfaces:** `ls src/content/docs/prompts/*.mdx | wc -l` confirms file count; `grep -c "'/prompts/" astro.config.mjs` confirms sidebar entry count; `python3 -c "import json; d=json.load(open('content/generated/page-source-map.json')); print(len([k for k in d if k.startswith('prompts/')]))"` confirms source-map entries.
- **Failure visibility:** Missing MDX files produce Astro build errors naming the absent slug. Sidebar mis-wiring is invisible at build time but manifests as 404s when navigating sidebar links in the dev server. Test suite failures from `node --test tests/page-map.test.mjs` show which assertion failed and expected vs actual counts.
- **Redaction constraints:** No secrets or sensitive data in this slice — all content is static MDX stubs and config wiring.

## Integration Closure

- Upstream surfaces consumed: `content/generated/prompts.json` (slug list, group taxonomy from S01)
- New wiring introduced in this slice: `build-page-map.mjs` Section 6 reads `prompts.json` → generates page-source-map entries; sidebar config wired in `astro.config.mjs`
- What remains before the milestone is truly usable end-to-end: S03 (real page content), S04 (command backlinks), S05 (pipeline integration for `npm run update`)

## Tasks

- [x] **T01: Create 32 prompt stub MDX pages and wire sidebar config** `est:20m`
  - Why: The MDX stubs and sidebar are the two user-visible deliverables — pages must exist and be navigable before any pipeline integration.
  - Files: `src/content/docs/prompts/*.mdx` (32 new files), `astro.config.mjs`
  - Do: Read `prompts.json` for slugs and groups. Create `src/content/docs/prompts/` directory. Write 32 stub MDX files following the established scaffold pattern (frontmatter with title and description, `:::caution` scaffold notice). Add a "Prompts" sidebar section to `astro.config.mjs` between Commands and Recipes with 4 nested sub-groups ordered: Auto-mode Pipeline → Guided Variants → Commands → Foundation.
  - Verify: `ls src/content/docs/prompts/*.mdx | wc -l` → 32; sidebar in `astro.config.mjs` has 4 sub-groups with 32 total entries
  - Done when: 32 MDX files exist with valid frontmatter and the sidebar has all 4 sub-groups with correct slugs

- [x] **T02: Extend build-page-map with prompt entries, fix and extend tests, verify build** `est:25m`
  - Why: Prompt pages need source-map entries for the staleness detection pipeline (S05 depends on this). The test suite needs fixing (pre-existing count mismatch: 43→48) and extending for prompt pages.
  - Files: `scripts/lib/build-page-map.mjs`, `content/generated/page-source-map.json`, `tests/page-map.test.mjs`
  - Do: Add Section 6 to `build-page-map.mjs` that reads `prompts.json` and calls `addPage()` for each prompt. Regenerate `page-source-map.json`. Fix `COMMAND_SLUGS` (add 5 missing: keys, logs, new-milestone, skip, undo), update page count assertion from 43 to 80, and add prompt page test assertions. Run `npm run build` to verify everything works.
  - Verify: `node --test tests/page-map.test.mjs` → 0 failures; `npm run build` exits 0; `page-source-map.json` has 80 entries including 32 `prompts/` entries
  - Done when: Tests pass, build succeeds with 80+ pages, `page-source-map.json` has 32 prompt entries

## Files Likely Touched

- `src/content/docs/prompts/*.mdx` (32 new stub files)
- `astro.config.mjs` (sidebar config — add Prompts section)
- `scripts/lib/build-page-map.mjs` (add Section 6 for prompt pages)
- `content/generated/page-source-map.json` (regenerated — grows from 48 to 80 entries)
- `tests/page-map.test.mjs` (fix counts, add prompt assertions)
