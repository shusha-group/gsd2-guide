# S08 — Research

**Date:** 2026-03-19

## Summary

S08 has two jobs: (1) write the substantive content for `building-rhythm.mdx` (Section 8 — Building a Rhythm), and (2) prove the full guide works end-to-end by running `npm run build`, `npm run check-links`, and `npm run update` to deploy to GitHub Pages.

This is the lowest-risk slice in the milestone. The content follows the exact authoring patterns established by S02–S07 (frontmatter, `## ` headings, `→ gsd2-guide:` cross-reference notation, Australian spelling, `---` separators between major sections per D072). The deployment proof is a single command that's been run successfully in prior milestones.

The stub file already exists at `src/content/docs/solo-guide/building-rhythm.mdx` (8 lines) and the sidebar entry is registered. Two other sections already link to `../building-rhythm/` — those links will resolve once the stub has content.

## Recommendation

Single-task execution: write the `building-rhythm.mdx` content, then run build + check-links + update to deploy. No structural changes to any other file. The content should cover the five topics specified in R069: weekly cycle suggestion, `/gsd queue` usage, `/gsd export` retrospectives, evolving agent-instructions.md over time, and the graduation path.

## Implementation Landscape

### Key Files

- `src/content/docs/solo-guide/building-rhythm.mdx` — the only file being written; currently an 8-line stub
- `astro.config.mjs` — already has the sidebar entry; no changes needed
- `src/content/docs/solo-guide/index.mdx` — already has the LinkCard pointing to `../building-rhythm/`; no changes needed

### Content Structure (R069)

Based on the requirement and the patterns in sibling sections, the content should have ~5 sections:

1. **Weekly cycle suggestion** — Monday planning, daily execution, Friday retrospective rhythm. Reference `/gsd queue` for managing the week's work and `/gsd status` for orientation.
2. **Using /gsd queue** — how to capture ideas during the week and triage them into the next milestone. Cross-reference the queue command page and captures-triage.
3. **Retrospectives with /gsd export** — using `/gsd export` to review what was built, what decisions were made, and what to carry forward. Cross-reference the export command page.
4. **Evolving agent-instructions.md** — how the project constitution grows across milestones. Cross-reference Section 5 (context-engineering) and the agent-instructions format page.
5. **The graduation path** — vibe coding → GSD 2 → custom multi-agent workflows. The arc from conversational prompting through structured development to building your own agent orchestration. Reference SolveIt's compounding insight (already cited in why-gsd.mdx).

Target length: 100–140 lines (consistent with controlling-costs.mdx at 114 and context-engineering.mdx at 128).

### Cross-References Needed

All link targets confirmed to exist in `dist/`:

| Notation | Target | Verified |
|----------|--------|----------|
| `→ gsd2-guide: [/gsd queue](../../commands/queue/)` | `dist/commands/queue/index.html` | ✅ |
| `→ gsd2-guide: [/gsd export](../../commands/export/)` | `dist/commands/export/index.html` | ✅ |
| `→ gsd2-guide: [/gsd capture](../../commands/capture/)` | `dist/commands/capture/index.html` | ✅ |
| `→ gsd2-guide: [/gsd status](../../commands/status/)` | `dist/commands/status/index.html` | ✅ |
| `→ gsd2-guide: [/gsd quick](../../commands/quick/)` | `dist/commands/quick/index.html` | ✅ |
| `→ gsd2-guide: [Auto mode](../../auto-mode/)` | `dist/auto-mode/index.html` | ✅ |
| `→ gsd2-guide: [/gsd knowledge](../../commands/knowledge/)` | `dist/commands/knowledge/index.html` | ✅ |
| `[Section 5](../context-engineering/)` | sibling page | ✅ |
| `[Section 4](../daily-mix/)` | sibling page | ✅ |
| `[Section 1](../why-gsd/)` | sibling page | ✅ |

### External Citations

R069 notes reference to "SolveIt's compounding insight and Daniel Priestley's 24 Assets framework." SolveIt is already cited in `why-gsd.mdx` (line 74) — Section 8 can reference it briefly with the same URL. Daniel Priestley's "24 Assets" concept (building repeatable business assets) fits the graduation path narrative — the idea that each milestone's decisions, instructions, and patterns compound into a reusable asset. Use inline citation format per D071.

### Build Order

1. Write `building-rhythm.mdx` content (replace stub)
2. Run `npm run build` — expect 113 pages (no new pages, just stub replaced with content)
3. Run `npm run check-links` — expect 0 broken links
4. Run `npm run update` — deploys to GitHub Pages via git push to main

### Verification Approach

| Check | Command | Expected |
|-------|---------|----------|
| File has substantive content | `wc -l src/content/docs/solo-guide/building-rhythm.mdx` | >100 lines |
| Build passes | `npm run build 2>&1 \| grep "pages"` | 113 pages |
| Links pass | `npm run check-links` | exit 0, 0 broken |
| Australian spelling | `grep -i "organize\|recognize\|behavior\|color[^:]" src/content/docs/solo-guide/building-rhythm.mdx` | no output |
| All 9 solo-guide files substantive | `wc -l src/content/docs/solo-guide/*.mdx \| sort -n \| head -1` | >100 lines for smallest |
| Cross-refs present | `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/building-rhythm.mdx` | ≥5 |
| Deploy succeeds | `npm run update` | exit 0 |

### Conventions to Follow

- **Cross-reference notation:** `→ gsd2-guide: [Page Title](../../path/)` per D070
- **External citations:** Inline Markdown links within prose per D071
- **Headings:** `## ` sections, no `---` separators needed unless section groups warrant visual separation (controlling-costs.mdx doesn't use them)
- **Australian spelling:** organise, recognise, behaviour, colour, practise (verb)
- **MDX escaping:** Wrap any `{{variable}}` in backticks (per KNOWLEDGE.md)

## Constraints

- The file must NOT be added to `page-source-map.json` (D068) — it's hand-authored, not pipeline-generated
- Content should complement, not duplicate, the gsd2-guide command reference pages — use cross-references to hand off to the reference docs
- The `npm run update` command runs the full pipeline including npm package update and extraction; this is expected and safe for solo-guide pages since they're excluded from the pipeline
