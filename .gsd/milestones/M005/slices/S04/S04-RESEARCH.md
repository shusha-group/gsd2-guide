# S04: Command page backlinks — Research

**Date:** 2026-03-19

## Summary

S04 adds a "Prompts Used" section to 16 command pages (not 15 as the roadmap estimated — `migrate` is the 16th, using the `review-migration` prompt). The work is mechanical: for each command page, insert a new `## Prompts Used` section immediately before the existing `## Related Commands` section, containing a bullet list of prompt page links.

All data is already available in `content/generated/prompts.json` — the `usedByCommands` field on each prompt entry provides the reverse mapping. All 32 prompt page URLs are confirmed stable at `/prompts/{slug}/` (per S02 summary). All 16 command pages exist and share a uniform trailing structure ending with `## Related Commands`.

This is straightforward MDX editing with a clear, repeatable pattern. The only verification needed is `npm run build` + `npm run check-links` to confirm all new cross-links resolve.

## Recommendation

Write a Node.js script that reads `prompts.json`, builds the reverse mapping (command → prompts), and edits all 16 command MDX files in one pass. This is safer and faster than 16 manual edits — it eliminates typos in link paths and ensures consistent formatting. The script is a one-shot tool (run once, discard), not a permanent pipeline addition.

Insert `## Prompts Used` immediately before `## Related Commands` in each file. Use the link format `../../prompts/{slug}/` (two levels up from `/commands/{slug}/` to reach `/prompts/{slug}/`). The link text should be the prompt name (matching the prompt page's `title` frontmatter).

## Implementation Landscape

### Key Files

- `content/generated/prompts.json` — source data. Each entry has `slug`, `name`, and `usedByCommands` (array of command slugs). The reverse mapping (command → prompt list) is derived from this.
- `src/content/docs/commands/*.mdx` — 16 files to edit: `auto`, `capture`, `config`, `discuss`, `doctor`, `forensics`, `gsd`, `headless`, `hooks`, `knowledge`, `migrate`, `queue`, `quick`, `skill-health`, `steer`, `triage`
- `src/content/docs/prompts/*.mdx` — 32 prompt pages (link targets, not modified in this slice)

### Command → Prompt Mapping (16 commands)

| Command | Prompts (count) |
|---------|----------------|
| auto | complete-milestone, complete-slice, execute-task, plan-milestone, plan-slice, reassess-roadmap, replan-slice, research-milestone, research-slice, rewrite-docs, run-uat, validate-milestone (12) |
| gsd | discuss, guided-complete-slice, guided-discuss-milestone, guided-discuss-slice, guided-execute-task, guided-plan-milestone, guided-plan-slice, guided-research-slice, guided-resume-task, system (10) |
| capture | triage-captures (1) |
| config | system (1) |
| discuss | discuss (1) |
| doctor | doctor-heal (1) |
| forensics | forensics (1) |
| headless | discuss-headless (1) |
| hooks | execute-task (1) |
| knowledge | system (1) |
| migrate | review-migration (1) |
| queue | queue (1) |
| quick | quick-task (1) |
| skill-health | heal-skill (1) |
| steer | discuss (1) |
| triage | triage-captures (1) |

### Section Format

Every command page ends with `## Related Commands`. Insert before it:

```mdx
## Prompts Used

- [`execute-task`](../../prompts/execute-task/) — The core executor prompt
- [`plan-slice`](../../prompts/plan-slice/) — Slice planning prompt

```

Link format: `../../prompts/{slug}/` (up from `/commands/{slug}/` to root, then into `/prompts/{slug}/`).

Link text: the prompt `name` field (matches the prompt page `title` frontmatter).

Description after the dash: brief phrase from the prompt page's `description` frontmatter (or omit — the link alone is sufficient for a backlink section). Recommend keeping descriptions short (≤12 words) or omitting entirely. The prompt pages already have full descriptions.

### Build Order

1. **Write the generation script** — reads `prompts.json`, builds reverse map, edits all 16 files by finding `## Related Commands` and inserting before it.
2. **Run the script** — produces all 16 edits in one pass.
3. **Verify** — `npm run build` (should remain 104 pages, 0 errors) + `npm run check-links` (all new `../../prompts/` links must resolve).
4. **Delete the script** — it's a one-shot tool, not a pipeline component.

This is a single-task slice. No build-order dependency within the slice — one script does all the work, one verification confirms it.

### Verification Approach

1. `npm run build` — exits 0, still 104 pages
2. `npm run check-links` — exits 0 (currently 10380 links, will increase by ~35 new prompt links)
3. `grep -l "## Prompts Used" src/content/docs/commands/*.mdx | wc -l` → 16
4. `grep -c "../../prompts/" src/content/docs/commands/auto.mdx` → 12 (one link per prompt)
5. `grep -c "../../prompts/" src/content/docs/commands/gsd.mdx` → 10

## Constraints

- Link format must be `../../prompts/{slug}/` — Starlight's directory-based routing requires the two-level `../../` prefix for cross-directory links (see KNOWLEDGE.md: "Starlight internal link format").
- The section must be named `## Prompts Used` (not "Prompts" or "Prompt References") to be visually distinct from the existing `## Related Commands` section and match the phrasing used in prompt pages' `## Used By` section (bidirectional symmetry).
- The roadmap says 15 command pages but the actual mapping from `prompts.json` yields 16 (includes `migrate`). All 16 should be updated — the roadmap count was an estimate.
