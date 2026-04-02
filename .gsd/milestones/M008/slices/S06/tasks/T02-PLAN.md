---
estimated_steps: 13
estimated_files: 5
skills_used: []
---

# T02: Create 3 bridge pages and FAQ and Glossary

Create 5 new content pages: 3 bridge pages (coming-from-replit, coming-from-lovable, coming-from-cursor), FAQ, and Glossary.

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

## Inputs

- `src/content/docs/choose-your-path.mdx`
- `src/content/docs/is-gsd-right-for-me.md`
- `astro.config.mjs`

## Expected Output

- `src/content/docs/coming-from-replit.mdx`
- `src/content/docs/coming-from-lovable.mdx`
- `src/content/docs/coming-from-cursor.mdx`
- `src/content/docs/faq.mdx`
- `src/content/docs/glossary.md`

## Verification

test -f src/content/docs/coming-from-replit.mdx && test -f src/content/docs/coming-from-lovable.mdx && test -f src/content/docs/coming-from-cursor.mdx && test -f src/content/docs/faq.mdx && test -f src/content/docs/glossary.md && npm run build 2>&1 | tail -5
