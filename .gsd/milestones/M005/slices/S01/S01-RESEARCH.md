# S01: Prompt metadata extraction — Research

**Date:** 2026-03-19

## Summary

This slice produces `content/generated/prompts.json` — the foundational metadata file consumed by S02 (scaffold), S03 (generation), S04 (backlinks), and S05 (pipeline integration). The work is straightforward: write an `extractPrompts()` function in `scripts/lib/extract-prompts.mjs`, wire it into `scripts/extract.mjs`, and validate the output structurally with tests.

The 32 prompt `.md` files live at the globally installed gsd-pi package under `src/resources/extensions/gsd/prompts/`. Variables are `{{camelCase}}` placeholders extracted by regex. The variable *descriptions* — what each variable means in plain language — must be authored by studying `auto-prompts.ts` builder functions (1267 lines), which construct the values passed to `loadPrompt()`. The command backlink mapping (`usedByCommands`) is derivable from `loadPrompt()` call sites across the gsd extension source.

The `system.md` prompt is a special case: it has zero template variables and is injected as a system message into every session (not dispatched by auto-mode).

## Recommendation

Build a single `scripts/lib/extract-prompts.mjs` module following the exact pattern of `extract-local.mjs` (same read-files-from-package, produce-JSON approach). Wire it into `extract.mjs` as a new phase after local extraction. The extractor should:

1. Read all 32 `.md` files from the prompts directory
2. Extract `{{varName}}` placeholders via regex
3. Apply the hardcoded grouping taxonomy (4 groups from D057)
4. Include hardcoded variable descriptions authored from studying `auto-prompts.ts`
5. Include hardcoded `usedByCommands` mapping derived from `loadPrompt()` call site analysis
6. Include a `pipelinePosition` string for each prompt

The variable descriptions and command mappings should be authored as static data in the extractor, not dynamically derived. Dynamic derivation from TypeScript AST parsing would be fragile, slow, and complex — the 32 prompts change rarely, and when they do, `npm run update` will detect the staleness. This aligns with D055's rationale.

## Implementation Landscape

### Key Files

- `scripts/lib/extract-prompts.mjs` — **NEW.** Core extractor. Reads prompt `.md` files from gsd-pi package, extracts variables, applies taxonomy/descriptions/mappings, writes `prompts.json`.
- `scripts/extract.mjs` — Wire `extractPrompts()` into the orchestrator, add to Phase 1 parallel extraction alongside `extractLocal()`.
- `scripts/lib/extract-local.mjs` — **Read-only reference.** `resolvePackagePath()` already resolves the gsd-pi package root. Reuse it via import rather than duplicating.
- `content/generated/prompts.json` — **Output.** The boundary contract consumed by all downstream slices.
- `tests/extract.test.mjs` — Add `describe("prompts extraction", ...)` block with structural assertions.

### Source Data Locations (in gsd-pi package)

- `src/resources/extensions/gsd/prompts/*.md` — 32 template files. Variables are `{{camelCase}}` placeholders.
- `src/resources/extensions/gsd/auto-prompts.ts` — Builder functions for 12 auto-mode prompts. Primary source for variable descriptions.
- `src/resources/extensions/gsd/prompt-loader.ts` — `loadPrompt()` function. Validates all declared `{{vars}}` have values.
- `src/resources/extensions/gsd/guided-flow.ts` — `loadPrompt()` calls for 10 guided prompts.
- `src/resources/extensions/gsd/auto-dispatch.ts` — Dispatch table calling `build*Prompt()` functions for auto-mode pipeline.
- Various `.ts` files — `loadPrompt()` calls for command-specific prompts (forensics.ts, quick.ts, etc.)

### Output Schema

```json
[
  {
    "name": "execute-task",
    "slug": "execute-task",
    "group": "auto-mode-pipeline",
    "variables": [
      { "name": "workingDirectory", "description": "Absolute path to the project working directory", "required": true },
      { "name": "milestoneId", "description": "Current milestone identifier (e.g. M001)", "required": true }
    ],
    "pipelinePosition": "Dispatched by auto-mode when a task is ready for execution — the executor agent receives this prompt with the full task plan inlined",
    "usedByCommands": ["auto", "hooks"]
  }
]
```

### Prompt-to-Group Mapping (from D057)

| Group | Prompts (32 total) |
|---|---|
| `auto-mode-pipeline` (10) | execute-task, plan-slice, plan-milestone, research-slice, research-milestone, complete-slice, complete-milestone, validate-milestone, reassess-roadmap, replan-slice |
| `guided-variants` (8) | guided-execute-task, guided-plan-slice, guided-plan-milestone, guided-research-slice, guided-complete-slice, guided-discuss-slice, guided-discuss-milestone, guided-resume-task |
| `commands` (13) | discuss, discuss-headless, queue, forensics, triage-captures, doctor-heal, heal-skill, quick-task, run-uat, worktree-merge, workflow-start, rewrite-docs, review-migration |
| `foundation` (1) | system |

### Prompt-to-Command Mapping (derived from `loadPrompt()` call sites)

| Prompt | Used By Commands |
|---|---|
| system | gsd, config, knowledge (injected as system message into every session) |
| discuss | gsd, discuss, steer |
| discuss-headless | headless |
| queue | queue |
| forensics | forensics |
| triage-captures | capture, triage (auto-post-unit.ts) |
| doctor-heal | doctor |
| heal-skill | skill-health (built inline in skill-health.ts, not via loadPrompt) |
| quick-task | quick |
| run-uat | auto (dispatched by auto-dispatch.ts) |
| worktree-merge | (worktree-command.ts — no dedicated command page) |
| workflow-start | (commands-workflow-templates.ts — no dedicated command page) |
| review-migration | migrate |
| rewrite-docs | auto (dispatched by auto-dispatch.ts via steer overrides) |
| execute-task | auto, hooks |
| plan-slice | auto |
| plan-milestone | auto |
| research-slice | auto |
| research-milestone | auto |
| complete-slice | auto |
| complete-milestone | auto |
| validate-milestone | auto |
| reassess-roadmap | auto |
| replan-slice | auto |
| guided-* (8 prompts) | gsd (dispatched by guided-flow.ts) |

### Variable Inventory (extracted from prompt files)

| Prompt | Variables |
|---|---|
| complete-milestone | inlinedContext, milestoneId, milestoneSummaryPath, milestoneTitle, roadmapPath, workingDirectory |
| complete-slice | inlinedContext, milestoneId, roadmapPath, sliceId, sliceSummaryPath, sliceTitle, sliceUatPath, workingDirectory |
| discuss | commitInstruction, contextPath, inlinedTemplates, milestoneId, multiMilestoneCommitInstruction, preamble, roadmapPath |
| discuss-headless | commitInstruction, contextPath, inlinedTemplates, milestoneId, multiMilestoneCommitInstruction, roadmapPath, seedContext |
| doctor-heal | doctorCommandSuffix, doctorSummary, scopeLabel, structuredIssues |
| execute-task | carryForwardSection, milestoneId, overridesSection, planPath, priorTaskLines, resumeSection, sliceId, slicePlanExcerpt, sliceTitle, taskId, taskPlanInline, taskPlanPath, taskSummaryPath, taskTitle, verificationBudget, workingDirectory |
| forensics | forensicData, gsdSourceDir, problemDescription |
| guided-complete-slice | inlinedTemplates, milestoneId, sliceId, sliceTitle, workingDirectory |
| guided-discuss-milestone | commitInstruction, inlinedTemplates, milestoneId, milestoneTitle, structuredQuestionsAvailable |
| guided-discuss-slice | commitInstruction, contextPath, inlinedContext, inlinedTemplates, milestoneId, sliceDirPath, sliceId, sliceTitle |
| guided-execute-task | inlinedTemplates, milestoneId, sliceId, taskId, taskTitle |
| guided-plan-milestone | inlinedTemplates, milestoneId, milestoneTitle, secretsOutputPath |
| guided-plan-slice | inlinedTemplates, milestoneId, sliceId, sliceTitle |
| guided-research-slice | inlinedTemplates, milestoneId, sliceId, sliceTitle |
| guided-resume-task | milestoneId, sliceId |
| heal-skill | date, healArtifact, skillName, unitId |
| plan-milestone | inlinedContext, milestoneId, milestonePath, milestoneTitle, outputPath, researchOutputPath, secretsOutputPath, skillDiscoveryInstructions, skillDiscoveryMode, sourceFilePaths, workingDirectory |
| plan-slice | commitInstruction, dependencySummaries, executorContextConstraints, inlinedContext, milestoneId, outputPath, sliceId, slicePath, sliceTitle, sourceFilePaths, workingDirectory |
| queue | commitInstruction, existingMilestonesContext, inlinedTemplates, preamble |
| quick-task | branch, date, description, summaryPath, taskDir, taskNum |
| reassess-roadmap | assessmentPath, commitInstruction, completedSliceId, deferredCaptures, inlinedContext, milestoneId, roadmapPath, workingDirectory |
| replan-slice | captureContext, inlinedContext, milestoneId, planPath, replanPath, sliceId, sliceTitle, workingDirectory |
| research-milestone | inlinedContext, milestoneId, milestoneTitle, outputPath, skillDiscoveryInstructions, skillDiscoveryMode, workingDirectory |
| research-slice | dependencySummaries, inlinedContext, milestoneId, outputPath, skillDiscoveryInstructions, skillDiscoveryMode, sliceId, slicePath, sliceTitle, workingDirectory |
| review-migration | gsdPath, previewStats, sourcePath |
| rewrite-docs | documentList, milestoneId, milestoneTitle, overrideContent, overridesPath |
| run-uat | inlinedContext, milestoneId, sliceId, uatPath, uatResultPath, uatType, workingDirectory |
| system | (none) |
| triage-captures | currentPlan, pendingCaptures, roadmapContext |
| validate-milestone | inlinedContext, milestoneId, milestoneTitle, remediationRound, roadmapPath, validationPath, workingDirectory |
| workflow-start | artifactDir, branch, complexity, date, description, issueRef, phases, templateId, templateName, workflowContent |
| worktree-merge | addedFiles, codeDiff, commitLog, gsdDiff, mainBranch, mainTreePath, modifiedFiles, removedFiles, worktreeBranch, worktreeName, worktreePath |

### Build Order

1. **First: `scripts/lib/extract-prompts.mjs`** — The core extractor. This is the only file that actually reads source data and produces the output. All variable descriptions and command mappings are authored as static data here, informed by the analysis above. Variables are extracted dynamically from prompt files via regex `\{\{[a-zA-Z][a-zA-Z0-9_]*\}\}`.
2. **Second: Wire into `scripts/extract.mjs`** — Add `import { extractPrompts } from "./lib/extract-prompts.mjs"` and call it in Phase 1 parallel extraction.
3. **Third: Tests in `tests/extract.test.mjs`** — Add a `describe("prompts extraction", ...)` block verifying: count is 32, all have required fields (name, slug, group, variables, pipelinePosition, usedByCommands), group distribution matches (10+8+13+1), system.md has empty variables array, variable names are camelCase strings.

### Verification Approach

1. **Run the extractor:** `node scripts/extract.mjs` completes without errors, produces `content/generated/prompts.json`
2. **Inspect the output:** `cat content/generated/prompts.json | python3 -m json.tool | head -50` — verify structure matches schema
3. **Count check:** `python3 -c "import json; d=json.load(open('content/generated/prompts.json')); print(len(d))"` → 32
4. **Run tests:** `node --test tests/extract.test.mjs` — all pass including new prompts extraction tests
5. **Group distribution:** Verify 10 auto-mode-pipeline + 8 guided-variants + 13 commands + 1 foundation = 32

## Constraints

- `resolvePackagePath()` in `extract-local.mjs` requires `src/resources/` to exist in the resolved path — prompts extractor must use the same resolved package path, not construct its own.
- Variable regex must match `{{[a-zA-Z][a-zA-Z0-9_]*}}` — the same pattern used by `prompt-loader.ts` for validation. This ensures the extractor finds exactly the variables the runtime uses.
- The `heal-skill` prompt is NOT loaded via `loadPrompt()` — it's built inline in `skill-health.ts` using `buildHealSkillPrompt()`. But the `.md` file still exists at `prompts/heal-skill.md` and IS loaded via `loadPrompt()` by the extension. The variable list extracted from the `.md` file is authoritative.
- The `review-migration` prompt is loaded via manual `readFileSync` + `replaceAll` in `migrate/command.ts`, not via `loadPrompt()`. Same principle — the `.md` file is authoritative for variables.

## Common Pitfalls

- **Variable descriptions are the hard part** — The variable names are identifiers (`{{taskPlanInline}}`, `{{verificationBudget}}`), not self-documenting. Each description must be authored by reading the builder function in `auto-prompts.ts` to understand what value is actually substituted. The descriptions table above serves as the primary reference, but the extractor should include plain-language descriptions that S03 page generation can use directly.
- **`inlinedContext` and `inlinedTemplates` are composite variables** — They contain concatenated file contents and template sections. The description should explain they're "pre-assembled context blocks" rather than trying to enumerate their sub-contents.
- **`required` field on variables** — All variables declared in a prompt template are effectively required (prompt-loader.ts throws if any are missing). Set `required: true` for all. The distinction is whether a variable is *always* populated or *conditionally* populated (e.g. `overridesSection` may be empty string but is always passed). Mark all as `required: true` in the schema since the loader enforces it.
