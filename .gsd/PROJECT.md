# Project

## What This Is

A community documentation site for GSD 2 (gsd-pi), built with Astro Starlight and hosted on GitHub Pages. Provides narrative-first documentation for solo builders using GSD 2 — the standalone CLI agent built on the Pi SDK. Content is a mix of hand-authored guides and pipeline-generated reference pages that stay current with upstream gsd-pi releases via `npm run update`.

## Core Value

A solo builder can learn, adopt, and operate GSD 2 without leaving this guide for 90% of their workflow.

## Current State

Seven milestones complete. The site has 148 pages: a full Solo Builder's Guide (8 sections), 50+ command deep-dive pages, prompt reference, extension reference, recipes, changelog with inline highlights and era navigation, deep-dive pages (auto mode, .gsd/ directory, v1→v2, story of GSD), quick reference, decision guide, brief writing guide, and cost examples. M008 in progress: full site restructure around three personas (solo business builder, developer new to AI coding, experienced AI developer) with progressive disclosure, persona-aware homepage, consolidated content, and curated learning paths.

## Architecture / Key Patterns

- **Framework:** Astro Starlight with MDX content pages
- **Content pipeline:** `scripts/update.mjs` orchestrates extract → diff → impact analysis → regenerate → build → check-links → audit → stamp
- **Generated content:** Pages listed in `src/content/docs/.generated-manifest.json` are managed by `scripts/prebuild.mjs` — edit sources in `content/generated/docs/`, not `src/content/docs/`
- **Changelog:** Rendered from `content/generated/releases.json` via `src/components/ReleaseEntry.astro` using `marked`, with inline highlights from `changelog-highlights.json`
- **Sidebar:** Configured in `astro.config.mjs` under `starlight({ sidebar: [...] })` — 5 top-level sections: Start Here, Solo Builder's Guide, Recipes, Commands, Learn More
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
- [ ] M008: Site Restructure & Persona Navigation — Three-persona progressive disclosure, sidebar restructure, content consolidation, homepage rewrite, learning paths, bridge pages
