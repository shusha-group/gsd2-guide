---
id: M005
provides:
  - 32 MDX prompt pages at src/content/docs/prompts/{slug}.mdx with 4-section content (What It Does, Pipeline Position, Variables, Used By)
  - Mermaid pipeline position diagrams on all 32 pages using terminal-native styling (phosphor green on near-black)
  - Variable tables populated from prompts.json on all 32 pages (system uses prose note — no template variables)
  - Used By sections on all 32 pages linking to commands or noting internal triggering
  - 16 command MDX pages updated with "## Prompts Used" sections and alphabetically sorted bullet links
  - Astro sidebar "Prompts" section with 4 sub-groups (Auto-mode Pipeline, Guided Variants, Commands, Foundation)
  - content/generated/prompts.json — 32-entry array with name, slug, group, variables, pipelinePosition, usedByCommands
  - page-source-map.json extended from 48 to 80 entries (+32 prompt pages)
  - page-versions.json stamped with 80 total pages (32 prompts/ + 48 existing)
  - manage-pages.mjs extended with 5 prompt lifecycle functions (detect, addSidebar, removeSidebar, create, remove)
  - update.mjs upgraded from 9-step to 10-step pipeline with "manage prompts" step
  - regenerate-page.mjs extended with buildPromptSystemPrompt() and page-type dispatch
  - scripts/lib/extract-prompts.mjs — new module with extractPrompts() + 4 static data tables
  - 54 manage-pages tests + 12 page-map tests + 48 extract tests + 10 update-pipeline tests — all passing
key_decisions:
  - D055 — prompts.json extracted at build time as a stable contract consumed by S02/S03/S04/S05
  - D056 — 4-section prompt page structure (What It Does → Pipeline Position → Variables → Used By)
  - D057 — 4-group taxonomy: auto-mode-pipeline(10), guided-variants(8), commands(13), foundation(1)
  - D058 — page-source-map key format prompts/{slug}.mdx (consistent with commands/{slug}.mdx)
  - D059 — Mermaid diagrams show 5-7 nodes (current + neighbors), not full 10-stage pipeline
  - D060 — guided variant diagrams use session model (/gsd → select-unit → guided-{type} → user-interaction → artifact), not auto-mode sequential
  - D061 — MDX template variable escaping: {{variable}} must be wrapped in backticks to avoid JSX ReferenceError
  - D062 — prompt link description truncation: em-dash split → period split → 80-char cap
  - D063 — backlink insertion anchor: immediately before ## Related Commands
  - D064 — sidebar sub-group insertion via items-array bracket detection (16-space indent for prompt entries)
  - D065 — staleness driven by manifest.files[dep] vs recorded.deps[dep] SHA; headSha is metadata only
  - D066 — regenerate-page.mjs dispatches by pagePath.startsWith('prompts/') → prompt system prompt + execute-task.mdx exemplar
patterns_established:
  - extractPrompts() mirrors extractLocal() pattern — resolvePackagePath → read files → write JSON → return count
  - Static data tables (PROMPT_GROUPS, VARIABLE_DESCRIPTIONS, COMMAND_MAPPINGS, PIPELINE_POSITIONS) at module top — auditable, patchable without logic changes
  - warn-on-missing pattern for unknown variables — logs warning, no crash
  - Prompt MDX stub format: frontmatter with title/description + :::caution scaffold notice
  - 4-section page structure with Mermaid highlight style (fill:#0d180d,stroke:#39ff14,color:#39ff14 for active node)
  - camelCase Mermaid node IDs with quoted hyphenated display labels (e.g. ExecuteTask["execute-task"])
  - Delegation-wrapper pages are intentionally brief (~25-30 lines) with "compact dispatch wrapper" phrasing
  - runManagePrompts() mirrors runManageCommands() — detect → log counts → create/remove if needed → "in sync" if neither
observability_surfaces:
  - "node scripts/lib/manage-pages.mjs" — prints new/removed counts for both commands and prompts; "(none)" = in sync
  - "node scripts/check-page-freshness.mjs" — exit 0 (all 80 fresh) or exit 1 with stale page list (includes prompts/ prefix)
  - "npm run build" — 104 pages, 0 errors is the baseline
  - "npm run check-links" — 10380 links, 0 broken is the baseline
  - "node --test tests/manage-pages.test.mjs" → 54 tests, 0 failures
  - "node --test tests/update-pipeline.test.mjs" → 10 tests, 0 failures
  - "python3 -c \"import json; d=json.load(open('page-versions.json')); print(len([k for k in d if k.startswith('prompts/')]))\") → 32"
requirement_outcomes:
  - id: R057
    from_status: active
    to_status: validated
    proof: 32 prompt MDX pages exist in src/content/docs/prompts/, each with 4-section content. npm run build exits 0 at 104 pages. npm run check-links exits 0 at 10380 links. All 32 pages navigable via sidebar under 4 role-based groups. Mermaid diagrams render (build passes Mermaid fence parsing). Variable tables populated from prompts.json. Used By sections link to commands (or note internal triggering). 32 entries in page-source-map.json.
  - id: R058
    from_status: active
    to_status: validated
    proof: grep -l "## Pipeline Position" src/content/docs/prompts/*.mdx | wc -l → 32. All 32 pages have Mermaid flowchart blocks using terminal-native styling (fill:#0d180d,stroke:#39ff14 for active node; fill:#1a3a1a for neighbors). npm run build exits 0 confirming Mermaid fences parse correctly.
  - id: R059
    from_status: active
    to_status: validated
    proof: grep -l "## Variables" src/content/docs/prompts/*.mdx | wc -l → 32. Variable tables populated from prompts.json VARIABLE_DESCRIPTIONS static map (290+ entries). system.mdx uses prose note instead of empty table (correctly documents zero template variables). npm run check-links exits 0 confirming no broken links in variable-related cross-references.
  - id: R060
    from_status: active
    to_status: validated
    proof: "grep -l '## Used By' src/content/docs/prompts/*.mdx | wc -l → 32. grep -rl '## Prompts Used' src/content/docs/commands/*.mdx | wc -l → 16. npm run check-links exits 0 (10380 links, 0 broken) confirming all prompt↔command cross-links resolve. manage-pages.mjs extended with detectNewAndRemovedPrompts() + 4 lifecycle functions. update.mjs now 10-step pipeline with 'manage prompts' step. page-versions.json stamped with 80 entries (32 prompts/). Stale detection proven end-to-end (S05: tamper dep SHA → exit 1 → re-stamp → exit 0)."
  - id: R051
    from_status: active
    to_status: active
    proof: page-source-map.json extended from 48 to 80 entries covering all 32 prompt pages. Each prompt page has exactly 1 source dep (src/resources/extensions/gsd/prompts/{name}.md). Structural validation: all 80 source paths exist in manifest.json. Operational proof for prompt pages: stale detection confirmed end-to-end in S05. Full semantic audit of all 80 entries not completed — partial coverage improvement only.
duration: ~3.5h (S01: 25m, S02: 18m, S03: 90m, S04: 8m, S05: 43m)
verification_result: passed
completed_at: 2026-03-19
---

# M005: Prompt Reference Section

**32 prompt pages live with Mermaid pipeline diagrams, variable tables, and bidirectional command links — wired into the 10-step update pipeline with stale detection, 104 pages built, 10,380 links verified.**

## What Happened

M005 delivered a complete Prompt Reference section through 5 tightly scoped slices that built on each other in a clean dependency chain.

**S01 (Prompt metadata extraction)** established the data contract. A new `scripts/lib/extract-prompts.mjs` module produced `content/generated/prompts.json` — a 32-entry array with name, slug, group (4-group D057 taxonomy), variables (with authored plain-language descriptions from a 290+ entry static map), pipeline positions, and command backlinks derived from `auto-prompts.ts` call site analysis. All metadata was authored once and consumed by all downstream slices, avoiding redundant re-derivation in 32 separate page-generation runs (D055). 48 tests passed including 9 dedicated prompts extraction tests.

**S02 (Page scaffold, sidebar, and source map)** built the infrastructure. All 32 stub MDX pages were generated in one Node.js pass using `prompts.json` as the source of truth. The Astro sidebar gained a "Prompts" section with 4 nested sub-groups (Auto-mode Pipeline → Guided Variants → Commands → Foundation). `page-source-map.json` grew from 48 to 80 entries via a new Section 6 in `build-page-map.mjs`. The test suite was fixed (5 missing command slugs added) and extended with 3 new prompt page assertions. `npm run build` passed at 104 pages.

**S03 (Prompt page content generation)** replaced all 32 stubs with fully authored 4-section pages across 3 task batches (10 auto-mode pipeline pages, 9 guided variants + foundation, 13 command prompts). Key decisions shaped the content: auto-mode pipeline diagrams show 5-7 nodes (current + neighbors, not the full 10-stage loop — D059); guided variant diagrams use a session model not the auto-mode pipeline (D060, since guided sessions dispatch directly from `/gsd`); `system.mdx` uses a radiating LR diagram; delegation-wrapper pages (4 one-liners) are intentionally brief. One unplanned debugging cycle fixed an MDX curly-brace build failure (`{{variable}}` → backtick wrapping, D061) and the fix was documented in `KNOWLEDGE.md`. Final state: 104 pages built, 10,380 links verified, 0 broken.

**S04 (Command page backlinks)** completed the bidirectional link graph. A one-shot Node.js script inverted the `usedByCommands` map from `prompts.json`, derived short link descriptions via em-dash truncation (D062), and inserted `## Prompts Used` sections before `## Related Commands` (D063) on 16 command pages. The roadmap said 15 — actual execution was 16 because `migrate` was correctly included (using `review-migration`). `auto` links to 12 prompts, `gsd` to 10; targeted commands link to 1-2. All cross-links validated by `check-links`.

**S05 (Pipeline integration)** completed the lifecycle wiring. `manage-pages.mjs` gained 5 prompt functions: `detectNewAndRemovedPrompts()`, `addPromptSidebarEntry()` (group-aware, bracket-detection insertion at 16-space indent), `removePromptSidebarEntry()` (group-agnostic pattern scan), `createNewPromptPages()`, `removePromptPages()`. `update.mjs` became a 10-step pipeline with "manage prompts" as step 5. `regenerate-page.mjs` gained `buildPromptSystemPrompt()` with `execute-task.mdx` as exemplar and a `pagePath.startsWith('prompts/')` dispatch branch (D066). `page-versions.json` stamped with 80 pages. One discovery: staleness is driven by dep SHA comparison, not `headSha` (D065) — captured after tamper testing revealed `headSha` is metadata only.

## Cross-Slice Verification

All milestone success criteria verified with direct evidence:

| Criterion | Expected | Actual | Verdict |
|-----------|----------|--------|---------|
| 32 prompt MDX pages exist | 32 | `ls src/content/docs/prompts/*.mdx \| wc -l` → **32** | ✅ |
| All pages have Mermaid pipeline diagram | 32 | `grep -l "## Pipeline Position" *.mdx \| wc -l` → **32** | ✅ |
| All pages have variable table | 32 | `grep -l "## Variables" *.mdx \| wc -l` → **32** | ✅ |
| All pages have Used By section | 32 | `grep -l "## Used By" *.mdx \| wc -l` → **32** | ✅ |
| Sidebar has 4 prompt sub-groups | 4 | `grep -E "label: '(Auto-mode Pipeline\|Guided Variants\|Commands\|Foundation)'" astro.config.mjs` → **4 labels found** | ✅ |
| `page-source-map.json` has 32 prompt entries | 32 | `python3` count of `prompts/` keys → **32** | ✅ |
| 15+ command pages have "Prompts used" sections | ≥15 | `grep -rl "## Prompts Used" commands/*.mdx \| wc -l` → **16** | ✅ |
| `npm run build` succeeds with 97+ pages | 97+ | **104 pages, 0 errors** | ✅ |
| `npm run check-links` exits 0 | 0 broken | **10,380 links, 0 broken** | ✅ |
| `npm run update` stale detection works | proven | S05 tamper test: dep SHA tamper → exit 1 (stale) → re-stamp → exit 0 | ✅ |
| `page-versions.json` has 32 prompt entries | 32 | `python3` count → **32** | ✅ |
| Manage-pages prompt lifecycle functions | 5 functions | `node scripts/lib/manage-pages.mjs` → "All prompts in sync" | ✅ |
| Test suites passing | 0 failures | manage-pages: 54/54, page-map: 12/12, extract: 48/48, update-pipeline: 10/10 | ✅ |

## Requirement Changes

- **R057** (Per-prompt deep-dive pages with pipeline diagrams): active → **validated** — 32 pages with all 4 required sections, Mermaid diagrams on every page, `npm run build` exits 0, `npm run check-links` exits 0.
- **R058** (Variable tables with context descriptions): active → **validated** — 32 pages have `## Variables` sections populated from `prompts.json` VARIABLE_DESCRIPTIONS (290+ entries). system.mdx correctly uses prose note (no template variables). `npm run check-links` exit 0 confirms no broken links.
- **R059** (Bidirectional linking between prompts and commands): active → **validated** — 32 prompt pages have `## Used By` sections; 16 command pages have `## Prompts Used` sections. `npm run check-links` exits 0 confirming all 10,380 links resolve including all bidirectional cross-links.
- **R060** (Prompt pages in regeneration pipeline): active → **validated** — `manage-pages.mjs` has full prompt lifecycle (detect/create/remove). `update.mjs` is a 10-step pipeline. `page-versions.json` stamps 80 pages (32 prompts/). Stale detection proven end-to-end in S05.
- **R051** (Accurate source dep mappings in page-source-map.json): active → remains **active** — extended from 48 to 80 entries covering all 32 prompt pages (1 dep per page, structurally validated). Operational stale detection proven for prompt pages in S05. Full semantic audit of all 80 entries not completed.

## Forward Intelligence

### What the next milestone should know

- The site now has **104 pages** at build time and **80 entries** in `page-source-map.json`. The 24-page gap is non-source-mapped content (superpowers/, user-guide/, landing pages) that exists in `src/content/docs/` but doesn't participate in the regeneration pipeline. This is intentional.
- `update.mjs` is now a **10-step pipeline** in this order: npm update → extract → diff report → regenerate → manage prompts → manage commands → build → check-links → stamp → commit+push. Any new management steps should be inserted between "manage commands" and "build".
- `page-versions.json` has **80 stamped entries**. When the next milestone adds a new content type, run `--stamp` before first pipeline run or the new set will all be reported stale.
- The **static data tables** in `extract-prompts.mjs` (`VARIABLE_DESCRIPTIONS`, `COMMAND_MAPPINGS`, `PIPELINE_POSITIONS`) need manual maintenance when gsd-pi prompts change. The extractor warns-on-missing for variable descriptions but silently omits command mappings for new `loadPrompt()` call sites.
- `buildPromptSystemPrompt()` reads `execute-task.mdx` synchronously at module import time. If that file is deleted or renamed, the function logs a warning to stderr but continues — regenerated prompt pages would have empty exemplar content (quality degrades silently).
- **MDX curly-brace escaping**: any prose quoting GSD template syntax (`{{variable}}`) must use backtick wrapping. The error surfaces at build time as `ReferenceError: X is not defined`. Documented in `KNOWLEDGE.md`.

### What's fragile

- **Sidebar bracket-detection** in `addPromptSidebarEntry` relies on consistent 16-space indentation. If Prettier or another formatter runs on `astro.config.mjs`, the indentation-based insertion could misfire. The test suite doesn't cover Prettier-reformatted sidebar scenarios.
- **Static `COMMAND_MAPPINGS`** in `extract-prompts.mjs` — if `auto-prompts.ts` gains a new `loadPrompt()` call, the mapping stays empty with no warning. The only symptom is a missing `usedByCommands` entry in `prompts.json`, which would cause no backlink to be written on the command page.
- **`execute-task` variable count = 16** is asserted in the test suite. If `execute-task.md` gains or loses a variable after a gsd-pi package upgrade, the test fails explicitly. This is a feature (forces conscious update) but will trip automated runs.
- **Test suite `COMMAND_SLUGS`** must stay in sync with the actual command directory. The current fix-on-detect pattern works but requires a human to notice and update the array when commands are added.

### Authoritative diagnostics

- `npm run check-links` — the primary correctness signal for all cross-links (prompt↔command, prompt↔prompt). 10,380 links at 0 broken is the baseline.
- `node scripts/lib/manage-pages.mjs` — canonical sync check; "(none)" for both commands and prompts = healthy.
- `node scripts/check-page-freshness.mjs` — canonical freshness check; exit 0 = all 80 stamps current; exit 1 lists stale pages with full path prefix.
- `node --test tests/manage-pages.test.mjs` — 54 tests; any regression in prompt lifecycle functions surfaces immediately.
- `npm run build` stdout — 104 pages, 0 errors is the baseline; any MDX/Mermaid syntax error surfaces with file+line context.

### What assumptions changed

- **Roadmap said "15 command pages"** with backlinks; actual execution correctly identified and updated **16** (the roadmap boundary map omitted `migrate`, which uses `review-migration`). No functional impact — the extra backlink is correct.
- **Build page count vs source-map count**: build produces 104 pages; source map tracks 80. The 24-page gap was discovered in S02 — it's non-pipeline content already in the repo. This is correct by design.
- **Guided variant diagrams**: the plan assumed they'd reference the auto-mode pipeline. Actual implementation used a distinct 5-node session model because guided variants don't follow the sequential stage order. The session model is factually more accurate.
- **Staleness mechanism**: initial S05 assumption was that tampering `headSha` would trigger stale detection. Reality: staleness is dep-SHA based (`recorded.deps[dep]` vs `manifest.files[dep]`). `headSha` is metadata only. This clarification is now in D065.

## Files Created/Modified

**New files:**
- `scripts/lib/extract-prompts.mjs` — extractPrompts() function + 4 static data tables (~320 lines)
- `src/content/docs/prompts/complete-milestone.mdx` — auto-mode pipeline: milestone closure prompt
- `src/content/docs/prompts/complete-slice.mdx` — auto-mode pipeline: slice completion prompt
- `src/content/docs/prompts/discuss.mdx` — commands: interactive milestone planning
- `src/content/docs/prompts/discuss-headless.mdx` — commands: headless milestone creation
- `src/content/docs/prompts/doctor-heal.mdx` — commands: workspace healing
- `src/content/docs/prompts/execute-task.mdx` — auto-mode pipeline: task execution (16-variable, retry loop diagram)
- `src/content/docs/prompts/forensics.mdx` — commands: forensic investigation
- `src/content/docs/prompts/guided-complete-slice.mdx` — guided variants: delegation wrapper
- `src/content/docs/prompts/guided-discuss-milestone.mdx` — guided variants: interview protocol
- `src/content/docs/prompts/guided-discuss-slice.mdx` — guided variants: slice-scoped discovery
- `src/content/docs/prompts/guided-execute-task.mdx` — guided variants: delegation wrapper
- `src/content/docs/prompts/guided-plan-milestone.mdx` — guided variants: collaborative roadmap planning
- `src/content/docs/prompts/guided-plan-slice.mdx` — guided variants: delegation wrapper
- `src/content/docs/prompts/guided-research-slice.mdx` — guided variants: interactive codebase exploration
- `src/content/docs/prompts/guided-resume-task.mdx` — guided variants: delegation wrapper
- `src/content/docs/prompts/heal-skill.mdx` — commands: skill drift analysis
- `src/content/docs/prompts/plan-milestone.mdx` — auto-mode pipeline: milestone roadmap generation
- `src/content/docs/prompts/plan-slice.mdx` — auto-mode pipeline: slice plan generation
- `src/content/docs/prompts/queue.mdx` — commands: roadmap queuing
- `src/content/docs/prompts/quick-task.mdx` — commands: lightweight task execution
- `src/content/docs/prompts/reassess-roadmap.mdx` — auto-mode pipeline: roadmap reassessment gate
- `src/content/docs/prompts/replan-slice.mdx` — auto-mode pipeline: blocker/replanning gate
- `src/content/docs/prompts/research-milestone.mdx` — auto-mode pipeline: milestone research
- `src/content/docs/prompts/research-slice.mdx` — auto-mode pipeline: slice research
- `src/content/docs/prompts/review-migration.mdx` — commands: migration audit
- `src/content/docs/prompts/rewrite-docs.mdx` — commands: documentation refresh (auto-mode dispatched)
- `src/content/docs/prompts/run-uat.mdx` — commands: slice UAT execution (auto-mode dispatched)
- `src/content/docs/prompts/system.mdx` — foundation: persona + values injected into every session
- `src/content/docs/prompts/triage-captures.mdx` — commands: capture triage
- `src/content/docs/prompts/validate-milestone.mdx` — auto-mode pipeline: milestone validation + remediation loop
- `src/content/docs/prompts/workflow-start.mdx` — commands: internal trigger only
- `src/content/docs/prompts/worktree-merge.mdx` — commands: internal trigger only
- `content/generated/prompts.json` — generated: 32-entry array with full prompt metadata

**Modified files:**
- `scripts/extract.mjs` — added extractPrompts() to Phase 1 Promise.all; Prompts: N in summary
- `scripts/lib/build-page-map.mjs` — added Section 6 for prompt pages (existsSync guard + 32 addPage calls)
- `scripts/lib/manage-pages.mjs` — added 5 prompt lifecycle functions + CLI dual detection + --prompts flag (12 exports)
- `scripts/update.mjs` — added runManagePrompts() as step 5; pipeline now 10 steps
- `scripts/lib/regenerate-page.mjs` — added buildPromptSystemPrompt() + page-type dispatch in regeneratePage()
- `astro.config.mjs` — added Prompts sidebar section (4 sub-groups, 32 entries) before Recipes
- `content/generated/page-source-map.json` — extended from 48 to 80 entries (+32 prompt pages)
- `page-versions.json` — stamped 80 pages (32 prompts/ + 48 existing)
- `tests/extract.test.mjs` — added 9 prompts extraction tests + prompts.json to idempotency array (48 tests total)
- `tests/page-map.test.mjs` — fixed COMMAND_SLUGS (28→33), page count (43→80), added 3 prompt assertions (12 tests total)
- `tests/manage-pages.test.mjs` — added 26 prompt lifecycle tests across 5 describe blocks (54 tests total)
- `tests/update-pipeline.test.mjs` — updated to 10-step assertion with "manage prompts" (10 tests total)
- `src/content/docs/commands/auto.mdx` — added ## Prompts Used (12 links)
- `src/content/docs/commands/gsd.mdx` — added ## Prompts Used (10 links)
- `src/content/docs/commands/capture.mdx` — added ## Prompts Used
- `src/content/docs/commands/config.mdx` — added ## Prompts Used
- `src/content/docs/commands/discuss.mdx` — added ## Prompts Used
- `src/content/docs/commands/doctor.mdx` — added ## Prompts Used
- `src/content/docs/commands/forensics.mdx` — added ## Prompts Used
- `src/content/docs/commands/headless.mdx` — added ## Prompts Used
- `src/content/docs/commands/hooks.mdx` — added ## Prompts Used
- `src/content/docs/commands/knowledge.mdx` — added ## Prompts Used
- `src/content/docs/commands/migrate.mdx` — added ## Prompts Used
- `src/content/docs/commands/queue.mdx` — added ## Prompts Used
- `src/content/docs/commands/quick.mdx` — added ## Prompts Used
- `src/content/docs/commands/skill-health.mdx` — added ## Prompts Used
- `src/content/docs/commands/steer.mdx` — added ## Prompts Used
- `src/content/docs/commands/triage.mdx` — added ## Prompts Used
- `.gsd/KNOWLEDGE.md` — appended MDX curly-brace escaping pattern
- `.gsd/DECISIONS.md` — added D055–D066
