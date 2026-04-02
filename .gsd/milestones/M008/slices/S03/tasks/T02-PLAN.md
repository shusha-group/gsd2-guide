---
estimated_steps: 10
estimated_files: 5
skills_used: []
---

# T02: Merge Skills/Extensions/Agents guide and deduplicate auto-mode pages

Create a single 'Skills, Extensions & Agents' guide page merging content from skills.md. Deduplicate auto-mode by differentiating the recipe (practical) from the deep-dive (internals). Update sidebar and add cross-links.

IMPORTANT: The reference pages (`reference/skills.mdx`, `reference/extensions.mdx`, `reference/agents.mdx`) are pipeline-generated from JSON and must stay untouched. The new guide page should explain skills/extensions/agents conceptually and link TO the reference pages for card listings.

Steps:
1. Read `src/content/docs/skills.md` (190 lines) — this is the main guide content about skill directories, authoring, detection, triggers.
2. Create `src/content/docs/skills-extensions-agents.md` with sections: What Are Skills (from skills.md content), What Are Extensions (brief explanation + link to reference/extensions), What Are Agents (brief explanation + link to reference/agents), Creating Your Own Skills (from skills.md authoring guide). Use Australian English.
3. In `astro.config.mjs` Learn More section, replace the `{ label: 'Skills', link: '/skills/' }` entry (line 175) with `{ label: 'Skills, Extensions & Agents', link: '/skills-extensions-agents/' }`. Keep the reference page entries (lines 182-184) as they are.
4. Update `src/content/docs/skills.md` to add a redirect notice pointing to the new page.
5. Deduplicate auto-mode: Edit `src/content/docs/auto-mode.md` to focus on practical usage (when to use it, what to expect, how to intervene, tips). Remove the detailed pipeline walkthrough that duplicates how-auto-mode-works.mdx. Add a cross-link: 'For a detailed breakdown of the 12-phase pipeline, see [How Auto Mode Works](/gsd2-guide/how-auto-mode-works/)'.
6. Edit `src/content/docs/how-auto-mode-works.mdx` to add a cross-link at top: 'For practical tips on running auto mode, see [Auto Mode](/gsd2-guide/auto-mode/)'.
7. Verify: `npm run build` exits 0.

## Inputs

- ``src/content/docs/skills.md` — source content for skills guide`
- ``src/content/docs/reference/skills.mdx` — reference page to link to (do NOT modify)`
- ``src/content/docs/reference/extensions.mdx` — reference page to link to (do NOT modify)`
- ``src/content/docs/reference/agents.mdx` — reference page to link to (do NOT modify)`
- ``astro.config.mjs` — sidebar config from T01`
- ``src/content/docs/auto-mode.md` — auto-mode recipe to deduplicate`
- ``src/content/docs/how-auto-mode-works.mdx` — auto-mode deep dive to cross-link`

## Expected Output

- ``src/content/docs/skills-extensions-agents.md` — new merged guide page`
- ``astro.config.mjs` — sidebar updated with merged skills entry`
- ``src/content/docs/skills.md` — updated with redirect notice`
- ``src/content/docs/auto-mode.md` — deduplicated with cross-link to deep dive`
- ``src/content/docs/how-auto-mode-works.mdx` — cross-link added to recipe`

## Verification

npm run build exits 0 and `test -f src/content/docs/skills-extensions-agents.md`
