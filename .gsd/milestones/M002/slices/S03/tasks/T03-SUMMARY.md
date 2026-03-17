---
id: T03
parent: S03
milestone: M002
provides:
  - 6 command deep-dive/reference pages (hooks, run-hook, migrate, keyboard-shortcuts, cli-flags, headless)
  - 6 sidebar entries in astro.config.mjs (28 total in Commands section)
  - Fully linked commands landing page — all GSD commands with deep-dive pages are linked
key_files:
  - src/content/docs/commands/hooks.mdx
  - src/content/docs/commands/run-hook.mdx
  - src/content/docs/commands/migrate.mdx
  - src/content/docs/commands/keyboard-shortcuts.mdx
  - src/content/docs/commands/cli-flags.mdx
  - src/content/docs/commands/headless.mdx
key_decisions:
  - Special topic pages (keyboard-shortcuts, cli-flags, headless) use reference-table structure instead of standard command template — they're reference material, not command lifecycle descriptions
  - Headless mode uses Mermaid diagram since it has a real process lifecycle (spawn → events → exit codes); keyboard-shortcuts and cli-flags are pure reference tables
  - skill-health subcommand variants in landing page linked to the main skill-health deep-dive page rather than creating separate pages
patterns_established:
  - Reference pages omit What Files It Touches / Usage sections when they don't apply — replaced with flag tables and examples
  - Landing page section headings can be linked directly to their deep-dive counterparts using markdown heading links
observability_surfaces:
  - Build page count (54) verifiable via npm run build
  - Link integrity via node scripts/check-links.mjs (0 broken links)
  - Sidebar entry count via grep "'/commands/" astro.config.mjs | wc -l (28)
  - dist/commands/*/index.html existence for each page
duration: 15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T03: Author utility commands and special topic pages

**Created 6 final pages — 3 utility command deep-dives (hooks, run-hook, migrate) and 3 special topic reference pages (keyboard-shortcuts, cli-flags, headless) — completing full command coverage for the GSD guide.**

## What Happened

Created 3 utility command pages following the standard S02 template:
- **hooks.mdx** — Read-only display of configured hooks. Prose + tables showing hook types, display fields, and configuration source. No Mermaid — display commands don't need flow diagrams.
- **run-hook.mdx** — Manual hook trigger with Mermaid flow diagram showing the 3-stage validation (arg count → hook exists → unit ID format) then dispatch. Documented the idempotency bypass behavior.
- **migrate.mdx** — Migration pipeline with Mermaid diagram showing all 5 stages plus the optional agent review. Includes directory mapping table showing v1 → GSD-2 structure.

Created 3 special topic reference pages with adapted structure:
- **keyboard-shortcuts.mdx** — Table of 4 shortcuts with terminal compatibility notes (Kitty protocol support, fallback commands for unsupported terminals).
- **cli-flags.mdx** — Session flags and subcommands tables with syntax, descriptions, and examples.
- **headless.mdx** — RPC lifecycle documentation with Mermaid diagram (spawn → event loop → exit codes), flag table, and exit code reference.

Wired all 6 sidebar entries after T02's entries. Updated the commands landing page: linked hooks/run-hook/migrate commands, linked skill-health subcommand variants to the skill-health page, and added deep-dive links on the Keyboard Shortcuts, CLI Flags, and Headless Mode section headings.

## Verification

All slice-level acceptance criteria pass:

- `ls src/content/docs/commands/*.mdx | wc -l` → **27** ✅
- `grep "'/commands/" astro.config.mjs | wc -l` → **28** ✅
- `npm run build` → **54 pages built** ✅
- `node scripts/check-links.mjs` → **0 broken links** (2880 checked) ✅
- `ls dist/commands/*/index.html | wc -l` → **27** ✅
- Pagefind indexes **54 pages** ✅
- All 6 new pages present in `dist/commands/{hooks,run-hook,migrate,keyboard-shortcuts,cli-flags,headless}/index.html` ✅

Remaining unlinked commands in landing page: `/gsd help` (inline help text, no deep-dive), `/gsd parallel *` (covered by dedicated parallel-orchestration page). These are expected and appropriate.

## Diagnostics

- Check any page exists: `ls dist/commands/<name>/index.html`
- Verify sidebar count: `grep "'/commands/" astro.config.mjs | wc -l` → 28
- Verify link integrity: `node scripts/check-links.mjs`
- Check landing page unlinked commands: `grep '| \x60/gsd' content/generated/docs/commands.md | grep -v '\['`
- Build failure with Mermaid syntax: error message includes file path and parse details

## Deviations

- Linked skill-health subcommand variants (`<name>`, `--declining`, `--stale N`) to the main skill-health deep-dive page — not in original plan but needed to reduce unlinked command count.
- Linked the Headless Mode section heading in the landing page — plan only mentioned Keyboard Shortcuts and CLI Flags but headless was also an unlinked section.

## Known Issues

- `/gsd help` and `/gsd parallel *` remain unlinked in the landing page. These are intentional — help is simple inline text and parallel commands are covered by the parallel-orchestration page, not individual deep-dives.

## Files Created/Modified

- `src/content/docs/commands/hooks.mdx` — Hooks display deep-dive (prose + tables)
- `src/content/docs/commands/run-hook.mdx` — Run-hook deep-dive with dispatch flow Mermaid diagram
- `src/content/docs/commands/migrate.mdx` — Migrate deep-dive with 5-stage pipeline Mermaid diagram
- `src/content/docs/commands/keyboard-shortcuts.mdx` — Reference page with shortcut table and terminal compatibility
- `src/content/docs/commands/cli-flags.mdx` — Reference page with flag and subcommand tables
- `src/content/docs/commands/headless.mdx` — Reference page with RPC lifecycle Mermaid diagram and exit codes
- `astro.config.mjs` — 6 sidebar entries added (28 total in Commands section)
- `content/generated/docs/commands.md` — Linked remaining commands and section headings
- `.gsd/milestones/M002/slices/S03/tasks/T03-PLAN.md` — Added Observability Impact section (pre-flight fix)
