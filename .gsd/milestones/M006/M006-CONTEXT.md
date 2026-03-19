# M006: Solo Builder's Applied Guide to GSD 2 — Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

## Project Description

An eight-section practitioner's process guide for solo founders and indie hackers who have hit the vibe coding ceiling and are graduating to GSD 2 + Claude Code. Published as a new "Solo Builder's Guide" sidebar group in the existing gsd2-guide Astro/Starlight site on GitHub Pages (shusha-group.github.io/gsd2-guide).

The guide is explicitly a **companion** to the existing gsd2-guide — the phrasebook to its dictionary. It explains *when and how*, not *what*. Every section links out to gsd2-guide for command syntax and configuration detail rather than duplicating it.

## Why This Milestone

The existing gsd2-guide is a command reference and technical deep-dive. There is nothing that explains the full practitioner workflow from the perspective of a solo founder — when to use which command, how to handle the daily mix of big features and small fixes, how to avoid burning money, and how to recover when things go wrong. This guide fills that gap.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Navigate to a "Solo Builder's Guide" section in the gsd2-guide sidebar
- Read a plain-English explanation of why GSD 2 solves the vibe coding ceiling problem
- Follow a complete annotated walkthrough of starting a new project with GSD 2
- Use the Section 4 decision table to instantly know which command to run for any change
- Look up failure modes and their recovery steps when something goes wrong
- Understand cost management, context engineering, and how to build a sustainable weekly rhythm

### Entry point / environment

- Entry point: Browser → https://shusha-group.github.io/gsd2-guide/solo-guide/
- Environment: Static GitHub Pages site
- Live dependencies involved: None — static content only

## Completion Class

- Contract complete means: All 8 section MDX files exist with substantive content, `npm run build` exits 0, `npm run check-links` exits 0
- Integration complete means: New sidebar group registered in `astro.config.mjs`, all cross-references to gsd2-guide pages resolve correctly
- Operational complete means: `npm run update` → push to main → GitHub Actions deploy completes successfully

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Navigate to `/gsd2-guide/solo-guide/` and reach the landing page
- Click through to all 8 sections via sidebar navigation
- Verify the Section 4 decision table renders correctly
- `npm run check-links` exits 0 with no broken internal links

## Risks and Unknowns

- Sidebar registration in `astro.config.mjs` must match the exact file paths in `src/content/docs/solo-guide/` — mismatch causes 404s that fail the link checker
- The `solo-guide/` pages are hand-authored (not pipeline-generated), so they must NOT be added to `page-source-map.json` or the update pipeline will try to regenerate them
- MDX curly braces in template syntax examples need backtick escaping (see KNOWLEDGE.md)
- Cross-reference links to gsd2-guide use Starlight's relative URL format (`../getting-started/` not `/gsd2-guide/getting-started/`)

## Existing Codebase / Prior Art

- `astro.config.mjs` — sidebar is configured here; append a new group object to the array
- `src/content/docs/user-guide/` — pattern for hand-authored MDX sections; follow same frontmatter format
- `src/content/docs/recipes/` — pattern for shorter how-to pages; useful for Section 4's decision table format
- `scripts/manage-pages.mjs` — manages pipeline-generated pages; do NOT add solo-guide pages here
- `src/content/docs/.generated-manifest.json` — do NOT include solo-guide pages; they are not generated

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions.

## Relevant Requirements

- R061 — Landing page and navigation scaffolding
- R062 — Section 4: Daily mix decision framework (build first)
- R063 — Section 7: Failure modes and recovery (build second)
- R064 — Section 2: First project walkthrough
- R065 — Section 3: Brownfield reality
- R066 — Section 1: Why GSD 2
- R067 — Section 5: Context engineering in practice
- R068 — Section 6: Controlling costs
- R069 — Section 8: Building a rhythm
- R070 — Cross-references to gsd2-guide throughout
- R071 — External resources cited and linked
- R072 — Australian spelling and Apple Notes–friendly formatting

## Scope

### In Scope

- Eight content sections as MDX files in `src/content/docs/solo-guide/`
- Index/landing page at `src/content/docs/solo-guide/index.mdx`
- Sidebar group "Solo Builder's Guide" registered in `astro.config.mjs`
- Cross-references to existing gsd2-guide pages
- External citations to Addy Osmani, Esteban Torres, The New Stack, SolveIt
- Australian spelling throughout
- Decision tables that render in plain Markdown

### Out of Scope / Non-Goals

- Modifying the update pipeline (`update.mjs`, `manage-pages.mjs`, `page-source-map.json`)
- Creating a separate standalone site or PDF export
- Translating to other languages
- Interactive components or JavaScript-dependent UI

## Technical Constraints

- Hand-authored MDX only — not pipeline-generated
- Must not appear in `page-source-map.json` (the pipeline would overwrite them)
- Starlight internal links: always use `../page-name/` format with leading `../` and trailing `/`
- Hash fragments after trailing slash: `../page/#section` not `../page#section`
- MDX curly braces in code examples: wrap in backticks to avoid JSX parse errors
- Australian spelling: colour, behaviour, recognise, organise, practise (verb), practice (noun)

## Integration Points

- `astro.config.mjs` — sidebar registration (append new group)
- `src/content/docs/solo-guide/` — new directory, 9 MDX files
- Existing gsd2-guide pages — linked from cross-references (read-only)
- GitHub Pages — deploy via `npm run update` or direct push to main

## Open Questions

- None — scope is fully defined
