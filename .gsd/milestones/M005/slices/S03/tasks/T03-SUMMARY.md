---
id: T03
parent: S03
milestone: M005
provides:
  - Fully authored MDX pages for all 13 command-group prompts (discuss, discuss-headless, doctor-heal, forensics, heal-skill, queue, quick-task, review-migration, rewrite-docs, run-uat, triage-captures, workflow-start, worktree-merge)
  - Complete S03 slice — all 32 prompt pages now have authored 4-section content
key_files:
  - src/content/docs/prompts/discuss.mdx
  - src/content/docs/prompts/discuss-headless.mdx
  - src/content/docs/prompts/doctor-heal.mdx
  - src/content/docs/prompts/forensics.mdx
  - src/content/docs/prompts/heal-skill.mdx
  - src/content/docs/prompts/queue.mdx
  - src/content/docs/prompts/quick-task.mdx
  - src/content/docs/prompts/review-migration.mdx
  - src/content/docs/prompts/rewrite-docs.mdx
  - src/content/docs/prompts/run-uat.mdx
  - src/content/docs/prompts/triage-captures.mdx
  - src/content/docs/prompts/workflow-start.mdx
  - src/content/docs/prompts/worktree-merge.mdx
key_decisions:
  - workflow-start and worktree-merge Used By sections explicitly note "Not directly invoked by a user-facing command — triggered internally by GSD workflows" rather than leaving the section empty
  - Template variable strings in MDX prose (e.g. "Milestone {{milestoneId}} ready.") must be wrapped in backticks to prevent MDX from interpreting double curly braces as JSX expressions
patterns_established:
  - Command prompt Mermaid diagrams use a 4-5 node LR flowchart: command invocation → prompt → agent-work → output (some prompts add a verdict/branch node)
  - Prompts dispatched by auto-mode (rewrite-docs, run-uat) use a dispatcher-oriented diagram showing where they sit in the auto-mode dispatch loop rather than a user-invocation pattern
observability_surfaces:
  - Build errors for MDX/Mermaid parse failures surface at npm run build stdout with file+line context
  - Broken cross-links caught by npm run check-links (10380 links checked, 0 broken)
  - Pages inspectable at /prompts/{slug}/ in the dev server (npm run dev)
duration: ~45 min
verification_result: passed
completed_at: 2026-03-19T14:54:28Z
blocker_discovered: false
---

# T03: Author command prompt pages (13 pages) and run final validation

**Wrote authored MDX content for all 13 command-group prompts and ran final validation — npm run build (104 pages, 0 errors) and npm run check-links (10380 links, 0 broken) both pass; S03 slice is complete.**

## What Happened

Read `content/generated/prompts.json` to extract all 13 entries with `group === "commands"`, then read each source prompt `.md` file from the gsd-pi extension directory to understand the behavioral contract before writing prose.

Wrote all 13 MDX files following the 4-section structure established in T01/T02: What It Does (2-3 paragraphs of behavioral prose derived from the source prompt), Pipeline Position (Mermaid LR flowchart showing command invocation → prompt → agent work → output), Variables (table from prompts.json), and Used By (links to command pages or internal-trigger note).

Two prompts (`workflow-start`, `worktree-merge`) have empty `usedByCommands` arrays. Their Used By sections explicitly state "Not directly invoked by a user-facing command — triggered internally by GSD workflows" rather than leaving a stub or empty section. Two prompts (`rewrite-docs`, `run-uat`) are dispatched by auto-mode rather than user commands, so their Pipeline Position diagrams show the auto-mode dispatcher context rather than a direct command invocation.

First build attempt failed with `ReferenceError: milestoneId is not defined` in `discuss-headless.mdx`. The cause was `{{milestoneId}}` in prose — MDX interprets `{expression}` as JSX, so `{{foo}}` becomes `{foo}` at first parse, which MDX then evaluates as an undefined variable. Fixed by wrapping template-variable literals in backtick code spans in three files (`discuss-headless.mdx`, `quick-task.mdx`, `worktree-merge.mdx`). Second build passed cleanly.

## Verification

All plan verification checks passed:

- `npm run build` → 104 pages, 0 errors
- `npm run check-links` → 10380 internal links checked, 0 broken
- `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## Pipeline Position" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## Variables" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep -l "## Used By" src/content/docs/prompts/*.mdx | wc -l` → 32
- `grep "Not directly invoked" src/content/docs/prompts/workflow-start.mdx` → matches
- `grep "Not directly invoked" src/content/docs/prompts/worktree-merge.mdx` → matches

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run build` | 0 | ✅ pass | 6.3s |
| 2 | `npm run check-links` | 0 | ✅ pass | 2.9s |
| 3 | `grep -l "## What It Does" src/content/docs/prompts/*.mdx \| wc -l` → 32 | 0 | ✅ pass | <1s |
| 4 | `grep -l "## Pipeline Position" src/content/docs/prompts/*.mdx \| wc -l` → 32 | 0 | ✅ pass | <1s |
| 5 | `grep -l "## Variables" src/content/docs/prompts/*.mdx \| wc -l` → 32 | 0 | ✅ pass | <1s |
| 6 | `grep -l "## Used By" src/content/docs/prompts/*.mdx \| wc -l` → 32 | 0 | ✅ pass | <1s |
| 7 | `grep "Not directly invoked" src/content/docs/prompts/workflow-start.mdx` | 0 | ✅ pass | <1s |
| 8 | `grep "Not directly invoked" src/content/docs/prompts/worktree-merge.mdx` | 0 | ✅ pass | <1s |

## Diagnostics

- Build errors for MDX parse failures appear in `npm run build` stdout with file+line context from the `.mjs` prerender chunk stack trace
- `npm run check-links` reports every broken internal link with source file + link text
- Pages inspectable at `/prompts/{slug}/` in the dev server (`npm run dev`)
- The MDX `{{variable}}` escaping issue produces a runtime `ReferenceError` at build time (not at parse time) — the symptom is "X is not defined" in a prerender `.mjs` chunk stack trace

## Deviations

One unplanned debugging step: first build failed due to `{{milestoneId}}` in `discuss-headless.mdx` prose being interpreted as a JSX expression. Fixed by wrapping template-variable literals in backticks in three files. The fix took one edit-rebuild cycle and is documented in `.gsd/KNOWLEDGE.md`.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/prompts/discuss.mdx` — interactive milestone planning prompt; 7 variables, used by gsd/discuss/steer commands
- `src/content/docs/prompts/discuss-headless.mdx` — headless milestone creation prompt; 7 variables, used by headless command
- `src/content/docs/prompts/doctor-heal.mdx` — workspace healing prompt; 4 variables, used by doctor command
- `src/content/docs/prompts/forensics.mdx` — forensic investigation prompt; 3 variables, used by forensics command
- `src/content/docs/prompts/heal-skill.mdx` — skill drift analysis prompt; 4 variables, used by skill-health command
- `src/content/docs/prompts/queue.mdx` — roadmap queuing prompt; 4 variables, used by queue command
- `src/content/docs/prompts/quick-task.mdx` — lightweight task execution prompt; 6 variables, used by quick command
- `src/content/docs/prompts/review-migration.mdx` — migration audit prompt; 3 variables, used by migrate command
- `src/content/docs/prompts/rewrite-docs.mdx` — documentation refresh prompt; 5 variables, used by auto command
- `src/content/docs/prompts/run-uat.mdx` — slice UAT execution prompt; 7 variables, used by auto command
- `src/content/docs/prompts/triage-captures.mdx` — capture triage prompt; 3 variables, used by capture/triage commands
- `src/content/docs/prompts/workflow-start.mdx` — templated workflow init prompt; 10 variables, internal trigger only
- `src/content/docs/prompts/worktree-merge.mdx` — worktree merge prompt; 11 variables, internal trigger only
- `.gsd/KNOWLEDGE.md` — appended MDX curly-brace escaping gotcha
