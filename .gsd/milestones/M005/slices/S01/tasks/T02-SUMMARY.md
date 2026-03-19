---
id: T02
parent: S01
milestone: M005
provides:
  - tests/extract.test.mjs extended with describe("prompts extraction") block (9 tests)
  - prompts.json added to idempotency test's jsonFiles array
key_files:
  - tests/extract.test.mjs
key_decisions:
  - none
patterns_established:
  - Follow the same before()/describe()/it() pattern used by other suites in extract.test.mjs — load data in before(), assert in each it()
  - Use assert.equal for exact counts, assert.ok with descriptive message for structural checks — error messages include the actual value for fast diagnosis
observability_surfaces:
  - node --test tests/extract.test.mjs — "ok N - prompts extraction" suite with 9 subtests; "# tests 48" in TAP summary
  - node --test tests/extract.test.mjs 2>&1 | grep "prompts extraction" — quick pass/fail check for the suite
duration: 5m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T02: Add prompts extraction tests to extract.test.mjs

**Added 9-test `describe("prompts extraction")` block to `tests/extract.test.mjs`; all 48 tests pass with 0 failures.**

## What Happened

Read the existing test file to understand patterns — all suites use `before()` to load JSON from `content/generated/`, then `describe`/`it` blocks to assert on structure. Added the new `describe("prompts extraction", ...)` block directly before the end-to-end suite, following the exact same `before()` + `it()` pattern.

The 9 tests cover:
1. `prompts.json exists and is valid JSON` — reads and parses the file, asserts array
2. `contains exactly 32 prompts` — exact count assertion
3. `every prompt has required fields with correct types` — iterates all 32, checks `name`, `slug`, `group` (against 4 valid values), `variables` (array), `pipelinePosition` (non-empty string), `usedByCommands` (array)
4. `group distribution matches taxonomy (10+8+13+1)` — counts per-group and asserts each exact value
5. `system prompt has zero variables` — finds by name, asserts `variables.length === 0`
6. `execute-task prompt has 16 variables` — finds by name, asserts `variables.length === 16`
7. `variable objects have name, description, and required fields` — iterates execute-task variables, checks all three field shapes
8. `usedByCommands entries are strings` — iterates all prompts with non-empty `usedByCommands`, checks each element is a string
9. `slug matches name for all prompts` — asserts `slug === name` for every entry

Also added `"prompts.json"` to the `jsonFiles` array in the idempotency test so it's validated as valid JSON on every run.

## Verification

Ran `node --test tests/extract.test.mjs` — 48 tests, 11 suites, 0 failures. The new "prompts extraction" suite shows 9 subtests (ok 1 through ok 9), all passing. Existing suites unchanged.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `node --test tests/extract.test.mjs` | 0 | ✅ pass | ~1.8s |
| 2 | TAP summary: `# tests 48`, `# pass 48`, `# fail 0` | — | ✅ pass | — |
| 3 | `ok 10 - prompts extraction` with 9 subtests in output | — | ✅ pass | — |

## Diagnostics

- `node --test tests/extract.test.mjs 2>&1 | grep -A4 "prompts extraction"` — shows suite line and first subtests
- `node --test tests/extract.test.mjs 2>&1 | grep "# tests"` — confirms total test count is 48
- Failure messages include actual values: e.g. `Expected 32 prompts, got 31` or `Prompt "X" has invalid group: "Y"` — enough context to diagnose without re-reading the test source

## Deviations

None — implementation followed the plan exactly.

## Known Issues

None.

## Files Created/Modified

- `tests/extract.test.mjs` — added `describe("prompts extraction")` block (~75 lines) and `"prompts.json"` to idempotency test's `jsonFiles` array
- `.gsd/milestones/M005/slices/S01/tasks/T02-PLAN.md` — added `## Observability Impact` section (pre-flight fix)
