# M001: GSD 2 Documentation Site

**Gathered:** 2026-03-17
**Status:** Ready for planning

## Project Description

A living documentation website for GSD 2 that serves as the definitive companion for developers coding with GSD. Built with Astro + Starlight, it extracts content from the installed npm package (prompts, templates, skills, agents) and the GitHub repo (docs/, README, releases), transforms it into searchable quick-reference cards and deep-dive pages, and deploys to GitHub Pages with a one-command update pipeline.

## Why This Milestone

GSD 2 is moving extremely fast — 6+ releases per day, 48 releases total, growing feature set across extensions, skills, and agents. There is no centralized, browsable documentation. The README covers basics but the deep docs only live in the GitHub repo as raw markdown. Users coding with GSD have no companion reference. Vibe-coders have no visual guides. AI agents have no well-structured source to reference.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Open a browser tab to the GSD 2 docs site and instantly look up any command, skill, tool, or extension
- Read deep-dive guides on architecture, auto mode, extending GSD, and building coding agents
- See the current GSD version and browse the full release changelog
- Run one command to update the docs site with the latest GSD release and deploy it live
- Search across all documentation content with instant results

### Entry point / environment

- Entry point: https://gsd-build.github.io/gsd2-guide (or custom domain)
- Environment: browser (production site on GitHub Pages)
- Live dependencies involved: GitHub API (releases, repo content), npm registry (package updates)

## Completion Class

- Contract complete means: all content pages render correctly, search works, build pipeline produces a deployable site
- Integration complete means: GitHub API integration works (releases, repo docs), npm package extraction produces correct content
- Operational complete means: one-command update pipeline works end-to-end, site is live on GitHub Pages

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A developer can find any GSD command in under 10 seconds via search or quick-reference
- The update pipeline detects a version change, regenerates affected pages, and deploys in one command
- All 130+ doc files from the GitHub repo render correctly with working internal links
- The design is visually polished — terminal-native dark theme with diagrams, not a default Starlight skin

## Risks and Unknowns

- **Content transformation quality** — Prompt templates and agent instructions are written for LLMs, not humans. Transforming them into useful docs requires careful curation. May need manual annotation for some content.
- **GitHub API rate limits** — Pulling 130+ files and 48 releases on each build could hit rate limits. Need to cache and diff intelligently.
- **Starlight customization depth** — Custom design beyond Starlight's theme system may require lower-level Astro component overrides. Need to verify design ambitions are achievable.
- **Content freshness lag** — The npm package and GitHub repo docs may not always be in sync. Need to handle version mismatches gracefully.

## Existing Codebase / Prior Art

- `gsd-pi` npm package (v2.22.0) — installed globally, contains dist/resources/ with prompts, templates, skills, agents
- `~/.gsd/agent/` — synced copy of bundled extensions, skills, agents
- `gsd-build/gsd-2` GitHub repo — docs/ directory with 132 files, 48 releases
- `gsd-build/gsd-2/README.md` — 579 lines, covers overview, commands, architecture, configuration

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001, R002, R018 — Content extraction and transformation (the data pipeline)
- R003, R014, R015, R016 — Quick-reference pages (the primary user loop)
- R004, R017, R019, R020 — Deep-dive documentation (comprehensive coverage)
- R005, R010 — Changelog and version tracking (staying current)
- R006, R009, R012, R013 — Design, search, and structure (the experience)
- R007, R008, R011, R021 — Pipeline and deployment (the automation)

## Scope

### In Scope

- Content extraction from installed npm package (prompts, templates, skills, agents)
- Content extraction from GitHub repo (docs/, README, releases)
- Transformation of internal artifacts into user-facing documentation
- Quick-reference cheat-sheet cards (commands, skills, tools, extensions, shortcuts)
- Deep-dive narrative documentation pages (all docs/ sections)
- Changelog from GitHub releases with version tracking
- Terminal-native dark design with diagrams and visual aids
- Full-text search via Pagefind
- One-command update pipeline (npm update → diff → build → deploy)
- GitHub Pages deployment
- Broken link detection

### Out of Scope / Non-Goals

- Per-version doc snapshots (deferred — latest + changelog is sufficient)
- Interactive command playground (deferred)
- CI/CD auto-trigger on release (deferred — manual trigger first)
- Internationalization / translations
- Custom domain setup (can be done post-launch by the user)

## Technical Constraints

- Astro + Starlight as the site framework (static generation, built-in search, doc-optimized)
- GitHub Pages as hosting target (static files only, no server-side)
- GitHub API for repo content and releases (may need token for rate limits)
- Node.js build scripts for content extraction and transformation
- Frontend design skill must be used for design quality

## Integration Points

- **GitHub API** — repos/gsd-build/gsd-2/contents/docs, releases, README
- **npm registry** — `gsd-pi` package version and content
- **Installed npm package** — `~/.nvm/.../node_modules/gsd-pi/` for runtime content extraction
- **`~/.gsd/agent/`** — synced skills, extensions, agents
- **GitHub Pages** — deployment target

## Open Questions

- **Content transformation depth** — How much of the prompt/template content is useful to surface vs. being purely internal agent instructions? Will determine in S01 research.
- **Custom domain** — User may want a custom domain later. GitHub Pages supports this natively. Not blocking M001.
