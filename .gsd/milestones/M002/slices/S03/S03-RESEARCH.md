# S03: Command deep-dives — planning, maintenance, and utility commands — Research

**Date:** 2026-03-17

## Summary

S03 is straightforward repetition of the S02 pattern — 18 more MDX pages following the established template (What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands). The page template, Mermaid styling, sidebar wiring, and content authoring conventions are locked from S02. The main work is studying each command's source handler and writing accurate explanations.

The 18 pages break into three categories: 15 slash commands (`queue`, `steer`, `doctor`, `forensics`, `capture`, `triage`, `prefs`, `mode`, `knowledge`, `cleanup`, `hooks`, `run-hook`, `skill-health`, `migrate`, `config`) and 3 special topic pages (`keyboard-shortcuts`, `cli-flags`, `headless`). The special topics use a slightly different structure (reference tables rather than How It Works flowcharts) but the same MDX pattern.

Command complexity varies: `doctor` (1264-line source) and `forensics` (596 lines) are the most complex with multiple sub-modes. `capture` and `knowledge` are trivially simple (append to a markdown file). The special topic pages are reference tables that can be authored from the commands landing page content. Grouping by complexity into ~3 tasks of 5-6 pages each is the natural decomposition.

## Recommendation

Follow the S02 template exactly. Group pages into 3 tasks by complexity/relatedness:

1. **Planning/queue commands** (~6 pages): `queue`, `steer`, `capture`, `triage`, `knowledge`, `cleanup` — these are the "during execution" commands that modify `.gsd/` state while auto-mode runs. Simpler handlers, can be batch-authored.
2. **Diagnostics/config commands** (~6 pages): `doctor`, `forensics`, `prefs`, `mode`, `skill-health`, `config` — these are the configuration and health-check commands with richer internals (doctor has 30+ issue codes, forensics does anomaly detection).
3. **Utility commands + special topics** (~6 pages): `hooks`, `run-hook`, `migrate`, `keyboard-shortcuts`, `cli-flags`, `headless` — hooks and migrate have specific mechanics; the three special topics are reference-style pages.

A final task updates the commands landing page (`content/generated/docs/commands.md`) to link all 18 new pages and adds all 18 sidebar entries to `astro.config.mjs`.

## Implementation Landscape

### Key Files

**Source to study (read-only):**
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` (1910 lines) — Main handler dispatch. Contains inline handlers for: `queue` (delegates to `guided-flow.ts`), `steer` (line 1803), `capture` (line 1714), `triage` (line 1749), `knowledge` (line 1678), `cleanup` (branches: line 1601, snapshots: line 1642), `prefs` (line 507), `mode` (line 596), `doctor` (line 626), `skill-health` (line 751), `hooks` (inline notification), `run-hook` (line 1846), `config` (line 1402), `migrate` (delegates to `./migrate/command.js`)
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/guided-flow.ts` — `showQueue()` at line 296. Queue hub with reorder UI, queue-add flow, milestone picker
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/doctor.ts` (1264 lines) — `runGSDDoctor()`, `formatDoctorReport()`. 30+ issue codes across project/milestone/slice/task scopes. Three modes: doctor (report), fix (auto-repair), heal (dispatch to LLM)
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/forensics.ts` (596 lines) — `handleForensics()`. Scans activity logs, metrics ledger, crash locks, doctor issues. Detects anomalies (stuck-loops, cost-spikes, timeouts, missing artifacts). Writes forensic report, then dispatches to LLM for investigation
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/captures.ts` (384 lines) — `appendCapture()`, `loadPendingCaptures()`, `hasPendingCaptures()`. Worktree-aware path resolution. Classifications: quick-task, inject, defer, replan, note
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/post-unit-hooks.ts` — `formatHookStatus()`, `triggerHookManually()`. Post-unit and pre-dispatch hook lifecycle
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/skill-telemetry.ts` — Backing data for skill-health dashboard
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/migrate/command.ts` — Pipeline: validate → parse → transform → preview → write, then optional agent-driven review
- `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/index.ts` — Keyboard shortcut registration (Ctrl+Alt+G for dashboard)

**Files to create:**
- `src/content/docs/commands/queue.mdx`
- `src/content/docs/commands/steer.mdx`
- `src/content/docs/commands/capture.mdx`
- `src/content/docs/commands/triage.mdx`
- `src/content/docs/commands/knowledge.mdx`
- `src/content/docs/commands/cleanup.mdx`
- `src/content/docs/commands/doctor.mdx`
- `src/content/docs/commands/forensics.mdx`
- `src/content/docs/commands/prefs.mdx`
- `src/content/docs/commands/mode.mdx`
- `src/content/docs/commands/skill-health.mdx`
- `src/content/docs/commands/config.mdx`
- `src/content/docs/commands/hooks.mdx`
- `src/content/docs/commands/run-hook.mdx`
- `src/content/docs/commands/migrate.mdx`
- `src/content/docs/commands/keyboard-shortcuts.mdx`
- `src/content/docs/commands/cli-flags.mdx`
- `src/content/docs/commands/headless.mdx`

**Files to modify:**
- `astro.config.mjs` — Add 18 sidebar entries under the Commands section (after the existing 9 S02 entries)
- `content/generated/docs/commands.md` — Add deep-dive links for all 18 commands (currently unlinked plain text)

### Command Internals Summary

For each command, what the page needs to document:

| Command | Complexity | Key Mechanics |
|---------|-----------|---------------|
| `queue` | Medium | Hub UI: reorder pending milestones (drag reorder → save QUEUE-ORDER.json, remove conflicting depends_on from CONTEXT.md), or add new milestone via LLM discussion. Reads `deriveState()` for registry. |
| `steer` | Medium | Appends override to OVERRIDES.md with scope (`M/S/T`). If auto-mode active: sends `gsd-hard-steer` message to trigger document rewrite unit. If inactive: tells agent to update plans manually. |
| `capture` | Simple | Strips quotes, appends entry to `.gsd/CAPTURES.md` via `appendCapture()`. Worktree-aware (resolves to project root). Works without an active milestone. |
| `triage` | Medium | Loads pending captures, builds context (current plan + roadmap), dispatches `triage-captures` prompt to LLM. Classifications: quick-task, inject, defer, replan, note. |
| `knowledge` | Simple | Takes type (rule/pattern/lesson) + text, appends to KNOWLEDGE.md via `appendKnowledge()`. Scope derived from active milestone/slice. |
| `cleanup` | Simple | Two sub-commands: `branches` (finds gsd/* branches merged into main, deletes them) and `snapshots` (prunes old refs/gsd/snapshots/ keeping last 5 per label). Bare `cleanup` runs both. |
| `doctor` | Complex | Three modes: `doctor` (report issues), `fix` (auto-repair), `heal` (dispatch to LLM). 30+ issue codes. Scope selector (project/milestone/slice). Checks: missing plans, missing summaries, orphaned worktrees, stale crash locks, tracked runtime files, etc. |
| `forensics` | Complex | Scans activity logs (JSONL), metrics ledger, crash locks. Detects anomalies: stuck-loops, cost-spikes, timeouts, missing artifacts, error traces. Generates `ForensicReport`, writes to `.gsd/runtime/`, dispatches to LLM for interactive investigation. |
| `prefs` | Medium | Subcommands: `global`, `project`, `status`, `wizard`/`setup`, `import-claude`. Wizard is category-based UI (models, timeouts, git, skills, budget, notifications). Status shows resolved/unresolved skills. |
| `mode` | Simple | Switches workflow mode (solo/team). Writes to preferences file. Solo vs team changes: unique milestone IDs, git commit behavior, documentation level. |
| `skill-health` | Medium | Dashboard showing skill usage stats, success rates, token trends. Flags: `--declining` (performance drop), `--stale N` (unused N+ days). Detail view with `<skill-name>`. Data from skill-telemetry.ts. |
| `config` | Medium | Interactive tool key setup. Shows status of 5 tool integrations (Tavily, Brave, Context7, Jina, Groq). Select → paste key → save to auth storage + set env var. Reloads extensions after. |
| `hooks` | Simple | Read-only display of configured post-unit and pre-dispatch hooks from preferences. Shows name, enabled/disabled, target unit types, active cycles. |
| `run-hook` | Medium | Manual hook trigger. Args: `<hook-name> <unit-type> <unit-id>`. Validates hook exists and unit ID format. Dispatches hook unit via `dispatchHookUnit()`. |
| `migrate` | Medium | Pipeline: validate `.planning/` → parse directory → transform to GSD format → preview stats → write `.gsd/`. Optional agent-driven review after write. |
| Keyboard shortcuts | Reference | 4 shortcuts: Ctrl+Alt+G (dashboard), Ctrl+Alt+V (voice), Ctrl+Alt+B (background shells), Escape (pause). Kitty protocol note. |
| CLI flags | Reference | ~10 flags: `--continue`, `--model`, `--print`, `--mode`, `--list-models`, `--debug`, `config`, `update`, `sessions`. |
| Headless | Medium | `gsd headless` entry: spawns RPC child process, auto-responds to prompts, detects completion. Exit codes: 0/1/2. Flags: `--timeout`, `--json`, `--model`. Any `/gsd` subcommand as positional arg. |

### Build Order

1. **T01: Planning/queue commands** (queue, steer, capture, triage, knowledge, cleanup) — 6 pages. These are the simpler commands with shorter handlers. Gets the pattern rolling with high page throughput.
2. **T02: Diagnostics/config commands** (doctor, forensics, prefs, mode, skill-health, config) — 6 pages. More complex handlers requiring deeper source study. Doctor and forensics each need substantial Mermaid diagrams.
3. **T03: Utilities + special topics + wiring** (hooks, run-hook, migrate, keyboard-shortcuts, cli-flags, headless) — 6 pages. Plus: add all 18 sidebar entries to `astro.config.mjs`, add deep-dive links to `content/generated/docs/commands.md`.

Each task is independently verifiable: pages build, Mermaid renders, links resolve.

### Verification Approach

After each task:
- `npm run build` succeeds (page count should increase by ~6 per task, final total ~54)
- `node scripts/check-links.mjs` passes (0 broken links)
- `grep -l 'mermaid' src/content/docs/commands/*.mdx | wc -l` shows increasing Mermaid coverage (not all pages need Mermaid — reference pages like keyboard-shortcuts don't)
- All new pages accessible in sidebar

After T03 (final verification):
- All 27 commands/* pages exist: `ls src/content/docs/commands/*.mdx | wc -l` → 27
- All sidebar entries present: `grep "'/commands/" astro.config.mjs | wc -l` → 28 (27 pages + 1 Commands Reference link)
- All commands in `content/generated/docs/commands.md` link to deep-dive pages (no unlinked plain text commands)
- `npm run build` total page count ~54 (36 from S02 + 18 new)
- Pagefind indexes all new pages

## Constraints

- **Sidebar entries are manual** — each page needs both an `.mdx` file AND a `{ label, link }` entry in `astro.config.mjs`. Missing either causes a broken link or unreachable page.
- **Commands landing page source is `content/generated/docs/commands.md`**, NOT `src/content/docs/commands.md`. The latter is overwritten by the prebuild script.
- **Special topic pages** (keyboard-shortcuts, cli-flags, headless) don't fit the standard command template perfectly — they're reference pages, not "/gsd X does Y" pages. They need a slightly adapted structure (tables instead of Mermaid flows for the simpler ones).
- **Headless mode** lacks a dedicated source file — it's described in the commands reference but the implementation lives in the main CLI entry point (not in the GSD extension). Document from the reference table content and behavior description.

## Common Pitfalls

- **Editing `src/content/docs/commands.md` instead of `content/generated/docs/commands.md`** — prebuild overwrites the former. Already documented in KNOWLEDGE.md but easy to forget.
- **Missing sidebar entry after creating page** — page builds but is unreachable from navigation. Always add both the file and the sidebar entry in the same task.
- **Mermaid node style inconsistency** — S02 established: decision nodes `fill:#0d180d`, action nodes `fill:#1a3a1a`, error nodes `fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8`. All non-error nodes use `stroke:#39ff14,color:#e8f4e8`. Follow this exactly.
- **Link format** — Internal cross-links between command pages use `../sibling/` format (not `/commands/sibling/`). See KNOWLEDGE.md entry on Starlight link format.
