---
id: S01
parent: M005
milestone: M005
provides:
  - scripts/lib/extract-prompts.mjs with extractPrompts() export
  - content/generated/prompts.json — 32 prompt entries with full metadata
  - extract.mjs Phase 1 wiring (parallel alongside extractLocal())
  - tests/extract.test.mjs extended with 9-test prompts extraction suite
requires: []
affects:
  - S02
  - S03
  - S04
  - S05
key_files:
  - scripts/lib/extract-prompts.mjs
  - scripts/extract.mjs
  - content/generated/prompts.json
  - tests/extract.test.mjs
key_decisions:
  - D055 — prompts.json extracted at build time, not derived on-the-fly per page
  - D057 — 4-group taxonomy: auto-mode-pipeline(10), guided-variants(8), commands(13), foundation(1)
  - Variable descriptions authored as static VARIABLE_DESCRIPTIONS map (per D055 — no AST parsing)
  - resolvePackagePath() imported from extract-local.mjs, not duplicated
  - All variables marked required:true (prompt-loader.ts enforces it at runtime)
patterns_established:
  - extractPrompts() mirrors extractLocal() pattern exactly — resolvePackagePath → read files → write JSON → return count
  - Static data tables (PROMPT_GROUPS, VARIABLE_DESCRIPTIONS, COMMAND_MAPPINGS, PIPELINE_POSITIONS) at module top — auditable, patchable without touching logic
  - warn-on-missing pattern — logs [prompts] warning for unknown variable or pipeline key, no crash
  - Test pattern — before() loads JSON, it() asserts on structure; error messages include actual values
observability_surfaces:
  - "[prompts] Extracted 32 prompts from <pkgPath>/src/resources/extensions/gsd/prompts" — emitted by extractPrompts() on success
  - "Prompts: 32" line in extract.mjs final summary
  - node --test tests/extract.test.mjs → "ok 10 - prompts extraction" with 9 subtests, # tests 48
  - content/generated/prompts.json — primary inspection surface
drill_down_paths:
  - .gsd/milestones/M005/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S01/tasks/T02-SUMMARY.md
duration: ~25m (T01: ~20m, T02: ~5m)
verification_result: passed
completed_at: 2026-03-19
---

# S01: Prompt metadata extraction

**`content/generated/prompts.json` exists with all 32 prompts — name, slug, group (4-group taxonomy), variables with descriptions, pipeline positions, and command backlinks — verified by 48 passing tests and matching group distribution.**

## What Happened

Two tasks, tightly scoped, executed cleanly in sequence.

**T01** created `scripts/lib/extract-prompts.mjs` — a self-contained extractor following the `extract-local.mjs` pattern exactly. The module contains four static data tables baked at authoring time: `PROMPT_GROUPS` (implements the D057 taxonomy), `VARIABLE_DESCRIPTIONS` (290+ entries covering every `{{camelCase}}` placeholder across all 32 prompts), `COMMAND_MAPPINGS` (derived from `loadPrompt()` call site analysis in `auto-prompts.ts`), and `PIPELINE_POSITIONS` (1–2 sentence descriptions of where each prompt fires in the auto-mode loop).

The `extractPrompts()` function calls `resolvePackagePath()` (imported from `extract-local.mjs`, not duplicated), reads all `.md` files from `src/resources/extensions/gsd/prompts/`, extracts `{{camelCase}}` variables via regex, looks up descriptions and metadata from the static tables, sorts output by name for stable JSON, and writes `content/generated/prompts.json`. The function was wired into `scripts/extract.mjs` as the fourth call in the Phase 1 `Promise.all`, with a `Prompts: N` line added to the final summary and the count rolled into `totalFiles`.

**T02** extended `tests/extract.test.mjs` with a `describe("prompts extraction")` block (9 tests) following the existing `before()` + `it()` pattern. Tests cover: file validity, exact count (32), required fields on every entry, group distribution (10+8+13+1), `system` having zero variables, `execute-task` having 16 variables, variable object shape, `usedByCommands` element types, and slug-equals-name invariant. `prompts.json` was also added to the idempotency test's `jsonFiles` array.

## Verification

All slice-level verification checks passed:

| Check | Result |
|-------|--------|
| `node scripts/extract.mjs` exits 0 | ✅ pass (1.4s, Prompts: 32 in summary) |
| `prompts.json` count → 32 | ✅ pass |
| `system` variables → 0 | ✅ pass |
| `execute-task` variables → 16 | ✅ pass |
| Group distribution: 10+8+13+1 | ✅ pass |
| All 32 entries have required fields with correct types | ✅ pass |
| All group values are valid canonical names | ✅ pass |
| `node --test tests/extract.test.mjs` → 48 tests, 0 failures | ✅ pass |
| Observability: `[prompts] Extracted 32 prompts from …` in extract output | ✅ pass |

## Requirements Advanced

- **R018** — Prompts are now extracted as user-facing documentation metadata (variable descriptions, pipeline positions, group taxonomy) rather than raw agent-instruction dumps. The `prompts.json` is the structured intermediate that S03 will use to generate teaching pages.
- **R051** — `page-source-map.json` will need 32 new entries for prompt pages (added in S02). This slice produces the slug list and source file names that make those mappings precise rather than inferred.

## Requirements Validated

None validated by this slice alone — S01 produces the data contract that downstream slices consume. R057–R060 validate when pages exist and render (S02–S04).

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None. Both tasks followed their plans exactly.

## Known Limitations

- **Variable descriptions are static** — authored once from the research doc's variable inventory. If a prompt file gains a new `{{variable}}` placeholder, the extractor will log a `[prompts] Missing description for variable:` warning but won't fail. The description entry must be added manually to `VARIABLE_DESCRIPTIONS` in `extract-prompts.mjs`. This is intentional (D055 — no AST parsing).
- **`usedByCommands` is hardcoded** — derived from `loadPrompt()` call site analysis done during planning. If a new command starts using an existing prompt, `COMMAND_MAPPINGS` must be updated manually. No runtime cross-reference against command pages exists yet.
- **`slug === name`** for all 32 current prompts — the kebab-case slug is set equal to the filename stem. If a prompt file is ever renamed for cosmetic reasons (e.g., `execute-task` → `execute_task`), the slug and all page references must be updated together.

## Follow-ups

- S02 consumes `prompts.json` immediately — no follow-up needed from S01's side.
- If a future prompt is added to `gsd-pi`, the extractor will pick up the file but emit warnings for any undescribed variables and missing pipeline position. The maintainer must add entries to the three static maps.

## Files Created/Modified

- `scripts/lib/extract-prompts.mjs` — new module (~320 lines): `extractPrompts()` function + `PROMPT_GROUPS`, `VARIABLE_DESCRIPTIONS` (290+ entries), `COMMAND_MAPPINGS`, `PIPELINE_POSITIONS` static data tables
- `scripts/extract.mjs` — added import, added `extractPrompts()` to Phase 1 `Promise.all`, added `Prompts: N` to summary logging and `totalFiles` tally
- `content/generated/prompts.json` — generated output: 32-entry JSON array with full prompt metadata
- `tests/extract.test.mjs` — added `describe("prompts extraction")` block (9 tests) + `"prompts.json"` to idempotency `jsonFiles` array

## Forward Intelligence

### What the next slice should know

- **`prompts.json` schema is stable** — `{ name, slug, group, variables: [{name, description, required}], pipelinePosition, usedByCommands }`. S02 can consume it directly with no transformation.
- **Slug = name** for all 32 entries. URL paths will be `/prompts/{name}/` — e.g., `/prompts/execute-task/`, `/prompts/system/`.
- **Group order for sidebar**: the D057 taxonomy intends `auto-mode-pipeline` first (it's the core loop), then `guided-variants`, then `commands`, then `foundation`. S02 should use this ordering when building sidebar sub-groups.
- **`usedByCommands` is a string array of command slugs** — e.g., `["auto", "discuss"]`. These match the existing `/commands/{slug}/` URL pattern. S04 can use the reverse index directly from `prompts.json` without needing to build a new one.
- **`pipelinePosition` strings** are prose, not structured data — they describe where in the auto-mode loop a prompt fires. S03 will use them to author the Mermaid diagram context section, not as machine-readable identifiers.

### What's fragile

- **Static `COMMAND_MAPPINGS`** — if `auto-prompts.ts` is updated to invoke a new prompt from a new command, `extract-prompts.mjs` won't detect this automatically. The warning-on-missing pattern covers variable descriptions but not command mappings (no runtime warning for missing mappings, it just stays empty).
- **`execute-task` variable count = 16** — this is asserted in the test suite. If `execute-task.md` gains or loses a variable, the test fails explicitly. This is a feature (it forces a conscious update) but will trip up automated runs after a gsd-pi package upgrade.

### Authoritative diagnostics

- `node --test tests/extract.test.mjs 2>&1 | grep -E "prompts extraction|# tests"` — fastest pass/fail signal for S01's contract
- `python3 -c "import json; from collections import Counter; d=json.load(open('content/generated/prompts.json')); print(Counter(p['group'] for p in d))"` — group distribution spot-check
- `[prompts] Missing description for variable:` warnings in extract output — indicates a new variable was added to a prompt file without updating the static map

### What assumptions changed

- No assumptions changed. The 32-prompt count, 4-group taxonomy, variable counts, and command mappings all matched the research document exactly.
