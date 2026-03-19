# S06: Section 1 — Why GSD 2

**Goal:** Replace the stub at `src/content/docs/solo-guide/why-gsd.mdx` with substantive Section 1 content covering the context window ceiling, cost comparison, and technical director framing.
**Demo:** The page reads as a compelling entry point for a sceptical vibe coder. `npm run build` exits 0. The file has >100 lines of substantive content. Australian spelling throughout.

## Must-Haves

- Content covers all five topics: vibe coding ceiling, context engineering as the solution, cost comparison, technical director mindset, and what GSD 2 actually is
- External citations to The New Stack, SolveIt, and Shareuhack integrated inline per D071
- Cross-references to gsd2-guide pages (`../../slug/`) and solo-guide siblings (`../slug/`) per D070
- `---` separators between major sections per D072
- Australian spelling throughout (behaviour, recognise, organise, practise)
- No MDX curly-brace errors — any `{{variable}}` wrapped in backticks
- `npm run build` exits 0 with 113 pages
- File has >100 lines of substantive content (not stub text)

## Verification

- `npm run build 2>&1 | grep "pages"` → 113 pages, exit 0
- `wc -l src/content/docs/solo-guide/why-gsd.mdx` → >100 lines
- `npm run build 2>&1 | grep -A5 "solo-guide"` → no MDX parse errors (exit 1 from grep = healthy)
- `grep -i "behavior\|color\|recognize\|organize" src/content/docs/solo-guide/why-gsd.mdx` → no output (exit 1 = healthy)
- Cross-reference format spot check: `grep -c '../../' src/content/docs/solo-guide/why-gsd.mdx` → ≥3 (links to gsd2-guide pages)
- External citation spot check: `grep -c 'https://' src/content/docs/solo-guide/why-gsd.mdx` → ≥2 (New Stack + at least one other)

## Tasks

- [ ] **T01: Write Section 1 — Why GSD 2 content** `est:30m`
  - Why: This is the entire slice — replace the 7-line stub with the full Section 1 content. Single-file change with no dependencies beyond S01's scaffold.
  - Files: `src/content/docs/solo-guide/why-gsd.mdx`
  - Do: Overwrite the stub with substantive content following the five-section structure from research (vibe coding ceiling → context engineering → cost comparison → technical director mindset → what GSD 2 is). Follow `first-project.mdx` patterns: opening prose with no heading, `---` separators, `## Topic` headings, inline external citations, `→ gsd2-guide:` cross-reference notation. Use Australian spelling throughout. Include external citations to The New Stack, SolveIt, and Shareuhack. Cross-reference `../../getting-started/`, `../../auto-mode/`, `../../architecture/`, `../../configuration/`, `../../cost-management/` for gsd2-guide pages and `../first-project/`, `../daily-mix/`, `../controlling-costs/`, `../context-engineering/` for solo-guide siblings.
  - Verify: `npm run build` exits 0 with 113 pages; `wc -l` >100; Australian spelling grep returns nothing; build output has no MDX errors scoped to solo-guide
  - Done when: `why-gsd.mdx` has substantive content covering all five topics, build passes, and Australian spelling is clean

## Files Likely Touched

- `src/content/docs/solo-guide/why-gsd.mdx`
