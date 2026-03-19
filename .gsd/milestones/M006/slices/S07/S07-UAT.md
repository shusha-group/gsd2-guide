# S07: Sections 5 & 6 — Context Engineering + Costs — UAT

**Milestone:** M006
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: Both deliverables are static MDX prose files. Correctness is fully verifiable from file content (topic coverage, cross-reference validity, line count, spelling conventions) and build/link-check outputs. No runtime behaviour or browser interaction is needed to prove the slice goal.

## Preconditions

- Working directory is `/Users/davidspence/dev/gsd2-guide`
- `npm run build` has been run and `dist/` is populated (or will be run as part of testing)
- Both files exist: `src/content/docs/solo-guide/context-engineering.mdx` and `src/content/docs/solo-guide/controlling-costs.mdx`

## Smoke Test

```bash
wc -l src/content/docs/solo-guide/context-engineering.mdx src/content/docs/solo-guide/controlling-costs.mdx
```

**Expected:** Both files report >100 lines. Any result ≤100 means the stub was not replaced with substantive content.

---

## Test Cases

### 1. context-engineering.mdx covers all five R067 topics

1. Open `src/content/docs/solo-guide/context-engineering.mdx`
2. Verify the file contains five `##` headings covering each R067 topic:
   - `## agent-instructions.md: your project constitution`
   - `## DECISIONS.md: architectural memory`
   - `## KNOWLEDGE.md: domain rules, patterns, and lessons`
   - `## Reading GSD's output`
   - `## Giving good discussion answers`
3. Confirm each section contains substantive prose (not a placeholder or single sentence)
4. **Expected:** All five headings present; each section reads as practical guidance, not reference documentation.

### 2. controlling-costs.mdx covers all five R068 topics

1. Open `src/content/docs/solo-guide/controlling-costs.mdx`
2. Verify the file contains five `##` headings covering each R068 topic:
   - `## Flat-rate vs pay-per-use in practice`
   - `## Token profiles in plain English`
   - `## Per-phase model routing`
   - `## Budget ceiling configuration`
   - `## Typical cost patterns`
3. Confirm each section contains substantive prose
4. **Expected:** All five headings present; each section explains the practitioner reasoning rather than reproducing reference page tables.

### 3. Cross-reference counts and notation

1. Run:
   ```bash
   grep -c "→ gsd2-guide:" src/content/docs/solo-guide/context-engineering.mdx
   grep -c "→ gsd2-guide:" src/content/docs/solo-guide/controlling-costs.mdx
   ```
2. **Expected:** context-engineering.mdx returns 8; controlling-costs.mdx returns 9. Both ≥5.
3. Run:
   ```bash
   grep "→ gsd2-guide:" src/content/docs/solo-guide/context-engineering.mdx
   grep "→ gsd2-guide:" src/content/docs/solo-guide/controlling-costs.mdx
   ```
4. **Expected:** All cross-reference lines use the exact notation `→ gsd2-guide: [label](path)` — no variations in the arrow notation, no missing spaces.

### 4. Cross-references resolve — build and link check

1. Run:
   ```bash
   npm run build 2>&1 | grep "pages"
   npm run check-links
   ```
2. **Expected:** Build exits 0 reporting `113 page(s) built`. Link check exits 0 reporting `12288 internal links checked — 0 broken`.
3. If link check fails, note the failing slug and correlate against `src/content/docs/` paths.

### 5. Australian spelling

1. Run:
   ```bash
   grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/context-engineering.mdx
   grep -c "behaviour\|recognise\|organise\|practise\|colour" src/content/docs/solo-guide/controlling-costs.mdx
   ```
2. **Expected:** context-engineering.mdx returns >0; controlling-costs.mdx returns >0.
3. Confirm no American spellings appear in either file:
   ```bash
   grep -i "behavior\|recognize\|organize\|practice\b\|color\b" src/content/docs/solo-guide/context-engineering.mdx
   grep -i "behavior\|recognize\|organize\|practice\b\|color\b" src/content/docs/solo-guide/controlling-costs.mdx
   ```
4. **Expected:** No matches (or matches only in code blocks or cross-reference URLs where American spelling appears in system identifiers).

### 6. Frontmatter titles match index.mdx LinkCard expectations

1. Run:
   ```bash
   head -5 src/content/docs/solo-guide/context-engineering.mdx
   head -5 src/content/docs/solo-guide/controlling-costs.mdx
   ```
2. **Expected:**
   - context-engineering.mdx: `title: "What You Write vs What GSD Writes"`
   - controlling-costs.mdx: `title: "Controlling Costs"`
3. Open `src/content/docs/solo-guide/index.mdx` and confirm these titles match the LinkCard labels for Sections 5 and 6.

### 7. Pipeline contamination guard (D068)

1. Run:
   ```bash
   grep "solo-guide" content/generated/page-source-map.json; echo "exit: $?"
   ```
2. **Expected:** No output lines printed; exit code is 1.
3. Any output line containing `solo-guide` is a failure — it means solo-guide pages leaked into the generated source map and will be overwritten by the update pipeline.

### 8. Solo-guide file count unchanged

1. Run:
   ```bash
   ls src/content/docs/solo-guide/*.mdx | wc -l
   ```
2. **Expected:** 9 — the count established by S01 and unchanged through S07. Any deviation means a file was inadvertently created or deleted.

### 9. Section footers present

1. Run:
   ```bash
   tail -3 src/content/docs/solo-guide/context-engineering.mdx
   tail -3 src/content/docs/solo-guide/controlling-costs.mdx
   ```
2. **Expected:**
   - context-engineering.mdx ends with: `*This is Section 5 of the GSD 2 Solo Guide.*`
   - controlling-costs.mdx ends with: `*This is Section 6 of the GSD 2 Solo Guide.*`

### 10. Bidirectional cross-referencing

1. Run:
   ```bash
   grep "controlling-costs" src/content/docs/solo-guide/context-engineering.mdx
   grep "context-engineering" src/content/docs/solo-guide/controlling-costs.mdx
   ```
2. **Expected:** At least one match in each direction — Section 5 references Section 6, and Section 6 references Section 5. This confirms the bidirectional framing (context discipline is cost discipline) is implemented in the content.

---

## Edge Cases

### Curly brace MDX parse failure

1. Run:
   ```bash
   grep -n "[{}]" src/content/docs/solo-guide/context-engineering.mdx
   grep -n "[{}]" src/content/docs/solo-guide/controlling-costs.mdx
   ```
2. **Expected:** No matches outside of fenced code blocks. Any `{` or `}` in prose context that isn't inside a backtick fence will cause a build-time JSX `ReferenceError`.

### `../building-rhythm/` forward reference

1. Run:
   ```bash
   grep "building-rhythm" src/content/docs/solo-guide/controlling-costs.mdx
   ```
2. Confirm the link exists (controlling-costs references building-rhythm in the final cost patterns section).
3. Confirm the target exists:
   ```bash
   ls src/content/docs/solo-guide/building-rhythm.mdx
   ```
4. **Expected:** The file exists (as a stub from S01). The link check having passed confirms it resolves. If S08 renames or removes the file, this cross-reference will break.

---

## Failure Signals

- `npm run build` exits non-zero → MDX parse error; read stderr for file path and line number
- `npm run check-links` exits non-zero → broken cross-reference; read output for failing slug
- `wc -l` returns ≤100 → stub content not replaced; check the file was written correctly
- `grep -c "→ gsd2-guide:"` returns <5 → cross-reference count below minimum; check file for missing references
- `grep "solo-guide" content/generated/page-source-map.json` exits 0 (matches found) → D068 violated; solo-guide pages leaked into generated map
- `ls src/content/docs/solo-guide/*.mdx | wc -l` returns ≠9 → unexpected file created or deleted

## Requirements Proved By This UAT

- R067 — context-engineering.mdx covers all five context engineering topics with substantive narrative prose; 128 lines; build and link check pass
- R068 — controlling-costs.mdx covers all five cost management topics with substantive narrative prose; 114 lines; build and link check pass
- R070 — `→ gsd2-guide:` cross-reference notation applied consistently; 8 + 9 references; all resolve
- R072 — Australian spelling verified in both files; American variants absent from prose

## Not Proven By This UAT

- Live rendering in a browser — the pages build but are not visually inspected end-to-end. S08's closing UAT should browser-verify the full solo-guide sidebar navigation including Section 5 and Section 6.
- R066 (Section 1: Why GSD 2) — still active, owned by S06
- R064 (Section 2: Your First Project) — still active, owned by S04
- R069 (Section 8: Building a Rhythm) — still active, owned by S08
- R071 (external citations) — still active; neither Section 5 nor Section 6 includes external citations
- GitHub Pages deployment — proven when S08 runs `npm run update` end-to-end

## Notes for Tester

- The key content check for Section 6 (controlling-costs) is the token profiles section: it should frame budget/balanced/quality as confidence-based choices ("use budget when you know exactly what you're building") rather than a cost-reduction tier list. If it reads like the reference docs rather than practitioner guidance, that's a quality signal worth flagging for S08 revision.
- The key content check for Section 5 (context-engineering) is the agent-instructions.md section: it should describe how the document evolves across milestones (not just how to write one initially), explicitly pointing readers to brownfield.mdx for the initial setup. If it duplicates brownfield content instead of pointing to it, that's a regression worth flagging.
- Both pages should feel like the same author wrote them as part of a coherent guide. Read back-to-back, they should have consistent voice, consistent cross-reference style, and consistent section structure.
