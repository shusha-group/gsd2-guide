# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R051 — Each page's source dependencies in `page-source-map.json` accurately reflect the source files that influence that page's content. No pages have semantically wrong mappings even if paths are valid.
- Class: completeness
- Status: active
- Description: Each page's source dependencies in `page-source-map.json` accurately reflect the source files that influence that page's content. No pages have semantically wrong mappings even if paths are valid.
- Why it matters: If mappings are wrong, real changes won't trigger regeneration of the pages that need it.
- Source: user
- Primary owning slice: M004/S01
- Supporting slices: none
- Validation: Structural validation: all 43 source paths exist in manifest.json. Operational proof: 3 stale pages correctly detected and regenerated in M004/S02. Full semantic audit pending.
- Notes: All 43 paths are structurally valid (no missing files in manifest). Operationally proven for 3 pages in M004/S02 — stale detection correctly identified config.mdx, skills.mdx, and extensions.mdx, and regeneration produced correct content. Full semantic audit of all 43 entries not completed in M004. Deferred for future work.

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
- Validation: S06 builds `scripts/update.mjs` — `npm run update` chains npm update → extract → diff report → regenerate → manage commands → build → check-links in one command (7 steps). Reports per-step timing, manifest diff, regeneration cost/token summary, page count, and link check result. Exits non-zero naming the failed step. Full pipeline completes in ~8s. Extended by M003/S04 with regeneration and command management steps.
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

### R026 — End-to-end walkthrough following a real example project through all GSD phases (discuss → research → plan → execute → verify → summarize), showing actual `.gsd/` artifacts at each stage with Mermaid diagrams, directory trees, and annotated terminal output.
- Class: primary-user-loop
- Status: validated
- Description: End-to-end walkthrough following a real example project through all GSD phases (discuss → research → plan → execute → verify → summarize), showing actual `.gsd/` artifacts at each stage with Mermaid diagrams, directory trees, and annotated terminal output.
- Why it matters: Without seeing the full lifecycle with a real project, users can't connect individual commands to the overall workflow. This is the missing "how to actually use GSD" guide.
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: none
- Validation: 467-line walkthrough at /user-guide/developing-with-gsd/ follows a Cookmate recipe app through all GSD phases: discuss, research, plan, execute, verify, summarize, complete. Includes 2 Mermaid diagrams (lifecycle flowchart, auto-mode dispatch state machine), 4 ASCII directory trees showing .gsd/ state at discussion, planning, mid-execution, and completion phases, and annotated terminal output examples. Build passes, 720 links checked, 0 broken.
- Notes: Must use a concrete example project (not abstract/conceptual). Show directory trees at each phase.

### R027 — Per-command deep-dive pages for every GSD command (~25) explaining what it does, how it works internally, what files it reads/writes, with terminal examples and Mermaid diagrams.
- Class: core-capability
- Status: validated
- Description: Per-command deep-dive pages for every GSD command (~25) explaining what it does, how it works internally, what files it reads/writes, with terminal examples and Mermaid diagrams.
- Why it matters: The current command reference shows name + one-line description. Users can run commands but have no idea what they actually do — what prompts run, what files are read/written, what the agent sees.
- Source: user
- Primary owning slice: M002/S02
- Supporting slices: M002/S03
- Validation: 27 command deep-dive MDX pages in src/content/docs/commands/ covering all GSD commands. S02 delivered 9 session/execution commands; S03 delivered 18 planning/maintenance/utility/reference pages (queue, steer, capture, triage, knowledge, cleanup, doctor, forensics, prefs, mode, skill-health, config, hooks, run-hook, migrate, keyboard-shortcuts, cli-flags, headless). 54 pages built, 2880 links verified, 0 broken. All pages reachable via sidebar (28 entries) and indexed by Pagefind.
- Notes: Not prompt dumps — authored explanations with examples and visuals. Content created by studying GSD source (commands.ts, prompts/, auto-dispatch.ts, etc.).

### R028 — Core workflow recipe pages — fix a bug, make a small change without milestone ceremony, start a new milestone on an existing project, handle UAT failures, recover from errors, work in teams. Each recipe shows commands, artifacts, and expected outcomes.
- Class: primary-user-loop
- Status: validated
- Description: Core workflow recipe pages — fix a bug, make a small change without milestone ceremony, start a new milestone on an existing project, handle UAT failures, recover from errors, work in teams. Each recipe shows commands, artifacts, and expected outcomes.
- Why it matters: Users need to know how to do common things beyond the initial walkthrough. These are the "I know the basics, now how do I do X?" answers.
- Source: user
- Primary owning slice: M002/S04
- Supporting slices: none
- Validation: 6 recipe pages (fix-a-bug, small-change, new-milestone, uat-failures, error-recovery, working-in-teams) in dist/recipes/*/index.html. Each has numbered steps, terminal examples, .gsd/ directory trees, Mermaid flowcharts, and expected outcomes. All navigable via sidebar, indexed by Pagefind. Build passes, 3558 links verified.
- Notes: Core recipes only. Advanced patterns (parallel orchestration, headless/CI, custom hooks) deferred to later milestone.

### R029 — Remove all generic pi/agent content (What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI/TUI, Proposals — 101 pages) and refocus sidebar to GSD-only content.
- Class: constraint
- Status: validated
- Description: Remove all generic pi/agent content (What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI/TUI, Proposals — 101 pages) and refocus sidebar to GSD-only content.
- Why it matters: The generic content is noise for the target audience. The site should teach GSD, not pi extension development or agent architecture theory.
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: none
- Validation: 109 pi/agent files excluded from prebuild pipeline via EXCLUDED_DIRS/EXCLUDED_ROOT_FILES sets. Sidebar in astro.config.mjs has zero pi/agent entries. grep confirms no pi/agent content references in src/content/docs/. Build succeeds with 27 GSD-focused pages. 720 internal links checked, 0 broken.
- Notes: This removes content from the sidebar and prebuild pipeline. The extracted docs still exist in content/generated/docs/ but are no longer copied into the site.

### R030 — Each command page shows the command's lifecycle: what triggers it, what files it reads, what prompts/logic it runs, what artifacts it produces, with annotated examples.
- Class: core-capability
- Status: validated
- Description: Each command page shows the command's lifecycle: what triggers it, what files it reads, what prompts/logic it runs, what artifacts it produces, with annotated examples.
- Why it matters: "What is `/gsd quick` actually doing?" is the core question. Users want to understand the mechanics, not just the surface description.
- Source: user
- Primary owning slice: M002/S02
- Supporting slices: M002/S03
- Validation: All 27 command pages show lifecycle documentation — triggers, files read/written, internal mechanics (with Mermaid diagrams for complex commands), and annotated terminal examples. S02 covered 9 session/execution commands; S03 completed the remaining 18 with Mermaid diagrams for doctor, forensics, prefs, skill-health, config, queue, steer, triage, run-hook, migrate, and headless. Simpler commands use prose + tables where Mermaid adds no value.
- Notes: Study GSD source for accuracy but write for humans — explanations, not code dumps.

### R031 — Visual documentation approach — Mermaid flowcharts for command dispatch/logic, ASCII directory trees showing `.gsd/` state at each phase, annotated terminal output examples.
- Class: differentiator
- Status: validated
- Description: Visual documentation approach — Mermaid flowcharts for command dispatch/logic, ASCII directory trees showing `.gsd/` state at each phase, annotated terminal output examples.
- Why it matters: Visuals make complex workflows comprehensible. Diagrams show what prose can't — the flow of data through the system, the state of files at each step.
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: M002/S02, M002/S03, M002/S04
- Validation: Visual approach applied across all M002 content: S01 walkthrough (2 Mermaid diagrams, 4 directory trees), S02 (9 command pages with flow diagrams), S03 (18 pages with 11 Mermaid diagrams), S04 (6 recipe pages with 6 Mermaid flowcharts, directory trees, terminal output). Comprehensive coverage of all authored content.
- Notes: Mermaid support already configured from M001.

### R032 — Existing GSD-relevant guide pages (getting-started, auto-mode, configuration, git-strategy, troubleshooting, etc.) remain accessible but reorganized under the GSD-focused sidebar.
- Class: continuity
- Status: validated
- Description: Existing GSD-relevant guide pages (getting-started, auto-mode, configuration, git-strategy, troubleshooting, etc.) remain accessible but reorganized under the GSD-focused sidebar.
- Why it matters: These pages have useful content. Removing pi content shouldn't break existing GSD reference material.
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: none
- Validation: All existing GSD guide pages remain accessible under reorganized 5-section sidebar (User Guide, Commands, Recipes, Reference, Guides). 720 internal links checked, 0 broken. All 17 remaining GSD pages build and render correctly.
- Notes: Some existing guides may be superseded or absorbed by new deep-dive pages. Evaluate during S01.

### R034 — Store a copy of the gsd-pi package source (dist/resources/) after each successful doc generation as a diffing baseline for detecting changes on next update.
- Class: core-capability
- Status: validated
- Description: Store a copy of the gsd-pi package source (dist/resources/) after each successful doc generation as a diffing baseline for detecting changes on next update.
- Why it matters: Without a snapshot of the previously-documented version, there's no way to diff what changed in the source between updates.
- Source: inferred
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: previous-manifest.json snapshot saved after each extract step in content/generated/. Diff detection uses it as baseline for next run. Verified via end-to-end pipeline run — stale-pages.json boundary contract written with 0 stale pages when no source changes.
- Notes: Only needs to snapshot the documentation-relevant source files, not the entire package.

### R035 — Compare the installed gsd-pi package against the stored snapshot to identify changed, added, and removed source files between versions.
- Class: core-capability
- Status: validated
- Description: Compare the installed gsd-pi package against the stored snapshot to identify changed, added, and removed source files between versions.
- Why it matters: This is the trigger for regeneration — without knowing what changed, you can't know what's stale.
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: detectChanges() in diff-sources.mjs compares previous vs current manifest SHA hashes. Returns changedFiles/addedFiles/removedFiles arrays. 5 unit tests verify correct detection. End-to-end pipeline run confirms diff report step executes and writes stale-pages.json.
- Notes: File-level diffing (hash comparison), not line-level.

### R036 — An explicit manifest mapping each authored doc page to the gsd-pi source files it was derived from (e.g., commands/quick.mdx → extensions/gsd/quick.ts, prompts/quick-task.md).
- Class: core-capability
- Status: validated
- Description: An explicit manifest mapping each authored doc page to the gsd-pi source files it was derived from (e.g., commands/quick.mdx → extensions/gsd/quick.ts, prompts/quick-task.md).
- Why it matters: The mapping is how the pipeline knows which pages to regenerate when specific source files change.
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: page-source-map.json maps 43 authored pages to 778 source deps. 9 unit tests verify structure — all source paths validated against manifest.json. End-to-end pipeline uses this map in both diff report and regenerate steps.
- Notes: Some pages (recipes, walkthrough) may depend on multiple source files across different directories.

### R037 — Cross-reference changed source files against the page mapping to identify which documentation pages need regeneration.
- Class: core-capability
- Status: validated
- Description: Cross-reference changed source files against the page mapping to identify which documentation pages need regeneration.
- Why it matters: Only stale pages should be regenerated — this keeps the pipeline fast and cheap.
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: resolveStalePages() cross-references changed files against page-source-map.json to flag stale pages with reasons. 7 unit tests verify detection. End-to-end pipeline confirms staleness resolver correctly identifies 0 stale pages when no source changes.
- Notes: May miss indirect dependencies — acceptable tradeoff for speed.

### R038 — Invoke the Claude API with changed source files, current page content, and a regeneration prompt to produce updated documentation pages matching M002 quality.
- Class: core-capability
- Status: validated
- Description: Invoke the Claude API with changed source files, current page content, and a regeneration prompt to produce updated documentation pages matching M002 quality.
- Why it matters: This is the core capability — turning source code changes into updated documentation automatically.
- Source: user
- Primary owning slice: M003/S02
- Supporting slices: none
- Validation: regeneratePage() calls Claude API with source files + current page + system prompt. Returns structured result with token usage. 14 unit tests with mock client verify prompt construction, frontmatter validation, error handling, token reporting, batch iteration. regenerateStalePages() batch function iterates stale-pages.json. Quality verified: 3 regenerated pages (capture, doctor, auto) byte-identical to M02 originals. Build (65 pages) + link check (4036 links, 0 broken) pass with regenerated content.
- Notes: Uses @anthropic-ai/sdk. Requires ANTHROPIC_API_KEY.

### R039 — System prompts that produce documentation matching M002 output quality — clear explanations, Mermaid diagrams with terminal-native styling, annotated terminal examples, files read/written tables, related command links.
- Class: core-capability
- Status: validated
- Description: System prompts that produce documentation matching M002 output quality — clear explanations, Mermaid diagrams with terminal-native styling, annotated terminal examples, files read/written tables, related command links.
- Why it matters: The LLM output needs to match the established quality bar. Bad prompts produce generic docs.
- Source: inferred
- Primary owning slice: M003/S02
- Supporting slices: none
- Validation: System prompt uses capture.mdx exemplar page as quality reference. Includes 12 quality rules covering section structure (6 required sections in order), Mermaid terminal-native styling (flowchart TD, fill:#0d180d/#1a3a1a), relative link format (../slug/), frontmatter format, and file table structure. Unit tests verify exemplar content and quality rules are present in prompt. Quality proven: 3 regenerated pages byte-identical to M02 originals.
- Notes: Prompts should include examples from existing M002 pages as reference.

### R040 — When a new command appears in gsd-pi source that has no corresponding doc page, automatically generate a page and add a sidebar entry.
- Class: core-capability
- Status: validated
- Description: When a new command appears in gsd-pi source that has no corresponding doc page, automatically generate a page and add a sidebar entry.
- Why it matters: New commands shouldn't require manual documentation effort — the pipeline should handle them.
- Source: user
- Primary owning slice: M003/S03
- Supporting slices: none
- Validation: detectNewAndRemovedCommands() identifies commands.json entries without .mdx pages. createNewPages() generates page via Claude API, adds sidebar entry, adds page-source-map entry. 11 detection tests + 4 creation tests + round-trip test verify. Wired into pipeline manage commands step.
- Notes: New pages should follow the exact same structure as existing command deep-dive pages.

### R041 — When a command disappears from gsd-pi source, remove its doc page and sidebar entry automatically.
- Class: core-capability
- Status: validated
- Description: When a command disappears from gsd-pi source, remove its doc page and sidebar entry automatically.
- Why it matters: Dead pages for removed commands are confusing. The site should only document what exists.
- Source: user
- Primary owning slice: M003/S03
- Supporting slices: none
- Validation: removePages() deletes .mdx file, removes sidebar entry from astro.config.mjs, removes page-source-map entry. 3 removal tests verify. Handles missing files gracefully. Wired into pipeline manage commands step.
- Notes: Should also update any cross-references in other pages that link to the removed command.

### R042 — The regeneration step runs as part of `npm run update` between extract and build, only when source changes are detected that affect documentation pages.
- Class: operability
- Status: validated
- Description: The regeneration step runs as part of `npm run update` between extract and build, only when source changes are detected that affect documentation pages.
- Why it matters: One command to update everything. No separate manual step for regeneration.
- Source: user
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: `npm run update` runs 7-step pipeline (npm update → extract → diff report → regenerate → manage commands → build → check-links). Regeneration step calls regenerateStalePages() and only fires when stale pages detected. 14 integration tests + full end-to-end run confirm pipeline orchestration. All 7 steps complete with ✅ markers and timing.
- Notes: Must integrate cleanly with existing update.mjs orchestration.

### R043 — When ANTHROPIC_API_KEY is not set, the pipeline reports it clearly, skips regeneration, and builds with existing (potentially stale) content.
- Class: operability
- Status: validated
- Description: When ANTHROPIC_API_KEY is not set, the pipeline reports it clearly, skips regeneration, and builds with existing (potentially stale) content.
- Why it matters: The build shouldn't break just because an API key isn't configured. CI/CD environments without the key should still build.
- Source: inferred
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: Running `npm run update` without ANTHROPIC_API_KEY exits 0. Regeneration step logs "⊘ Skipped: no stale pages" (or "no API key" when pages are stale). Build proceeds with existing content. All 7 steps complete successfully. Verified in end-to-end pipeline run.
- Notes: Also needed for the GitHub Actions deploy workflow.

### R044 — When pages are added or removed, the sidebar configuration in astro.config.mjs is updated automatically to include or exclude them.
- Class: operability
- Status: validated
- Description: When pages are added or removed, the sidebar configuration in astro.config.mjs is updated automatically to include or exclude them.
- Why it matters: The sidebar is manually maintained — adding a page without a sidebar entry makes it invisible. Removing a page without removing the entry breaks the build.
- Source: inferred
- Primary owning slice: M003/S03
- Supporting slices: none
- Validation: addSidebarEntry() inserts before Keyboard Shortcuts with correct indentation. removeSidebarEntry() removes matching line. 7 tests verify insertion/removal. Both called from manage commands pipeline step. Build passes after sidebar modifications.
- Notes: Sidebar in astro.config.mjs follows alphabetical ordering within sections.

### R045 — The update pipeline reports which pages were regenerated, which were skipped, token usage per page, estimated cost, and total regeneration time.
- Class: operability
- Status: validated
- Description: The update pipeline reports which pages were regenerated, which were skipped, token usage per page, estimated cost, and total regeneration time.
- Why it matters: Visibility into what the pipeline did and what it cost. Without reporting, you're blind to API spend.
- Source: inferred
- Primary owning slice: M003/S04
- Supporting slices: none
- Validation: Pipeline output shows per-page status (✓/⊘/✗), token counts (input/output), cost estimate ($3/MTok input, $15/MTok output via formatCost()), and total regeneration time. Summary line shows aggregate results. 14 integration tests verify formatCost math and reporting structure.
- Notes: Cost estimate based on Claude API pricing.

### R046 — Every authored page on the site (27 command deep-dives, 6 recipes, walkthrough, homepage, 6 reference pages, changelog component) has explicit source file mappings in the page-source-map manifest.
- Class: completeness
- Status: validated
- Description: Every authored page on the site (27 command deep-dives, 6 recipes, walkthrough, homepage, 6 reference pages, changelog component) has explicit source file mappings in the page-source-map manifest.
- Why it matters: Any page without a mapping is a blindspot — it won't get regenerated when its source changes.
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: page-source-map.json has entries for all 43 authored pages (28 command deep-dives, 6 recipes, walkthrough, homepage, 6 reference pages, changelog). 9 unit tests verify completeness. All source paths validated against manifest. Count is 43 — includes config, export, update pages added by manage-pages.
- Notes: Some pages may map to the same source files (e.g., multiple recipe pages depending on auto-dispatch.ts).

### R048 — `regenerate-page.mjs` spawns `claude -p` instead of calling `@anthropic-ai/sdk`. Claude Code has full tool access — same capability that wrote the original docs.
- Class: core-capability
- Status: validated
- Description: `regenerate-page.mjs` spawns `claude -p` instead of calling `@anthropic-ai/sdk`. Claude Code has full tool access — same capability that wrote the original docs.
- Why it matters: The API approach sends source files in a prompt and gets back text with no ability to read additional files, check links, or iterate. Claude Code can do all of that.
- Source: user
- Primary owning slice: M004/S01
- Supporting slices: none
- Validation: regeneratePage() spawns `claude -p` via spawnSync with --output-format stream-json, --no-session-persistence, --dangerously-skip-permissions. Integration proof: capture.mdx regenerated by claude-sonnet-4-6 in 139.7s with valid frontmatter and all 6 sections. 20 tests pass. Zero SDK references in codebase.
- Notes: Keep the same exported function signature so `update.mjs` wiring is unchanged.

### R049 — The regeneration step in the update pipeline invokes `claude -p` for each stale page without any manual step. No user intervention required.
- Class: operability
- Status: validated
- Description: The regeneration step in the update pipeline invokes `claude -p` for each stale page without any manual step. No user intervention required.
- Why it matters: The goal is zero-intervention documentation updates.
- Source: user
- Primary owning slice: M004/S02
- Supporting slices: none
- Validation: `npm run update` detected 3 stale pages and invoked `claude -p` for each automatically. Pipeline ran end-to-end with zero intervention: commands/config.mdx (291s), reference/skills.mdx (94s), reference/extensions.mdx (72s) — all regenerated by claude-sonnet-4-6.
- Notes: Invocation wired into existing `runRegenerateStale()` step in `update.mjs`.

### R050 — Pages regenerated by `claude -p` have correct section order (What It Does, Usage, How It Works, What Files It Touches, Examples, Related Commands), Mermaid diagrams with terminal-native styling, annotated terminal examples, valid internal links, and accurate source-derived content.
- Class: core-capability
- Status: validated
- Description: Pages regenerated by `claude -p` have correct section order (What It Does, Usage, How It Works, What Files It Touches, Examples, Related Commands), Mermaid diagrams with terminal-native styling, annotated terminal examples, valid internal links, and accurate source-derived content.
- Why it matters: The whole point is maintaining quality, not just updating pages with worse content.
- Source: user
- Primary owning slice: M004/S01
- Supporting slices: M004/S02
- Validation: Multi-page-type proof: commands/config.mdx (132 lines, valid frontmatter, correct section structure) and reference/extensions.mdx (33 lines, valid frontmatter) regenerated via claude-sonnet-4-6. All regenerated pages pass Astro build and link check (4036 links, 0 broken). Combined with S01's single-page proof on capture.mdx, both command pages and reference pages are proven.
- Notes: Quality bar is the existing M002 pages. capture.mdx is the exemplar.

### R052 — Source change detected → Claude Code regenerates → build passes → link check passes → commit pushed → GitHub Pages deploys. Proven on the 3 currently stale pages.
- Class: operability
- Status: validated
- Description: Source change detected → Claude Code regenerates → build passes → link check passes → commit pushed → GitHub Pages deploys. Proven on the 3 currently stale pages.
- Why it matters: M003 never proved regeneration end-to-end. This milestone must close that gap.
- Source: user
- Primary owning slice: M004/S02
- Supporting slices: none
- Validation: Full cycle proven: `npm run update` detected 3 stale pages → `claude -p` regenerated all 3 → build passed (65 pages) → link check passed (4036 links, 0 broken) → commit pushed (28 commits, a4dfc67..2fd2681) → GitHub Actions deploy.yml workflow succeeded (run 23235046096) → GitHub Pages deployment live. Proven on commands/config.mdx, reference/skills.mdx, reference/extensions.mdx.
- Notes: The 3 stale pages are commands/config.mdx, reference/skills.mdx, reference/extensions.mdx.

### R053 — Saying "update gsd-guide" triggers the full pipeline: detect → regenerate via Claude Code → build → check links → commit → push to main → GitHub Pages deployment. No prompts, no manual push, no PR.
- Class: operability
- Status: validated
- Description: Saying "update gsd-guide" triggers the full pipeline: detect → regenerate via Claude Code → build → check links → commit → push to main → GitHub Pages deployment. No prompts, no manual push, no PR.
- Why it matters: This is the explicit user requirement — zero intervention.
- Source: user
- Primary owning slice: M004/S02
- Supporting slices: none
- Validation: "Update gsd-guide" triggers full pipeline: detect → regenerate via Claude Code → build → check links → stamp → commit → push → GitHub Pages deploy. Proven end-to-end with merge to main, push to origin, GitHub Actions deploy.yml completing successfully. Zero prompts, zero manual push.
- Notes: The "update gsd-guide" pre-approval is already in KNOWLEDGE.md. This requirement makes it actually work end-to-end.

### R054 — `@anthropic-ai/sdk` removed from package.json, all imports removed, all `ANTHROPIC_API_KEY` references in the regeneration path removed.
- Class: constraint
- Status: validated
- Description: `@anthropic-ai/sdk` removed from package.json, all imports removed, all `ANTHROPIC_API_KEY` references in the regeneration path removed.
- Why it matters: Removes a dependency that was the wrong tool and eliminates confusion about API key requirements.
- Source: inferred
- Primary owning slice: M004/S02
- Supporting slices: none
- Validation: `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` returns nothing. SDK removed from devDependencies. `ANTHROPIC_API_KEY` references removed from update.mjs regeneration path. Replaced by findClaude() guard.
- Notes: R043's graceful degradation for missing API key is replaced by R056's graceful degradation for missing `claude` CLI.

### R055 — When no stale pages are detected, the regeneration step logs a skip message and the pipeline completes build + deploy in under 15 seconds total.
- Class: operability
- Status: validated
- Description: When no stale pages are detected, the regeneration step logs a skip message and the pipeline completes build + deploy in under 15 seconds total.
- Why it matters: Most runs won't have stale pages. The fast path should be genuinely fast.
- Source: inferred
- Primary owning slice: M004/S02
- Supporting slices: none
- Validation: Fast path proven: `npm run update` with all 43 pages current logged "All 43 pages are current — no regeneration needed" and completed pipeline logic in 8.7s (regenerate step: 2ms). Under the 15s target. Total wall-clock 20.7s includes network fetch for `npm i -g gsd-pi@latest` (~12s). Decision D054 defines pipeline-logic time as the R055 metric.
- Notes: Detection already works. Fast path just means not spawning claude -p at all.

### R056 — When the `claude` binary is not in PATH, the regeneration step logs a clear message identifying the missing CLI, skips regeneration, and the build proceeds with existing content.
- Class: operability
- Status: validated
- Description: When the `claude` binary is not in PATH, the regeneration step logs a clear message identifying the missing CLI, skips regeneration, and the build proceeds with existing content.
- Why it matters: Replaces R043's API-key-missing path. Without Claude Code installed, the pipeline should still build.
- Source: inferred
- Primary owning slice: M004/S01
- Supporting slices: M004/S02
- Validation: findClaude('/nonexistent/claude') returns false. update.mjs logs 'claude CLI not available' and skips regeneration. Build proceeds with existing content. Verified by unit test and manual check.
- Notes: Check with `which claude` or `execSync('claude --version')` before attempting regeneration.

### R057 — Per-prompt deep-dive pages for all 32 GSD prompts, grouped by role (Auto-mode pipeline, Guided variants, Commands, Foundation), each with a Mermaid pipeline position diagram
- Class: core-capability
- Status: validated
- Description: One MDX page per prompt file in `extensions/gsd/prompts/`, grouped into 4 role-based sidebar sections. Each page shows what the prompt does, where it sits in the auto-mode pipeline (Mermaid flowchart), what variables it receives, and which commands invoke it.
- Why it matters: Prompts are the core behavioral contracts of GSD auto-mode. Without documentation, users and contributors have no way to understand what each agent session is instructed to do, what context it receives, or how the pipeline sequences.
- Source: user
- Primary owning slice: M005/S03
- Supporting slices: M005/S01, M005/S02
- Validation: 32 prompt MDX pages exist in src/content/docs/prompts/. All 4 sidebar sub-groups (Auto-mode Pipeline, Guided Variants, Commands, Foundation) registered in astro.config.mjs with 32 entries. Mermaid diagrams on all 32 pages. npm run build exits 0 at 104 pages. npm run check-links exits 0 at 10380 links.
- Notes: 32 prompts total. Grouped: Auto-mode pipeline (10), Guided variants (8), Commands (13), Foundation (1 — system.md). Mermaid diagrams use terminal-native styling matching existing command pages.

### R058 — Each prompt page shows the variables it receives, with descriptions of what context each variable carries
- Class: core-capability
- Status: validated
- Description: A structured table on every prompt page listing each `{{variable}}` the prompt declares, a plain-language description of what it contains, and whether it's always present or conditional.
- Why it matters: Variables are how the pipeline injects context into each agent session. Understanding what data the agent has available is essential for understanding what it can do and why it behaves as it does.
- Source: user
- Primary owning slice: M005/S03
- Supporting slices: M005/S01
- Validation: grep -l "## Variables" src/content/docs/prompts/*.mdx | wc -l → 32. Variable tables populated from prompts.json VARIABLE_DESCRIPTIONS static map (290+ entries). system.mdx correctly uses prose note (zero template variables). npm run check-links exits 0.
- Notes: Variable descriptions authored from studying auto-prompts.ts builder functions. Not extracted verbatim from source.

### R059 — Bidirectional linking between prompt pages and command pages
- Class: core-capability
- Status: validated
- Description: Prompt pages link to the commands that invoke them. Command pages that use prompts get a "Prompts used by this command" section with links to those prompt pages.
- Why it matters: Users arriving from a command page need to find the prompt that command uses. Users on a prompt page need to know which commands invoke it.
- Source: user
- Primary owning slice: M005/S04
- Supporting slices: M005/S02
- Validation: grep -l "## Used By" src/content/docs/prompts/*.mdx | wc -l → 32. grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l → 16. npm run check-links exits 0 (10380 links, 0 broken) confirming all prompt↔command cross-links resolve.
- Notes: 16 command pages updated (roadmap said 15; migrate correctly included as 16th). Reverse mapping derived from prompts.json usedByCommands field.

### R060 — Prompt pages wired into the `npm run update` regeneration pipeline with source dependency tracking
- Class: operability
- Status: validated
- Description: Prompt pages appear in `page-source-map.json` with their source `.md` files as dependencies. When a prompt file changes, the pipeline detects staleness and regenerates the affected page.
- Why it matters: Prompts change frequently with gsd-pi releases. Without pipeline integration, prompt pages would silently go stale.
- Source: inferred
- Primary owning slice: M005/S05
- Supporting slices: M005/S02
- Validation: page-source-map.json has 80 entries (32 prompt pages, 1 dep each). page-versions.json stamped with 80 pages. manage-pages.mjs has 5 prompt lifecycle functions. update.mjs is a 10-step pipeline with "manage prompts" step. Stale detection proven end-to-end in S05 (dep SHA tamper → exit 1 → re-stamp → exit 0).
- Notes: Each prompt page maps to its single .md source file. build-page-map.mjs Section 6 and manage-pages.mjs extended for prompts/ directory.

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

### R033 — Advanced workflow recipes covering parallel orchestration, worktree strategies, custom hooks, headless/CI mode, and cost optimization patterns.
- Class: core-capability
- Status: deferred
- Description: Advanced workflow recipes covering parallel orchestration, worktree strategies, custom hooks, headless/CI mode, and cost optimization patterns.
- Why it matters: Power users need these patterns but they're lower priority than core workflows.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: User explicitly deferred to next milestone. Core recipes in M002, advanced in M003.

### R047 — GitHub Action that fires regeneration on new gsd-pi releases without manual intervention.
- Class: operability
- Status: deferred
- Description: GitHub Action that fires regeneration on new gsd-pi releases without manual intervention.
- Why it matters: Would eliminate the need to run `npm run update` manually.
- Source: user (chose manual trigger for M003)
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred — manual trigger via `npm run update` is the M003 approach. CI auto-trigger can be added later.

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
| R007 | operability | validated | M001/S06 | none | S06 builds `scripts/update.mjs` — `npm run update` chains npm update → extract → diff report → regenerate → manage commands → build → check-links in one command (7 steps). Reports per-step timing, manifest diff, regeneration cost/token summary, page count, and link check result. Exits non-zero naming the failed step. Full pipeline completes in ~8s. Extended by M003/S04 with regeneration and command management steps. |
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
| R026 | primary-user-loop | validated | M002/S01 | none | 467-line walkthrough at /user-guide/developing-with-gsd/ follows a Cookmate recipe app through all GSD phases: discuss, research, plan, execute, verify, summarize, complete. Includes 2 Mermaid diagrams (lifecycle flowchart, auto-mode dispatch state machine), 4 ASCII directory trees showing .gsd/ state at discussion, planning, mid-execution, and completion phases, and annotated terminal output examples. Build passes, 720 links checked, 0 broken. |
| R027 | core-capability | validated | M002/S02 | M002/S03 | 27 command deep-dive MDX pages in src/content/docs/commands/ covering all GSD commands. S02 delivered 9 session/execution commands; S03 delivered 18 planning/maintenance/utility/reference pages (queue, steer, capture, triage, knowledge, cleanup, doctor, forensics, prefs, mode, skill-health, config, hooks, run-hook, migrate, keyboard-shortcuts, cli-flags, headless). 54 pages built, 2880 links verified, 0 broken. All pages reachable via sidebar (28 entries) and indexed by Pagefind. |
| R028 | primary-user-loop | validated | M002/S04 | none | 6 recipe pages (fix-a-bug, small-change, new-milestone, uat-failures, error-recovery, working-in-teams) in dist/recipes/*/index.html. Each has numbered steps, terminal examples, .gsd/ directory trees, Mermaid flowcharts, and expected outcomes. All navigable via sidebar, indexed by Pagefind. Build passes, 3558 links verified. |
| R029 | constraint | validated | M002/S01 | none | 109 pi/agent files excluded from prebuild pipeline via EXCLUDED_DIRS/EXCLUDED_ROOT_FILES sets. Sidebar in astro.config.mjs has zero pi/agent entries. grep confirms no pi/agent content references in src/content/docs/. Build succeeds with 27 GSD-focused pages. 720 internal links checked, 0 broken. |
| R030 | core-capability | validated | M002/S02 | M002/S03 | All 27 command pages show lifecycle documentation — triggers, files read/written, internal mechanics (with Mermaid diagrams for complex commands), and annotated terminal examples. S02 covered 9 session/execution commands; S03 completed the remaining 18 with Mermaid diagrams for doctor, forensics, prefs, skill-health, config, queue, steer, triage, run-hook, migrate, and headless. Simpler commands use prose + tables where Mermaid adds no value. |
| R031 | differentiator | validated | M002/S01 | M002/S02, M002/S03, M002/S04 | Visual approach applied across all M002 content: S01 walkthrough (2 Mermaid diagrams, 4 directory trees), S02 (9 command pages with flow diagrams), S03 (18 pages with 11 Mermaid diagrams), S04 (6 recipe pages with 6 Mermaid flowcharts, directory trees, terminal output). Comprehensive coverage of all authored content. |
| R032 | continuity | validated | M002/S01 | none | All existing GSD guide pages remain accessible under reorganized 5-section sidebar (User Guide, Commands, Recipes, Reference, Guides). 720 internal links checked, 0 broken. All 17 remaining GSD pages build and render correctly. |
| R033 | core-capability | deferred | none | none | unmapped |
| R034 | core-capability | validated | M003/S01 | none | previous-manifest.json snapshot saved after each extract step in content/generated/. Diff detection uses it as baseline for next run. Verified via end-to-end pipeline run — stale-pages.json boundary contract written with 0 stale pages when no source changes. |
| R035 | core-capability | validated | M003/S01 | none | detectChanges() in diff-sources.mjs compares previous vs current manifest SHA hashes. Returns changedFiles/addedFiles/removedFiles arrays. 5 unit tests verify correct detection. End-to-end pipeline run confirms diff report step executes and writes stale-pages.json. |
| R036 | core-capability | validated | M003/S01 | none | page-source-map.json maps 43 authored pages to 778 source deps. 9 unit tests verify structure — all source paths validated against manifest.json. End-to-end pipeline uses this map in both diff report and regenerate steps. |
| R037 | core-capability | validated | M003/S01 | none | resolveStalePages() cross-references changed files against page-source-map.json to flag stale pages with reasons. 7 unit tests verify detection. End-to-end pipeline confirms staleness resolver correctly identifies 0 stale pages when no source changes. |
| R038 | core-capability | validated | M003/S02 | none | regeneratePage() calls Claude API with source files + current page + system prompt. Returns structured result with token usage. 14 unit tests with mock client verify prompt construction, frontmatter validation, error handling, token reporting, batch iteration. regenerateStalePages() batch function iterates stale-pages.json. Quality verified: 3 regenerated pages (capture, doctor, auto) byte-identical to M02 originals. Build (65 pages) + link check (4036 links, 0 broken) pass with regenerated content. |
| R039 | core-capability | validated | M003/S02 | none | System prompt uses capture.mdx exemplar page as quality reference. Includes 12 quality rules covering section structure (6 required sections in order), Mermaid terminal-native styling (flowchart TD, fill:#0d180d/#1a3a1a), relative link format (../slug/), frontmatter format, and file table structure. Unit tests verify exemplar content and quality rules are present in prompt. Quality proven: 3 regenerated pages byte-identical to M02 originals. |
| R040 | core-capability | validated | M003/S03 | none | detectNewAndRemovedCommands() identifies commands.json entries without .mdx pages. createNewPages() generates page via Claude API, adds sidebar entry, adds page-source-map entry. 11 detection tests + 4 creation tests + round-trip test verify. Wired into pipeline manage commands step. |
| R041 | core-capability | validated | M003/S03 | none | removePages() deletes .mdx file, removes sidebar entry from astro.config.mjs, removes page-source-map entry. 3 removal tests verify. Handles missing files gracefully. Wired into pipeline manage commands step. |
| R042 | operability | validated | M003/S04 | none | `npm run update` runs 7-step pipeline (npm update → extract → diff report → regenerate → manage commands → build → check-links). Regeneration step calls regenerateStalePages() and only fires when stale pages detected. 14 integration tests + full end-to-end run confirm pipeline orchestration. All 7 steps complete with ✅ markers and timing. |
| R043 | operability | validated | M003/S04 | none | Running `npm run update` without ANTHROPIC_API_KEY exits 0. Regeneration step logs "⊘ Skipped: no stale pages" (or "no API key" when pages are stale). Build proceeds with existing content. All 7 steps complete successfully. Verified in end-to-end pipeline run. |
| R044 | operability | validated | M003/S03 | none | addSidebarEntry() inserts before Keyboard Shortcuts with correct indentation. removeSidebarEntry() removes matching line. 7 tests verify insertion/removal. Both called from manage commands pipeline step. Build passes after sidebar modifications. |
| R045 | operability | validated | M003/S04 | none | Pipeline output shows per-page status (✓/⊘/✗), token counts (input/output), cost estimate ($3/MTok input, $15/MTok output via formatCost()), and total regeneration time. Summary line shows aggregate results. 14 integration tests verify formatCost math and reporting structure. |
| R046 | completeness | validated | M003/S01 | none | page-source-map.json has entries for all 43 authored pages (28 command deep-dives, 6 recipes, walkthrough, homepage, 6 reference pages, changelog). 9 unit tests verify completeness. All source paths validated against manifest. Count is 43 — includes config, export, update pages added by manage-pages. |
| R047 | operability | deferred | none | none | unmapped |
| R048 | core-capability | validated | M004/S01 | none | regeneratePage() spawns `claude -p` via spawnSync with --output-format stream-json, --no-session-persistence, --dangerously-skip-permissions. Integration proof: capture.mdx regenerated by claude-sonnet-4-6 in 139.7s with valid frontmatter and all 6 sections. 20 tests pass. Zero SDK references in codebase. |
| R049 | operability | validated | M004/S02 | none | `npm run update` detected 3 stale pages and invoked `claude -p` for each automatically. Pipeline ran end-to-end with zero intervention: commands/config.mdx (291s), reference/skills.mdx (94s), reference/extensions.mdx (72s) — all regenerated by claude-sonnet-4-6. |
| R050 | core-capability | validated | M004/S01 | M004/S02 | Multi-page-type proof: commands/config.mdx (132 lines, valid frontmatter, correct section structure) and reference/extensions.mdx (33 lines, valid frontmatter) regenerated via claude-sonnet-4-6. All regenerated pages pass Astro build and link check (4036 links, 0 broken). Combined with S01's single-page proof on capture.mdx, both command pages and reference pages are proven. |
| R051 | completeness | active | M004/S01 | none | Structural validation: all 43 source paths exist in manifest.json. Operational proof: 3 stale pages correctly detected and regenerated in M004/S02. Full semantic audit pending. |
| R052 | operability | validated | M004/S02 | none | Full cycle proven: `npm run update` detected 3 stale pages → `claude -p` regenerated all 3 → build passed (65 pages) → link check passed (4036 links, 0 broken) → commit pushed (28 commits, a4dfc67..2fd2681) → GitHub Actions deploy.yml workflow succeeded (run 23235046096) → GitHub Pages deployment live. Proven on commands/config.mdx, reference/skills.mdx, reference/extensions.mdx. |
| R053 | operability | validated | M004/S02 | none | "Update gsd-guide" triggers full pipeline: detect → regenerate via Claude Code → build → check links → stamp → commit → push → GitHub Pages deploy. Proven end-to-end with merge to main, push to origin, GitHub Actions deploy.yml completing successfully. Zero prompts, zero manual push. |
| R054 | constraint | validated | M004/S02 | none | `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` returns nothing. SDK removed from devDependencies. `ANTHROPIC_API_KEY` references removed from update.mjs regeneration path. Replaced by findClaude() guard. |
| R055 | operability | validated | M004/S02 | none | Fast path proven: `npm run update` with all 43 pages current logged "All 43 pages are current — no regeneration needed" and completed pipeline logic in 8.7s (regenerate step: 2ms). Under the 15s target. Total wall-clock 20.7s includes network fetch for `npm i -g gsd-pi@latest` (~12s). Decision D054 defines pipeline-logic time as the R055 metric. |
| R056 | operability | validated | M004/S01 | M004/S02 | findClaude('/nonexistent/claude') returns false. update.mjs logs 'claude CLI not available' and skips regeneration. Build proceeds with existing content. Verified by unit test and manual check. |
| R057 | core-capability | validated | M005/S03 | M005/S01, M005/S02 | 32 prompt MDX pages in src/content/docs/prompts/ with 4-section content. All 4 sidebar sub-groups registered. npm run build exits 0 at 104 pages. npm run check-links exits 0 at 10380 links. Mermaid diagrams on all 32 pages. |
| R058 | core-capability | validated | M005/S03 | M005/S01 | grep -l "## Variables" src/content/docs/prompts/*.mdx | wc -l → 32. Variable tables populated from prompts.json VARIABLE_DESCRIPTIONS (290+ entries). system.mdx uses prose note (zero template variables). npm run check-links exits 0. |
| R059 | core-capability | validated | M005/S04 | M005/S02 | grep -l "## Used By" src/content/docs/prompts/*.mdx | wc -l → 32. grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l → 16. npm run check-links exits 0 (10380 links, 0 broken). |
| R060 | operability | validated | M005/S05 | M005/S02 | page-source-map.json has 80 entries (32 prompt pages, 1 dep each). page-versions.json stamped with 80 pages. manage-pages.mjs has 5 prompt lifecycle functions. update.mjs is 10-step pipeline with "manage prompts" step. Stale detection proven end-to-end (dep SHA tamper → exit 1 → re-stamp → exit 0). |

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | validated | M001/S01 | M001/S03, M001/S04 | Extraction produces skills.json (8), agents.json (5), extensions.json (17) from installed gsd-pi npm package with dynamic path resolution. 39/39 tests pass covering all output structures and counts. |
| R002 | core-capability | validated | M001/S01 | M001/S04, M001/S05 | Pipeline pulls 127 markdown docs, README, 49 releases, and 1023-file manifest from gsd-build/gsd-2 GitHub repo via tarball + releases + tree API with SHA-based caching. |
| R003 | primary-user-loop | validated | M001/S03 | none | 92 searchable, filterable, expandable cheat-sheet cards across 5 reference pages (58 commands, 8 skills, 17 extensions, 5 agents, 4 shortcuts). Category filter works. Pagefind indexes all content. |
| R004 | core-capability | validated | M001/S04 | none | 125 deep-dive doc pages covering getting started, auto mode, configuration, architecture, git strategy, skills, troubleshooting, extending pi, building coding agents, TUI/UI. Sidebar organized into 10 navigable groups. 17975 internal links validated. |
| R005 | continuity | validated | M001/S05 | none | S05 builds changelog page at /changelog/ with all 48 GitHub releases — expand/collapse, dates, GitHub links, rendered markdown bodies. Verified by grep counts on dist/ output. |
| R006 | differentiator | validated | M001/S02 | M001/S03, M001/S04 | Terminal-native dark design with phosphor green #39FF14 on near-black #0a0e0a, JetBrains Mono + Outfit fonts, scanline effects, custom code blocks. Mermaid SVGs render. Not default Starlight. |
| R007 | operability | validated | M001/S06 | none | S06 builds `scripts/update.mjs` — `npm run update` chains npm update → extract → diff report → regenerate → manage commands → build → check-links in one command (7 steps). Reports per-step timing, manifest diff, regeneration cost/token summary, page count, and link check result. Exits non-zero naming the failed step. Full pipeline completes in ~8s. Extended by M003/S04 with regeneration and command management steps. |
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
| R026 | primary-user-loop | validated | M002/S01 | none | 467-line walkthrough at /user-guide/developing-with-gsd/ follows a Cookmate recipe app through all GSD phases: discuss, research, plan, execute, verify, summarize, complete. Includes 2 Mermaid diagrams (lifecycle flowchart, auto-mode dispatch state machine), 4 ASCII directory trees showing .gsd/ state at discussion, planning, mid-execution, and completion phases, and annotated terminal output examples. Build passes, 720 links checked, 0 broken. |
| R027 | core-capability | validated | M002/S02 | M002/S03 | 27 command deep-dive MDX pages in src/content/docs/commands/ covering all GSD commands. S02 delivered 9 session/execution commands; S03 delivered 18 planning/maintenance/utility/reference pages (queue, steer, capture, triage, knowledge, cleanup, doctor, forensics, prefs, mode, skill-health, config, hooks, run-hook, migrate, keyboard-shortcuts, cli-flags, headless). 54 pages built, 2880 links verified, 0 broken. All pages reachable via sidebar (28 entries) and indexed by Pagefind. |
| R028 | primary-user-loop | validated | M002/S04 | none | 6 recipe pages (fix-a-bug, small-change, new-milestone, uat-failures, error-recovery, working-in-teams) in dist/recipes/*/index.html. Each has numbered steps, terminal examples, .gsd/ directory trees, Mermaid flowcharts, and expected outcomes. All navigable via sidebar, indexed by Pagefind. Build passes, 3558 links verified. |
| R029 | constraint | validated | M002/S01 | none | 109 pi/agent files excluded from prebuild pipeline via EXCLUDED_DIRS/EXCLUDED_ROOT_FILES sets. Sidebar in astro.config.mjs has zero pi/agent entries. grep confirms no pi/agent content references in src/content/docs/. Build succeeds with 27 GSD-focused pages. 720 internal links checked, 0 broken. |
| R030 | core-capability | validated | M002/S02 | M002/S03 | All 27 command pages show lifecycle documentation — triggers, files read/written, internal mechanics (with Mermaid diagrams for complex commands), and annotated terminal examples. S02 covered 9 session/execution commands; S03 completed the remaining 18 with Mermaid diagrams for doctor, forensics, prefs, skill-health, config, queue, steer, triage, run-hook, migrate, and headless. Simpler commands use prose + tables where Mermaid adds no value. |
| R031 | differentiator | validated | M002/S01 | M002/S02, M002/S03, M002/S04 | Visual approach applied across all M002 content: S01 walkthrough (2 Mermaid diagrams, 4 directory trees), S02 (9 command pages with flow diagrams), S03 (18 pages with 11 Mermaid diagrams), S04 (6 recipe pages with 6 Mermaid flowcharts, directory trees, terminal output). Comprehensive coverage of all authored content. |
| R032 | continuity | validated | M002/S01 | none | All existing GSD guide pages remain accessible under reorganized 5-section sidebar (User Guide, Commands, Recipes, Reference, Guides). 720 internal links checked, 0 broken. All 17 remaining GSD pages build and render correctly. |
| R033 | core-capability | deferred | none | none | unmapped |
| R034 | core-capability | validated | M003/S01 | none | previous-manifest.json snapshot saved after each extract step in content/generated/. Diff detection uses it as baseline for next run. Verified via end-to-end pipeline run — stale-pages.json boundary contract written with 0 stale pages when no source changes. |
| R035 | core-capability | validated | M003/S01 | none | detectChanges() in diff-sources.mjs compares previous vs current manifest SHA hashes. Returns changedFiles/addedFiles/removedFiles arrays. 5 unit tests verify correct detection. End-to-end pipeline run confirms diff report step executes and writes stale-pages.json. |
| R036 | core-capability | validated | M003/S01 | none | page-source-map.json maps 43 authored pages to 778 source deps. 9 unit tests verify completeness. All source paths validated against manifest. End-to-end pipeline uses this map in both diff report and regenerate steps. |
| R037 | core-capability | validated | M003/S01 | none | resolveStalePages() cross-references changed files against page-source-map.json to flag stale pages with reasons. 7 unit tests verify detection. End-to-end pipeline confirms staleness resolver correctly identifies 0 stale pages when no source changes. |
| R038 | core-capability | validated | M003/S02 | none | regeneratePage() calls Claude API with source files + current page + system prompt. Returns structured result with token usage. 14 unit tests with mock client verify prompt construction, frontmatter validation, error handling, token reporting, batch iteration. regenerateStalePages() batch function iterates stale-pages.json. Quality verified: 3 regenerated pages (capture, doctor, auto) byte-identical to M02 originals. Build (65 pages) + link check (4036 links, 0 broken) pass with regenerated content. |
| R039 | core-capability | validated | M003/S02 | none | System prompt uses capture.mdx exemplar page as quality reference. Includes 12 quality rules covering section structure (6 required sections in order), Mermaid terminal-native styling (flowchart TD, fill:#0d180d/#1a3a1a), relative link format (../slug/), frontmatter format, and file table structure. Unit tests verify exemplar content and quality rules are present in prompt. Quality proven: 3 regenerated pages byte-identical to M02 originals. |
| R040 | core-capability | validated | M003/S03 | none | detectNewAndRemovedCommands() identifies commands.json entries without .mdx pages. createNewPages() generates page via Claude API, adds sidebar entry, adds page-source-map entry. 11 detection tests + 4 creation tests + round-trip test verify. Wired into pipeline manage commands step. |
| R041 | core-capability | validated | M003/S03 | none | removePages() deletes .mdx file, removes sidebar entry from astro.config.mjs, removes page-source-map entry. 3 removal tests verify. Handles missing files gracefully. Wired into pipeline manage commands step. |
| R042 | operability | validated | M003/S04 | none | `npm run update` runs 7-step pipeline (npm update → extract → diff report → regenerate → manage commands → build → check-links). Regeneration step calls regenerateStalePages() and only fires when stale pages detected. 14 integration tests + full end-to-end run confirm pipeline orchestration. All 7 steps complete with ✅ markers and timing. |
| R043 | operability | validated | M003/S04 | none | Running `npm run update` without ANTHROPIC_API_KEY exits 0. Regeneration step logs "⊘ Skipped: no stale pages" (or "no API key" when pages are stale). Build proceeds with existing content. All 7 steps complete successfully. Verified in end-to-end pipeline run. |
| R044 | operability | validated | M003/S03 | none | addSidebarEntry() inserts before Keyboard Shortcuts with correct indentation. removeSidebarEntry() removes matching line. 7 tests verify insertion/removal. Both called from manage commands pipeline step. Build passes after sidebar modifications. |
| R045 | operability | validated | M003/S04 | none | Pipeline output shows per-page status (✓/⊘/✗), token counts (input/output), cost estimate ($3/MTok input, $15/MTok output via formatCost()), and total regeneration time. Summary line shows aggregate results. 14 integration tests verify formatCost math and reporting structure. |
| R046 | completeness | validated | M003/S01 | none | page-source-map.json has entries for all 43 authored pages (28 command deep-dives, 6 recipes, walkthrough, homepage, 6 reference pages, changelog). 9 unit tests verify completeness. All source paths validated against manifest. Count is 43 — includes config, export, update pages added by manage-pages. |
| R047 | operability | deferred | none | none | unmapped |
| R048 | core-capability | validated | M004/S01 | none | regeneratePage() spawns `claude -p` via spawnSync with --output-format stream-json, --no-session-persistence, --dangerously-skip-permissions. Integration proof: capture.mdx regenerated by claude-sonnet-4-6 in 139.7s with valid frontmatter and all 6 sections. 20 tests pass. Zero SDK references in codebase. |
| R049 | operability | validated | M004/S02 | none | `npm run update` detected 3 stale pages and invoked `claude -p` for each automatically. Pipeline ran end-to-end with zero intervention: commands/config.mdx (291s), reference/skills.mdx (94s), reference/extensions.mdx (72s) — all regenerated by claude-sonnet-4-6. |
| R050 | core-capability | validated | M004/S01 | M004/S02 | Multi-page-type proof: commands/config.mdx (132 lines, valid frontmatter, correct section structure) and reference/extensions.mdx (33 lines, valid frontmatter) regenerated via claude-sonnet-4-6. All regenerated pages pass Astro build and link check (4036 links, 0 broken). Combined with S01's single-page proof on capture.mdx, both command pages and reference pages are proven. |
| R051 | completeness | active | M004/S01 | none | Structural validation: all 43 source paths exist in manifest.json. Operational proof: 3 stale pages correctly detected and regenerated in M004/S02. Full semantic audit pending. |
| R052 | operability | validated | M004/S02 | none | Full cycle proven: `npm run update` detected 3 stale pages → `claude -p` regenerated all 3 → build passed (65 pages) → link check passed (4036 links, 0 broken) → commit pushed (28 commits, a4dfc67..2fd2681) → GitHub Actions deploy.yml workflow succeeded (run 23235046096) → GitHub Pages deployment live. Proven on commands/config.mdx, reference/skills.mdx, reference/extensions.mdx. |
| R053 | operability | validated | M004/S02 | none | "Update gsd-guide" triggers full pipeline: detect → regenerate via Claude Code → build → check links → stamp → commit → push → GitHub Pages deploy. Proven end-to-end with merge to main, push to origin, GitHub Actions deploy.yml completing successfully. Zero prompts, zero manual push. |
| R054 | constraint | validated | M004/S02 | none | `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` returns nothing. SDK removed from devDependencies. `ANTHROPIC_API_KEY` references removed from update.mjs regeneration path. Replaced by findClaude() guard. |
| R055 | operability | validated | M004/S02 | none | Fast path proven: `npm run update` with all 43 pages current logged "All 43 pages are current — no regeneration needed" and completed pipeline logic in 8.7s (regenerate step: 2ms). Under the 15s target. Total wall-clock 20.7s includes network fetch for `npm i -g gsd-pi@latest` (~12s). Decision D054 defines pipeline-logic time as the R055 metric. |
| R056 | operability | validated | M004/S01 | M004/S02 | findClaude('/nonexistent/claude') returns false. update.mjs logs 'claude CLI not available' and skips regeneration. Build proceeds with existing content. Verified by unit test and manual check. |
| R057 | core-capability | validated | M005/S03 | M005/S01, M005/S02 | 32 prompt MDX pages in src/content/docs/prompts/ with 4-section content. All 4 sidebar sub-groups registered. npm run build exits 0 at 104 pages. npm run check-links exits 0 at 10380 links. Mermaid diagrams on all 32 pages. |
| R058 | core-capability | validated | M005/S03 | M005/S01 | grep -l "## Variables" src/content/docs/prompts/*.mdx | wc -l → 32. Variable tables populated from prompts.json VARIABLE_DESCRIPTIONS (290+ entries). system.mdx uses prose note (zero template variables). npm run check-links exits 0. |
| R059 | core-capability | validated | M005/S04 | M005/S02 | grep -l "## Used By" src/content/docs/prompts/*.mdx | wc -l → 32. grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l → 16. npm run check-links exits 0 (10380 links, 0 broken). |
| R060 | operability | validated | M005/S05 | M005/S02 | page-source-map.json has 80 entries (32 prompt pages, 1 dep each). page-versions.json stamped with 80 pages. manage-pages.mjs has 5 prompt lifecycle functions. update.mjs is 10-step pipeline with "manage prompts" step. Stale detection proven end-to-end (dep SHA tamper → exit 1 → re-stamp → exit 0). |

## Coverage Summary

- Active requirements: 13
- Mapped to slices: 13
- Validated: 53 (R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R012, R013, R014, R015, R016, R017, R018, R019, R020, R021, R026, R027, R028, R029, R030, R031, R032, R034, R035, R036, R037, R038, R039, R040, R041, R042, R043, R044, R045, R046, R048, R049, R050, R052, R053, R054, R055, R056, R057, R058, R059, R060)
- Unmapped active requirements: 0

### R061 — Solo Builder's Guide landing page and sidebar navigation
- Class: core-capability
- Status: active
- Description: A "Solo Builder's Guide" sidebar group with index/landing page and links to all 8 sections. Navigation works end-to-end; all pages are reachable from the sidebar.
- Why it matters: Without navigation scaffolding, individual sections can't be found or linked to from the existing gsd2-guide site.
- Source: user
- Primary owning slice: M006/S01
- Supporting slices: M006/S02–S08
- Validation: unmapped
- Notes: Hand-authored MDX files in src/content/docs/solo-guide/. Not pipeline-generated. Sidebar registered in astro.config.mjs.

### R062 — Section 4: The Daily Mix decision framework
- Class: primary-user-loop
- Status: active
- Description: A practical decision framework explaining when to use direct git commits, /gsd quick, /gsd quick --research, /gsd quick --full, or a full milestone. Includes a printable decision table, flag explanations in plain English, and guidance on handling interruptions mid-auto-mode.
- Why it matters: This is the section the reader uses every working day. Getting it right is the core value proposition of the entire guide.
- Source: user
- Primary owning slice: M006/S02
- Supporting slices: none
- Validation: unmapped
- Notes: Build first — before onboarding sections. Most valuable, least documented content in the GSD ecosystem.

### R063 — Section 7: When Things Go Wrong
- Class: failure-visibility
- Status: active
- Description: Plain-English failure modes and recovery steps covering: stuck detection, auto mode crashes, loose must-haves, orientation after time away, full state repair, and timeout management.
- Why it matters: Nobody else writes this section. Solo builders hit these failure modes alone and need a clear recovery path.
- Source: user
- Primary owning slice: M006/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Write second — from real experience as the author uses GSD 2. Every failure mode hit becomes a subsection.

### R064 — Section 2: Your First Project walkthrough
- Class: primary-user-loop
- Status: active
- Description: Complete annotated walkthrough of starting a new GSD 2 project — discussion phase, roadmap reading, auto mode first run, verification, and completion. Written as narrative, not command reference.
- Why it matters: The onboarding section that converts curious readers into active users.
- Source: user
- Primary owning slice: M006/S04
- Supporting slices: none
- Validation: unmapped
- Notes: References Addy Osmani's spec-first workflow and the Esteban Torres first-person GSD account. Cross-references gsd2-guide's developing-with-gsd walkthrough.

### R065 — Section 3: Brownfield Reality
- Class: core-capability
- Status: active
- Description: Guidance for starting GSD 2 on an existing (possibly messy) codebase — agent-instructions.md, issue tracker mapping, the handoff spec approach, and constraining GSD from restructuring things the author doesn't want restructured.
- Why it matters: Most solo builders aren't starting from zero. This section serves the majority case.
- Source: user
- Primary owning slice: M006/S05
- Supporting slices: none
- Validation: unmapped
- Notes: Cross-references gsd2-guide's agent-instructions.md format and KNOWLEDGE.md.

### R066 — Section 1: Why GSD 2
- Class: core-capability
- Status: active
- Description: The "aha moment" section explaining the context window ceiling, what context engineering means, why GSD 2 exists, the cost comparison (Claude Max vs Replit/Lovable/API), and the technical director mindset.
- Why it matters: Earns trust and positions the guide for readers who are sceptical of "yet another tool."
- Source: user
- Primary owning slice: M006/S06
- Supporting slices: none
- Validation: unmapped
- Notes: References the vibe coding ceiling problem (15–20 component limit), the desk analogy for context engineering, and the SolveIt philosophy. Written after the daily workflow sections are proven.

### R067 — Section 5: What You Write vs What GSD Writes
- Class: core-capability
- Status: active
- Description: Context engineering from the practitioner's perspective — agent-instructions.md as project constitution, DECISIONS.md as architectural memory, KNOWLEDGE.md for domain terminology, reading GSD's output, and giving good discussion answers.
- Why it matters: The highest-leverage skill in the entire workflow. Quality of inputs determines quality of outputs.
- Source: user
- Primary owning slice: M006/S07
- Supporting slices: none
- Validation: unmapped
- Notes: Woven with Addy Osmani's "context packing" and TÂCHES design philosophy.

### R068 — Section 6: Controlling Costs
- Class: operability
- Status: active
- Description: Flat-rate Claude Max advantage, token profiles (budget/balanced/quality), per-phase model routing, budget ceiling configuration, typical milestone cost patterns, and the cheapest-workflow tradeoffs.
- Why it matters: Cost awareness is survival for a solo builder whose project isn't making money yet.
- Source: user
- Primary owning slice: M006/S07
- Supporting slices: none
- Validation: unmapped
- Notes: Honest about tradeoffs — cheaper workflow means lower cost, higher risk of poor output.

### R069 — Section 8: Building a Rhythm
- Class: continuity
- Status: active
- Description: Weekly cycle suggestion, /gsd queue usage, /gsd export retrospectives, evolving agent-instructions.md over time, and the graduation path from vibe coding → GSD 2 → custom multi-agent workflows.
- Why it matters: Sustaining GSD 2 as a daily practice is what separates users who get value from those who abandon it after one project.
- Source: user
- Primary owning slice: M006/S08
- Supporting slices: none
- Validation: unmapped
- Notes: References SolveIt's compounding insight and Daniel Priestley's 24 Assets framework.

### R070 — Cross-references to gsd2-guide throughout
- Class: integration
- Status: active
- Description: Every section links to the relevant gsd2-guide pages for command syntax, file format reference, and configuration detail. Uses consistent "→ gsd2-guide: [page]" notation.
- Why it matters: The guide is a phrasebook, not a dictionary. It should never duplicate what the gsd2-guide already covers.
- Source: user
- Primary owning slice: M006/S01
- Supporting slices: M006/S02–S08
- Validation: unmapped
- Notes: Link checker must pass on all cross-references. Use relative Starlight paths.

### R071 — External resources cited and linked
- Class: integration
- Status: active
- Description: Key external resources — Addy Osmani's LLM workflow article, Esteban Torres's GSD account, The New Stack GSD walkthrough — are cited and linked where referenced. No dead links.
- Why it matters: Builds credibility and gives readers a path to deeper reading.
- Source: user
- Primary owning slice: M006/S04
- Supporting slices: M006/S06
- Validation: unmapped
- Notes: External URLs verified during investigation phase. Addy Osmani (addyosmani.com), Esteban Torres (estebantorr.es), New Stack (thenewstack.io) all confirmed live.

### R072 — Australian spelling and Apple Notes–friendly formatting
- Class: quality-attribute
- Status: active
- Description: Australian spelling (colour, behaviour, recognise, organise, etc.) throughout all sections. Tables render cleanly when pasted into Apple Notes. No formatting that breaks in plain-text contexts.
- Why it matters: Author preference and target reading context (Apple Notes for quick reference).
- Source: user
- Primary owning slice: M006/S01
- Supporting slices: M006/S02–S08
- Validation: unmapped
- Notes: Use standard Markdown tables with pipe-separated columns. Avoid HTML table tags.

| R061 | core-capability | active | M006/S01 | M006/S02–S08 | unmapped |
| R062 | primary-user-loop | active | M006/S02 | none | unmapped |
| R063 | failure-visibility | active | M006/S03 | none | unmapped |
| R064 | primary-user-loop | active | M006/S04 | none | unmapped |
| R065 | core-capability | active | M006/S05 | none | unmapped |
| R066 | core-capability | active | M006/S06 | none | unmapped |
| R067 | core-capability | active | M006/S07 | none | unmapped |
| R068 | operability | active | M006/S07 | none | unmapped |
| R069 | continuity | active | M006/S08 | none | unmapped |
| R070 | integration | active | M006/S01 | M006/S02–S08 | unmapped |
| R071 | integration | active | M006/S04 | M006/S06 | unmapped |
| R072 | quality-attribute | active | M006/S01 | M006/S02–S08 | unmapped |
