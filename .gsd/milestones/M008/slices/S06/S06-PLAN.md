# S06: New Content Pages

**Goal:** Create 7 new content pages (Choose Your Path, 3 bridge pages, FAQ, Glossary) and rewrite Is GSD Right for Me as a persona-routing decision tree. Wire all pages into sidebar and cross-link correctly.
**Demo:** After this: After this: Choose Your Path with 3 paths, rewritten Is GSD Right for Me, 3 bridge pages, FAQ, Glossary — all in sidebar and linking correctly.

## Tasks
- [x] **T01: Created choose-your-path.mdx with 3 persona reading paths and rewrote is-gsd-right-for-me.md as a persona-routing decision tree** — Create the Choose Your Path routing page with 3 numbered learning-path checklists (Solo Business Builder, Developer New to AI Coding, Experienced AI Developer). Each path lists 5-8 existing pages in recommended reading order with brief annotations. Rewrite Is GSD Right for Me from its current built-for/not-built-for structure into a persona-routing decision tree: 'Where are you coming from?' with 3 persona sections that route readers to the matching learning path on Choose Your Path. Both pages cross-reference each other.

Steps:
1. Read existing `src/content/docs/is-gsd-right-for-me.md` to understand current content.
2. Create `src/content/docs/choose-your-path.mdx` with 3 numbered reading-path checklists. Each path should list existing pages the persona should read in order, using `../page/` relative links. Solo Builder path emphasises solo-guide pages. Developer path emphasises recipes and commands. Experienced path emphasises architecture, auto-mode, extensions. Include a brief intro explaining the 3 personas per D076.
3. Rewrite `src/content/docs/is-gsd-right-for-me.md` (rename to `.mdx` if needed for components). Restructure as: quick assessment table (keep), then 'Where are you coming from?' with 3 persona sections (Coming from Replit/Lovable → Solo Builder, New to AI coding tools → Developer, Already using Claude Code → Experienced). Each section briefly describes the persona, links to the matching Choose Your Path section, and mentions relevant bridge pages (coming-from-replit etc — note these don't exist yet, will be created in T02).
4. Verify all links in both pages point to existing pages (except bridge pages which come in T02).
5. Run `npm run build` to confirm both pages build without errors.

Constraints:
- Use `../page/` relative link format (Starlight convention)
- Hand-authored pages must NOT go in .generated-manifest.json
- Australian English throughout
- Escape any curly braces in MDX with backticks
  - Estimate: 45m
  - Files: src/content/docs/choose-your-path.mdx, src/content/docs/is-gsd-right-for-me.md
  - Verify: test -f src/content/docs/choose-your-path.mdx && test -f src/content/docs/is-gsd-right-for-me.md && npm run build 2>&1 | tail -5
- [ ] **T02: Create 3 bridge pages and FAQ and Glossary** — Create 5 new content pages: 3 bridge pages (coming-from-replit, coming-from-lovable, coming-from-cursor), FAQ, and Glossary.

Steps:
1. Create `src/content/docs/coming-from-replit.mdx` — bridge page for Replit users. Include: what Replit gives you vs what GSD gives you (comparison table), key differences (hosted vs local, visual vs CLI), recommendation to follow Solo Builder learning path on Choose Your Path. Link to `../choose-your-path/`. Friendly, reassuring tone.
2. Create `src/content/docs/coming-from-lovable.mdx` — same pattern as Replit bridge but for Lovable users. Comparison table, key differences (AI-generated UI vs structured execution), route to Solo Builder path.
3. Create `src/content/docs/coming-from-cursor.mdx` — bridge page for Cursor/IDE-based AI users. Comparison table (IDE integration vs CLI, inline suggestions vs structured planning), route to Developer learning path.
4. Create `src/content/docs/faq.mdx` — FAQ page with ~11 common questions/objections. Topics: Is it free? Do I need to know how to code? Will it work with my existing project? How is this different from just using Claude? What if I don't like the plan it creates? Can I use it for quick tasks? Does it work with other AI models? How much does it cost? What if something goes wrong? Can teams use it? Is my code safe? Direct, reassuring, Australian English tone. Each answer 2-4 sentences with links to relevant pages.
5. Create `src/content/docs/glossary.md` — ~25 GSD-specific terms defined alphabetically. Terms include: auto-mode, brief, brownfield, checkpoint, context engineering, decision, executor, gate, greenfield, guided mode, milestone, persona, planner, proof level, quick mode, replan, requirement, research, roadmap, scout, slice, solo builder, task, UAT, verification. Each definition 1-2 sentences.
6. Run `npm run build` to confirm all 5 pages build.

Constraints:
- Bridge pages are unlisted — no sidebar entries (sidebar wiring happens in T03)
- Use `../page/` relative link format
- Hand-authored — do NOT add to .generated-manifest.json
- Australian English throughout
  - Estimate: 60m
  - Files: src/content/docs/coming-from-replit.mdx, src/content/docs/coming-from-lovable.mdx, src/content/docs/coming-from-cursor.mdx, src/content/docs/faq.mdx, src/content/docs/glossary.md
  - Verify: test -f src/content/docs/coming-from-replit.mdx && test -f src/content/docs/coming-from-lovable.mdx && test -f src/content/docs/coming-from-cursor.mdx && test -f src/content/docs/faq.mdx && test -f src/content/docs/glossary.md && npm run build 2>&1 | tail -5
- [ ] **T03: Wire sidebar entries and run final link check** — Add sidebar entries to astro.config.mjs for the new pages and run full build + link verification.

Steps:
1. Open `astro.config.mjs` and locate the Start Here section (line ~22).
2. Add Choose Your Path entry after 'Is GSD Right for Me?': `{ label: 'Choose Your Path', link: '/choose-your-path/' }`
3. Add FAQ entry after Choose Your Path: `{ label: 'FAQ', link: '/faq/' }`
4. Locate the Learn More section (line ~163). Add Glossary entry near the end (before Prompts group or after Troubleshooting): `{ label: 'Glossary', link: '/glossary/' }`
5. Do NOT add sidebar entries for coming-from-replit, coming-from-lovable, coming-from-cursor — these are unlisted bridge pages.
6. Verify Is GSD Right for Me links to bridge pages resolve (the pages created in T02).
7. Run `npm run build` — must exit 0.
8. Run `npm run check-links` — must report 0 broken links.

Constraints:
- Preserve exact existing sidebar structure from S02
- Bridge pages must NOT appear in sidebar (R094)
  - Estimate: 20m
  - Files: astro.config.mjs
  - Verify: npm run build && npm run check-links
