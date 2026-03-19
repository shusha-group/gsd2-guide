---
estimated_steps: 4
estimated_files: 13
---

# T03: Author command prompt pages (13 pages) and run final validation

**Slice:** S03 — Prompt page content generation
**Milestone:** M005

## Description

Write authored MDX content for the 13 command-invoked prompts, replacing S02 scaffold stubs. These prompts are invoked directly by user-facing slash commands (not the auto-mode pipeline loop), so their Mermaid diagrams show a simpler pattern: command invocation → prompt dispatch → agent work → output.

Two prompts (`workflow-start` and `worktree-merge`) have empty `usedByCommands` arrays — they are triggered internally by GSD workflows, not by user-facing commands. Their "Used By" sections should note this explicitly.

After writing all 13 pages, run the full validation suite: `npm run build` + `npm run check-links` to verify all 32 prompt pages (including those from T01 and T02) have valid cross-links.

## Steps

1. Read `content/generated/prompts.json` to get the 13 command-group entries (`group === "commands"`). Note variables, pipelinePosition, and usedByCommands for each.

2. For each command prompt, read the source `.md` file from `/Users/davidspence/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/prompts/{name}.md`. Use this to understand the behavioral contract for the "What It Does" section.

3. Write each of the 13 command prompt MDX files at `src/content/docs/prompts/{slug}.mdx`:
   - **What It Does:** 2-3 paragraphs explaining the behavioral contract. These prompts are each invoked by a specific command, not the auto-mode loop.
   - **Pipeline Position:** Mermaid diagram showing: command → prompt → agent-work → output. Keep diagrams 4-6 nodes. Use camelCase node IDs. Current prompt highlighted with `fill:#0d180d,stroke:#39ff14,color:#39ff14`.
   - **Variables:** Table from `prompts.json` data.
   - **Used By:** Links to command pages. For most prompts, this is 1-3 commands. Special cases:
     - `discuss` → used by `gsd`, `discuss`, `steer`
     - `triage-captures` → used by `capture`, `triage`
     - `workflow-start` → empty usedByCommands — write: "Not directly invoked by a user-facing command — triggered internally by GSD workflows."
     - `worktree-merge` → empty usedByCommands — write the same internal trigger note.
     - `rewrite-docs` → used by `auto`
     - `run-uat` → used by `auto`

   The 13 prompts:
   1. `discuss` (7 vars, used by: gsd, discuss, steer)
   2. `discuss-headless` (7 vars, used by: headless)
   3. `doctor-heal` (4 vars, used by: doctor)
   4. `forensics` (3 vars, used by: forensics)
   5. `heal-skill` (4 vars, used by: skill-health)
   6. `queue` (4 vars, used by: queue)
   7. `quick-task` (6 vars, used by: quick)
   8. `review-migration` (3 vars, used by: migrate)
   9. `rewrite-docs` (5 vars, used by: auto)
   10. `run-uat` (7 vars, used by: auto)
   11. `triage-captures` (3 vars, used by: capture, triage)
   12. `workflow-start` (10 vars, used by: none — internal)
   13. `worktree-merge` (11 vars, used by: none — internal)

4. After writing all 13 pages, run the full validation suite:
   - `npm run build` → 104 pages, 0 errors
   - `npm run check-links` → exit 0 (validates ALL internal links across all 32 prompt pages plus command pages)
   - Spot checks: `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l` → 32

**Critical formatting rules (same as T01/T02):**
- Mermaid node IDs: camelCase only (no hyphens)
- Command links: `../../commands/{slug}/`
- Sibling prompt links: `../{slug}/`
- Frontmatter `description` updated to a meaningful one-liner
- No raw prompt source dumps (D029)

## Must-Haves

- [ ] All 13 command-group MDX files have 4-section authored content
- [ ] `workflow-start.mdx` and `worktree-merge.mdx` have "not directly invoked" note in Used By
- [ ] Mermaid node IDs use camelCase
- [ ] Cross-links use correct relative paths
- [ ] `npm run build` → 104 pages, 0 errors
- [ ] `npm run check-links` → exit 0 (all internal links valid across all 32 prompt pages)

## Verification

- `npm run build` → 104 pages, 0 errors
- `npm run check-links` → exit 0
- `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l` → 32 (all pages, not just this task's 13)
- `grep -l "## Pipeline Position" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## Variables" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## Used By" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep "Not directly invoked" src/content/docs/prompts/workflow-start.mdx` → matches
- `grep "Not directly invoked" src/content/docs/prompts/worktree-merge.mdx` → matches

## Inputs

- `content/generated/prompts.json` — metadata for all 32 prompts (filter to `group === "commands"`)
- Source prompt files at `/Users/davidspence/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/prompts/*.md`
- T01 and T02's completed pages — for cross-link validation during `npm run check-links`

## Expected Output

- 13 fully authored command prompt MDX files in `src/content/docs/prompts/`
- `npm run build` → 104 pages, 0 errors
- `npm run check-links` → exit 0 (comprehensive cross-link validation)
- All 32 prompt pages now have authored content — slice S03 is complete
