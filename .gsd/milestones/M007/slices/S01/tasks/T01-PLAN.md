---
estimated_steps: 9
estimated_files: 3
skills_used: []
---

# T01: Create quick-reference and decision-guide pages with sidebar entries

Create two hand-authored markdown pages and add them to the Starlight sidebar.

**Quick Reference** (`src/content/docs/quick-reference.md`): A curated page with the 12–15 most-used GSD commands, each with a one-liner and usage snippet. NOT a duplicate of `commands.md` — this is opinionated, telling new users what to reach for first. Core commands: `/gsd`, `/gsd auto`, `/gsd quick`, `/gsd status`, `/gsd discuss`, `/gsd stop`, `/gsd steer`, `/gsd capture`, `/gsd queue`, `/gsd next`, `/gsd triage`, `/gsd visualize`, `/gsd new-milestone`, `/gsd knowledge`. Group them by workflow phase (start, plan, execute, monitor, manage).

**Decision Guide** (`src/content/docs/is-gsd-right-for-me.md`): An "Is GSD right for me?" page that lets a potential user assess fit in ~30 seconds. Cover: what GSD is good for (sustained multi-session projects, solo builders, brownfield codebases), what it's NOT for (quick one-off scripts, team workflows, vibe coding), and a simple checklist or decision matrix.

**Voice:** Conversational, direct, opinionated. Australian English spelling. Match the tone of `src/content/docs/solo-guide/why-gsd.mdx`.

**Sidebar placement:**
- Decision Guide: first item in "Getting Started" group (before Installation)
- Quick Reference: second item in "Getting Started" group (after Decision Guide, before Installation)

**Internal links:** Use `../sibling/` format. Hash fragments after trailing slash: `../file/#section`.

**Important:** These are hand-authored pages. Do NOT add them to `.generated-manifest.json` or `page-source-map.json`.

## Inputs

- ``astro.config.mjs` — existing sidebar config to add entries to`
- ``src/content/docs/commands.md` — reference for command names and descriptions to curate from`
- ``src/content/docs/solo-guide/why-gsd.mdx` — voice/tone reference`

## Expected Output

- ``src/content/docs/quick-reference.md` — new curated command reference page`
- ``src/content/docs/is-gsd-right-for-me.md` — new decision guide page`
- ``astro.config.mjs` — updated with 2 new sidebar entries in Getting Started group`

## Verification

npm run build && npm run check-links && test -f dist/quick-reference/index.html && test -f dist/is-gsd-right-for-me/index.html
