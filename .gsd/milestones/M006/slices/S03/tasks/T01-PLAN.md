---
estimated_steps: 4
estimated_files: 1
---

# T01: Write Section 7 failure guide with recovery scenarios and cross-references

**Slice:** S03 — Section 7 — When Things Go Wrong
**Milestone:** M006

## Description

Replace the 7-line stub in `when-things-go-wrong.mdx` with the full Section 7 content. This section is the companion guide for failure recovery — it describes 8 common failure scenarios a solo builder will encounter, explains how to recognise each one, gives 1-3 concrete recovery steps, and links to the relevant reference documentation for the full procedure.

The authoring pattern is identical to S02/T01 (daily-mix.mdx): companion voice, "→ gsd2-guide:" cross-reference notation per D070, Australian spelling, and Starlight relative links. Study `daily-mix.mdx` for the exact style.

**Important:** This is NOT a reference page. Do not duplicate the step-by-step procedures from `recipes/error-recovery.mdx` or `commands/doctor.mdx`. Describe the mental model ("when you see X, do Y"), then link to the deep-dive. If you find yourself writing directory trees or multi-step terminal examples, you've gone too deep — link instead.

**Installed skill available:** `frontend-design` — not needed for this task (pure MDX content authoring).

## Steps

1. **Read the reference pages** to understand what's already documented (do NOT duplicate this content):
   - `src/content/docs/recipes/error-recovery.mdx` — the recovery ladder flowchart
   - `src/content/docs/auto-mode.md` — stuck detection limits (3 dispatches per unit, 6 lifetime), timeout tiers
   - `src/content/docs/solo-guide/daily-mix.mdx` — the style reference for this section

2. **Write the full content** to `src/content/docs/solo-guide/when-things-go-wrong.mdx`. Preserve the existing frontmatter (`title` and `description`). Structure:

   **Opening paragraph** — brief intro establishing the companion-guide framing: "things will go wrong, here's how to recognise and fix the common ones, with links to the full reference when you need the deep dive."

   **Quick-lookup summary table** — a Markdown table with columns: "What you're seeing" | "What's happening" | "What to do". One row per scenario (8 rows). Keep each cell to a short phrase.

   **8 failure scenario subsections** (use `###` headings), ordered from most common to least:

   a. **Auto-mode went quiet** — Symptom: no output, no progress. Cause: stale lock or crashed process. Recovery: `/gsd doctor fix` then `/gsd auto`. Cross-ref: `../../recipes/error-recovery/`, `../../commands/doctor/`

   b. **The same unit keeps failing** — Symptom: repeated dispatch logs for the same task. Cause: stuck loop (GSD's 3-dispatch limit per unit). Recovery: check what the task expects, write the artifact manually if needed, then `/gsd doctor fix`. If the task genuinely can't be completed, `/gsd skip`. Cross-ref: `../../troubleshooting/`, `../../commands/skip/`

   c. **UAT failed and the slice is replanning** — Symptom: status shows replan in progress. Framing: this is GSD working correctly, not a failure. Recovery: wait for the replan to complete; use `/gsd steer` only if the replan direction is wrong. Cross-ref: `../../recipes/uat-failures/`

   d. **Costs are spiking** — Symptom: budget ceiling pause or unexpected spend in dashboard. Recovery: `/gsd stop`, review token profile, adjust budget ceiling or model routing. Cross-ref: `../../cost-management/`, sibling `../controlling-costs/`

   e. **Coming back after time away — where am I?** — Symptom: you don't know what's running or what's next. Framing: this is an orientation problem, not a technical failure. Recovery: `/gsd status` to see current state, `/gsd next` for what to do next. Cross-ref: `../../commands/status/`, `../../commands/next/`

   f. **The agent wrote the wrong thing** — Symptom: output is technically valid but wrong approach/wrong scope. Recovery: `/gsd undo --force` to roll back, then re-run with a clearer brief; or `/gsd steer` if execution is still in progress. Cross-ref: `../../commands/undo/`, `../../commands/steer/`

   g. **Provider errors (rate limits, outages)** — Symptom: pause message with retry countdown or auth error. Recovery: usually automatic (auto-resume after cooldown); for auth errors, check credentials. Cross-ref: `../../troubleshooting/`

   h. **Full state corruption — nothing works** — Symptom: every command fails or produces nonsensical output. Recovery: `/gsd doctor heal` (repairs .gsd/ state); if even that fails, `/gsd forensics` then manual repair. Cross-ref: `../../recipes/error-recovery/`, `../../commands/forensics/`

   **Closing paragraph** — brief note linking to the full error-recovery recipe flowchart and the troubleshooting index. Frame it as: "for anything not covered here, start with the recovery ladder."

3. **Verify Australian spelling** — grep for `recognize`, `behavior`, `organize` and fix any occurrences. Use: `recognise`, `behaviour`, `organise`.

4. **Run verification suite** — execute all 7 verification commands from the slice plan.

## Must-Haves

- [ ] Frontmatter preserved (title: "When Things Go Wrong", description matches or improves the stub)
- [ ] 8 failure scenarios with symptom recognition, recovery steps, and cross-references
- [ ] Quick-lookup summary table at the top (8 rows)
- [ ] All cross-references use "→ gsd2-guide: [Title](path/)" notation per D070
- [ ] Australian spelling throughout — no American spellings
- [ ] No Mermaid diagram (link to `../../recipes/error-recovery/` instead)
- [ ] Companion voice — plain English descriptions, not reference-doc procedural steps
- [ ] 150+ lines of content

## Verification

- `npm run build 2>&1 | grep "pages"` → 113 pages, exit 0
- `npm run check-links` → exit 0
- `wc -l src/content/docs/solo-guide/when-things-go-wrong.mdx` → 150+ lines
- `grep -c "../../commands/" src/content/docs/solo-guide/when-things-go-wrong.mdx` → ≥6 command cross-references
- `grep -c "→ gsd2-guide:" src/content/docs/solo-guide/when-things-go-wrong.mdx` → ≥8 cross-reference callouts
- `npm run build 2>&1 | grep -A5 "solo-guide"` → no output (no MDX parse errors)
- `grep -iE "recognize|behavior|organize" src/content/docs/solo-guide/when-things-go-wrong.mdx` → no output (no American spellings)

## Inputs

- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — current 7-line stub from S01; preserve its frontmatter fields
- `src/content/docs/solo-guide/daily-mix.mdx` — style reference for companion voice, cross-reference notation, Australian spelling, and prose structure
- `src/content/docs/recipes/error-recovery.mdx` — primary cross-reference target; read for understanding but do NOT duplicate its flowchart or step-by-step procedure
- `src/content/docs/auto-mode.md` — source of truth for stuck detection limits and timeout tiers (reference for accuracy, do not reproduce verbatim)

## Expected Output

- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — 150-200 lines of substantive Section 7 content replacing the stub, with 8 failure scenarios, summary table, and ≥8 cross-references to reference documentation

### Cross-Reference Targets (all verified to exist)

| Target page | Link format from solo-guide |
|---|---|
| Error recovery recipe | `../../recipes/error-recovery/` |
| UAT failures recipe | `../../recipes/uat-failures/` |
| Troubleshooting index | `../../troubleshooting/` |
| Auto mode | `../../auto-mode/` |
| Cost management | `../../cost-management/` |
| `/gsd doctor` | `../../commands/doctor/` |
| `/gsd forensics` | `../../commands/forensics/` |
| `/gsd skip` | `../../commands/skip/` |
| `/gsd undo` | `../../commands/undo/` |
| `/gsd stop` | `../../commands/stop/` |
| `/gsd status` | `../../commands/status/` |
| `/gsd steer` | `../../commands/steer/` |
| `/gsd next` | `../../commands/next/` |
| Section 6 (sibling) | `../controlling-costs/` |
