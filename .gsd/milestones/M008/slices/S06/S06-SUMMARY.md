---
id: S06
parent: M008
milestone: M008
provides:
  - choose-your-path.mdx: persona-aware reading path router for all 3 personas
  - is-gsd-right-for-me.md: rewritten as persona decision tree routing to choose-your-path
  - coming-from-replit.mdx, coming-from-lovable.mdx, coming-from-cursor.mdx: bridge pages for platform migrants
  - faq.mdx: 11 Q&As for common objections
  - glossary.md: 25 GSD terms defined
  - Sidebar entries for Choose Your Path, FAQ, Glossary in astro.config.mjs
requires:
  []
affects:
  []
key_files:
  - src/content/docs/choose-your-path.mdx
  - src/content/docs/is-gsd-right-for-me.md
  - src/content/docs/coming-from-replit.mdx
  - src/content/docs/coming-from-lovable.mdx
  - src/content/docs/coming-from-cursor.mdx
  - src/content/docs/faq.mdx
  - src/content/docs/glossary.md
  - astro.config.mjs
key_decisions:
  - Is GSD Right for Me kept as .md (no MDX components needed)
  - Bridge pages unlisted (no sidebar entries) — discoverable only via links
  - Bridge pages use comparison tables for quick visual scanning
  - Glossary kept as .md; FAQ uses .mdx for tip callout
  - Bridge page links omitted from is-gsd-right-for-me.md in T01 and added by T02
patterns_established:
  - Hand-authored MDX persona-routing pattern: intro → quick assessment table → 'Where are you coming from?' with 3 persona sections each linking to a specific anchor on choose-your-path
  - Bridge page pattern: comparison table (old tool vs GSD), key differences prose, route to appropriate learning path via choose-your-path
  - Unlisted bridge pages are sidebar-excluded but fully linked from routing pages — no orphan pages
observability_surfaces:
  - none
drill_down_paths:
  - .gsd/milestones/M008/slices/S06/tasks/T01-SUMMARY.md
  - .gsd/milestones/M008/slices/S06/tasks/T02-SUMMARY.md
duration: ""
verification_result: passed
completed_at: 2026-04-02T19:46:37.872Z
blocker_discovered: false
---

# S06: New Content Pages

**Created 7 new content pages (Choose Your Path, Is GSD Right for Me rewrite, 3 bridge pages, FAQ, Glossary) wired into sidebar with zero broken links.**

## What Happened

S06 created all 7 planned content pages across 3 tasks.

**T01** created `choose-your-path.mdx` with three numbered reading-path checklists (Solo Business Builder, Developer New to AI Coding, Experienced AI Developer), each listing 7–12 existing pages in recommended reading order with annotations and a secondary tier. It also rewrote `is-gsd-right-for-me.md` — retaining the quick assessment table and adding a "Where are you coming from?" section that routes readers to the matching Choose Your Path anchor. Bridge page links were intentionally deferred to T02. Build: 151 pages, 0 errors.

**T02** created 5 additional pages: 3 bridge pages (`coming-from-replit.mdx`, `coming-from-lovable.mdx`, `coming-from-cursor.mdx`) using comparison tables to orient users from those platforms; `faq.mdx` covering 11 common questions/objections with links to relevant pages; and `glossary.md` with 25 GSD-specific terms in alphabetical order. Bridge pages were left unlisted (no sidebar entries) pending T03. Build: 156 pages, 0 errors.

**T03** wired Choose Your Path, FAQ, and Glossary into `astro.config.mjs`: Choose Your Path and FAQ added to the Start Here section; Glossary added to the Learn More section. Bridge pages deliberately excluded from sidebar (they are unlisted discovery pages). Full build + link check confirmed 156 pages and 22,208 internal links with 0 broken.

## Verification

npm run build: 156 pages, exit 0. npm run check-links: 22,208 internal links, 0 broken. All 7 files confirmed present via test -f.

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None. Bridge pages intentionally kept unlisted as specified in T03 constraints.

## Known Limitations

Bridge pages (coming-from-replit, coming-from-lovable, coming-from-cursor) are only discoverable via links from is-gsd-right-for-me.md and choose-your-path.mdx — they do not appear in the sidebar. This is intentional per the plan.

## Follow-ups

None.

## Files Created/Modified

- `src/content/docs/choose-your-path.mdx` — New: 3 persona reading paths with annotated page checklists
- `src/content/docs/is-gsd-right-for-me.md` — Rewritten: persona-routing decision tree with 'Where are you coming from?' section
- `src/content/docs/coming-from-replit.mdx` — New: bridge page for Replit users routing to Solo Builder path
- `src/content/docs/coming-from-lovable.mdx` — New: bridge page for Lovable users routing to Solo Builder path
- `src/content/docs/coming-from-cursor.mdx` — New: bridge page for Cursor users routing to Developer path
- `src/content/docs/faq.mdx` — New: FAQ with 11 questions covering cost, code requirements, workflow, safety
- `src/content/docs/glossary.md` — New: 25 GSD-specific terms defined alphabetically
- `astro.config.mjs` — Added Choose Your Path and FAQ to Start Here section; Glossary to Learn More section
