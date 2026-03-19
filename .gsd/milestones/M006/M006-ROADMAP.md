# M006: Solo Builder's Applied Guide to GSD 2

**Vision:** A practitioner's process guide for solo founders graduating from vibe coding platforms to GSD 2 + Claude Code. Eight sections covering the full workflow — from understanding why GSD 2 exists through daily decision-making, brownfield onboarding, cost management, failure recovery, and building a sustainable rhythm. Published as a "Solo Builder's Guide" sidebar group in the existing gsd2-guide site.

## Success Criteria

- All 8 sections live at `/gsd2-guide/solo-guide/{section}/` and navigable via sidebar
- Section 4 decision table is complete and renders correctly
- All cross-references to gsd2-guide pages resolve (link checker passes)
- External citations (Addy Osmani, Esteban Torres, New Stack) are linked
- `npm run build` exits 0; `npm run check-links` exits 0
- Australian spelling throughout
- GitHub Pages deployment succeeds via `npm run update`

## Key Risks / Unknowns

- Sidebar path mismatch — `astro.config.mjs` links must exactly match `src/content/docs/solo-guide/` filenames
- Pipeline contamination — solo-guide pages must NOT appear in `page-source-map.json` or the update pipeline will overwrite them
- Cross-reference link format — Starlight requires `../page-name/` format; wrong format causes broken links that fail the checker

## Proof Strategy

- Sidebar path mismatch → retire in S01 by running `npm run build` and confirming all 9 pages compile without 404
- Pipeline contamination → retire in S01 by confirming `page-source-map.json` unchanged after adding files
- Cross-reference format → retire in S02 by running `npm run check-links` after Section 4 is written with its cross-references

## Verification Classes

- Contract verification: `npm run build` exits 0; `npm run check-links` exits 0; all 9 files exist with >100 lines each
- Integration verification: browser navigate to `/gsd2-guide/solo-guide/` and click through sidebar to each section
- Operational verification: `npm run update` → GitHub Actions deploy.yml completes → pages live on GitHub Pages
- UAT / human verification: Read Section 4 decision table and confirm it matches actual `/gsd quick` flag behaviour

## Milestone Definition of Done

This milestone is complete only when all are true:

- All 9 MDX files exist in `src/content/docs/solo-guide/` with substantive content (not stubs)
- Sidebar group "Solo Builder's Guide" registered in `astro.config.mjs` with all 9 links
- `npm run build` exits 0 (no MDX parse errors, no missing frontmatter)
- `npm run check-links` exits 0 (all internal cross-references valid)
- `npm run update` → push → GitHub Actions deploy succeeds
- `page-source-map.json` is unchanged (solo-guide pages not in pipeline)
- Success criteria re-checked against live GitHub Pages deployment

## Requirement Coverage

- Covers: R061, R062, R063, R064, R065, R066, R067, R068, R069, R070, R071, R072
- Partially covers: R051 (unrelated, pre-existing active requirement)
- Leaves for later: none
- Orphan risks: none

## Slices

- [x] **S01: Guide Structure & Navigation** `risk:low` `depends:[]`
  > After this: A "Solo Builder's Guide" sidebar group exists with a landing/index page. `npm run build` passes. The pipeline is unaffected.

- [x] **S02: Section 4 — The Daily Mix** `risk:medium` `depends:[S01]`
  > After this: The decision framework, flag explanations in plain English, and the decision table are live. `npm run check-links` passes with Section 4's cross-references.

- [x] **S03: Section 7 — When Things Go Wrong** `risk:medium` `depends:[S01]`
  > After this: Failure modes (stuck detection, crash recovery, loose must-haves, state repair, timeouts) are documented in plain English with clear recovery steps.

- [ ] **S04: Section 2 — Your First Project** `risk:high` `depends:[S01]`
  > After this: The complete annotated new-project walkthrough is live — discussion phase, roadmap reading, auto mode first run, verification, and completion — with external citations to Addy Osmani and Esteban Torres.

- [ ] **S05: Section 3 — Brownfield Reality** `risk:medium` `depends:[S01]`
  > After this: Guidance for starting GSD 2 on an existing codebase is published — agent-instructions.md, issue tracker mapping, the handoff spec approach, and constraining GSD.

- [ ] **S06: Section 1 — Why GSD 2** `risk:medium` `depends:[S01]`
  > After this: The context window ceiling argument, cost comparison, and technical director framing are published. Reads as the compelling entry point for a sceptical vibe coder.

- [ ] **S07: Sections 5 & 6 — Context Engineering + Costs** `risk:medium` `depends:[S01]`
  > After this: Both the context engineering in practice section and the cost management section are live and cross-referenced correctly.

- [ ] **S08: Section 8 — Building a Rhythm** `risk:low` `depends:[S01]`
  > After this: The full guide is complete and navigable end-to-end. All 8 sections live, sidebar complete, `npm run update` deploys successfully to GitHub Pages.

<!--
  Planning quality rules honoured:
  - Every slice ships real, substantive content — no research-only or foundation-only slices
  - S01 is low-risk structural work that proves navigation before content is written
  - S02 is built first (highest value, lowest existing documentation) — risk:medium because Section 4 must accurately reflect actual /gsd quick flag behaviour
  - S04 is risk:high because it's the longest and most citiation-heavy section
  - S08 closes the milestone with the completion slice that proves the full guide works end-to-end
-->

## Boundary Map

### S01 → S02–S08

Produces:
- `src/content/docs/solo-guide/index.mdx` — landing page with links to all 8 sections
- `astro.config.mjs` sidebar entry for "Solo Builder's Guide" group with 9 links
- Directory structure: `src/content/docs/solo-guide/` with stub or placeholder for each section

Consumes:
- nothing (first slice)

### S02 → S08

Produces:
- `src/content/docs/solo-guide/daily-mix.mdx` — decision table, flag explanations, interruption handling
- Cross-reference links to `/commands/quick/`, `/auto-mode/`, `/git-strategy/` validated

Consumes from S01:
- Solo-guide sidebar group registered and navigable

### S03 → S08

Produces:
- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — failure modes and recovery steps

Consumes from S01:
- Solo-guide sidebar group registered and navigable

### S04 → S08

Produces:
- `src/content/docs/solo-guide/first-project.mdx` — full new-project walkthrough with external citations

Consumes from S01:
- Solo-guide sidebar group registered and navigable

### S05 → S08

Produces:
- `src/content/docs/solo-guide/brownfield.mdx` — existing codebase onboarding guidance

Consumes from S01:
- Solo-guide sidebar group registered and navigable

### S06 → S08

Produces:
- `src/content/docs/solo-guide/why-gsd.mdx` — context ceiling argument, cost comparison, technical director framing

Consumes from S01:
- Solo-guide sidebar group registered and navigable

### S07 → S08

Produces:
- `src/content/docs/solo-guide/context-engineering.mdx` — agent-instructions.md, DECISIONS.md, KNOWLEDGE.md, reading GSD output
- `src/content/docs/solo-guide/controlling-costs.mdx` — flat-rate advantage, token profiles, model routing, budget ceiling

Consumes from S01:
- Solo-guide sidebar group registered and navigable

### S08 (final integration)

Produces:
- `src/content/docs/solo-guide/building-rhythm.mdx` — weekly cadence, /gsd queue, retrospectives, graduation path
- Full `npm run update` → GitHub Pages deployment proven end-to-end

Consumes from S01–S07:
- All 8 section files exist with substantive content
- Sidebar registration complete
- All cross-references validated
