---
estimated_steps: 6
estimated_files: 3
---

# T02: Extend build-page-map with prompt entries, fix and extend tests, verify build

**Slice:** S02 — Page scaffold, sidebar, and source map
**Milestone:** M005

## Description

Wire prompt pages into the source-map pipeline so staleness detection works for prompt pages (S05 depends on this). Add a Section 6 to `build-page-map.mjs` that reads `prompts.json` and generates a page-source-map entry for each prompt page. Fix the pre-existing test failures (count mismatch and missing command slugs) and add new prompt page assertions. Finally, run `npm run build` to verify all 80 pages build successfully.

**Pre-existing test issue:** The test currently asserts 43 pages but `buildPageSourceMap()` produces 48 (5 command pages added after the test: `keys`, `logs`, `new-milestone`, `skip`, `undo`). The `COMMAND_SLUGS` array is also missing these 5. Fix both issues alongside adding prompt page tests.

## Steps

1. **Add Section 6 to `scripts/lib/build-page-map.mjs`** — insert after Section 5 ("Other pages"), before the "Validation summary" section. The new section reads `prompts.json` and creates one entry per prompt:
   ```js
   // ─── 6. Prompt pages (32) ─────────────────────────────────────────
   const promptsJsonPath = path.join(ROOT, "content/generated/prompts.json");
   if (fs.existsSync(promptsJsonPath)) {
     const promptsJson = JSON.parse(fs.readFileSync(promptsJsonPath, "utf-8"));
     for (const prompt of promptsJson) {
       addPage(`prompts/${prompt.slug}.mdx`, [
         `src/resources/extensions/gsd/prompts/${prompt.name}.md`,
       ]);
     }
   }
   ```
   Key points:
   - Page key format: `prompts/{slug}.mdx` (per D058)
   - Source dep: `src/resources/extensions/gsd/prompts/{name}.md` (repo-relative, matches manifest.json)
   - Guard with `fs.existsSync` so the build doesn't break if `prompts.json` doesn't exist yet (defensive)
   - Update the file's header comment to reflect the new count (e.g., "42 authored doc pages" → "80 authored doc pages" or just remove the specific count)

2. **Regenerate `page-source-map.json`** by running:
   ```bash
   node scripts/lib/build-page-map.mjs
   ```
   Expected output: `Page source map: 80 pages mapped, ...`

3. **Verify the source map** has 32 prompt entries:
   ```bash
   python3 -c "import json; d=json.load(open('content/generated/page-source-map.json')); prompt_pages=[k for k in d if k.startswith('prompts/')]; print(f'Prompt pages: {len(prompt_pages)}'); print(f'Total pages: {len(d)}')"
   ```
   Expected: `Prompt pages: 32`, `Total pages: 80`

4. **Fix and extend `tests/page-map.test.mjs`:**
   - **Fix pre-existing issues:**
     - Add 5 missing slugs to `COMMAND_SLUGS`: `"keys"`, `"logs"`, `"new-milestone"`, `"skip"`, `"undo"` (insert in alphabetical order)
     - Update the `COMMAND_SLUGS.length` sanity check from `28` to `33`
     - Update the `"includes all 28 command pages"` test name to `"includes all 33 command pages"`
   - **Update page count:**
     - Change `assert.equal(pageCount, 43, ...)` to `assert.equal(pageCount, 80, ...)` in the `"has exactly 43 page entries"` test (also update test name to `"has exactly 80 page entries"`)
   - **Add prompt page assertions** — new test block:
     ```js
     const PROMPT_SLUGS = [
       "complete-milestone", "complete-slice", "discuss", "discuss-headless",
       "doctor-heal", "execute-task", "forensics", "guided-complete-slice",
       "guided-discuss-milestone", "guided-discuss-slice", "guided-execute-task",
       "guided-plan-milestone", "guided-plan-slice", "guided-research-slice",
       "guided-resume-task", "heal-skill", "plan-milestone", "plan-slice",
       "queue", "quick-task", "reassess-roadmap", "replan-slice",
       "research-milestone", "research-slice", "review-migration",
       "rewrite-docs", "run-uat", "system", "triage-captures",
       "validate-milestone", "workflow-start", "worktree-merge",
     ];
     ```
     Add tests:
     - `"includes all 32 prompt pages"` — verify each `prompts/{slug}.mdx` key exists in map
     - `"prompt pages each have exactly 1 .md source dep"` — each prompt page should have exactly 1 dep that ends with `.md`
     - `"prompt source deps point to prompts/ directory"` — each dep starts with `src/resources/extensions/gsd/prompts/`

5. **Run the test suite:**
   ```bash
   node --test tests/page-map.test.mjs
   ```
   Expected: all tests pass, 0 failures.

6. **Run `npm run build`** to verify all pages build:
   ```bash
   npm run build 2>&1 | tail -20
   ```
   Expected: build exits 0 with 80+ pages total. Look for the page count in Astro's build output.

## Must-Haves

- [ ] `build-page-map.mjs` has a Section 6 that reads `prompts.json` and generates 32 prompt page entries
- [ ] `page-source-map.json` has 80 total entries, 32 of which are `prompts/{slug}.mdx`
- [ ] Each prompt source-map entry maps to exactly `src/resources/extensions/gsd/prompts/{name}.md`
- [ ] `COMMAND_SLUGS` in tests includes all 33 command slugs (5 added: keys, logs, new-milestone, skip, undo)
- [ ] Page count assertion updated to 80
- [ ] New prompt page test assertions added and passing
- [ ] `node --test tests/page-map.test.mjs` exits with 0 failures
- [ ] `npm run build` exits 0

## Verification

- `node --test tests/page-map.test.mjs` → 0 failures
- `python3 -c "import json; d=json.load(open('content/generated/page-source-map.json')); print(len(d))"` → 80
- `python3 -c "import json; d=json.load(open('content/generated/page-source-map.json')); print(len([k for k in d if k.startswith('prompts/')]))"` → 32
- `npm run build` exits 0

## Observability Impact

**What signals change:**
- `node scripts/lib/build-page-map.mjs` stdout now reports `80 pages mapped` (up from 48); this is the primary health signal for the source-map generator.
- `content/generated/page-source-map.json` gains 32 new `prompts/*.mdx` keys — inspectable with `python3 -c "import json; d=json.load(open('content/generated/page-source-map.json')); print(len(d))"`.
- `node --test tests/page-map.test.mjs` now runs 11 test assertions (up from 8); all must pass with 0 failures.

**How a future agent inspects this task:**
- Run `python3 -c "import json; d=json.load(open('content/generated/page-source-map.json')); print(len([k for k in d if k.startswith('prompts/')]))"` → should return `32`.
- Run `node --test tests/page-map.test.mjs` → should pass with 0 failures and show `"includes all 32 prompt pages"` in the output.
- Run `node scripts/lib/build-page-map.mjs` → stdout should say `80 pages mapped`.

**Failure state visibility:**
- If `prompts.json` is missing or malformed, the `fs.existsSync` guard silently skips Section 6, resulting in 48 mapped pages instead of 80 — the test will catch this via the `"has exactly 80 page entries"` assertion.
- If a prompt source dep (`src/resources/extensions/gsd/prompts/{name}.md`) is absent from manifest.json, `build-page-map.mjs` emits a `WARNING: Missing source path...` line and exits 1 — surfaced immediately via the `"generates without warnings"` test.
- Build count regression: if prompt MDX pages are present but not in the map, S05's staleness detector will never mark them stale, causing silent doc drift — the test suite is the guard against this.

## Inputs

- `content/generated/prompts.json` — 32-entry JSON array with `name` and `slug` fields (produced by S01)
- `src/content/docs/prompts/*.mdx` — 32 stub MDX files (created by T01)
- `scripts/lib/build-page-map.mjs` — current version with Sections 1–5
- `tests/page-map.test.mjs` — current version with outdated count (43) and missing 5 command slugs
- `content/generated/manifest.json` — manifest of tracked source files (used by `addPage()` validation)

## Expected Output

- `scripts/lib/build-page-map.mjs` — modified with Section 6 for prompt pages
- `content/generated/page-source-map.json` — regenerated with 80 entries (48 existing + 32 new prompt entries)
- `tests/page-map.test.mjs` — fixed counts, added `PROMPT_SLUGS` array, added 3 prompt page tests
- `npm run build` succeeds with 80+ pages
