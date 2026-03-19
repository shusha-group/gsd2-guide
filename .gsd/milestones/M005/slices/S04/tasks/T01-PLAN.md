---
estimated_steps: 5
estimated_files: 16
---

# T01: Add "Prompts Used" sections to 16 command pages

**Slice:** S04 — Command page backlinks
**Milestone:** M005

## Description

Write and run a one-shot Node.js script that adds a "Prompts Used" section to 16 command MDX pages. The script reads `content/generated/prompts.json` to build a reverse mapping (command → list of prompts), reads each prompt page's frontmatter `description` to create concise link descriptions, then edits each command page by inserting the section immediately before `## Related Commands`. After running the script and verifying the output, delete the script — it's not a permanent pipeline component.

The link format is `[`slug`](../../prompts/{slug}/)` with an em-dash description truncated to keep things brief. Prompts within each command's section should be listed in alphabetical order by slug.

## Steps

1. **Write the generation script** (`scripts/add-prompt-backlinks.mjs`):
   - Read `content/generated/prompts.json` and build reverse map: for each prompt entry, iterate its `usedByCommands` array and accumulate `{ slug, name }` per command slug.
   - For each command in the reverse map, read the corresponding `src/content/docs/commands/{command}.mdx` file.
   - Extract the prompt page frontmatter descriptions by reading `src/content/docs/prompts/{slug}.mdx` and parsing the YAML `description` field. Truncate to a short phrase (take text before the first em-dash ` — ` or period if shorter than ~80 chars, otherwise take the first sentence).
   - Find the line `## Related Commands` in each command MDX file.
   - Insert a `## Prompts Used` section immediately before it, with a blank line separator. Format:
     ```
     ## Prompts Used

     - [`execute-task`](../../prompts/execute-task/) — The core executor prompt
     - [`plan-slice`](../../prompts/plan-slice/) — Slice planning prompt

     ```
   - Sort prompts alphabetically by slug within each command's section.
   - Write the modified content back to the same file.

2. **Run the script**: `node scripts/add-prompt-backlinks.mjs` — should report 16 files modified.

3. **Verify section insertion**:
   - `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l` → 16
   - `grep -c "../../prompts/" src/content/docs/commands/auto.mdx` → 12
   - `grep -c "../../prompts/" src/content/docs/commands/gsd.mdx` → 10

4. **Build and link-check**:
   - `npm run build` → exits 0, 104 pages
   - `npm run check-links` → exits 0 (all new `../../prompts/` links resolve)

5. **Delete the script**: `rm scripts/add-prompt-backlinks.mjs`

## Must-Haves

- [ ] 16 command MDX files each contain a `## Prompts Used` section
- [ ] Section appears immediately before `## Related Commands` in each file
- [ ] Links use the format `[`slug`](../../prompts/{slug}/)`
- [ ] Prompts are sorted alphabetically within each section
- [ ] `auto.mdx` has 12 prompt links, `gsd.mdx` has 10
- [ ] `npm run build` exits 0 with 104 pages
- [ ] `npm run check-links` exits 0
- [ ] The generation script is deleted after use

## Verification

- `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l` → 16
- `grep -c "../../prompts/" src/content/docs/commands/auto.mdx` → 12
- `grep -c "../../prompts/" src/content/docs/commands/gsd.mdx` → 10
- `npm run build` → exits 0, 104 pages
- `npm run check-links` → exits 0

## Inputs

- `content/generated/prompts.json` — array of 32 prompt entries, each with `slug`, `name`, and `usedByCommands` (array of command slugs). Provides the command→prompt reverse mapping.
- `src/content/docs/prompts/*.mdx` — 32 prompt pages with frontmatter `description` fields (written by S03). Used to extract brief link descriptions.
- `src/content/docs/commands/*.mdx` — 16 target command pages. Each has a `## Related Commands` section at the end (confirmed present in all 16 files). The new `## Prompts Used` section inserts immediately before it.

### Command → Prompt Mapping

| Command | Prompt count | Prompt slugs |
|---------|-------------|--------------|
| auto | 12 | complete-milestone, complete-slice, execute-task, plan-milestone, plan-slice, reassess-roadmap, replan-slice, research-milestone, research-slice, rewrite-docs, run-uat, validate-milestone |
| gsd | 10 | discuss, guided-complete-slice, guided-discuss-milestone, guided-discuss-slice, guided-execute-task, guided-plan-milestone, guided-plan-slice, guided-research-slice, guided-resume-task, system |
| capture | 1 | triage-captures |
| config | 1 | system |
| discuss | 1 | discuss |
| doctor | 1 | doctor-heal |
| forensics | 1 | forensics |
| headless | 1 | discuss-headless |
| hooks | 1 | execute-task |
| knowledge | 1 | system |
| migrate | 1 | review-migration |
| queue | 1 | queue |
| quick | 1 | quick-task |
| skill-health | 1 | heal-skill |
| steer | 1 | discuss |
| triage | 1 | triage-captures |

### Link Format Constraint

Links from command pages to prompt pages must use `../../prompts/{slug}/` — two levels up because Starlight renders `/commands/{slug}/index.html` and the link needs to reach `/prompts/{slug}/`. This is documented in KNOWLEDGE.md under "Starlight internal link format".

## Expected Output

- 16 modified command MDX files in `src/content/docs/commands/`, each with a new `## Prompts Used` section containing alphabetically sorted prompt page links
- Build output: 104 pages, 0 errors
- Link checker: 0 broken links (all `../../prompts/` links resolve to real pages)
- `scripts/add-prompt-backlinks.mjs` — created then deleted (no permanent artifact)
