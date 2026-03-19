---
id: S05-UAT
slice: S05
milestone: M006
written: 2026-03-19
---

# S05: Section 3 — Brownfield Reality — UAT

**Milestone:** M006
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S05 delivers a single static MDX file. There is no runtime service, database, or interactive system — only a published documentation page. Artifact verification (file content, build output, link checker) covers the complete success surface. Browser navigation to confirm the rendered page is the only supplementary check.

## Preconditions

- Working directory is `/Users/davidspence/dev/gsd2-guide`
- `npm run build` has completed successfully (dist/ exists and is current)
- Dev server is running at `http://localhost:4321` (or start with `npm run dev`) for browser navigation tests

## Smoke Test

```
wc -l src/content/docs/solo-guide/brownfield.mdx
```
Expected: `128 src/content/docs/solo-guide/brownfield.mdx`

If this returns ≤8, the stub was never replaced — the slice failed to execute.

---

## Test Cases

### 1. File exists and meets length requirement

1. Run `wc -l src/content/docs/solo-guide/brownfield.mdx`
2. **Expected:** Output shows 128 (or more) lines — significantly above the 100-line minimum

### 2. All four required topics are present

1. Run `grep -n '^## ' src/content/docs/solo-guide/brownfield.mdx`
2. **Expected:** Output lists at least four `## ` headings covering:
   - First discussion on existing code (or equivalent)
   - Constraining GSD (agent-instructions.md, KNOWLEDGE.md)
   - Mapping existing issues to milestones
   - Handoff spec approach

### 3. Cross-reference count meets minimum

1. Run `grep -c '→ gsd2-guide:' src/content/docs/solo-guide/brownfield.mdx`
2. **Expected:** Output is `9` (the requirement was ≥6)

### 4. Cross-reference targets are valid

1. Run `npm run check-links`
2. **Expected:** Output ends with `✅ 12288 internal links checked — 0 broken` (or similar non-zero count with 0 broken)
3. **Failure signal:** Any `❌` lines listing a broken link — brownfield.mdx has 9 cross-references, any rename of a target page will surface here

### 5. Build succeeds at correct page count

1. Run `npm run build 2>&1 | grep "pages"`
2. **Expected:** Output contains `113 page(s) built` — brownfield.mdx was already counted in the 113 from S01 (the stub existed); if this changes from 113 something unexpected was added or removed

### 6. No MDX parse errors

1. Run `npm run build 2>&1 | grep -i 'error\|warn'`
2. **Expected:** No `[ERROR]` lines referencing `brownfield.mdx`. Warnings from other pages are pre-existing and can be ignored.

### 7. Australian spelling — no American variants

1. Run `grep -Ei 'behavio[^u]r|recogniz|organiz' src/content/docs/solo-guide/brownfield.mdx`
2. **Expected:** No output (zero matches). Any output is a spelling violation.

### 8. Frontmatter is valid

1. Run `head -5 src/content/docs/solo-guide/brownfield.mdx`
2. **Expected:** Output shows:
   ```
   ---
   title: "Brownfield Reality"
   description: "Starting GSD 2 on an existing codebase without burning it down."
   ---
   ```
3. Malformed frontmatter (missing closing `---`, wrong indentation) would have caused a build error in Test 5, but this check confirms the exact expected values.

### 9. Scope boundary respected — agent-instructions.md is introduced but not fully explained

1. Run `grep -n 'agent-instructions' src/content/docs/solo-guide/brownfield.mdx`
2. Check that the page introduces the concept with a short example but includes a forward reference to `../context-engineering/`
3. Run `grep 'context-engineering' src/content/docs/solo-guide/brownfield.mdx`
4. **Expected:** At least 2 matches — one in the constraining-GSD section and one in the closing section

### 10. Browser navigation — page renders and sidebar link works

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:4321/gsd2-guide/solo-guide/brownfield/`
3. **Expected:**
   - Page title shows "Brownfield Reality"
   - Four `## ` sections are visible with `---` separators between them
   - The sidebar shows "Solo Builder's Guide" group with "Brownfield Reality" highlighted as active
   - Cross-reference links (e.g., "Section 2: Your First Project") are clickable and resolve to the correct pages

---

## Edge Cases

### Bare `{` in prose would break build

1. Run `grep -n '{' src/content/docs/solo-guide/brownfield.mdx | grep -v '^\|^---\|^import\|^```\|^  \|link\|page\|#\|title\|descr'`
2. **Expected:** No bare `{` characters in prose context. Any `{` in the file should appear inside code fences (the agent-instructions.md example block) or in Starlight component syntax.
3. Note: if `npm run build` passes (Test 5), this edge case is already cleared — build-time detection catches unclosed JSX expressions.

### Issue cluster table renders correctly

1. In the browser, navigate to `http://localhost:4321/gsd2-guide/solo-guide/brownfield/#mapping-existing-issues-to-milestones`
2. **Expected:** A markdown table with Cluster and Issues columns renders correctly — four rows for payment reliability, mobile UI, developer experience, and future features. The table should not appear as raw pipe characters.

### Forward references resolve now (stubs exist)

1. Click the "Section 5: Context Engineering" link in the brownfield page
2. **Expected:** The link resolves to a page (even if it's currently a stub from S01). It should NOT produce a 404. The stub is live from S01's sidebar registration.

---

## Failure Signals

- `wc -l` returns ≤8 — stub was never replaced; T01 did not execute
- `npm run build` exits non-zero with `[ERROR]` referencing `brownfield.mdx` — MDX parse error (unclosed JSX, frontmatter issue)
- `npm run check-links` reports broken links — a target page was renamed or the cross-reference URL was authored incorrectly
- `grep -c '→ gsd2-guide:' brownfield.mdx` returns <6 — cross-reference count gate failed
- `grep -Ei 'behavio[^u]r|recogniz|organiz' brownfield.mdx` returns any output — American spelling present
- Browser shows 404 at `/gsd2-guide/solo-guide/brownfield/` — sidebar wiring missing (would have been caught at S01 but worth confirming)

---

## Requirements Proved By This UAT

- R065 — brownfield onboarding guidance published: first discussion on existing code, constraining GSD via agent-instructions.md/KNOWLEDGE.md, mapping existing issues to milestones, and the handoff spec approach are all present, substantive, and navigable

## Not Proven By This UAT

- Full end-to-end GitHub Pages deployment — that is S08's operational verification scope
- Human judgement on whether the advice is accurate and complete — the UAT verifies the four R065 topics are covered but not whether the specific advice is correct for all real-world brownfield scenarios
- The depth of the context-engineering forward reference destination — S07 writes that content; today's cross-references resolve to a stub

---

## Notes for Tester

- The invoice SaaS scenario (Node/Express backend, React frontend, PostgreSQL, 30 issues) is used as a running concrete example throughout all four sections. If reading the page end-to-end, confirm the scenario threads consistently rather than being introduced then dropped.
- The `agent-instructions.md` example block in the constraining section uses a fenced code block — it should render as a code block in the browser, not as bare text.
- The markdown table in the issue-mapping section should render as a proper HTML table with column headers. If it renders as raw pipe characters, there's a formatting issue.
- The "Constraining GSD" section intentionally does not explain the full mechanics of agent-instructions.md — that's by design (scope boundary with S07). It should feel like an introduction with a "see Section 5 for details" gesture, not a truncated explanation.
