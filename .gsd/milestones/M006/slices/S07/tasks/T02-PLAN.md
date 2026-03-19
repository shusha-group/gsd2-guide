---
estimated_steps: 6
estimated_files: 1
---

# T02: Write Section 6 — controlling-costs.mdx, build, and verify

**Slice:** S07 — Sections 5 & 6 — Context Engineering + Costs
**Milestone:** M006

## Description

Write the substantive content for Section 6 of the Solo Builder's Guide: "Controlling Costs." This page covers the practical economics of using GSD 2 — the companion to Section 1's "here's the landscape" framing. Where Section 1 (why-gsd.mdx) introduces the cost question, Section 6 is the practical "how to" — picking a profile, setting a ceiling, reading the cost breakdown.

After writing the page, run `npm run build` and `npm run check-links` to verify both S07 pages (Section 5 from T01 and Section 6 from this task) compile and all cross-references resolve.

The page must cover five topics (per R068):
1. **Flat-rate vs pay-per-use reality** — Claude Max subscription, Anthropic API pay-per-token, platform subscriptions (Cursor, Replit). Honest about tradeoffs, not a sales pitch.
2. **Token profiles (budget/balanced/quality)** — what each trades off, in plain English. Do NOT reproduce the detailed tables from token-optimization.md — give the practitioner's framing ("when to use which") and link to the reference.
3. **Per-phase model routing** — using cheaper models for mechanical work (research, planning) and heavier models for complex reasoning (execution, verification). Link to dynamic-model-routing.md.
4. **Budget ceiling configuration** — how to set it, what happens when you hit it, how to adjust. Link to cost-management.md.
5. **Typical cost patterns** — what a milestone actually costs, what drives spend up (large context, quality profile, complex tasks), how context engineering from Section 5 affects costs.

## Steps

1. Read the current stub at `src/content/docs/solo-guide/controlling-costs.mdx` and preserve the exact frontmatter (title: "Controlling Costs", description: "Token profiles, model routing, and keeping spend predictable.").
2. Read the T01 output (`src/content/docs/solo-guide/context-engineering.mdx`) to understand what Section 5 established — Section 6 should reference it naturally where context engineering affects cost.
3. Write an opening paragraph (before any heading) establishing the section's purpose — practical cost management for a solo builder, building on Section 1's landscape overview.
4. Write five major sections with `---` separators and `##` headings, covering the five topics above. Each section ~15–25 lines of narrative prose.
5. Add cross-references throughout using `→ gsd2-guide:` notation (D070):
   - To reference pages: `../../cost-management/`, `../../token-optimization/`, `../../dynamic-model-routing/`, `../../configuration/`, `../../commands/prefs/`, `../../commands/export/`
   - To sibling solo-guide pages: `../why-gsd/`, `../context-engineering/`, `../daily-mix/`, `../building-rhythm/`
   - Minimum 5 cross-references
6. Run verification:
   - `wc -l src/content/docs/solo-guide/controlling-costs.mdx` → >100
   - `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/controlling-costs.mdx` → ≥5
   - `grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/controlling-costs.mdx` → >0
   - `npm run build 2>&1 | grep "pages"` → 113 pages
   - `npm run check-links` → exits 0
   - `grep "solo-guide" content/generated/page-source-map.json` → no output (exit 1)
   - `ls src/content/docs/solo-guide/*.mdx | wc -l` → 9

## Must-Haves

- [ ] Frontmatter title "Controlling Costs" and description preserved exactly
- [ ] All five R068 topics covered with substantive prose
- [ ] `---` horizontal rules between major sections (D072)
- [ ] ≥5 cross-references using `→ gsd2-guide:` notation (D070)
- [ ] Australian spelling present (behaviour, recognise, practise, etc.)
- [ ] Does NOT reproduce token-optimization.md tables — links instead
- [ ] Does NOT repeat Section 1's cost landscape — builds on it as the practical "how to"
- [ ] >100 lines total
- [ ] `npm run build` exits 0 at 113 pages
- [ ] `npm run check-links` exits 0
- [ ] No solo-guide entries in page-source-map.json

## Verification

- `wc -l src/content/docs/solo-guide/controlling-costs.mdx` → >100
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/controlling-costs.mdx` → ≥5
- `grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/controlling-costs.mdx` → >0
- `npm run build 2>&1 | grep "pages"` → 113 pages
- `npm run check-links` → exits 0
- `grep "solo-guide" content/generated/page-source-map.json` → exit 1 (no matches)
- `ls src/content/docs/solo-guide/*.mdx | wc -l` → 9

## Inputs

- T01 output: `src/content/docs/solo-guide/context-engineering.mdx` — read to understand Section 5's content and how Section 6 should reference it
- Current stub: `src/content/docs/solo-guide/controlling-costs.mdx` (8 lines — frontmatter + placeholder)
- Voice/structure reference: read `src/content/docs/solo-guide/why-gsd.mdx` (104 lines) for the cost landscape framing that Section 6 builds on. Also glance at `src/content/docs/solo-guide/brownfield.mdx` and `src/content/docs/solo-guide/daily-mix.mdx` for established voice.
- Content to NOT duplicate (read-only, for linking):
  - `src/content/docs/cost-management.md` — detailed cost tracking, budget ceiling enforcement modes, cost projections
  - `src/content/docs/token-optimization.md` — three token profiles with detailed tables, complexity routing, prompt compression
  - `src/content/docs/dynamic-model-routing.md` — tier models, escalation, cross-provider routing, cost table
  - `src/content/docs/commands/prefs.mdx` — `/gsd prefs` for setting token_profile
  - `src/content/docs/commands/export.mdx` — `/gsd export` for retrospective cost reports

## Expected Output

- `src/content/docs/solo-guide/controlling-costs.mdx` — ~100–130 lines of narrative prose covering all five R068 topics, with ≥5 cross-references, Australian spelling, `---` separators, and no reference-page duplication
- Build output: 113 pages, 0 build errors
- Link check: exits 0, all cross-references resolve
