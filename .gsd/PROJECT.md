# GSD 2 Documentation Site

## What This Is

A living documentation website for GSD 2 (gsd-pi) — the definitive companion for developers using GSD while coding. Built with Astro + Starlight, it extracts documentation from the installed npm package and GitHub repo, presents it as searchable quick-reference cards and deep-dive pages, and deploys to GitHub Pages with a one-command update pipeline.

## Core Value

A single source of truth for GSD 2 documentation that stays current with the project's extreme release velocity (6+ releases/day), serving both developers coding alongside GSD and vibe-coders who need visual aids.

## Current State

S01 (content extraction), S02 (site scaffold + design), and S03 (quick-reference pages) complete. The site builds 137 HTML pages including 5 reference pages with 76 expandable cheat-sheet cards (42 commands, 8 skills, 17 extensions, 5 agents, 4 shortcuts). Cards use native <details>/<summary> for zero-JS expand/collapse with vanilla JS category filtering. Reference section is integrated into sidebar navigation and hero CTA. Pagefind indexes all 137 pages. Next: S04 (deep-dive docs) and S05 (changelog) — both unblocked and can run in parallel.

## Architecture / Key Patterns

- **Astro 6 + Starlight 0.38** — Static site generator purpose-built for documentation, zero client JS by default, Pagefind search
- **Content extraction pipeline** — Node.js script that reads the installed `gsd-pi` npm package + GitHub API for repo docs/releases
- **Prebuild content bridge** — `scripts/prebuild.mjs` copies S01 extracted docs into Starlight's content directory with YAML frontmatter injection, tracked via `.generated-manifest.json`
- **Terminal-native dark design** — Phosphor green (#39FF14) on near-black (#0a0e0a), JetBrains Mono + Outfit Variable fonts, CSS split into custom.css (variables) + terminal.css (effects)
- **Mermaid diagrams** — @pasqal-io/starlight-client-mermaid renders triple-backtick mermaid fences as SVGs
- **Incremental rebuild** — Diff-based detection of changed content between npm versions
- **GitHub Pages** — Static hosting via git push, site/base configured for `gsd-build.github.io/gsd2-guide`

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: GSD 2 Documentation Site — Build the complete doc site with content extraction, design, all content pages, and one-command update pipeline
