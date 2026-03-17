# GSD 2 Documentation Site

## What This Is

A living documentation website for GSD 2 (gsd-pi) — the definitive companion for developers using GSD while coding. Built with Astro + Starlight, it extracts documentation from the installed npm package and GitHub repo, presents it as searchable quick-reference cards and deep-dive pages, and deploys to GitHub Pages with a one-command update pipeline.

## Core Value

A single source of truth for GSD 2 documentation that stays current with the project's extreme release velocity (6+ releases/day), serving both developers coding alongside GSD and vibe-coders who need visual aids.

## Current State

**M001 complete.** The documentation site is fully built with content extraction pipeline, terminal-native dark design, quick-reference cards, browsable changelog, Pagefind search, broken link checker, and GitHub Pages deployment workflow. The one-command update pipeline (`npm run update`) completes in ~6 seconds.

**M002 complete.** Site transformed from 135-page generic pi/agent reference into a 60-page GSD-focused user guide. 109 pi/agent files excluded from the build pipeline. Sidebar restructured from 10 sections to 5 (User Guide, Commands, Recipes, Reference, Guides). Includes a 467-line end-to-end walkthrough following a Cookmate project through all GSD phases, 27 command deep-dive pages with Mermaid diagrams and terminal examples, and 6 core workflow recipe pages. 60 pages built, 3558 internal links verified, all indexed by Pagefind.

**M003 complete.** Continuous documentation regeneration pipeline fully operational. `npm run update` now runs a 7-step pipeline: update package → extract content → diff sources → regenerate stale pages (Claude API) → manage new/removed commands → build site → check links. S01 maps 40 pages to 477 source dependencies with hash-based diff detection. S02 provides LLM-powered page regeneration via Claude API with quality prompts using capture.mdx as exemplar. S03 handles automatic page creation/removal and sidebar updates when commands are added/removed. S04 wires everything together with cost/timing reporting and graceful degradation without API key. 118 tests across 28 suites, 3427 internal links verified. All 13 M003 requirements validated.

## Architecture / Key Patterns

- **Astro 6 + Starlight 0.38** — Static site generator purpose-built for documentation, zero client JS by default, Pagefind search
- **Content extraction pipeline** — Node.js ESM script (`scripts/extract.mjs`) with modular extractors that read the installed `gsd-pi` npm package + GitHub API for repo docs/releases. SHA-based tarball caching reduces API calls to 3 per cached run.
- **Prebuild content bridge** — `scripts/prebuild.mjs` copies extracted docs into Starlight's content directory with YAML frontmatter injection, internal link rewriting (.md → ../page/), and README→index.md renaming. Tracked via `.generated-manifest.json`
- **Terminal-native dark design** — Phosphor green (#39FF14) on near-black (#0a0e0a), JetBrains Mono + Outfit Variable fonts, two-layer CSS (custom.css for variables + terminal.css for effects)
- **Quick-reference cards** — 3 reusable Astro components (ReferenceCard, ReferenceGrid, ToolList) with native details/summary and vanilla JS category filtering
- **Mermaid diagrams** — @pasqal-io/starlight-client-mermaid renders triple-backtick mermaid fences as SVGs
- **Source diff + staleness detection** — SHA-based manifest diff tracking detects changed source files; page-source-map.json maps pages to source deps; resolveStalePages() identifies affected pages
- **LLM page regeneration** — Claude API with quality prompt template (capture.mdx exemplar + 12 quality rules) regenerates stale pages. Batch processing with per-page error handling.
- **Command lifecycle management** — detectNewAndRemovedCommands() + createNewPages()/removePages() automatically handle command page creation, sidebar entries, and page-source-map updates
- **Broken link detection** — `scripts/check-links.mjs` validates all internal `<a>` links against dist/ filesystem
- **GitHub Pages** — Static hosting via git push, site/base configured for `gsd-build.github.io/gsd2-guide`

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: GSD 2 Documentation Site — 135-page documentation site with content extraction pipeline, terminal-native dark design, 92 quick-reference cards, 125 deep-dive docs, browsable changelog, Pagefind search, and one-command update pipeline deploying to GitHub Pages in ~6 seconds.
- [x] M002: GSD User Guide — 60-page GSD-focused user guide with end-to-end walkthrough, 27 command deep-dive pages with Mermaid diagrams, and 6 core workflow recipes. Pi/agent content removed, sidebar restructured to 5 sections.
- [x] M003: Continuous Documentation Regeneration — LLM-powered 7-step pipeline detects gsd-pi source changes, maps them to affected doc pages, regenerates stale pages via Claude API, handles new/removed commands automatically, all integrated into `npm run update`. 40 pages mapped to 477 source deps, 118 tests, 3427 links verified. All 13 requirements validated.
