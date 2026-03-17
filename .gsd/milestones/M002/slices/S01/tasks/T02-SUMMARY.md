---
id: T02
parent: S01
milestone: M002
provides:
  - End-to-end "Developing with GSD" walkthrough covering all GSD phases with Mermaid diagrams, directory trees, and annotated terminal examples
  - Concrete Cookmate example project threading through every section
key_files:
  - src/content/docs/user-guide/developing-with-gsd.mdx
key_decisions:
  - Used Cookmate (recipe-sharing web app) as the concrete example project — complex enough to show real decomposition, simple enough to follow
  - Styled Mermaid diagrams with dark terminal theme colors (#1a3a1a, #39ff14) to match site aesthetic
  - Kept page as pure MDX without Starlight component imports — content is prose-heavy and doesn't benefit from Card/TabItem patterns
patterns_established:
  - Walkthrough content uses code blocks for terminal output, mermaid fenced blocks for diagrams, and indented ASCII trees for directory structure
observability_surfaces:
  - Build verification: /user-guide/developing-with-gsd/index.html appears in Astro build output
  - Content metrics: wc -l (467), grep -c mermaid (2), grep -c .gsd/ (16)
  - Link checker: npm run check-links validates all 4 internal links from the walkthrough
duration: 12 min
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Author the "Developing with GSD" end-to-end walkthrough

**Wrote 467-line walkthrough following a Cookmate recipe app through every GSD phase — discuss, research, plan, execute, verify, summarize, complete — with 2 Mermaid diagrams, 4 directory trees, and annotated terminal examples.**

## What Happened

Read GSD source code (auto-dispatch.ts, state.ts, commands.ts, and 7 prompt files) to ensure accuracy of phase descriptions and state machine behavior. Wrote the walkthrough using Cookmate as the example project, covering:

1. **Overview** — lifecycle flowchart (Mermaid), milestone→slice→task hierarchy table
2. **Starting** — what `/gsd` does on first run, terminal output examples
3. **Discussion** — reflection step, clarifying questions, what CONTEXT.md contains, directory tree after discussion
4. **Research** — what the research agent investigates, directory tree after research
5. **Planning** — milestone roadmap format, slice plan decomposition, directory tree after planning with task plans
6. **Execution** — auto-mode dispatch state machine (Mermaid), fresh session model, context pre-loading table, directory tree mid-execution
7. **Completion** — slice verification, roadmap reassessment, milestone completion, final directory tree
8. **State derivation** — how GSD reads disk to determine phase
9. **Steering** — intervention commands, manual editing, troubleshooting

The sidebar already had the walkthrough link from T01's placeholder page — no astro.config.mjs change needed.

## Verification

- `npm run build` exits 0 — walkthrough renders at `/user-guide/developing-with-gsd/index.html`
- `npm run check-links` — 720 links, 0 broken
- `wc -l` → 467 lines (must-have: >200) ✓
- `grep -c 'mermaid'` → 2 (must-have: ≥2) ✓
- `grep -c '\.gsd/'` → 16 (must-have: ≥10) ✓
- Page has 4 ASCII directory trees showing .gsd/ at discussion, research/planning, mid-execution, and post-completion phases ✓
- Contains annotated terminal output for `/gsd` launch, user description, and GSD reflection ✓
- Uses concrete Cookmate example throughout (not abstract) ✓

### Slice-level verification status

- [x] `npm run build` exits 0
- [x] `node scripts/check-links.mjs` exits 0
- [x] No pi/agent content in build tree (T01 verification, still passing)
- [x] Sidebar has no pi/agent entries (T01 verification, still passing)
- [x] `src/content/docs/user-guide/developing-with-gsd.mdx` exists with >200 lines
- [x] Built site has walkthrough at `/user-guide/developing-with-gsd/`
- [x] Prebuild stdout includes exclusion log lines (109 excluded)

## Diagnostics

- Run `npm run build 2>&1 | grep "developing-with-gsd"` to verify the page builds
- Run `wc -l src/content/docs/user-guide/developing-with-gsd.mdx` to check content length
- Run `grep -c 'mermaid' src/content/docs/user-guide/developing-with-gsd.mdx` to verify diagram count

## Deviations

- No `astro.config.mjs` change needed — T01 already added the sidebar link with the placeholder page. Plan step 8 mentioned adding it, but it was already present.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/user-guide/developing-with-gsd.mdx` — full 467-line end-to-end walkthrough replacing the placeholder
- `.gsd/milestones/M002/slices/S01/tasks/T02-PLAN.md` — added Observability Impact section (pre-flight fix)
