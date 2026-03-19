---
estimated_steps: 4
estimated_files: 1
---

# T02: Add prompts extraction tests to extract.test.mjs

**Slice:** S01 — Prompt metadata extraction
**Milestone:** M005

## Description

Add a `describe("prompts extraction", ...)` block to the existing `tests/extract.test.mjs` test file. These tests validate the structural contract of `prompts.json` — the boundary output consumed by S02 (scaffold), S03 (generation), S04 (backlinks), and S05 (pipeline integration). The tests ensure future changes don't silently break the output shape.

The existing test file uses Node.js built-in `node:test` and `node:assert`. It reads from `content/generated/` after extraction has already run. Follow the same pattern — read `prompts.json` from the output directory and assert on its structure.

## Steps

1. **Read the existing test file** at `tests/extract.test.mjs` to understand the test patterns, imports, and `OUTPUT_DIR` constant. The file uses `describe`/`it` from `node:test` and `assert` from `node:assert`. Tests read JSON files from `content/generated/`.

2. **Add a `describe("prompts extraction", ...)` block** after the existing test blocks. Include these tests:

   - `it("prompts.json exists and is valid JSON")` — read file, parse JSON, assert no throw
   - `it("contains exactly 32 prompts")` — assert array length is 32
   - `it("every prompt has required fields with correct types")` — for each entry assert: `name` is non-empty string, `slug` is non-empty string, `group` is one of `["auto-mode-pipeline", "guided-variants", "commands", "foundation"]`, `variables` is an array, `pipelinePosition` is non-empty string, `usedByCommands` is an array
   - `it("group distribution matches taxonomy (10+8+13+1)")` — count entries per group, assert auto-mode-pipeline=10, guided-variants=8, commands=13, foundation=1
   - `it("system prompt has zero variables")` — find entry where name=system, assert variables.length === 0
   - `it("execute-task prompt has 16 variables")` — find entry where name=execute-task, assert variables.length === 16
   - `it("variable objects have name, description, and required fields")` — for a prompt with variables (e.g. execute-task), assert each variable has: `name` (string), `description` (non-empty string), `required` (boolean)
   - `it("usedByCommands entries are strings")` — for entries with non-empty usedByCommands, assert each element is a string
   - `it("slug matches name for all prompts")` — assert `slug === name` for every entry (prompt names are already kebab-case)

3. **Add `prompts.json` to the idempotency test's `jsonFiles` array** — near the end of the file there's a test checking that all generated JSON files are valid. Add `"prompts.json"` to the `jsonFiles` array.

4. **Run the full test suite**: `node --test tests/extract.test.mjs` — all tests (existing + new) must pass.

## Must-Haves

- [ ] `describe("prompts extraction", ...)` block added to `tests/extract.test.mjs`
- [ ] At least 9 test cases covering: existence, count, field types, group distribution, system vars, execute-task vars, variable object shape, usedByCommands types, slug matching
- [ ] `prompts.json` added to idempotency test's `jsonFiles` array
- [ ] All existing tests remain passing (no regressions)
- [ ] All new tests pass

## Verification

- `node --test tests/extract.test.mjs` exits 0 with all tests passing
- Test output shows the new "prompts extraction" describe block with 9+ passing tests
- No existing tests broken

## Inputs

- `content/generated/prompts.json` — the output from T01, the file under test
- `tests/extract.test.mjs` — existing test file to extend (uses `node:test` and `node:assert`)
- S01-PLAN.md verification section — lists the structural assertions this task must cover

## Expected Output

- `tests/extract.test.mjs` — extended with ~60–80 lines of new test code in a `describe("prompts extraction")` block

## Observability Impact

**What signals change after this task:**
- `node --test tests/extract.test.mjs` now includes an `ok N - prompts extraction` suite line in TAP output with 9 subtests. A future agent can grep for `prompts extraction` in test output to confirm the suite is present and passing.
- The TAP summary line changes from `# tests 39` to `# tests 48` — the delta of 9 confirms all new tests were registered.

**How a future agent inspects this task:**
- Run `node --test tests/extract.test.mjs 2>&1 | grep -A2 "prompts extraction"` — should show `ok N - prompts extraction` with `type: 'suite'`.
- Run `node --test tests/extract.test.mjs 2>&1 | grep "# tests"` — should show `# tests 48`.
- Read `tests/extract.test.mjs` and search for `describe("prompts extraction"` to confirm the block exists.

**Failure states that become visible:**
- If `prompts.json` is missing or malformed: `prompts.json exists and is valid JSON` test fails with a file-read or parse error — points directly at the T01 extractor.
- If prompt count changes from 32: `contains exactly 32 prompts` fails with the actual count — tells an agent exactly how many prompts were found.
- If a new prompt is added to an existing group or a group count shifts: `group distribution matches taxonomy` fails with per-group expected vs actual — pinpoints which group changed.
- If `execute-task` gains or loses variables: `execute-task prompt has 16 variables` fails with the new count.
- If the `system` prompt gains variables unexpectedly: `system prompt has zero variables` fails immediately.
- If a variable object loses the `required` boolean field: `variable objects have name, description, and required fields` fails with the field name and prompt context.
