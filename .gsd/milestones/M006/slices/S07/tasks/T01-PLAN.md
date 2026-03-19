---
estimated_steps: 5
estimated_files: 1
---

# T01: Write Section 5 — context-engineering.mdx

**Slice:** S07 — Sections 5 & 6 — Context Engineering + Costs
**Milestone:** M006

## Description

Write the substantive content for Section 5 of the Solo Builder's Guide: "What You Write vs What GSD Writes." This page covers context engineering from the practitioner's perspective — the five files/practices that represent the highest-leverage skill in the entire GSD workflow.

The page must cover five topics (per R067):
1. **agent-instructions.md as the project constitution** — hard limits + pattern rules. Section 3 (brownfield.mdx) already introduces agent-instructions.md with the invoice SaaS example. This section should deepen that without repeating it — focus on ongoing maintenance, evolution across milestones, and what good context looks like over time.
2. **DECISIONS.md as architectural memory** — how decisions feed into every agent session, how they accumulate, when to record one.
3. **KNOWLEDGE.md for domain terminology** — rules, patterns, lessons. The `/gsd knowledge` command's three types.
4. **Reading GSD's output** — summaries, state files, what to look for when reviewing what auto mode produced.
5. **Giving good discussion answers** — specificity pays dividends. How the quality of your input to `/gsd` discussion shapes the quality of the plan.

## Steps

1. Read the current stub at `src/content/docs/solo-guide/context-engineering.mdx` and preserve the exact frontmatter (title: "What You Write vs What GSD Writes", description: "The files you maintain and how they shape every AI session.").
2. Write an opening paragraph (before any heading) that establishes the section's purpose — the practitioner's side of context engineering, as distinct from the reference docs that explain the formats.
3. Write five major sections with `---` separators and `##` headings, covering the five topics above. Each section should be narrative prose, ~20–30 lines, following the voice established by the sibling solo-guide pages (direct, practical, conversational but precise).
4. Add cross-references throughout using the `→ gsd2-guide:` notation (D070):
   - To reference pages: `→ gsd2-guide: [Page Title](../../page-slug/)` (two levels up)
   - To sibling solo-guide pages: `→ gsd2-guide: [Section N: Title](../sibling-slug/)` (one level up)
   - Minimum 5 cross-references, targeting: `../../configuration/`, `../../commands/knowledge/`, `../../commands/prefs/`, `../../commands/export/`, `../brownfield/`, `../first-project/`, `../controlling-costs/`, `../daily-mix/`
5. Use Australian spelling throughout: behaviour, practise (verb), practice (noun), recognise, organise, colour, licence (noun). Verify with grep.

## Must-Haves

- [ ] Frontmatter title "What You Write vs What GSD Writes" and description preserved exactly
- [ ] All five R067 topics covered with substantive prose (not bullet-point summaries)
- [ ] `---` horizontal rules between major sections (D072)
- [ ] ≥5 cross-references using `→ gsd2-guide:` notation (D070)
- [ ] Australian spelling present (behaviour, recognise, practise, etc.)
- [ ] No duplication of reference page content — link to reference pages instead
- [ ] Does not repeat brownfield.mdx's agent-instructions.md introduction — deepens it
- [ ] >100 lines total
- [ ] No MDX parse errors (no unescaped curly braces in template variable references — wrap in backticks)

## Verification

- `wc -l src/content/docs/solo-guide/context-engineering.mdx` → >100
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/context-engineering.mdx` → ≥5
- `grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/context-engineering.mdx` → >0
- `head -3 src/content/docs/solo-guide/context-engineering.mdx` → frontmatter title matches "What You Write vs What GSD Writes"

## Observability Impact

**What signals change after this task:**
- `wc -l src/content/docs/solo-guide/context-engineering.mdx` goes from 8 → >100 lines
- `grep -c "→ gsd2-guide:" …/context-engineering.mdx` goes from 0 → ≥5
- `grep -c "behaviour\|recognise\|…" …/context-engineering.mdx` goes from 0 → >0

**How a future agent inspects this task:**
- Run the four verification commands listed in the Verification section — they are deterministic and self-describing
- Read `T01-SUMMARY.md` for the Verification Evidence table which records actual command outputs and exit codes
- If the file was correctly written, `head -3 context-engineering.mdx` shows the exact frontmatter title

**Failure state:**
- If the file is still the 8-line stub, the write step did not complete — re-run from step 2
- If `npm run build` fails with an MDX error on this file, look for unescaped `{` or `}` characters in the prose — the Astro error output names the line
- `T01-SUMMARY.md` will have `blocker_discovered: false` if execution completed normally; absence of the summary file means the task never finished

## Inputs

- Current stub: `src/content/docs/solo-guide/context-engineering.mdx` (8 lines — frontmatter + placeholder)
- Voice/structure reference: read `src/content/docs/solo-guide/brownfield.mdx` (128 lines) for established tone, cross-reference style, and section structure. Also glance at `src/content/docs/solo-guide/why-gsd.mdx` and `src/content/docs/solo-guide/daily-mix.mdx`.
- Content to NOT repeat: `src/content/docs/solo-guide/brownfield.mdx` already covers agent-instructions.md setup in detail with the invoice SaaS example (the `## Constraining GSD on an existing codebase` section). Section 5 should reference that and focus on ongoing evolution, not initial setup.
- Cross-reference targets (read-only, for linking not duplicating):
  - `src/content/docs/configuration.md` — agent-instructions.md format, preferences, budget config
  - `src/content/docs/commands/knowledge.mdx` — `/gsd knowledge rule|pattern|lesson` command
  - `src/content/docs/commands/prefs.mdx` — `/gsd prefs` interactive wizard
  - `src/content/docs/commands/export.mdx` — `/gsd export` for retrospective reports

## Expected Output

- `src/content/docs/solo-guide/context-engineering.mdx` — ~120–150 lines of narrative prose covering all five R067 topics, with ≥5 cross-references, Australian spelling, `---` separators, and no reference-page duplication. Reads as the "practitioner's guide to context engineering" that complements the reference documentation.
