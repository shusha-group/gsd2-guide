# S03: Content Consolidation — UAT

**Milestone:** M007
**Written:** 2026-04-02T04:31:53.879Z

## UAT: S03 Content Consolidation

### Preconditions
- `npm run build` exits 0
- `npm run check-links` exits 0 with 0 broken links
- Local dev server running or dist/ available for inspection

### Test Cases

**TC-01: Deep-dive pages exist and have valid frontmatter**
1. Run `head -5 src/content/docs/how-auto-mode-works.mdx` — expect `title:` and `description:` frontmatter fields
2. Run `head -5 src/content/docs/gsd-directory.mdx` — expect `title:` and `description:` frontmatter fields  
3. Run `head -5 src/content/docs/v1-to-v2.mdx` — expect `title:` and `description:` frontmatter fields
- Expected: All 3 files have valid YAML frontmatter

**TC-02: Deep Dives sidebar group registered**
1. Run `grep -c 'how-auto-mode-works\|gsd-directory\|v1-to-v2' astro.config.mjs`
- Expected: output is `3`

**TC-03: how-auto-mode-works.mdx covers required content**
1. Open `src/content/docs/how-auto-mode-works.mdx`
2. Confirm it contains a 12-phase pipeline section (Steps component or similar)
3. Confirm it contains a verification ladder section (contract, integration, operational)
4. Confirm it links to `../auto-mode/` for the generated reference
- Expected: All three content requirements present

**TC-04: gsd-directory.mdx uses FileTree component**
1. Open `src/content/docs/gsd-directory.mdx`
2. Confirm `<FileTree>` component is used
3. Confirm it describes human-authored vs machine-generated files
4. Confirm it links to `../architecture/`
- Expected: FileTree present, human/machine distinction explained, architecture link present

**TC-05: v1-to-v2.mdx is philosophy-focused, not migration steps**
1. Open `src/content/docs/v1-to-v2.mdx`
2. Confirm it discusses philosophy/differences (fresh-context model, quality gates, etc.)
3. Confirm it links to `../migration/` for actual migration steps
4. Confirm it does NOT duplicate the migration step-by-step content
- Expected: Narrative comparison present, links to migration page

**TC-06: Cross-reference subsections in solo-guide pages**
1. Run `grep -n 'Preferences' src/content/docs/solo-guide/context-engineering.mdx` — expect a `## Preferences` section
2. Run `grep -n 'Token Optim' src/content/docs/solo-guide/controlling-costs.mdx` — expect a `## Token Optimisation Deep Dive` section
3. Run `grep -n 'Git Strategy' src/content/docs/solo-guide/building-rhythm.mdx` — expect a `## Git Strategy` section
- Expected: All 3 subsections present

**TC-07: Cross-links resolve in build output**
1. Run `npm run check-links`
- Expected: 0 broken links

**TC-08: Page count unchanged or increased**
1. Run `npm run build`
2. Check page count in output
- Expected: 146 pages (or more), build exits 0

**TC-09: Voice and style match**
1. Read the opening paragraph of `how-auto-mode-works.mdx`
2. Confirm second person, practitioner-focused tone, no AI-generic filler
3. Spot-check `gsd-directory.mdx` and `v1-to-v2.mdx` similarly
- Expected: Consistent with solo-guide voice throughout

**TC-10: No MDX curly-brace errors**
1. Run `npm run build` and check for `ReferenceError` in output
- Expected: No `ReferenceError: X is not defined` errors in build output

