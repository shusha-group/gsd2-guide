# M005: Prompt Reference Section

**Vision:** 32 per-prompt deep-dive pages documenting GSD's behavioral contracts — what each prompt does, where it sits in the auto-mode pipeline (Mermaid diagram), what variables it receives (with context descriptions), and which commands invoke it. Bidirectional links between prompt pages and command pages. Grouped into 4 role-based sidebar sections. Wired into the `npm run update` regeneration pipeline.

## Success Criteria

- All 32 prompt files in `extensions/gsd/prompts/` have a corresponding MDX page at `/prompts/{slug}/`
- Every prompt page renders a Mermaid pipeline position diagram with terminal-native styling
- Every prompt page has a variable table with plain-language descriptions derived from `auto-prompts.ts`
- Every prompt page links to the commands that invoke it
- 15 command pages have a "Prompts used" section with links to their prompt pages
- `npm run build` succeeds with all prompt pages and 0 broken links
- `page-source-map.json` covers all 32 prompt pages so staleness detection works

## Key Risks / Unknowns

- Variable description quality — identifiers like `{{taskPlanInline}}` require reading `auto-prompts.ts` builder functions to describe clearly. Mitigated by `prompts.json` authoring in S01 before generation.
- `build-page-map.mjs` / `manage-pages.mjs` extension — these scripts have command-specific logic that must not break when extended for prompts. Mitigated by S01 producing a clean `prompts.json` boundary that S05 reads.

## Proof Strategy

- Variable description quality → retire in S03 by Claude generating a complete `execute-task` page that a reviewer can inspect for accurate descriptions
- Pipeline infrastructure extension → retire in S05 by running `npm run update` end-to-end with a simulated prompt change and observing stale detection + regeneration

## Verification Classes

- Contract verification: `npm run build` exits 0, `npm run check-links` exits 0, `grep -r "prompts/" content/generated/page-source-map.json` shows 32 entries
- Integration verification: `npm run update` detects a prompt page as stale when its source `.md` file changes; `/commands/discuss/` page shows "Prompts used" section
- Operational verification: none
- UAT / human verification: visually browse one prompt page in browser — confirm Mermaid diagram renders, variable table is present, links resolve

## Milestone Definition of Done

This milestone is complete only when all are true:

- All 32 prompt MDX pages exist under `src/content/docs/prompts/`
- Astro sidebar in `astro.config.mjs` has a "Prompts" group with 4 sub-groups (32 entries total)
- `content/generated/page-source-map.json` has 32 new entries (`prompts/*.mdx`)
- `npm run build` produces 97+ pages with 0 errors
- `npm run check-links` exits 0 (all internal links valid including new prompt↔command cross-links)
- 15 command pages have "Prompts used" sections with working links
- End-to-end: modifying a prompt `.md` file and running `npm run update` triggers regeneration of the affected prompt page

## Requirement Coverage

- Covers: R057, R058, R059, R060
- Partially covers: R051 (extends page-source-map coverage)
- Leaves for later: none
- Orphan risks: none

## Slices

- [x] **S01: Prompt metadata extraction** `risk:high` `depends:[]`
  > After this: `content/generated/prompts.json` exists with all 32 prompts — name, slug, group, variables list, pipeline position, and command backlinks. Verified by running `scripts/extract.mjs` and inspecting the output.

- [ ] **S02: Page scaffold, sidebar, and source map** `risk:medium` `depends:[S01]`
  > After this: 32 stub MDX pages exist in `src/content/docs/prompts/`, all 4 sidebar groups are registered in `astro.config.mjs`, and `page-source-map.json` has 32 new entries. `npm run build` succeeds (stubs, no real content yet).

- [ ] **S03: Prompt page content generation** `risk:medium` `depends:[S01,S02]`
  > After this: All 32 prompt pages have real authored content — prose description, Mermaid pipeline diagram, variable table, "Used by commands" section. `npm run build` and `npm run check-links` pass.

- [ ] **S04: Command page backlinks** `risk:low` `depends:[S02]`
  > After this: 15 command pages have a "Prompts used" section with links to the prompt pages that command invokes. All cross-links validated by `npm run check-links`.

- [ ] **S05: Pipeline integration** `risk:low` `depends:[S02,S04]`
  > After this: `manage-pages.mjs` extended for prompt directory. `npm run update` end-to-end detects a prompt page as stale when its `.md` source changes and regenerates it via `claude -p`. Full pipeline exits 0.

<!--
  Format rules (parsers depend on this exact structure):
  - Checkbox line: - [ ] **S01: Title** `risk:high|medium|low` `depends:[S01,S02]`
  - Demo line:     >  After this: one sentence showing what's demoable
  - Mark done:     change [ ] to [x]
-->

## Boundary Map

### S01 → S02, S03, S04, S05

Produces:
- `content/generated/prompts.json` — array of 32 entries, each with: `name` (filename without .md), `slug` (kebab-case), `group` (one of: "auto-mode-pipeline" | "guided-variants" | "commands" | "foundation"), `variables` (array of `{ name, description, required }`), `pipelinePosition` (string description of where in the auto-mode loop this fires), `usedByCommands` (array of command slugs that invoke this prompt)
- Grouping taxonomy: 4 canonical group names and which of the 32 prompts belongs to each

Consumes:
- nothing (first slice)

### S02 → S03, S04, S05

Produces:
- `src/content/docs/prompts/{slug}.mdx` — 32 stub MDX files (valid frontmatter, placeholder sections, no real content)
- `astro.config.mjs` — updated with Prompts sidebar section containing 4 sub-groups and 32 entries
- `content/generated/page-source-map.json` — 32 new entries mapping `prompts/{slug}.mdx` → `src/resources/extensions/gsd/prompts/{name}.md`
- `scripts/lib/build-page-map.mjs` — updated with prompt page entries

Consumes from S01:
- `prompts.json` → slug list, group taxonomy, command links (for sidebar ordering and page-source-map keys)

### S02 → S04

Produces:
- Confirmed prompt page URL slugs — `/prompts/{slug}/` — that command pages can safely link to

Consumes from S01:
- `prompts.json` → `usedByCommands` reverse mapping

### S03 → (terminal — ships real pages)

Produces:
- 32 fully authored MDX pages replacing the S02 stubs — each with: What It Does section, Pipeline Position Mermaid diagram (terminal-native styling), Variables table (name + description + required), Used By section with links

Consumes from S01:
- `prompts.json` → variable list with descriptions, pipeline position, usedByCommands

Consumes from S02:
- Stub page structure to replace

### S04 → (terminal — updates command pages)

Produces:
- 15 updated command MDX pages under `src/content/docs/commands/` — each gains a "Prompts used" section at the end listing prompt page links
- Command pages affected: gsd, auto, discuss, doctor, forensics, capture, triage, queue, hooks, skill-health, steer, config, knowledge, quick, headless (exact 15 determined from page-source-map.json prompt entries)

Consumes from S02:
- Confirmed prompt page slugs so command pages link to real URLs

### S05 → (terminal — pipeline integration)

Produces:
- `scripts/lib/manage-pages.mjs` — extended with `detectNewAndRemovedPrompts()`, `addPromptSidebarEntry()`, `removePromptPage()` analogous to command equivalents
- Verified: `npm run update` end-to-end with simulated prompt change triggers regeneration

Consumes from S02:
- `page-source-map.json` with prompt entries (pipeline reads this for stale detection)
