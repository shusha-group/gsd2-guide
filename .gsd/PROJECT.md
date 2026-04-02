# Project

## What This Is

A community documentation site for GSD 2 (gsd-pi), built with Astro Starlight and hosted on GitHub Pages. Provides narrative-first documentation for solo builders using GSD 2 — the standalone CLI agent built on the Pi SDK. Content is a mix of hand-authored guides and pipeline-generated reference pages that stay current with upstream gsd-pi releases via `npm run update`.

## Core Value

A solo builder can learn, adopt, and operate GSD 2 without leaving this guide for 90% of their workflow.

## Current State

Eight milestones complete. The site has 156 pages: a persona-aware homepage with 3 reading paths (Choose Your Starting Point), 5-section sidebar (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More), a full Solo Builder's Guide (8 sections), 50+ command deep-dive pages, prompt reference, extension reference, recipes (including consolidated cost recipe), changelog, deep-dive pages, FAQ (11 Q&As), Glossary (25 terms), bridge pages for Replit/Lovable/Cursor users, unified Skills/Extensions/Agents guide, and site-wide prev/next pagination with audience-bridging callouts on 16 pages.

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
- [x] M008: Site Restructure & Persona Navigation — Three-persona progressive disclosure, sidebar restructure, content consolidation, homepage rewrite, learning paths, bridge pages
