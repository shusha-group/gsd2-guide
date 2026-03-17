---
estimated_steps: 8
estimated_files: 7
---

# T02: Author /gsd, /gsd next, /gsd quick, /gsd discuss, /gsd status, /gsd visualize deep-dive pages

**Slice:** S02 — Command deep-dives — session and execution commands
**Milestone:** M002

## Description

Author the remaining 6 command deep-dive pages following the template established by T01. These commands range from simple (status, visualize — display-only) to moderate (/gsd quick — self-contained workflow) to commands that share mechanics with `/gsd auto` (/gsd, /gsd next — step mode variants).

Each page uses the same consistent structure as T01's pages: What It Does, Usage, How It Works (with Mermaid flow diagram), What Files It Touches, Examples, Related Commands.

Content rules: authored explanations not prompt dumps (D029), Cookmate as example project (D032), Mermaid with dark terminal theme (`fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8` for nodes, `fill:#0d180d,stroke:#39ff14,color:#39ff14` for decisions), internal links use `../sibling/` format.

## Steps

1. **Author `src/content/docs/commands/gsd.mdx`** — the bare `/gsd` command.
   - What It Does: The main entry point. Equivalent to `/gsd next` (step mode). Executes one unit at a time, pausing between each for your decision. If no milestone exists, launches the smart entry wizard to help you create one via discussion.
   - Usage: Just type `/gsd`. No flags. Same as `/gsd next`.
   - How It Works: Calls `startAuto()` with `step: true`. After each unit completes, shows a step wizard asking: continue to next unit, stop, or check status. If paused, resumes in step mode. Mermaid diagram showing: `/gsd` → Check paused? → Check milestone exists? → Smart entry wizard OR Step mode → Execute one unit → Step wizard (continue/stop/status).
   - What Files It Touches: Same as `/gsd auto` but in step mode.
   - Related Commands: `/gsd auto`, `/gsd next`, `/gsd status`.

2. **Author `src/content/docs/commands/next.mdx`** — explicit step mode.
   - What It Does: Same as bare `/gsd` — execute one unit, then pause. Exists as an explicit alias. Also supports `--dry-run` to preview the next unit without executing it.
   - Usage: `/gsd next`, `/gsd next --dry-run`, `/gsd next --verbose`.
   - How It Works: Identical to bare `/gsd` plus the `--dry-run` flag which shows: next unit type, unit ID, estimated cost, estimated duration — without actually running it. Mermaid diagram showing the dry-run decision branch.
   - Related Commands: `/gsd`, `/gsd auto`, `/gsd stop`.

3. **Author `src/content/docs/commands/quick.mdx`** — quick task without milestone ceremony.
   - What It Does: Lightweight path for small changes. Bypasses the full milestone/slice/task hierarchy — no roadmap, no slices. Creates a numbered task directory, a git branch, and dispatches the task directly.
   - Usage: `/gsd quick <task description>`, e.g. `/gsd quick fix the login button color`.
   - How It Works: Validates `.gsd/` exists. Generates slug from description. Creates branch `gsd/quick/N-slug`. Creates task dir in `.gsd/quick/N-slug/`. Dispatches the quick-task prompt. Task summary written on completion. Mermaid diagram: `/gsd quick "..."` → Validate .gsd/ → Generate slug → Create branch → Create task dir → Execute → Write summary.
   - What Files It Touches: Creates `.gsd/quick/N-slug/` directory with task summary. Creates git branch.
   - Examples: Terminal output showing `/gsd quick "add dark mode toggle"` — branch creation, execution, completion.
   - Related Commands: `/gsd auto` (for full ceremony).

4. **Author `src/content/docs/commands/discuss.mdx`** — mid-milestone discussion.
   - What It Does: Opens a guided discussion about upcoming slices while a milestone is in progress. Shows pending slices, lets you pick one to discuss before auto-mode plans it. Useful for shaping approach before execution starts.
   - Usage: `/gsd discuss`. No flags.
   - How It Works: Reads the roadmap to find pending slices. Shows slice picker via the next-action wizard. For each selected slice, dispatches a guided discussion prompt. Discussion produces a CONTEXT.md for the slice, capturing scope, goals, constraints. Also handles the `needs-discussion` auto-mode phase (when a queued milestone has draft context from `/gsd queue`). Mermaid diagram: `/gsd discuss` → Read roadmap → Show pending slices → Select slice → Guided discussion → Write CONTEXT.md.
   - What Files It Touches: Reads roadmap, writes slice CONTEXT.md files.
   - Related Commands: `/gsd auto`, `/gsd queue`.

5. **Author `src/content/docs/commands/status.mdx`** — progress dashboard.
   - What It Does: Opens a TUI dashboard overlay showing real-time progress — milestone, slice, and task breakdown with completion status, current unit, timing, and cost metrics.
   - Usage: `/gsd status`. Also available via keyboard shortcut `Ctrl+Alt+G`.
   - How It Works: Launches the `GSDDashboardOverlay` as a TUI custom widget. Reads `.gsd/STATE.md` and all roadmap/plan files to build the progress tree. Refreshes every 2 seconds. Shows completed units with duration and cost. Mermaid diagram showing data flow: `.gsd/` files → State derivation → Dashboard overlay → Live refresh.
   - What Files It Touches: Reads `.gsd/STATE.md`, roadmap files, plan files, activity logs. Read-only — writes nothing.
   - Related Commands: `/gsd visualize`, `/gsd auto`.

6. **Author `src/content/docs/commands/visualize.mdx`** — workflow visualizer.
   - What It Does: Opens an advanced TUI visualizer with 7 tabs: Progress (filterable), Dependencies (graph), Metrics (cost/tokens), Timeline (chronological), Agent (model info), Changes (changelog), Export (JSON/markdown).
   - Usage: `/gsd visualize`. Requires an interactive terminal.
   - How It Works: Launches `GSDVisualizerOverlay`. Loads data from the visualizer data module which reads `.gsd/` state, activity logs, and git history. Each tab renders a different view of the same underlying data. Mermaid diagram showing the 7 tabs as a tab layout with data sources feeding in.
   - What Files It Touches: Reads `.gsd/` state files, activity JSONL logs, git history. Read-only.
   - Related Commands: `/gsd status` (simpler dashboard).

7. **Add 6 sidebar entries to `astro.config.mjs`** under the Commands section, after the entries added by T01:
   ```
   { label: '/gsd', link: '/commands/gsd/' },
   { label: '/gsd next', link: '/commands/next/' },
   { label: '/gsd quick', link: '/commands/quick/' },
   { label: '/gsd discuss', link: '/commands/discuss/' },
   { label: '/gsd status', link: '/commands/status/' },
   { label: '/gsd visualize', link: '/commands/visualize/' },
   ```

8. **Run `npm run build` and `node scripts/check-links.mjs`** to verify all 9 command pages build and all links resolve.

## Must-Haves

- [ ] 6 MDX files created in `src/content/docs/commands/`
- [ ] Each file has frontmatter with `title` and `description`
- [ ] Each file has at least one Mermaid diagram with dark terminal theme
- [ ] Content explains mechanics without dumping prompts or source code
- [ ] Cookmate or realistic examples used in terminal output
- [ ] Internal links between command pages use `../sibling/` format
- [ ] 6 sidebar entries added to `astro.config.mjs`
- [ ] `npm run build` exits 0
- [ ] `node scripts/check-links.mjs` exits 0

## Verification

- `npm run build` exits 0
- `node scripts/check-links.mjs` exits 0
- `ls src/content/docs/commands/*.mdx | wc -l` returns 9 (3 from T01 + 6 new)
- `for f in src/content/docs/commands/*.mdx; do grep -l 'mermaid' "$f"; done | wc -l` returns 9
- All 9 `dist/commands/*/index.html` files exist

## Inputs

- `src/content/docs/commands/auto.mdx` — T01's template-setting page, reference for structure, voice, Mermaid style
- `astro.config.mjs` — already has 3 T01 sidebar entries under Commands, add 6 more
- S02-RESEARCH.md command-by-command key facts — source material for each page (inlined in slice plan context)

## Expected Output

- `src/content/docs/commands/gsd.mdx` — deep-dive for bare `/gsd`
- `src/content/docs/commands/next.mdx` — deep-dive for `/gsd next`
- `src/content/docs/commands/quick.mdx` — deep-dive for `/gsd quick`
- `src/content/docs/commands/discuss.mdx` — deep-dive for `/gsd discuss`
- `src/content/docs/commands/status.mdx` — deep-dive for `/gsd status`
- `src/content/docs/commands/visualize.mdx` — deep-dive for `/gsd visualize`
- `astro.config.mjs` — 6 new sidebar entries under Commands (9 total with T01's entries)
