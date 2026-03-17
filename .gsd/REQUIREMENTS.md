# Requirements

This file is the explicit capability and coverage contract for the project.

Use it to track what is actively in scope, what has been validated by completed work, what is intentionally deferred, and what is explicitly out of scope.

## Active

### R001 — Content extraction from installed npm package
- Class: core-capability
- Status: active
- Description: A build script extracts documentation-worthy content from the globally installed `gsd-pi` npm package — prompts, templates, skills, agent definitions, and extension metadata.
- Why it matters: The installed package is the source of truth for how GSD actually behaves. Without extracting from it, documentation would be disconnected from reality.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S03, M001/S04
- Validation: unmapped
- Notes: Must handle the exact file structure under `~/.gsd/agent/` and the npm package's `dist/resources/`

### R002 — Content extraction from GitHub repo docs/
- Class: core-capability
- Status: active
- Description: The build pipeline pulls markdown documentation from the `gsd-build/gsd-2` GitHub repository's `docs/` directory, README, and release notes via the GitHub API.
- Why it matters: The GitHub repo has ~132 narrative doc files that don't ship in the npm package. These are the deep-dive guides, architecture docs, and tutorial content.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S04, M001/S05
- Validation: unmapped
- Notes: Uses GitHub API. The `docs/` directory has subdirectories: building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, proposals, what-is-pi

### R003 — Quick-reference cheat sheets
- Class: primary-user-loop
- Status: active
- Description: Searchable, filterable cheat-sheet cards for all GSD commands, skills, tools, extensions, keyboard shortcuts, and agents. Each card shows a one-liner and expands for detail and examples.
- Why it matters: Developers coding alongside GSD need instant lookup — what does this command do, what are the options, show me an example. This is the most frequent use case.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Content sourced from extraction pipeline (R001, R002). Cheat-sheet style, not interactive playground.

### R004 — Deep-dive narrative documentation
- Class: core-capability
- Status: active
- Description: Full narrative documentation pages covering getting started, auto mode, configuration, architecture, git strategy, skills, troubleshooting, extending pi, building coding agents, TUI/UI, and more.
- Why it matters: Quick-reference isn't enough for understanding how GSD works deeply. Developers need comprehensive guides for architecture, extension authoring, and advanced usage.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: unmapped
- Notes: Mirrors the GitHub repo's docs/ structure, organized into navigable sections

### R005 — Changelog from GitHub releases
- Class: continuity
- Status: validated
- Description: A browsable changelog page aggregating all GitHub release notes, showing what changed in each version with Added/Fixed/Changed sections.
- Why it matters: With 6+ releases/day, users need to know what changed. The changelog is how they find out if a bug was fixed or a feature was added.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: S05 builds changelog page at /changelog/ with all 48 GitHub releases — expand/collapse, dates, GitHub links, rendered markdown bodies. Verified by grep counts on dist/ output.
- Notes: Pulls from GitHub API `gh release list`. Shows current version prominently (R010).

### R006 — Terminal-native dark design with visual aids
- Class: differentiator
- Status: active
- Description: A custom dark-mode-first design with terminal-native aesthetic (tight typography, code-heavy, developer-focused) complemented by diagrams, illustrations, and visual aids for vibe-coders and non-technical users.
- Why it matters: The site should feel like it belongs to GSD — not a generic docs theme. The visual aids bridge the gap for the growing vibe-coder audience.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S03, M001/S04
- Validation: unmapped
- Notes: Uses the frontend-design skill for high design quality. Dark foundation with Mermaid diagram support and custom illustrations. "Craft feel" per user's emphasis.

### R007 — One-command update pipeline
- Class: operability
- Status: active
- Description: A single command that updates the npm package to latest, diffs content against the last build, regenerates only changed pages, builds the site, and deploys to GitHub Pages.
- Why it matters: The user runs this multiple times a day. If it's more than one command or takes too long, it won't get used.
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: unmapped
- Notes: Must be fast. Incremental rebuild is part of this (R011).

### R008 — GitHub Pages deployment
- Class: launchability
- Status: active
- Description: The built site deploys to GitHub Pages via git push. No server infrastructure needed.
- Why it matters: Zero-ops hosting. Push and it's live.
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: unmapped
- Notes: Uses Astro's official GitHub Pages deployment workflow

### R009 — Built-in full-text search
- Class: primary-user-loop
- Status: active
- Description: Full-text search across all documentation content, powered by Starlight's built-in Pagefind integration.
- Why it matters: With 130+ doc files, search is the primary navigation mechanism for developers looking up specific topics.
- Source: inferred
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: unmapped
- Notes: Pagefind is built into Starlight and works at build time. No external search service needed.

### R010 — Current version prominently displayed
- Class: continuity
- Status: validated
- Description: The current GSD version number is visible in the site header or footer, updated on each build.
- Why it matters: Developers need to know which version the docs reflect, especially with multiple releases per day.
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: M001/S06
- Validation: S05 wires Header.astro to import releases.json and display releases[0].tag_name (v2.22.0) as a clickable badge. Verified: grep confirms version present and v0.0.0 placeholder eliminated.
- Notes: Extracted from package.json or GitHub latest release tag

### R011 — Incremental rebuild
- Class: operability
- Status: active
- Description: The build pipeline detects what content changed since the last build and only regenerates affected pages, not the entire site.
- Why it matters: Full rebuilds of 130+ pages on every update would be slow and wasteful. Multiple-times-a-day updates need to be fast.
- Source: user
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: unmapped
- Notes: Content diffing based on file hashes between versions

### R012 — Semantic HTML for AI consumption
- Class: quality-attribute
- Status: active
- Description: Well-structured HTML with proper headings, semantic markup, and a sitemap so AI tools can parse and reference the content.
- Why it matters: The site should be a source AI agents can use when they need help with GSD.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: unmapped
- Notes: Starlight generates semantic HTML by default. Sitemap is built-in.

### R013 — Diagram and illustration support
- Class: differentiator
- Status: active
- Description: Support for Mermaid diagrams and potentially custom illustrations in documentation pages, rendered as SVG.
- Why it matters: Architecture docs, workflow docs, and concept explanations need visual representation to serve vibe-coders and non-technical users.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S04
- Validation: unmapped
- Notes: Mermaid integration via Astro plugin. Custom illustrations as needed per section.

### R014 — Skill documentation
- Class: core-capability
- Status: active
- Description: Documentation pages for all bundled skills (frontend-design, swiftui, debug-like-expert, github-workflows, lint, review, test) including their capabilities, triggers, reference files, and workflows.
- Why it matters: Skills are a primary GSD capability. Users need to know what skills exist, what they do, and how to use/author custom ones.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Content extracted from skill SKILL.md files and reference docs

### R015 — Extension documentation
- Class: core-capability
- Status: active
- Description: Documentation pages for all 14 bundled extensions, showing what each provides, how to use it, and configuration options.
- Why it matters: Extensions are GSD's tool system. Developers need to know what tools are available and how they work.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Extensions: GSD, Browser Tools, Search the Web, Google Search, Context7, Background Shell, Subagent, Mac Tools, MCPorter, Voice, Slash Commands, LSP, Ask User Questions, Secure Env Collect

### R016 — Agent documentation
- Class: core-capability
- Status: active
- Description: Documentation pages for the 3 bundled agents (scout, researcher, worker) plus the 2 specialized agents (javascript-pro, typescript-pro), showing their roles and when they're used.
- Why it matters: Agents are how GSD delegates work. Users need to understand what each agent does and when it's invoked.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Content extracted from agent .md files

### R017 — Architecture documentation
- Class: core-capability
- Status: active
- Description: Architecture overview pages covering the system design, dispatch pipeline, state machine, context engineering, and how GSD's components fit together.
- Why it matters: Advanced users and extension authors need to understand GSD's internals.
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: unmapped
- Notes: Sourced from docs/architecture.md and the building-coding-agents essay series

### R018 — Content transformation pipeline
- Class: core-capability
- Status: active
- Description: Automated transformation of internal artifacts (prompt templates, agent instructions, skill files) into user-facing documentation. Not raw dumps — meaningful extraction of capabilities, behaviors, and usage patterns.
- Why it matters: The installed npm package contains behavioral truth about GSD, but in agent-instruction format. This needs to be transformed into documentation humans (and AI) can use.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S03
- Validation: unmapped
- Notes: This is the hardest technical challenge. Some artifacts map cleanly (skill files describe capabilities). Others (prompt templates) need careful curation.

### R019 — Troubleshooting / FAQ section
- Class: failure-visibility
- Status: active
- Description: A prominent troubleshooting section covering common issues, the `/gsd doctor` command, and recovery procedures.
- Why it matters: When GSD breaks, users need answers fast. A visible troubleshooting section reduces friction.
- Source: research
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: unmapped
- Notes: GSD already has docs/troubleshooting.md. Surface it prominently.

### R020 — Getting started / first-run guide
- Class: launchability
- Status: active
- Description: A clear getting-started page as the primary entry point, covering install, first run, provider setup, and basic usage.
- Why it matters: First impressions. If someone can't get started in 5 minutes, they leave.
- Source: research
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: unmapped
- Notes: GSD has docs/getting-started.md. This is the landing page entry point.

### R021 — Broken link detection in build pipeline
- Class: quality-attribute
- Status: active
- Description: The build pipeline checks for broken internal links between doc pages and reports them before deployment.
- Why it matters: With 130+ frequently changing doc files, broken links are inevitable without automated detection.
- Source: research
- Primary owning slice: M001/S06
- Supporting slices: none
- Validation: unmapped
- Notes: Build-time check, not runtime

## Deferred

### R022 — Per-version doc snapshots
- Class: continuity
- Status: deferred
- Description: Ability to view documentation as it was at any specific version.
- Why it matters: Users on older versions could see docs matching their version.
- Source: user (rejected in favor of latest + changelog)
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred due to extreme release velocity making per-version snapshots impractical. Latest + changelog covers the need.

### R023 — Interactive command playground
- Class: differentiator
- Status: deferred
- Description: Interactive simulation where users type commands and see simulated output.
- Why it matters: Would be engaging for learning but high maintenance cost.
- Source: user (rejected in favor of cheat-sheet cards)
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Cheat-sheet style chosen instead. Could revisit later.

### R024 — CI/CD auto-trigger on release
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

### R025 — Internationalization / translations
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
| R001 | core-capability | active | M001/S01 | M001/S03, M001/S04 | unmapped |
| R002 | core-capability | active | M001/S01 | M001/S04, M001/S05 | unmapped |
| R003 | primary-user-loop | active | M001/S03 | none | unmapped |
| R004 | core-capability | active | M001/S04 | none | unmapped |
| R005 | continuity | validated | M001/S05 | none | S05: 48 releases with expand/collapse, dates, links, rendered bodies |
| R006 | differentiator | active | M001/S02 | M001/S03, M001/S04 | unmapped |
| R007 | operability | active | M001/S06 | none | unmapped |
| R008 | launchability | active | M001/S06 | none | unmapped |
| R009 | primary-user-loop | active | M001/S02 | none | unmapped |
| R010 | continuity | validated | M001/S05 | M001/S06 | S05: v2.22.0 in header badge, v0.0.0 eliminated |
| R011 | operability | active | M001/S06 | none | unmapped |
| R012 | quality-attribute | active | M001/S02 | none | unmapped |
| R013 | differentiator | active | M001/S02 | M001/S04 | unmapped |
| R014 | core-capability | active | M001/S03 | none | unmapped |
| R015 | core-capability | active | M001/S03 | none | unmapped |
| R016 | core-capability | active | M001/S03 | none | unmapped |
| R017 | core-capability | active | M001/S04 | none | unmapped |
| R018 | core-capability | active | M001/S01 | M001/S03 | unmapped |
| R019 | failure-visibility | active | M001/S04 | none | unmapped |
| R020 | launchability | active | M001/S04 | none | unmapped |
| R021 | quality-attribute | active | M001/S06 | none | unmapped |
| R022 | continuity | deferred | none | none | unmapped |
| R023 | differentiator | deferred | none | none | unmapped |
| R024 | operability | deferred | none | none | unmapped |
| R025 | constraint | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 19
- Mapped to slices: 21
- Validated: 2
- Unmapped active requirements: 0
tive requirements: 0
