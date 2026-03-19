# S06: Section 1 — Why GSD 2 — UAT

**Milestone:** M006
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S06 is pure content authoring. The deliverable is a single MDX file. Verification is build-time (Astro compilation), file-level (line count, spelling, citation counts), and structural (cross-reference links). No runtime behaviour, no API calls, no background processes — the file either builds and reads correctly, or it doesn't.

## Preconditions

- Working directory: `/Users/davidspence/dev/gsd2-guide`
- Node/npm available
- `npm install` previously run (no dependency changes in this slice)
- S01 scaffold in place: `src/content/docs/solo-guide/` directory exists, sidebar registered in `astro.config.mjs`
- `src/content/docs/solo-guide/why-gsd.mdx` exists (written by T01, replacing the 7-line stub)

## Smoke Test

```bash
npm run build 2>&1 | tail -3
```

**Expected:** `113 page(s) built in N.NNs` and `Complete!` with exit code 0. If this passes, the section compiles without MDX errors and the sidebar link is wired correctly.

## Test Cases

### 1. Build passes with 113 pages

```bash
npm run build 2>&1 | grep "pages"
```

1. Run the command
2. **Expected:** Output contains `113 page(s) built` and command exits 0. No output containing `error` or `Error` scoped to `solo-guide/why-gsd.mdx`.

---

### 2. why-gsd page is present in build output

```bash
ls dist/solo-guide/why-gsd/index.html
```

1. Run the command after a successful build
2. **Expected:** File exists (exit 0). Confirms the page was compiled and written to the dist directory.

---

### 3. Line count exceeds 100

```bash
wc -l src/content/docs/solo-guide/why-gsd.mdx
```

1. Run the command
2. **Expected:** Output shows `>= 100 src/content/docs/solo-guide/why-gsd.mdx`. The file currently has 104 lines.

---

### 4. No American spelling variants

```bash
grep -i "behavior\|color\|recognize\|organize" src/content/docs/solo-guide/why-gsd.mdx; echo "exit: $?"
```

1. Run the command
2. **Expected:** No output lines before `exit: 1`. Exit code 1 means no matches — the file uses Australian spelling throughout (behaviour, recognise, organise, colour).

---

### 5. External citations are present

```bash
grep -c 'https://' src/content/docs/solo-guide/why-gsd.mdx
```

1. Run the command
2. **Expected:** Output is `3` or greater. The three expected citations are:
   - Shareuhack vibe coding guide (`https://www.shareuhack.com/...`)
   - The New Stack context rot article (`https://thenewstack.io/...`)
   - SolveIt (`https://solve.it.com/`)

---

### 6. gsd2-guide cross-references are present

```bash
grep -c '../../' src/content/docs/solo-guide/why-gsd.mdx
```

1. Run the command
2. **Expected:** Output is `6` or greater. These are relative links to gsd2-guide reference pages (auto-mode, cost-management, getting-started, architecture, configuration) and solo-guide siblings (context-engineering, controlling-costs, first-project, daily-mix).

---

### 7. Five required sections are all present

```bash
grep "^## " src/content/docs/solo-guide/why-gsd.mdx
```

1. Run the command
2. **Expected:** Output lists all five section headings:
   ```
   ## The ceiling
   ## Context engineering
   ## The cost question
   ## The technical director mindset
   ## What GSD 2 actually is
   ```

---

### 8. Section separators are in place

```bash
grep -c "^---$" src/content/docs/solo-guide/why-gsd.mdx
```

1. Run the command
2. **Expected:** Output is `5` or greater (one separator after frontmatter, four between major sections).

---

### 9. No MDX curly-brace errors in build output

```bash
npm run build 2>&1 | grep -i "referenceerror\|is not defined" | head -5
```

1. Run the command
2. **Expected:** No output (exit 1 from grep). Any `ReferenceError: X is not defined` would indicate an unescaped `{{variable}}` template string in the MDX.

---

### 10. Rendered HTML contains section headings

```bash
grep -o "<h2[^>]*>.*</h2>" dist/solo-guide/why-gsd/index.html | head -10
```

1. Run the command after a successful build
2. **Expected:** Output contains headings matching "The ceiling", "Context engineering", "The cost question", "The technical director mindset", and "What GSD 2 actually is" (rendered as HTML anchor-linked `<h2>` elements).

---

### 11. Page is reachable via browser (manual check)

1. Run `npm run dev` and open `http://localhost:4321/gsd2-guide/solo-guide/why-gsd/` in a browser
2. Navigate to the page using the "Solo Builder's Guide → Why GSD 2" sidebar link
3. **Expected:** Page renders with a readable title, five sections with visible separators, inline links to external citations that open in a new tab, and cross-reference links to other solo-guide and gsd2-guide pages.

---

## Edge Cases

### Frontmatter title and description present

```bash
head -5 src/content/docs/solo-guide/why-gsd.mdx
```

1. Run the command
2. **Expected:** Output shows valid YAML frontmatter with `title:` and `description:` fields. Missing frontmatter would cause Astro to fail or use a blank page title.

---

### Sibling cross-references point to existing pages

```bash
grep '../' src/content/docs/solo-guide/why-gsd.mdx
```

1. Run the command
2. **Expected:** All `../slug/` links point to pages that exist in `src/content/docs/solo-guide/`. Currently expected: `../context-engineering/`, `../controlling-costs/`, `../first-project/`, `../daily-mix/`. All four exist (S01 scaffold + S02 and S04 content slices already completed).

---

### page-source-map.json unchanged

```bash
grep "why-gsd" src/content/docs/.page-source-map.json 2>/dev/null || echo "not in map"
```

1. Run the command
2. **Expected:** `not in map` (or no output). The `why-gsd.mdx` file must NOT appear in `page-source-map.json` — if it does, the update pipeline will overwrite the hand-authored content on the next `npm run update`.

---

## Failure Signals

- `npm run build` exits non-zero — MDX parse error or frontmatter issue. Look for the offending line in build output.
- Build output shows `112 page(s) built` instead of `113` — `why-gsd.mdx` is not being compiled. Check that the file exists and frontmatter is valid.
- `grep -i "behavior\|color\|recognize\|organize"` exits 0 with matches — American spelling found; fix the specific line.
- `grep -c 'https://'` returns fewer than 3 — a citation was dropped; re-read the external links section.
- `grep -c '../../'` returns fewer than 3 — a gsd2-guide cross-reference was dropped; re-read the What GSD 2 actually is closing.
- Browser shows 404 at `/gsd2-guide/solo-guide/why-gsd/` — sidebar registration missing or incorrect slug in `astro.config.mjs`.

## Requirements Proved By This UAT

- R061 (partially) — Section 1 (why-gsd.mdx) has substantive content covering all five required topics; file exists, builds, and is navigable. Full milestone validation of R061 happens at S08 when all 8 sections and `npm run update` deployment are proven end-to-end.

## Not Proven By This UAT

- `npm run check-links` — not run in this slice; full link validation at S08.
- GitHub Pages deployment — not run in this slice; `npm run update` at S08.
- Content quality / human judgment — the structure and facts are verifiable mechanically, but whether the section reads as "a compelling entry point for a sceptical vibe coder" (the slice goal) requires a human read-through.
- S07 content at `../context-engineering/` and `../controlling-costs/` — cross-references in this file point to those pages, but those pages are currently stubs. The links will pass the link checker (stubs exist) but readers will hit placeholder content until S07 ships.

## Notes for Tester

- The closing paragraph of the page contains a slight logical jump worth checking: it discusses both new-project readers and existing-codebase readers, but the final two calls-to-action go to `../first-project/` (new project) and `../daily-mix/` (the daily workflow), not `../brownfield/` (existing codebase). The text says "if you're bringing GSD to an existing codebase, the brownfield section covers…" — this text refers to brownfield.mdx conceptually, but the hyperlink at the bottom goes to `daily-mix`. This is intentional (the last CTA is daily-mix as the next most likely reader destination) but may read as contradictory. Check the closing paragraph for logical flow.
- The file uses `\` line continuations for the `→ gsd2-guide:` cross-reference lines to keep them visually grouped without blank lines between them. This is valid Markdown but renders as a single line in some editors — verify it renders as separate links in the browser.
- American spelling audit covers the four most common American variants. It does not cover every possible variant. A quick human scan for "center/centre", "labor/labour", "license/licence" is worthwhile during human UAT.
