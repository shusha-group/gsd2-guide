---
estimated_steps: 13
estimated_files: 1
skills_used: []
---

# T03: Wire sidebar entries and run final link check

Add sidebar entries to astro.config.mjs for the new pages and run full build + link verification.

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

## Inputs

- `astro.config.mjs`
- `src/content/docs/choose-your-path.mdx`
- `src/content/docs/is-gsd-right-for-me.md`
- `src/content/docs/coming-from-replit.mdx`
- `src/content/docs/coming-from-lovable.mdx`
- `src/content/docs/coming-from-cursor.mdx`
- `src/content/docs/faq.mdx`
- `src/content/docs/glossary.md`

## Expected Output

- `astro.config.mjs`

## Verification

npm run build && npm run check-links
