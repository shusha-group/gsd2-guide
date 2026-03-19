# S05: Section 3 — Brownfield Reality

**Goal:** Substantive brownfield onboarding guidance is published in `brownfield.mdx` — covering the first discussion on existing code, constraining GSD, mapping existing issues, and the handoff spec approach.
**Demo:** `brownfield.mdx` has >100 lines of narrative content with cross-references to gsd2-guide pages. `npm run build` exits 0 at 113 pages. `npm run check-links` exits 0.

## Must-Haves

- Four topical sections covering: (1) first discussion on existing code, (2) constraining GSD via agent-instructions.md and KNOWLEDGE.md, (3) mapping existing issues to milestones, (4) the handoff spec approach
- Cross-references to at least 6 gsd2-guide pages using `→ gsd2-guide:` notation with correct relative link format
- Scope boundary respected: agent-instructions.md introduced only from the brownfield onboarding angle; mechanics deferred to `../context-engineering/` via forward reference
- Australian spelling throughout (behaviour, recognise, organisation, etc.)
- `---` separators between major sections per D072
- Inline citation format per D071; no blockquote or footer references
- Content length 120–180 lines, matching peer sections

## Verification

- `wc -l src/content/docs/solo-guide/brownfield.mdx` — >100 lines
- `npm run build 2>&1 | grep "pages"` — 113 pages
- `npm run build 2>&1 | grep -A5 "solo-guide"` — no MDX parse errors
- `npm run check-links` — exits 0
- `grep -c '→ gsd2-guide:' src/content/docs/solo-guide/brownfield.mdx` — ≥6 cross-references
- `grep -ciP 'behavio(?!u)r|recogniz|organiz' src/content/docs/solo-guide/brownfield.mdx` — 0 (no American spellings)

## Tasks

- [x] **T01: Write brownfield onboarding section content** `est:45m`
  - Why: This is the entire slice — replace the stub with substantive narrative covering all four brownfield topics from R065. Single-task because it's one coherent piece of writing with no dependencies, scaffolding, or wiring.
  - Files: `src/content/docs/solo-guide/brownfield.mdx`
  - Do: Replace the stub content (preserve frontmatter) with ~150 lines of narrative covering four `## ` sections separated by `---`: the first discussion on existing code, constraining GSD, mapping existing issues, and the handoff spec. Use `first-project.mdx` as the tone/structure reference. Include cross-references to ≥6 gsd2-guide pages. Forward-reference `../context-engineering/` for agent-instructions.md depth. Use a concrete scenario (half-built SaaS) rather than generic advice. Australian spelling throughout.
  - Verify: `npm run build` exits 0 at 113 pages; `npm run check-links` exits 0; `wc -l` >100; grep confirms ≥6 cross-refs and no American spellings
  - Done when: `brownfield.mdx` has substantive content covering all four R065 topics, builds cleanly, and passes link-check

## Observability / Diagnostics

**Runtime signals:** This slice produces a static MDX file — no runtime processes or services are started. The primary observable signal is the Astro build output (`npm run build`), which reports page count and any MDX parse errors to stdout.

**Inspection surfaces:**
- `wc -l src/content/docs/solo-guide/brownfield.mdx` — length gate (must be >100)
- `npm run build 2>&1 | grep "pages"` — confirms page count remains 113 (no pages added or removed)
- `npm run check-links` — validates all `→ gsd2-guide:` cross-references resolve to real pages
- `grep -c '→ gsd2-guide:' brownfield.mdx` — cross-reference count gate

**Failure visibility:** Build errors from malformed MDX (unclosed JSX, bare `{` in prose) appear as `[ERROR] [vite]` lines in build output with file path and line number. Link-check failures list the broken target URL and the source page. Both are deterministic and actionable.

**Redaction:** No secrets, tokens, or PII in scope. All content is public documentation.

## Files Likely Touched

- `src/content/docs/solo-guide/brownfield.mdx`
