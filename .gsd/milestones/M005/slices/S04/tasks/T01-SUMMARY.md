---
id: T01
parent: S04
milestone: M005
provides:
  - "## Prompts Used sections in all 16 command MDX pages, each with alphabetically sorted prompt links"
key_files:
  - src/content/docs/commands/auto.mdx
  - src/content/docs/commands/gsd.mdx
  - src/content/docs/commands/capture.mdx
  - src/content/docs/commands/config.mdx
  - src/content/docs/commands/discuss.mdx
  - src/content/docs/commands/doctor.mdx
  - src/content/docs/commands/forensics.mdx
  - src/content/docs/commands/headless.mdx
  - src/content/docs/commands/hooks.mdx
  - src/content/docs/commands/knowledge.mdx
  - src/content/docs/commands/migrate.mdx
  - src/content/docs/commands/queue.mdx
  - src/content/docs/commands/quick.mdx
  - src/content/docs/commands/skill-health.mdx
  - src/content/docs/commands/steer.mdx
  - src/content/docs/commands/triage.mdx
key_decisions:
  - "Description truncation for prompt links: split on ' — ' (em-dash) first, then '. ', then truncate at 80 chars — chosen to match the format already used in the source prompts.json description fields"
  - "Script is a one-shot Node.js ESM file, run then deleted — not a permanent pipeline artifact"
patterns_established:
  - "Idempotency guard: script checks for existing '## Prompts Used' before modifying any file; safe to run again without double-inserting"
  - "Prompt links use '../../prompts/{slug}/' (two levels up) because Starlight renders command pages as /commands/{slug}/index.html"
observability_surfaces:
  - "grep -rl '## Prompts Used' src/content/docs/commands/*.mdx | wc -l → 16"
  - "grep -A 20 '## Prompts Used' src/content/docs/commands/auto.mdx — confirms format and sort order"
  - "grep -L '## Prompts Used' src/content/docs/commands/*.mdx → empty means all files have the section"
  - "npm run check-links → 0 broken links is the primary health signal for link correctness"
duration: 8m
verification_result: passed
completed_at: "2026-03-19"
blocker_discovered: false
---

# T01: Add "Prompts Used" sections to 16 command pages

**Added `## Prompts Used` sections with alphabetically sorted prompt backlinks to all 16 command MDX pages; build passes at 104 pages and link checker reports 0 broken links across 10,380 checked.**

## What Happened

Wrote a one-shot Node.js ESM script (`scripts/add-prompt-backlinks.mjs`) that:
1. Reads `content/generated/prompts.json` and builds a reverse map from command slug → sorted list of `{slug, name}` entries.
2. Loads each prompt page's frontmatter `description` field, truncating to a short phrase (splitting on ` — `, then `.`, then 80-char hard cap).
3. For each of the 16 target command files, finds the `## Related Commands` anchor, prepends the new `## Prompts Used` section with properly formatted bullet links, and writes the file back.

The script ran cleanly, reporting 16 modified files. The generation script was then deleted per the plan.

## Verification

- `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l` → **16** ✅
- `grep -c "../../prompts/" src/content/docs/commands/auto.mdx` → **12** ✅
- `grep -c "../../prompts/" src/content/docs/commands/gsd.mdx` → **10** ✅
- `npm run build` → **exits 0, 104 pages** ✅
- `npm run check-links` → **exits 0, 10,380 links checked, 0 broken** ✅
- Script deleted: `ls scripts/add-prompt-backlinks.mjs` → no such file ✅

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx \| wc -l` | 0 | ✅ pass | <1s |
| 2 | `grep -c "../../prompts/" src/content/docs/commands/auto.mdx` | 0 | ✅ pass | <1s |
| 3 | `grep -c "../../prompts/" src/content/docs/commands/gsd.mdx` | 0 | ✅ pass | <1s |
| 4 | `npm run build` | 0 | ✅ pass | 6.5s |
| 5 | `npm run check-links` | 0 | ✅ pass | 2.8s |

## Diagnostics

- **Section presence:** `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l` → 16
- **Missing section audit:** `grep -L "## Prompts Used" src/content/docs/commands/*.mdx` → empty (no files missing)
- **Format inspection:** `grep -A 20 "## Prompts Used" src/content/docs/commands/auto.mdx` shows alphabetically sorted links with correct `../../prompts/{slug}/` format
- **Broken link detection:** `npm run check-links` surfaces any broken `../../prompts/` paths with the exact URL

## Deviations

Pre-flight observability gaps were addressed before execution: added `## Observability / Diagnostics` section to `S04-PLAN.md` and `## Observability Impact` section to `T01-PLAN.md`, both required by the pre-flight checklist.

The description truncation logic encountered some descriptions without a leading em-dash (e.g. `rewrite-docs` → "Documentation refresh prompt", `run-uat` → "User acceptance testing prompt") — the fallback to period-split and 80-char truncation handled these gracefully. Resulting link descriptions are readable and concise.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/commands/auto.mdx` — Added `## Prompts Used` section with 12 prompt links
- `src/content/docs/commands/gsd.mdx` — Added `## Prompts Used` section with 10 prompt links
- `src/content/docs/commands/capture.mdx` — Added `## Prompts Used` section (triage-captures)
- `src/content/docs/commands/config.mdx` — Added `## Prompts Used` section (system)
- `src/content/docs/commands/discuss.mdx` — Added `## Prompts Used` section (discuss)
- `src/content/docs/commands/doctor.mdx` — Added `## Prompts Used` section (doctor-heal)
- `src/content/docs/commands/forensics.mdx` — Added `## Prompts Used` section (forensics)
- `src/content/docs/commands/headless.mdx` — Added `## Prompts Used` section (discuss-headless)
- `src/content/docs/commands/hooks.mdx` — Added `## Prompts Used` section (execute-task)
- `src/content/docs/commands/knowledge.mdx` — Added `## Prompts Used` section (system)
- `src/content/docs/commands/migrate.mdx` — Added `## Prompts Used` section (review-migration)
- `src/content/docs/commands/queue.mdx` — Added `## Prompts Used` section (queue)
- `src/content/docs/commands/quick.mdx` — Added `## Prompts Used` section (quick-task)
- `src/content/docs/commands/skill-health.mdx` — Added `## Prompts Used` section (heal-skill)
- `src/content/docs/commands/steer.mdx` — Added `## Prompts Used` section (discuss)
- `src/content/docs/commands/triage.mdx` — Added `## Prompts Used` section (triage-captures)
- `.gsd/milestones/M005/slices/S04/S04-PLAN.md` — Added `## Observability / Diagnostics` section (pre-flight fix)
- `.gsd/milestones/M005/slices/S04/tasks/T01-PLAN.md` — Added `## Observability Impact` section (pre-flight fix)
