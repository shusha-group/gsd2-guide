---
estimated_steps: 8
estimated_files: 2
---

# T02: Author the "Developing with GSD" end-to-end walkthrough

**Slice:** S01 — Site restructure and end-to-end walkthrough
**Milestone:** M002

## Description

Write the centerpiece content page — a comprehensive walkthrough following a real example project through every GSD phase (discuss → research → plan → execute → verify → summarize → complete). Study the GSD source code for accuracy (auto-dispatch.ts, commands.ts, prompts/, state.ts) but write for humans with explanations, Mermaid diagrams, ASCII directory trees, and annotated terminal examples. Not prompt regurgitation — teaching content.

## Steps

1. Read GSD source for accuracy: `auto-dispatch.ts` (dispatch rule names and state machine flow), `commands.ts` (command routing), `prompts/discuss.md` (what the discuss phase does), `prompts/research-milestone.md` and `prompts/research-slice.md` (research phase), `prompts/plan-milestone.md` and `prompts/plan-slice.md` (planning phase), `prompts/execute-task.md` (execution phase), `prompts/complete-slice.md` (completion phase), `state.ts` (how state is derived from disk files).
2. Create `src/content/docs/user-guide/developing-with-gsd.mdx` with YAML frontmatter.
3. Write the Overview section: what GSD is, the milestone→slice→task hierarchy, and a Mermaid flowchart showing the full lifecycle (discuss → research → plan → execute → verify → summarize → advance).
4. Write the Starting section: running `/gsd` for the first time, what the wizard asks, choosing a model, the contextual routing that happens. Show what the user sees in their terminal.
5. Write the Discussion and Research sections: what `/gsd discuss` asks and produces (M###-CONTEXT.md), what research investigates and produces (M###-RESEARCH.md). Show example directory tree after discussion.
6. Write the Planning section: how milestones decompose into slices, how slices decompose into tasks, what the roadmap and plan files look like. Show `.gsd/` directory tree after planning with all the artifacts.
7. Write the Execution section: what `/gsd auto` does step-by-step — the dispatch state machine, fresh session per unit, how tasks execute, what files appear during execution. Show `.gsd/` directory tree mid-execution. Include a Mermaid diagram of the auto-mode dispatch flow.
8. Write the Completion section: verification, summarization, advancement, what happens when a slice completes, what happens when a milestone completes. Show final `.gsd/` directory tree. Add the walkthrough to the sidebar under "User Guide" in `astro.config.mjs`. Run `npm run build` and verify.

## Must-Haves

- [ ] `src/content/docs/user-guide/developing-with-gsd.mdx` exists with >200 lines
- [ ] Walkthrough covers all GSD phases: discuss, research, plan, execute, verify, summarize, complete
- [ ] Contains at least 2 Mermaid diagrams (lifecycle overview + auto-mode dispatch)
- [ ] Contains at least 3 ASCII directory trees showing `.gsd/` state at different phases
- [ ] Contains annotated terminal output examples
- [ ] Uses a concrete example project (not abstract)
- [ ] `npm run build` exits 0
- [ ] `npm run check-links` exits 0

## Verification

- `npm run build` exits 0
- `wc -l src/content/docs/user-guide/developing-with-gsd.mdx` shows >200
- `grep -c 'mermaid' src/content/docs/user-guide/developing-with-gsd.mdx` shows ≥2
- `grep -c '\.gsd/' src/content/docs/user-guide/developing-with-gsd.mdx` shows ≥10 (directory tree references)

## Inputs

- GSD source at `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/` — read for accuracy
- T01 output — restructured sidebar with User Guide section
- D029 — "don't regurgitate the prompt back" — explanations and examples, not source dumps
- D030 — use a real project example

## Expected Output

- `src/content/docs/user-guide/developing-with-gsd.mdx` — end-to-end walkthrough
- `astro.config.mjs` — walkthrough added to User Guide sidebar section
