# GSD 2 Documentation Site

## What This Is

A living documentation website for GSD 2 (gsd-pi) — the definitive companion for developers using GSD while coding. Built with Astro + Starlight, it extracts documentation from the installed npm package and GitHub repo, presents it as searchable quick-reference cards and deep-dive pages, and deploys to GitHub Pages with a one-command update pipeline.

## Core Value

A single source of truth for GSD 2 documentation that stays current with the project's extreme release velocity (6+ releases/day), serving both developers coding alongside GSD and vibe-coders who need visual aids.

## Current State

**M001 complete.** The documentation site is fully built with content extraction pipeline, terminal-native dark design, quick-reference cards, browsable changelog, Pagefind search, broken link checker, and GitHub Pages deployment workflow. The one-command update pipeline (`npm run update`) completes in ~6 seconds.

**M002 complete.** Site transformed from 135-page generic pi/agent reference into a 60-page GSD-focused user guide. 109 pi/agent files excluded from the build pipeline. Sidebar restructured from 10 sections to 5 (User Guide, Commands, Recipes, Reference, Guides). Includes a 467-line end-to-end walkthrough following a Cookmate project through all GSD phases, 27 command deep-dive pages with Mermaid diagrams and terminal examples, and 6 core workflow recipe pages. 60 pages built, 3558 internal links verified, all indexed by Pagefind.

**M003+M004 complete.** Documentation regeneration pipeline replaces `@anthropic-ai/sdk` with `claude -p` subprocess (full tool access, no API key). `npm run update` detects stale pages via SHA-based dependency hashing, regenerates them via Claude Code, builds, link-checks, stamps, and deploys to GitHub Pages — zero intervention. 20 tests pass, 65 pages built, 4036 links verified. Fast path (no stale pages) completes pipeline logic in 8.7s.

**M005 complete.** 32 per-prompt deep-dive pages at `/prompts/{slug}/` with 4-section content (What It Does, Pipeline Position Mermaid diagram, Variables table, Used By links). Sidebar has a "Prompts" group with 4 sub-groups (Auto-mode Pipeline, Guided Variants, Commands, Foundation). 16 command pages gained `## Prompts Used` backlink sections. `page-source-map.json` extended from 48 to 80 entries. `update.mjs` is now a 10-step pipeline with a "manage prompts" step. `manage-pages.mjs` has full prompt lifecycle (detect/create/remove). `regenerate-page.mjs` dispatches prompt-page-aware regeneration via `buildPromptSystemPrompt()` + `execute-task.mdx` exemplar. All 124 tests pass (54 manage-pages, 48 extract, 12 page-map, 10 update-pipeline). `npm run build` exits 0 at 104 pages; `npm run check-links` exits 0 at 10,380 links. 4 requirements validated: R057, R058, R059, R060.

## Architecture / Key Patterns

- **Astro 6 + Starlight 0.38** — Static site generator purpose-built for documentation, zero client JS by default, Pagefind search
- **Content extraction pipeline** — Node.js ESM script (`scripts/extract.mjs`) with modular extractors that read the installed `gsd-pi` npm package + GitHub API for repo docs/releases. SHA-based tarball caching reduces API calls to 3 per cached run.
- **Prebuild content bridge** — `scripts/prebuild.mjs` copies extracted docs into Starlight's content directory with YAML frontmatter injection, internal link rewriting (.md → ../page/), and README→index.md renaming. Tracked via `.generated-manifest.json`
- **Terminal-native dark design** — Phosphor green (#39FF14) on near-black (#0a0e0a), JetBrains Mono + Outfit Variable fonts, two-layer CSS (custom.css for variables + terminal.css for effects)
- **Quick-reference cards** — 3 reusable Astro components (ReferenceCard, ReferenceGrid, ToolList) with native details/summary and vanilla JS category filtering
- **Mermaid diagrams** — @pasqal-io/starlight-client-mermaid renders triple-backtick mermaid fences as SVGs
- **Incremental rebuild** — SHA-based manifest diff tracking (1025 files) reports added/changed/removed content between builds
- **Broken link detection** — `scripts/check-links.mjs` validates all internal `<a>` links against dist/ filesystem
- **GitHub Pages** — Static hosting via git push, site/base configured for `gsd-build.github.io/gsd2-guide`

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: GSD 2 Documentation Site — 135-page documentation site with content extraction pipeline, terminal-native dark design, 92 quick-reference cards, 125 deep-dive docs, browsable changelog, Pagefind search, and one-command update pipeline deploying to GitHub Pages in ~6 seconds.
- [x] M002: GSD User Guide — 60-page GSD-focused user guide with end-to-end walkthrough, 27 command deep-dive pages with Mermaid diagrams, and 6 core workflow recipes. Pi/agent content removed, sidebar restructured to 5 sections.
- [x] M003: Continuous Documentation Regeneration — LLM-powered pipeline that detects gsd-pi source changes between versions, maps them to affected doc pages, and regenerates only stale pages via Claude API. Handles new/removed commands automatically. Integrated into `npm run update` as a 9-step pipeline. All 4 slices complete: S01 (source diff/page mapping), S02 (LLM regeneration), S03 (new/removed command handling), S04 (pipeline integration). 113 tests pass, 65 pages built, 4036 links verified.
- [x] M004: Claude Code–Powered Documentation Regeneration — Replaced API-based regeneration with `claude -p` subprocess invocation (full tool access, no API key). S01: regeneration engine rewritten (SDK→subprocess), 20 tests pass, @anthropic-ai/sdk removed. S02: full pipeline end-to-end proven — 3 stale pages regenerated via claude-sonnet-4-6, 65 pages built, 0 broken links, GitHub Pages deployment verified, fast path 8.7s.
- [x] M005: Prompt Reference Section — 32 per-prompt deep-dive pages with Mermaid pipeline position diagrams, variable tables, and bidirectional links to/from command pages. Grouped into 4 roles in sidebar. Wired into the `npm run update` regeneration pipeline. 10-step pipeline, 54 manage-pages tests, 104 pages built.
- [ ] M006: Solo Builder's Applied Guide to GSD 2 — Eight-section practitioner guide for solo founders graduating from vibe coding platforms. Covers why GSD 2 exists, daily workflow decisions, brownfield onboarding, cost management, failure recovery, and building a sustainable rhythm. Published as a new "Solo Builder's Guide" sidebar group on GitHub Pages. **S01 (structure/nav), S02 (Section 4 Daily Mix), S03 (Section 7 When Things Go Wrong), S04 (Section 2 Your First Project), S05 (Section 3 Brownfield Reality), and S06 (Section 1 Why GSD 2) complete.** 113 pages built, 12,288 links verified. R061, R062, R063, R065 validated.
