---
estimated_steps: 6
estimated_files: 4
---

# T01: Strip pi/agent content and restructure sidebar

**Slice:** S01 — Site restructure and end-to-end walkthrough
**Milestone:** M002

## Description

Remove 106 pages of pi/agent content from the site by updating the prebuild pipeline to exclude 6 subdirectories and 3 non-GSD root pages. Restructure the Starlight sidebar from its current 10-section layout to a GSD-focused layout with User Guide, Commands, Recipes, Reference, and Guides sections. Fix any broken internal links from remaining pages that pointed to removed content.

## Steps

1. Read `scripts/prebuild.mjs` and add an exclusion list that skips these directories during content copy: `what-is-pi`, `building-coding-agents`, `context-and-hooks`, `extending-pi`, `pi-ui-tui`, `proposals`. Also exclude root files: `agent-knowledge-index.md`, `ADR-001-branchless-worktree-architecture.md`, `PRD-branchless-worktree-architecture.md`.
2. Restructure `astro.config.mjs` sidebar: remove all pi/agent sections (What Is Pi, Building Coding Agents, Context and Hooks, Extending Pi, Pi UI/TUI, Proposals, Architecture). Create new structure: "User Guide" (placeholder for developing-with-gsd), "Commands" (empty group for S02/S03), "Recipes" (empty group for S04), "Reference" (existing quick-reference cards), "Guides" (existing GSD guide pages). Keep Home and Changelog at top.
3. Run `npm run build` to identify broken links and build errors from removed content.
4. Fix broken internal links in remaining pages — scan for references to removed pages and either remove the links or redirect to surviving content.
5. Run `npm run check-links` to verify zero broken links.
6. Verify sidebar structure visually by checking the built output.

## Must-Haves

- [ ] `scripts/prebuild.mjs` has exclusion list for 6 pi/agent subdirectories and 3 non-GSD root files
- [ ] `astro.config.mjs` sidebar has no pi/agent sections
- [ ] `astro.config.mjs` sidebar has User Guide, Commands, Recipes, Reference, and Guides sections
- [ ] `npm run build` exits 0
- [ ] `npm run check-links` exits 0
- [ ] No pi/agent content files exist in `src/content/docs/` after prebuild

## Verification

- `npm run build` exits 0
- `node scripts/check-links.mjs` exits 0
- `find src/content/docs/what-is-pi src/content/docs/building-coding-agents src/content/docs/context-and-hooks src/content/docs/extending-pi src/content/docs/pi-ui-tui src/content/docs/proposals -name '*.md' 2>/dev/null | wc -l` returns 0

## Observability Impact

- **New signal:** `prebuild.mjs` logs each excluded directory/file to stdout (e.g., `Excluding directory: what-is-pi`), making content filtering observable in build output.
- **Inspection surface:** `.generated-manifest.json` file count drops from ~130 to ~24 after exclusions — a future agent can `cat src/content/docs/.generated-manifest.json | jq .file_count` to verify.
- **Failure visibility:** Broken links from removed content surface as non-zero exit from `check-links.mjs` with specific file:target pairs in stderr.

## Inputs

- `scripts/prebuild.mjs` — current content bridge (no exclusions)
- `astro.config.mjs` — current sidebar with 10 sections including pi/agent
- `content/generated/docs/` — source docs (106 pi/agent files in 6 subdirectories)

## Expected Output

- `scripts/prebuild.mjs` — updated with exclusion list
- `astro.config.mjs` — restructured sidebar
- Various `.md` files — broken link fixes
