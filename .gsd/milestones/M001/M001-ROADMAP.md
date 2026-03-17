# M001: GSD 2 Documentation Site

**Vision:** Build the definitive documentation website for GSD 2 — a living, auto-updating companion that extracts content from the installed npm package and GitHub repo, presents it as searchable quick-reference cards and deep-dive pages with terminal-native dark design, and deploys to GitHub Pages with a one-command pipeline.

## Success Criteria

- Developer can find any GSD command, skill, or tool in under 10 seconds via search or quick-reference cards
- All narrative doc files from the GitHub repo render correctly as structured, navigable sections with working internal links
- The update pipeline detects version changes, regenerates affected content, and deploys in one command
- Design is visually distinctive — terminal-native dark theme with diagrams and illustrations, not a default template
- Current GSD version is prominently displayed, full release changelog is browsable
- Search returns relevant results across all content types

## Key Risks / Unknowns

- **Content transformation from agent artifacts** — Prompt templates and agent instructions are written for LLMs. Transforming them into human-useful docs is unproven.
- **Starlight design customization ceiling** — The terminal-native craft feel with visual aids may push past Starlight's theme system into lower-level Astro overrides.
- **GitHub API rate limits** — 130+ file fetches + 48 releases per build. Need smart caching.

## Proof Strategy

- Content transformation + Starlight customization + GitHub API → retire in S01 by building a real, styled site with real extracted content end-to-end. The extraction pipeline, custom design, and GitHub integration are all proven by one working slice.

## Verification Classes

- Contract verification: `npm run build` succeeds, all pages render without errors, search index builds, broken link check passes
- Integration verification: GitHub API returns content for docs + releases, npm package extraction produces expected structured data
- Operational verification: `npm run update` one-command pipeline works end-to-end from version detection through deployment
- UAT / human verification: design quality visual review, content accuracy spot-check, search relevance for key queries

## Milestone Definition of Done

This milestone is complete only when all are true:

- Content extraction produces structured output from both npm package and GitHub repo
- Quick-reference cards exist for every command, skill, tool, extension, and agent
- All docs/ narrative pages render with correct navigation and working internal links
- Changelog shows all GitHub releases with current version in the site header
- Custom design passes visual review — terminal-native dark theme with diagrams, not default Starlight
- Search returns relevant results for test queries across all content types
- One-command update pipeline works: detect version → diff content → rebuild → deploy → live on GitHub Pages
- Site is accessible at the GitHub Pages URL

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013, R014, R015, R016, R017, R018, R019, R020, R021
- Partially covers: none
- Leaves for later: R022, R023, R024
- Orphan risks: none

## Slices

- [ ] **S01: Commands quick-reference with extraction pipeline and custom design** `risk:high` `depends:[]`
  > After this: A live Astro/Starlight dev site with terminal-native dark custom design, showing a fully functional Commands quick-reference page with searchable/filterable cheat-sheet cards for all 20+ GSD commands and keyboard shortcuts — content extracted from the installed npm package and GitHub repo. Pagefind search works across the site.

- [ ] **S02: Skills, extensions, and agents reference pages** `risk:medium` `depends:[S01]`
  > After this: Three new quick-reference sections — Skills (7 bundled skills with triggers, capabilities, references), Extensions (14+ bundled tools with descriptions), and Agents (5 agents with roles and usage). All extracted from the installed npm package's actual files. Searchable and filterable like the commands page.

- [ ] **S03: Deep-dive documentation — core guides** `risk:medium` `depends:[S01]`
  > After this: Getting Started, Auto Mode, Configuration, Git Strategy, Cost Management, Token Optimization, Troubleshooting, and Working in Teams pages render from GitHub repo content with proper navigation sidebar, Mermaid diagrams, and working internal links.

- [ ] **S04: Deep-dive documentation — advanced topics** `risk:low` `depends:[S01,S03]`
  > After this: All remaining doc sections render: Extending Pi (25 chapters), Building Coding Agents (26 essays), Context & Hooks (8 chapters), TUI/UI (23 chapters), What is Pi (19 chapters), and Architecture. Full sidebar navigation across all sections.

- [ ] **S05: Changelog, version tracking, and landing page** `risk:low` `depends:[S01]`
  > After this: Browsable release history showing all 48+ GitHub releases with Added/Fixed/Changed sections. Current version in site header. A polished landing page with hero section, feature highlights, and clear navigation entry points.

- [ ] **S06: Update pipeline and GitHub Pages deployment** `risk:medium` `depends:[S01,S02,S03,S04,S05]`
  > After this: Running `npm run update` detects the current gsd-pi version, diffs content against the last build manifest, regenerates only changed pages, runs broken link detection, builds the site, and deploys to GitHub Pages. The site is live and publicly accessible.

## Boundary Map

### S01 → S02

Produces:
- `scripts/extract-content.mjs` → Node.js extraction script with functions: `extractCommands()`, `extractSkills()`, `extractExtensions()`, `extractAgents()`, `extractDocs()`, `extractReleases()`, `writeManifest()`
- `src/content/docs/reference/commands.mdx` → Commands quick-reference page consuming extracted data
- `src/components/CheatSheetCard.astro` → Reusable expandable card component for quick-reference items
- `src/components/FilterBar.astro` → Category filter component
- `data/commands.json` → Structured command data (name, description, category, options, examples)
- `data/manifest.json` → Content hash manifest for incremental rebuild tracking
- Astro/Starlight project with custom dark theme in `src/styles/custom.css`
- `astro.config.mjs` → Starlight configuration with sidebar, search, Mermaid plugin

Consumes: nothing (first slice)

### S01 → S03

Produces:
- `scripts/extract-content.mjs` → `extractDocs()` function that pulls markdown from GitHub repo
- `data/docs/` → Markdown files from GitHub repo's docs/ directory, ready for Astro content collections
- Starlight sidebar configuration pattern for adding new sections
- Custom theme and layout components

Consumes: nothing (first slice)

### S01 → S05

Produces:
- `scripts/extract-content.mjs` → `extractReleases()` function for GitHub release data
- `data/releases.json` → Structured release data (version, date, body, tag)
- Site header component with version display slot

Consumes: nothing (first slice)

### S01 → S06

Produces:
- `data/manifest.json` → Content hashes for diff-based incremental rebuild
- `scripts/extract-content.mjs` → Full extraction pipeline callable from update script

Consumes: nothing (first slice)

### S02 → S06

Produces:
- `src/content/docs/reference/skills.mdx` → Skills reference page
- `src/content/docs/reference/extensions.mdx` → Extensions reference page
- `src/content/docs/reference/agents.mdx` → Agents reference page
- `data/skills.json`, `data/extensions.json`, `data/agents.json` → Structured reference data

Consumes from S01:
- `scripts/extract-content.mjs` → `extractSkills()`, `extractExtensions()`, `extractAgents()`
- `src/components/CheatSheetCard.astro`, `src/components/FilterBar.astro`
- Custom theme, Astro/Starlight configuration

### S03 → S04

Produces:
- `src/content/docs/guides/` → Core guide pages (getting-started, auto-mode, configuration, etc.)
- Sidebar navigation pattern for multi-page doc sections
- Internal link resolution pattern between doc pages

Consumes from S01:
- `data/docs/` → Extracted markdown from GitHub repo
- Astro/Starlight site scaffold, custom theme, Mermaid support

### S04 → S06

Produces:
- `src/content/docs/extending-pi/`, `src/content/docs/building-agents/`, `src/content/docs/context-hooks/`, `src/content/docs/tui/`, `src/content/docs/what-is-pi/`, `src/content/docs/architecture/` → All remaining doc sections

Consumes from S01:
- `data/docs/` → Extracted markdown

Consumes from S03:
- Sidebar navigation pattern, internal link resolution

### S05 → S06

Produces:
- `src/content/docs/changelog.mdx` → Release history page
- `src/pages/index.astro` → Landing page with hero, features, navigation
- Version display in site header via `data/releases.json`

Consumes from S01:
- `data/releases.json` → Structured release data
- Site scaffold, theme, header component
