---
estimated_steps: 9
estimated_files: 8
---

# T03: Author utility commands and special topic pages

**Slice:** S03 — Command deep-dives — planning, maintenance, and utility commands
**Milestone:** M002

## Description

Create the final 6 pages: 3 utility command deep-dives (`/gsd hooks`, `/gsd run-hook`, `/gsd migrate`) and 3 special topic reference pages (keyboard shortcuts, CLI flags, headless mode). This task completes full command coverage for GSD and runs final slice-level verification.

The utility commands follow the standard S02 template. The special topic pages use an adapted structure — reference tables and descriptions rather than the command lifecycle pattern — since they aren't `/gsd X does Y` commands but reference material.

## Steps

1. **Study source handlers.** Read the relevant source for utility commands:
   - `hooks`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/post-unit-hooks.ts` — `formatHookStatus()`. Read-only display of configured hooks.
   - `run-hook`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 1846. `triggerHookManually()` from `post-unit-hooks.ts`. Validates hook exists and unit ID format.
   - `migrate`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/migrate/command.ts` — Pipeline: validate `.planning/` → parse → transform → preview → write `.gsd/`. Optional agent-driven review.
   - For special topics, use `content/generated/docs/commands.md` as the primary reference (keyboard shortcuts table, CLI flags from the commands reference) plus `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/index.ts` for keyboard shortcut registration.

2. **Create `src/content/docs/commands/hooks.mdx`** — Read-only display command. Show what hooks are (post-unit and pre-dispatch), how they're configured in preferences, what information the display shows (name, enabled/disabled, target unit types, active cycles). Prose + tables — no Mermaid needed for a display command.

3. **Create `src/content/docs/commands/run-hook.mdx`** — Manual hook trigger. Show the argument format (`<hook-name> <unit-type> <unit-id>`), validation logic, and dispatch. Short Mermaid diagram showing: validate hook exists → validate unit ID → dispatch hook unit.

4. **Create `src/content/docs/commands/migrate.mdx`** — Migration pipeline from v1 `.planning/` to `.gsd/`. Mermaid diagram showing the 5-stage pipeline: validate → parse → transform → preview → write, then optional agent review. Show what gets migrated and the directory mapping.

5. **Create `src/content/docs/commands/keyboard-shortcuts.mdx`** — Reference page, NOT a standard command page. Structure:
   - Brief intro explaining GSD's keyboard shortcuts
   - Table of all 4 shortcuts: `Ctrl+Alt+G` (dashboard), `Ctrl+Alt+V` (voice), `Ctrl+Alt+B` (background shells), `Escape` (pause auto mode)
   - Note about Kitty keyboard protocol — terminals without support (macOS Terminal.app, JetBrains IDEs) show slash-command fallbacks
   - Frontmatter title: "Keyboard Shortcuts" (no `/gsd` prefix)

6. **Create `src/content/docs/commands/cli-flags.mdx`** — Reference page. Structure:
   - Brief intro explaining GSD CLI flags
   - Table of flags: `--continue`, `--model`, `--print`, `--mode`, `--list-models`, `--debug`, `config`, `update`, `sessions`
   - Each flag gets: syntax, description, example usage
   - Frontmatter title: "CLI Flags" (no `/gsd` prefix)

7. **Create `src/content/docs/commands/headless.mdx`** — Reference page for `gsd headless` entry point. Structure:
   - What it does: spawns RPC child process, auto-responds to prompts, detects completion
   - Usage with positional args (any `/gsd` subcommand)
   - Flags: `--timeout`, `--json`, `--model`
   - Exit codes: 0 (success), 1 (failure), 2 (timeout)
   - Example: headless auto-mode execution
   - Mermaid diagram showing: spawn → auto-respond → detect completion → exit code
   - Frontmatter title: "Headless Mode"

8. **Wire sidebar and landing page.** Add 6 sidebar entries to `astro.config.mjs` after T02's entries. For special topic pages use labels without `/gsd` prefix: "Keyboard Shortcuts", "CLI Flags", "Headless Mode". Ensure ALL remaining unlinked commands in `content/generated/docs/commands.md` now have deep-dive links. The Keyboard Shortcuts and CLI Flags sections at the bottom of the landing page should also link to their respective deep-dive pages.

9. **Run full slice verification.** Verify all slice-level acceptance criteria:
   - `ls src/content/docs/commands/*.mdx | wc -l` → 27
   - `grep "'/commands/" astro.config.mjs | wc -l` → 28
   - `npm run build` → ~54 pages
   - `node scripts/check-links.mjs` → 0 broken links
   - No unlinked `/gsd` commands in `content/generated/docs/commands.md` (all use `[text](link/)` format)

### Mermaid Styling Convention

Same as T01/T02:
- Start/end nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- Decision nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- Action nodes: `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`
- Error/unreachable nodes: `fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8`

### Cross-link Format

Links between command pages use relative `../sibling/` format: `[text](../sibling/)`

### Special Topic Page Structure

These pages don't use the standard command template. Instead:
- Frontmatter with `title` and `description`
- Brief intro (1-2 paragraphs)
- Reference table(s) as the main content
- Notes/caveats section where applicable
- Related Commands section at the bottom

## Must-Haves

- [ ] 6 MDX files created in `src/content/docs/commands/`
- [ ] Utility command pages (hooks, run-hook, migrate) follow the standard S02 template
- [ ] Special topic pages (keyboard-shortcuts, cli-flags, headless) use reference-table structure
- [ ] Mermaid diagrams for run-hook, migrate, and headless
- [ ] 6 sidebar entries added to `astro.config.mjs` (28 total in Commands section)
- [ ] All remaining unlinked commands in landing page now have deep-dive links
- [ ] Full slice verification passes (27 MDX files, 28 sidebar entries, ~54 build pages, 0 broken links)

## Verification

- `npm run build` succeeds (expect ~54 pages)
- `node scripts/check-links.mjs` exits 0 with 0 broken links
- `ls src/content/docs/commands/*.mdx | wc -l` → 27
- `grep "'/commands/" astro.config.mjs | wc -l` → 28
- All 27 command pages appear in `dist/commands/*/index.html`
- No unlinked `/gsd` commands remain in `content/generated/docs/commands.md`
- Pagefind indexes ~54 pages

## Observability Impact

- **Build page count delta**: `npm run build` should report ~54 pages total (up from ~48 after T02). A count below 52 indicates missing pages.
- **Sidebar completeness**: `grep "'/commands/" astro.config.mjs | wc -l` must reach 28. Below that means sidebar entries were missed.
- **Landing page unlinked commands**: `grep -c '^\| \`/gsd' content/generated/docs/commands.md` vs `grep -c '^\| \[' content/generated/docs/commands.md` — any gap means unlinked commands remain.
- **Mermaid parse errors**: Build failure with `Mermaid parse error` in output pinpoints the file and line — these surface clearly in `npm run build` stderr.
- **Cross-link breakage**: `node scripts/check-links.mjs` reports broken links with source file and target path — 0 broken links confirms all `../sibling/` references resolve.
- **Failure inspection**: A future agent debugging this task can check `dist/commands/*/index.html` existence for each of the 6 new pages to identify which specific page failed to build.

## Inputs

- `src/content/docs/commands/queue.mdx` (or any T01/T02 page) — Reference for standard template
- `content/generated/docs/commands.md` — Commands landing page with Keyboard Shortcuts and CLI Flags sections at bottom
- `astro.config.mjs` — Sidebar, insert after T02's entries in Commands section
- GSD source files listed in Step 1

## Expected Output

- `src/content/docs/commands/hooks.mdx` — Hooks display deep-dive (prose + tables)
- `src/content/docs/commands/run-hook.mdx` — Run-hook deep-dive with dispatch flow diagram
- `src/content/docs/commands/migrate.mdx` — Migrate deep-dive with pipeline diagram
- `src/content/docs/commands/keyboard-shortcuts.mdx` — Reference page with shortcut table
- `src/content/docs/commands/cli-flags.mdx` — Reference page with flag table
- `src/content/docs/commands/headless.mdx` — Headless mode reference with RPC flow diagram
- `astro.config.mjs` — 6 final sidebar entries (28 total)
- `content/generated/docs/commands.md` — Fully linked, no unlinked commands remain
