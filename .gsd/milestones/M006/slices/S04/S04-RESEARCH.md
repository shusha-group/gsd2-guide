# S04 (Section 2 — Your First Project) — Research

**Date:** 2026-03-19

## Summary

Section 2 is a narrative walkthrough of starting a new GSD 2 project from scratch — the "Your First Project" page. It covers five phases: discussion, roadmap reading, auto mode first run, verification, and completion. The page must feel like a companion narrative, not a command reference — the reference material already exists in `user-guide/developing-with-gsd.mdx`, `user-guide/discussing-a-milestone.mdx`, and `recipes/new-milestone.mdx`. Section 2's job is to be the practitioner's annotated version: what it feels like, what to pay attention to, what mistakes to avoid, and why each phase matters.

The slice is risk:high primarily because of length (longest single section), citation requirements (Addy Osmani and Esteban Torres external links), and the density of cross-references to existing gsd2-guide pages. The writing pattern is well-established by S02 (daily-mix.mdx, 129 lines) and S03 (when-things-go-wrong.mdx, 183 lines). Section 2 should land around 200–250 lines to match the depth expected for the most narrative-heavy section.

## Recommendation

Write the full `first-project.mdx` as a single task. The content structure is clear from the roadmap description (discussion → roadmap → auto mode → verification → completion), the writing patterns are established, the cross-reference format is proven, and the external citations are confirmed live. No technology risk, no integration risk — this is a content authoring task with known constraints.

Structure the page in five main sections matching the GSD lifecycle phases, with an opening that frames why the first project experience matters. Each section should include: what happens, what you see, what to pay attention to, and a cross-reference to the detailed gsd2-guide page. Weave in the Addy Osmani spec-first insight and the Esteban Torres first-person account as supporting citations where they naturally fit (discussion phase and overall workflow respectively).

## Implementation Landscape

### Key Files

- `src/content/docs/solo-guide/first-project.mdx` — the stub to replace with full content. Currently 6 lines (frontmatter + 2 paragraphs of placeholder).
- `src/content/docs/solo-guide/daily-mix.mdx` — the pattern file (129 lines). Shows cross-reference notation (`→ gsd2-guide: [Title](../../path/)`), section structure, prose voice, Australian spelling, and how to link between solo-guide pages (`../slug/`).
- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — second pattern file (183 lines). Shows the quick-lookup table pattern and how to structure longer sections with horizontal rules as separators.
- `src/content/docs/user-guide/developing-with-gsd.mdx` — the reference walkthrough. Section 2 should complement this, NOT duplicate it. Link to it as the detailed lifecycle reference.
- `src/content/docs/user-guide/discussing-a-milestone.mdx` — detailed discussion phase guide. Link to it from Section 2's discussion subsection.
- `src/content/docs/recipes/new-milestone.mdx` — recipe for starting a new milestone. Link to it as a practical companion.

### Content Structure

The page should follow this outline:

1. **Opening** — frame why the first project matters (the moment you go from curious to committed). Brief, 2–3 paragraphs max.
2. **Before you start** — what you need installed (`npm install -g gsd-pi`, an LLM provider key). Don't duplicate the getting-started page — link to it.
3. **The discussion phase** — what happens when you run `/gsd` for the first time. What GSD asks, what you should bring (describe the experience, not the implementation — echo the discussing-a-milestone advice). This is where Addy Osmani's spec-first insight fits naturally: GSD automates the "start with a spec" pattern that Osmani advocates.
4. **Reading the roadmap** — what GSD produces (CONTEXT.md, ROADMAP.md, REQUIREMENTS.md). What each file means in plain English. How to read the slice table. What to check before letting auto mode proceed.
5. **Auto mode: the first run** — what auto mode does (research → plan → execute → verify per slice). What you see in the terminal. When to intervene vs when to let it run. This is where the Esteban Torres first-person account fits: someone who actually used GSD and what the experience was like.
6. **Verification and completion** — how to know it worked. UAT, milestone validation, the completion summary. What the `.gsd/` directory looks like when a milestone is done.
7. **What you've built (and what you haven't)** — frame what the first project taught you. Link forward to Section 4 (daily mix) for the ongoing workflow.

### Cross-References to Include

All using the `→ gsd2-guide: [Title](../../path/)` notation established in S02:

- `../../getting-started/` — Getting Started (install, first launch)
- `../../auto-mode/` — Auto Mode (detailed execution reference)
- `../../user-guide/developing-with-gsd/` — Developing with GSD (full lifecycle walkthrough)
- `../../user-guide/discussing-a-milestone/` — Discussing a Milestone (how to engage with discussion)
- `../../recipes/new-milestone/` — Recipe: New Milestone
- `../../configuration/` — Configuration (provider setup)
- `../../git-strategy/` — Git Strategy (worktree isolation)
- `../../commands/status/` — /gsd status
- `../../commands/auto/` — /gsd auto
- `../daily-mix/` — Section 4: The Daily Mix (forward link within solo-guide)
- `../when-things-go-wrong/` — Section 7: When Things Go Wrong (forward link)

### External Citations

Two external citations required by R071:

1. **Addy Osmani** — "My LLM coding workflow going into 2026" at `https://addyosmani.com/blog/ai-coding-workflow/` (confirmed live). Key insight: start with a spec/plan before code, break work into small iterative chunks. GSD's discussion phase automates exactly this pattern. Also has a spec-writing article at `https://addyosmani.com/blog/good-spec/`.
2. **Esteban Torres** — first-person GSD account at `https://estebantorr.es` (confirmed live, GitHub Pages hosted). The requirements note this is a first-person account of using GSD. The executor should reference the site but the exact article URL needs to be found on the site — the domain is live but the specific post path wasn't verified during research. **The executor should `curl` or `fetch_page` the site to find the correct article URL before writing the citation.**

### Build Order

Single task — write `first-project.mdx`. No dependencies beyond what S01 already established (sidebar registration, file exists as stub).

### Verification Approach

1. `npm run build 2>&1 | grep "pages"` — still 113 pages (no new pages, just content replacing stub)
2. `npm run build 2>&1 | grep -i "error"` — no MDX parse errors
3. `wc -l src/content/docs/solo-guide/first-project.mdx` — >100 lines (substantive content, not a stub)
4. `npm run check-links` — exits 0 (all cross-references valid, including new ones added in this section)
5. `grep -c "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx` — ≥5 cross-references present
6. External citation check: `grep -c "addyosmani.com\|estebantorr.es" src/content/docs/solo-guide/first-project.mdx` — ≥2

## Constraints

- **Australian spelling throughout** — behaviour, recognise, organisation, colour, practise (verb), practice (noun). Pattern established in S01 stubs and continued in S02/S03.
- **MDX curly-brace escaping** — if quoting GSD template syntax like `{{milestoneId}}`, wrap in backticks. See KNOWLEDGE.md entry. Unlikely to be needed in this section but worth noting.
- **Cross-reference link format** — `../../path/` for gsd2-guide pages, `../slug/` for solo-guide siblings. Trailing slash required. Hash fragments after trailing slash: `../../page/#section`.
- **No Starlight component imports needed** — S02 and S03 don't import any components (unlike the index page which uses CardGrid/LinkCard). Plain MDX prose with markdown tables and code blocks is the pattern.
- **Frontmatter preservation** — keep the existing `title` and `description` from the stub unless there's a compelling reason to change them.

## Common Pitfalls

- **Duplicating the reference walkthrough** — `user-guide/developing-with-gsd.mdx` already has a detailed Cookmate example walkthrough. Section 2 should reference it, not repeat it. The solo-guide version should feel more personal and opinionated — "here's what matters and what to watch out for" rather than "here's what each command does."
- **Broken external links** — the Esteban Torres domain (`estebantorr.es`) is confirmed live but the specific article path was not verified. The executor must check the actual URL before writing it into the MDX.
- **Over-length** — the section should be substantial (~200–250 lines) but not exhaustive. Defer detail to the cross-referenced pages. The guide is a phrasebook, not a dictionary.
- **Missing forward links** — Section 2 should end by pointing the reader to Section 4 (daily mix) as the natural next step. This is how the guide reads as a continuous narrative.

## Open Risks

- **Esteban Torres article URL** — the domain is live but the exact article path needs discovery at execution time. Risk: the article may not exist or may have moved. Mitigation: if the article can't be found, cite the domain as a general resource or omit that specific citation and note it in the slice summary.

## Sources

- Addy Osmani's spec-first workflow and LLM coding practices (source: [My LLM coding workflow going into 2026](https://addyosmani.com/blog/ai-coding-workflow/))
- Addy Osmani's spec-writing guide for AI agents (source: [How to write a good spec for AI agents](https://addyosmani.com/blog/good-spec/))
- Esteban Torres's first-person GSD account (source: [estebantorr.es](https://estebantorr.es) — exact article URL to be confirmed at execution time)
- Existing gsd2-guide walkthrough (source: `src/content/docs/user-guide/developing-with-gsd.mdx`)
- Existing discussion guide (source: `src/content/docs/user-guide/discussing-a-milestone.mdx`)
- Existing new-milestone recipe (source: `src/content/docs/recipes/new-milestone.mdx`)
