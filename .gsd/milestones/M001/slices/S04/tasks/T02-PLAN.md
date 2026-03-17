---
estimated_steps: 5
estimated_files: 4
---

# T02: Reorganize sidebar, remove placeholders, and verify build

**Slice:** S04 — Deep-dive documentation pages
**Milestone:** M001

## Description

After T01, all 125 doc files have correct internal links and README→index renaming. But 20 root-level doc pages (getting-started, auto-mode, architecture, configuration, troubleshooting, etc.) still have no sidebar entries — the "Getting Started" autogenerate looks for a `getting-started/` directory that doesn't exist. The placeholder pages from S02 are now superseded by real content. The landing page needs links to the key deep-dive pages.

This task restructures the sidebar configuration to give all pages logical homes, removes placeholder scaffolding, updates the landing page, and runs full build verification.

**Relevant skill:** None required — Astro config + MDX editing + build verification.

## Steps

1. **Restructure the sidebar in `astro.config.mjs`.** Replace the current sidebar configuration with:
   - **Home** — link to `/`
   - **Quick Reference** — keep existing items (overview, commands, skills, extensions, agents, shortcuts)
   - **Guides** — explicit entries for all root-level doc pages in logical reading order:
     - Getting Started → `/getting-started/`
     - Auto Mode → `/auto-mode/`
     - Configuration → `/configuration/`
     - Commands Reference → `/commands/`
     - Git Strategy → `/git-strategy/`
     - Working in Teams → `/working-in-teams/`
     - Cost Management → `/cost-management/`
     - Token Optimization → `/token-optimization/`
     - Dynamic Model Routing → `/dynamic-model-routing/`
     - Captures & Triage → `/captures-triage/`
     - Workflow Visualizer → `/visualizer/`
     - Skills → `/skills/`
     - Remote Questions → `/remote-questions/`
     - Migration from v1 → `/migration/`
     - Troubleshooting → `/troubleshooting/`
   - **Architecture** — explicit entries:
     - Architecture Overview → `/architecture/`
     - Agent Knowledge Index → `/agent-knowledge-index/`
     - ADR-001: Branchless Worktree Architecture → `/adr-001-branchless-worktree-architecture/`
     - PRD: Branchless Worktree Architecture → `/prd-branchless-worktree-architecture/`
   - **What Is Pi** — `autogenerate: { directory: 'what-is-pi' }`
   - **Building Coding Agents** — `autogenerate: { directory: 'building-coding-agents' }`
   - **Context and Hooks** — `autogenerate: { directory: 'context-and-hooks' }`
   - **Extending Pi** — `autogenerate: { directory: 'extending-pi' }`
   - **Pi UI / TUI** — `autogenerate: { directory: 'pi-ui-tui' }`
   - **Proposals** — `autogenerate: { directory: 'proposals' }`
   - Remove the **Placeholder** group entirely.
   - Remove the empty **Getting Started** autogenerate group.

2. **Delete the placeholder directory.** Remove `src/content/docs/placeholder/` and its three files (`components.mdx`, `diagrams.mdx`, `code-examples.mdx`). These were S02 scaffolding demos — the real content now fills the site.

3. **Update the landing page `src/content/docs/index.mdx`.** Add a new "Documentation" section above or below the existing "Explore the Documentation" cards. Add LinkCards pointing to key deep-dive pages:
   - Getting Started → `/gsd2-guide/getting-started/`
   - Auto Mode → `/gsd2-guide/auto-mode/`
   - Architecture → `/gsd2-guide/architecture/`
   - Troubleshooting → `/gsd2-guide/troubleshooting/`
   
   Keep the existing Quick Reference cards — they're from S03 and still relevant. Update the hero actions to include a "Getting Started" link as the primary CTA (replacing or supplementing "Quick Reference").

4. **Run full build and verify.** Execute `npm run build` and check:
   - Exit code 0
   - Page count ≥ 130 (was 131 with placeholders, now ≈128 content pages + index + reference pages — should be ≥130 total)
   - `find dist/ -path "*/placeholder/*" | wc -l` returns 0 (no placeholder pages)
   - `find dist/ -path "*/readme/index.html" | wc -l` returns 0 (no `/readme/` pages)
   - Sidebar HTML verification: grep the built getting-started HTML for nav links containing "Auto Mode", "Architecture", "Troubleshooting"
   - Link integrity spot-checks: check that `dist/getting-started/index.html` contains `href` pointing to `/gsd2-guide/auto-mode/` (not `auto-mode.md`)
   - `grep -ro '\.md)' dist/ --include="*.html" | wc -l` — only external/code references, not internal navigation links

5. **Handle any build errors.** If the build fails due to broken links or missing pages, diagnose from error output. Common issues: Starlight slug collisions (e.g., if both `commands.md` root-level and the reference `commands` page exist), missing pages referenced in sidebar. Fix any issues found.

## Must-Haves

- [ ] All 20 root-level doc pages have sidebar entries in logical groups (Guides + Architecture)
- [ ] Placeholder directory and its 3 files are deleted
- [ ] Landing page links to Getting Started, Auto Mode, Architecture, Troubleshooting
- [ ] `npm run build` exits 0 with ≥130 pages
- [ ] No `/readme/` pages in build output
- [ ] No `/placeholder/` pages in build output
- [ ] Autogenerate groups for subdirectories still work (what-is-pi, building-coding-agents, etc.)

## Verification

- `npm run build` exits 0
- `find dist/ -name "*.html" | wc -l` returns ≥ 130
- `find dist/ -path "*/placeholder/*" | wc -l` returns 0
- `find dist/ -path "*/readme/index.html" | wc -l` returns 0
- `grep -l 'Getting Started' dist/index.html` finds the landing page with the new link
- Sidebar spot-check: `grep 'getting-started' dist/auto-mode/index.html | head -3` shows sidebar link to getting-started
- Link rewrite spot-check: `grep -o 'href="[^"]*auto-mode[^"]*"' dist/getting-started/index.html | head -3` shows `/gsd2-guide/auto-mode/` not `.md`
- `grep -roh '\.md)' dist/ --include="*.html" | wc -l` — count should be very low (only code examples or external references)

## Inputs

- `scripts/prebuild.mjs` — enhanced by T01 with link rewriting and README→index renaming
- `astro.config.mjs` — current sidebar configuration to be restructured
- `src/content/docs/index.mdx` — current landing page to be updated
- `src/content/docs/placeholder/` — S02 placeholder pages to be removed
- T01 output: 125 generated doc files in `src/content/docs/` with corrected links and index files

## Observability Impact

- **Sidebar group count:** The built HTML nav should contain 10 sidebar groups (Home, Quick Reference, Guides, Architecture, What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI / TUI, Proposals). Verify with: `grep -o 'group-label' dist/getting-started/index.html | wc -l` — should return 9 (Home is a link, not a group).
- **Page count in build output:** `npm run build` final line reports total pages (expect ≥130). A drop below 125 indicates missing content.
- **Placeholder removal:** `find dist/ -path "*/placeholder/*" | wc -l` must return 0. Any non-zero value means stale placeholder references survive.
- **Landing page CTA:** `grep 'getting-started' dist/index.html | head -1` should show the Getting Started hero link. Its absence means the landing page wasn't updated.
- **Sidebar entry verification:** Any page's built HTML contains the full sidebar. Grep for `Guides` and `Architecture` group labels in any `dist/*/index.html` to confirm groups rendered.

## Expected Output

- `astro.config.mjs` — restructured sidebar with Guides, Architecture groups + existing autogenerate groups, no Placeholder group
- `src/content/docs/index.mdx` — updated with deep-dive page links alongside existing reference links
- `src/content/docs/placeholder/` — deleted
- `dist/` — successful production build with ≥130 pages, all links resolved, complete sidebar navigation
