# S08: Section 8 — Building a Rhythm

**Goal:** The full Solo Builder's Guide is complete and deployed — all 8 sections live with substantive content, sidebar navigable end-to-end, `npm run update` deploys successfully to GitHub Pages.
**Demo:** `building-rhythm.mdx` has >100 lines covering weekly cadence, `/gsd queue`, `/gsd export` retrospectives, evolving agent-instructions.md, and the graduation path. `npm run build` exits 0, `npm run check-links` exits 0, `npm run update` deploys to GitHub Pages.

## Must-Haves

- `building-rhythm.mdx` has substantive content (>100 lines) covering all five R069 topics: weekly cycle suggestion, `/gsd queue` usage, `/gsd export` retrospectives, evolving agent-instructions.md over time, graduation path
- ≥5 cross-references using `→ gsd2-guide:` notation (D070)
- External citation to Daniel Priestley's 24 Assets framework and brief SolveIt reference (D071)
- Australian spelling throughout (organise, recognise, behaviour, colour, practise)
- `npm run build` exits 0 (113 pages)
- `npm run check-links` exits 0 (0 broken links)
- All 9 solo-guide files have >100 lines (smallest file threshold)
- `npm run update` exits 0 and deploys to GitHub Pages
- `page-source-map.json` unchanged (D068 — solo-guide pages excluded from pipeline)

## Proof Level

- This slice proves: final-assembly
- Real runtime required: yes (build, link check, deploy)
- Human/UAT required: no

## Verification

- `wc -l src/content/docs/solo-guide/building-rhythm.mdx` → >100 lines
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/building-rhythm.mdx` → ≥5
- `grep -i "organize\|recognize\|behavior\|color[^:]" src/content/docs/solo-guide/building-rhythm.mdx` → no output (Australian spelling)
- `wc -l src/content/docs/solo-guide/*.mdx | sort -n | head -1` → smallest file >100 lines
- `npm run build 2>&1 | grep "pages"` → 113 pages
- `npm run check-links` → exit 0, 0 broken links
- `diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json` → empty (pipeline uncontaminated)
- `npm run update` → exit 0 (full pipeline including deploy)
- `npm run build 2>&1 | grep -i "error\|warn" | head -20` → no MDX parse errors (failure-path diagnostic — non-empty output requires investigation before proceeding)

## Observability / Diagnostics

This slice produces only static MDX content — there is no runtime service. The inspectable signals are:

- **Build output:** `npm run build 2>&1` — line count and page count visible; any broken import or MDX parse error surfaces here with a file/line reference.
- **Link checker output:** `npm run check-links` — lists every broken relative or absolute link with status code and source file. Failure state is machine-readable.
- **Line count surface:** `wc -l src/content/docs/solo-guide/building-rhythm.mdx` — a fast sanity check; values ≤100 indicate the stub was not replaced.
- **Spelling surface:** `grep -i "organize\|recognize\|behavior\|color[^:]" src/content/docs/solo-guide/building-rhythm.mdx` — non-empty output is a failure signal.
- **Cross-reference surface:** `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/building-rhythm.mdx` — count <5 is a failure signal.
- **Pipeline contamination surface:** `diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json` — any output means the extraction pipeline was accidentally modified.

**Failure visibility:** If `npm run build` exits non-zero, the full stderr will contain the offending file, line number, and error type. If `npm run check-links` exits non-zero, it prints each broken URL with its source location. Both are designed to be re-run interactively for diagnosis.

**Redaction:** No secrets or credentials are involved in this slice.

## Integration Closure

- Upstream surfaces consumed: All 8 section MDX files from S02–S07, sidebar registration from S01, cross-reference targets in `dist/`
- New wiring introduced in this slice: none — content only
- What remains before the milestone is truly usable end-to-end: nothing — this slice closes the milestone

## Tasks

- [x] **T01: Write Section 8 content — weekly cadence, queue, retrospectives, evolution, graduation** `est:25m`
  - Why: The stub file has 8 lines. R069 requires substantive content covering all five topics. This is the last section needed to complete the guide.
  - Files: `src/content/docs/solo-guide/building-rhythm.mdx`
  - Do: Replace the stub with ~120 lines covering: (1) weekly cycle — Monday planning, daily execution, Friday retrospective; (2) `/gsd queue` for capturing and triaging work; (3) `/gsd export` for retrospectives; (4) evolving agent-instructions.md across milestones; (5) graduation path from vibe coding → GSD 2 → custom multi-agent workflows. Use `→ gsd2-guide:` cross-reference notation (D070). Cite Daniel Priestley's 24 Assets and reference SolveIt briefly (D071). Australian spelling throughout. End with `*This is Section 8 of the GSD 2 Solo Guide.*` consistent with sibling sections. Use `---` separators between major sections per D072.
  - Verify: `wc -l` >100; `grep -c "→ gsd2-guide:"` ≥5; Australian spelling grep returns no US spellings; `npm run build` exits 0 at 113 pages; `npm run check-links` exits 0
  - Done when: File has >100 lines of substantive content, build passes, all links resolve

- [ ] **T02: Full milestone verification and deploy to GitHub Pages** `est:15m`
  - Why: S08 is the final integration slice. The milestone is not done until `npm run update` deploys successfully and all 9 solo-guide files are confirmed substantive.
  - Files: none modified — verification and deploy only
  - Do: (1) Verify all 9 solo-guide files have >100 lines each. (2) Verify `page-source-map.json` is unchanged. (3) Run `npm run update` which chains: npm update → extract → diff report → regenerate → manage commands → build → check-links. (4) Commit any pending changes. (5) Push to main. (6) Confirm the push succeeds.
  - Verify: `wc -l src/content/docs/solo-guide/*.mdx | sort -n | head -1` shows smallest >100; `npm run update` exits 0; git push exits 0
  - Done when: `npm run update` exits 0, changes pushed to main, all 9 files substantive

## Files Likely Touched

- `src/content/docs/solo-guide/building-rhythm.mdx`
