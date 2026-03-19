---
estimated_steps: 5
estimated_files: 1
---

# T01: Write Section 8 content — weekly cadence, queue, retrospectives, evolution, graduation

**Slice:** S08 — Section 8 — Building a Rhythm
**Milestone:** M006

## Description

Replace the 8-line stub at `src/content/docs/solo-guide/building-rhythm.mdx` with substantive content (~120 lines) covering the five topics specified in R069: weekly cycle suggestion, `/gsd queue` usage, `/gsd export` retrospectives, evolving agent-instructions.md over time, and the graduation path from vibe coding through GSD 2 to custom multi-agent workflows.

This follows the established authoring patterns from sibling sections (controlling-costs.mdx at 114 lines, context-engineering.mdx at 128 lines). Use the same conventions: `---` separators between major sections (D072), `→ gsd2-guide:` cross-reference notation (D070), inline external citations (D071), Australian spelling throughout.

## Steps

1. Read `src/content/docs/solo-guide/building-rhythm.mdx` (the current 8-line stub) to confirm the frontmatter.
2. Write the full `building-rhythm.mdx` content with this structure:
   - **Opening paragraph** — frame the section: sustaining GSD 2 as a daily practice, the difference between using it once and building a rhythm.
   - **Section: A weekly shape** — Monday planning (review queue, start milestone or pick up next slice), daily execution (run auto mode, review summaries, steer), Friday retrospective (export, review decisions, maintain agent-instructions.md). Reference `/gsd status` and `/gsd queue`.
   - **Section: Using /gsd queue** — capture ideas mid-session, triage into the next milestone or discard. Cross-reference queue and capture command pages.
   - **Section: Retrospectives with /gsd export** — what the export contains, how to review it, what to carry forward. Cross-reference the export command page.
   - **Section: Evolving agent-instructions.md** — how the project constitution grows across milestones, what to add, what to prune, when to review. Cross-reference Section 5 (context-engineering) and the configuration page.
   - **Section: The graduation path** — vibe coding → GSD 2 → custom multi-agent workflows. Reference SolveIt's compounding insight (already cited in why-gsd.mdx, use same URL: `https://solve.it.com/`). Cite Daniel Priestley's 24 Assets framework — the idea that each milestone's decisions, instructions, and patterns compound into reusable assets. Reference the `/gsd knowledge` command.
   - **Closing line** — `*This is Section 8 of the GSD 2 Solo Guide.*`
3. Ensure all cross-references use the correct format:
   - Sibling solo-guide pages: `[Section N](../slug/)`
   - gsd2-guide pages: `→ gsd2-guide: [Page Title](../../commands/slug/)` or `→ gsd2-guide: [Page Title](../../slug/)`
   - External citations: inline Markdown links within prose sentences
4. Run `npm run build 2>&1 | grep "pages"` — expect 113 pages, exit 0.
5. Run `npm run check-links` — expect exit 0 with 0 broken links.

## Must-Haves

- [ ] File has >100 lines of substantive content
- [ ] All five R069 topics covered: weekly cycle, queue usage, export retrospectives, evolving agent-instructions.md, graduation path
- [ ] ≥5 cross-references using `→ gsd2-guide:` notation
- [ ] Daniel Priestley 24 Assets citation present (inline link)
- [ ] SolveIt reference present (inline link)
- [ ] Australian spelling throughout — no instances of organize, recognize, behavior, color
- [ ] `npm run build` exits 0 at 113 pages
- [ ] `npm run check-links` exits 0

## Verification

- `wc -l src/content/docs/solo-guide/building-rhythm.mdx` → >100
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/building-rhythm.mdx` → ≥5
- `grep -i "organize\|recognize\|behavior\|color[^:]" src/content/docs/solo-guide/building-rhythm.mdx` → no output
- `grep "Priestley\|24 Assets" src/content/docs/solo-guide/building-rhythm.mdx` → matches found
- `grep "SolveIt\|solve.it" src/content/docs/solo-guide/building-rhythm.mdx` → match found
- `npm run build 2>&1 | grep "pages"` → 113 pages
- `npm run check-links` → exit 0

## Inputs

- `src/content/docs/solo-guide/building-rhythm.mdx` — current 8-line stub with frontmatter: `title: "Building a Rhythm"`, `description: "Weekly cadence, retrospectives, and the graduation path."`
- Sibling section patterns from `controlling-costs.mdx` (114 lines) and `context-engineering.mdx` (128 lines) — use `---` separators between sections, `→ gsd2-guide:` notation, inline citations, closing `*This is Section N*` line
- SolveIt URL: `https://solve.it.com/` (same as used in `why-gsd.mdx` line 74)
- Cross-reference targets (all verified to exist in `dist/`):
  - `../../commands/queue/` — /gsd queue
  - `../../commands/export/` — /gsd export
  - `../../commands/capture/` — /gsd capture
  - `../../commands/status/` — /gsd status
  - `../../commands/quick/` — /gsd quick
  - `../../auto-mode/` — Auto mode
  - `../../commands/knowledge/` — /gsd knowledge
  - `../context-engineering/` — Section 5
  - `../daily-mix/` — Section 4
  - `../why-gsd/` — Section 1

## Observability Impact

This task writes a single static MDX file. There are no runtime services affected. Future agents can inspect the following signals:

- **Build pages count:** `npm run build 2>&1 | grep "pages"` — the page count must remain at 113; a different count indicates an MDX syntax error or a missing/extra page.
- **Link validity:** `npm run check-links` — any non-zero exit indicates a broken cross-reference introduced by this file. The tool prints the broken URL, the source file, and an HTTP status.
- **Australian spelling gate:** `grep -i "organize\|recognize\|behavior\|color[^:]" src/content/docs/solo-guide/building-rhythm.mdx` — non-empty output identifies a US-spelling violation with the line number.
- **Cross-reference count gate:** `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/building-rhythm.mdx` — a count below 5 means cross-reference density is insufficient.
- **Citation presence gate:** `grep "Priestley\|24 Assets" src/content/docs/solo-guide/building-rhythm.mdx` and `grep "SolveIt\|solve.it" src/content/docs/solo-guide/building-rhythm.mdx` — no output means a required citation is missing.

**Failure state:** MDX parse failures surface in `npm run build` stderr with file path and line number — fully inspectable without a running server. Link failures appear in `npm run check-links` stdout.

## Expected Output

- `src/content/docs/solo-guide/building-rhythm.mdx` — 100–140 lines of substantive content covering all five R069 topics with cross-references, external citations, and Australian spelling. Build and link check pass.
