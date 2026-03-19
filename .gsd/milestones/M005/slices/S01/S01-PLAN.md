# S01: Prompt metadata extraction

**Goal:** `content/generated/prompts.json` exists with all 32 prompts — name, slug, group, variables (with descriptions), pipeline position, and command backlinks.
**Demo:** Run `node scripts/extract.mjs`, inspect `content/generated/prompts.json` — 32 entries, correct structure, all groups represented.

## Must-Haves

- `extract-prompts.mjs` reads all 32 `.md` files from the gsd-pi prompts directory
- Variables extracted dynamically via `{{camelCase}}` regex matching
- Hardcoded variable descriptions, group taxonomy (4 groups from D057), command mappings, and pipeline positions
- Output is `content/generated/prompts.json` with the schema defined in the boundary map
- Wired into `extract.mjs` Phase 1 parallel extraction
- All 32 prompts present: 10 auto-mode-pipeline + 8 guided-variants + 13 commands + 1 foundation

## Proof Level

- This slice proves: contract (boundary output consumed by S02–S05)
- Real runtime required: yes (reads from globally installed gsd-pi package)
- Human/UAT required: no

## Verification

- `node scripts/extract.mjs` completes without errors, produces `content/generated/prompts.json`
- `node --test tests/extract.test.mjs` — all tests pass including new prompts extraction block
- Count check: `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); print(len(d))"` → 32
- Group distribution: 10 auto-mode-pipeline + 8 guided-variants + 13 commands + 1 foundation = 32
- Every entry has: name (string), slug (string), group (one of 4 values), variables (array), pipelinePosition (string), usedByCommands (array)
- `system` prompt has empty variables array
- `execute-task` prompt has 16 variables

## Observability / Diagnostics

**Runtime signals:**
- `[prompts] Extracted 32 prompts from <pkgPath>/src/resources/extensions/gsd/prompts/` — emitted by `extractPrompts()` on success
- `extract.mjs` final summary includes `Prompts: 32` line for quick count validation
- `content/generated/prompts.json` — primary inspection surface; valid JSON array of 32 objects

**Inspection surfaces:**
- `python3 -m json.tool content/generated/prompts.json | head -80` — spot-check structure
- `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); print(len(d))"` → 32
- `node --test tests/extract.test.mjs` — structural contract tests (added in T02)

**Failure visibility:**
- Missing gsd-pi package → `resolvePackagePath()` throws with actionable install message
- Missing prompts directory → `[prompts] Prompts directory not found:` warning, count 0 in output
- Wrong variable count → test failures in T02 with per-prompt assertion messages

**Redaction constraints:** None — prompts are documentation-grade content with no secrets.

## Integration Closure

- Upstream surfaces consumed: `resolvePackagePath()` from `scripts/lib/extract-local.mjs` (reused, not duplicated)
- New wiring introduced: `extractPrompts()` added to `extract.mjs` Phase 1 parallel extraction
- What remains: S02 reads `prompts.json` for scaffold/sidebar/source-map; S03 reads it for page generation; S04 reads `usedByCommands` for backlinks; S05 reads it for pipeline integration

## Tasks

- [x] **T01: Build extract-prompts.mjs and wire into extraction pipeline** `est:1h`
  - Why: This is the core deliverable — the module that reads 32 prompt `.md` files from the globally installed gsd-pi package, extracts `{{variable}}` placeholders via regex, and combines them with hardcoded metadata (descriptions, groups, command mappings, pipeline positions) to produce `prompts.json`. Wiring into `extract.mjs` is included here because it's 2 lines and can't be tested without it.
  - Files: `scripts/lib/extract-prompts.mjs` (new), `scripts/extract.mjs`
  - Do: Create `extract-prompts.mjs` following the `extract-local.mjs` pattern. Import `resolvePackagePath` from `extract-local.mjs`. Read all `.md` files from `src/resources/extensions/gsd/prompts/`. Extract variables with `/\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g`. Apply the static data tables from the research (group taxonomy per D057, variable descriptions, usedByCommands mappings, pipelinePosition strings). Write output to `content/generated/prompts.json`. In `extract.mjs`, add import and call `extractPrompts()` in the Phase 1 `Promise.all` alongside `extractLocal()`.
  - Verify: `node scripts/extract.mjs` succeeds; `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); print(len(d))"` → 32
  - Done when: `prompts.json` exists with 32 entries, each having all required fields, and extraction runs cleanly as part of the pipeline

- [x] **T02: Add prompts extraction tests to extract.test.mjs** `est:30m`
  - Why: Structural tests validate the boundary contract consumed by all downstream slices. Without tests, a future change to prompts could silently break the output shape.
  - Files: `tests/extract.test.mjs`
  - Do: Add a `describe("prompts extraction", ...)` block. Tests: (1) prompts.json exists and is valid JSON, (2) array length is 32, (3) every entry has required fields (name, slug, group, variables, pipelinePosition, usedByCommands) with correct types, (4) group distribution is 10+8+13+1, (5) `system` has empty variables array, (6) `execute-task` has 16 variables, (7) all group values are one of the 4 canonical names, (8) variable objects have name/description/required fields, (9) usedByCommands entries are strings. Add `prompts.json` to the idempotency test's `jsonFiles` array.
  - Verify: `node --test tests/extract.test.mjs` — all tests pass (existing + new)
  - Done when: All prompts extraction tests pass and the existing test suite remains green

## Files Likely Touched

- `scripts/lib/extract-prompts.mjs` (new)
- `scripts/extract.mjs`
- `tests/extract.test.mjs`
- `content/generated/prompts.json` (generated output)
