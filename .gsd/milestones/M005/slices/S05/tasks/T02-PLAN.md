---
estimated_steps: 7
estimated_files: 4
---

# T02: Wire prompt pipeline step, prompt-aware regeneration, and stamp pages

**Slice:** S05 — Pipeline integration
**Milestone:** M005

## Description

Wire the T01 prompt management functions into the `npm run update` pipeline, make the regeneration system prompt page-type-aware so prompt pages get correct section structure, stamp all 32 prompt pages in `page-versions.json`, and verify the full pipeline end-to-end.

This task closes the integration loop: after T01 added the building blocks, T02 wires them into the orchestrator (`update.mjs`), adapts the regeneration engine (`regenerate-page.mjs`), and proves the pipeline works end-to-end.

## Steps

1. **Add `runManagePrompts()` to `update.mjs`.** Import `detectNewAndRemovedPrompts`, `createNewPromptPages`, `removePromptPages` from `manage-pages.mjs`. Write `runManagePrompts()` following the exact pattern of `runManageCommands()`:
   - Call `detectNewAndRemovedPrompts()`
   - Log counts: `New prompts: N`, `Removed prompts: N`
   - If new prompts found: call `createNewPromptPages(newPrompts)` and log results
   - If removed prompts found: call `removePromptPages(removedPrompts)` and log results
   - If neither: log `✓ All prompts in sync — no changes needed.`
   - Export `runManagePrompts` for test access

2. **Insert "manage prompts" step into the pipeline.** Add `{ name: 'manage prompts', fn: runManagePrompts }` to the `steps` array immediately after the "manage commands" step (index 3 → insert at index 4). The resulting 10-step order: update gsd-pi → extract → diff report → manage commands → manage prompts → regenerate → build → check-links → audit content → stamp pages.

3. **Add `buildPromptSystemPrompt()` to `regenerate-page.mjs`.** Create a new function that builds a system prompt specific to prompt pages. The system prompt should specify:
   - The 4-section structure: What It Does → Pipeline Position (Mermaid) → Variables (table) → Used By (links)
   - Mermaid diagram styling rules: `flowchart TD`, decision nodes with `fill:#0d180d,stroke:#39ff14,color:#39ff14`, action nodes with `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`
   - Variable table format: `| Variable | Description | Required |`
   - Link format: `../../commands/{slug}/` for command links
   - MDX escaping: `{{variable}}` must be wrapped in backticks (D061) to avoid JSX parse errors
   - Frontmatter format: `title: "{prompt-name}"`, `description: "one-line description"`
   - Include the exemplar: read `src/content/docs/prompts/execute-task.mdx` as the prompt page exemplar (the most complete prompt page)

4. **Make `regeneratePage()` page-type-aware.** In `regeneratePage()`, after the `findClaude()` check, add a conditional:
   - If `pagePath.startsWith('prompts/')`: use `buildPromptSystemPrompt()` and read `prompts/execute-task.mdx` as exemplar
   - Otherwise: use existing `buildSystemPrompt()` and read `commands/capture.mdx` as exemplar
   - This keeps the existing command page regeneration path untouched

5. **Update `tests/update-pipeline.test.mjs`.** Change the step count test:
   - Update `'has 9 steps in the correct order'` → `'has 10 steps in the correct order'`
   - Add `'manage prompts'` after `'manage commands'` in the expected step names array
   - Add a test: `'manage prompts step uses fn (not cmd)'`
   - Update shell steps count assertion if needed (still 5 — manage prompts uses `fn`)

6. **Stamp prompt pages in `page-versions.json`.** Run `node scripts/check-page-freshness.mjs --stamp` to stamp all 80 pages (including the 32 prompt pages). Verify with: `python3 -c "import json; d=json.load(open('page-versions.json')); print(len([k for k in d if k.startswith('prompts/')]))"` → 32.

7. **E2E verification.** Run the full verification battery:
   - `node --test tests/update-pipeline.test.mjs` — 10-step pipeline test passes
   - `node --test tests/manage-pages.test.mjs` — all tests still pass
   - `npm run build` — exits 0
   - `node scripts/check-page-freshness.mjs` — exits 0 (all pages fresh)
   - Simulate stale detection: use `python3` to modify one prompt page stamp in `page-versions.json` (change a SHA to `"aaaa"`), run `node scripts/check-page-freshness.mjs`, confirm it reports that prompt page as stale, then restore the original stamp with `--stamp`

## Must-Haves

- [ ] `update.mjs` `steps` array has 10 entries with "manage prompts" at index 4
- [ ] `runManagePrompts()` is exported from `update.mjs`
- [ ] `regenerate-page.mjs` uses prompt-specific system prompt for `prompts/` pages
- [ ] `page-versions.json` contains 32 `prompts/` entries
- [ ] `tests/update-pipeline.test.mjs` passes with 10-step assertion
- [ ] `npm run build` exits 0
- [ ] Stale detection works: modifying a prompt page stamp triggers stale flag

## Verification

- `node --test tests/update-pipeline.test.mjs` — passes
- `node --test tests/manage-pages.test.mjs` — passes (confirms T01 work not broken)
- `npm run build` — exits 0
- `node scripts/check-page-freshness.mjs` — exits 0 (all fresh after stamping)
- Stale simulation: tamper with one stamp → freshness check reports it stale → re-stamp → clean

## Inputs

- `scripts/lib/manage-pages.mjs` — T01 output with 5 new prompt functions exported
- `scripts/update.mjs` — existing 215-line pipeline orchestrator with 9 steps
- `scripts/lib/regenerate-page.mjs` — existing 338-line regeneration module with `buildSystemPrompt()` and `regeneratePage()`
- `tests/update-pipeline.test.mjs` — existing pipeline structure tests (9-step assertion)
- `page-versions.json` — 48 command/reference page stamps, 0 prompt stamps
- `src/content/docs/prompts/execute-task.mdx` — exemplar prompt page for regeneration system prompt

## Expected Output

- `scripts/update.mjs` — extended with `runManagePrompts()` and 10-step pipeline
- `scripts/lib/regenerate-page.mjs` — extended with `buildPromptSystemPrompt()` and page-type dispatch
- `tests/update-pipeline.test.mjs` — updated assertions for 10 steps
- `page-versions.json` — 80 total entries (48 existing + 32 prompt pages)
