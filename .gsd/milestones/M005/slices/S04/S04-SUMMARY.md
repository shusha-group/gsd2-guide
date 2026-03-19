---
id: S04
parent: M005
milestone: M005
provides:
  - "## Prompts Used sections in all 16 command MDX pages, each with alphabetically sorted bullet-list links to the prompt pages that command invokes"
requires:
  - slice: S02
    provides: "Confirmed prompt page URL slugs (/prompts/{slug}/) that command pages can safely link to"
affects:
  - S05
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
  - "D062: Description truncation — split on em-dash first, period-space second, 80-char hard cap; handles prompts without em-dash (rewrite-docs, run-uat)"
  - "D063: Insertion anchor — immediately before ## Related Commands; script SKIPs gracefully if anchor absent"
  - "One-shot script pattern — run then delete; idempotency guard prevents double-insertion if rerun"
patterns_established:
  - "Idempotency guard: script checks for existing '## Prompts Used' before modifying; safe to rerun"
  - "Prompt links use '../../prompts/{slug}/' (two levels up) because Starlight renders command pages as /commands/{slug}/index.html"
  - "Alphabetical sort of prompt links within each section for consistent, predictable ordering"
  - "Short link description derived from prompt description field — punchy phrase only, not full description"
observability_surfaces:
  - "grep -rl '## Prompts Used' src/content/docs/commands/*.mdx | wc -l → 16 confirms all sections present"
  - "grep -L '## Prompts Used' src/content/docs/commands/*.mdx → empty means no files are missing"
  - "grep -A 20 '## Prompts Used' src/content/docs/commands/auto.mdx — spot-check format and sort"
  - "npm run check-links → 0 broken links is the primary health signal for link correctness"
drill_down_paths:
  - .gsd/milestones/M005/slices/S04/tasks/T01-SUMMARY.md
duration: 8m
verification_result: passed
completed_at: "2026-03-19"
---

# S04: Command page backlinks

**All 16 command pages gained a `## Prompts Used` section with alphabetically sorted bullet-list links to their associated prompt pages; `npm run build` exits 0 at 104 pages and `npm run check-links` confirms 10,380 links with 0 broken.**

## What Happened

S04 was a single-task slice with a clear mechanical goal: wire up the reverse direction of the prompt↔command relationship that S01 established in `prompts.json` (`usedByCommands` array) and S02 confirmed with real URL slugs.

A one-shot Node.js ESM script (`scripts/add-prompt-backlinks.mjs`) was written and run:

1. Read `content/generated/prompts.json` and inverted the `usedByCommands` map to build a command→prompts lookup.
2. Loaded each prompt page's frontmatter `description` field and truncated it to a short link phrase (em-dash split → period split → 80-char cap).
3. For each of the 16 target command MDX files, located the `## Related Commands` anchor, prepended the new `## Prompts Used` section with properly formatted bullet links, and wrote the file back.

The script reported 16 modified files in ~8 minutes total. It was deleted after use per the plan. Build and link-check were run to confirm correctness.

The 16 commands affected span the full breadth of GSD: orchestration commands (`auto`, `gsd`), content-producing commands (`discuss`, `capture`, `triage`), management commands (`queue`, `hooks`, `config`, `knowledge`), health commands (`doctor`, `skill-health`), and specialist commands (`forensics`, `headless`, `migrate`, `quick`, `steer`).

Link counts per command reflect their roles: `auto` links to 12 prompts (the full pipeline orchestrator), `gsd` links to 10, while targeted commands like `discuss`, `headless`, `doctor`, and `migrate` each link to 1-2 prompts.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Section count | `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx \| wc -l` | **16** ✅ |
| No missing files | `grep -L "## Prompts Used" src/content/docs/commands/*.mdx` | **empty** ✅ |
| auto.mdx link count | `grep -c "../../prompts/" src/content/docs/commands/auto.mdx` | **12** ✅ |
| gsd.mdx link count | `grep -c "../../prompts/" src/content/docs/commands/gsd.mdx` | **10** ✅ |
| Build | `npm run build` | **0 errors, 104 pages** ✅ |
| Link check | `npm run check-links` | **10,380 links, 0 broken** ✅ |
| Script deleted | `ls scripts/add-prompt-backlinks.mjs` | **no such file** ✅ |

## Requirements Advanced

- R057 (prompt reference section) — Command pages now point back to prompt pages, completing the bidirectional link graph. The prompt→command direction was established in S03; command→prompt direction delivered here.

## Requirements Validated

None newly validated by this slice (R057–R060 validate at milestone completion, not per-slice).

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

The slice plan said "16 command pages" and the task summary and verification both confirm 16. The roadmap said "15" in one place and "16" in another (the plan's Must-Haves listed `migrate` as the 16th command not in the roadmap boundary map). Actual execution used 16 — consistent with the slice plan's Must-Haves and file list. No functional impact.

## Known Limitations

- The 17 other command pages (`cleanup`, `cli-flags`, `export`, `keyboard-shortcuts`, `keys`, `logs`, `mode`, `new-milestone`, `next`, `prefs`, `run-hook`, `skip`, `status`, `stop`, `undo`, `update`, `visualize`) have no `## Prompts Used` section because `prompts.json` has no `usedByCommands` entry pointing to them. This is accurate — those commands do not invoke a GSD prompt directly.
- Link descriptions are truncated phrases from the prompt description field. A reader needing the full description must follow the link to the prompt page.

## Follow-ups

None. S05 (Pipeline integration) is the remaining slice and does not depend on any S04 follow-ups.

## Files Created/Modified

- `src/content/docs/commands/auto.mdx` — Added `## Prompts Used` with 12 alphabetically sorted prompt links
- `src/content/docs/commands/gsd.mdx` — Added `## Prompts Used` with 10 prompt links
- `src/content/docs/commands/capture.mdx` — Added `## Prompts Used` (triage-captures)
- `src/content/docs/commands/config.mdx` — Added `## Prompts Used` (system)
- `src/content/docs/commands/discuss.mdx` — Added `## Prompts Used` (discuss)
- `src/content/docs/commands/doctor.mdx` — Added `## Prompts Used` (doctor-heal)
- `src/content/docs/commands/forensics.mdx` — Added `## Prompts Used` (forensics)
- `src/content/docs/commands/headless.mdx` — Added `## Prompts Used` (discuss-headless)
- `src/content/docs/commands/hooks.mdx` — Added `## Prompts Used` (execute-task)
- `src/content/docs/commands/knowledge.mdx` — Added `## Prompts Used` (system)
- `src/content/docs/commands/migrate.mdx` — Added `## Prompts Used` (review-migration)
- `src/content/docs/commands/queue.mdx` — Added `## Prompts Used` (queue)
- `src/content/docs/commands/quick.mdx` — Added `## Prompts Used` (quick-task)
- `src/content/docs/commands/skill-health.mdx` — Added `## Prompts Used` (heal-skill)
- `src/content/docs/commands/steer.mdx` — Added `## Prompts Used` (discuss)
- `src/content/docs/commands/triage.mdx` — Added `## Prompts Used` (triage-captures)
- `.gsd/DECISIONS.md` — Added D062 (description truncation) and D063 (insertion anchor)

## Forward Intelligence

### What the next slice should know
- The bidirectional link graph between prompts and commands is fully wired and verified. S05 (pipeline integration) can extend `manage-pages.mjs` with confidence that all cross-links resolve — no existing links will be broken by extending the pipeline.
- `page-source-map.json` already has 32 prompt entries from S02. S05 reads this for stale detection — the map is ready.
- The `## Prompts Used` section sits immediately before `## Related Commands` on all 16 command pages. If S05 generates command page previews or diffs, that ordering is stable and consistent.

### What's fragile
- Link descriptions are derived from the `description` field in `prompts.json` (which was extracted by S01). If a prompt's description changes significantly, the link description shown on the command page won't update automatically — there's no pipeline hook regenerating command pages when prompt metadata changes. This is acceptable given the static nature of the content, but worth noting if prompts.json descriptions are revised.

### Authoritative diagnostics
- `npm run check-links` with `grep -i broken` is the definitive signal for any cross-link regression. At 10,380 links checked and 0 broken, the baseline is clean.
- `grep -L "## Prompts Used" src/content/docs/commands/*.mdx` is the fastest audit command — an empty result means all 16 target files have the section.

### What assumptions changed
- The plan said the section would use `[slug](../../prompts/{slug}/)` format — this is exactly what was implemented. No format deviations.
- Description truncation was assumed to be simple but required a two-level fallback (em-dash → period) because some prompts had no em-dash in their description. The fallback was handled cleanly.
