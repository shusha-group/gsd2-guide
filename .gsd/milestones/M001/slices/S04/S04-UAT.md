# S04: Deep-dive documentation pages — UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All verification is structural — page counts, link integrity, sidebar presence, and build success. The content is extracted from upstream docs and rendered by Starlight without transformation beyond link rewriting. No runtime behavior or user interaction to test.

## Preconditions

- Content extraction has run (`npm run extract` or `content/generated/docs/` exists with 126 files)
- Node.js and npm are available
- `npm install` has been run

## Smoke Test

Run `npm run build` — should exit 0 and report 133 pages built.

## Test Cases

### 1. Build produces ≥130 pages

1. Run `npm run build`
2. **Expected:** Exit code 0, final output line reports ≥130 pages built

### 2. No /readme/ routes exist

1. Run `find dist/ -path "*/readme/index.html" | wc -l`
2. **Expected:** Returns 0 — all README.md files were renamed to index.md

### 3. No placeholder pages remain

1. Run `find dist/ -path "*/placeholder/*" | wc -l`
2. **Expected:** Returns 0

### 4. Sidebar contains key doc sections

1. Run `grep -o 'Guides\|Architecture\|Troubleshooting' dist/getting-started/index.html | sort -u`
2. **Expected:** Output includes "Architecture", "Guides", and "Troubleshooting"

### 5. Internal links rewritten correctly — getting-started → auto-mode

1. Run `grep -o 'href="[^"]*auto-mode[^"]*"' dist/getting-started/index.html`
2. **Expected:** Shows `/gsd2-guide/auto-mode/` (sidebar) and `../auto-mode/` (in-content) — no `.md` extension

### 6. Internal links rewritten correctly — auto-mode → git-strategy

1. Run `grep -o 'href="[^"]*git-strategy[^"]*"' dist/auto-mode/index.html`
2. **Expected:** Shows `/gsd2-guide/git-strategy/` and/or `../git-strategy/` — no `.md` extension

### 7. Internal links rewritten correctly — configuration → token-optimization with hash fragment

1. Run `grep -o 'href="[^"]*token-optimization[^"]*"' dist/configuration/index.html`
2. **Expected:** Shows `../token-optimization/#complexity-based-task-routing` — trailing slash before hash, no `.md`

### 8. README became index for subdirectories

1. Run `ls dist/building-coding-agents/index.html`
2. **Expected:** File exists (README.md was renamed to index.md, rendered as index.html)

### 9. .md) residuals are only content references

1. Run `grep -ro '\.md)' dist/ --include="*.html" | wc -l`
2. Run `grep -o 'href="[^"]*\.md"' dist/adr-001-branchless-worktree-architecture/index.html dist/context-and-hooks/07-the-system-prompt-anatomy/index.html 2>/dev/null | wc -l`
3. **Expected:** First command returns ≤20. Second command returns 0 — no `href` attributes point to `.md` files.

### 10. Landing page has deep-dive entry points

1. Run `grep -o 'href="[^"]*"' dist/index.html | grep -E 'getting-started|auto-mode|architecture|troubleshooting'`
2. **Expected:** All four paths appear as links on the landing page

### 11. Prebuild manifest is accurate

1. Run `node -e "const m=require('./src/content/docs/.generated-manifest.json'); console.log(m.files.length)"`
2. **Expected:** Returns 125

### 12. Subdirectory index files created

1. Run `find src/content/docs/ -name "index.md" -not -path "*/node_modules/*" | wc -l`
2. **Expected:** Returns 5 (building-coding-agents, context-and-hooks, extending-pi, pi-ui-tui, what-is-pi)

## Edge Cases

### Prebuild with missing source directory

1. Rename `content/generated/docs` to `content/generated/docs_bak`
2. Run `node scripts/prebuild.mjs`
3. **Expected:** Exits non-zero with error message mentioning missing source directory
4. Restore: `mv content/generated/docs_bak content/generated/docs`

### Root README.md is skipped

1. Run `ls src/content/docs/README.md 2>/dev/null; echo "EXIT: $?"`
2. **Expected:** File does not exist, exit code 1 — root README was skipped to preserve index.mdx

### No .md links remain in generated source files

1. Run `grep -rn '\]\([^)]*\.md\)' src/content/docs/ --include="*.md" | grep -v native/README | grep -v https | grep -v 'node_modules' | head -5`
2. **Expected:** Returns 0 lines or only prose mentions of filenames (not markdown link syntax `](*.md)`)

## Failure Signals

- `npm run build` exits non-zero — indicates broken links, missing content collection entries, or Astro configuration errors
- `find dist/ -path "*/readme/index.html" | wc -l` returns >0 — README→index renaming failed
- `grep -o 'href="[^"]*\.md"' dist/**/*.html` returns results — link rewriting missed some internal links
- Sidebar is missing expected groups — sidebar config in `astro.config.mjs` has incorrect page references
- Page count drops below 130 — prebuild is skipping files or content extraction didn't produce expected output

## Requirements Proved By This UAT

- R004 — Full narrative documentation pages covering all topic areas, verified by page count and sidebar group inspection
- R017 — Architecture overview pages present in sidebar and build output
- R019 — Troubleshooting section reachable from sidebar and landing page
- R020 — Getting started page is primary entry point with hero CTA and sidebar first position

## Not Proven By This UAT

- R006 — Design quality (terminal-native dark theme) requires visual human review, not artifact inspection
- R013 — Mermaid diagram rendering quality requires visual inspection of specific pages with diagrams
- Content accuracy — whether the extracted docs are correct/complete depends on upstream source quality
- Search relevance — whether Pagefind returns good results for doc page queries is not tested here

## Notes for Tester

- The 17 `.md)` occurrences in built HTML are expected — they are filenames mentioned in prose (DECISIONS.md, SYSTEM.md, etc.), not broken links. Verify by checking they don't appear inside `href=""` attributes.
- Some pages show both absolute sidebar links (`/gsd2-guide/page/`) and relative in-content links (`../page/`). Both resolve correctly — this dual format is a cosmetic artifact, not a bug.
- The dead `../native/README.md` link in the extending-pi section was intentionally left untouched — the referenced native API directory never existed upstream.
