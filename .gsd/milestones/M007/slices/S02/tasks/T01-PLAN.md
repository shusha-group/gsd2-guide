---
estimated_steps: 7
estimated_files: 1
skills_used: []
---

# T01: Add GitHub issue auto-linking to changelog entries

Add a regex replace to `ReleaseEntry.astro` that converts `#NNN` references in changelog entry HTML into clickable GitHub links. The component already post-processes `bodyHtml` with a regex for `/gsd X` command linkification (lines 68-75). Add a second regex pass immediately after that block.

The regex must:
- Match `#` followed by digits (`#(\d+)`) 
- Not match inside existing `<a>` tags or URLs (negative lookbehind for word chars and quotes)
- Link to `https://github.com/gsd-build/gsd-2/issues/$1` (GitHub auto-redirects to /pull/ for PRs)
- Add `target="_blank"` and `rel="noopener noreferrer"`

Pattern: `(?<![\w\/"'])#(\d+)\b` → `<a href="https://github.com/gsd-build/gsd-2/issues/$1" target="_blank" rel="noopener noreferrer">#$1</a>`

## Inputs

- ``src/components/ReleaseEntry.astro` — existing component with command linkification pattern to follow`
- ``content/generated/releases.json` — source data with ~130 `#NNN` references across 88 releases`

## Expected Output

- ``src/components/ReleaseEntry.astro` — updated with issue auto-linking regex`

## Verification

npm run build && grep -c 'github.com/gsd-build/gsd-2/issues/' dist/changelog/index.html | xargs test 10 -lt
