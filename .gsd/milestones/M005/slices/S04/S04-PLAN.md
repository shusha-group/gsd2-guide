# S04: Command page backlinks

**Goal:** 16 command pages have a "Prompts Used" section linking to the prompt pages that each command invokes.
**Demo:** Open `/commands/auto/` — a "Prompts Used" section appears before "Related Commands" with 12 prompt page links. `npm run check-links` confirms all cross-links resolve.

## Must-Haves

- All 16 command pages (auto, capture, config, discuss, doctor, forensics, gsd, headless, hooks, knowledge, migrate, queue, quick, skill-health, steer, triage) gain a `## Prompts Used` section
- Each section contains bullet-list links to prompt pages using the format `[slug](../../prompts/{slug}/)`
- The section is inserted immediately before the existing `## Related Commands` section in each file
- `npm run build` exits 0 (104 pages, 0 errors)
- `npm run check-links` exits 0 (all new prompt links resolve)

## Verification

- `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l` → 16
- `grep -c "../../prompts/" src/content/docs/commands/auto.mdx` → 12
- `grep -c "../../prompts/" src/content/docs/commands/gsd.mdx` → 10
- `npm run build` → exits 0, 104 pages
- `npm run check-links` → exits 0

## Tasks

- [ ] **T01: Add "Prompts Used" sections to 16 command pages** `est:20m`
  - Why: This is the entire slice — insert backlink sections into command pages using data from `prompts.json` and prompt page frontmatter descriptions.
  - Files: `src/content/docs/commands/{auto,capture,config,discuss,doctor,forensics,gsd,headless,hooks,knowledge,migrate,queue,quick,skill-health,steer,triage}.mdx`
  - Do: Write a one-shot Node.js script that reads `content/generated/prompts.json` to build the command→prompts reverse mapping, reads each prompt page's frontmatter `description` for short link descriptions, then edits each of the 16 command MDX files by inserting a `## Prompts Used` section immediately before `## Related Commands`. Run the script. Verify with build + check-links. Delete the script after use.
  - Verify: `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l` → 16, `npm run build` exits 0, `npm run check-links` exits 0
  - Done when: All 16 command pages have "Prompts Used" sections with working links, build passes, link checker passes

## Files Likely Touched

- `src/content/docs/commands/auto.mdx`
- `src/content/docs/commands/capture.mdx`
- `src/content/docs/commands/config.mdx`
- `src/content/docs/commands/discuss.mdx`
- `src/content/docs/commands/doctor.mdx`
- `src/content/docs/commands/forensics.mdx`
- `src/content/docs/commands/gsd.mdx`
- `src/content/docs/commands/headless.mdx`
- `src/content/docs/commands/hooks.mdx`
- `src/content/docs/commands/knowledge.mdx`
- `src/content/docs/commands/migrate.mdx`
- `src/content/docs/commands/queue.mdx`
- `src/content/docs/commands/quick.mdx`
- `src/content/docs/commands/skill-health.mdx`
- `src/content/docs/commands/steer.mdx`
- `src/content/docs/commands/triage.mdx`
