---
estimated_steps: 18
estimated_files: 1
skills_used: []
---

# T01: Restructure sidebar in astro.config.mjs — add missing pages, fix misplaced prompts, reorder groups

Edit the sidebar array in `astro.config.mjs` to:
1. Move the three misplaced prompt entries (`gate-evaluate`, `reactive-execute`, `rethink`) from the end of the Commands group into the Prompts > Auto-mode Pipeline subgroup (they are auto-mode prompts).
2. Add `writing-a-good-brief` and `cost-examples` to the Getting Started group after Quick Reference.
3. Reorder top-level groups so Getting Started comes before Deep Dives (new users should see Getting Started first).

The three prompt entries currently sit after the Commands > Reference subgroup's closing brace but still inside the Commands group — they are orphaned items. Move them into Prompts > Auto-mode Pipeline, alphabetically among existing entries.

The target sidebar order (top to bottom):
- Home
- Getting Started (with new entries: ...existing..., Writing a Good Brief, Cost Examples)
- Solo Builder's Guide
- Deep Dives
- Changelog Highlights
- Changelog
- Commands (without the 3 orphaned prompt entries)
- Prompts (with the 3 entries added to Auto-mode Pipeline)
- Recipes
- Reference
- How-to Guides

IMPORTANT: The sidebar config is deeply nested JS. Use exact text matching for edits. Verify bracket balance after each edit.

## Inputs

- ``astro.config.mjs``

## Expected Output

- ``astro.config.mjs``

## Verification

npm run build && npm run check-links && grep -q 'writing-a-good-brief' astro.config.mjs && grep -q 'cost-examples' astro.config.mjs && node -e "const fs=require('fs'); const c=fs.readFileSync('astro.config.mjs','utf8'); const cmdIdx=c.indexOf(\"label: 'Commands'\"); const prIdx=c.indexOf(\"label: 'Prompts'\"); if(c.indexOf('gate-evaluate')>cmdIdx && c.indexOf('gate-evaluate')<prIdx) {console.error('gate-evaluate still in Commands'); process.exit(1)} console.log('All checks pass')"
