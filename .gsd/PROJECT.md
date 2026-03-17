# GSD 2 Documentation Site

## What This Is

A living documentation website for GSD 2 (gsd-pi) — the definitive companion for developers using GSD while coding. Built with Astro + Starlight, it extracts documentation from the installed npm package and GitHub repo, presents it as searchable quick-reference cards and deep-dive pages, and deploys to GitHub Pages with a one-command update pipeline.

## Core Value

A single source of truth for GSD 2 documentation that stays current with the project's extreme release velocity (6+ releases/day), serving both developers coding alongside GSD and vibe-coders who need visual aids.

## Current State

S01 (Content extraction pipeline) complete. `npm run extract` produces 1,238 structured content items from the gsd-pi npm package and GitHub repo — 8 skills, 5 agents, 17 extensions, 42 commands, 48 releases, 126 docs, README, and a 991-file manifest with SHA hashes. 39/39 tests pass. Next: S02 (Astro site scaffold with custom design).

## Architecture / Key Patterns

- **Astro + Starlight** — Static site generator purpose-built for documentation, zero client JS by default, Pagefind search
- **Content extraction pipeline** — Node.js script that reads the installed `gsd-pi` npm package + GitHub API for repo docs/releases
- **Incremental rebuild** — Diff-based detection of changed content between npm versions
- **GitHub Pages** — Static hosting via git push, no server needed
- **Terminal-native dark design** — Custom Starlight theme with Mermaid diagram support and visual aids for vibe-coders
- **Frontend design skill** — Leveraged for high design quality across the site

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: GSD 2 Documentation Site — Build the complete doc site with content extraction, design, all content pages, and one-command update pipeline
