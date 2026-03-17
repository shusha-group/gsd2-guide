# S03: Command deep-dives — planning, maintenance, and utility commands

**Goal:** Every remaining GSD command has a deep-dive page following the S02 template — 15 slash commands plus 3 special topic pages (keyboard shortcuts, CLI flags, headless mode). All pages are wired into the sidebar and linked from the commands landing page.
**Demo:** A user navigating the Commands sidebar section sees all 27 command pages (9 from S02 + 18 new). Each page shows what the command does, how it works internally, what files it touches, terminal examples, and Mermaid diagrams where appropriate. The commands landing page links to every deep-dive. Search indexes all new pages.

## Must-Haves

- 18 new MDX pages in `src/content/docs/commands/` following the established template (What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands)
- Mermaid flow diagrams for commands with non-trivial logic (doctor, forensics, prefs, triage, queue, steer, migrate, headless at minimum)
- Simple/reference commands (capture, knowledge, cleanup, hooks, mode, keyboard-shortcuts, cli-flags) use tables or prose where Mermaid adds no value
- All 18 pages have sidebar entries in `astro.config.mjs` under the Commands section
- All unlinked commands in `content/generated/docs/commands.md` get deep-dive links
- Mermaid node styling matches S02 convention: decision `fill:#0d180d`, action `fill:#1a3a1a`, error `fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8`, non-error `stroke:#39ff14,color:#e8f4e8`
- Internal cross-links use `../sibling/` format
- Cookmate used as example project where examples are needed

## Verification

- `npm run build` succeeds with ~54 pages (36 from S02 + 18 new)
- `node scripts/check-links.mjs` exits 0 with 0 broken links
- `ls src/content/docs/commands/*.mdx | wc -l` → 27 (9 existing + 18 new)
- `grep "'/commands/" astro.config.mjs | wc -l` → 28 (27 pages + 1 Commands Reference link)
- All 18 new pages appear in dist/commands/*/index.html
- Commands landing page has no unlinked `/gsd` commands (all use `[text](link/)` format)
- Pagefind indexes all new pages

## Observability / Diagnostics

- **Build output page count**: `npm run build` reports total pages — verify count increases by 18 (from ~36 to ~54)
- **Link integrity**: `node scripts/check-links.mjs` validates all internal cross-links — 0 broken links confirms no dead references
- **Sidebar entry count**: `grep "'/commands/" astro.config.mjs | wc -l` — must reach 28 (27 pages + 1 Commands Reference link)
- **Landing page coverage**: No unlinked `/gsd` commands remain — all use `[text](link/)` format
- **Pagefind search**: New pages indexed and searchable — confirms they're reachable outside sidebar navigation
- **Failure-path check**: Run `npm run build` with a deliberately broken Mermaid diagram in one MDX page (e.g., unclosed node) → build should fail with a Mermaid parse error pointing to the file. Revert after confirming. This validates that Mermaid syntax errors surface clearly rather than silently producing broken pages.

## Integration Closure

- Upstream surfaces consumed: S01 sidebar structure in `astro.config.mjs`, S02 per-command page template, `content/generated/docs/commands.md` link format
- New wiring introduced: 18 sidebar entries, 18 landing page links
- What remains before the milestone is truly usable end-to-end: S04 (recipes) — commands are fully covered after this slice

## Tasks

- [x] **T01: Author planning and queue command deep-dives** `est:45m`
  - Why: Covers the 6 "during execution" commands that modify `.gsd/` state — the simpler handlers that establish S03's cadence.
  - Files: `src/content/docs/commands/queue.mdx`, `src/content/docs/commands/steer.mdx`, `src/content/docs/commands/capture.mdx`, `src/content/docs/commands/triage.mdx`, `src/content/docs/commands/knowledge.mdx`, `src/content/docs/commands/cleanup.mdx`, `astro.config.mjs`, `content/generated/docs/commands.md`
  - Do: Create 6 MDX pages following the S02 template exactly (frontmatter → What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands). Study source handlers in `commands.ts`, `guided-flow.ts`, and `captures.ts` for accuracy. Add Mermaid diagrams for queue, steer, and triage. Capture, knowledge, and cleanup are simple enough for prose + tables. Add 6 sidebar entries to `astro.config.mjs` and link 6 commands in `content/generated/docs/commands.md`.
  - Verify: `npm run build` succeeds with ~42 pages, `node scripts/check-links.mjs` passes, `ls src/content/docs/commands/*.mdx | wc -l` → 15
  - Done when: 6 new pages exist, all reachable via sidebar, all linked from commands landing page, build and link check pass

- [x] **T02: Author diagnostics and config command deep-dives** `est:50m`
  - Why: Covers the 6 configuration and health-check commands — doctor and forensics are the most complex commands in GSD with rich internal mechanics needing detailed Mermaid diagrams.
  - Files: `src/content/docs/commands/doctor.mdx`, `src/content/docs/commands/forensics.mdx`, `src/content/docs/commands/prefs.mdx`, `src/content/docs/commands/mode.mdx`, `src/content/docs/commands/skill-health.mdx`, `src/content/docs/commands/config.mdx`, `astro.config.mjs`, `content/generated/docs/commands.md`
  - Do: Create 6 MDX pages. Doctor needs a multi-mode Mermaid diagram (doctor/fix/heal paths) and an issue codes reference. Forensics needs an anomaly detection pipeline diagram. Prefs needs the category/wizard flow. Skill-health and config are medium complexity — data-flow pattern for display commands, interactive flow for config. Mode is simple (toggle + coordinated defaults). Study source in `commands.ts`, `doctor.ts`, `forensics.ts`, `skill-telemetry.ts`. Add 6 sidebar entries and 6 landing page links.
  - Verify: `npm run build` succeeds with ~48 pages, `node scripts/check-links.mjs` passes, `ls src/content/docs/commands/*.mdx | wc -l` → 21
  - Done when: 6 new pages exist, doctor and forensics have Mermaid diagrams showing their multi-mode mechanics, all pages reachable via sidebar, build and link check pass

- [x] **T03: Author utility commands and special topic pages** `est:45m`
  - Why: Covers the final 6 pages — 3 utility commands (hooks, run-hook, migrate) and 3 special topic reference pages (keyboard-shortcuts, cli-flags, headless). Completes full command coverage and validates the slice.
  - Files: `src/content/docs/commands/hooks.mdx`, `src/content/docs/commands/run-hook.mdx`, `src/content/docs/commands/migrate.mdx`, `src/content/docs/commands/keyboard-shortcuts.mdx`, `src/content/docs/commands/cli-flags.mdx`, `src/content/docs/commands/headless.mdx`, `astro.config.mjs`, `content/generated/docs/commands.md`
  - Do: Create 6 MDX pages. Hooks is read-only display (prose + table). Run-hook uses a short dispatch flow diagram. Migrate needs a pipeline diagram (validate → parse → transform → preview → write). Special topic pages use reference-table format: keyboard-shortcuts is a table of shortcuts with notes on Kitty protocol; cli-flags is a table of flags with descriptions and examples; headless documents the RPC entry point, exit codes, and flags. Add 6 sidebar entries and ensure all remaining unlinked commands in the landing page now have deep-dive links. Run full slice verification.
  - Verify: `npm run build` succeeds with ~54 pages, `node scripts/check-links.mjs` passes, `ls src/content/docs/commands/*.mdx | wc -l` → 27, `grep "'/commands/" astro.config.mjs | wc -l` → 28, no unlinked `/gsd` commands in landing page
  - Done when: All 18 new S03 pages exist, all 27 command pages reachable via sidebar, commands landing page fully linked, build passes, link check passes, Pagefind indexes ~54 pages

## Files Likely Touched

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
- `astro.config.mjs`
- `content/generated/docs/commands.md`
