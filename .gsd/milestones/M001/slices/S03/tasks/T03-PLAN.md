---
estimated_steps: 5
estimated_files: 3
---

# T03: Create skills, extensions, and agents reference pages

**Slice:** S03 — Quick-reference pages
**Milestone:** M001

## Description

Build the three remaining reference pages. Each has a different data shape requiring conditional rendering:
- **Skills** (8 items) — some have `objective`, `arguments`, `detection` sections, some don't. The `gh` skill has `parentSkill: "github-workflows"` and should be displayed as a sub-skill.
- **Extensions** (17 items) — have `tools[]` arrays ranging from 0 to 47. Four extensions have 0 tools, two have empty descriptions.
- **Agents** (5 items) — some have `model`/`memory` fields (javascript-pro, typescript-pro), some have `tools` (researcher, scout).

Satisfies R014 (skills docs), R015 (extensions docs), R016 (agents docs).

**Import pattern** (same as T02): ESM imports below frontmatter fence. Path from `src/content/docs/reference/*.mdx` to `content/generated/*.json` is `../../../../content/generated/*.json`. Component imports: `../../../../src/components/ReferenceCard.astro` etc.

## Steps

1. **Create `src/content/docs/reference/skills.mdx`** — Frontmatter: `title: "Skills"`, `description: "8 bundled GSD skills — capabilities, triggers, and workflows."`. Import skills.json and components. Render an intro paragraph. Group rendering: render top-level skills first (those without `parentSkill`), then for `github-workflows`, render its sub-skill `gh` indented or visually nested beneath it. For each skill card:
   - `title={skill.name}`
   - `subtitle={skill.description}`
   - Card body (slot): conditionally render sections:
     - If `skill.objective` exists: render under an `<h4>Objective</h4>` or `<strong>Objective</strong>` heading
     - If `skill.arguments` exists: render under `<strong>Arguments</strong>` — this is often multi-line text, render in a `<div>` with `white-space: pre-wrap` or break into paragraphs
     - If `skill.detection` exists: render under `<strong>Detection</strong>` — same treatment
   - For the `gh` sub-skill: add a badge like "Sub-skill of github-workflows" or render it immediately after github-workflows with visual nesting (indented card or prefixed title)

2. **Create `src/content/docs/reference/extensions.mdx`** — Frontmatter: `title: "Extensions"`, `description: "17 GSD extensions — tools, capabilities, and integrations."`. Import extensions.json, ReferenceCard, ReferenceGrid, and ToolList. Render intro paragraph. For each extension card:
   - `title={ext.name}`
   - `subtitle={ext.description || "No description available"}` — handle 2 extensions with empty descriptions (slash-commands, voice)
   - `badge={ext.tools.length > 0 ? ext.tools.length + " tools" : undefined}` — show tool count as badge
   - Card body: if `ext.tools.length > 0`, render `<ToolList tools={ext.tools} />`. If 0 tools, render a note like "This extension uses hooks or commands instead of registered tools."
   - Consider sorting: extensions with more tools first, or alphabetical.

3. **Create `src/content/docs/reference/agents.mdx`** — Frontmatter: `title: "Agents"`, `description: "5 GSD agents — roles, capabilities, and when they're used."`. Import agents.json and ReferenceCard. Render intro paragraph. For each agent card:
   - `title={agent.name}`
   - `subtitle={agent.description}`
   - Card body: render `agent.summary` as the main content paragraph. Conditionally show:
     - If `agent.model`: "**Model:** {agent.model}"
     - If `agent.memory`: "**Memory:** {agent.memory}"
     - If `agent.tools`: "**Tools:** {agent.tools}"

4. **Build and verify** — Run `npm run build`. Check:
   - All 3 new pages exist in `dist/reference/`
   - Skills page contains all 8 skill names
   - Extensions page contains extension names and tool counts
   - Extensions with 0 tools don't show empty tool lists
   - Agents page contains all 5 agent names
   - `gh` skill is visually associated with `github-workflows`

5. **Fix edge cases** — If any data fields contain characters that break MDX rendering (e.g., curly braces, angle brackets in description text), escape them or render in code blocks. The `arguments` and `detection` fields on skills contain multi-paragraph text — ensure they render as readable content, not one giant block.

## Must-Haves

- [ ] Skills page renders all 8 skills with conditional objective/arguments/detection
- [ ] `gh` skill displayed as sub-skill of `github-workflows` (via parentSkill field)
- [ ] Extensions page renders all 17 extensions with ToolList for those with tools
- [ ] 4 extensions with 0 tools handled gracefully (message, not empty list)
- [ ] 2 extensions with empty descriptions show fallback text
- [ ] Agents page renders all 5 agents with conditional model/memory/tools
- [ ] `npm run build` succeeds with all 3 pages

## Verification

- `npm run build` exits 0
- `find dist/reference/ -name "*.html" | wc -l` ≥ 5 (commands, shortcuts, skills, extensions, agents)
- `grep -c 'debug-like-expert\|frontend-design\|lint\|review\|test\|swiftui\|github-workflows\|gh' dist/reference/skills/index.html` returns ≥8
- `grep 'parentSkill\|sub-skill\|github-workflows' dist/reference/skills/index.html` returns matches (gh is visually linked)
- `grep -c 'browser-tools\|gsd\|mac-tools\|bg-shell\|context7\|subagent\|search-the-web\|mcporter' dist/reference/extensions/index.html` returns ≥8
- `grep 'hooks\|commands instead' dist/reference/extensions/index.html` returns matches (empty-tool extensions handled)
- `grep -c 'scout\|researcher\|worker\|javascript-pro\|typescript-pro' dist/reference/agents/index.html` returns 5

## Inputs

- `content/generated/skills.json` — 8 entries. Schema: `{name, description, path, objective?, arguments?, detection?, parentSkill?}`. The `gh` skill has `parentSkill: "github-workflows"`. Skills with all optional fields: `debug-like-expert` (objective), `lint` (objective, arguments, detection), `review` (objective), `test` (objective). Skills with none: `frontend-design`, `github-workflows`, `swiftui`.
- `content/generated/extensions.json` — 17 entries. Schema: `{name, description, tools: [{name, description}]}`. Tool counts: browser-tools (47), mac-tools (12), gsd (3), async-jobs (3), search-the-web (3), mcporter (3), context7 (2), bg-shell (1), ask-user-questions (1), get-secrets-from-user (1), google-search (1), subagent (1), universal-config (1), remote-questions (0), slash-commands (0), ttsr (0), voice (0). Empty descriptions: slash-commands, voice.
- `content/generated/agents.json` — 5 entries. Schema: `{name, description, summary, model?, memory?, tools?}`. javascript-pro and typescript-pro have model+memory. researcher and scout have tools.
- `src/components/ReferenceCard.astro` — from T01
- `src/components/ReferenceGrid.astro` — from T01
- `src/components/ToolList.astro` — from T01

## Observability Impact

- **Build output**: Three new HTML files appear in `dist/reference/` (skills, extensions, agents). Total reference page count rises from 2 to 5.
- **Skills page content**: `grep -o 'debug-like-expert\|frontend-design\|lint\|review\|test\|swiftui\|github-workflows\|gh' dist/reference/skills/index.html | sort -u | wc -l` should return 8. Sub-skill nesting verifiable via `grep 'Sub-skill' dist/reference/skills/index.html`.
- **Extensions page content**: `grep -o '<details' dist/reference/extensions/index.html | wc -l` returns 17. Empty-tool handling: `grep -c 'hooks or commands instead' dist/reference/extensions/index.html` returns 4.
- **Agents page content**: `grep -o 'scout\|researcher\|worker\|javascript-pro\|typescript-pro' dist/reference/agents/index.html | sort -u | wc -l` returns 5.
- **Failure visibility**: Wrong JSON import path → Astro build fails with MODULE_NOT_FOUND pointing to exact MDX file. Wrong component prop → template compilation error with file and line number. MDX-breaking characters (curly braces in tool descriptions) are safely handled through Astro component props, not inline MDX expressions.

## Expected Output

- `src/content/docs/reference/skills.mdx` — 8 skills with conditional detail sections, gh nested under github-workflows
- `src/content/docs/reference/extensions.mdx` — 17 extensions with ToolList, empty-state handling
- `src/content/docs/reference/agents.mdx` — 5 agents with conditional model/tools/memory info
