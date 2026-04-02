# S02: Sidebar Restructure

**Goal:** Sidebar has exactly 5 top-level sections (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More) with old sections removed and collapsed groups working.
**Demo:** After this: After this: all 5 top-level sections in correct order, old sections gone, collapsed groups work, 0 broken links.

## Tasks
- [x] **T01: Rewrote astro.config.mjs sidebar from 10 top-level entries to exactly 5 sections (Start Here, Solo Builder's Guide, Recipes, Commands, Learn More) with 0 broken links** — Rewrite the `sidebar` array in `astro.config.mjs` to consolidate 10 top-level entries into exactly 5 sections per D074:

1. **Start Here** — absorbs Home link + all Getting Started items (Is GSD Right for Me, Quick Reference, Writing a Good Brief, Cost Examples, Installation, Developing with GSD, Discussing a Milestone)
2. **Solo Builder's Guide** — unchanged (9 items)
3. **Recipes** — unchanged (13 items)
4. **Commands** — unchanged (Commands Reference + 8 sub-groups)
5. **Learn More** — absorbs Deep Dives (4 items), How-to Guides (9 items), Reference (6 items), Prompts (4 sub-groups with `collapsed: true`), and Changelog link

Key constraints:
- All `link:` values must remain exactly the same — only the grouping changes
- Prompts group and its 4 sub-groups must have `collapsed: true`
- Deep Dives items go into Learn More as direct items (not a sub-group)
- How-to Guides items go into Learn More as direct items
- Reference items go into Learn More as direct items or a collapsed sub-group
- Changelog goes into Learn More as a direct link item
- No pages are created, moved, or deleted — only sidebar navigation config changes
  - Estimate: 30m
  - Files: astro.config.mjs
  - Verify: npm run build && npm run check-links && node -e "const fs=require('fs'); const h=fs.readFileSync('dist/index.html','utf8'); const g=fs.readFileSync('dist/getting-started/index.html','utf8'); const re=/<nav[^>]*aria-label=\"Sidebar\"[\\s\\S]*?<\\/nav>/; const hNav=h.match(re)[0].replace(/aria-current=\"page\"/g,''); const gNav=g.match(re)[0].replace(/aria-current=\"page\"/g,''); if(hNav!==gNav){console.error('Sidebar mismatch');process.exit(1)}else{console.log('Sidebar identical')}"
