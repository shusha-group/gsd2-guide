# S02: Command deep-dives — session and execution commands

**Goal:** Every session and execution command has its own deep-dive page explaining what it does, how it works internally, what files it reads/writes, with Mermaid flow diagrams and terminal examples.
**Demo:** A user navigates to `/commands/auto/` and reads a full explanation of `/gsd auto` — what triggers it, how the dispatch loop works, what files are read/written, with a Mermaid state diagram and annotated terminal output. Same for all 9 commands in scope.

## Must-Haves

- 9 MDX files in `src/content/docs/commands/`: `auto.mdx`, `stop.mdx`, `pause.mdx`, `gsd.mdx`, `next.mdx`, `quick.mdx`, `discuss.mdx`, `status.mdx`, `visualize.mdx`
- Each page has consistent sections: What It Does, Usage, How It Works (with Mermaid diagram), What Files It Touches, Examples, Related Commands
- Mermaid diagrams use the established dark terminal theme (`fill:#1a3a1a`, `stroke:#39ff14`, `color:#e8f4e8`)
- Sidebar entries for all 9 pages under the Commands section in `astro.config.mjs`
- Commands landing page (`commands.md`) updated to link to deep-dive pages
- Content explains mechanics, not prompt dumps (per D029)
- Cookmate referenced as example project for consistency with walkthrough (per D032)
- Internal links use `../sibling/` format per KNOWLEDGE.md

## Verification

- `npm run build` exits 0
- `node scripts/check-links.mjs` exits 0
- 9 new `.mdx` files exist in `src/content/docs/commands/`
- Each file contains at least one mermaid code block: `for f in src/content/docs/commands/*.mdx; do grep -l 'mermaid' "$f"; done | wc -l` returns 9
- Sidebar in `astro.config.mjs` has 10 entries under Commands (9 new + 1 existing reference)
- Built site has 9 new HTML pages: `ls dist/commands/*/index.html | wc -l` returns at least 9
- Build output page count increases from 27 to 36

## Tasks

- [ ] **T01: Author /gsd auto, /gsd stop, /gsd pause deep-dive pages** `est:45m`
  - Why: `/gsd auto` is the most complex command and establishes the page template. `/gsd stop` and `/gsd pause` are its lifecycle counterparts — starting with these three covers the core auto-mode lifecycle and locks down the content pattern for remaining pages.
  - Files: `src/content/docs/commands/auto.mdx`, `src/content/docs/commands/stop.mdx`, `src/content/docs/commands/pause.mdx`, `astro.config.mjs`
  - Do: Create `src/content/docs/commands/` directory. Author 3 MDX files following the walkthrough's content pattern. Each page has: What It Does (one-paragraph summary), Usage (syntax, flags, aliases), How It Works (internal mechanics with Mermaid flow diagram), What Files It Touches (reads/writes), Examples (annotated terminal output), Related Commands (cross-links). `/gsd auto` gets the fullest treatment — dispatch loop diagram, worktree setup, crash recovery, unit lifecycle. `/gsd stop` covers teardown, lock clearing, cost summary. `/gsd pause` covers state preservation and resume path. Add 3 sidebar entries to `astro.config.mjs` under the Commands section. Use Cookmate as the example project. Mermaid diagrams use inline `style` directives with `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`.
  - Verify: `npm run build` exits 0, 3 new HTML pages exist in `dist/commands/`, each `.mdx` file has at least one mermaid block
  - Done when: 3 command deep-dive pages build successfully, are reachable via sidebar, and each contains a Mermaid diagram

- [ ] **T02: Author /gsd, /gsd next, /gsd quick, /gsd discuss, /gsd status, /gsd visualize deep-dive pages** `est:45m`
  - Why: The remaining 6 commands complete the slice's scope. These follow the template established by T01.
  - Files: `src/content/docs/commands/gsd.mdx`, `src/content/docs/commands/next.mdx`, `src/content/docs/commands/quick.mdx`, `src/content/docs/commands/discuss.mdx`, `src/content/docs/commands/status.mdx`, `src/content/docs/commands/visualize.mdx`, `astro.config.mjs`
  - Do: Author 6 MDX files following T01's established template. `/gsd` and `/gsd next` share mechanics with auto (step mode) — reference auto page, explain the difference. `/gsd quick` is self-contained — branch creation, task dir, no roadmap/slices. `/gsd discuss` covers slice discussion picker and guided discussion flow. `/gsd status` covers TUI dashboard overlay, keyboard shortcut. `/gsd visualize` covers 7-tab visualizer. Add 6 sidebar entries to `astro.config.mjs`. Each page has at least one Mermaid diagram.
  - Verify: `npm run build` exits 0, 9 total `.mdx` files in `commands/`, all have mermaid blocks, `node scripts/check-links.mjs` exits 0
  - Done when: All 9 command pages build, link-check passes, all are reachable via sidebar

- [ ] **T03: Update commands landing page and final verification** `est:15m`
  - Why: The existing commands reference page (`commands.md`) lists commands in tables with one-line descriptions. It needs to link to the new deep-dive pages so users can navigate from the overview to detailed explanations. Final build + link check + Pagefind verification confirms the slice is complete.
  - Files: `src/content/docs/commands.md`
  - Do: Update the commands reference page to add "→ Deep dive" links next to each command that now has a dedicated page. Keep the table format but add a third column or inline links to the 9 deep-dive pages. Ensure all internal links use `../commands/auto/` format (from the commands.md page, deep-dives are siblings in the URL structure, but since commands.md renders at `/commands/` and deep-dives at `/commands/auto/`, the link format is `auto/` from commands.md's perspective — verify with check-links). Run full build and verification suite.
  - Verify: `npm run build` exits 0, `node scripts/check-links.mjs` exits 0, build output shows 36 pages, Pagefind indexes all new pages, `ls dist/commands/*/index.html | wc -l` returns at least 9
  - Done when: Commands landing page links to all 9 deep-dives, build succeeds, link check passes, page count is 36

## Files Likely Touched

- `src/content/docs/commands/auto.mdx`
- `src/content/docs/commands/stop.mdx`
- `src/content/docs/commands/pause.mdx`
- `src/content/docs/commands/gsd.mdx`
- `src/content/docs/commands/next.mdx`
- `src/content/docs/commands/quick.mdx`
- `src/content/docs/commands/discuss.mdx`
- `src/content/docs/commands/status.mdx`
- `src/content/docs/commands/visualize.mdx`
- `astro.config.mjs`
- `src/content/docs/commands.md`
