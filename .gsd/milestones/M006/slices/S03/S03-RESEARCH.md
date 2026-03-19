# S03 — Research

**Date:** 2026-03-19

## Summary

Section 7 ("When Things Go Wrong") is a content authoring task replacing the 7-line stub in `when-things-go-wrong.mdx` with a practitioner-oriented failure guide. The gsd2-guide already has excellent technical reference material covering failure recovery — `recipes/error-recovery.mdx` (139 lines with a full Mermaid flowchart), `commands/doctor.mdx`, `commands/forensics.mdx`, `commands/skip.mdx`, `commands/undo.mdx`, `troubleshooting.md`, and `recipes/uat-failures.mdx`. Section 7's job is **not** to duplicate any of this. It's the companion guide: plain-English descriptions of common failure scenarios a solo builder will actually encounter, the mental model for recognising each one, and the 1-3 step recovery action — then a cross-reference to the deep-dive page.

The implementation is straightforward. All patterns are established by S02 (`daily-mix.mdx`): cross-reference notation (`→ gsd2-guide:`), link depth format (`../../commands/slug/` for command pages, `../../slug/` for root-level pages, `../slug/` for sibling pages), Australian spelling, companion-voice prose style. A single task rewrites the stub, then verification confirms build + link check pass.

## Recommendation

Single-task slice. Replace the stub content with the full Section 7 as one write operation, following the exact authoring pattern from S02. The content should cover 6-8 failure scenarios organised from most common to most obscure, each with: symptom recognition, what to do (1-3 steps), and a cross-reference to the relevant reference page. A summary table at the top provides quick lookup. No Mermaid diagram — the error-recovery recipe already has the definitive flowchart and Section 7 should link to it rather than duplicate.

## Implementation Landscape

### Key Files

- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — the only file being modified; currently a 7-line stub, will become ~150-200 lines of content
- `src/content/docs/recipes/error-recovery.mdx` — primary cross-reference target for the structured doctor → fix → heal → forensics recovery ladder; do NOT duplicate its Mermaid diagram
- `src/content/docs/commands/doctor.mdx` — cross-reference target for `/gsd doctor` deep-dive
- `src/content/docs/commands/forensics.mdx` — cross-reference target for `/gsd forensics` deep-dive
- `src/content/docs/commands/skip.mdx` — cross-reference target for skipping stuck units
- `src/content/docs/commands/undo.mdx` — cross-reference target for rolling back bad work
- `src/content/docs/commands/stop.mdx` — cross-reference target for stopping auto-mode
- `src/content/docs/commands/status.mdx` — cross-reference target for checking current state
- `src/content/docs/troubleshooting.md` — cross-reference target for the comprehensive troubleshooting index
- `src/content/docs/recipes/uat-failures.mdx` — cross-reference target for UAT failure handling
- `src/content/docs/auto-mode.md` — source of truth for stuck detection limits (3 dispatches per unit, 6 lifetime), timeout tiers (soft 20m, idle 10m, hard 30m), and v2.28 reliability safeguards

### Content Structure

The section should cover these failure scenarios, ordered from most common to least:

1. **Auto-mode stopped and nothing is happening** — Recognise silence + stale lock. Recovery: `/gsd doctor fix` then `/gsd auto`. Cross-ref: `../../recipes/error-recovery/`, `../../commands/doctor/`
2. **The same unit keeps running over and over** — Stuck loop. Recognise repeated dispatch. Recovery: check the expected artifact, write it manually if needed, `/gsd doctor fix`. Cross-ref: `../../troubleshooting/` (loops section), `../../commands/skip/`
3. **UAT failed and the slice is replanning** — Not really a failure — GSD handles this automatically. Recognise the replan cycle. Recovery: wait, or `/gsd steer` if the replan direction is wrong. Cross-ref: `../../recipes/uat-failures/`
4. **Costs spiking unexpectedly** — Recognise via dashboard or budget ceiling pause. Recovery: `/gsd stop`, check token profile, adjust budget ceiling. Cross-ref: `../../cost-management/`, `../../token-optimization/`
5. **Coming back after time away — where am I?** — Orientation problem, not a technical failure. Recovery: `/gsd status` then `/gsd next`. Cross-ref: `../../commands/status/`, `../../commands/next/`
6. **The agent wrote the wrong thing** — Bad output, not a crash. Recovery: `/gsd undo --force` then re-run, or `/gsd steer` mid-execution. Cross-ref: `../../commands/undo/`, `../../commands/steer/`
7. **Provider errors (rate limits, outages)** — Recognise the pause message. Recovery: usually automatic (v2.26 auto-resume); for auth errors, fix credentials. Cross-ref: `../../troubleshooting/` (provider errors section)
8. **Full state is corrupted — nothing works** — Nuclear option. Recovery: `/gsd doctor heal`, or manual state repair as last resort. Cross-ref: `../../recipes/error-recovery/`

### Cross-Reference Targets (verified to exist)

All of these files were confirmed present in `src/content/docs/`:

| Link | Format from solo-guide |
|------|----------------------|
| `/gsd doctor` command | `../../commands/doctor/` |
| `/gsd forensics` command | `../../commands/forensics/` |
| `/gsd skip` command | `../../commands/skip/` |
| `/gsd undo` command | `../../commands/undo/` |
| `/gsd stop` command | `../../commands/stop/` |
| `/gsd status` command | `../../commands/status/` |
| `/gsd steer` command | `../../commands/steer/` |
| `/gsd next` command | `../../commands/next/` |
| Error recovery recipe | `../../recipes/error-recovery/` |
| UAT failures recipe | `../../recipes/uat-failures/` |
| Troubleshooting page | `../../troubleshooting/` |
| Auto mode page | `../../auto-mode/` |
| Cost management page | `../../cost-management/` |
| Token optimisation page | `../../token-optimization/` |
| Section 6 (sibling) | `../controlling-costs/` |

### Build Order

One task: write the full content to `when-things-go-wrong.mdx`. No dependencies on other S03+ slices — only S01 (already complete, sidebar registered).

### Verification Approach

1. `npm run build 2>&1 | grep "pages"` — expect 113 pages (no new files added)
2. `npm run check-links` — exit 0, link count ≥12,288 (new cross-references from Section 7 add to total)
3. `wc -l src/content/docs/solo-guide/when-things-go-wrong.mdx` — expect 150+ lines (substantive, not stub)
4. `grep -c "../../commands/" src/content/docs/solo-guide/when-things-go-wrong.mdx` — expect ≥6 command cross-references
5. `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/when-things-go-wrong.mdx` — expect ≥8 cross-reference callouts
6. Build error grep: `npm run build 2>&1 | grep -A5 "solo-guide"` — expect no output (no MDX parse errors)

## Constraints

- **Companion voice, not reference voice** — Section 7 describes failure scenarios the way a colleague would over coffee. It does NOT reproduce the step-by-step procedural detail from `recipes/error-recovery.mdx` or `commands/doctor.mdx`. It links to them.
- **No Mermaid diagram** — the error-recovery recipe already has the definitive recovery flowchart. Duplicating it in Section 7 adds maintenance burden with no reader benefit. Link instead.
- **Australian spelling** — behaviour, recognise, organise, practise (verb), practice (noun), colour, defence
- **MDX curly-brace escaping** — if quoting GSD template syntax like `{{milestoneId}}`, wrap in backticks (see KNOWLEDGE.md)
- **Cross-reference format** — `→ gsd2-guide: [Page Title](../../path/)` per D070. Use `../../commands/slug/` for command pages, `../../slug/` for root pages, `../slug/` for sibling solo-guide pages.

## Common Pitfalls

- **Duplicating the error-recovery recipe** — Section 7 should provide the "when you see X, do Y" mental model. The recipe provides the detailed procedure. If the executor finds themselves writing step-by-step terminal examples with directory trees, they've gone too deep — link to the recipe instead.
- **Missing the orientation scenario** — "Where am I after time away?" is not a technical failure but it's one of the most common "things going wrong" for solo builders. It must be included even though it has no error message.
- **American spellings slipping in** — `recognize`, `organize`, `behavior` are the most common mistakes. The executor should grep for these after writing.
