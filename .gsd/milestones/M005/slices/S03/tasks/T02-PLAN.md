---
estimated_steps: 4
estimated_files: 9
---

# T02: Author guided variant and foundation prompt pages (9 pages)

**Slice:** S03 — Prompt page content generation
**Milestone:** M005

## Description

Write authored MDX content for the 8 guided-variant prompts and the 1 foundation prompt (`system`), replacing S02 scaffold stubs. Guided variants are shorter pages — many source files are 1-3 lines because they literally delegate to the auto-mode version. The `system` prompt is a special case: no variables, no pipeline dispatch position, used as the system message in every session.

The guided variant pages should be proportionally brief and explicitly note their delegation pattern. Pages for prompts with 1-3 line source files (guided-execute-task, guided-complete-slice, guided-plan-slice, guided-resume-task) should be ~15-25 lines of MDX body — don't pad with invented detail.

## Steps

1. Read `content/generated/prompts.json` to get entries for the 8 guided-variants (`group === "guided-variants"`) and the 1 foundation prompt (`group === "foundation"`). Note variables, pipelinePosition, and usedByCommands for each.

2. For each guided variant prompt, read the source `.md` file from `/Users/davidspence/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/prompts/{name}.md`. Note: five of these files are 1-3 lines (they literally just delegate). For those, the "What It Does" prose should say this explicitly: "This is a compact dispatch wrapper — the guided session loads the same templates as auto-mode but adds interactive checkpoints."

3. Write each of the 8 guided variant MDX files at `src/content/docs/prompts/{slug}.mdx`:
   - **What It Does:** Explain this is the interactive/guided version of the corresponding auto-mode prompt. Reference the auto-mode page with a link: `../{auto-mode-slug}/`. For 1-3 line source files, note the delegation pattern. For longer source files (guided-discuss-milestone at 108 lines, guided-discuss-slice at 61 lines, guided-plan-milestone at 30 lines, guided-research-slice at 15 lines), provide more detailed prose about the interactive workflow.
   - **Pipeline Position:** Mermaid diagram showing: `/gsd` → select-unit → **guided-{type}** → user-interaction → artifact-written (5 nodes). Use camelCase node IDs. The current prompt node gets `fill:#0d180d,stroke:#39ff14,color:#39ff14`, others get `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`.
   - **Variables:** Table from `prompts.json` data. Even delegation wrappers have 2-5 variables.
   - **Used By:** All 8 guided variants are invoked by `/gsd` — link to `../../commands/gsd/`.

4. Write `system.mdx` — the foundation prompt:
   - **What It Does:** Explain that `system` is the foundational persona prompt injected into every GSD agent session. It establishes the agent's identity, base capabilities, behavioral constraints, and coding guidelines. All other prompts build on top of what `system` sets. Read the source file (220 lines) to understand its content — it covers who the agent is, what tools it has, how to use them, and what conventions to follow.
   - **Pipeline Position:** Mermaid diagram showing: `SystemPrompt["system"]` → with arrows to representative prompt nodes showing "all prompts build on this." Use a simplified radiating pattern, not a linear flow.
   - **Variables:** Replace the table with a note: "This prompt has no template variables — it is used as-is."
   - **Used By:** Links to the 3 commands: `/gsd` (`../../commands/gsd/`), `/gsd config` (`../../commands/config/`), `/gsd knowledge` (`../../commands/knowledge/`).

5. Run `npm run build` to verify all 9 pages build correctly (104 pages, 0 errors).

**Critical formatting rules (same as T01):**
- Mermaid node IDs: camelCase only (no hyphens). E.g. `GuidedExecuteTask` not `guided-execute-task`.
- Command links: `../../commands/{slug}/`
- Sibling prompt links: `../{slug}/`
- Frontmatter `description` updated to a meaningful one-liner
- No raw prompt source dumps (D029)

## Must-Haves

- [ ] All 8 guided-variant MDX files have 4-section authored content
- [ ] `system.mdx` has "What It Does", "Pipeline Position", "Variables" (with no-variables note), and "Used By" sections
- [ ] Guided variant pages for 1-3 line source files are proportionally brief (~15-25 lines of body)
- [ ] Mermaid node IDs use camelCase
- [ ] Cross-links use correct relative paths
- [ ] `npm run build` → 104 pages, 0 errors

## Verification

- `npm run build` → 104 pages, 0 errors
- `grep -l "## What It Does" src/content/docs/prompts/{guided-execute-task,guided-plan-milestone,guided-plan-slice,guided-research-slice,guided-resume-task,guided-complete-slice,guided-discuss-milestone,guided-discuss-slice,system}.mdx | wc -l` → 9
- `grep "no template variables" src/content/docs/prompts/system.mdx` → matches
- `grep -c '|' src/content/docs/prompts/system.mdx` → 0 (no variable table rows, just a prose note)

## Inputs

- `content/generated/prompts.json` — metadata for all 32 prompts (filter to `group === "guided-variants"` and `group === "foundation"`)
- Source prompt files at `/Users/davidspence/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/prompts/*.md`
- T01's completed auto-mode-pipeline pages — for cross-reference links from guided variants to their auto-mode counterparts (e.g., `guided-execute-task` links to `../execute-task/`)

## Expected Output

- `src/content/docs/prompts/guided-execute-task.mdx` — brief, notes delegation
- `src/content/docs/prompts/guided-plan-milestone.mdx` — moderate length (30-line source)
- `src/content/docs/prompts/guided-plan-slice.mdx` — brief, notes delegation
- `src/content/docs/prompts/guided-research-slice.mdx` — moderate length (15-line source)
- `src/content/docs/prompts/guided-resume-task.mdx` — brief, notes delegation (1-line source)
- `src/content/docs/prompts/guided-complete-slice.mdx` — brief, notes delegation (3-line source)
- `src/content/docs/prompts/guided-discuss-milestone.mdx` — fuller content (108-line source)
- `src/content/docs/prompts/guided-discuss-slice.mdx` — fuller content (61-line source)
- `src/content/docs/prompts/system.mdx` — no variable rows, foundational persona explanation
- `npm run build` passing with 104 pages
