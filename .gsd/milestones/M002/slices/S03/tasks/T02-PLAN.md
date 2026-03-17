---
estimated_steps: 8
estimated_files: 8
---

# T02: Author diagnostics and config command deep-dives

**Slice:** S03 — Command deep-dives — planning, maintenance, and utility commands
**Milestone:** M002

## Description

Create 6 MDX deep-dive pages for the diagnostics and configuration commands: `/gsd doctor`, `/gsd forensics`, `/gsd prefs`, `/gsd mode`, `/gsd skill-health`, and `/gsd config`. Doctor and forensics are the most complex commands in GSD — doctor has 30+ issue codes and three modes (report/fix/heal), forensics does anomaly detection across activity logs and metrics. These pages need the most detailed Mermaid diagrams in the guide.

Each page follows the established S02 template exactly (see T01 plan for the full template specification).

## Steps

1. **Study source handlers.** Read the relevant source files for accurate documentation:
   - `doctor`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/doctor.ts` (1264 lines) — `runGSDDoctor()`, `formatDoctorReport()`. Three modes: doctor (report), fix (auto-repair), heal (LLM dispatch). 30+ issue codes across project/milestone/slice/task scopes.
   - `forensics`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/forensics.ts` (596 lines) — `handleForensics()`. Scans activity logs, metrics ledger, crash locks. Anomaly detection: stuck-loops, cost-spikes, timeouts, missing artifacts.
   - `prefs`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 507. Subcommands: global, project, status, wizard/setup, import-claude. Wizard is category-based UI.
   - `mode`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 596. Solo/team toggle with coordinated defaults.
   - `skill-health`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 751; backing data from `skill-telemetry.ts`.
   - `config`: `~/.nvm/versions/node/v22.22.0/lib/node_modules/gsd-pi/src/resources/extensions/gsd/commands.ts` — line 1402. Interactive tool key setup for 5 integrations.

2. **Create `src/content/docs/commands/doctor.mdx`** — This is the richest page. Needs:
   - Mermaid diagram showing the three-mode flow: doctor → scope selector → scan → report; fix → scope selector → scan → auto-repair; heal → scope selector → scan → dispatch to LLM.
   - Table or categorized list of issue codes grouped by scope (project, milestone, slice, task).
   - Examples showing doctor output, fix auto-repair, and heal dispatch.

3. **Create `src/content/docs/commands/forensics.mdx`** — Complex anomaly detection pipeline. Needs:
   - Mermaid diagram showing: scan sources (activity logs, metrics, crash locks) → anomaly detection → generate ForensicReport → write to `.gsd/runtime/` → dispatch to LLM for investigation.
   - List of anomaly types with descriptions.
   - Example showing a forensic investigation session.

4. **Create `src/content/docs/commands/prefs.mdx`** — Multi-subcommand preferences system. Needs:
   - Mermaid diagram showing subcommand routing: prefs → global/project/status/wizard/import-claude paths.
   - Table of preference categories (models, timeouts, git, skills, budget, notifications).
   - Example of wizard flow.

5. **Create `src/content/docs/commands/mode.mdx`** — Simple toggle command. Prose + table showing solo vs team mode differences (unique milestone IDs, git commit behavior, documentation level). No Mermaid needed — a comparison table is more useful than a flowchart.

6. **Create `src/content/docs/commands/skill-health.mdx`** — Data-flow/dashboard display command. Use the data-flow diagram pattern from S02 (sources → derivation → rendering) since this is a read-only display. Show the flags (--declining, --stale N) and detail view.

7. **Create `src/content/docs/commands/config.mdx`** — Interactive key setup. Mermaid diagram showing: list integrations → select → paste key → validate → save to auth storage → reload extensions. Table of the 5 tool integrations (Tavily, Brave, Context7, Jina, Groq).

8. **Wire sidebar and landing page.** Add 6 sidebar entries to `astro.config.mjs` after the T01 entries. Add deep-dive links for all 6 commands in `content/generated/docs/commands.md`.

### Mermaid Styling Convention

All Mermaid diagrams MUST use this exact node styling (same as T01):
- Start/end nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- Decision nodes: `fill:#0d180d,stroke:#39ff14,color:#39ff14`
- Action nodes: `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`
- Error/unreachable nodes: `fill:#3a1a1a,stroke:#ff4444,color:#e8e8e8`

### Cross-link Format

Links between command pages use relative `../sibling/` format: `[text](../sibling/)`

### Key Constraints

- **Doctor issue codes**: Don't list all 30+ individually — group by scope (project/milestone/slice/task) with representative examples. The page should teach the concept, not be a raw dump.
- **Forensics anomaly types**: Describe the categories (stuck-loops, cost-spikes, timeouts, missing artifacts, error traces) with what each detects and when it fires.
- **Prefs wizard categories**: List the categories and what each configures, but don't screenshot every prompt — show a representative example flow.
- **Skill-health**: Use the data-flow diagram pattern (same as `/gsd status` and `/gsd visualize` from S02) since it's a read-only display command.

## Must-Haves

- [ ] 6 MDX files created in `src/content/docs/commands/`
- [ ] Each page has frontmatter, What It Does, Usage, How It Works, What Files It Touches, Examples, Related Commands
- [ ] Mermaid diagrams for doctor, forensics, prefs, and config (minimum)
- [ ] Doctor page includes issue code groupings by scope
- [ ] Forensics page includes anomaly type descriptions
- [ ] 6 sidebar entries added to `astro.config.mjs`
- [ ] 6 deep-dive links added to `content/generated/docs/commands.md`

## Verification

- `npm run build` succeeds (expect ~48 pages)
- `node scripts/check-links.mjs` exits 0 with 0 broken links
- `ls src/content/docs/commands/*.mdx | wc -l` → 21
- All 6 new pages appear in `dist/commands/*/index.html`
- `grep "'/commands/" astro.config.mjs | wc -l` → 22

## Inputs

- `src/content/docs/commands/queue.mdx` (or any T01 page) — Verify the template is being followed consistently
- `src/content/docs/commands/status.mdx` or `visualize.mdx` — Reference for data-flow diagram pattern used by read-only display commands
- `astro.config.mjs` — Sidebar, insert after T01's entries in Commands section
- `content/generated/docs/commands.md` — Commands landing page, add links (NOT `src/content/docs/commands.md`)
- GSD source files listed in Step 1

## Expected Output

- `src/content/docs/commands/doctor.mdx` — Doctor deep-dive with three-mode Mermaid diagram and issue code reference
- `src/content/docs/commands/forensics.mdx` — Forensics deep-dive with anomaly detection pipeline diagram
- `src/content/docs/commands/prefs.mdx` — Preferences deep-dive with subcommand routing diagram
- `src/content/docs/commands/mode.mdx` — Mode deep-dive with solo/team comparison table
- `src/content/docs/commands/skill-health.mdx` — Skill-health deep-dive with data-flow diagram
- `src/content/docs/commands/config.mdx` — Config deep-dive with interactive setup flow diagram
- `astro.config.mjs` — 6 more sidebar entries under Commands (22 total)
- `content/generated/docs/commands.md` — 6 more commands linked to deep-dive pages
