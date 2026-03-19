---
estimated_steps: 4
estimated_files: 1
---

# T01: Write Section 1 — Why GSD 2 content

**Slice:** S06 — Section 1 — Why GSD 2
**Milestone:** M006

## Description

Replace the 7-line stub at `src/content/docs/solo-guide/why-gsd.mdx` with the full Section 1 content. This is the guide's opening argument — the page that earns trust from a sceptical vibe coder and convinces them that GSD 2 solves a real problem they've already experienced.

The content follows the exact patterns established by `first-project.mdx` (D071, D072): opening prose without a heading, `---` separators between major sections, `## Topic` headings, inline external citations in paragraph flow, and `→ gsd2-guide:` cross-reference notation on separate lines.

**Relevant skills:** none required (pure content authoring in MDX).

## Steps

1. **Read the exemplar** — read `src/content/docs/solo-guide/first-project.mdx` to internalise the tone, structure, cross-reference format, and external citation style. Note: opening paragraphs have no heading, just prose. Sections separated by `---`. Cross-references use `→ gsd2-guide: [Title](../../slug/)` on their own line with backslash line breaks between multiple links. External citations are inline in sentence flow (e.g. "as [X advocates](url)").

2. **Write the content** — overwrite `src/content/docs/solo-guide/why-gsd.mdx` with the full Section 1 content. Keep the existing frontmatter (`title` + `description` only). Structure the content in five sections:

   **Opening prose (no heading):** 2–3 paragraphs establishing the problem. The reader has used vibe coding tools, hit the ceiling, and is wondering what's next. Acknowledge what works about vibe coding (fast prototyping, low barrier) before explaining where it breaks down.

   **Section: The ceiling** (`## The ceiling`): What happens when a vibe-coded project grows past 10–15 components. The AI's context window fills up. It forgets earlier decisions. Sessions degrade — the AI contradicts itself, re-introduces bugs, or loses track of the architecture. Frame this as something the reader has already experienced, not a theoretical concern. Reference the [Shareuhack vibe coding guide](https://www.shareuhack.com/en/posts/vibe-coding-guide-2026) as an external source acknowledging these limitations.

   **Section: Context engineering** (`## Context engineering`): The solution isn't a better AI — it's better context management. Use the desk analogy: instead of accumulating everything in one growing conversation (cluttered desk), clear the desk and lay out exactly what's needed for each task (fresh context). GSD's model: each task gets a fresh context window loaded with only the relevant files, decisions, and prior summaries. This is what "context engineering" means in practice. Reference [The New Stack article](https://thenewstack.io/beating-the-rot-and-getting-stuff-done/) for the concept of context rot and how GSD addresses it.

   **Section: The cost question** (`## The cost question`): Honest comparison. Flat-rate platforms (Cursor, Replit, Lovable) give you a predictable monthly bill but hit usage limits and give you less control. Claude Code API is pay-per-use — you see exactly what you spend, you control which model runs which task, and there's no artificial session limit. Claude Max (flat-rate Claude subscription) is a middle ground. Frame structurally, not with specific dollar amounts that will date. The trade-off is control and transparency vs simplicity. Link to the controlling-costs section for the full breakdown.

   **Section: The technical director mindset** (`## The technical director mindset`): The mental model shift. You're not "prompting an AI" — you're directing a junior developer. You write the brief (requirements), set the constraints (architecture decisions), review the output (verification), and course-correct when the direction is wrong (steer). The AI writes code; you make decisions. This is the [SolveIt philosophy](https://solve.it.com/) — understanding what you're building matters more than the speed of generation. The quality of your brief determines the quality of the output.

   **Section: What GSD 2 actually is** (`## What GSD 2 actually is`): Brief positioning. GSD 2 is a context engineering layer on top of Claude Code. It's not a replacement for Claude Code — it's the process that makes Claude Code effective on projects larger than a weekend hack. It manages the `.gsd/` directory (requirements, roadmap, decisions, task summaries), orchestrates multi-step execution with verification, and maintains continuity across sessions. Cross-reference the architecture and getting-started pages. End with a clear call to action pointing to Section 2 (first project) or Section 3 (brownfield).

3. **Apply cross-references** — ensure these cross-references appear in the content at appropriate points:
   - To gsd2-guide pages (using `../../slug/` format):
     - `../../getting-started/` — in the "what GSD 2 is" section
     - `../../auto-mode/` — in the context engineering section (how fresh-context works)
     - `../../architecture/` — in the "what GSD 2 is" section
     - `../../cost-management/` — in the cost question section
     - `../../configuration/` — in the "what GSD 2 is" section (optional, if natural)
   - To solo-guide siblings (using `../slug/` format):
     - `../first-project/` — closing call to action
     - `../daily-mix/` — reference to the daily workflow
     - `../controlling-costs/` — from the cost section
     - `../context-engineering/` — from the context engineering section
   Use the `→ gsd2-guide:` notation on its own line, with backslash line breaks between multiple links.

4. **Verify** — run all verification checks:
   - `npm run build 2>&1 | grep "pages"` → 113 pages
   - `wc -l src/content/docs/solo-guide/why-gsd.mdx` → >100 lines
   - `npm run build 2>&1 | grep -A5 "solo-guide"` → no MDX parse errors (grep exit 1 = healthy)
   - `grep -i "behavior\|color\|recognize\|organize" src/content/docs/solo-guide/why-gsd.mdx` → no output (exit 1 = healthy)
   - `grep -c 'https://' src/content/docs/solo-guide/why-gsd.mdx` → ≥2 external citations
   - `grep -c '../../' src/content/docs/solo-guide/why-gsd.mdx` → ≥3 gsd2-guide cross-references

## Must-Haves

- [ ] Content covers all five topics: vibe coding ceiling, context engineering, cost comparison, technical director mindset, what GSD 2 is
- [ ] External citations to The New Stack (`https://thenewstack.io/beating-the-rot-and-getting-stuff-done/`), SolveIt (`https://solve.it.com/`), and Shareuhack (`https://www.shareuhack.com/en/posts/vibe-coding-guide-2026`) inline in prose per D071
- [ ] Cross-references to ≥3 gsd2-guide pages using `../../slug/` format per D070
- [ ] Cross-references to ≥2 solo-guide siblings using `../slug/` format
- [ ] `---` separators between major sections per D072
- [ ] Australian spelling throughout — no instances of behavior, color, recognize, organize
- [ ] No MDX curly-brace errors — any `{{variable}}` in backticks
- [ ] `npm run build` exits 0 with 113 pages
- [ ] File has >100 lines

## Verification

- `npm run build 2>&1 | grep "pages"` → should show 113 pages
- `wc -l src/content/docs/solo-guide/why-gsd.mdx` → >100
- `npm run build 2>&1 | grep -A5 "solo-guide"` → no output (exit 1 = no errors)
- `grep -i "behavior\|color\|recognize\|organize" src/content/docs/solo-guide/why-gsd.mdx` → no output (exit 1)
- `grep -c 'https://' src/content/docs/solo-guide/why-gsd.mdx` → ≥2
- `grep -c '../../' src/content/docs/solo-guide/why-gsd.mdx` → ≥3

## Inputs

- `src/content/docs/solo-guide/why-gsd.mdx` — current 7-line stub with valid frontmatter (title: "Why GSD 2", description about context window ceiling)
- `src/content/docs/solo-guide/first-project.mdx` — exemplar for tone, structure, cross-reference format, and external citation style (148 lines, established in S04)
- `src/content/docs/solo-guide/index.mdx` — read-only reference confirming Section 1 description: "The context window ceiling, what context engineering means, and why structure beats prompting."

### Content patterns to follow (from completed sections)

1. **Frontmatter**: `title` + `description` only (no extra fields)
2. **Opening**: 2–3 paragraphs of narrative prose establishing the section's purpose — no heading, just body text
3. **Section dividers**: `---` between major sections (D072)
4. **Headings**: `## Topic` style
5. **Cross-references to gsd2-guide**: `→ gsd2-guide: [Page Title](../../page-slug/)` on its own line with backslash line break if multiple (D070)
6. **Cross-references to other solo-guide sections**: `→ gsd2-guide: [Section N: Title](../slug/)`
7. **External citations**: inline Markdown links within paragraph sentences, introduced naturally ("as X advocates", "X documented this") (D071)
8. **Australian spelling**: behaviour, colour, recognise, organise, practise (verb), practice (noun), licence (noun)
9. **MDX curly braces**: wrap any `{{variable}}` in backticks to avoid JSX parse errors

### External citations (confirmed live)

- The New Stack: `https://thenewstack.io/beating-the-rot-and-getting-stuff-done/`
- SolveIt / Jeremy Howard: `https://solve.it.com/`
- Shareuhack vibe coding guide: `https://www.shareuhack.com/en/posts/vibe-coding-guide-2026`

## Expected Output

- `src/content/docs/solo-guide/why-gsd.mdx` — substantive Section 1 content (~120–180 lines) covering all five topics with external citations, cross-references, Australian spelling, and `---` section separators. Build passes at 113 pages.

## Observability Impact

This task produces no runtime signals — it writes a static MDX content file. The observable outcomes are:

- **Build success:** `npm run build` exits 0 with exactly 113 pages. Failure shows as a non-zero exit and an Astro MDX parse error message.
- **Page rendering:** The `/solo-guide/why-gsd/` route is now substantive content rather than a stub. Inspectable in the built `dist/solo-guide/why-gsd/index.html`.
- **Content quality signals:** `wc -l` on the source file; `grep -c 'https://'` for external citations; `grep -c '../../'` for gsd2-guide links; American-spelling grep returns exit 1 (no matches).
- **Future agent inspection:** Any agent reading this file can determine the content's structure from the `---` separators and `##` headings. No additional metadata is written to `.gsd/` by this task beyond the T01-SUMMARY.md.
