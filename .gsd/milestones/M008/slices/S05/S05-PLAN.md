# S05: Cross-linking & Wayfinding

**Goal:** Solo Guide has prev/next navigation, all key pages have Next Steps sections, and audience-bridging callouts appear on 7+ pages.
**Demo:** After this: After this: Solo Guide has prev/next, all pages have Next Steps, audience-bridging callouts on 7+ pages.

## Tasks
- [x] **T01: Added Starlight Pagination to Footer.astro, restoring prev/next navigation site-wide** — The custom Footer.astro override completely replaces Starlight's default Footer without including the Pagination component. This breaks prev/next navigation site-wide. Fix by importing Pagination from the Starlight virtual module and rendering it above the custom footer markup.

Steps:
1. Read `src/components/Footer.astro` to confirm current state (no Pagination import).
2. Add `import Pagination from 'virtual:starlight/components/Pagination';` to the frontmatter.
3. Render `<Pagination {...Astro.props} />` immediately before the `<footer class="site-footer">` element.
4. Run `npm run build` — must exit 0.
5. Run `grep -c 'pagination-links' dist/solo-guide/first-project/index.html` — must return ≥1.
6. Run `grep -c 'pagination-links' dist/auto-mode/index.html` — must return ≥1 (confirms site-wide).
7. Run `npm run check-links` — must report 0 broken links.

Constraints:
- Import MUST use `'virtual:starlight/components/Pagination'` (the Starlight virtual module pattern), NOT a relative path.
- Preserve ALL existing custom footer markup — only add the Pagination component above it.
- Pass `{...Astro.props}` to Pagination so it receives page context.
  - Estimate: 15m
  - Files: src/components/Footer.astro
  - Verify: npm run build && grep -c 'pagination-links' dist/solo-guide/first-project/index.html && grep -c 'pagination-links' dist/auto-mode/index.html && npm run check-links
- [ ] **T02: Add Next Steps sections and audience-bridging callouts to 7+ pages** — Add '## Next Steps' sections with 2-3 relevant links and ':::tip' audience-bridging callouts to key content pages. These are pure content additions.

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
  - Estimate: 30m
  - Files: content/generated/docs/auto-mode.md, content/generated/docs/getting-started.md, content/generated/docs/configuration.md, src/content/docs/skills-extensions-agents.md, src/content/docs/recipes/control-your-costs.md, src/content/docs/is-gsd-right-for-me.md, src/content/docs/quick-reference.md
  - Verify: npm run build && npm run check-links && test $(grep -rl ':::tip' src/content/docs/ content/generated/docs/ | wc -l) -ge 7
