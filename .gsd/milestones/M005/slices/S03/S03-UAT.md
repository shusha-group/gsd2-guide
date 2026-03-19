# S03: Prompt page content generation — UAT

**Milestone:** M005
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven + live-runtime
- Why this mode is sufficient: The slice output is 32 static MDX documentation pages. Artifact-driven checks (build count, link count, section presence) confirm structural correctness. Live-runtime browser inspection confirms the Mermaid diagrams render and the variable tables display correctly — these can't be fully verified from build artifacts alone.

## Preconditions

1. Working directory: `/Users/davidspence/dev/gsd2-guide/.gsd/worktrees/M005`
2. `npm run build` has been run and produces 104 pages with 0 errors
3. `npm run check-links` exits 0 (10380 links, 0 broken)
4. All 32 files present: `ls src/content/docs/prompts/*.mdx | wc -l` → 32
5. For browser tests: dev server running via `npm run dev` (defaults to `http://localhost:4321`)

## Smoke Test

Run `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l` → should output `32`. If it outputs anything less, at least one prompt page is missing the required section structure.

---

## Test Cases

### 1. Build and link check pass clean

1. Run `npm run build`
2. **Expected:** Output ends with `[build] 104 page(s) built in N.NNs` and `[build] Complete!` — no errors, no warnings about MDX parse failures
3. Run `npm run check-links`
4. **Expected:** Output ends with `✅ 10380 internal links checked — 0 broken` (link count may vary slightly if the site changes, but must be 0 broken)

### 2. All 32 prompt pages have 4-section structure

1. Run: `grep -l "## What It Does" src/content/docs/prompts/*.mdx | wc -l`
2. **Expected:** `32`
3. Run: `grep -l "## Pipeline Position" src/content/docs/prompts/*.mdx | wc -l`
4. **Expected:** `32`
5. Run: `grep -l "## Variables" src/content/docs/prompts/*.mdx | wc -l`
6. **Expected:** `32`
7. Run: `grep -l "## Used By" src/content/docs/prompts/*.mdx | wc -l`
8. **Expected:** `32`

### 3. execute-task variable table completeness

1. Run: `grep -c '|' src/content/docs/prompts/execute-task.mdx`
2. **Expected:** ≥ 18 (header row + separator row + 16 variable rows = 18 minimum pipe-character lines)
3. Open `src/content/docs/prompts/execute-task.mdx` and inspect the `## Variables` section
4. **Expected:** A markdown table with columns `Variable`, `Description`, `Required` and 16 data rows matching the variables in `content/generated/prompts.json` for the `execute-task` entry

### 4. system.mdx has no variable table rows

1. Run: `grep "no template variables" src/content/docs/prompts/system.mdx`
2. **Expected:** Matches at least one line (exact text: "This prompt has no template variables")
3. Run: `grep -c '|' src/content/docs/prompts/system.mdx`
4. **Expected:** `0` (exit code 1 from grep is normal — it means no pipe characters, confirming no table rows)

### 5. Internal-trigger prompts have correct Used By note

1. Run: `grep "Not directly invoked" src/content/docs/prompts/workflow-start.mdx`
2. **Expected:** Matches one line containing "triggered internally by GSD workflows"
3. Run: `grep "Not directly invoked" src/content/docs/prompts/worktree-merge.mdx`
4. **Expected:** Matches one line containing "triggered internally by GSD workflows"

### 6. Mermaid node IDs are camelCase (no hyphens in node definitions)

1. Run: `grep -rn '^\s*[a-z].*-.*\[' src/content/docs/prompts/*.mdx | grep -v '//\|<!--\|#'`
2. **Expected:** 0 results — any output indicates a Mermaid node ID with a hyphen, which causes silent diagram breakage
3. Alternative: `grep -c 'fill:#0d180d' src/content/docs/prompts/execute-task.mdx` → **1** (confirms the terminal-green highlight style is present for the current node)

### 7. Mermaid terminal-native styling present in auto-mode pipeline pages

1. Open `src/content/docs/prompts/execute-task.mdx`
2. Locate the `## Pipeline Position` section and the fenced mermaid block
3. **Expected:** 
   - Current prompt node has `fill:#0d180d,stroke:#39ff14,color:#39ff14`
   - Neighbor nodes have `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8`
   - All node IDs are camelCase (e.g. `ExecuteTask`, `PlanSlice`, `CompleteSlice`)
4. Verify the same styling pattern in `src/content/docs/prompts/plan-milestone.mdx`

### 8. Used By links use correct relative format

1. Open `src/content/docs/prompts/execute-task.mdx` and locate `## Used By`
2. **Expected:** Links use the format `../../commands/auto/` and `../../commands/hooks/` (two `../` levels up from the `prompts/` directory)
3. Run: `grep -r "commands/" src/content/docs/prompts/*.mdx | grep -v '../../commands/'`
4. **Expected:** 0 results — any result indicates a command link that doesn't use the correct relative format

### 9. Guided variant pages use session model diagram (not auto-mode pipeline)

1. Open `src/content/docs/prompts/guided-execute-task.mdx` and locate `## Pipeline Position`
2. **Expected:** Mermaid diagram contains `/gsd` or `Gsd` as the entry node and `UserInteraction` (or similar) as a node — NOT `ResearchMilestone` or `PlanSlice` (auto-mode nodes)
3. Open `src/content/docs/prompts/guided-discuss-milestone.mdx`
4. **Expected:** Same pattern — 5-node session model with user interaction node

### 10. system.mdx uses radiating diagram pattern

1. Open `src/content/docs/prompts/system.mdx` and locate `## Pipeline Position`
2. **Expected:** Mermaid block contains `graph LR` or `flowchart LR` with `System` pointing to multiple prompt nodes (radiating pattern), not a linear sequence
3. **Expected:** No variable table (only prose in `## Variables` section)

### 11. Browser: execute-task page renders Mermaid diagram

1. Navigate to `http://localhost:4321/gsd2-guide/prompts/execute-task/` in browser
2. **Expected:** Page loads with title "execute-task" (or similar)
3. Scroll to `## Pipeline Position` section
4. **Expected:** Mermaid SVG diagram renders — not raw mermaid code text; diagram shows the pipeline loop with `execute-task` node highlighted in phosphor green
5. Scroll to `## Variables` section
6. **Expected:** A rendered HTML table with 16+ rows of variable data (Variable / Description / Required columns)
7. Scroll to `## Used By` section
8. **Expected:** At least two links: one to `/commands/auto/` and one to `/commands/hooks/`

### 12. Browser: system page renders without variable table

1. Navigate to `http://localhost:4321/gsd2-guide/prompts/system/` in browser
2. **Expected:** Page loads
3. Scroll to `## Variables` section
4. **Expected:** Prose text noting no template variables — no table rendered

### 13. Browser: guided-discuss-milestone renders correctly

1. Navigate to `http://localhost:4321/gsd2-guide/prompts/guided-discuss-milestone/` in browser
2. **Expected:** Page loads with Mermaid diagram, a variable table (2 rows), and Used By links pointing to the `/gsd` command page
3. The page should be longer than a delegation-wrapper page (guided-discuss-milestone has a full interview protocol description)

### 14. Prompt pages appear in Pagefind search index

1. Navigate to `http://localhost:4321/gsd2-guide/` in browser
2. Open the search UI (click the search bar or press `/`)
3. Type "pipeline position" or "execute-task"
4. **Expected:** Search results include at least one prompt page from `src/content/docs/prompts/`

### 15. Sidebar shows all 4 prompt groups with entries

1. Navigate to any page in browser
2. Look for the "Prompts" sidebar section
3. **Expected:** 4 sub-groups visible (Auto-mode Pipeline, Guided Variants, Commands, Foundation)
4. **Expected:** The auto-mode pipeline group contains at least `execute-task`, `plan-slice`, `research-milestone`
5. **Expected:** Total of 32 entries across all 4 groups

---

## Edge Cases

### MDX curly-brace literals in prose

1. Open `src/content/docs/prompts/discuss-headless.mdx`
2. Locate any mention of template variable placeholders like `milestoneId`
3. **Expected:** The placeholder is rendered as inline code (backtick-wrapped) in the prose, not as raw `{{milestoneId}}`
4. **Why this matters:** Unescaped `{{variable}}` in MDX prose causes a build-time `ReferenceError`. The fix (backtick wrapping) must be present in discuss-headless.mdx, quick-task.mdx, and worktree-merge.mdx

### rewrite-docs and run-uat show auto-mode dispatcher context

1. Open `src/content/docs/prompts/rewrite-docs.mdx` and `src/content/docs/prompts/run-uat.mdx`
2. Locate the `## Pipeline Position` section
3. **Expected:** Diagrams show these prompts being dispatched by auto-mode (not directly by a user command). The `Used By` section should link to the `auto` command page.
4. **Not expected:** A diagram showing a user running `/gsd rewrite-docs` (no such command exists)

### workflow-start variable table has 10 rows

1. Run: `grep -c '|' src/content/docs/prompts/workflow-start.mdx`
2. **Expected:** ≥ 12 (header + separator + 10 variable rows)
3. The `worktree-merge.mdx` variable table should have 11 rows (≥ 13 pipe-character lines)

---

## Failure Signals

- `npm run build` exits non-zero → MDX syntax error or broken frontmatter; check stdout for file+line in prerender stack trace
- `npm run build` exits 0 but page count ≠ 104 → a prompt page stub was deleted or a duplicate was created
- `npm run check-links` exits non-zero → a relative link in a prompt page points to a nonexistent command or sibling prompt page; check stdout for file + broken URL
- `grep -l "## What It Does" ... | wc -l` returns < 32 → at least one page is still a stub or is missing the section heading
- Mermaid diagram renders as raw text in browser → the mermaid fence is malformed (e.g., extra whitespace before the closing ```) or the mermaid plugin isn't loading
- Variable table empty or missing in browser → the `## Variables` section exists but the table rows weren't written, or the pipe characters were escaped
- Build-time `ReferenceError: X is not defined` → a template variable placeholder like `{{X}}` appears unescaped in MDX prose; wrap in backticks

---

## Requirements Proved By This UAT

- R057 — 32 prompt pages exist with behavioral prose (What It Does), Mermaid diagrams (Pipeline Position), variable tables (Variables), and cross-links (Used By)
- R058 — Mermaid pipeline position diagrams present and rendering on all 32 pages
- R059 — Variable tables populated from prompts.json data with name, description, required columns
- R060 — Used By sections with command page links (or explicit internal-trigger notes for workflow-start/worktree-merge)
- R006 — Terminal-native dark styling (phosphor green #39FF14 highlights) extended to all 32 new Mermaid diagrams
- R031 — Visual documentation via Mermaid diagrams covering all 32 prompt pages

---

## Not Proven By This UAT

- That command pages (S04) correctly link back to these prompt pages — that's S04's responsibility
- That `npm run update` can detect a prompt page as stale and regenerate it — that's S05's responsibility
- That variable descriptions are semantically accurate (they are structurally correct and derived from source files, but accuracy is bounded by S01 prompts.json authoring quality)
- Full production deployment via GitHub Actions — the build passes locally; deployment is verified in S05 or by running `npm run update`

---

## Notes for Tester

- The Mermaid diagrams in the auto-mode pipeline pages are the highest-value visual to verify in the browser. If one renders correctly, they almost certainly all do (same template). Focus browser time on `execute-task` (most complex diagram) and `system` (unique radiating diagram).
- The 4 delegation-wrapper guided variant pages (`guided-execute-task`, `guided-plan-slice`, `guided-resume-task`, `guided-complete-slice`) are intentionally brief — ~25-30 lines of body content. Do not treat brevity as a sign of incomplete content.
- `workflow-start` and `worktree-merge` have no command page links in their Used By sections by design — they are internally triggered. This is correct behavior.
- The `system.mdx` page has no variable table rows — this is correct. The Variables section contains prose explaining that the system prompt has no template variables.
- The MDX curly-brace escaping issue in `discuss-headless.mdx`, `quick-task.mdx`, and `worktree-merge.mdx` was fixed during T03. If the build passes, these are correctly escaped. The fix manifests as inline code spans (`` `milestoneId` ``) in prose, not raw `{{milestoneId}}`.
