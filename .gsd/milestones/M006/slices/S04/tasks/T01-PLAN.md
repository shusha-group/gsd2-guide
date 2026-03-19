---
estimated_steps: 4
estimated_files: 1
---

# T01: Write the full Section 2 walkthrough with external citations

**Slice:** S04 — Section 2 — Your First Project
**Milestone:** M006

## Description

Replace the stub `first-project.mdx` with the complete "Your First Project" section — a narrative walkthrough of starting a new GSD 2 project from scratch. This is the longest and most citation-heavy section in the solo-guide. It covers five GSD lifecycle phases as an annotated companion narrative (not a command reference), with two external citations and ≥5 cross-references to existing gsd2-guide pages.

The writing patterns are established by two completed sections:
- `daily-mix.mdx` (129 lines) — shows cross-reference notation, section structure, prose voice
- `when-things-go-wrong.mdx` (183 lines) — shows quick-lookup tables, longer sections with `---` separators

**Relevant skills:** none needed (pure content authoring in MDX).

## Steps

1. **Read the two pattern files** for voice, structure, and cross-reference format:
   - `src/content/docs/solo-guide/daily-mix.mdx` — the primary pattern
   - `src/content/docs/solo-guide/when-things-go-wrong.mdx` — the secondary pattern
   Note the cross-reference format: `→ gsd2-guide: [Page Title](../../path/)` for gsd2-guide pages, `→ gsd2-guide: [Section Title](../slug/)` for solo-guide siblings.

2. **Write `src/content/docs/solo-guide/first-project.mdx`** with the following structure (target ~200–250 lines total):

   **Frontmatter** — keep the existing title and description:
   ```yaml
   ---
   title: "Your First Project"
   description: "A complete walkthrough from blank directory to working milestone."
   ---
   ```

   **Opening (2–3 paragraphs)** — frame why the first project matters. The moment you go from curious to committed. GSD asks for more upfront investment (discussion, requirements) but pays it back with structured execution. Mention that this section walks through each phase so you know what to expect.

   **Before you start** — what you need: `npm install -g gsd-pi`, an LLM provider key (Anthropic recommended), a project directory. Don't duplicate the getting-started page — link to it. Brief, 3–5 lines.
   - Cross-reference: `→ gsd2-guide: [Getting Started](../../getting-started/)`
   - Cross-reference: `→ gsd2-guide: [Configuration](../../configuration/)`

   **Phase 1: The discussion** — what happens when you run `/gsd` for the first time in a project. GSD enters a structured conversation. It asks about your vision, constraints, and technical choices. It writes three artifacts: REQUIREMENTS.md, CONTEXT.md, ROADMAP.md. The discussion isn't a chatbot — it has a protocol. Frame this as the highest-leverage moment: what you say here shapes everything downstream.

   This is where the **Addy Osmani citation** fits naturally. Osmani advocates starting with a spec before writing code — GSD automates exactly this pattern. The discussion phase IS the spec-writing step.
   - External link: `[Addy Osmani on spec-first AI coding](https://addyosmani.com/blog/ai-coding-workflow/)`
   - Cross-reference: `→ gsd2-guide: [Discussing a Milestone](../../user-guide/discussing-a-milestone/)`

   **Phase 2: Reading the roadmap** — what GSD produces after discussion. ROADMAP.md shows milestones broken into slices with risk ratings and dependencies. REQUIREMENTS.md lists the capability contract. CONTEXT.md captures the brief. Explain how to read the slice table (risk column, depends column, the "After this:" demo line). What to check before letting auto mode proceed: are the slices in the right order? Is the scope right? Is anything missing?
   - Cross-reference: `→ gsd2-guide: [Developing with GSD](../../user-guide/developing-with-gsd/)`

   **Phase 3: Auto mode — the first run** — what auto mode does (research → plan → execute → verify per slice). What you see in the terminal (phase transitions, dispatch logs, completion summaries). When to intervene (wrong direction → `/gsd steer`; capture a thought → `/gsd capture`) vs when to let it run (trust the loop if verification is passing). The experience of watching code materialise from your spec.

   This is where the **Esteban Torres citation** fits — a practitioner who went through this exact journey. Reference his first-person account of using GSD.
   - External link: `[Esteban Torres — A GSD System for Claude Code](https://estebantorr.es/blog/2026/2026-02-03-a-gsd-system-for-claude-code/)`
   - Cross-reference: `→ gsd2-guide: [Auto Mode](../../auto-mode/)`

   **Phase 4: Verification and completion** — how to know it worked. Each slice has UAT checks that auto mode runs automatically. At the end, the milestone validates against its success criteria. `/gsd status` shows the full picture. What the `.gsd/` directory looks like when a milestone is done (summaries for each slice and task, completed STATE.md).
   - Cross-reference: `→ gsd2-guide: [/gsd status](../../commands/status/)`
   - Cross-reference: `→ gsd2-guide: [Recipe: New Milestone](../../recipes/new-milestone/)`

   **What you've built (and what you haven't)** — frame what the first project taught you. You've learned the full lifecycle: discuss → research → plan → execute → verify. You've seen how GSD decomposes work. Now the question is: how do you use this every day? Forward-link to Section 4 (daily mix) for the ongoing workflow. Also link to Section 7 (when things go wrong) for when the first run doesn't go perfectly.
   - Cross-reference: `→ gsd2-guide: [Section 4: The Daily Mix](../daily-mix/)`
   - Cross-reference: `→ gsd2-guide: [Section 7: When Things Go Wrong](../when-things-go-wrong/)`

3. **Verify the build** — run `npm run build` and confirm 113 pages, no errors.

4. **Verify cross-references** — run `npm run check-links` and confirm exit 0.

## Must-Haves

- [ ] Frontmatter preserved from stub (same title and description)
- [ ] Five lifecycle phases covered as distinct sections (discussion, roadmap, auto mode, verification, completion)
- [ ] Addy Osmani citation with working external link to `https://addyosmani.com/blog/ai-coding-workflow/`
- [ ] Esteban Torres citation with working external link to `https://estebantorr.es/blog/2026/2026-02-03-a-gsd-system-for-claude-code/`
- [ ] ≥5 cross-references using `→ gsd2-guide:` notation
- [ ] Forward links to Section 4 (`../daily-mix/`) and Section 7 (`../when-things-go-wrong/`)
- [ ] Australian spelling throughout (behaviour, recognise, organisation, colour, practise verb / practice noun)
- [ ] No MDX curly-brace issues (wrap any `{{variable}}` syntax in backticks)
- [ ] `npm run build` exits 0 at 113 pages
- [ ] `npm run check-links` exits 0

## Verification

- `wc -l src/content/docs/solo-guide/first-project.mdx` — >100 lines (target 200–250)
- `npm run build 2>&1 | grep "pages"` — 113 pages
- `npm run build 2>&1 | grep -i "error"` — no errors
- `npm run check-links` — exits 0
- `grep -c "→ gsd2-guide" src/content/docs/solo-guide/first-project.mdx` — ≥5
- `grep -c "addyosmani.com\|estebantorr.es" src/content/docs/solo-guide/first-project.mdx` — ≥2

## Inputs

- `src/content/docs/solo-guide/first-project.mdx` — current stub (6 lines) to replace with full content
- `src/content/docs/solo-guide/daily-mix.mdx` — pattern file for voice, structure, cross-reference format (129 lines)
- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — pattern file for longer sections with `---` separators (183 lines)

## Expected Output

- `src/content/docs/solo-guide/first-project.mdx` — complete Section 2 (~200–250 lines) with all five lifecycle phases, two external citations, ≥5 cross-references, and Australian spelling
