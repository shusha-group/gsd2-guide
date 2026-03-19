---
id: S01
parent: M006
milestone: M006
provides:
  - src/content/docs/solo-guide/ directory with 9 MDX files (index + 8 section stubs)
  - "Solo Builder's Guide" sidebar group in astro.config.mjs with 9 entries
  - Build verified at 113 pages (104 + 9 new)
  - Pipeline uncontaminated (page-source-map.json and .generated-manifest.json unchanged)
requires: []
affects:
  - S02
  - S03
  - S04
  - S05
  - S06
  - S07
  - S08
key_files:
  - src/content/docs/solo-guide/index.mdx
  - src/content/docs/solo-guide/why-gsd.mdx
  - src/content/docs/solo-guide/first-project.mdx
  - src/content/docs/solo-guide/brownfield.mdx
  - src/content/docs/solo-guide/daily-mix.mdx
  - src/content/docs/solo-guide/context-engineering.mdx
  - src/content/docs/solo-guide/controlling-costs.mdx
  - src/content/docs/solo-guide/when-things-go-wrong.mdx
  - src/content/docs/solo-guide/building-rhythm.mdx
  - astro.config.mjs
key_decisions:
  - D067: Guide published as hand-authored MDX in existing Starlight site (not pipeline-generated, not separate site)
  - D068: Solo-guide pages intentionally excluded from page-source-map.json to prevent LLM regeneration pipeline overwriting them
patterns_established:
  - Solo-guide MDX files use .mdx extension with standard Starlight frontmatter (title + description only); no extra frontmatter fields needed
  - Index page imports CardGrid/LinkCard from @astrojs/starlight/components and uses relative ../slug/ links to all 8 sections
  - Sidebar groups for hand-authored guide sections use /solo-guide/slug/ link format (no /gsd2-guide/ prefix); Starlight base config handles the prefix automatically
  - Australian spelling used in stub text: behaviour, organisation, recognise — must continue in all S02–S08 content
observability_surfaces:
  - Build page count: npm run build 2>&1 | grep "pages" — 113 confirms all 9 pages rendered (should stay 113 through S02–S07 as stubs get content, rises to 113+ if new pages added)
  - Pipeline safety: diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json — empty diff is healthy; any diff means unexpected pipeline injection
  - File inventory: ls src/content/docs/solo-guide/*.mdx | wc -l — 9
  - Sidebar registration: grep -c "Solo Builder" astro.config.mjs — 1
  - MDX parse errors scoped to new pages: npm run build 2>&1 | grep -A5 "solo-guide" — any output here indicates a parse problem
drill_down_paths:
  - .gsd/milestones/M006/slices/S01/tasks/T01-SUMMARY.md
duration: ~10m (single task, no blockers)
verification_result: passed
completed_at: 2026-03-19
---

# S01: Guide Structure & Navigation

**A "Solo Builder's Guide" sidebar group with 9 navigable MDX pages is live in the gsd2-guide Starlight site; `npm run build` exits 0 at 113 pages and the update pipeline is unaffected.**

## What Happened

Single-task slice (T01). Created all 9 MDX files in `src/content/docs/solo-guide/` in one batch and registered the sidebar group in `astro.config.mjs`. No blockers, no iterations — executed cleanly on the first attempt.

The index page (`index.mdx`) is a substantive landing page using `CardGrid` and `LinkCard` components to link all 8 sections with meaningful descriptions. The 8 section stubs each have valid frontmatter and a placeholder paragraph establishing the section's intent in Australian spelling.

Sidebar registration used `/solo-guide/slug/` link format (no `/gsd2-guide/` prefix), matching Starlight's base-path convention established in earlier milestones. The group was inserted before the closing `],` of the sidebar array, after the existing "Guides" group.

Build completed in ~8 seconds at exactly 113 pages (104 existing + 9 new). All 6 verification checks — including the failure-path check — passed on the first run.

## Verification

All slice-level checks confirmed:

| # | Check | Result |
|---|-------|--------|
| 1 | `ls src/content/docs/solo-guide/*.mdx \| wc -l` | **9** ✅ |
| 2 | `npm run build 2>&1 \| grep "pages"` | **113 pages** ✅ |
| 3 | `diff` on page-source-map.json | **no diff** ✅ |
| 4 | `grep "solo-guide" .generated-manifest.json` | **no output (exit 1)** ✅ |
| 5 | `grep -c "Solo Builder" astro.config.mjs` | **1** ✅ |
| 6 | Build error grep scoped to solo-guide | **no output (exit 1)** ✅ |

## Requirements Advanced

- R061 — Landing page and sidebar navigation scaffolding is fully in place; all 9 pages build and are reachable from the sidebar. This requirement is now validated.

## Requirements Validated

- R061 — Validated. The "Solo Builder's Guide" sidebar group exists with an index/landing page and links to all 8 sections. Navigation works end-to-end: all pages are discoverable from the sidebar and build without errors.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

None. Task executed exactly as planned. The T01-PLAN observability additions (adding `## Observability / Diagnostics` to S01-PLAN and `## Observability Impact` to T01-PLAN) were noted as pre-flight preflight work in the task summary and are captured in the slice plan itself.

## Known Limitations

- All 8 section pages are stubs — each has only a placeholder paragraph. Substantive content is the job of S02–S08.
- The index `LinkCard` for Section 5 uses a working title ("What You Write vs What GSD Writes") that may need to align with whatever heading S07 establishes for `context-engineering.mdx`.
- No `check-links` run yet — that verification is first exercised in S02 when Section 4's cross-references are written (per the milestone proof strategy).

## Follow-ups

- S02 must write substantive content to `daily-mix.mdx` and run `npm run check-links` to prove cross-reference validity (first real link-check against solo-guide pages).
- S08 (final integration slice) must confirm `npm run update` → GitHub Pages deploy succeeds end-to-end.
- If the index `LinkCard` title for `context-engineering.mdx` ("What You Write vs What GSD Writes") doesn't match the H1 that S07 establishes, update the index to match.

## Files Created/Modified

- `src/content/docs/solo-guide/index.mdx` — new; landing page with CardGrid/LinkCard navigation to all 8 sections
- `src/content/docs/solo-guide/why-gsd.mdx` — new; Section 1 stub
- `src/content/docs/solo-guide/first-project.mdx` — new; Section 2 stub
- `src/content/docs/solo-guide/brownfield.mdx` — new; Section 3 stub (Australian: "behaviour")
- `src/content/docs/solo-guide/daily-mix.mdx` — new; Section 4 stub
- `src/content/docs/solo-guide/context-engineering.mdx` — new; Section 5 stub (Australian: "recognise")
- `src/content/docs/solo-guide/controlling-costs.mdx` — new; Section 6 stub
- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — new; Section 7 stub
- `src/content/docs/solo-guide/building-rhythm.mdx` — new; Section 8 stub (Australian: "organisation")
- `astro.config.mjs` — modified; added "Solo Builder's Guide" sidebar group with 9 entries before closing sidebar array `],`

## Forward Intelligence

### What the next slice should know

- **Sidebar link format is `/solo-guide/slug/`** — no `/gsd2-guide/` prefix. This is correct and intentional. Starlight's `base: '/gsd2-guide'` config handles the prefix at serve/deploy time.
- **Internal cross-references between solo-guide pages** use `../slug/` format (e.g. `../daily-mix/`), consistent with the Starlight link convention documented in KNOWLEDGE.md. The `../` goes up from the page's own directory slug.
- **Cross-references to other gsd2-guide sections** (commands, recipes, reference) also use `../slug/` — e.g. `../commands/quick/` links to the `/gsd quick` command page. Run `npm run check-links` after adding any cross-references in S02.
- **MDX template variable escaping** — if any section quotes GSD prompt syntax like `{{milestoneId}}`, wrap in backticks. Double curly braces cause JSX `ReferenceError` at build time (see KNOWLEDGE.md entry on MDX curly-brace escaping and D061).
- **Australian spelling is expected** — use `behaviour`, `organisation`, `recognise`, `colour`, `licence` (noun). The stubs establish this pattern; continue it in all substantive content.
- **Index page LinkCard for Section 5** currently uses the working title "What You Write vs What GSD Writes" pointing to `../context-engineering/`. S07 should use this as the H1 title or the index should be updated to match whatever title S07 establishes.

### What's fragile

- **Stub content is minimal** — each stub has ~3 lines. If `npm run build` is re-run and any stub is accidentally emptied (e.g. by a write tool overwriting with empty content), the build will still pass but Starlight may produce nearly empty pages. The page count (113) is the reliable health signal.
- **Sidebar array indentation** — the sidebar group was inserted with 8-space indent for the group object and 12-space for items entries. If `astro.config.mjs` is reformatted by Prettier, the manage-pages.mjs bracket-matching logic (D064) may need updating.

### Authoritative diagnostics

- **Build page count** (`npm run build 2>&1 | grep "pages"`) is the single most reliable signal — 113 means all 9 pages rendered without error.
- **Pipeline contamination** (`diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json`) — empty diff means solo-guide pages are safe from the LLM regeneration pipeline. Any diff here needs immediate investigation.
- **MDX parse errors** surface as `ReferenceError` or `SyntaxError` lines in `npm run build` stderr with the file path and line number — `grep -A5 "solo-guide"` on build output.

### What assumptions changed

- No assumptions changed. The structure matched the plan exactly: 9 files, 9 sidebar entries, 113 pages, clean pipeline state.
