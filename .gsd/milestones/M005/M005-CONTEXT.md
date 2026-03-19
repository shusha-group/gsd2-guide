# M005: Prompt Reference Section

**Gathered:** 2026-03-19
**Status:** Ready for planning

## Project Description

A living documentation website for GSD 2 (gsd-pi), built with Astro + Starlight. The site documents GSD commands, concepts, recipes, and reference material. An existing pipeline regenerates pages via `claude -p` when gsd-pi source changes. M005 extends the site with a new Prompts section.

## Why This Milestone

GSD auto-mode is driven by 32 prompt `.md` files in `extensions/gsd/prompts/`. These are the behavioral contracts that each agent session receives — they define what the agent must do, what context it has, and what it must produce. Currently there is no documentation for these prompts anywhere. Users who want to understand what `execute-task` actually instructs the executor, what context `plan-slice` receives, or how `system.md` shapes every session have no reference.

This milestone adds a Prompts section with one page per prompt, Mermaid pipeline diagrams showing where each prompt sits in the auto-mode loop, variable tables describing what context each receives, and bidirectional links connecting prompts to the commands that invoke them.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Navigate to `/prompts/` and browse 32 prompt pages grouped by role (Auto-mode pipeline, Guided variants, Commands, Foundation)
- Open any prompt page and see a Mermaid diagram showing where that prompt sits in the auto-mode pipeline
- See a table of the variables the prompt receives and what context each carries
- Click links from a prompt page to the command pages that invoke it
- Click a "Prompts used" section on command pages (15 of them) to navigate to prompt pages
- Run `npm run update` and have stale prompt pages regenerated automatically when prompt files change

### Entry point / environment

- Entry point: `https://gsd-build.github.io/gsd2-guide/prompts/`
- Environment: GitHub Pages (static site)
- Live dependencies involved: `gsd-pi` npm package (prompt source files)

## Completion Class

- Contract complete means: 32 prompt MDX pages build without errors, all internal links pass check-links.mjs, sidebar has 4 prompt groups, page-source-map.json covers all 32 pages
- Integration complete means: `npm run update` detects staleness and regenerates prompt pages when prompt files change; command pages with prompt dependencies have working backlinks
- Operational complete means: none — static site, no runtime lifecycle

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- `npm run build` succeeds with 32 new prompt pages + all existing pages (97+ total) and 0 broken links
- At least one prompt page visited in browser shows: Mermaid diagram rendered, variable table present, command backlinks resolve
- At least one command page (e.g. `/commands/discuss/`) shows a "Prompts used" section linking to `/prompts/discuss/`
- `npm run update` with a simulated prompt file change detects the prompt page as stale

## Risks and Unknowns

- Variable descriptions require authoring judgment — the source variables are identifiers (`{{taskPlanInline}}`), not human-readable labels. Claude will need to derive descriptions from `auto-prompts.ts` builder functions. Quality varies.
- Pipeline diagrams for `guided-*` prompts are trivially short (some are 1-3 line wrappers) — their pages will be shorter than core pipeline pages. That's fine.
- The `system.md` prompt is special — it has no variables and isn't dispatched by auto-mode; it's injected as a system message. Its diagram needs to reflect this.
- `build-page-map.mjs` and `manage-pages.mjs` were designed for commands only — extending them for prompts requires care not to break existing command logic.

## Existing Codebase / Prior Art

- `scripts/lib/build-page-map.mjs` — maps each command page to its gsd-pi source deps. Needs a new section for prompt pages.
- `scripts/lib/manage-pages.mjs` — detects new/removed commands. Needs analogous logic for prompts (simpler — prompt files are directly 1:1 with pages).
- `content/generated/page-source-map.json` — the runtime artifact. Will grow from 43 to 75 entries after M005.
- `src/content/docs/commands/discuss.mdx` — exemplar command page. Prompt pages should match its quality standard.
- `src/content/docs/commands/auto.mdx` — has the most complex Mermaid diagram in the site. Reference for Mermaid terminal-native styling.
- `/Users/davidspence/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/prompts/` — 32 source prompt files.
- `/Users/davidspence/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/auto-prompts.ts` — where variables are assembled; the primary source for variable descriptions.
- `astro.config.mjs` — sidebar config. Needs a new "Prompts" section with 4 sub-groups.

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R057 — Per-prompt deep-dive pages with pipeline diagrams
- R058 — Variable tables with context descriptions
- R059 — Bidirectional linking between prompts and commands
- R060 — Prompt pages in regeneration pipeline

## Scope

### In Scope

- 32 prompt MDX pages under `src/content/docs/prompts/`
- 4 sidebar groups (Auto-mode pipeline, Guided variants, Commands, Foundation)
- Mermaid pipeline position diagram on every page, terminal-native styling matching auto.mdx
- Variable table on every page with descriptions from studying `auto-prompts.ts`
- "Used by commands" section on each prompt page
- "Prompts used" section added to 15 affected command pages
- `page-source-map.json` entries for all 32 prompt pages
- `build-page-map.mjs` and `manage-pages.mjs` extensions for prompt directory
- A `content/generated/prompts.json` metadata file extracted by `scripts/extract.mjs` (or a dedicated extractor)

### Out of Scope / Non-Goals

- Displaying raw prompt content verbatim on pages (explanation, not source dump — per D029)
- A reference page aggregating all prompts (individual pages are sufficient)
- Interactive prompt explorer or live variable substitution demo
- Prompt authoring guides or how-to-write-prompts documentation

## Technical Constraints

- Mermaid diagrams must use terminal-native styling: `fill:#0d180d,stroke:#39ff14,color:#39ff14` for primary nodes, `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8` for action nodes — matching existing command pages
- Internal links must use `../` prefix format (see KNOWLEDGE.md: Starlight internal link format)
- Prompt pages are MDX files under `src/content/docs/prompts/`
- `page-source-map.json` keys for prompt pages: `prompts/{slug}.mdx` (consistent with `commands/{slug}.mdx` pattern)
- Source dependency paths: `src/resources/extensions/gsd/prompts/{name}.md` (repo-relative, matching manifest.json key format)

## Integration Points

- `scripts/lib/build-page-map.mjs` — add prompt page entries
- `scripts/lib/manage-pages.mjs` — add prompt detection/management
- `astro.config.mjs` — add Prompts sidebar section with 4 sub-groups
- `src/content/docs/commands/*.mdx` — 15 pages need "Prompts used" sections
- `scripts/extract.mjs` — add `extractPrompts()` producing `content/generated/prompts.json`

## Implementation Decisions

- **Prompt grouping taxonomy (4 groups):**
  - Auto-mode pipeline: execute-task, plan-slice, plan-milestone, research-slice, research-milestone, complete-slice, complete-milestone, validate-milestone, reassess-roadmap, replan-slice
  - Guided variants: guided-execute-task, guided-plan-slice, guided-plan-milestone, guided-research-slice, guided-complete-slice, guided-discuss-slice, guided-discuss-milestone, guided-resume-task
  - Commands: discuss, discuss-headless, queue, forensics, triage-captures, doctor-heal, heal-skill, quick-task, run-uat, worktree-merge, workflow-start, rewrite-docs, review-migration
  - Foundation: system
- **`prompts.json` metadata file** extracted at build time — contains name, slug, group, variables (with descriptions), pipeline position, and command backlinks. Claude reads this during page generation rather than re-deriving from source.
- **Variable descriptions authored** from studying `auto-prompts.ts` builder functions — not extracted verbatim
- **`system.md` special case** — no variables, not dispatched by auto-mode, injected as system message. Diagram shows "Injected into every session" rather than a pipeline position.
- **Prompt page structure** (per D029 — explanation, not source dump):
  1. What It Does (prose)
  2. Pipeline Position (Mermaid diagram)
  3. Variables (table: name, description, always/conditional)
  4. Used By (links to commands that invoke this prompt)
- **Guided variant pages** are shorter — they delegate to full templates. The diagram and description reflect the delegation.
- **15 command pages** affected by backlinks — identified from page-source-map.json prompt entries.
