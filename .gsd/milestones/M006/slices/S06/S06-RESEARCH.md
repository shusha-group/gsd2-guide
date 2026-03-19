# S06 — Research

**Date:** 2026-03-19

## Summary

S06 is a straightforward content authoring slice: replace the stub at `src/content/docs/solo-guide/why-gsd.mdx` with substantive Section 1 content. Five prior sections (S02–S05) have established the patterns — tone, cross-reference format, phase separator convention, external citation style, and Australian spelling. The only novel aspects are the specific content topics (context window ceiling, cost comparison, technical director framing) and the external citations (The New Stack, SolveIt) that haven't been used in prior sections.

This is light research. The file to change is known, the patterns are proven, the content requirements are well-defined in R066, and the verification approach is identical to S02–S05 (`npm run build` exits 0, file has >100 lines of substantive content).

## Recommendation

Single-task execution: overwrite the stub in `why-gsd.mdx` with the full Section 1 content, following the exact patterns established by `first-project.mdx` (D071, D072). Build and verify.

Content structure should follow the roadmap and R066 description:

1. **The vibe coding ceiling** — what works at 5–10 components fails at 15–20+. Context window fills up, AI forgets decisions, sessions degrade. Frame this as a recognisable experience for the target reader.
2. **Context engineering as the solution** — the desk analogy (clearing and re-laying context for each session vs accumulating a single growing conversation). GSD's fresh-context-per-task model vs single-session degradation.
3. **Cost comparison** — Claude Code API (pay for what you use) vs flat-rate platforms (Cursor, Replit, Lovable). Frame honestly: API costs more per session but gives full control; flat-rate is simpler but hits usage limits.
4. **The technical director mindset** — the mental model shift from "prompting an AI" to "directing a junior developer." You write the brief, set the constraints, review the output. The AI writes the code.
5. **What GSD 2 actually is** — brief positioning (context engineering layer on top of Claude Code, not a replacement) with cross-references to gsd2-guide architecture and getting started pages.

External citations for this section:
- The New Stack article: `https://thenewstack.io/beating-the-rot-and-getting-stuff-done/` (confirmed live)
- SolveIt / Jeremy Howard: `https://solve.it.com/` (confirmed live) — philosophy of small steps and understanding over vibe coding
- Shareuhack vibe coding guide: `https://www.shareuhack.com/en/posts/vibe-coding-guide-2026` (confirmed live, resolves the open question from M006-CONTEXT.md)
- Addy Osmani and Esteban Torres already cited in S04 (`first-project.mdx`); can be referenced again if relevant but not required

## Implementation Landscape

### Key Files

- `src/content/docs/solo-guide/why-gsd.mdx` — the only file to modify; currently a 7-line stub with valid frontmatter
- `src/content/docs/solo-guide/first-project.mdx` (148 lines) — the template to follow for tone, cross-reference format (`→ gsd2-guide:` notation), external citation format (inline links in sentence context per D071), and phase separator pattern (`---` between major sections per D072)
- `src/content/docs/solo-guide/index.mdx` — read-only; confirms the Section 1 LinkCard description: "The context window ceiling, what context engineering means, and why structure beats prompting."
- `astro.config.mjs` — read-only; sidebar entry already exists from S01

### Content Patterns to Follow (from completed sections)

1. **Frontmatter**: `title` + `description` only (no extra fields)
2. **Opening**: 2–3 paragraphs of narrative prose establishing the section's purpose — no heading, just body text
3. **Section dividers**: `---` between major sections (D072)
4. **Headings**: `## Phase N:` or `## Topic` style
5. **Cross-references to gsd2-guide**: `→ gsd2-guide: [Page Title](../../page-slug/)` on its own line with backslash line break if multiple (D070)
6. **Cross-references to other solo-guide sections**: `→ gsd2-guide: [Section N: Title](../slug/)`
7. **External citations**: inline Markdown links within paragraph sentences, introduced naturally ("as X advocates", "X documented this") (D071)
8. **Australian spelling**: behaviour, colour, recognise, organise, practise (verb), practice (noun), licence (noun)
9. **Tables**: standard Markdown pipe tables, no HTML
10. **MDX curly braces**: wrap `{{variable}}` in backticks to avoid JSX parse errors (KNOWLEDGE.md)

### Cross-references Needed

To other gsd2-guide pages (using `../../slug/` format):
- `../../getting-started/` — setup entry point
- `../../auto-mode/` — how the fresh-context-per-task model works
- `../../architecture/` — system structure overview
- `../../configuration/` — setting up provider keys and preferences
- `../../cost-management/` — detailed cost tracking reference

To other solo-guide sections (using `../slug/` format):
- `../first-project/` — "ready to try it? Start here"
- `../daily-mix/` — daily workflow
- `../controlling-costs/` — detailed cost management
- `../context-engineering/` — the files you write

### Build Order

Single task — write the content and verify. No dependencies beyond S01 (already complete). No multi-file coordination.

### Verification Approach

1. `npm run build 2>&1 | grep "pages"` — should remain 113 pages
2. `wc -l src/content/docs/solo-guide/why-gsd.mdx` — should be >100 lines (substantive content)
3. `npm run build 2>&1 | grep -A5 "solo-guide"` — no MDX parse errors (exit 1 = healthy)
4. Australian spelling spot-check: `grep -i "behavior\|color\|recognize\|organize" src/content/docs/solo-guide/why-gsd.mdx` — should return nothing (exit 1)

## Constraints

- Australian spelling throughout — use `behaviour`, `colour`, `recognise`, `organise`, `practise` (verb), `practice` (noun), `licence` (noun)
- No MDX curly braces outside backticks — any `{{variable}}` must be in code spans
- Cross-reference links use `../../slug/` for gsd2-guide pages, `../slug/` for solo-guide siblings
- Hash fragments after trailing slash: `../../page/#section` not `../../page#section`
- External citation style is inline in prose sentences (D071), not blockquotes or footnotes
- Content must not duplicate the reference documentation — it explains *why* and *when*, linking to gsd2-guide for *what* and *how*

## Common Pitfalls

- **Over-duplicating gsd2-guide content** — Section 1 should explain the *problem* (vibe coding ceiling) and the *mental model* (technical director), not restate how auto mode works or how cost tracking is configured. Link to those pages instead.
- **Cost comparison becoming stale** — any specific dollar amounts will date quickly. Frame the comparison structurally (pay-per-use vs flat-rate, control vs convenience) rather than quoting specific subscription prices.

## Sources

- The New Stack GSD walkthrough confirmed live (source: [Beating context rot in Claude Code with GSD](https://thenewstack.io/beating-the-rot-and-getting-stuff-done/))
- SolveIt platform and philosophy confirmed live (source: [Solve It With Code](https://solve.it.com/))
- Shareuhack vibe coding guide confirmed live, resolving the open question in M006-CONTEXT.md (source: [The Complete Vibe Coding Guide 2026](https://www.shareuhack.com/en/posts/vibe-coding-guide-2026))
- Addy Osmani AI coding workflow article previously cited in S04 (source: [AI coding workflow](https://addyosmani.com/blog/ai-coding-workflow/))
- Esteban Torres GSD account previously cited in S04 (source: [A GSD system for Claude Code](https://estebantorr.es/blog/2026/2026-02-03-a-gsd-system-for-claude-code/))
