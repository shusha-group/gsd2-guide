# M001: GSD 2 Documentation Site

**Vision:** Build the definitive documentation website for GSD 2 — a living, auto-updating companion that extracts content from the installed npm package and GitHub repo, presents it as searchable quick-reference cards and deep-dive pages with terminal-native dark design, and deploys to GitHub Pages with a one-command pipeline.

## Success Criteria

- Developer can find any GSD command, skill, or tool in under 10 seconds via search or quick-reference cards
- All 130+ doc files from the GitHub repo render correctly as structured, navigable sections
- The update pipeline detects version changes, regenerates affected content, and deploys in one command
- Design is visually distinctive — terminal-native dark theme with diagrams and illustrations, not a default template
- Current GSD version is prominently displayed, full release changelog is browsable
- Search returns relevant results across all content types

## Key Risks / Unknowns

- **Content transformation from agent artifacts** — Prompt templates and agent instructions are written for LLMs. Transforming them into human-useful docs is unproven.
- **Starlight design customization ceiling** — The terminal-native craft feel with visual aids may push past Starlight's theme system into lower-level overrides.
- **GitHub API rate limits** — 130+ file fetches + 48 releases per build. Need smart caching.

## Proof Strategy

- Content transformation quality → retire in S01 by proving extraction produces meaningful, structured content from all source types
- Starlight customization depth → retire in S02 by proving the custom dark design renders correctly with all component variants
- GitHub API efficiency → retire in S01 by proving content fetch works within rate limits using caching/diffing

## Verification Classes

- Contract verification: build succeeds, all pages render, search index builds, broken link check passes
- Integration verification: GitHub API returns content, npm package extraction produces expected files, deployment to GitHub Pages succeeds
- Operational verification: one-command update pipeline works end-to-end, incremental rebuild is measurably faster than full rebuild
- UAT / human verification: design quality review, content accuracy spot-check, search relevance check

## Milestone Definition of Done

This milestone is complete only when all are true:

- All content extraction sources produce structured output (npm package + GitHub repo)
- Quick-reference cards exist for every command, skill, tool, extension, and agent
- All docs/ narrative pages render with working internal links
- Changelog shows all GitHub releases with current version in the header
- Custom design passes visual review — terminal-native dark theme with diagrams, not default Starlight
- Search returns relevant results for test queries across all content types
- One-command update pipeline works: npm update → diff → build → deploy → live site
- Site is accessible on GitHub Pages

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013, R014, R015, R016, R017, R018, R019, R020, R021
- Partially covers: none
- Leaves for later: R022, R023, R024
- Orphan risks: none

## Slices

- [x] **S01: Content extraction pipeline** `risk:high` `depends:[]`
  > After this: Running the extraction script produces structured markdown from the installed npm package (skills, prompts, templates, agents) and GitHub repo (docs/, README, releases). Content manifest with hashes for diff tracking.

- [ ] **S02: Astro site scaffold with custom design** `risk:high` `depends:[]`
  > After this: A running Astro/Starlight dev server with terminal-native dark design, custom components, Mermaid diagram support, Pagefind search, and semantic HTML. Placeholder content pages demonstrate all component variants.

- [ ] **S03: Quick-reference pages** `risk:medium` `depends:[S01,S02]`
  > After this: Searchable cheat-sheet cards for all GSD commands (20+), skills (7), extensions (14), agents (5), and keyboard shortcuts. Filter by category, expand for detail and examples.

- [ ] **S04: Deep-dive documentation pages** `risk:medium` `depends:[S01,S02]`
  > After this: All 130+ doc files from the GitHub repo rendered as navigable sections — Getting Started, Auto Mode, Architecture, Configuration, Git Strategy, Skills, Extending Pi, Building Agents, TUI/UI, Troubleshooting, and more.

- [ ] **S05: Changelog & release tracking** `risk:low` `depends:[S02]`
  > After this: Browsable release history page showing all 48+ GitHub releases. Current version number displayed in the site header. Each release shows Added/Fixed/Changed sections.

- [ ] **S06: Update pipeline & GitHub Pages deployment** `risk:medium` `depends:[S01,S02,S03,S04,S05]`
  > After this: One command updates npm package, diffs content against last build, regenerates changed pages, builds the site, runs broken link detection, and deploys to GitHub Pages. Site is live.

## Boundary Map

### S01 → S03
Produces:
- `scripts/extract.js` → extracts content from npm package and GitHub repo
- `content/generated/commands.json` → structured command data (name, description, options, examples)
- `content/generated/skills.json` → structured skill data (name, triggers, capabilities, references)
- `content/generated/extensions.json` → structured extension data (name, tools, description)
- `content/generated/agents.json` → structured agent data (name, role, description)
- `content/generated/manifest.json` → content hash manifest for diff tracking

Consumes: nothing (first slice)

### S01 → S04
Produces:
- `content/generated/docs/` → markdown files pulled from GitHub repo's docs/ directory
- `content/generated/readme.md` → processed README content

Consumes: nothing (first slice)

### S01 → S05
Produces:
- `content/generated/releases.json` → structured release data from GitHub API

Consumes: nothing (first slice)

### S02 → S03
Produces:
- Astro/Starlight site scaffold with custom theme
- Custom card components for cheat-sheet display
- Search infrastructure (Pagefind)
- Layout and navigation structure

Consumes: nothing (parallel first slice)

### S02 → S04
Produces:
- Astro/Starlight site with sidebar navigation
- Mermaid diagram rendering support
- Custom content components (callouts, code blocks, tabs)

Consumes: nothing (parallel first slice)

### S02 → S05
Produces:
- Site scaffold with header version display slot
- Page templates for changelog rendering

Consumes: nothing (parallel first slice)

### S03 → S06
Produces:
- Quick-reference pages consuming generated JSON data

Consumes from S01:
- `content/generated/commands.json`, `skills.json`, `extensions.json`, `agents.json`

Consumes from S02:
- Astro site scaffold, custom card components

### S04 → S06
Produces:
- Deep-dive documentation pages from generated markdown

Consumes from S01:
- `content/generated/docs/` markdown files

Consumes from S02:
- Astro site scaffold, navigation, Mermaid support

### S05 → S06
Produces:
- Changelog page consuming release data
- Version display in site header

Consumes from S01:
- `content/generated/releases.json`

Consumes from S02:
- Site scaffold, page templates
