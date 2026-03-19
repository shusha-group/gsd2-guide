# S03: Prompt page content generation

**Goal:** All 32 prompt pages have real authored content — prose description, Mermaid pipeline diagram, variable table, and "Used by commands" section — replacing the S02 scaffold stubs.
**Demo:** Browse `/prompts/execute-task/` and see a 4-section page with What It Does prose, a Mermaid pipeline position diagram with terminal-native styling, a 16-row variable table, and "Used By" links to `/commands/auto/` and `/commands/hooks/`. `npm run build` and `npm run check-links` pass.

## Must-Haves

- All 32 MDX files in `src/content/docs/prompts/` have authored content following the D056 structure: What It Does → Pipeline Position (Mermaid) → Variables → Used By
- Mermaid diagrams use terminal-native styling (3 fill colors from existing command pages)
- Mermaid node IDs use camelCase (no hyphens — e.g. `ExecuteTask` not `execute-task`)
- Variable tables populated from `prompts.json` data (name, description, required columns)
- "Used By" sections link to command pages using correct relative paths (`../../commands/{slug}/`)
- Prompt→prompt cross-links use `../{slug}/` relative format
- Frontmatter `description` updated from placeholder to meaningful one-liner
- `system.mdx` has no variable table rows and notes it has no template variables
- Guided variant pages are proportionally brief (not padded) and note their delegation pattern
- `workflow-start` and `worktree-merge` note they are not directly invoked by user-facing commands
- `npm run build` succeeds with 104 pages, 0 errors
- `npm run check-links` exits 0 (all internal links valid)
- No raw prompt source dumps (per D029) — pages explain what prompts do

## Verification

- `npm run build` → 104 pages, 0 errors
- `npm run check-links` → exit 0, all internal links valid
- `ls src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## Pipeline Position" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## Variables" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## Used By" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -c '|' src/content/docs/prompts/execute-task.mdx` → at least 18 (header + separator + 16 variable rows)
- `grep "no template variables" src/content/docs/prompts/system.mdx` → matches

## Observability / Diagnostics

**Runtime signals:**
- `npm run build` stdout reports total page count and any MDX parse errors (Mermaid syntax errors surface here as build failures)
- `npm run check-links` reports every broken internal link with file + line context

**Inspection surfaces:**
- Build errors reference the specific `.mdx` file and line number for any MDX/Mermaid parse failures
- `grep -l "## What It Does" src/content/docs/prompts/*.mdx` — quick count to verify section presence
- `grep -c '|' src/content/docs/prompts/execute-task.mdx` — verifies row count in variable table

**Failure visibility:**
- Missing `---` frontmatter fences → Astro/Starlight emits "invalid frontmatter" error with file path
- Mermaid node IDs with hyphens → render as broken diagram (no build error, visible only in browser)
- Broken cross-links → caught by `npm run check-links` but NOT by `npm run build`

**Redaction constraints:** None — all content is documentation, no secrets or credentials.

## Integration Closure

- Upstream surfaces consumed: `content/generated/prompts.json` (S01), 32 stub MDX files (S02), source prompt `.md` files from gsd-pi package
- New wiring introduced in this slice: none (content only, no infrastructure changes)
- What remains before the milestone is truly usable end-to-end: S04 (command page backlinks), S05 (pipeline integration for `npm run update`)

## Tasks

- [x] **T01: Author auto-mode pipeline prompt pages (10 pages)** `est:45m`
  - Why: The 10 auto-mode pipeline prompts are the most complex pages with full pipeline loop diagrams showing neighboring stages. They define the quality bar for all other prompt pages.
  - Files: `src/content/docs/prompts/execute-task.mdx`, `src/content/docs/prompts/research-milestone.mdx`, `src/content/docs/prompts/research-slice.mdx`, `src/content/docs/prompts/plan-milestone.mdx`, `src/content/docs/prompts/plan-slice.mdx`, `src/content/docs/prompts/complete-slice.mdx`, `src/content/docs/prompts/complete-milestone.mdx`, `src/content/docs/prompts/reassess-roadmap.mdx`, `src/content/docs/prompts/replan-slice.mdx`, `src/content/docs/prompts/validate-milestone.mdx`
  - Do: For each of the 10 auto-mode-pipeline prompts, read the source `.md` file from the gsd-pi package and `prompts.json` entry. Write the MDX page following the D056 4-section structure. Mermaid diagrams show 5-8 nodes of the simplified pipeline loop with the current prompt highlighted. Use camelCase node IDs. Links to commands use `../../commands/{slug}/`, links to sibling prompts use `../{slug}/`.
  - Verify: `npm run build` → 104 pages, 0 errors. `grep -l "## What It Does" src/content/docs/prompts/{execute-task,research-milestone,research-slice,plan-milestone,plan-slice,complete-slice,complete-milestone,reassess-roadmap,replan-slice,validate-milestone}.mdx | wc -l` → 10
  - Done when: All 10 auto-mode pipeline MDX files have 4-section authored content, `npm run build` succeeds

- [x] **T02: Author guided variant and foundation prompt pages (9 pages)** `est:30m`
  - Why: The 8 guided variant pages are shorter (many source files are 1-3 lines) and explicitly note their delegation to auto-mode counterparts. The `system` foundation page is a special case with no variables. These reference the auto-mode pages built in T01.
  - Files: `src/content/docs/prompts/guided-execute-task.mdx`, `src/content/docs/prompts/guided-plan-milestone.mdx`, `src/content/docs/prompts/guided-plan-slice.mdx`, `src/content/docs/prompts/guided-research-slice.mdx`, `src/content/docs/prompts/guided-resume-task.mdx`, `src/content/docs/prompts/guided-complete-slice.mdx`, `src/content/docs/prompts/guided-discuss-milestone.mdx`, `src/content/docs/prompts/guided-discuss-slice.mdx`, `src/content/docs/prompts/system.mdx`
  - Do: For each guided variant, write a proportionally brief page noting the delegation pattern ("This is the interactive/guided version of..."). Mermaid diagrams show: `/gsd` → select-unit → **guided-{type}** → user-interaction → artifact-written. For `system`, write a unique page explaining the foundational system prompt with no variable table rows, a diagram showing "Injected into every session" → all prompts build on this, and Used By listing the 3 commands.
  - Verify: `npm run build` → 104 pages, 0 errors. `grep "no template variables" src/content/docs/prompts/system.mdx` → matches
  - Done when: All 9 pages have authored content, `system.mdx` has no variable rows, `npm run build` succeeds

- [ ] **T03: Author command prompt pages (13 pages) and run final validation** `est:40m`
  - Why: The 13 command-invoked prompts have simpler diagrams showing command trigger → prompt → output. This is the final batch — includes the comprehensive `npm run check-links` validation to verify all cross-links across all 32 pages.
  - Files: `src/content/docs/prompts/discuss.mdx`, `src/content/docs/prompts/discuss-headless.mdx`, `src/content/docs/prompts/doctor-heal.mdx`, `src/content/docs/prompts/forensics.mdx`, `src/content/docs/prompts/heal-skill.mdx`, `src/content/docs/prompts/queue.mdx`, `src/content/docs/prompts/quick-task.mdx`, `src/content/docs/prompts/review-migration.mdx`, `src/content/docs/prompts/rewrite-docs.mdx`, `src/content/docs/prompts/run-uat.mdx`, `src/content/docs/prompts/triage-captures.mdx`, `src/content/docs/prompts/workflow-start.mdx`, `src/content/docs/prompts/worktree-merge.mdx`
  - Do: For each command prompt, write the 4-section MDX page. Mermaid diagrams show: command-invocation → prompt → agent-work → output. For `workflow-start` and `worktree-merge` (empty `usedByCommands`), the "Used By" section should note "Not directly invoked by a user-facing command — triggered internally by GSD workflows." After all 13 pages are written, run both `npm run build` and `npm run check-links` as the final gate for the entire slice.
  - Verify: `npm run build` → 104 pages, 0 errors. `npm run check-links` → exit 0. `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l` → 32
  - Done when: All 32 prompt pages have authored content, `npm run build` and `npm run check-links` both pass

## Files Likely Touched

- `src/content/docs/prompts/*.mdx` (all 32 files — content replacement)
