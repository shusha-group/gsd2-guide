# GSD 2 Documentation Site

## What This Is

A living documentation website for GSD 2 (gsd-pi) — the definitive companion for developers using GSD while coding. Built with Astro + Starlight, it extracts documentation from the installed npm package and GitHub repo, presents it as searchable quick-reference cards and deep-dive pages, and deploys to GitHub Pages with a one-command update pipeline.

## Core Value

A single source of truth for GSD 2 documentation that stays current with the project's extreme release velocity (6+ releases/day), serving both developers coding alongside GSD and vibe-coders who need visual aids.

## Current State

**M001 complete.** The documentation site is fully built with 135 HTML pages, terminal-native dark design, content extraction pipeline, quick-reference cards, browsable changelog, Pagefind search, broken link checker, and GitHub Pages deployment workflow. The one-command update pipeline (`npm run update`) completes in ~6 seconds.

**M002 in progress (S01, S02, S03 complete).** Site refocused from generic pi/agent content to GSD-specific user guide. S01 removed 109 pi/agent files, restructured the sidebar to 5 GSD-focused sections, and authored a 467-line end-to-end walkthrough. S02 added 9 command deep-dive pages for session/execution commands. S03 added 18 more pages covering all remaining commands — planning (queue, steer, capture, triage, knowledge, cleanup), diagnostics/config (doctor, forensics, prefs, mode, skill-health, config), utilities (hooks, run-hook, migrate), and reference topics (keyboard-shortcuts, cli-flags, headless). Full command coverage achieved: 27 command pages with 28 sidebar entries. 54 pages built, 2880 links verified. Remaining: workflow recipes (S04).

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
- [ ] M002: GSD User Guide — Remove generic pi/agent content, add end-to-end walkthrough with real project example, per-command deep-dive pages for all ~25 GSD commands, and core workflow recipes. Authored content with Mermaid diagrams and annotated terminal examples.
