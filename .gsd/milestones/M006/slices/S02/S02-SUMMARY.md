---
id: S02
parent: M006
milestone: M006
provides:
  - Full Section 4 content in daily-mix.mdx — decision table, 6 subsections, validated cross-references
  - Cross-reference format risk retired (npm run check-links validates all daily-mix.mdx links)
requires:
  - slice: S01
    provides: Solo-guide sidebar group registered and navigable; daily-mix.mdx stub in place
affects:
  - S03–S08 (cross-reference pattern proven; link checker now validates full guide cross-refs)
key_files:
  - src/content/docs/solo-guide/daily-mix.mdx
key_decisions:
  - Used standard Markdown table (3 columns, 8 rows) — no custom components or Mermaid needed
  - Used "→ gsd2-guide:" prefix notation for cross-references per D070
  - Decision table has 8 rows (plan required ≥6) — extras added for exploratory work and infrastructure changes
patterns_established:
  - "→ gsd2-guide: [Page Title](../../path/)" — the cross-reference pattern all remaining sections should follow
  - Decision table format: "The change looks like… | Use this | Why" — spectrum from trivial to complex
  - Companion-voice prose that links to reference docs rather than duplicating them
  - `../../commands/slug/` for command pages, `../../slug/` for root pages, `../slug/` for sibling solo-guide pages
observability_surfaces:
  - npm run build 2>&1 | grep "pages" → 113 pages (stable file count)
  - npm run check-links → exit 0 at 12,288 links (cross-reference format risk retired)
  - grep -c "../../commands/" src/content/docs/solo-guide/daily-mix.mdx → 6
drill_down_paths:
  - .gsd/milestones/M006/slices/S02/tasks/T01-SUMMARY.md
duration: ~10m
verification_result: passed
completed_at: 2026-03-19
---

# S02: Section 4 — The Daily Mix

**Replaced the 7-line stub with 129 lines of full Section 4 decision-framework content; `npm run build` exits 0 at 113 pages and `npm run check-links` validates 12,288 internal links with 0 broken — retiring the cross-reference format risk from the milestone proof strategy.**

## What Happened

T01 was a single-task slice: rewrite `daily-mix.mdx` with the full Section 4 decision framework and prove that all cross-references resolve.

**Pre-flight:** The task added `## Observability / Diagnostics` to the slice plan and `## Observability Impact` to the task plan before beginning — housekeeping that future slices inherit.

**Verification of cross-reference targets:** Before writing, confirmed all target pages exist: `commands/quick.mdx`, `commands/capture.mdx`, `commands/steer.mdx`, `commands/queue.mdx`, `commands/status.mdx`, `commands/next.mdx`; root-level `auto-mode.md`, `git-strategy.md`, `captures-triage.md`; and sibling solo-guide `building-rhythm.mdx`.

**Content written:** Six sections in one pass:
1. **The three paths** — direct commit / `/gsd quick` / full milestone with concrete named examples for each
2. **The decision table** — 8-row Markdown table (3 columns) covering the full spectrum from "typo, version bump" to "infrastructure/deployment changes" plus exploratory work
3. **What `/gsd quick` actually does** — plain-English 5-step walkthrough (branch creation → agent dispatch → atomic commit → summary written to `.gsd/quick/N-slug/` → STATE.md updated)
4. **When quick isn't enough** — two key heuristics: investigate-before-fix signal; multiple-concerns signal; plus a bulleted list of practical indicators
5. **Handling interruptions** — three subsections: `/gsd capture` (save for later), `/gsd steer` (change direction now), `/gsd queue` (shape what comes next), each with an inline example and cross-reference
6. **The daily rhythm** — morning / during session / end of day / weekly narrative linking to Section 8

All links use the correct depth format established in D070: `../../commands/slug/` for command pages, `../../slug/` for root-level pages, `../slug/` for sibling solo-guide pages.

**Verification run:** `npm run build` — 113 pages, exit 0. `npm run check-links` — 12,288 internal links checked, 0 broken, exit 0. Spot-checks: 129 lines, 6 command cross-references, no American spellings, no build errors referencing solo-guide.

## Verification

All 6 slice verification checks passed:

| # | Command | Result | Verdict |
|---|---------|--------|---------|
| 1 | `npm run build 2>&1 \| grep "pages"` | 113 pages, exit 0 | ✅ |
| 2 | `npm run check-links` | 12,288 links, 0 broken, exit 0 | ✅ |
| 3 | `wc -l daily-mix.mdx` | 129 lines | ✅ (>100 required) |
| 4 | `grep -c "../../commands/" daily-mix.mdx` | 6 | ✅ (≥4 required) |
| 5 | Build errors grep for solo-guide | no output | ✅ |
| 6 | American spelling grep | no output | ✅ |

**Cross-reference format risk retired:** `npm run check-links` exit 0 on a file with 6 command cross-references, 2 root-level cross-references, 1 sibling cross-reference, and 3 additional root-level links confirms the Starlight relative link format is correct for all three link depths used in the solo-guide.

## Requirements Advanced

- **R070** — Cross-reference pattern proven at scale: `../../commands/slug/` + `../../slug/` + `../slug/` all validated by link checker. Pattern is ready for S03–S08 to follow.

## Requirements Validated

- **R062** — Section 4: The Daily Mix is complete. 129-line `daily-mix.mdx` with 8-row decision table, 6 subsections, 6 command cross-references, Australian spelling throughout. `npm run build` exits 0; `npm run check-links` exits 0.

## New Requirements Surfaced

- None.

## Requirements Invalidated or Re-scoped

- None.

## Deviations

Decision table has 8 rows instead of the plan's minimum of 6. Extra rows for "exploratory work" and "infrastructure or deployment changes" make the table more practically useful without changing the structure. The plan permitted ≥6 rows; 8 rows exceeds the bar.

## Known Limitations

- The `/gsd quick` walkthrough in Section 4 describes flags conceptually (no flags, plain description) but does not document `--research` or `--full` flags mentioned in R062's description — because S01 confirmed those flags are not yet in the actual `/gsd quick` command signature. The section accurately reflects current `/gsd quick` behaviour: no flags, plain-English description only. If flags are added to `/gsd quick` in future, this section needs a revision.
- Section 4 links to `../building-rhythm/` (Section 8) which is a stub. The link resolves correctly (the stub page exists from S01) but the target page is not yet substantive.

## Follow-ups

- S08 (Building a Rhythm) must make `building-rhythm.mdx` substantive — Section 4 now links to it directly.
- The "→ gsd2-guide:" prefix notation from D070 should be adopted consistently in all remaining sections (S03–S08). Consider a light editorial pass on the index page (from S01) if it uses different link notation.

## Files Created/Modified

- `src/content/docs/solo-guide/daily-mix.mdx` — 129 lines of full Section 4 content, replacing the 7-line stub from S01
- `.gsd/REQUIREMENTS.md` — R062 status → validated; R070 validation notes updated

## Forward Intelligence

### What the next slice should know
- The `../../commands/slug/` cross-reference format is proven and link-checker validated. All remaining sections should use this exact format for command links — no guessing needed.
- The `→ gsd2-guide: [Title](path/)` notation is established as D070. Use it in every section for internal cross-references.
- 113 pages is the stable build count. Any new `.mdx` files would increment this; the slice plans for S03–S08 assume no accidental file creation (stubs already exist from S01).
- `npm run check-links` is fast (~2s) and cheap — run it after every cross-reference addition, not just at the end.

### What's fragile
- `../building-rhythm/` in daily-mix.mdx — resolves to a stub from S01. If S08 renames or moves `building-rhythm.mdx`, this link will break.
- The decision table's row for `/gsd quick` with no flags will become inaccurate if flags are added to the command. Watch the command changelog.

### Authoritative diagnostics
- `npm run check-links` output — the definitive signal for cross-reference health. Trust the exit code.
- `npm run build 2>&1 | grep -iE "error|warn|fail" | grep "solo-guide"` — surfaces MDX parse errors specific to solo-guide files; should always return nothing.

### What assumptions changed
- Originally expected to document `/gsd quick` flags (--research, --full) based on R062 description. Actual command has no flags — description-only. Section 4 is accurate to the current CLI, not the planned-but-not-implemented CLI.
