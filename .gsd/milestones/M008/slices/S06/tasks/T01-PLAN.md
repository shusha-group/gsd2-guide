---
estimated_steps: 12
estimated_files: 2
skills_used: []
---

# T01: Create Choose Your Path page and rewrite Is GSD Right for Me

Create the Choose Your Path routing page with 3 numbered learning-path checklists (Solo Business Builder, Developer New to AI Coding, Experienced AI Developer). Each path lists 5-8 existing pages in recommended reading order with brief annotations. Rewrite Is GSD Right for Me from its current built-for/not-built-for structure into a persona-routing decision tree: 'Where are you coming from?' with 3 persona sections that route readers to the matching learning path on Choose Your Path. Both pages cross-reference each other.

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

## Inputs

- `src/content/docs/is-gsd-right-for-me.md`
- `astro.config.mjs`

## Expected Output

- `src/content/docs/choose-your-path.mdx`
- `src/content/docs/is-gsd-right-for-me.md`

## Verification

test -f src/content/docs/choose-your-path.mdx && test -f src/content/docs/is-gsd-right-for-me.md && npm run build 2>&1 | tail -5
