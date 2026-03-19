# S02 ("Section 4 — The Daily Mix") — Research

**Date:** 2026-03-19

## Summary

Section 4 is the highest-value section in the solo guide — it answers the question a solo builder faces every time they sit down to work: "Should I just git-commit this, `/gsd quick` it, or start a full milestone?" The content is a practitioner decision framework with three main deliverables: (1) a decision table mapping change characteristics to the right GSD path, (2) plain-English explanations of what each path actually does, and (3) guidance on handling interruptions mid-flow (captures, steer, queue).

This is straightforward content authoring into an existing stub file using established patterns. The technology is known (MDX in Starlight), the cross-reference format is proven (S01 established it), and the source material exists across multiple gsd2-guide pages that document the individual commands. The work is a single file rewrite of `daily-mix.mdx` from stub to substantive content.

## Recommendation

Single-task execution: replace the stub content in `src/content/docs/solo-guide/daily-mix.mdx` with the full Section 4 content. The file already has correct frontmatter. Write the section as a practitioner's guide — not a command reference (those exist already), but a decision framework that links out to the reference pages for detail.

The decision table should use a standard Markdown table (not Mermaid, not a custom component) so it renders cleanly in Starlight and is "Apple Notes–friendly" per R072. Three columns minimum: what the change looks like, which path to use, and why.

Cross-references use `../../commands/quick/` format (two levels up from `solo-guide/daily-mix/` to `docs/`, then down to `commands/quick/`). Links to other solo-guide pages use `../slug/` format. Links to root-level docs (auto-mode, git-strategy, captures-triage) use `../../slug/`.

## Implementation Landscape

### Key Files

- `src/content/docs/solo-guide/daily-mix.mdx` — the only file to modify; currently a 7-line stub with valid frontmatter (`title: "The Daily Mix"`, `description: "Choosing between direct commits, quick tasks, and full milestones — every day."`)
- `src/content/docs/commands/quick.mdx` — primary cross-reference target; documents `/gsd quick` execution flow, no flags, plain description input
- `src/content/docs/commands/auto.mdx` — cross-reference target for `/gsd auto`; documents `--verbose` and `--debug` flags
- `src/content/docs/commands/capture.mdx` — cross-reference target for `/gsd capture`; fire-and-forget thought capture
- `src/content/docs/commands/steer.mdx` — cross-reference target for `/gsd steer`; hard-steer plan documents
- `src/content/docs/commands/queue.mdx` — cross-reference target for `/gsd queue`; milestone ordering
- `src/content/docs/commands/next.mdx` — cross-reference target for `/gsd next`; step-through mode
- `src/content/docs/auto-mode.md` — cross-reference target for auto-mode deep dive
- `src/content/docs/captures-triage.md` — cross-reference target for captures and triage
- `src/content/docs/git-strategy.md` — cross-reference target for git isolation modes
- `src/content/docs/recipes/small-change.mdx` — existing recipe for `/gsd quick` use case; cross-reference target
- `src/content/docs/recipes/fix-a-bug.mdx` — existing recipe for full milestone bug fix; cross-reference target

### Content Structure

The section should cover these topics in this order:

1. **The three paths** — direct git commit, `/gsd quick`, full milestone. Plain-English description of each with concrete examples of when you'd use them. Frame from the solo builder's perspective, not the command reference perspective.

2. **The decision table** — the centrepiece. A Markdown table with columns: "The change looks like…", "Use this", "Why". Rows cover the spectrum from trivial (typo fix → git commit) through bounded (add a button → `/gsd quick`) to complex (new feature area → full milestone). This must be accurate about what `/gsd quick` actually does — it has no flags, takes a plain-English description, creates a branch, dispatches to an agent, commits atomically, writes a summary to `.gsd/quick/N-slug/N-SUMMARY.md`, and updates STATE.md.

3. **What `/gsd quick` actually does** — a short plain-English walkthrough (not duplicating the command page, but giving the practitioner "here's what happens when you type it"). Link to → gsd2-guide: [/gsd quick](../../commands/quick/) and → gsd2-guide: [Recipe: Small Change](../../recipes/small-change/) for full detail.

4. **When quick isn't enough** — signals that you should have used a full milestone instead. The key heuristic: if you'd need to investigate before fixing, or the change touches multiple layers/concerns, use a milestone.

5. **Handling interruptions** — what to do when a new idea hits while auto-mode is running. Three tools: `/gsd capture` (save for later), `/gsd steer` (change direction now), `/gsd queue` (shape what comes next). Brief explanation of each with links out.

6. **The daily rhythm** — a short "typical day" narrative. Morning: check status. Pick up where you left off or start something new. Throughout the day: quick tasks for small things, captures for ideas, steer if direction changes. Evening: review what auto-mode built while you were on other things. Links to → Section 8 (../../building-rhythm/) for the full weekly cadence.

### Cross-Reference Links (Verified Targets)

All these pages exist and build correctly:

| Link target | From `daily-mix.mdx` path |
|---|---|
| `/gsd quick` command | `../../commands/quick/` |
| `/gsd auto` command | `../../commands/auto/` |
| `/gsd next` command | `../../commands/next/` |
| `/gsd capture` command | `../../commands/capture/` |
| `/gsd steer` command | `../../commands/steer/` |
| `/gsd queue` command | `../../commands/queue/` |
| `/gsd status` command | `../../commands/status/` |
| Auto Mode deep-dive | `../../auto-mode/` |
| Git Strategy | `../../git-strategy/` |
| Captures & Triage | `../../captures-triage/` |
| Recipe: Small Change | `../../recipes/small-change/` |
| Recipe: Fix a Bug | `../../recipes/fix-a-bug/` |
| Solo-guide Section 8 | `../building-rhythm/` |
| Solo-guide Section 2 | `../first-project/` |
| Solo-guide Section 7 | `../when-things-go-wrong/` |

### Build Order

1. Write the full `daily-mix.mdx` content (single file, single task)
2. Run `npm run build` — confirm 113 pages still (no page count change; the file already exists as a stub)
3. Run `npm run check-links` — this is the first time cross-references from solo-guide to other gsd2-guide pages are validated. This retires the "cross-reference format" risk from the milestone proof strategy.

### Verification Approach

| # | Check | Expected |
|---|-------|----------|
| 1 | `npm run build 2>&1 \| grep "pages"` | 113 pages (same as S01 — no new files, just content replacing a stub) |
| 2 | `npm run check-links` exits 0 | All cross-references from daily-mix.mdx to commands/, recipes/, and root-level pages resolve |
| 3 | `wc -l src/content/docs/solo-guide/daily-mix.mdx` | >100 lines (substantive, not a stub) |
| 4 | `grep -c "../../commands/" src/content/docs/solo-guide/daily-mix.mdx` | ≥4 (multiple command cross-references present) |
| 5 | Build error grep: `npm run build 2>&1 \| grep -A5 "solo-guide"` | No output (no MDX parse errors) |
| 6 | Australian spelling spot-check: `grep -i "behavior\|recognize\|organize" src/content/docs/solo-guide/daily-mix.mdx` | No output (American spellings absent) |

## Constraints

- **Australian spelling throughout** — behaviour, organisation, recognise, colour, practise (verb), practice (noun). Established in S01 stubs; must continue.
- **No MDX curly-brace gotchas** — Section 4 is unlikely to quote GSD template syntax (`{{variable}}`), but if it does, wrap in backticks per KNOWLEDGE.md.
- **Cross-reference format** — `../../commands/slug/` for command pages (two directories up from `solo-guide/daily-mix/`), `../../slug/` for root-level pages, `../slug/` for sibling solo-guide pages. Trailing slash required. Hash fragments after the slash: `../../auto-mode/#section`.
- **Companion voice, not reference voice** — this is a "when and how" guide, not "what". Don't duplicate what the command pages already explain. Link out with the `→ gsd2-guide:` notation per D070.
- **Decision table accuracy** — `/gsd quick` has no flags. It takes a plain-English description after `quick`. No `--flag` syntax. The command creates a branch, dispatches, commits atomically, writes a summary. This must be stated accurately.

## Common Pitfalls

- **Wrong link depth** — solo-guide pages are one level deeper than root-level pages (they're in `solo-guide/`), so links to `commands/quick` need `../../commands/quick/` not `../commands/quick/`. The recipes use `../../commands/` from `recipes/`, confirming the pattern.
- **Duplicating reference content** — the temptation is to explain everything `/gsd quick` does. Resist. Summarise the practitioner experience (what happens when you type it), then link out. The command page and recipe already exist with full detail.
- **Table rendering in Starlight** — Markdown tables work natively in Starlight MDX. No special component needed. But very wide tables may overflow on mobile. Keep the decision table to 3 columns with concise cell text.
