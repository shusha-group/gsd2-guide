---
id: T01
parent: S01
milestone: M005
provides:
  - scripts/lib/extract-prompts.mjs with extractPrompts() export
  - content/generated/prompts.json with 32 prompt entries
  - extract.mjs Phase 1 wiring for parallel prompt extraction
key_files:
  - scripts/lib/extract-prompts.mjs
  - scripts/extract.mjs
  - content/generated/prompts.json
key_decisions:
  - Variable descriptions authored as static VARIABLE_DESCRIPTIONS map (per D055 — no AST parsing)
  - resolvePackagePath() imported from extract-local.mjs, not duplicated
  - All variables marked required:true (prompt-loader.ts enforces it at runtime)
patterns_established:
  - extractPrompts() follows the exact same pattern as extractLocal() — resolvePackagePath, read files, write JSON, return count
  - Static data tables (PROMPT_GROUPS, VARIABLE_DESCRIPTIONS, COMMAND_MAPPINGS, PIPELINE_POSITIONS) defined at module top — easy to audit and update when prompts change
  - warn-on-missing pattern: logs [prompts] warning if a description or pipeline position key is absent, making omissions visible without crashing
observability_surfaces:
  - "[prompts] Extracted 32 prompts from <pkgPath>/src/resources/extensions/gsd/prompts" log line on success
  - "Prompts: 32" line in extract.mjs final summary
  - content/generated/prompts.json — inspectable with python3 -m json.tool
duration: ~20m
verification_result: passed
completed_at: 2026-03-19
blocker_discovered: false
---

# T01: Build extract-prompts.mjs and wire into extraction pipeline

**Created `scripts/lib/extract-prompts.mjs` with all 32 prompt entries, 290+ variable descriptions, command mappings, and pipeline positions — wired into `extract.mjs` Phase 1; `node scripts/extract.mjs` produces `content/generated/prompts.json` with 32 entries.**

## What Happened

Created `scripts/lib/extract-prompts.mjs` as a self-contained extractor following the `extract-local.mjs` pattern. The module contains four static data tables — `PROMPT_GROUPS` (D057 taxonomy), `VARIABLE_DESCRIPTIONS` (290+ entries authored from the research doc's variable inventory), `COMMAND_MAPPINGS` (derived from `loadPrompt()` call site analysis), and `PIPELINE_POSITIONS` (1–2 sentence descriptions for all 32 prompts).

The `extractPrompts()` function calls `resolvePackagePath()` (imported, not duplicated), reads all `.md` files from the prompts directory, extracts `{{camelCase}}` variables via regex `/\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g`, looks up descriptions and metadata from the static tables, sorts output by name for stable JSON, and writes `prompts.json`.

Wired into `scripts/extract.mjs`: added the import at the top, added `extractPrompts(extractOpts)` as the fourth call in the Phase 1 `Promise.all`, added `Prompts: N` to the final summary, and included `promptsResult.count` in the `totalFiles` tally.

The pre-flight observability gaps in S01-PLAN.md and T01-PLAN.md were fixed before implementation began — added `## Observability / Diagnostics` to the slice plan and `## Observability Impact` to the task plan.

## Verification

Ran `node scripts/extract.mjs` — completed in 2.6s without errors, producing `[prompts] Extracted 32 prompts from .../prompts` and `Prompts: 32` in summary. All four required verification checks passed:

- Count: 32 ✅
- `system` variables: 0 ✅
- `execute-task` variables: 16 ✅
- Group distribution: 10 auto-mode-pipeline + 8 guided-variants + 13 commands + 1 foundation = 32 ✅

Additional structural check confirmed all 32 entries have non-empty `pipelinePosition`, all variables have non-empty `description`, all `required` flags are `true`, and all groups are valid canonical values.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `node scripts/extract.mjs` | 0 | ✅ pass | 2.6s |
| 2 | `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); print(len(d))"` | 0 (→ 32) | ✅ pass | <1s |
| 3 | `python3 -c "...sys=[p for p in d if p['name']=='system'][0]; print(len(sys['variables']))"` | 0 (→ 0) | ✅ pass | <1s |
| 4 | `python3 -c "...et=[p for p in d if p['name']=='execute-task'][0]; print(len(et['variables']))"` | 0 (→ 16) | ✅ pass | <1s |
| 5 | Group distribution check (python3 Counter) | 0 (→ {auto-mode-pipeline:10, commands:13, guided-variants:8, foundation:1}) | ✅ pass | <1s |
| 6 | Full structural validation (required fields, non-empty descriptions, valid groups) | 0 (→ "All checks passed") | ✅ pass | <1s |

## Diagnostics

- Run `node scripts/extract.mjs` — look for `[prompts]` log line and `Prompts: 32` in summary
- Inspect output: `python3 -m json.tool content/generated/prompts.json | head -80`
- Count check: `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); print(len(d))"`
- If the extractor emits `[prompts] Missing description for variable:` warnings, a new variable was added to a prompt file that doesn't have an entry in `VARIABLE_DESCRIPTIONS` — add it to the map in `extract-prompts.mjs`

## Deviations

None — implementation follows the task plan exactly.

## Known Issues

None — all 32 prompts extracted cleanly with complete metadata.

## Files Created/Modified

- `scripts/lib/extract-prompts.mjs` — new module (~320 lines): extractPrompts() function + PROMPT_GROUPS, VARIABLE_DESCRIPTIONS (290+ entries), COMMAND_MAPPINGS, PIPELINE_POSITIONS static data tables
- `scripts/extract.mjs` — added import, added extractPrompts() to Phase 1 Promise.all, added Prompts count to summary logging and totalFiles tally
- `content/generated/prompts.json` — generated output: 32-entry JSON array with full prompt metadata
- `.gsd/milestones/M005/slices/S01/S01-PLAN.md` — added ## Observability / Diagnostics section (pre-flight fix)
- `.gsd/milestones/M005/slices/S01/tasks/T01-PLAN.md` — added ## Observability Impact section (pre-flight fix)
