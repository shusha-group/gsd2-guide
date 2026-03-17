---
estimated_steps: 5
estimated_files: 3
---

# T02: Author recovery and collaboration recipe pages (uat-failures, error-recovery, working-in-teams)

**Slice:** S04 — Core workflow recipes
**Milestone:** M002

## Description

Author the remaining 3 recipe MDX files covering GSD's recovery and collaboration workflows. These recipes address what happens when things go wrong (UAT failures that trigger replanning, errors and crashes that need doctor/forensics) and how teams work together on the same project. These are the "what if" answers users need after learning the happy path in T01's recipes.

Same authoring pattern as T01 — consistent structure, Mermaid flowcharts with dark terminal theme, Cookmate scenarios, pure MDX.

## Steps

1. Author `src/content/docs/recipes/uat-failures.mdx` — a step-by-step recipe for handling UAT failures. The scenario: Cookmate's recipe search slice passes its tasks but fails UAT because search doesn't handle special characters in recipe names. Walk through: auto-mode runs UAT → UAT fails → GSD triggers replan → replanned slice re-executes → passes UAT. Show `.gsd/` directory trees at the UAT failure point (with UAT file showing failures) and after successful re-execution. Include one Mermaid flowchart showing the UAT failure → replan → re-execute → pass cycle. Study GSD source for accuracy: `prompts/run-uat.md` (UAT execution), `prompts/replan-slice.md` (replan flow), and the auto-dispatch UAT/replan logic.

2. Author `src/content/docs/recipes/error-recovery.mdx` — a step-by-step recipe for recovering from errors using `/gsd doctor` and `/gsd forensics`. The scenario: GSD auto-mode crashes mid-task on Cookmate (e.g., the agent hits an API limit or a tool error). Walk through: recognize the crash (stale lock, incomplete task), run `/gsd doctor` for automatic diagnosis and healing, use `/gsd forensics` for deep investigation if doctor can't fix it, understand crash recovery locks, and manual state repair as last resort. Show `.gsd/` state with a stuck task and STATE.md showing error state. Include one Mermaid flowchart showing the error recovery decision tree (detect error → doctor → healed? → yes: resume / no: forensics → manual repair). Cross-reference `/gsd doctor` and `/gsd forensics` command pages.

3. Author `src/content/docs/recipes/working-in-teams.mdx` — a step-by-step recipe for team collaboration with GSD. The scenario: two developers working on Cookmate simultaneously — one on auth (M001) and one on recipe search (M002). Walk through: setting up team mode (`/gsd prefs` → `mode: team`), unique milestone IDs preventing conflicts, push branches for each milestone, pre-merge checks, and how `.gsd/` state stays isolated per milestone worktree. Show the `.gsd/` and git branch structure for concurrent milestones. Include one Mermaid flowchart showing the team workflow (dev A starts M001 → dev B starts M002 → both push branches → pre-merge checks → merge). Cross-reference `/gsd prefs` and the existing working-in-teams guide page.

4. Verify all 3 files exist with correct frontmatter and at least one mermaid code block each.

5. Check cross-references use `../../commands/<slug>/` link format for command pages and `../../<slug>/` for other guide pages.

## Must-Haves

- [ ] 3 MDX files created in `src/content/docs/recipes/`
- [ ] Each file has YAML frontmatter with `title` and `description`
- [ ] Each recipe follows the structure: When to Use This, Prerequisites, Steps (numbered with commands/trees/terminal output), What Gets Created (directory tree), Flow Diagram (Mermaid)
- [ ] Each recipe has exactly one Mermaid flowchart
- [ ] Mermaid diagrams use dark terminal theme: normal nodes `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`, terminal nodes `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- [ ] Cookmate used as the example project
- [ ] Pure MDX — no Starlight component imports
- [ ] Cross-references to command deep-dives use `../../commands/<slug>/` link format

## Verification

- `ls src/content/docs/recipes/*.mdx | wc -l` returns 6 (3 from T01 + 3 from T02)
- Each T02 file has `---` frontmatter delimiters with title and description
- `grep -l 'mermaid' src/content/docs/recipes/uat-failures.mdx src/content/docs/recipes/error-recovery.mdx src/content/docs/recipes/working-in-teams.mdx | wc -l` returns 3

## Inputs

- T01's 3 recipe files in `src/content/docs/recipes/` — follow the same structure and style
- Recipe page structure pattern (same as T01):
  ```
  ---
  title: "Recipe: <Title>"
  description: "<one-line description>"
  ---

  ## When to Use This
  ## Prerequisites
  ## Steps
  ## What Gets Created
  ## Flow Diagram
  ```
- Mermaid theming (same as T01):
  ```
  %%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1a3a1a', 'primaryTextColor': '#e8f4e8', 'primaryBorderColor': '#39ff14', 'lineColor': '#39ff14', 'secondaryColor': '#0d180d', 'tertiaryColor': '#0d180d', 'background': '#0a0e0a', 'mainBkg': '#1a3a1a', 'nodeBorder': '#39ff14', 'clusterBkg': '#0d180d', 'titleColor': '#39ff14', 'edgeLabelBackground': '#0a0e0a'}}}%%
  ```
  Per-node styles for terminal nodes: `style nodeId fill:#0d180d,stroke:#39ff14,color:#39ff14`
- GSD source material for accuracy (read these before authoring):
  - UAT failures: `prompts/run-uat.md`, `prompts/replan-slice.md` from installed gsd-pi package (resolve via `npm ls -g gsd-pi --parseable`)
  - Error recovery: `prompts/doctor-heal.md`, `prompts/forensics.md`
  - Working in teams: existing guide page at `src/content/docs/working-in-teams.md` (generated from GitHub docs)
- Starlight link format: cross-references use `../../commands/<slug>/` for command pages, `../../<slug>/` for guide pages

## Expected Output

- `src/content/docs/recipes/uat-failures.mdx` — ~100-150 lines, UAT failure/replan recipe with Mermaid flowchart
- `src/content/docs/recipes/error-recovery.mdx` — ~100-150 lines, doctor/forensics/crash recovery recipe with Mermaid flowchart
- `src/content/docs/recipes/working-in-teams.mdx` — ~100-150 lines, team collaboration recipe with Mermaid flowchart
