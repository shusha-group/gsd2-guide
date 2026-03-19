# S07: Sections 5 & 6 — Context Engineering + Costs

**Goal:** Both `context-engineering.mdx` (Section 5) and `controlling-costs.mdx` (Section 6) contain substantive narrative content covering R067 and R068 respectively, with cross-references to gsd2-guide reference pages and sibling solo-guide sections.
**Demo:** `npm run build` exits 0 at 113 pages; `npm run check-links` exits 0; both files are >100 lines with Australian spelling and ≥5 cross-references each.

## Must-Haves

- `context-engineering.mdx` covers all five R067 topics: agent-instructions.md as project constitution, DECISIONS.md as architectural memory, KNOWLEDGE.md for domain terminology, reading GSD's output, and giving good discussion answers
- `controlling-costs.mdx` covers all five R068 topics: flat-rate vs pay-per-use reality, token profiles in plain English, per-phase model routing, budget ceiling configuration, and typical cost patterns
- Neither page duplicates reference page content — links to it instead (phrasebook, not dictionary)
- Existing frontmatter titles preserved exactly (index.mdx LinkCards depend on them)
- Australian spelling throughout (behaviour, practise/practice, recognise, organise, colour)
- Cross-references use correct depth: `../../page-slug/` for reference pages, `../page-slug/` for sibling solo-guide pages
- `→ gsd2-guide:` notation for all cross-reference callouts (D070)
- `---` horizontal rules between major sections (D072)
- `npm run build` exits 0 at 113 pages
- `npm run check-links` exits 0
- No solo-guide entries in `page-source-map.json` (D068)

## Verification

- `wc -l src/content/docs/solo-guide/context-engineering.mdx` → >100 lines
- `wc -l src/content/docs/solo-guide/controlling-costs.mdx` → >100 lines
- `npm run build 2>&1 | grep "pages"` → 113 pages
- `npm run check-links` exits 0
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/context-engineering.mdx` → ≥5
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/controlling-costs.mdx` → ≥5
- `grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/context-engineering.mdx` → >0
- `grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/controlling-costs.mdx` → >0
- `grep "solo-guide" content/generated/page-source-map.json` → no output (exit 1)
- `ls src/content/docs/solo-guide/*.mdx | wc -l` → 9 (unchanged)

## Tasks

- [x] **T01: Write Section 5 — context-engineering.mdx** `est:30m`
  - Why: R067 requires context engineering from the practitioner's perspective — the five topics that make up the highest-leverage skill in the GSD workflow. This is the meatier of the two pages.
  - Files: `src/content/docs/solo-guide/context-engineering.mdx`
  - Do: Replace the stub content with ~120–150 lines of narrative prose covering: (1) agent-instructions.md as the project constitution — hard limits + pattern rules, how it evolves across milestones (deepen brownfield.mdx's introduction without repeating it); (2) DECISIONS.md as architectural memory — how it feeds into every session; (3) KNOWLEDGE.md for domain terminology, rules, patterns, lessons; (4) reading GSD's output — summaries, state files, what to look for; (5) giving good discussion answers — specificity pays dividends. Preserve existing frontmatter title and description exactly. Use `---` separators between major sections. Australian spelling. Cross-references to reference pages with `../../page-slug/` and to siblings with `../page-slug/`. `→ gsd2-guide:` notation. No MDX component imports needed — pure narrative prose. Do not duplicate what reference pages already explain.
  - Verify: `wc -l` >100; `grep -c "→ gsd2-guide:"` ≥5; `grep -c "behaviour\|recognise\|organise\|practise\|colour"` >0
  - Done when: File has substantive content covering all five R067 topics with correct cross-references and Australian spelling

- [x] **T02: Write Section 6 — controlling-costs.mdx, build, and verify** `est:30m`
  - Why: R068 requires the practical cost management section. This task also runs the build and link-check verification for both S07 pages, since cross-references between Section 5 and Section 6 must both exist to resolve.
  - Files: `src/content/docs/solo-guide/controlling-costs.mdx`
  - Do: Replace the stub content with ~100–130 lines of narrative prose covering: (1) flat-rate vs pay-per-use reality — Claude Max, API, platform subscriptions; (2) token profiles (budget/balanced/quality) — what each trades off, in plain English, without reproducing the reference page tables; (3) per-phase model routing — using cheaper models for mechanical work; (4) budget ceiling configuration — set it, enforce it, adjust it; (5) typical cost patterns — what drives spend up, how context engineering from Section 5 affects costs. Preserve existing frontmatter title and description exactly. Same conventions as T01. Then run `npm run build` and `npm run check-links` to verify both pages compile and all cross-references resolve.
  - Verify: `wc -l` >100; `grep -c "→ gsd2-guide:"` ≥5; Australian spelling present; `npm run build` exits 0 at 113 pages; `npm run check-links` exits 0
  - Done when: Both Section 5 and Section 6 are live, all cross-references resolve, build and link-check pass

## Observability / Diagnostics

**Runtime signals:**
- `npm run build` exit code and page count are the primary signal — 0 / 113 pages means the MDX compiled cleanly
- `npm run check-links` exit code signals broken cross-references — non-zero means a `→ gsd2-guide:` link points to a slug that doesn't exist
- `wc -l` on each file confirms substantive content was written (>100 lines)
- `grep -c` counts confirm cross-reference and spelling conventions were applied

**Inspection surfaces:**
- Build output in stdout/stderr: Astro prints the failing file path and line number on MDX parse errors (unescaped `{`, bad JSX, etc.) — read stderr carefully on non-zero exit
- `page-source-map.json` at `content/generated/page-source-map.json` — grep for `solo-guide` entries to verify D068 (no solo-guide pages in the generated source map) is still satisfied
- `.gsd/milestones/M006/slices/S07/tasks/T01-SUMMARY.md` and `T02-SUMMARY.md` — verification evidence tables document actual check outcomes

**Failure visibility:**
- If `npm run build` fails with an MDX error, Astro prints the file, line, and column. The most common cause in MDX prose files is unescaped curly braces — wrap any template-variable-looking text in backticks.
- If `npm run check-links` fails, the output lists the failing URL slug — cross-reference the slug against the actual file paths in `src/content/docs/`
- If `wc -l` returns ≤100, the file contains only the stub — check that the write step completed and the frontmatter is intact

**Redaction constraints:** None — these files contain only public documentation prose with no secrets or PII.

**Failure-path verification check:**
- `npm run build 2>&1 | grep -i "error\|warn" | head -20` — surfaces MDX parse errors and broken imports in a single scannable list
- `npm run check-links 2>&1 | grep -v "^$" | head -30` — shows which slugs failed resolution so you can correlate against `src/content/docs/` paths
- `grep -n "[{}]" src/content/docs/solo-guide/controlling-costs.mdx` — detects unescaped curly braces that cause MDX parse failures
- `cat content/generated/page-source-map.json | python3 -m json.tool | grep solo-guide` — inspectable failure state: any match here means D068 is violated (solo-guide pages leaked into the generated source map)

## Files Likely Touched

- `src/content/docs/solo-guide/context-engineering.mdx`
- `src/content/docs/solo-guide/controlling-costs.mdx`
