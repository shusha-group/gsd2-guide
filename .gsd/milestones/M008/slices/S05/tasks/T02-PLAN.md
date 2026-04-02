---
estimated_steps: 20
estimated_files: 7
skills_used: []
---

# T02: Add Next Steps sections and audience-bridging callouts to 7+ pages

Add '## Next Steps' sections with 2-3 relevant links and ':::tip' audience-bridging callouts to key content pages. These are pure content additions.

IMPORTANT: Three pages are pipeline-generated (auto-mode.md, configuration.md, getting-started.md). Edit the source files in `content/generated/docs/`, NOT `src/content/docs/`. Hand-authored pages (skills-extensions-agents.md, recipes/control-your-costs.md, is-gsd-right-for-me.md, quick-reference.md, solo-guide/*.mdx) are edited directly in `src/content/docs/`.

Steps:
1. Add audience-bridging `:::tip` callouts to these pages (edit the correct source location):
   - `content/generated/docs/auto-mode.md` — link solo builders to Solo Guide, devs to how-auto-mode-works
   - `content/generated/docs/getting-started.md` — link solo builders to Solo Guide overview
   - `content/generated/docs/configuration.md` — link to recipes for common config tasks
   - `src/content/docs/skills-extensions-agents.md` — link to reference pages for details
   - `src/content/docs/recipes/control-your-costs.md` — link solo builders to Solo Guide cost page
   - `src/content/docs/is-gsd-right-for-me.md` — link to Solo Guide and Getting Started
   - `src/content/docs/quick-reference.md` — link to Solo Guide for guided learning
2. Add `## Next Steps` with LinkCard imports to pages that end abruptly (where they don't already have one). Use `import { LinkCard } from '@astrojs/starlight/components';` in .mdx files. In .md files use plain markdown links in a list.
3. Run `npm run build` — must exit 0.
4. Run `npm run check-links` — must report 0 broken links.
5. Verify: `grep -rl ':::tip' src/content/docs/ content/generated/docs/ | wc -l` returns ≥7.

Constraints:
- Use Australian English throughout.
- Never edit files listed in `src/content/docs/.generated-manifest.json` directly — edit `content/generated/docs/` versions instead.
- Use Starlight link format: `](../sibling-page/)` with `../` prefix.
- Callout syntax: `:::tip[Title]` / content / `:::`

## Inputs

- ``src/components/Footer.astro` — T01 output with Pagination restored`
- ``content/generated/docs/auto-mode.md` — generated source for auto-mode page`
- ``content/generated/docs/getting-started.md` — generated source for getting-started page`
- ``content/generated/docs/configuration.md` — generated source for configuration page`
- ``src/content/docs/skills-extensions-agents.md` — hand-authored skills guide`
- ``src/content/docs/recipes/control-your-costs.md` — hand-authored cost recipe`
- ``src/content/docs/is-gsd-right-for-me.md` — hand-authored evaluation page`
- ``src/content/docs/quick-reference.md` — hand-authored quick reference`

## Expected Output

- ``content/generated/docs/auto-mode.md` — with callout added`
- ``content/generated/docs/getting-started.md` — with callout added`
- ``content/generated/docs/configuration.md` — with callout added`
- ``src/content/docs/skills-extensions-agents.md` — with callout added`
- ``src/content/docs/recipes/control-your-costs.md` — with callout added`
- ``src/content/docs/is-gsd-right-for-me.md` — with callout added`
- ``src/content/docs/quick-reference.md` — with callout and Next Steps added`

## Verification

npm run build && npm run check-links && test $(grep -rl ':::tip' src/content/docs/ content/generated/docs/ | wc -l) -ge 7
