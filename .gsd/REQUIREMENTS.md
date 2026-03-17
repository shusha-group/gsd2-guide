# Requirements

This file is the explicit capability and coverage contract for the project.

## Validated

### R001 — A build script extracts documentation-worthy content from the globally installed `gsd-pi` npm package — prompts, templates, skills, agent definitions, and extension metadata.
- Class: core-capability
- Status: validated
- Description: A build script extracts documentation-worthy content from the globally installed `gsd-pi` npm package — prompts, templates, skills, agent definitions, and extension metadata.
- Why it matters: The installed package is the source of truth for how GSD actually behaves. Without extracting from it, documentation would be disconnected from reality.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S03, M001/S04
- Validation: Extraction produces skills.json (8), agents.json (5), extensions.json (17) from installed gsd-pi npm package with dynamic path resolution. 39/39 tests pass covering all output structures and counts.
- Notes: Must handle the exact file structure under `~/.gsd/agent/` and the npm package's `dist/resources/`

### R002 — The build pipeline pulls markdown documentation from the `gsd-build/gsd-2` GitHub repository's `docs/` directory, README, and release notes via the GitHub API.
- Class: core-capability
- Status: validated
- Description: The build pipeline pulls markdown documentation from the `gsd-build/gsd-2` GitHub repository's `docs/` directory, README, and release notes via the GitHub API.
- Why it matters: The GitHub repo has ~132 narrative doc files that don't ship in the npm package. These are the deep-dive guides, architecture docs, and tutorial content.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S04, M001/S05
- Validation: Pipeline pulls 127 markdown docs, README, 49 releases, and 1023-file manifest from gsd-build/gsd-2 GitHub repo via tarball + releases + tree API with SHA-based caching.
- Notes: Uses GitHub API. The `docs/` directory has subdirectories: building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals, what-is-pi

### R003 — Searchable, filterable cheat-sheet cards for all GSD commands, skills, tools, extensions, keyboard shortcuts, and agents. Each card shows a one-liner and expands for detail and examples.
- Class: primary-user-loop
- Status: validated
- Description: Searchable, filterable cheat-sheet cards for all GSD commands, skills, tools, extensions, keyboard shortcuts, and agents. Each card shows a one-liner and expands for detail and examples.
- Why it matters: Developers coding alongside GSD need instant lookup — what does this command do, what are the options, show me an example. This is the most frequent use case.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: 92 searchable, filterable, expandable cheat-sheet cards across 5 reference pages (58 commands, 8 skills, 17 extensions, 5 agents, 4 shortcuts). Category filter works. Pagefind indexes all content.
- Notes: Content sourced from extraction pipeline (R001, R002). Cheat-sheet style, not interactive playground.

### R004 — Full narrative documentation pages covering getting started, auto mode, configuration, architecture, git strategy, skills, troubleshooting, extending pi, building coding agents, TUI/UI, and more.
- Class: core-capability
- Status: validated
- Description: Full narrative documentation pages covering getting started, auto mode, configuration, architecture, git strategy, skills, troubleshooting, extending pi, building coding agents, TUI/UI, and more.
- Why it matters: Quick-reference isn't enough for understanding how GSD works deeply. Developers need comprehensive guides for architecture, extension authoring, and advanced usage.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: 125 deep-dive doc pages covering getting started, auto mode, configuration, architecture, git strategy, skills, troubleshooting, extending pi, building coding agents, TUI/UI. Sidebar organized into 10 navigable groups. 17975 internal links validated.
- Notes: Mirrors the GitHub repo's docs/ structure, organized into navigable sections

### R005 — A browsable changelog page aggregating all GitHub release notes, showing what changed in each version with Added/Fixed/Changed sections.
- Class: continuity
- Status: validated
- Description: A browsable changelog page aggregating all GitHub release notes, showing what changed in each version with Added/Fixed/Changed sections.
- Why it matters: With 6+ releases/day, users need to know what changed. The changelog is how they find out if a bug was fixed or a feature was added.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: S05 builds changelog page at /changelog/ with all 48 GitHub releases — expand/collapse, dates, GitHub links, rendered markdown bodies. Verified by grep counts on dist/ output.
- Notes: Pulls from GitHub API `gh release list`. Shows current version prominently (R010).

### R006 — A custom dark-mode-first design with terminal-native aesthetic (tight typography, code-heavy, developer-focused) complemented by diagrams, illustrations, and visual aids for vibe-coders and non-technical users.
- Class: differentiator
- Status: validated
- Description: A custom dark-mode-first design with terminal-native aesthetic (tight typography, code-heavy, developer-focused) complemented by diagrams, illustrations, and visual aids for vibe-coders and non-technical users.
- Why it matters: The site should feel like it belongs to GSD — not a generic docs theme. The visual aids bridge the gap for the growing vibe-coder audience.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S03, M001/S04
- Validation: Terminal-native dark design with phosphor green #39FF14 on near-black #0a0e0a, JetBrains Mono + Outfit fonts, scanline effects, custom code blocks. Mermaid SVGs render. Not default Starlight.
- Notes: Uses the frontend-design skill for high design quality. Dark foundation with Mermaid diagram support and custom illustrations. "Craft feel" per user's emphasis.

### R007 — A single command that updates the npm package to latest, diffs content against the last build, regenerates only changed pages, builds the site, and deploys to GitHub Pages.
- Class: operability
- Status: validated
- Description: A single command that updates the npm package to latest, diffs content against the last build, regenerates only changed pages, builds the site, and deploys to GitHub Pages.
- Why it matters: The user runs this multiple times a day. If it's more than one command or takes too long, it won't get used.
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: S06 builds `scripts/update.mjs` — `npm run update` chains npm update → extract → build (with prebuild lifecycle hook) → check-links in one command. Reports per-step timing, manifest diff (added/changed/removed counts), page count (135), and link check result. Exits non-zero with failed step name on failure. Full pipeline completes in ~6.6s.
- Notes: Must be fast. Incremental rebuild is part of this (R011).

### R008 — The built site deploys to GitHub Pages via git push. No server infrastructure needed.
- Class: launchability
- Status: validated
- Description: The built site deploys to GitHub Pages via git push. No server infrastructure needed.
- Why it matters: Zero-ops hosting. Push and it's live.
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: S06 creates `.github/workflows/deploy.yml` — triggers on push to main + workflow_dispatch, uses withastro/action@v5 (extract + build + check-links), deploys via actions/deploy-pages@v4 with pages:write + id-token:write permissions. Concurrency group prevents parallel deploys. Ready to go live when repo is pushed to GitHub with Pages enabled.
- Notes: Uses Astro's official GitHub Pages deployment workflow

### R009 — Full-text search across all documentation content, powered by Starlight's built-in Pagefind integration.
- Class: primary-user-loop
- Status: validated
- Description: Full-text search across all documentation content, powered by Starlight's built-in Pagefind integration.
- Why it matters: With 130+ doc files, search is the primary navigation mechanism for developers looking up specific topics.
- Source: inferred
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: Pagefind search indexes all 135 pages at build time across all content types — reference cards, deep-dive docs, changelog, and landing page.
- Notes: Pagefind is built into Starlight and works at build time. No external search service needed.

### R010 — The current GSD version number is visible in the site header or footer, updated on each build.
- Class: continuity
- Status: validated
- Description: The current GSD version number is visible in the site header or footer, updated on each build.
- Why it matters: Developers need to know which version the docs reflect, especially with multiple releases per day.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: M001/S06
- Validation: S05 wires Header.astro to import releases.json and display releases[0].tag_name (v2.22.0) as a clickable badge. Verified: grep confirms version present and v0.0.0 placeholder eliminated.
- Notes: Extracted from package.json or GitHub latest release tag

### R011 — The build pipeline detects what content changed since the last build and only regenerates affected pages, not the entire site.
- Class: operability
- Status: validated
- Description: The build pipeline detects what content changed since the last build and only regenerates affected pages, not the entire site.
- Why it matters: Full rebuilds of 130+ pages on every update would be slow and wasteful. Multiple-times-a-day updates need to be fast.
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: S01 manifest tracks 1023 files with SHA hashes. S06 update script captures extract output and reports manifest diff summary (+N added, ~N changed, -N removed). Astro's content collections handle page-level rebuild. The manifest diff enables knowing what changed; Astro handles incremental static generation internally.
- Notes: Content diffing based on file hashes between versions

### R012 — Well-structured HTML with proper headings, semantic markup, and a sitemap so AI tools can parse and reference the content.
- Class: quality-attribute
- Status: validated
- Description: Well-structured HTML with proper headings, semantic markup, and a sitemap so AI tools can parse and reference the content.
- Why it matters: The site should be a source AI agents can use when they need help with GSD.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: Starlight generates semantic HTML with proper headings. Sitemap at dist/sitemap-index.xml. 135 pages with structured markup accessible to AI tools.
- Notes: Starlight generates semantic HTML by default. Sitemap is built-in.

### R013 — Support for Mermaid diagrams and potentially custom illustrations in documentation pages, rendered as SVG.
- Class: differentiator
- Status: validated
- Description: Support for Mermaid diagrams and potentially custom illustrations in documentation pages, rendered as SVG.
- Why it matters: Architecture docs, workflow docs, and concept explanations need visual representation to serve vibe-coders and non-technical users.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S04
- Validation: Mermaid diagrams render as SVGs via @pasqal-io/starlight-client-mermaid. Verified in multiple built pages including configuration, auto-mode, git-strategy.
- Notes: Mermaid integration via Astro plugin. Custom illustrations as needed per section.

### R014 — Documentation pages for all bundled skills (frontend-design, swiftui, debug-like-expert, github-workflows, lint, review, test) including their capabilities, triggers, reference files, and workflows.
- Class: core-capability
- Status: validated
- Description: Documentation pages for all bundled skills (frontend-design, swiftui, debug-like-expert, github-workflows, lint, review, test) including their capabilities, triggers, reference files, and workflows.
- Why it matters: Skills are a primary GSD capability. Users need to know what skills exist, what they do, and how to use/author custom ones.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: All 8 skills documented with conditional objective/arguments/detection sections. gh nested under github-workflows as sub-skill.
- Notes: Content extracted from skill SKILL.md files and reference docs

### R015 — Documentation pages for all 14 bundled extensions, showing what each provides, how to use it, and configuration options.
- Class: core-capability
- Status: validated
- Description: Documentation pages for all 14 bundled extensions, showing what each provides, how to use it, and configuration options.
- Why it matters: Extensions are GSD's tool system. Developers need to know what tools are available and how they work.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: All 17 extensions documented with tool lists. 4 toolless extensions show graceful fallback text. Sorted by tool count.
- Notes: Extensions: GSD, Browser Tools, Search the Web, Google Search, Context7, Background Shell, Subagent, Mac Tools, MCPorter, Voice, Slash Commands, LSP, Ask User Questions, Secure Env Collect

### R016 — Documentation pages for the 3 bundled agents (scout, researcher, worker) plus the 2 specialized agents (javascript-pro, typescript-pro), showing their roles and when they're used.
- Class: core-capability
- Status: validated
- Description: Documentation pages for the 3 bundled agents (scout, researcher, worker) plus the 2 specialized agents (javascript-pro, typescript-pro), showing their roles and when they're used.
- Why it matters: Agents are how GSD delegates work. Users need to understand what each agent does and when it's invoked.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: All 5 agents documented on reference cards with role, summary, and conditional model/memory/tools info.
- Notes: Content extracted from agent .md files

### R017 — Architecture overview pages covering the system design, dispatch pipeline, state machine, context engineering, and how GSD's components fit together.
- Class: core-capability
- Status: validated
- Description: Architecture overview pages covering the system design, dispatch pipeline, state machine, context engineering, and how GSD's components fit together.
- Why it matters: Advanced users and extension authors need to understand GSD's internals.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: Architecture pages render in Architecture sidebar group. Building-coding-agents essay series (10 pages) renders as its own section.
- Notes: Sourced from docs/architecture.md and the building-coding-agents essay series

### R018 — Automated transformation of internal artifacts (prompt templates, agent instructions, skill files) into user-facing documentation. Not raw dumps — meaningful extraction of capabilities, behaviors, and usage patterns.
- Class: core-capability
- Status: validated
- Description: Automated transformation of internal artifacts (prompt templates, agent instructions, skill files) into user-facing documentation. Not raw dumps — meaningful extraction of capabilities, behaviors, and usage patterns.
- Why it matters: The installed npm package contains behavioral truth about GSD, but in agent-instruction format. This needs to be transformed into documentation humans (and AI) can use.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S03
- Validation: Skills extracted with YAML frontmatter + XML sections, agents with summaries, extensions with tool inventories. All rendered as user-facing reference cards with meaningful structure, not raw dumps.
- Notes: This is the hardest technical challenge. Some artifacts map cleanly (skill files describe capabilities). Others (prompt templates) need careful curation.

### R019 — A prominent troubleshooting section covering common issues, the `/gsd doctor` command, and recovery procedures.
- Class: failure-visibility
- Status: validated
- Description: A prominent troubleshooting section covering common issues, the `/gsd doctor` command, and recovery procedures.
- Why it matters: When GSD breaks, users need answers fast. A visible troubleshooting section reduces friction.
- Source: research
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: Troubleshooting page renders in Guides sidebar group with prominent LinkCard on the landing page.
- Notes: GSD already has docs/troubleshooting.md. Surface it prominently.

### R020 — A clear getting-started page as the primary entry point, covering install, first run, provider setup, and basic usage.
- Class: launchability
- Status: validated
- Description: A clear getting-started page as the primary entry point, covering install, first run, provider setup, and basic usage.
- Why it matters: First impressions. If someone can't get started in 5 minutes, they leave.
- Source: research
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: Getting Started page renders as first Guides entry. Landing page hero CTA links directly to it. Cross-link to auto-mode verified.
- Notes: GSD has docs/getting-started.md. This is the landing page entry point.

### R021 — The build pipeline checks for broken internal links between doc pages and reports them before deployment.
- Class: quality-attribute
- Status: validated
- Description: The build pipeline checks for broken internal links between doc pages and reports them before deployment.
- Why it matters: With 130+ frequently changing doc files, broken links are inevitable without automated detection.
- Source: research
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: S06 builds `scripts/check-links.mjs` — scans all dist/ HTML files, checks 17975 internal `<a>` links against filesystem after stripping /gsd2-guide/ base path. Exits 0 with count on success, exits 1 with per-link broken report on failure. Integrated into both `npm run update` pipeline and GitHub Actions workflow.
- Notes: Build-time check, not runtime

## Deferred

### R022 — Ability to view documentation as it was at any specific version.
- Class: continuity
- Status: deferred
- Description: Ability to view documentation as it was at any specific version.
- Why it matters: Users on older versions could see docs matching their version.
- Source: user (rejected in favor of latest + changelog)
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred due to extreme release velocity making per-version snapshots impractical. Latest + changelog covers the need.

### R023 — Interactive simulation where users type commands and see simulated output.
- Class: differentiator
- Status: deferred
- Description: Interactive simulation where users type commands and see simulated output.
- Why it matters: Would be engaging for learning but high maintenance cost.
- Source: user (rejected in favor of cheat-sheet cards)
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Cheat-sheet style chosen instead. Could revisit later.

### R024 — GitHub Action that auto-triggers doc rebuild on every new gsd-pi release.
- Class: operability
- Status: deferred
- Description: GitHub Action that auto-triggers doc rebuild on every new gsd-pi release.
- Why it matters: Would eliminate manual trigger entirely.
- Source: user (chose manual trigger)
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Manual trigger chosen for M001. Could be added easily later since the pipeline will exist.

## Out of Scope

### R025 — Multi-language documentation support.
- Class: constraint
- Status: out-of-scope
- Description: Multi-language documentation support.
- Why it matters: Prevents scope creep into translation management.
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: English-only for the foreseeable future.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | validated | M001/S01 | M001/S03, M001/S04 | Extraction produces skills.json (8), agents.json (5), extensions.json (17) from installed gsd-pi npm package with dynamic path resolution. 39/39 tests pass covering all output structures and counts. |
| R002 | core-capability | validated | M001/S01 | M001/S04, M001/S05 | Pipeline pulls 127 markdown docs, README, 49 releases, and 1023-file manifest from gsd-build/gsd-2 GitHub repo via tarball + releases + tree API with SHA-based caching. |
| R003 | primary-user-loop | validated | M001/S03 | none | 92 searchable, filterable, expandable cheat-sheet cards across 5 reference pages (58 commands, 8 skills, 17 extensions, 5 agents, 4 shortcuts). Category filter works. Pagefind indexes all content. |
| R004 | core-capability | validated | M001/S04 | none | 125 deep-dive doc pages covering getting started, auto mode, configuration, architecture, git strategy, skills, troubleshooting, extending pi, building coding agents, TUI/UI. Sidebar organized into 10 navigable groups. 17975 internal links validated. |
| R005 | continuity | validated | M001/S05 | none | S05 builds changelog page at /changelog/ with all 48 GitHub releases — expand/collapse, dates, GitHub links, rendered markdown bodies. Verified by grep counts on dist/ output. |
| R006 | differentiator | validated | M001/S02 | M001/S03, M001/S04 | Terminal-native dark design with phosphor green #39FF14 on near-black #0a0e0a, JetBrains Mono + Outfit fonts, scanline effects, custom code blocks. Mermaid SVGs render. Not default Starlight. |
| R007 | operability | validated | M001/S06 | none | S06 builds `scripts/update.mjs` — `npm run update` chains npm update → extract → build (with prebuild lifecycle hook) → check-links in one command. Reports per-step timing, manifest diff (added/changed/removed counts), page count (135), and link check result. Exits non-zero with failed step name on failure. Full pipeline completes in ~6.6s. |
| R008 | launchability | validated | M001/S06 | none | S06 creates `.github/workflows/deploy.yml` — triggers on push to main + workflow_dispatch, uses withastro/action@v5 (extract + build + check-links), deploys via actions/deploy-pages@v4 with pages:write + id-token:write permissions. Concurrency group prevents parallel deploys. Ready to go live when repo is pushed to GitHub with Pages enabled. |
| R009 | primary-user-loop | validated | M001/S02 | none | Pagefind search indexes all 135 pages at build time across all content types — reference cards, deep-dive docs, changelog, and landing page. |
| R010 | continuity | validated | M001/S05 | M001/S06 | S05 wires Header.astro to import releases.json and display releases[0].tag_name (v2.22.0) as a clickable badge. Verified: grep confirms version present and v0.0.0 placeholder eliminated. |
| R011 | operability | validated | M001/S06 | none | S01 manifest tracks 1023 files with SHA hashes. S06 update script captures extract output and reports manifest diff summary (+N added, ~N changed, -N removed). Astro's content collections handle page-level rebuild. The manifest diff enables knowing what changed; Astro handles incremental static generation internally. |
| R012 | quality-attribute | validated | M001/S02 | none | Starlight generates semantic HTML with proper headings. Sitemap at dist/sitemap-index.xml. 135 pages with structured markup accessible to AI tools. |
| R013 | differentiator | validated | M001/S02 | M001/S04 | Mermaid diagrams render as SVGs via @pasqal-io/starlight-client-mermaid. Verified in multiple built pages including configuration, auto-mode, git-strategy. |
| R014 | core-capability | validated | M001/S03 | none | All 8 skills documented with conditional objective/arguments/detection sections. gh nested under github-workflows as sub-skill. |
| R015 | core-capability | validated | M001/S03 | none | All 17 extensions documented with tool lists. 4 toolless extensions show graceful fallback text. Sorted by tool count. |
| R016 | core-capability | validated | M001/S03 | none | All 5 agents documented on reference cards with role, summary, and conditional model/memory/tools info. |
| R017 | core-capability | validated | M001/S04 | none | Architecture pages render in Architecture sidebar group. Building-coding-agents essay series (10 pages) renders as its own section. |
| R018 | core-capability | validated | M001/S01 | M001/S03 | Skills extracted with YAML frontmatter + XML sections, agents with summaries, extensions with tool inventories. All rendered as user-facing reference cards with meaningful structure, not raw dumps. |
| R019 | failure-visibility | validated | M001/S04 | none | Troubleshooting page renders in Guides sidebar group with prominent LinkCard on the landing page. |
| R020 | launchability | validated | M001/S04 | none | Getting Started page renders as first Guides entry. Landing page hero CTA links directly to it. Cross-link to auto-mode verified. |
| R021 | quality-attribute | validated | M001/S06 | none | S06 builds `scripts/check-links.mjs` — scans all dist/ HTML files, checks 17975 internal `<a>` links against filesystem after stripping /gsd2-guide/ base path. Exits 0 with count on success, exits 1 with per-link broken report on failure. Integrated into both `npm run update` pipeline and GitHub Actions workflow. |
| R022 | continuity | deferred | none | none | unmapped |
| R023 | differentiator | deferred | none | none | unmapped |
| R024 | operability | deferred | none | none | unmapped |
| R025 | constraint | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 0
- Mapped to slices: 0
- Validated: 21 (R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013, R014, R015, R016, R017, R018, R019, R020, R021)
- Unmapped active requirements: 0
