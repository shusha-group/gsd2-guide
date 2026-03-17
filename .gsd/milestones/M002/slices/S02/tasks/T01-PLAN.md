---
estimated_steps: 5
estimated_files: 4
---

# T01: Author /gsd auto, /gsd stop, /gsd pause deep-dive pages

**Slice:** S02 — Command deep-dives — session and execution commands
**Milestone:** M002

## Description

Create the first 3 command deep-dive pages covering the core auto-mode lifecycle: `/gsd auto` (start autonomous execution), `/gsd stop` (terminate), `/gsd pause` (suspend with state preservation). `/gsd auto` is the most complex command in GSD and sets the template that all subsequent command pages follow.

Each page follows a consistent structure: What It Does, Usage, How It Works (with Mermaid flow diagram), What Files It Touches, Examples, Related Commands.

Content is authored from source-code understanding, not prompt dumps (D029). Use Cookmate as the example project (D032). Mermaid diagrams use the established dark terminal theme with inline `style` directives: `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8` for normal nodes, `fill:#0d180d,stroke:#39ff14,color:#39ff14` for decision nodes.

## Steps

1. **Create the `src/content/docs/commands/` directory** if it doesn't exist.

2. **Author `src/content/docs/commands/auto.mdx`** — the template-setting page. This is the fullest treatment. Include:
   - **What It Does:** One paragraph — GSD's autonomous execution mode. Researches, plans, executes, commits, verifies, summarizes, then dispatches the next unit. Continues until the milestone is complete or stopped.
   - **Usage:** `/gsd auto` with flags: `--verbose`, `--debug`. Mention that bare `/gsd` is step mode (link to `/gsd` page later).
   - **How It Works:** The internal flow:
     1. Checks for stale worktree state, cleans up if needed
     2. If paused, resumes from saved state
     3. Ensures git repo exists
     4. Checks crash lock file — if found, offers recovery
     5. Derives project state by reading all `.gsd/` files
     6. If no milestone exists, launches smart entry wizard
     7. Creates/enters worktree (if isolation mode = worktree)
     8. Initializes metrics DB and session tracking
     9. Dispatches first unit via dispatch rules
     10. After each unit: auto-commits, runs doctor checks, syncs worktree, dispatches next unit
     Include a Mermaid flowchart showing: Start → Stale check → Resume check → Git check → Crash recovery → Derive state → Smart entry? → Worktree setup → Init metrics → Dispatch loop (dispatch → execute → commit → doctor → next). Show the dispatch loop as a cycle.
   - **What Files It Touches:**
     - Reads: `.gsd/STATE.md`, all roadmap/plan files, `.gsd/KNOWLEDGE.md`, `.gsd/DECISIONS.md`, `.gsd/OVERRIDES.md`
     - Writes: `.gsd/STATE.md`, task summaries, slice summaries, `.gsd/runtime/` (lock files, dispatch state), `.gsd/activity/` (JSONL logs)
     - Creates: `.gsd/worktrees/<MID>/` (if worktree isolation)
   - **Examples:** Annotated terminal output showing `/gsd auto` starting on the Cookmate project — the initialization messages, worktree creation, first unit dispatch. Keep it realistic but concise.
   - **Related Commands:** Link to `/gsd stop`, `/gsd pause`, `/gsd next`, `/gsd status`.

3. **Author `src/content/docs/commands/stop.mdx`** — shorter page. Include:
   - **What It Does:** Gracefully terminates auto-mode. Clears the session lock, teardowns the worktree (preserving the branch), closes metrics DB, restores the original model, shows session cost summary.
   - **Usage:** `/gsd stop`. No flags. Also works remotely — if auto-mode is running in another terminal, sends a stop signal via lock file.
   - **How It Works:** Mermaid diagram showing: Stop signal → Clear lock → Teardown worktree → Close DB → Restore model → Show cost summary. If remote: detect lock → send stop signal → wait for confirmation.
   - **What Files It Touches:** Reads/deletes `.gsd/runtime/` lock files. Reads metrics DB for cost summary.
   - **Examples:** Terminal output showing stop with cost summary.
   - **Related Commands:** Link to `/gsd auto`, `/gsd pause`.

4. **Author `src/content/docs/commands/pause.mdx`** — shorter page. Include:
   - **What It Does:** Suspends auto-mode while preserving all state for later resume. Unlike stop, pause keeps the session alive — all context (current unit, completed units, base path) is saved. You can interact with the agent manually, then resume with `/gsd auto`.
   - **Usage:** `/gsd pause`. No flags.
   - **How It Works:** Mermaid diagram showing: Pause signal → Set active=false, paused=true → Capture session file → Preserve state (basePath, currentUnit, completedUnits) → Show "paused" status. Resume path: `/gsd auto` → detect paused state → restore context → continue from saved unit.
   - **What Files It Touches:** Writes session recovery file. Preserves all in-memory state.
   - **Examples:** Terminal showing pause, manual interaction, then resume.
   - **Related Commands:** Link to `/gsd auto`, `/gsd stop`.

5. **Add 3 sidebar entries to `astro.config.mjs`** under the Commands section. Add them after the existing "Commands Reference" entry:
   ```
   { label: '/gsd auto', link: '/commands/auto/' },
   { label: '/gsd stop', link: '/commands/stop/' },
   { label: '/gsd pause', link: '/commands/pause/' },
   ```
   Note: the sidebar uses explicit `items` arrays, not `autogenerate`.

## Must-Haves

- [ ] 3 MDX files created in `src/content/docs/commands/`
- [ ] Each file has frontmatter with `title` and `description`
- [ ] Each file has at least one Mermaid diagram with dark terminal theme
- [ ] Content explains mechanics without dumping prompts or source code
- [ ] Cookmate used as example project in terminal output examples
- [ ] Internal links between command pages use `../sibling/` format
- [ ] 3 sidebar entries added to `astro.config.mjs`
- [ ] `npm run build` exits 0

## Verification

- `npm run build` exits 0
- `ls dist/commands/auto/index.html dist/commands/stop/index.html dist/commands/pause/index.html` — all 3 exist
- `grep -l 'mermaid' src/content/docs/commands/auto.mdx src/content/docs/commands/stop.mdx src/content/docs/commands/pause.mdx | wc -l` returns 3
- `grep "'/commands/auto/'" astro.config.mjs` returns a match

## Observability Impact

- **Build page count** — After T01, `npm run build` page count should increase by 3 (from 27 to 30). If count doesn't increase, the new pages aren't being picked up — check file paths and content collection config.
- **Sidebar navigation** — 3 new sidebar entries appear under Commands. If links 404, check that `link:` values match the file paths exactly (trailing slash required).
- **Mermaid rendering** — Each page has at least one fenced `mermaid` code block. If diagrams don't render, check that `@pasqal-io/starlight-client-mermaid` plugin is active in `astro.config.mjs`.
- **Cross-link integrity** — Internal `../sibling/` links between the 3 command pages. Broken links are caught by `node scripts/check-links.mjs` in the slice verification step.

## Inputs

- `src/content/docs/user-guide/developing-with-gsd.mdx` — reference for MDX authoring pattern, Mermaid theme, prose voice
- `astro.config.mjs` — sidebar config to extend with 3 new entries
- S02-RESEARCH.md command-by-command key facts — source material for page content (inlined in slice plan context)

## Expected Output

- `src/content/docs/commands/auto.mdx` — ~150-250 line deep-dive page for `/gsd auto`
- `src/content/docs/commands/stop.mdx` — ~80-120 line deep-dive page for `/gsd stop`
- `src/content/docs/commands/pause.mdx` — ~80-120 line deep-dive page for `/gsd pause`
- `astro.config.mjs` — 3 new sidebar entries under Commands section
