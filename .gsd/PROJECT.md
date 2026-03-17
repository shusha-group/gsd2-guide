# GSD 2 Documentation Site

## What This Is

A living documentation website for GSD 2 (gsd-pi) — the definitive companion for developers using GSD while coding. Built with Astro + Starlight, it extracts documentation from the installed npm package and GitHub repo, presents it as searchable quick-reference cards and deep-dive pages, and deploys to GitHub Pages with a one-command update pipeline.

## Core Value

A single source of truth for GSD 2 documentation that stays current with the project's extreme release velocity (6+ releases/day), serving both developers coding alongside GSD and vibe-coders who need visual aids.

## Current State

**M001 complete.** The documentation site is fully built and ready for deployment. 135 HTML pages: 92 quick-reference cards across 5 pages (58 commands, 8 skills, 17 extensions, 5 agents, 4 shortcuts), 125 deep-dive documentation pages from the GitHub repo, a changelog with all 49 GitHub releases, plus landing page, 404, and search. Terminal-native dark design with phosphor green (#39FF14) on near-black, JetBrains Mono + Outfit fonts, Mermaid diagram support, and Pagefind search indexing all content.

The one-command update pipeline (`npm run update`) chains npm update → extract → build → check-links in ~6 seconds. The broken link checker validates 17975 internal links. The GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys to GitHub Pages on push to main.

**Next step:** Push repo to GitHub and enable Pages in repository settings to go live.

## Architecture / Key Patterns

- **Astro 6 + Starlight 0.38** — Static site generator purpose-built for documentation, zero client JS by default, Pagefind search
- **Content extraction pipeline** — Node.js ESM script (`scripts/extract.mjs`) with modular extractors that read the installed `gsd-pi` npm package + GitHub API for repo docs/releases. SHA-based tarball caching reduces API calls to 3 per cached run.
- **Prebuild content bridge** — `scripts/prebuild.mjs` copies extracted docs into Starlight's content directory with YAML frontmatter injection, internal link rewriting (.md → ../page/), and README→index.md renaming. Tracked via `.generated-manifest.json`
- **Terminal-native dark design** — Phosphor green (#39FF14) on near-black (#0a0e0a), JetBrains Mono + Outfit Variable fonts, two-layer CSS (custom.css for variables + terminal.css for effects)
- **Quick-reference cards** — 3 reusable Astro components (ReferenceCard, ReferenceGrid, ToolList) with native details/summary and vanilla JS category filtering
- **Mermaid diagrams** — @pasqal-io/starlight-client-mermaid renders triple-backtick mermaid fences as SVGs
- **Incremental rebuild** — SHA-based manifest diff tracking (1023 files) reports added/changed/removed content between builds
- **Broken link detection** — `scripts/check-links.mjs` validates all internal `<a>` links against dist/ filesystem
- **GitHub Pages** — Static hosting via git push, site/base configured for `gsd-build.github.io/gsd2-guide`

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

All 21 M001 requirements validated. 3 requirements deferred (R022 per-version snapshots, R023 interactive playground, R024 auto-trigger). 1 out of scope (R025 multi-language).

## Milestone Sequence

- [x] M001: GSD 2 Documentation Site — 135-page documentation site with content extraction pipeline, terminal-native dark design, 92 quick-reference cards, 125 deep-dive docs, browsable changelog, Pagefind search, and one-command update pipeline deploying to GitHub Pages in ~6 seconds.
