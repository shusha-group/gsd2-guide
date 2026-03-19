---
estimated_steps: 5
estimated_files: 10
---

# T01: Author auto-mode pipeline prompt pages (10 pages)

**Slice:** S03 — Prompt page content generation
**Milestone:** M005

## Description

Write authored MDX content for the 10 auto-mode-pipeline prompts, replacing the S02 scaffold stubs. These are the most complex prompt pages — they sit in GSD's autonomous execution loop and need Mermaid diagrams showing their position in the pipeline alongside neighboring stages.

For each prompt, read the source `.md` file from the gsd-pi package to understand what the prompt instructs the agent to do, then read the `prompts.json` entry for structured metadata (variables, pipeline position, usedByCommands). Write the MDX page following the D056 4-section structure:

1. **What It Does** — 2-3 paragraphs explaining the behavioral contract in user terms. Not a source dump.
2. **Pipeline Position** — Simplified Mermaid flowchart (5-8 nodes) showing where this prompt fires in the auto-mode loop, with the current prompt highlighted. Then brief prose explaining what triggers this prompt and what happens before/after.
3. **Variables** — Table with columns: Variable, Description, Required. Data comes directly from `prompts.json`.
4. **Used By** — Links to command pages that invoke this prompt. Format: `[`/gsd auto`](../../commands/auto/)`.

The 10 prompts in this group are:
1. `research-milestone` — first stage, researches a new milestone
2. `research-slice` — researches a specific slice before planning
3. `plan-milestone` — creates the milestone plan with slice breakdown
4. `plan-slice` — decomposes a slice into executable tasks
5. `execute-task` — the core executor, runs a single task (16 variables — largest)
6. `replan-slice` — replans remaining tasks when a blocker is found
7. `complete-slice` — writes slice summary after all tasks pass
8. `reassess-roadmap` — re-evaluates roadmap after each slice
9. `complete-milestone` — writes milestone summary when all slices done
10. `validate-milestone` — validates all artifacts meet acceptance criteria

## Steps

1. Read `content/generated/prompts.json` to get all 10 auto-mode-pipeline entries (filter by `group === "auto-mode-pipeline"`). Note each entry's `variables`, `pipelinePosition`, and `usedByCommands`.

2. For each of the 10 prompts, read the source prompt `.md` file from the gsd-pi package at: `/Users/davidspence/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/prompts/{name}.md`. This provides behavioral understanding for the "What It Does" section.

3. Write each MDX file at `src/content/docs/prompts/{slug}.mdx`. The page structure is:
   ```mdx
   ---
   title: "{name}"
   description: "One meaningful sentence about what this prompt does"
   ---

   ## What It Does

   2-3 paragraphs...

   ## Pipeline Position

   ```mermaid
   flowchart TD
       ...5-8 nodes showing pipeline neighbors...
       
       style ThisPrompt fill:#0d180d,stroke:#39ff14,color:#39ff14
       style OtherNodes fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8
   ```

   Brief prose explaining the diagram.

   ## Variables

   | Variable | Description | Required |
   |----------|-------------|----------|
   | `variableName` | description | Yes |

   ## Used By

   - [`/gsd auto`](../../commands/auto/) — brief context
   ```

   **Critical formatting rules:**
   - Mermaid node IDs must use camelCase — `ExecuteTask` not `execute-task`. Set display labels: `ET["execute-task"]`
   - Links to command pages: `../../commands/{slug}/`
   - Links to sibling prompt pages: `../{slug}/`
   - Frontmatter `title` is the prompt name (e.g. `"execute-task"`)
   - Frontmatter `description` should be a meaningful one-liner, not the placeholder
   - No raw prompt text dumps (D029)

4. Each auto-mode pipeline prompt should show a simplified pipeline loop in its Mermaid diagram. The general flow is: research-milestone → plan-milestone → research-slice → plan-slice → execute-task → (replan-slice if blocked) → complete-slice → reassess-roadmap → (next slice or complete-milestone → validate-milestone). Each prompt's diagram should show its immediate neighbors (2-3 before, 2-3 after) with the current prompt highlighted using `fill:#0d180d,stroke:#39ff14,color:#39ff14` and neighbors using `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`.

5. After writing all 10 files, run `npm run build` to verify the build succeeds with 104 pages and 0 errors.

## Must-Haves

- [ ] All 10 auto-mode-pipeline MDX files have 4-section authored content (What It Does, Pipeline Position, Variables, Used By)
- [ ] `execute-task.mdx` has a 16-row variable table
- [ ] Mermaid node IDs use camelCase (no hyphens)
- [ ] All cross-links use correct relative path format (`../../commands/` for commands, `../` for sibling prompts)
- [ ] No raw prompt source dumps — explanatory prose only
- [ ] `npm run build` → 104 pages, 0 errors

## Verification

- `npm run build` → 104 pages, 0 errors
- `grep -l "## What It Does" src/content/docs/prompts/{execute-task,research-milestone,research-slice,plan-milestone,plan-slice,complete-slice,complete-milestone,reassess-roadmap,replan-slice,validate-milestone}.mdx | wc -l` → 10
- `grep -c '|' src/content/docs/prompts/execute-task.mdx` → at least 18 (header + separator + 16 rows)
- `grep -c 'fill:#0d180d' src/content/docs/prompts/execute-task.mdx` → at least 1 (Mermaid highlight style)

## Inputs

- `content/generated/prompts.json` — structured metadata for all 32 prompts (filter to `group === "auto-mode-pipeline"` for this task's 10)
- Source prompt files at `/Users/davidspence/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/prompts/*.md` — behavioral detail for "What It Does" prose
- `src/content/docs/commands/auto.mdx` — exemplar for Mermaid styling (3 fill colors: decision `#0d180d`, action `#1a3a1a`, error `#3a1a1a`)
- `src/content/docs/commands/discuss.mdx` — exemplar for Mermaid styling and page structure

## Expected Output

- `src/content/docs/prompts/execute-task.mdx` — fully authored (16 variables, pipeline diagram, Used By: auto + hooks)
- `src/content/docs/prompts/research-milestone.mdx` — fully authored
- `src/content/docs/prompts/research-slice.mdx` — fully authored
- `src/content/docs/prompts/plan-milestone.mdx` — fully authored (11 variables)
- `src/content/docs/prompts/plan-slice.mdx` — fully authored (11 variables)
- `src/content/docs/prompts/complete-slice.mdx` — fully authored
- `src/content/docs/prompts/complete-milestone.mdx` — fully authored
- `src/content/docs/prompts/reassess-roadmap.mdx` — fully authored
- `src/content/docs/prompts/replan-slice.mdx` — fully authored
- `src/content/docs/prompts/validate-milestone.mdx` — fully authored
- `npm run build` passing with 104 pages
