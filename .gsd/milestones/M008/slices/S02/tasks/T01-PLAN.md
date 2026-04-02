---
estimated_steps: 14
estimated_files: 1
skills_used: []
---

# T01: Rewrite sidebar config to 5-section structure and verify build

Rewrite the `sidebar` array in `astro.config.mjs` to consolidate 10 top-level entries into exactly 5 sections per D074:

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

## Inputs

- ``astro.config.mjs` — current sidebar config with 10 top-level entries`

## Expected Output

- ``astro.config.mjs` — rewritten sidebar with exactly 5 top-level sections`

## Verification

npm run build && npm run check-links && node -e "const fs=require('fs'); const h=fs.readFileSync('dist/index.html','utf8'); const g=fs.readFileSync('dist/getting-started/index.html','utf8'); const re=/<nav[^>]*aria-label=\"Sidebar\"[\\s\\S]*?<\\/nav>/; const hNav=h.match(re)[0].replace(/aria-current=\"page\"/g,''); const gNav=g.match(re)[0].replace(/aria-current=\"page\"/g,''); if(hNav!==gNav){console.error('Sidebar mismatch');process.exit(1)}else{console.log('Sidebar identical')}"
