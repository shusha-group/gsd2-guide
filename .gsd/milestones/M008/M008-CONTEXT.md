# M008: Site Restructure & Persona Navigation

**Gathered:** 2026-04-02
**Status:** Ready for planning

## Project Description

Full restructure of the gsd2-guide documentation site. Reorganise ~148 pages from a system-oriented layout into a progressive-disclosure, persona-aware hub. Three personas (solo business builder, developer new to AI coding, experienced AI developer) self-select into curated reading paths through shared content. No content duplication — differentiation is in sequencing and entry points.

## Why This Milestone

The current site structure grew organically across 7 milestones. It has 8+ top-level sidebar sections, duplicated content across cost/skills/auto-mode topics, and a homepage that speaks only to developers who already know what "autonomous coding agent" means. Solo business builders — the largest growth audience — can't find their entry point. The restructure converts the site from "system documentation" to "learning hub."

## User-Visible Outcome

### When this milestone is complete, the user can:

- Land on the homepage and self-select into the right learning path within 10 seconds
- Follow a numbered reading checklist (Choose Your Path) tailored to their background
- Navigate a 5-section sidebar that progressively discloses complexity
- Find consolidated cost, skills/extensions, and auto-mode content in canonical locations
- Read "Coming from Replit/Lovable/Cursor" bridge pages that translate their existing mental model
- Use prev/next navigation through the Solo Guide and Next Steps blocks on every other page

### Entry point / environment

- Entry point: Browser at shusha-group.github.io/gsd2-guide
- Environment: GitHub Pages static site
- Live dependencies: none (static site, no API calls)

## Completion Class

- Contract complete means: all pages build, all links resolve, sidebar matches spec
- Integration complete means: cross-links between sections work, persona routing is end-to-end
- Operational complete means: deployed to GitHub Pages and accessible

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A solo builder can go homepage → persona card → learning path → first content page in ≤3 clicks
- An experienced dev can reach Commands reference from homepage in ≤2 clicks
- npm run check-links reports 0 broken internal links
- All 5 top-level sidebar sections appear in correct order on every page including homepage

## Risks and Unknowns

- Homepage nav bug — root cause unknown, could be Starlight-specific or build cache issue
- Moving 30+ pages in the sidebar risks breaking cross-references and bookmarks
- Starlight's `collapsed: true` on sidebar groups — confirmed supported via schema inspection
- Starlight does NOT have native breadcrumbs — Phase 4c may need a custom component or skip
- Merging 4 reference/skills pages into one may lose detail — need careful content audit

## Existing Codebase / Prior Art

- `astro.config.mjs` — 262-line sidebar config, the primary target for restructuring
- `src/content/docs/index.mdx` — 82-line homepage with hero frontmatter and CardGrid sections
- `src/content/docs/cost-management.md`, `token-optimization.md`, `dynamic-model-routing.md` — cost pages to consolidate
- `src/content/docs/skills.md`, `reference/skills.mdx`, `reference/extensions.mdx`, `reference/agents.mdx` — extensibility pages to merge
- `src/content/docs/auto-mode.md`, `how-auto-mode-works.mdx` — two auto-mode pages to deduplicate
- `src/components/Header.astro`, `Footer.astro` — custom Starlight component overrides
- `.generated-manifest.json` — pipeline-managed pages (do NOT add hand-authored pages here)

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions.

## Relevant Requirements

- R084–R097 — All M008 active requirements covering sidebar, content consolidation, homepage, cross-linking, and new content pages
- R098–R100 — Deferred visual content (terminal recording, screenshots, architecture diagram)

## Scope

### In Scope

- Phase 0: Fix homepage nav bug
- Phase 1: Sidebar restructure (5 sections, collapsed groups, all pages repositioned)
- Phase 2: Content consolidation (costs, skills/extensions/agents, auto-mode, cross-links)
- Phase 3: Homepage rewrite (persona cards, How GSD Works, Common Tasks, Go Deeper)
- Phase 4: Cross-linking (prev/next, Next Steps blocks, audience-bridging callouts)
- Phase 5: New content (Choose Your Path, rewritten Is GSD Right for Me, 3 bridge pages, FAQ, Glossary)

### Out of Scope / Non-Goals

- Phase 6 visual content (terminal recording, screenshots, architecture diagram) — deferred
- Breadcrumbs — Starlight v0.38 doesn't support native breadcrumbs; skip unless trivial custom component
- Content rewriting — pages move and get cross-links, but prose is not rewritten except where specified (Is GSD Right for Me, homepage)
- URL changes — preserve existing slugs via frontmatter where possible to avoid breaking external links

## Technical Constraints

- Starlight sidebar `collapsed: true` is supported (confirmed via schema)
- Starlight has built-in prev/next pagination (follows sidebar order)
- No native breadcrumb support in current Starlight version
- Hand-authored pages must NOT be added to `.generated-manifest.json`
- Australian English throughout

## Integration Points

- GitHub Pages — deploy via GitHub Actions on push to main
- `npm run check-links` — link validation after every structural change
- `scripts/prebuild.mjs` — must not conflict with sidebar restructure

## Open Questions

- Homepage nav bug root cause — needs diagnosis in Phase 0
- Whether auto-mode.md and how-auto-mode-works.mdx overlap enough to merge vs keep separate — decide during content audit in Phase 2
