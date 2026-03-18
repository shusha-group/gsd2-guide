# M004: Claude Code–Powered Documentation Regeneration

**Vision:** Every documentation page in gsd-guide is traceable to source in gsd-pi. When source changes, `npm run update` (triggered by "update gsd-guide") spawns Claude Code to regenerate stale pages with full tool access — the same capability that wrote the original docs — then builds, link-checks, commits, pushes, and deploys to GitHub Pages. Zero intervention.

## Success Criteria

- Running "update gsd-guide" after a gsd-pi version change detects stale pages and regenerates them via `claude -p` — no API key, no manual step
- Regenerated pages match M002 quality: correct sections, Mermaid diagrams, terminal examples, valid internal links, accurate source-derived content
- All 43 page-source-map entries are verified to correctly identify the source files that influence each page's content
- The 3 currently stale pages (`commands/config.mdx`, `reference/skills.mdx`, `reference/extensions.mdx`) are regenerated, build passes, 0 broken links
- `@anthropic-ai/sdk` dependency removed from package.json
- When `claude` CLI is not available, pipeline reports it clearly and builds with existing content
- When no pages are stale, pipeline skips regeneration and completes the fast path in under 15 seconds

## Key Risks / Unknowns

- **claude -p output quality** — `claude -p` has full tool access but the prompt must be precise enough to direct it to produce M002-quality documentation. This is the highest risk — unproven until S01 actually runs it.
- **Reference page dep count** — `reference/skills.mdx` (295 deps) and `reference/extensions.mdx` (289 deps) map to enormous file lists. Passing all deps may be wasteful or confusing; not passing them may produce lower quality output. Correct strategy is unknown until tested.
- **subprocess invocation mechanics** — Spawning `claude -p` from Node.js needs the right PATH, env, working directory, and timeout. May need `spawn` (streaming) rather than `execSync` (blocking) for long-running regenerations.

## Proof Strategy

- **claude -p output quality** → retire in S01 by regenerating `commands/capture.mdx` (the exemplar page) via `claude -p` and comparing output against the original. If the output matches quality, the approach is proven.
- **Reference page dep count** → retire in S01 by testing both strategies (pass deps vs let Claude read) on `reference/agents.mdx` (5 deps, manageable) and deciding based on result quality.
- **subprocess invocation mechanics** → retire in S01 by building the subprocess wrapper and running it end-to-end before wiring into the pipeline.

## Verification Classes

- Contract verification: Unit tests for subprocess invocation wrapper, prompt construction, output validation (frontmatter check), graceful claude-missing path
- Integration verification: `npm run update` with real stale pages triggers Claude Code, pages are updated, build passes, link check passes
- Operational verification: "Update gsd-guide" runs end-to-end with zero intervention — commit, push, GitHub Pages deploy confirmed
- UAT / human verification: Visual quality check of 2-3 regenerated pages against M002 originals

## Milestone Definition of Done

This milestone is complete only when all are true:

- `regenerate-page.mjs` spawns `claude -p` instead of calling `@anthropic-ai/sdk`
- All 43 page-source-map entries verified correct
- `@anthropic-ai/sdk` removed from package.json and all import sites
- `npm run update` invokes Claude Code automatically for detected stale pages
- The 3 currently stale pages regenerated, build passes, 0 broken links
- "Update gsd-guide" completes end-to-end with zero intervention
- Graceful degradation when `claude` CLI absent verified

## Requirement Coverage

- Covers: R048, R049, R050, R051, R052, R053, R054, R055, R056
- Partially covers: R007 (extends the update pipeline further)
- Leaves for later: R024/R047 (CI auto-trigger still deferred)
- Orphan risks: none

## Slices

- [x] **S01: Claude Code Regeneration Engine** `risk:high` `depends:[]`
  > After this: Running `node scripts/lib/regenerate-page.mjs commands/capture.mdx` regenerates the page via `claude -p` with full tool access, the output has correct frontmatter and all 6 sections, and passes the Astro build.

- [x] **S02: Pipeline Integration and End-to-End Proof** `risk:medium` `depends:[S01]`
  > After this: Running `npm run update` with the 3 known stale pages regenerates them via Claude Code, build passes, link check passes. "Update gsd-guide" triggers the full cycle including commit, push, and GitHub Pages deployment — zero intervention.

## Boundary Map

### S01 → S02

Produces:
- `scripts/lib/regenerate-page.mjs` — rewritten to spawn `claude -p` instead of calling `@anthropic-ai/sdk`. Same exported function signature: `regeneratePage(pagePath, sourceFiles, options)` returning `{ inputTokens, outputTokens, elapsedMs, model, pagePath }` or `{ skipped, reason }` or `{ error, details }`.
- `scripts/lib/regenerate-page.mjs` — exports `regenerateStalePages(options)` batch function unchanged in signature
- Proven prompt template for command pages and reference pages
- Verified page-source-map (all 43 entries confirmed correct or fixed)
- Decision on per-page vs batch invocation strategy

Consumes:
- nothing (first slice — builds on existing scripts but rewrites the core)

### S02 (integration)

Consumes:
- S01's rewritten `regeneratePage()` and `regenerateStalePages()`
- Existing `scripts/update.mjs` 9-step pipeline (unchanged structure)
- Existing `scripts/check-page-freshness.mjs` (unchanged)
- Existing "update gsd-guide" git+push workflow (unchanged)
