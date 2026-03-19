---
estimated_steps: 4
estimated_files: 1
---

# T01: Write Section 4 content and verify cross-references

**Slice:** S02 — Section 4 — The Daily Mix
**Milestone:** M006

## Description

Replace the 7-line stub in `daily-mix.mdx` with the full Section 4 content — the practitioner decision framework for choosing between direct git commits, `/gsd quick` tasks, and full milestones. This is the highest-value section in the solo guide: it answers the question a solo builder faces every session.

The content has 6 subsections in order:
1. **The three paths** — direct commit, `/gsd quick`, full milestone with concrete examples
2. **The decision table** — Markdown table with 3 columns ("The change looks like…", "Use this", "Why") and ≥6 rows covering the spectrum from trivial to complex
3. **What `/gsd quick` actually does** — plain-English walkthrough of the practitioner experience (not duplicating the command page). `/gsd quick` has NO flags — it takes a plain-English description after `quick`. It creates a branch, dispatches to an agent, commits atomically, writes a summary to `.gsd/quick/N-slug/N-SUMMARY.md`, and updates STATE.md.
4. **When quick isn't enough** — the key heuristic: if you'd investigate before fixing, or the change touches multiple layers/concerns, use a milestone
5. **Handling interruptions** — `/gsd capture` (save for later), `/gsd steer` (change direction now), `/gsd queue` (shape what comes next)
6. **The daily rhythm** — typical day narrative linking to Section 8 for the full weekly cadence

After writing, build and link-check to retire the "cross-reference format" risk from the milestone proof strategy.

**Voice:** Companion guide, not command reference. Summarise the practitioner experience, then link out with `→ gsd2-guide:` notation for detail. Don't duplicate what command pages already explain.

**Spelling:** Australian throughout — behaviour, organisation, recognise, colour, practise (verb), practice (noun), licence (noun).

## Steps

1. **Rewrite `daily-mix.mdx`** — keep the existing frontmatter (`title: "The Daily Mix"`, `description: "Choosing between direct commits, quick tasks, and full milestones — every day."`). Replace the stub body with the full 6-section content described above. Use standard Markdown headings (`##` for top sections, `###` for subsections). The decision table is a standard Markdown table — no Mermaid, no custom components. If any template variable syntax like `{{variable}}` appears, wrap it in backticks to avoid MDX JSX errors.

2. **Wire cross-references correctly** — use these exact link formats (verified from the existing codebase):
   - Command pages: `../../commands/quick/`, `../../commands/capture/`, `../../commands/steer/`, `../../commands/queue/`, `../../commands/status/`, `../../commands/next/`, `../../commands/auto/`
   - Root-level pages: `../../auto-mode/`, `../../git-strategy/`, `../../captures-triage/`
   - Recipe pages: `../../recipes/small-change/`, `../../recipes/fix-a-bug/`
   - Sibling solo-guide pages: `../building-rhythm/`, `../first-project/`, `../when-things-go-wrong/`
   - Use the `→ gsd2-guide:` prefix notation for hand-off links per D070, e.g. `→ gsd2-guide: [/gsd quick](../../commands/quick/)`

3. **Build and verify** — run `npm run build` and confirm 113 pages, no errors mentioning `solo-guide`. Run `npm run check-links` and confirm exit 0. This is the first link-check that validates cross-references from solo-guide to other gsd2-guide sections — it retires the cross-reference format risk.

4. **Spot-check quality** — confirm `wc -l` >100, `grep -c "../../commands/"` ≥4, and `grep -i "behavior\|recognize\|organize"` returns no output (no American spellings).

## Must-Haves

- [ ] Decision table with ≥6 rows mapping change characteristics to the three paths
- [ ] Plain-English `/gsd quick` walkthrough accurately describing: no flags, plain-English description, branch creation, atomic commit, summary file, STATE.md update
- [ ] "When quick isn't enough" heuristic section
- [ ] Interruption handling covering capture, steer, and queue with links
- [ ] Daily rhythm narrative linking to Section 8
- [ ] ≥4 cross-references to command pages using `../../commands/slug/` format
- [ ] Australian spelling throughout (no American spellings)
- [ ] `npm run build` exits 0 at 113 pages
- [ ] `npm run check-links` exits 0

## Verification

- `npm run build 2>&1 | grep "pages"` → 113 pages
- `npm run check-links` → exit 0
- `wc -l src/content/docs/solo-guide/daily-mix.mdx` → >100
- `grep -c "../../commands/" src/content/docs/solo-guide/daily-mix.mdx` → ≥4
- `npm run build 2>&1 | grep -A5 "solo-guide"` → no output
- `grep -i "behavior\|recognize\|organize" src/content/docs/solo-guide/daily-mix.mdx` → no output

## Observability Impact

**What changes:** `daily-mix.mdx` grows from 7 lines to >100 lines. No new build artifacts are created — the existing page is replaced in the static site output.

**How to inspect this task later:**
- `wc -l src/content/docs/solo-guide/daily-mix.mdx` — quick content volume check
- `grep -c "../../commands/" src/content/docs/solo-guide/daily-mix.mdx` — verifies cross-reference wiring
- `npm run build 2>&1 | grep "pages"` — confirms 113 pages (no files added or removed)
- `npm run check-links` — validates all links from this page resolve; exit 0 means cross-references are correct

**Failure state:**
- MDX JSX parse error (e.g., unescaped `{` or `<`) surfaces in build stderr with file path + line number
- Broken link surfaces in `check-links` output with source file and target href
- Wrong page count in build output indicates an accidental file creation or deletion

## Inputs

- `src/content/docs/solo-guide/daily-mix.mdx` — existing 7-line stub with valid frontmatter (from S01)
- Cross-reference targets all verified to exist: `commands/quick.mdx`, `commands/capture.mdx`, `commands/steer.mdx`, `commands/queue.mdx`, `commands/status.mdx`, `commands/next.mdx`, `commands/auto.mdx`, `auto-mode.md`, `git-strategy.md`, `captures-triage.md`, `recipes/small-change.mdx`, `recipes/fix-a-bug.mdx`

## Expected Output

- `src/content/docs/solo-guide/daily-mix.mdx` — full Section 4 content (>100 lines) with decision table, 6 subsections, and validated cross-references
