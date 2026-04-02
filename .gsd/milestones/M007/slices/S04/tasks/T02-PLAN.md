---
estimated_steps: 6
estimated_files: 2
skills_used: []
---

# T02: Verify cross-links and final build

Run the full link checker to confirm all cross-links in the new pages resolve correctly, and verify both pages exist in the build output.

1. Run `npm run build` to rebuild
2. Run `npm run check-links` to verify no broken links
3. Verify `dist/writing-a-good-brief/index.html` contains expected content (bad-vs-good examples)
4. Verify `dist/cost-examples/index.html` contains expected content (dollar amounts)
5. Spot-check Australian English spelling in both files

## Inputs

- ``src/content/docs/writing-a-good-brief.mdx` — page created in T01`
- ``src/content/docs/cost-examples.mdx` — page created in T01`

## Expected Output

- ``dist/writing-a-good-brief/index.html` — verified with content checks`
- ``dist/cost-examples/index.html` — verified with content checks`

## Verification

npm run build && npm run check-links && grep -l 'index.html' dist/writing-a-good-brief/index.html dist/cost-examples/index.html
