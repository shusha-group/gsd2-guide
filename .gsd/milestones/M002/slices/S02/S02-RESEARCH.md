# S02: Command deep-dives — session and execution commands — Research

**Date:** 2026-03-17

## Summary

S02 is straightforward content authoring following S01's established pattern. The 9 commands in scope (`/gsd`, `/gsd auto`, `/gsd stop`, `/gsd pause`, `/gsd next`, `/gsd quick`, `/gsd discuss`, `/gsd status`, `/gsd visualize`) have been studied in the GSD source. Each command's mechanics, files touched, and internal flow are well understood.

The work is: create 9 MDX files in `src/content/docs/commands/`, add 9 sidebar entries to `astro.config.mjs`, and write authored explanations with Mermaid diagrams and terminal examples following the pattern from the walkthrough page. No new technology, no unfamiliar APIs, no architectural decisions. The main risk is content volume — 9 pages with diagrams, but the pattern is repetitive once the first page is established.

## Recommendation

Author each command page as a standalone MDX file in `src/content/docs/commands/`. Follow the S01 content pattern: prose explanations, Mermaid flowcharts with the dark terminal theme (`#1a3a1a` fills, `#39ff14` strokes), ASCII directory trees where relevant, and annotated terminal output blocks. No Starlight component imports needed.

Build the first page (`/gsd auto`) first since it's the most complex and establishes the template. The remaining 8 pages follow the same structure. Reference Cookmate as the example project for consistency with the walkthrough.

Each page should have consistent sections:
1. **What It Does** — one-paragraph plain-English summary
2. **Usage** — syntax, flags, aliases
3. **How It Works** — internal mechanics, Mermaid flow diagram
4. **What Files It Touches** — reads/writes with explanations
5. **Examples** — annotated terminal output
6. **Related Commands** — cross-links

## Implementation Landscape

### Key Files

- `astro.config.mjs` — Sidebar config. The Commands section currently has one entry (`Commands Reference` → `/commands/`). Needs 9 new entries added. S01 forward intelligence confirms: sidebar uses explicit `{ label, link }` items, not `autogenerate`.
- `src/content/docs/commands.md` — Existing shallow commands reference page at `/commands/`. Currently serves as the Commands section landing page. Will need updating to link to the new deep-dive pages instead of just listing tables.
- `src/content/docs/commands/` — New directory for deep-dive pages. Does not exist yet. Each page is a standalone MDX file.
- `src/content/docs/user-guide/developing-with-gsd.mdx` — S01's walkthrough. Reference for the authoring pattern (Mermaid theme, code block style, prose voice).

### Source Files Studied (for content accuracy)

These are the GSD source files that inform what each command page should explain:

- `commands.ts` (1910 lines) — Single `registerGSDCommand()` function. Bare `/gsd` calls `startAuto()` in step mode. Routes subcommands via `if (trimmed === "...")` chain. `showHelp()` at line 443 lists all commands.
- `auto.ts` (3250 lines) — Core of `/gsd auto`, `/gsd stop`, `/gsd pause`, `/gsd next`. Key functions:
  - `startAuto()` (line 687) — Initializes state, checks for crash recovery, sets up worktree isolation, loads metrics, dispatches first unit. Resume-from-pause path is separate (checks `paused` flag).
  - `stopAuto()` (line 542) — Clears lock, teardowns worktree (preserves branch), closes DB, restores original model, resets all state.
  - `pauseAuto()` (line 658) — Sets `active=false, paused=true`, preserves all state for resume. Captures session file for recovery briefing.
  - `handleAgentEnd()` (line 1195) — Post-unit hook: auto-commits, runs doctor, syncs worktree state, verifies artifacts, dispatches post-unit hooks, then calls `dispatchNextUnit()`.
  - `dispatchNextUnit()` (line 1702) — Derives state, evaluates dispatch rules, handles stuck detection (3 dispatches/unit, 6 lifetime), newSession → sendMessage loop.
- `auto-dispatch.ts` (294 lines) — Declarative dispatch table. 13 ordered rules (rewrite-docs override → summarizing → run-uat → reassess-roadmap → needs-discussion → pre-planning → research → plan → execute → complete-milestone). First match wins.
- `quick.ts` (156 lines) — `handleQuick()`: validates `.gsd/` exists, generates slug, creates branch `gsd/quick/N-slug`, creates task dir in `.gsd/quick/`, dispatches `quick-task` prompt.
- `guided-flow.ts` (1454 lines) — `showSmartEntry()` (line 937): reads state, shows contextual wizard via `showNextAction()`, dispatches discuss workflow. `showDiscuss()` (line 770): shows slice picker for mid-milestone discussion, dispatches `guided-discuss-slice` prompt.
- `state.ts` (592 lines) — `deriveState()`: reads all `.gsd/` files (batch via Rust parser or sequential), builds milestone registry, determines phase (pre-planning → planning → executing → summarizing → completing-milestone → complete), finds active slice/task.
- `dashboard-overlay.ts` (616 lines) — TUI overlay showing milestone/slice/task breakdown, completed units, timing, cost metrics. Refreshes every 2 seconds.
- `visualizer-overlay.ts` (337 lines) — 7-tab TUI (Progress, Deps, Metrics, Timeline, Agent, Changes, Export). Loads data from `visualizer-data.ts`.

### Command-by-Command Key Facts

**`/gsd` (bare)** — Equivalent to `/gsd next`. Calls `startAuto(ctx, pi, projectRoot(), false, { step: true })`. If no milestone exists, shows smart entry wizard to create one via discussion. If paused, resumes in step mode.

**`/gsd auto`** — Calls `startAuto()` without step mode. Flow: escape stale worktree → check pause/resume → ensure git repo → check crash lock → derive state → show smart entry if no milestone → create/enter worktree → initialize metrics/DB → dispatch first unit. After each unit completes, `handleAgentEnd()` auto-commits, runs doctor, dispatches next unit via `dispatchNextUnit()`. Supports `--verbose` and `--debug` flags.

**`/gsd stop`** — If auto-mode is running locally, calls `stopAuto()`. If not running locally, checks for remote auto-mode session via lock file and sends stop signal. Clears lock, teardowns worktree (preserving branch), closes DB, restores original model, resets all state, shows session cost summary.

**`/gsd pause`** — Sets `active=false, paused=true`. Captures session file for recovery briefing on resume. Preserves all state (basePath, currentUnit, completedUnits, etc.). Shows "paused" status. User can interact with agent, then `/gsd auto` resumes.

**`/gsd next`** — Same as `startAuto()` with `step: true`. Executes one unit, then shows step wizard for continue/stop/status decision. Also supports `--dry-run` (shows next unit type, ID, estimated cost/duration without executing) and `--verbose`.

**`/gsd quick <task>`** — Lightweight path bypassing milestone ceremony. Creates numbered task dir in `.gsd/quick/N-slug/`, creates git branch `gsd/quick/N-slug`, dispatches `quick-task` prompt. Task summary written to task dir. No roadmap, no slices.

**`/gsd discuss`** — Opens slice discussion picker for mid-milestone conversation. Shows pending slices via `showNextAction()`. For each selected slice, dispatches `guided-discuss-slice` prompt which lets the user discuss approach before auto-mode plans it. Also handles `needs-discussion` phase (draft context from prior queue).

**`/gsd status`** — Opens `GSDDashboardOverlay` TUI via `ctx.ui.custom()`. Shows milestone/slice/task progress, current unit, completed units with timing, cost metrics. Keyboard shortcut: `Ctrl+Alt+G`. Refreshes every 2 seconds.

**`/gsd visualize`** — Opens `GSDVisualizerOverlay` TUI with 7 tabs: Progress (filterable), Dependencies (graph), Metrics (cost/tokens), Timeline (chronological), Agent (model info), Changes (changelog), Export (JSON/markdown). Requires interactive terminal.

### Build Order

1. **Create template page first** — Author `/gsd auto` deep-dive as the most complex page, establishing the section structure and Mermaid diagram pattern. This is the template other pages follow.
2. **Build remaining 8 pages** — Each follows the template. Group by complexity: `/gsd` and `/gsd next` share mechanics with auto. `/gsd stop` and `/gsd pause` are short. `/gsd quick` is self-contained. `/gsd discuss` has its own flow. `/gsd status` and `/gsd visualize` are display-only.
3. **Update sidebar and commands landing page** — Add all 9 entries to `astro.config.mjs`. Update `src/content/docs/commands.md` to link to deep-dives.
4. **Build and verify** — `npm run build`, `node scripts/check-links.mjs`, verify Pagefind indexes new pages.

### Verification Approach

- `npm run build` exits 0
- `node scripts/check-links.mjs` exits 0 — all sidebar links resolve, all cross-links between command pages work
- 9 new MDX files exist in `src/content/docs/commands/`
- Each page has at least one Mermaid diagram (verify with `grep -l 'mermaid'`)
- Sidebar in `astro.config.mjs` has 10 entries under Commands (9 new + 1 existing reference)
- Built site has `/commands/auto/index.html`, `/commands/stop/index.html`, etc.
- Pagefind indexes all new pages (verify with build output page count increase from 27)

## Common Pitfalls

- **Sidebar link must match file path** — A file at `src/content/docs/commands/auto.mdx` resolves to `/commands/auto/`. The sidebar entry must be `link: '/commands/auto/'` (with trailing slash). Missing either the file or the sidebar entry causes broken links caught by `check-links.mjs`.
- **Mermaid diagram must use fenced code blocks** — Use ` ```mermaid ` not a component import. The `@pasqal-io/starlight-client-mermaid` plugin processes fenced blocks. Include the `%%{init: {'theme': 'base', 'themeVariables': {...}}}%%` theme block at the top of each diagram for dark terminal styling.
- **Internal links use `../` prefix** — Per KNOWLEDGE.md, all internal links between pages use `../sibling/` format. Command pages linking to each other: `[/gsd auto](../auto/)`. Links to walkthrough: `[walkthrough](../../user-guide/developing-with-gsd/)`.
- **Don't dump prompts or source code** — Per D029, command pages should explain what happens, not regurgitate prompt text. Write for understanding: "GSD reads the roadmap to find the first incomplete slice, then..." not "The prompt template says..."
