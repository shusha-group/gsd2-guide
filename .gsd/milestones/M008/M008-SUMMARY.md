---
id: M008
title: "Site Restructure & Persona Navigation"
status: complete
completed_at: 2026-04-02T19:49:04.159Z
key_decisions:
  - Homepage uses template:doc (not splash) to ensure sidebar parity with all inner pages — no custom component overrides needed
  - Sidebar consolidation: absorb sibling sections as flat items into a parent section rather than nested sub-groups, except for Prompts which retains sub-groups with collapsed:true
  - Kept old cost pages (cost-management.md, token-optimization.md, dynamic-model-routing.md) with redirect notices rather than deleting them, to preserve inbound links
  - skills-extensions-agents.md is a conceptual guide only — pipeline-generated reference pages (reference/skills.mdx etc.) are never modified directly
  - Bridge pages (coming-from-replit, coming-from-lovable, coming-from-cursor) kept unlisted — discoverable only via links from routing pages
  - Persona card pattern: Card+CardGrid with description prose + markdown CTA link allows richer content than LinkCard
  - Pagination imported from virtual:starlight/components/Pagination (not relative path) and rendered above custom footer markup
  - Audience-bridging callouts appended to end of files to avoid disrupting existing section flow
key_files:
  - astro.config.mjs
  - src/content/docs/index.mdx
  - src/content/docs/choose-your-path.mdx
  - src/content/docs/is-gsd-right-for-me.md
  - src/content/docs/recipes/control-your-costs.md
  - src/content/docs/skills-extensions-agents.md
  - src/content/docs/auto-mode.md
  - src/content/docs/how-auto-mode-works.mdx
  - src/content/docs/faq.mdx
  - src/content/docs/glossary.md
  - src/content/docs/coming-from-replit.mdx
  - src/content/docs/coming-from-lovable.mdx
  - src/content/docs/coming-from-cursor.mdx
  - src/components/Footer.astro
  - content/generated/docs/auto-mode.md
  - content/generated/docs/getting-started.md
  - content/generated/docs/configuration.md
lessons_learned:
  - Starlight sidebar verification: the built HTML uses aria-label='Main' not aria-label='Sidebar' — task plans that grep for the latter will fail silently
  - Edit tool can fail silently on large files — always verify edits with grep before running the build
  - Generated content files (content/generated/docs/) must be edited at their source, not at the compiled output — the generated-manifest constraint is real and easy to miss
  - virtual:starlight/components/Pagination is the correct import path for the Pagination component in a Footer.astro override — relative paths won't work
  - Bridge pages can be fully linked and functional without sidebar entries — the unlisted pattern avoids sidebar clutter while keeping pages discoverable
  - Appending callouts to end of page is safer than mid-page insertion for large files with complex section structure
---

# M008: Site Restructure & Persona Navigation

**Transformed the gsd2-guide from a system-oriented docs site into a persona-aware learning hub with 5-section sidebar, 3 persona reading paths, 7 new content pages, site-wide pagination, and audience-bridging callouts throughout.**

## What Happened

M008 executed across 6 slices over a single day, restructuring the entire gsd2-guide documentation site.

S01 confirmed the pre-existing homepage fix (template:doc) that gave the homepage sidebar parity with all inner pages. S02 rewrote the astro.config.mjs sidebar from 10 top-level entries to exactly 5 sections (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More), preserving all link values and passing a 20,661-link check with 0 broken. S03 consolidated 3 cost pages into a single /recipes/control-your-costs/ recipe, created a unified Skills/Extensions/Agents conceptual guide, and deduplicated auto-mode content with mutual cross-links — 150 pages, 0 broken links. S04 rewrote the homepage with 3 persona cards (Choose Your Starting Point), a retained How GSD Works mermaid diagram, and Common Tasks + Go Deeper LinkCard sections. S05 restored site-wide prev/next pagination by adding Starlight's Pagination component to Footer.astro, and added :::tip audience-bridging callouts to 7+ pages (tip count rose from 6 to 16). S06 created 7 new content pages: choose-your-path.mdx with 3 annotated reading-path checklists, a rewritten is-gsd-right-for-me.md as a persona decision tree, 3 bridge pages (Replit, Lovable, Cursor) kept unlisted, faq.mdx with 11 Q&As, and glossary.md with 25 terms — all wired into the sidebar or discoverable via links.

Final state: 156 pages, 22,208 internal links, 0 broken.

## Success Criteria Results

- **5-section sidebar in correct order**: ✅ S02 confirmed via DOM inspection of dist/index.html — 5 `class="large"` spans in order: Start Here → Solo Builder's Guide → Recipes → Commands → Learn More.
- **Homepage sidebar matches inner pages**: ✅ S01 verified by diffing sidebar HTML between dist/index.html and dist/getting-started/index.html after stripping aria-current — identical.
- **3 persona cards on homepage**: ✅ S04 confirmed Card+CardGrid with Solo Business Builder, Developer New to AI Coding, Experienced AI Developer.
- **Choose Your Path page with 3 reading paths**: ✅ S06 created choose-your-path.mdx with 3 numbered checklists.
- **Control Your Costs recipe consolidated**: ✅ S03 merged 3 cost pages into /recipes/control-your-costs/.
- **Skills/Extensions/Agents merged**: ✅ S03 created skills-extensions-agents.md as unified conceptual guide.
- **Auto-mode deduplicated**: ✅ S03 focused auto-mode.md on practical usage and how-auto-mode-works.mdx on internals with mutual cross-links.
- **Audience-bridging callouts on 7+ pages**: ✅ S05 tip count rose from 6 to 16.
- **Prev/next pagination restored**: ✅ S05 added Pagination to Footer.astro.
- **FAQ and Glossary created**: ✅ S06 faq.mdx (11 Q&As) and glossary.md (25 terms) wired into sidebar.
- **0 broken links**: ✅ Final state: 22,208 links, 0 broken.

## Definition of Done Results

- **All slices complete**: ✅ S01, S02, S03, S04, S05, S06 all marked complete with passing verification.
- **All slice summaries exist**: ✅ S01-SUMMARY.md through S06-SUMMARY.md all present.
- **Build exits 0**: ✅ npm run build → 156 pages, exit 0.
- **0 broken links**: ✅ npm run check-links → 22,208 links, exit 0.
- **Non-.gsd/ code changes present**: ✅ 197 files changed vs main, including astro.config.mjs, all content pages, Footer.astro, and generated content.

## Requirement Outcomes

- **R084** — Validated. Evidence: npm run build exits 0 (156 pages), sidebar HTML diff between dist/index.html and dist/getting-started/index.html is identical after stripping aria-current (confirmed S01), npm run check-links exits 0 (22,208 links, 0 broken at final S06 state).

## Deviations

None.

## Follow-ups

Consider removing the 3 old cost pages (cost-management.md, token-optimization.md, dynamic-model-routing.md) once confident no inbound links exist — they currently have redirect notices but still appear in the build. Bridge pages could be promoted to the sidebar if analytics show they receive meaningful traffic via direct links.
