# S08: Section 8 — Building a Rhythm — UAT

**Milestone:** M006
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S08 produces static MDX content and a build/link-check proof. There is no runtime service, no API, and no interactive UI component to test. Correctness is fully proven by: (1) file inspection confirming substantive content on all five R069 topics, (2) build exit 0 at expected page count, (3) link checker exit 0 confirming all cross-references resolve, and (4) pipeline contamination diff confirming solo-guide pages are not in the update pipeline.

## Preconditions

- Working directory: `/Users/davidspence/dev/gsd2-guide`
- Site built: `npm run build` must have been run; `dist/` directory must exist
- No uncommitted changes that would invalidate the build state

## Smoke Test

```bash
wc -l src/content/docs/solo-guide/building-rhythm.mdx
```

Expected: `102 src/content/docs/solo-guide/building-rhythm.mdx`

Any value ≤8 means the stub was not replaced — the section is missing.

---

## Test Cases

### 1. Section 8 file has substantive content on all five R069 topics

```bash
# Line count
wc -l src/content/docs/solo-guide/building-rhythm.mdx

# Topic coverage — check for each required topic heading
grep -n "weekly\|queue\|export\|agent-instructions\|graduation" src/content/docs/solo-guide/building-rhythm.mdx
```

**Expected:**
- Line count: 102 (or higher)
- grep output: at least 5 lines matching the five required topics — a weekly shape, `/gsd queue`, `/gsd export`, `agent-instructions`, and graduation path each appear as section headings or paragraph subjects

---

### 2. Cross-references to gsd2-guide pages use correct notation and resolve

```bash
# Count cross-references
grep -c "→ gsd2-guide:" src/content/docs/solo-guide/building-rhythm.mdx

# Confirm link checker passes
npm run check-links 2>&1 | tail -1
```

**Expected:**
- Cross-reference count: 12 (minimum acceptable: 5)
- Link checker: `12288 internal links checked — 0 broken`

---

### 3. External citations present — Daniel Priestley 24 Assets and SolveIt

```bash
grep "Priestley\|24 Assets" src/content/docs/solo-guide/building-rhythm.mdx
grep "SolveIt\|solve.it" src/content/docs/solo-guide/building-rhythm.mdx
```

**Expected:**
- Priestley/24 Assets: at least one line returned, containing an inline link to `danielpriestley.com`
- SolveIt: at least one line returned referencing SolveIt in context

---

### 4. Australian spelling — no US variants in any solo-guide file

```bash
grep -ri "organize\|recognize\|behavior\|color[^:]" src/content/docs/solo-guide/*.mdx
echo "Exit: $?"
```

**Expected:**
- No output (grep returns nothing)
- Exit code: 1

Any output identifies the file, line number, and the US spelling variant — each must be fixed.

---

### 5. Build produces 113 pages with no MDX parse errors

```bash
npm run build 2>&1 | tail -5
npm run build 2>&1 | grep -i "error\|warn" | grep -v "prebuild" | head -10
```

**Expected:**
- `[build] 113 page(s) built in Xs` (timing varies)
- `[build] Complete!`
- No MDX parse errors (the second grep returns no output, or only prebuild-related lines)

---

### 6. All 8 content sections have >100 lines

```bash
wc -l src/content/docs/solo-guide/*.mdx | sort -n
```

**Expected:**
- `index.mdx` at ~23 lines (navigation landing stub — intentionally short)
- All 8 content sections at >100 lines each:
  - building-rhythm.mdx ≥102
  - why-gsd.mdx ≥104
  - controlling-costs.mdx ≥114
  - brownfield.mdx ≥128
  - context-engineering.mdx ≥128
  - daily-mix.mdx ≥129
  - first-project.mdx ≥148
  - when-things-go-wrong.mdx ≥183

---

### 7. Pipeline contamination — page-source-map.json unchanged

```bash
diff <(git show HEAD:content/generated/page-source-map.json) content/generated/page-source-map.json
echo "Exit: $?"
```

**Expected:**
- No output (diff is empty)
- Exit code: 0

Any diff output means solo-guide pages have been accidentally added to the update pipeline — they would be overwritten on the next `npm run update`.

---

### 8. Section 8 accessible via sidebar navigation

```bash
# Confirm the solo-guide sidebar group includes building-rhythm
grep "building-rhythm" astro.config.mjs
```

**Expected:**
- At least one line returned, e.g.: `{ label: 'Building a Rhythm', link: '/solo-guide/building-rhythm/' }`

---

### 9. Closing section marker matches sibling pattern

```bash
tail -3 src/content/docs/solo-guide/building-rhythm.mdx
```

**Expected:**
- Final line: `*This is Section 8 of the GSD 2 Solo Guide.*`
- Consistent with sibling sections (e.g., `*This is Section 4 of the GSD 2 Solo Guide.*` in daily-mix.mdx)

---

## Edge Cases

### Section stub inadvertently restored

```bash
git diff HEAD src/content/docs/solo-guide/building-rhythm.mdx | head -5
```

**Expected:** No output (file matches committed state). If output appears, confirm the working tree has the 102-line version, not the 8-line stub.

---

### Cross-reference targets exist in dist/

```bash
# Check a sample of the cross-reference targets
ls dist/commands/queue/index.html
ls dist/commands/export/index.html
ls dist/commands/quick/index.html
ls dist/solo-guide/daily-mix/index.html
```

**Expected:** All four files exist. Missing files indicate a cross-reference target was removed upstream — run `npm run check-links` to identify the broken link.

---

### index.mdx CardGrid links all resolve

```bash
grep "link:" src/content/docs/solo-guide/index.mdx
```

**Expected:** 8 entries, one per content section, all using `../solo-guide/{slug}/` format. Then confirm via `npm run check-links` — all should resolve.

---

## Failure Signals

- `wc -l building-rhythm.mdx` returns 8 — stub not replaced; T01 output was not committed
- `npm run build` exits non-zero — MDX parse error; check `npm run build 2>&1 | grep "error"` for file + line
- `npm run check-links` exits non-zero — broken cross-reference; output lists source file, URL, and HTTP status
- `grep -c "→ gsd2-guide:" building-rhythm.mdx` returns <5 — insufficient cross-references for D070 compliance
- `diff page-source-map.json` has output — pipeline contamination; solo-guide pages were accidentally added
- Australian spelling grep returns any output — US spelling variant found; fix before deploying

## Requirements Proved By This UAT

- **R069** — building-rhythm.mdx covers all 5 required topics with >100 lines (test cases 1, 6)
- **R070** — ≥86 cross-references across all sections, all resolving (test case 2)
- **R071** — Priestley, SolveIt, and previously validated Addy Osmani/Esteban Torres/New Stack citations present (test case 3)
- **R072** — Australian spelling clean across all 9 files (test case 4)
- **R061** — All 8 content sections plus index exist, build at 113 pages (test cases 5, 6, 8)
- **D068** — Pipeline uncontaminated (test case 7)

## Not Proven By This UAT

- **Human readability of Section 8** — UAT does not evaluate whether the weekly cadence advice is actually useful or actionable for solo builders. The content was written to cover the five required topics; human editorial judgment about tone, emphasis, and practical applicability requires a reader.
- **npm run update full-pipeline exit 0** — The AI page regeneration stage for 39 upstream stale pages was not completed within task time constraints. Build and link check were verified independently. Full-pipeline proof requires a standalone `npm run update` run without a timeout constraint.
- **GitHub Pages live deployment** — The slice did not push to main and verify a GitHub Actions deploy. The build is correct and the git history will be pushed by the system. Live deployment verification is outside the artifact-driven UAT scope.
- **Why-gsd.mdx human quality** — R066 was validated on structural grounds (104 lines, cross-references, build pass). The persuasive quality of the "aha moment" framing for sceptical readers has not been tested with a real reader.

## Notes for Tester

- `index.mdx` at 23 lines is intentional — it is a CardGrid navigation landing page, not a content section. Do not flag it as a stub.
- The `npm run check-links` baseline for M006-complete state is 12,288 links. If the count differs, check for newly added or removed pages.
- The 39 upstream stale gsd-pi pages (commands/*, recipes/*, reference/extensions.mdx) do not affect solo-guide correctness. They are a separate maintenance item requiring a dedicated `npm run update` run.
- The closing `*This is Section N of the GSD 2 Solo Guide.*` lines use italics (single asterisks). If they appear as plain text in the rendered site, the asterisks were escaped — check the MDX source.
