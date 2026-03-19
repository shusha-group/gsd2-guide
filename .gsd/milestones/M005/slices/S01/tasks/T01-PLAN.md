---
estimated_steps: 6
estimated_files: 3
---

# T01: Build extract-prompts.mjs and wire into extraction pipeline

**Slice:** S01 — Prompt metadata extraction
**Milestone:** M005

## Description

Create `scripts/lib/extract-prompts.mjs` — the core extractor that reads all 32 prompt `.md` files from the globally installed gsd-pi package, extracts `{{variable}}` placeholders via regex, and combines them with hardcoded metadata (variable descriptions, group taxonomy, command mappings, pipeline positions) to produce `content/generated/prompts.json`. Then wire it into `scripts/extract.mjs` as part of Phase 1 parallel extraction.

The extractor follows the same pattern as `extract-local.mjs`: import `resolvePackagePath()` from it (don't duplicate), read files from the package, produce JSON output. Variable descriptions and command mappings are authored as static data tables — not dynamically derived from TypeScript AST parsing (per D055 rationale).

## Steps

1. **Create `scripts/lib/extract-prompts.mjs`** with this structure:
   - Import `resolvePackagePath` from `./extract-local.mjs` and `fs`, `path` from node
   - Define the `PROMPT_GROUPS` mapping (which of the 32 prompts belongs to each of the 4 canonical groups from D057):
     - `auto-mode-pipeline` (10): execute-task, plan-slice, plan-milestone, research-slice, research-milestone, complete-slice, complete-milestone, validate-milestone, reassess-roadmap, replan-slice
     - `guided-variants` (8): guided-execute-task, guided-plan-slice, guided-plan-milestone, guided-research-slice, guided-complete-slice, guided-discuss-slice, guided-discuss-milestone, guided-resume-task
     - `commands` (13): discuss, discuss-headless, queue, forensics, triage-captures, doctor-heal, heal-skill, quick-task, run-uat, worktree-merge, workflow-start, rewrite-docs, review-migration
     - `foundation` (1): system
   - Define `VARIABLE_DESCRIPTIONS` — a map from `promptName.variableName` → description string. Author plain-language descriptions for every variable of every prompt, informed by the research doc's variable inventory and `auto-prompts.ts` analysis. These descriptions will be used directly by S03 page generation. Key examples:
     - `execute-task.workingDirectory` → "Absolute path to the project working directory"
     - `execute-task.taskPlanInline` → "Full task plan content inlined into the prompt for the executor agent"
     - `execute-task.verificationBudget` → "Maximum number of verification attempts allowed for the task"
     - `discuss.inlinedTemplates` → "Pre-assembled block of GSD templates (plan, task-plan, etc.) for reference during discussion"
     - `discuss.preamble` → "Opening context about the current project state and discussion scope"
     - `system` has no variables — no entries needed
   - Define `COMMAND_MAPPINGS` — a map from prompt name → array of command slugs. Use the research doc's "Prompt-to-Command Mapping" table. Key mappings:
     - `system` → `["gsd", "config", "knowledge"]`
     - `discuss` → `["gsd", "discuss", "steer"]`
     - `execute-task` → `["auto", "hooks"]`
     - All 10 auto-mode pipeline prompts → `["auto"]` (except execute-task which also has hooks)
     - All 8 guided-* prompts → `["gsd"]`
     - `worktree-merge` → `[]` (no dedicated command page)
     - `workflow-start` → `[]` (no dedicated command page)
   - Define `PIPELINE_POSITIONS` — a map from prompt name → string describing where in the auto-mode pipeline this fires. Examples:
     - `execute-task` → "Dispatched by auto-mode when a task is ready for execution — the executor agent receives this prompt with the full task plan inlined"
     - `plan-slice` → "Dispatched by auto-mode after slice research is complete — the planner agent decomposes the slice into executable tasks"
     - `system` → "Injected as the system message into every GSD session — establishes the agent persona and base capabilities"
     - `discuss` → "Invoked by /gsd discuss or /gsd steer — opens an interactive discussion session about the project"
   - Write the main `extractPrompts(options)` function:
     - Accept `{ outputDir, pkgPath }` options (same pattern as `extractLocal`)
     - Call `resolvePackagePath(pkgPath)` to get the gsd-pi root
     - Read all `.md` files from `path.join(pkgRoot, "src", "resources", "extensions", "gsd", "prompts")`
     - For each file: extract name (filename without `.md`), compute slug (same as name — already kebab-case), look up group from `PROMPT_GROUPS`, extract variables via regex `/\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g`, map each variable to `{ name, description, required: true }` using `VARIABLE_DESCRIPTIONS`, look up `usedByCommands` from `COMMAND_MAPPINGS`, look up `pipelinePosition` from `PIPELINE_POSITIONS`
     - Sort the output array by name for stable output
     - Write JSON to `path.join(outputDir, "prompts.json")`
     - Return `{ count: prompts.length }` for logging
   - Export `extractPrompts` as named export

2. **Author all variable descriptions** for all 32 prompts. The research doc lists every variable for every prompt. For each one, write a plain-language description (1 sentence) that explains what value is substituted at runtime. Descriptions should be understandable by a documentation reader, not just a developer. Where the research says variables like `inlinedContext` and `inlinedTemplates` are composite, describe them as "Pre-assembled context block containing..." rather than trying to list sub-contents.

3. **Author all pipeline position strings** for all 32 prompts. Each should be 1–2 sentences explaining when/why this prompt fires in the GSD workflow.

4. **Wire into `scripts/extract.mjs`**: Add `import { extractPrompts } from "./lib/extract-prompts.mjs"` at the top. In the Phase 1 `Promise.all` block (around line 179), add `extractPrompts(extractOpts)` as a fourth parallel call. Add logging for the result count, matching the style of existing extraction logging.

5. **Run the extraction** to verify: `node scripts/extract.mjs`. Confirm `content/generated/prompts.json` is written with 32 entries.

6. **Spot-check the output**: Verify `system` has 0 variables, `execute-task` has 16 variables, group distribution is 10+8+13+1=32, all entries have the required fields.

## Must-Haves

- [ ] `scripts/lib/extract-prompts.mjs` exists and exports `extractPrompts()`
- [ ] `extractPrompts()` reads from globally installed gsd-pi package via `resolvePackagePath()`
- [ ] Variables extracted dynamically via `/\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g` regex
- [ ] All 32 prompts present in output with correct group assignments per D057
- [ ] Every variable has a `description` field (not empty string)
- [ ] `usedByCommands` array present for all 32 prompts (may be empty for `worktree-merge`, `workflow-start`)
- [ ] `pipelinePosition` string present for all 32 prompts
- [ ] Wired into `extract.mjs` Phase 1 parallel extraction
- [ ] `node scripts/extract.mjs` succeeds and produces `content/generated/prompts.json`

## Verification

- `node scripts/extract.mjs` completes without errors
- `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); print(len(d))"` outputs `32`
- `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); sys=[p for p in d if p['name']=='system'][0]; print(len(sys['variables']))"` outputs `0`
- `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); et=[p for p in d if p['name']=='execute-task'][0]; print(len(et['variables']))"` outputs `16`

## Inputs

- `scripts/lib/extract-local.mjs` — import `resolvePackagePath()` from here (do NOT duplicate it)
- `scripts/extract.mjs` — the orchestrator to wire into (Phase 1 `Promise.all` block around line 179)
- S01-RESEARCH.md variable inventory table — authoritative list of all variables per prompt
- S01-RESEARCH.md prompt-to-command mapping table — authoritative command backlink data
- S01-RESEARCH.md prompt-to-group mapping table — authoritative group assignments per D057

## Expected Output

- `scripts/lib/extract-prompts.mjs` — new module (~300–400 lines, mostly static data tables)
- `scripts/extract.mjs` — 2–3 lines added (import + Promise.all entry + logging)
- `content/generated/prompts.json` — 32-entry JSON array with the boundary contract schema
