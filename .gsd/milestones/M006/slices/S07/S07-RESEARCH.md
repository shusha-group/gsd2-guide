# S07: Sections 5 & 6 — Context Engineering + Costs — Research

**Date:** 2026-03-19

## Summary

S07 writes two MDX files: `context-engineering.mdx` (Section 5: What You Write vs What GSD Writes) and `controlling-costs.mdx` (Section 6: Controlling Costs). Both stubs exist with valid frontmatter from S01 and need substantive content replacing the placeholder text.

This is straightforward content authoring following established patterns from S02–S06. The six completed solo-guide sections demonstrate a consistent voice, structure, and cross-reference style. The gsd2-guide reference pages that these sections will link to (`cost-management.md`, `token-optimization.md`, `dynamic-model-routing.md`, `configuration.md`, `commands/knowledge.mdx`, `commands/prefs.mdx`, `commands/export.mdx`) all exist and have rich content to reference without duplicating.

No new technology, no risky integration, no ambiguous scope. Two files, known patterns, known cross-reference targets.

## Recommendation

Write both pages in a single task. Each page follows the established pattern: narrative prose with `---` separators between major sections, `→ gsd2-guide:` cross-reference callouts, Australian spelling, and inline external citations where applicable. The pages should be 100–150 lines each, matching the calibre of completed sections (daily-mix: 129, brownfield: 128, first-project: 148, why-gsd: 104).

**Section 5 (context-engineering.mdx)** covers four topics per R067:
1. `agent-instructions.md` as the project constitution — hard limits + pattern rules
2. `DECISIONS.md` as architectural memory — how it feeds into every session
3. `KNOWLEDGE.md` for domain terminology and gotchas — rules, patterns, lessons
4. Reading GSD's output — summaries, state, what to look for
5. Giving good discussion answers — specificity pays dividends

Section 3 (brownfield.mdx) already introduces agent-instructions.md in practical terms. Section 5 should deepen that without repeating the brownfield examples — focus on the ongoing maintenance and evolution of context files across milestones, not the initial setup.

**Section 6 (controlling-costs.mdx)** covers five topics per R068:
1. The flat-rate vs pay-per-use reality — Claude Max, API, platform subscriptions
2. Token profiles (budget/balanced/quality) — what each trades off, in plain English
3. Per-phase model routing — using cheaper models for mechanical work
4. Budget ceiling configuration — set it, enforce it, adjust it
5. Typical cost patterns — what a milestone actually costs, what drives spend up

Section 1 (why-gsd.mdx) already introduces the cost question. Section 6 should be the practical "how to" that Section 1's "here's the landscape" sets up — picking a profile, setting a ceiling, reading the cost breakdown.

Both sections reference each other and cross-reference existing gsd2-guide pages heavily. Neither should duplicate what the reference pages already explain — the guide is a phrasebook, not a dictionary (per M006-CONTEXT.md).

## Implementation Landscape

### Key Files

- `src/content/docs/solo-guide/context-engineering.mdx` — stub (8 lines). Replace with ~120–150 line narrative covering R067's five topics. Preserve existing frontmatter title and description.
- `src/content/docs/solo-guide/controlling-costs.mdx` — stub (8 lines). Replace with ~100–130 line narrative covering R068's five topics. Preserve existing frontmatter title and description.

### Reference Pages to Cross-Reference (read-only, do not modify)

- `src/content/docs/configuration.md` — agent-instructions.md format, preferences YAML, budget_ceiling, token_profile, models config
- `src/content/docs/cost-management.md` — cost tracking, budget ceiling enforcement modes, cost projections, budget pressure & model downgrading, tips
- `src/content/docs/token-optimization.md` — three token profiles (budget/balanced/quality) with tables, context compression, complexity routing, adaptive learning, prompt compression
- `src/content/docs/dynamic-model-routing.md` — tier models, escalation, cross-provider routing
- `src/content/docs/commands/knowledge.mdx` — `/gsd knowledge rule|pattern|lesson` reference
- `src/content/docs/commands/prefs.mdx` — `/gsd prefs` interactive wizard
- `src/content/docs/commands/export.mdx` — `/gsd export` for retrospective reports

### Sibling Solo-Guide Pages to Cross-Reference

- `why-gsd.mdx` — Section 1 already introduces context engineering concept and cost landscape; Section 5 and 6 deepen those topics
- `brownfield.mdx` — Section 3 already introduces agent-instructions.md and KNOWLEDGE.md in practical brownfield context; Section 5 deepens without repeating
- `daily-mix.mdx` — Section 4 references cost management obliquely; Section 6 is the full treatment
- `when-things-go-wrong.mdx` — Section 7 has "costs are spiking" scenario that links to Section 6
- `building-rhythm.mdx` — Section 8 will reference both sections (context evolution over time, cost cadence)
- `first-project.mdx` — Section 2 mentions configuration and discussion quality; Section 5 expands on discussion quality

### Cross-Reference Link Format

All cross-references follow two patterns:
- **To gsd2-guide reference pages:** `→ gsd2-guide: [Page Title](../../page-slug/)` — the `../../` goes up from the solo-guide page's directory
- **To sibling solo-guide pages:** `→ gsd2-guide: [Section N: Title](../sibling-slug/)` — single `../` for siblings

Hash fragments go after trailing slash: `../../token-optimization/#complexity-based-task-routing`

### Content Conventions (from completed sections)

- Frontmatter: `title` + `description` only (no extra fields)
- `---` horizontal rules between major sections (D072)
- Australian spelling: behaviour, practise (verb), practice (noun), recognise, organise, colour, licence (noun)
- External citations inline in prose sentences (D071): "as X advocates" / "[X documented this](url)"
- No MDX component imports needed — these sections are pure narrative prose
- Cross-reference callouts on their own line, starting with `→ gsd2-guide:`
- Opening paragraph establishes the section's purpose before any heading

### Build Order

1. Write `context-engineering.mdx` first — it's the meatier of the two and Section 6 may reference Section 5's discussion of what drives token usage
2. Write `controlling-costs.mdx` second — builds on the context engineering foundation
3. Run `npm run build` to verify both pages compile (should stay at 113 pages)
4. Run `npm run check-links` to verify all cross-references resolve

Both files can reasonably be written in a single task since they share no code dependencies and the build/check is a single verification step.

### Verification Approach

1. `ls src/content/docs/solo-guide/*.mdx | wc -l` → 9 (unchanged)
2. `wc -l src/content/docs/solo-guide/context-engineering.mdx` → >100 lines (substantive, not stub)
3. `wc -l src/content/docs/solo-guide/controlling-costs.mdx` → >100 lines (substantive, not stub)
4. `npm run build` exits 0 at 113 pages (no new pages, just content replacing stubs)
5. `npm run check-links` exits 0 (all cross-references valid)
6. `grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/context-engineering.mdx` → >0 (Australian spelling present)
7. `grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/controlling-costs.mdx` → >0 (Australian spelling present)
8. `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/context-engineering.mdx` → ≥5 (cross-references present)
9. `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/controlling-costs.mdx` → ≥5 (cross-references present)
10. No solo-guide entries in `page-source-map.json` — `grep "solo-guide" content/generated/page-source-map.json` returns nothing

## Constraints

- Must NOT duplicate reference page content — link to it instead. The guide is a phrasebook; the reference is the dictionary.
- Must preserve existing frontmatter titles exactly — the index.mdx `LinkCard` entries point to these titles.
- Must NOT add files to `page-source-map.json` or `.generated-manifest.json` (D068).
- MDX curly-brace escaping required if quoting template syntax like `{{milestoneId}}` — wrap in backticks (KNOWLEDGE.md entry).

## Common Pitfalls

- **Repeating brownfield content** — Section 3 already covers agent-instructions.md setup in detail with the invoice SaaS example. Section 5 should reference that and focus on ongoing maintenance, evolution across milestones, and what good context looks like — not re-explain the initial setup.
- **Duplicating reference page tables** — The token-optimization.md page has detailed tables for all three profiles. Section 6 should give the practitioner's framing ("when to use which") in prose, not reproduce the tables.
- **Missing Australian spelling** — Use `practise` (verb) vs `practice` (noun), `recognise`, `organise`, `behaviour`, `colour`. The completed sections establish this pattern.
- **Wrong cross-reference depth** — Links to reference pages use `../../page-slug/` (up two levels from the solo-guide subdirectory). Links to sibling solo-guide pages use `../page-slug/` (up one level). Getting these wrong fails the link checker.
