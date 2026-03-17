---
id: T02
parent: S03
milestone: M002
provides:
  - 6 command deep-dive pages (doctor, forensics, prefs, mode, skill-health, config)
  - 6 sidebar entries in astro.config.mjs
  - 6 deep-dive links in commands landing page
  - Also fixed 5 missing T01 landing page links (steer, queue, capture, cleanup, knowledge)
key_files:
  - src/content/docs/commands/doctor.mdx
  - src/content/docs/commands/forensics.mdx
  - src/content/docs/commands/prefs.mdx
  - src/content/docs/commands/mode.mdx
  - src/content/docs/commands/skill-health.mdx
  - src/content/docs/commands/config.mdx
key_decisions:
  - Mermaid diagrams for doctor (three-mode flow), forensics (anomaly pipeline), prefs (subcommand routing + category wizard), skill-health (data-flow pattern), and config (interactive setup loop)
  - Mode uses comparison table instead of Mermaid — solo vs team settings are better as a table
  - Doctor issue codes grouped by scope with representative examples — not a raw dump of all 27 codes
patterns_established:
  - Complex diagnostic commands (doctor, forensics) need both a pipeline diagram AND a reference table for the types/codes they produce
  - Data-flow pattern (sources → derivation → rendering) works well for read-only dashboard commands like skill-health
observability_surfaces:
  - "ls src/content/docs/commands/*.mdx | wc -l → 21 confirms page count"
  - "grep \"'/commands/\" astro.config.mjs | wc -l → 22 confirms sidebar entries"
  - "node scripts/check-links.mjs validates all cross-links including 6 new pages"
  - "grep -c 'doctor/\\|forensics/\\|prefs/\\|mode/\\|skill-health/\\|config/' content/generated/docs/commands.md → 6"
duration: 18m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Author diagnostics and config command deep-dives

**Created 6 command deep-dive pages for the diagnostics and configuration commands with Mermaid diagrams for doctor, forensics, prefs, skill-health, and config.**

## What Happened

Read source handlers in `doctor.ts` (1264 lines), `forensics.ts` (596 lines), `commands.ts` (skill-health, prefs, mode, config sections) for accuracy. Created MDX pages following the established S02 template exactly:

- **doctor.mdx** — Richest page in the guide. Three-mode Mermaid diagram (doctor→report, fix→auto-repair, heal→LLM dispatch). Issue code reference table grouped by scope (project/milestone/slice/task/git) with 27 codes. Detailed fix-mode behavior list and heal dispatch explanation.
- **forensics.mdx** — Anomaly detection pipeline Mermaid diagram showing 5 data sources (activity logs, metrics, crash lock, doctor, completed keys) feeding 7 anomaly detectors. Anomaly type reference table with triggers. Report persistence and LLM dispatch flow.
- **prefs.mdx** — Subcommand routing Mermaid diagram (global/project/status/wizard/import-claude paths) plus category wizard loop. Preference categories table covering all 8 wizard categories. Import-claude flow documented.
- **mode.mdx** — Solo vs team comparison table (7 settings). Unique milestone ID explanation. No Mermaid — a comparison table is more useful for a toggle command.
- **skill-health.mdx** — Data-flow Mermaid diagram (telemetry + activity + prefs → report → filtered views). Dashboard metrics table. Declining detection and staleness detection explained.
- **config.mdx** — Interactive setup loop Mermaid diagram (load auth → show status → select/paste/save loop → reload). Tool integrations table (Tavily, Brave, Context7, Jina, Groq) with env vars and URLs. Auth storage format documented.

Added 6 sidebar entries after T01's entries. Converted 6 T02 commands plus 5 missing T01 commands in `content/generated/docs/commands.md` to linked deep-dive references.

## Verification

- `npm run build` → 48 pages built, 0 errors ✓
- `node scripts/check-links.mjs` → 2274 internal links checked, 0 broken ✓
- `ls src/content/docs/commands/*.mdx | wc -l` → 21 ✓
- `grep "'/commands/" astro.config.mjs | wc -l` → 22 ✓
- All 6 new pages present in `dist/commands/*/index.html` ✓
- Pagefind indexed 48 pages ✓

### Slice-level checks (partial — T02 is 2 of 3 tasks):
- Build succeeds: ✓ (48 pages, target ~54 at slice end)
- Link check passes: ✓
- MDX count: 21/27
- Sidebar count: 22/28

## Diagnostics

- Check page presence: `ls dist/commands/{doctor,forensics,prefs,mode,skill-health,config}/index.html`
- Verify cross-links: `node scripts/check-links.mjs`
- Count sidebar entries: `grep "'/commands/" astro.config.mjs | wc -l`
- Inspect landing page links: `grep -c 'doctor/\|forensics/\|prefs/\|mode/\|skill-health/\|config/' content/generated/docs/commands.md`

## Deviations

- Fixed 5 missing T01 landing page links (steer, queue, capture, cleanup, knowledge) that were left unlinked despite T01 summary claiming they were converted. The MDX pages existed but the commands.md entries were still plain text.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/commands/doctor.mdx` — Doctor deep-dive with three-mode Mermaid diagram and issue code reference
- `src/content/docs/commands/forensics.mdx` — Forensics deep-dive with anomaly detection pipeline diagram
- `src/content/docs/commands/prefs.mdx` — Preferences deep-dive with subcommand routing diagram and category table
- `src/content/docs/commands/mode.mdx` — Mode deep-dive with solo/team comparison table
- `src/content/docs/commands/skill-health.mdx` — Skill-health deep-dive with data-flow diagram
- `src/content/docs/commands/config.mdx` — Config deep-dive with interactive setup flow diagram
- `astro.config.mjs` — 6 new sidebar entries added under Commands section
- `content/generated/docs/commands.md` — 11 commands converted from plain text to deep-dive links (6 T02 + 5 missed T01)
- `.gsd/milestones/M002/slices/S03/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix)
