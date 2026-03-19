---
estimated_steps: 5
estimated_files: 34
---

# T01: Create 32 prompt stub MDX pages and wire sidebar config

**Slice:** S02 — Page scaffold, sidebar, and source map
**Milestone:** M005

## Description

Create all 32 prompt stub MDX pages and add the "Prompts" sidebar section to `astro.config.mjs`. This is the user-visible scaffolding — pages exist and are navigable in the sidebar. All slug/group data comes from `content/generated/prompts.json` (produced by S01).

The MDX stubs follow the exact pattern used by `manage-pages.mjs` for command page scaffolds. The sidebar uses Starlight's nested sub-group syntax (`{ label, items: [{ label, items }] }`) to create 4 groups within a top-level "Prompts" section.

## Steps

1. **Read `content/generated/prompts.json`** to get the slug list and group membership. All 32 entries have `name`, `slug`, and `group` fields. `slug === name` for all entries. The 4 groups are:
   - `auto-mode-pipeline` (10): complete-milestone, complete-slice, execute-task, plan-milestone, plan-slice, reassess-roadmap, replan-slice, research-milestone, research-slice, validate-milestone
   - `guided-variants` (8): guided-complete-slice, guided-discuss-milestone, guided-discuss-slice, guided-execute-task, guided-plan-milestone, guided-plan-slice, guided-research-slice, guided-resume-task
   - `commands` (13): discuss, discuss-headless, doctor-heal, forensics, heal-skill, queue, quick-task, review-migration, rewrite-docs, run-uat, triage-captures, workflow-start, worktree-merge
   - `foundation` (1): system

2. **Create `src/content/docs/prompts/` directory** and write 32 stub MDX files. Each file is `{slug}.mdx` with this exact content:
   ```
   ---
   title: "{slug}"
   description: "Prompt reference: {slug}"
   ---

   :::caution
   This page is a scaffold — content has not been generated yet.
   :::
   ```
   Where `{slug}` is the prompt's slug from `prompts.json`.

3. **Verify all 32 files were created:**
   ```bash
   ls src/content/docs/prompts/*.mdx | wc -l
   # Expected: 32
   ```

4. **Update `astro.config.mjs`** — insert a "Prompts" sidebar section between the Commands section and the Recipes section. The Prompts section uses nested sub-groups:
   ```js
   {
     label: 'Prompts',
     items: [
       {
         label: 'Auto-mode Pipeline',
         items: [
           { label: 'complete-milestone', link: '/prompts/complete-milestone/' },
           { label: 'complete-slice', link: '/prompts/complete-slice/' },
           { label: 'execute-task', link: '/prompts/execute-task/' },
           { label: 'plan-milestone', link: '/prompts/plan-milestone/' },
           { label: 'plan-slice', link: '/prompts/plan-slice/' },
           { label: 'reassess-roadmap', link: '/prompts/reassess-roadmap/' },
           { label: 'replan-slice', link: '/prompts/replan-slice/' },
           { label: 'research-milestone', link: '/prompts/research-milestone/' },
           { label: 'research-slice', link: '/prompts/research-slice/' },
           { label: 'validate-milestone', link: '/prompts/validate-milestone/' },
         ],
       },
       {
         label: 'Guided Variants',
         items: [
           { label: 'guided-complete-slice', link: '/prompts/guided-complete-slice/' },
           { label: 'guided-discuss-milestone', link: '/prompts/guided-discuss-milestone/' },
           { label: 'guided-discuss-slice', link: '/prompts/guided-discuss-slice/' },
           { label: 'guided-execute-task', link: '/prompts/guided-execute-task/' },
           { label: 'guided-plan-milestone', link: '/prompts/guided-plan-milestone/' },
           { label: 'guided-plan-slice', link: '/prompts/guided-plan-slice/' },
           { label: 'guided-research-slice', link: '/prompts/guided-research-slice/' },
           { label: 'guided-resume-task', link: '/prompts/guided-resume-task/' },
         ],
       },
       {
         label: 'Commands',
         items: [
           { label: 'discuss', link: '/prompts/discuss/' },
           { label: 'discuss-headless', link: '/prompts/discuss-headless/' },
           { label: 'doctor-heal', link: '/prompts/doctor-heal/' },
           { label: 'forensics', link: '/prompts/forensics/' },
           { label: 'heal-skill', link: '/prompts/heal-skill/' },
           { label: 'queue', link: '/prompts/queue/' },
           { label: 'quick-task', link: '/prompts/quick-task/' },
           { label: 'review-migration', link: '/prompts/review-migration/' },
           { label: 'rewrite-docs', link: '/prompts/rewrite-docs/' },
           { label: 'run-uat', link: '/prompts/run-uat/' },
           { label: 'triage-captures', link: '/prompts/triage-captures/' },
           { label: 'workflow-start', link: '/prompts/workflow-start/' },
           { label: 'worktree-merge', link: '/prompts/worktree-merge/' },
         ],
       },
       {
         label: 'Foundation',
         items: [
           { label: 'system', link: '/prompts/system/' },
         ],
       },
     ],
   },
   ```

   **Insertion point:** Find the closing `},` of the Commands section (the block starting with `label: 'Commands'`) and insert the Prompts section immediately after it, before the Recipes section. The anchor text to look for is `label: 'Recipes'` — insert the Prompts block before the `{` that contains `label: 'Recipes'`.

5. **Verify sidebar looks correct** by reviewing the relevant section of `astro.config.mjs` and counting total prompt sidebar entries (should be 32).

## Must-Haves

- [ ] 32 `.mdx` files exist in `src/content/docs/prompts/`, one per prompt from `prompts.json`
- [ ] Each stub has valid frontmatter (`title` and `description`) and a `:::caution` scaffold notice
- [ ] `astro.config.mjs` sidebar has a "Prompts" section with 4 nested sub-groups
- [ ] Sub-group order: Auto-mode Pipeline → Guided Variants → Commands → Foundation
- [ ] Prompts section is positioned between Commands and Recipes in the sidebar
- [ ] All 32 slugs appear in the sidebar with correct `/prompts/{slug}/` link format

## Verification

- `ls src/content/docs/prompts/*.mdx | wc -l` → 32
- `head -6 src/content/docs/prompts/execute-task.mdx` shows valid frontmatter with `title: "execute-task"` and `description: "Prompt reference: execute-task"`
- `grep -c "'/prompts/" astro.config.mjs` → 32
- `grep "label: 'Prompts'" astro.config.mjs` returns a match
- `grep -A2 "label: 'Auto-mode Pipeline'" astro.config.mjs` returns a match

## Observability Impact

- **Signals changed:** `src/content/docs/prompts/` directory appears (32 new `.mdx` files). `astro.config.mjs` gains a "Prompts" top-level sidebar section with 4 nested sub-groups.
- **Inspection surface:** `ls src/content/docs/prompts/*.mdx | wc -l` → 32; `grep -c "'/prompts/" astro.config.mjs` → 32; `grep "label: 'Prompts'" astro.config.mjs` → confirms sidebar wired.
- **Failure state:** If any MDX file is missing, `npm run build` errors with "could not find content entry" for the affected slug. If the sidebar is mis-inserted (e.g. outside the outer `sidebar` array), Starlight fails at config parse time with a clear JS syntax error.
- **No secrets or runtime environment variables involved.**

## Inputs

- `content/generated/prompts.json` — 32-entry JSON array with `name`, `slug`, `group` fields (produced by S01)
- `astro.config.mjs` — current sidebar config with Commands section ending before Recipes section

## Expected Output

- `src/content/docs/prompts/*.mdx` — 32 new stub MDX files
- `astro.config.mjs` — modified with Prompts sidebar section (4 sub-groups, 32 entries)
