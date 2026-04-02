# Project

## What This Is

A community documentation site for GSD 2 (gsd-pi), built with Astro Starlight and hosted on GitHub Pages. Provides narrative-first documentation for solo builders using GSD 2 — the standalone CLI agent built on the Pi SDK. Content is a mix of hand-authored guides and pipeline-generated reference pages that stay current with upstream gsd-pi releases via `npm run update`.

## Core Value

A solo builder can learn, adopt, and operate GSD 2 without leaving this guide for 90% of their workflow.

## Current State

Seven milestones complete. The site has a full Solo Builder's Guide (8 sections), command reference pages for 50+ commands, prompt reference, extension reference, recipes, and a changelog rendered from upstream releases. M007 added: quick-reference page (15 commands by workflow phase), decision guide (is-gsd-right-for-me), changelog improvements (768 clickable #NNN links + highlights page with 18 release summaries), three deep-dive pages (auto mode, .gsd/ directory, v1→v2), brief writing guide (bad-vs-good pairs), cost examples (3 scenarios), and navigation polish (Getting Started first, logical flow). The `npm run update` pipeline extracts content from the gsd-pi package and official GitHub docs, diffs for staleness, regenerates pages via Claude, builds with Astro, and validates all internal links. Deployed to GitHub Pages at `shusha-group.github.io/gsd2-guide/`.

## Architecture / Key Patterns

- **Framework:** Astro Starlight with MDX content pages
- **Content pipeline:** `scripts/update.mjs` orchestrates extract → diff → impact analysis → regenerate → build → check-links → audit → stamp
- **Generated content:** Pages listed in `src/content/docs/.generated-manifest.json` are managed by `scripts/prebuild.mjs` — edit sources in `content/generated/docs/`, not `src/content/docs/`
- **Changelog:** Rendered from `content/generated/releases.json` via `src/components/ReleaseEntry.astro` using `marked`
- **Sidebar:** Configured in `astro.config.mjs` under `starlight({ sidebar: [...] })`
- **Spelling:** Australian English throughout
- **Deploy:** GitHub Actions on push to main → GitHub Pages

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: GSD 2 Documentation Site
- [x] M002: GSD User Guide
- [x] M003: Continuous Documentation Regeneration
- [x] M004: Claude Code–Powered Documentation Regeneration
- [x] M005: Prompt Reference Section
- [x] M006: Solo Builder's Applied Guide to GSD 2
- [x] M007: Guide Consolidation & Usability — Changelog highlights, quick reference, content consolidation, decision guide, brief-writing guide, cost examples, navigation polish
