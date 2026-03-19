---
estimated_steps: 4
estimated_files: 1
---

# T01: Write brownfield onboarding section content

**Slice:** S05 — Section 3: Brownfield Reality
**Milestone:** M006

## Description

Replace the stub content in `brownfield.mdx` with a complete narrative section (~150 lines) covering how to start GSD 2 on an existing codebase. This is a content-authoring task following the established pattern from S02–S04's completed sections.

The section covers four topics from R065, each as a `## ` heading separated by `---`:

1. **The first discussion on existing code** — how `/gsd` works when `.gsd/` doesn't exist but the project already has code. The discussion protocol adapts: GSD reads existing code to understand what's already built before asking what you want to change. The reader should understand how this differs from the greenfield path in Section 2.

2. **Constraining GSD** — using agent-instructions.md to set boundaries ("don't restructure the database schema", "the auth layer is off-limits for this milestone") and KNOWLEDGE.md to record existing patterns the agent should follow. Show 2-3 example lines of what a brownfield agent-instructions.md looks like, then cross-reference forward to `../context-engineering/` for the full mechanics. **Do not over-explain agent-instructions.md** — the format, pipeline, and ongoing maintenance are S07's territory.

3. **Mapping existing issues** — how to take a pile of GitHub issues, a mental TODO list, or a Notion board and express them as GSD milestones and requirements without trying to migrate everything at once. The key insight: start with one milestone covering your most urgent cluster of issues, not a comprehensive backlog migration.

4. **The handoff spec approach** — writing a description of the project's current state as if briefing a new team member. This becomes the seed for the first `/gsd` discussion. Cover what to include: architecture overview, current pain points, what's working and shouldn't be touched, the deployment setup.

Use a concrete running scenario throughout (e.g., a half-built SaaS with a messy database, an auth system that works but isn't pretty, and 30 GitHub issues) rather than generic advice.

**Relevant skills:** The `frontend-design` skill is NOT needed — this is pure content authoring.

## Steps

1. Read `src/content/docs/solo-guide/first-project.mdx` for tone, structure, separator pattern (`---` between sections), inline citation format (`→ gsd2-guide:` notation), and cross-reference link format (`../../page/` for gsd2-guide pages, `../slug/` for sibling solo-guide pages).

2. Read `src/content/docs/solo-guide/when-things-go-wrong.mdx` for the topical (non-phase-numbered) section heading style — brownfield uses `## Section Title` headings, not `## Phase N:` headings, because the content is topical rather than a sequential walkthrough.

3. Write the complete `brownfield.mdx` content. Preserve the existing frontmatter exactly:
   ```yaml
   ---
   title: "Brownfield Reality"
   description: "Starting GSD 2 on an existing codebase without burning it down."
   ---
   ```

   Structure: opening paragraphs (acknowledging greenfield Section 2 and pivoting to brownfield), then four `## ` sections separated by `---`, then a closing section pointing forward to Section 4 and Section 5.

   Cross-references to include (using `→ gsd2-guide:` notation):
   - `../../user-guide/discussing-a-milestone/` — how discussion works
   - `../../configuration/` — where agent-instructions.md lives
   - `../../commands/knowledge/` — adding rules/patterns to KNOWLEDGE.md
   - `../../commands/capture/` — capturing thoughts during exploration
   - `../../recipes/fix-a-bug/` — using the lifecycle on existing bugs
   - `../first-project/` — sibling cross-reference back to greenfield path
   - `../context-engineering/` — forward reference for agent-instructions.md depth
   - `../daily-mix/` — forward reference for ongoing workflow after onboarding

   **Australian spelling:** Use `behaviour`, `recognise`, `organisation`, `colour`, `licence` (noun) where applicable. Never use `behavior`, `recognize`, `organization`.

   **MDX safety:** If any `{variable}` or `{{variable}}` literals appear (e.g. quoting GSD syntax), wrap in backticks to prevent JSX interpretation errors at build time.

4. Run verification:
   - `wc -l src/content/docs/solo-guide/brownfield.mdx` — confirm >100 lines
   - `npm run build 2>&1 | grep "pages"` — confirm 113 pages
   - `npm run build 2>&1 | grep -i -A5 "error.*solo-guide\|solo-guide.*error"` — no MDX parse errors
   - `npm run check-links` — exits 0
   - `grep -c '→ gsd2-guide:' src/content/docs/solo-guide/brownfield.mdx` — ≥6
   - `grep -ciP 'behavio(?!u)r|recogniz|organiz' src/content/docs/solo-guide/brownfield.mdx` — 0

## Must-Haves

- [ ] Frontmatter preserved exactly (title: "Brownfield Reality", description unchanged)
- [ ] Four topical `## ` sections with `---` separators covering all R065 topics
- [ ] ≥6 cross-references using `→ gsd2-guide:` notation with correct relative link paths
- [ ] Forward reference to `../context-engineering/` for agent-instructions.md depth (scope boundary with S07)
- [ ] Concrete scenario used throughout (not generic advice)
- [ ] Australian spelling — zero American spelling variants
- [ ] Content length 120–180 lines
- [ ] `npm run build` exits 0 at 113 pages
- [ ] `npm run check-links` exits 0

## Verification

- `wc -l src/content/docs/solo-guide/brownfield.mdx` >100
- `npm run build 2>&1 | grep "pages"` shows 113
- `npm run check-links` exits 0
- `grep -c '→ gsd2-guide:' src/content/docs/solo-guide/brownfield.mdx` ≥6
- `grep -ciP 'behavio(?!u)r|recogniz|organiz' src/content/docs/solo-guide/brownfield.mdx` shows 0

## Inputs

- `src/content/docs/solo-guide/brownfield.mdx` — existing stub with valid frontmatter (8 lines)
- `src/content/docs/solo-guide/first-project.mdx` — tone/structure reference (148 lines, Phase headings, `---` separators, inline citations)
- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — topical heading reference (183 lines, `## ` headings without Phase N: prefix)
- Cross-reference targets confirmed to exist: `discussing-a-milestone`, `configuration`, `commands/knowledge`, `commands/capture`, `recipes/fix-a-bug`

## Observability Impact

**What signals change:** The Astro build's reported page count must remain at 113 after this content is written — the page already exists in the routing table (the stub was counted). If the frontmatter is corrupted, the build will error before reaching the page-count line.

**How a future agent inspects this task:**
- `wc -l src/content/docs/solo-guide/brownfield.mdx` — verifies content was written (>100 lines)
- `grep -c '→ gsd2-guide:' brownfield.mdx` — verifies cross-references were included
- `npm run check-links` — verifies all cross-reference targets still resolve (catches renamed pages)
- `grep -iP 'behavio(?!u)r|recogniz|organiz' brownfield.mdx` — verifies Australian spelling

**Failure state:** If the MDX contains unclosed JSX (`{` without `}`), the build fails with a vite error naming the file and line. This is the most likely authoring error — all GSD command references like `/gsd` must be in backticks or code fences to prevent JSX interpretation.

**No redaction concerns:** Content is public documentation; no secrets or PII.

## Expected Output

- `src/content/docs/solo-guide/brownfield.mdx` — 120–180 lines of substantive narrative content replacing the stub, with cross-references validated by link-checker
