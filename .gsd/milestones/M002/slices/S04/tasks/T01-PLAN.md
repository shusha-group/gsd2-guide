---
estimated_steps: 6
estimated_files: 3
---

# T01: Author happy-path recipe pages (fix-a-bug, small-change, new-milestone)

**Slice:** S04 — Core workflow recipes
**Milestone:** M002

## Description

Create the `src/content/docs/recipes/` directory and author 3 recipe MDX files covering the core GSD happy-path workflows. These are the most common patterns: fixing a bug through the full GSD lifecycle, making a small change with `/gsd quick`, and starting a new milestone on an existing project. Each recipe follows a consistent structure and includes a Mermaid flowchart.

Use Cookmate (a recipe-sharing web app) as the example project for scenarios, consistent with the rest of the guide site. The walkthrough at `src/content/docs/user-guide/developing-with-gsd.mdx` establishes the Cookmate context.

## Steps

1. Create `src/content/docs/recipes/` directory.

2. Author `src/content/docs/recipes/fix-a-bug.mdx` — a step-by-step recipe for fixing a bug using the full GSD lifecycle. The scenario: a user reports that Cookmate's search results are case-sensitive. Walk through: `/gsd` → discuss the bug → research → auto-mode → verify fix → summarize. Show `.gsd/` directory trees at the discussion, mid-execution, and completion phases. Include one Mermaid flowchart showing the bug-fix decision flow (report → discuss → research → plan → execute → verify → done).

3. Author `src/content/docs/recipes/small-change.mdx` — a step-by-step recipe for making a quick change without milestone ceremony using `/gsd quick`. The scenario: adding a "back to top" button to Cookmate recipe pages. Walk through: `/gsd quick "add back-to-top button to recipe pages"` → what happens (branch creation, task dir, execution, commit). Show the `.gsd/` directory tree for a quick task. Include one Mermaid flowchart showing the quick-task flow (describe → branch → execute → commit → done). Cross-reference the `/gsd quick` command deep-dive with `[/gsd quick command](../../commands/quick/)`.

4. Author `src/content/docs/recipes/new-milestone.mdx` — a step-by-step recipe for starting a new milestone on an existing project that already has `.gsd/` artifacts. The scenario: adding a social features milestone (M002) to Cookmate after M001 (core recipe CRUD) is complete. Walk through: `/gsd` → discuss new scope → research → plan milestone → plan slices → auto-mode. Show the `.gsd/` directory tree with M001 (completed, with summaries) and M002 (new, in planning). Include one Mermaid flowchart showing the new-milestone flow (start → discuss → research → plan milestone → plan slices → execute → complete).

5. Verify all 3 files exist with correct frontmatter and at least one mermaid code block each.

6. Check for internal link format correctness — cross-references to command pages should use `../../commands/<slug>/` format (per KNOWLEDGE.md Starlight link rules).

## Must-Haves

- [ ] 3 MDX files created in `src/content/docs/recipes/`
- [ ] Each file has YAML frontmatter with `title` and `description`
- [ ] Each recipe follows the structure: When to Use This, Prerequisites, Steps (numbered with commands/trees/terminal output), What Gets Created (directory tree), Flow Diagram (Mermaid)
- [ ] Each recipe has exactly one Mermaid flowchart
- [ ] Mermaid diagrams use dark terminal theme: normal nodes `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`, terminal nodes `fill:#0d180d,stroke:#39ff14,color:#39ff14`, decision diamonds same as normal
- [ ] Cookmate used as the example project
- [ ] Pure MDX — no Starlight component imports
- [ ] Cross-references to command deep-dives use `../../commands/<slug>/` link format

## Verification

- `ls src/content/docs/recipes/*.mdx | wc -l` returns 3
- Each file has `---` frontmatter delimiters with title and description
- `grep -l 'mermaid' src/content/docs/recipes/*.mdx | wc -l` returns 3
- `grep -l 'Cookmate\|cookmate' src/content/docs/recipes/*.mdx | wc -l` — at least 2 (all should reference Cookmate but some may reference it less directly)

## Inputs

- Recipe page structure pattern from S04 research:
  ```
  ---
  title: "Recipe: <Title>"
  description: "<one-line description>"
  ---

  ## When to Use This
  <1-2 paragraphs describing the scenario>

  ## Prerequisites
  <what must exist before starting>

  ## Steps
  <numbered steps with command examples, directory trees, and expected output>

  ## What Gets Created
  <directory tree showing final .gsd/ state>

  ## Flow Diagram
  <Mermaid flowchart showing decision/workflow path>
  ```
- Mermaid theming pattern (use `%%{init:{...}}%%` block at the top of each diagram):
  ```
  %%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1a3a1a', 'primaryTextColor': '#e8f4e8', 'primaryBorderColor': '#39ff14', 'lineColor': '#39ff14', 'secondaryColor': '#0d180d', 'tertiaryColor': '#0d180d', 'background': '#0a0e0a', 'mainBkg': '#1a3a1a', 'nodeBorder': '#39ff14', 'clusterBkg': '#0d180d', 'titleColor': '#39ff14', 'edgeLabelBackground': '#0a0e0a'}}}%%
  ```
  Additionally apply per-node styles for terminal/start/end nodes: `style nodeId fill:#0d180d,stroke:#39ff14,color:#39ff14`
- GSD source material for accuracy (read these before authoring):
  - Fix a bug: study `prompts/discuss.md` and `prompts/execute-task.md` from the installed gsd-pi package at the path resolved by `npm ls -g gsd-pi --parseable`
  - Small change: study `prompts/quick-task.md`
  - New milestone: study `prompts/guided-discuss-milestone.md` and `prompts/plan-milestone.md`
- Existing walkthrough for Cookmate context and style: `src/content/docs/user-guide/developing-with-gsd.mdx`
- Existing command deep-dive for `/gsd quick` pattern: `src/content/docs/commands/quick.mdx`
- Starlight link format: cross-references use `../../commands/<slug>/` (the `../` prefix navigates up from the recipe page's own directory)

## Expected Output

- `src/content/docs/recipes/fix-a-bug.mdx` — ~100-150 lines, bug fix workflow recipe with Mermaid flowchart
- `src/content/docs/recipes/small-change.mdx` — ~100-150 lines, `/gsd quick` workflow recipe with Mermaid flowchart
- `src/content/docs/recipes/new-milestone.mdx` — ~100-150 lines, new milestone on existing project recipe with Mermaid flowchart

## Observability Impact

- **New pages in build output:** After this task, `dist/recipes/fix-a-bug/index.html`, `dist/recipes/small-change/index.html`, and `dist/recipes/new-milestone/index.html` should appear in the build output (though sidebar entries won't be wired until T03).
- **Mermaid rendering:** Each page contains one Mermaid code block. If the Mermaid syntax is invalid, the diagram appears as raw text in the browser — no build error is emitted.
- **Inspection surface:** `grep -l 'mermaid' src/content/docs/recipes/*.mdx | wc -l` confirms Mermaid presence. Frontmatter correctness is checkable with `head -5 src/content/docs/recipes/*.mdx`.
