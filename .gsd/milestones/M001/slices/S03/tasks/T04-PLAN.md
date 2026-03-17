---
estimated_steps: 4
estimated_files: 3
---

# T04: Create reference index, wire sidebar, and update hero

**Slice:** S03 — Quick-reference pages
**Milestone:** M001

## Description

The integration/wiring task that makes all 5 reference pages discoverable. Creates the reference index overview page, adds the "Quick Reference" group to the Starlight sidebar, and updates the hero landing page to point to reference content instead of placeholders. This is the final task — after it, the full slice verification passes.

## Steps

1. **Create `src/content/docs/reference/index.mdx`** — Frontmatter: `title: "Quick Reference"`, `description: "Cheat-sheet cards for all GSD commands, skills, extensions, agents, and shortcuts."`. Import `LinkCard` and `CardGrid` from `@astrojs/starlight/components`. Render a brief overview paragraph ("Everything you need at a glance — searchable, expandable reference cards for the entire GSD toolkit."). Then a `<CardGrid>` with 5 `<LinkCard>` entries:
   - Commands (42) → `/gsd2-guide/reference/commands/`
   - Skills (8) → `/gsd2-guide/reference/skills/`
   - Extensions (17) → `/gsd2-guide/reference/extensions/`
   - Agents (5) → `/gsd2-guide/reference/agents/`
   - Keyboard Shortcuts (4) → `/gsd2-guide/reference/shortcuts/`
   Each card should include a short description of what's on the page.

2. **Update `astro.config.mjs` sidebar** — Add a "Quick Reference" group AFTER the `Home` link and BEFORE the `Placeholder` group. The group should contain manual links:
   ```js
   {
     label: 'Quick Reference',
     items: [
       { label: 'Overview', link: '/reference/' },
       { label: 'Commands', link: '/reference/commands/' },
       { label: 'Skills', link: '/reference/skills/' },
       { label: 'Extensions', link: '/reference/extensions/' },
       { label: 'Agents', link: '/reference/agents/' },
       { label: 'Shortcuts', link: '/reference/shortcuts/' },
     ],
   },
   ```
   Note: Starlight sidebar links do NOT include the base path — Starlight handles that automatically.

3. **Update `src/content/docs/index.mdx` hero page** — Replace the current placeholder-oriented content:
   - Update the hero `actions` primary link to point to `/gsd2-guide/reference/` instead of `/gsd2-guide/placeholder/components/`
   - Update the `<CardGrid>` content to feature the reference sections as the primary cards:
     - "Commands" — 42 commands across 7 categories, instant lookup
     - "Skills" — 8 bundled skills with capabilities and triggers
     - "Extensions" — 17 extensions with full tool inventories
     - "Agents" — 5 agents with roles and capabilities
   - Update the `<LinkCard>` row to link to actual reference pages
   - Keep the GitHub link in hero actions

4. **Build and run full slice verification** — Run `npm run build` and execute ALL slice-level verification checks:
   - Page count ≥ 137
   - `find dist/reference/ -name "*.html" | wc -l` = 6
   - `grep -c '<details' dist/reference/commands/index.html` ≥ 42
   - `grep -c 'data-category' dist/reference/commands/index.html` ≥ 1
   - `grep '/gsd auto' dist/reference/commands/index.html` succeeds
   - `grep -c 'debug-like-expert\|frontend-design\|lint\|review\|test\|swiftui\|github-workflows\|gh' dist/reference/skills/index.html` ≥ 8
   - `grep -c 'browser-tools\|gsd\|mac-tools\|bg-shell' dist/reference/extensions/index.html` ≥ 4
   - `grep -c 'scout\|researcher\|worker\|javascript-pro\|typescript-pro' dist/reference/agents/index.html` = 5
   - `grep 'Quick Reference\|reference' dist/index.html` succeeds (hero links)
   - Pagefind reports 137+ pages in search index
   - No build warnings related to reference pages

## Must-Haves

- [ ] Reference index page exists with CardGrid linking to all 5 reference pages
- [ ] Sidebar has "Quick Reference" group with all 6 links (overview + 5 pages)
- [ ] Sidebar group appears after Home, before other groups
- [ ] Hero page primary action links to reference section
- [ ] Hero cards feature reference content instead of placeholders
- [ ] All internal hrefs include `/gsd2-guide/` base prefix where required
- [ ] Full build succeeds with 137+ pages

## Verification

- `npm run build` exits 0 with 137+ pages reported
- `find dist/reference/ -name "*.html" | wc -l` = 6
- `grep 'Quick Reference' dist/index.html` succeeds
- `grep '/gsd2-guide/reference/' dist/index.html` returns matches (hero links to reference)
- Build output shows 137+ pages in Pagefind index
- Sidebar in built HTML contains "Quick Reference" group links

## Observability Impact

- **Sidebar presence**: `grep 'Quick Reference' dist/index.html` confirms the sidebar group rendered. The sidebar HTML contains `<a href="/gsd2-guide/reference/">` links for all 6 reference entries — greppable in any built HTML page.
- **Hero link verification**: `grep '/gsd2-guide/reference/' dist/index.html` confirms the hero primary action and CardGrid link to reference content instead of placeholders.
- **Reference index page**: `dist/reference/index.html` exists and contains `<a` tags pointing to all 5 sub-pages — greppable with `grep -c '/gsd2-guide/reference/' dist/reference/index.html`.
- **Page count signal**: Build output reports total page count and Pagefind index size. After this task, both should report 137+ pages (up from ~131 pre-slice).
- **Failure visibility**: If a sidebar link points to a non-existent page, Starlight build emits a warning. If a LinkCard href is wrong, the built HTML will contain the wrong href — greppable for diagnosis.

## Inputs

- `src/content/docs/reference/commands.mdx` — from T02
- `src/content/docs/reference/shortcuts.mdx` — from T02
- `src/content/docs/reference/skills.mdx` — from T03
- `src/content/docs/reference/extensions.mdx` — from T03
- `src/content/docs/reference/agents.mdx` — from T03
- `astro.config.mjs` — current sidebar config with Home, Placeholder, and 7 autogenerate groups
- `src/content/docs/index.mdx` — current hero page with placeholder links

## Expected Output

- `src/content/docs/reference/index.mdx` — Overview page with CardGrid linking to all 5 reference sections
- `astro.config.mjs` — Updated with "Quick Reference" sidebar group after Home
- `src/content/docs/index.mdx` — Updated hero with reference section links as primary content
- Full build passing all slice verification checks
