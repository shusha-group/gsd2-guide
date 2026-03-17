# S01: Site restructure and end-to-end walkthrough — UAT

**Milestone:** M002
**Written:** 2026-03-17

## UAT Type

- UAT mode: mixed (artifact-driven for build/content checks + live-runtime for visual/navigation + human-experience for content quality)
- Why this mode is sufficient: Build and link checks verify structural integrity. Visual inspection confirms sidebar renders correctly and pages are reachable. Human review is needed for walkthrough content quality and accuracy.

## Preconditions

- `npm install` has been run
- `npm run build` exits 0 (confirms content pipeline works)
- Dev server can be started with `npm run dev` for interactive testing

## Smoke Test

Run `npm run dev`, open `http://localhost:4321/gsd2-guide/`, confirm the sidebar shows 5 sections (User Guide, Commands, Recipes, Reference, Guides) with no pi/agent sections visible.

## Test Cases

### 1. Pi/agent content removed from sidebar

1. Start dev server: `npm run dev`
2. Open `http://localhost:4321/gsd2-guide/`
3. Inspect the sidebar navigation
4. **Expected:** No entries for "What Is Pi", "Building Coding Agents", "Context and Hooks", "Extending Pi", "Pi UI/TUI", or "Proposals". These 6 sections should be completely absent.

### 2. GSD sidebar structure is correct

1. On the site homepage, inspect the sidebar
2. **Expected:** 5 labeled sections visible:
   - **User Guide** — contains "Getting Started" and "Developing with GSD"
   - **Commands** — contains "Commands Reference"
   - **Recipes** — contains Auto Mode, Git Strategy, Working in Teams, Cost Management, Token Optimization, Dynamic Model Routing, Captures & Triage, Parallel Orchestration
   - **Reference** — contains Overview, Commands, Skills, Extensions, Agents, Shortcuts
   - **Guides** — contains Configuration, Architecture, Skills, Workflow Visualizer, Remote Questions, Migration from v1, Troubleshooting

### 3. Walkthrough page exists and is navigable

1. In the sidebar, click "User Guide" → "Developing with GSD"
2. **Expected:** Page loads at `/gsd2-guide/user-guide/developing-with-gsd/`
3. **Expected:** Page has a title "Developing with GSD" and visible content sections

### 4. Walkthrough has Mermaid diagrams

1. On the "Developing with GSD" page, scroll through the content
2. **Expected:** At least 2 rendered Mermaid diagrams visible:
   - A lifecycle flowchart near the top (showing phases: Discuss → Research → Plan → Execute → Verify → Summarize)
   - A dispatch state machine diagram in the Execution section (showing states: needs-slice-completion → needs-task-plan → needs-execution → etc.)
3. **Expected:** Diagrams render as SVG graphics with green (#39ff14) styling on dark backgrounds, not as raw mermaid source code

### 5. Walkthrough has directory trees

1. On the "Developing with GSD" page, look for code blocks containing `.gsd/` directory structures
2. **Expected:** At least 4 directory tree examples showing `.gsd/` state at different phases:
   - After discussion (CONTEXT.md exists)
   - After research/planning (ROADMAP.md, slice plans exist)
   - Mid-execution (task summaries accumulating)
   - After completion (all summaries present)
3. **Expected:** Trees use the Cookmate example project consistently

### 6. Walkthrough uses a concrete example project

1. Read through the walkthrough content
2. **Expected:** The walkthrough follows "Cookmate" (a recipe-sharing web app) as the example project — not abstract concepts
3. **Expected:** Concrete artifact examples reference Cookmate features (authentication, recipe management, etc.)

### 7. Existing GSD guide pages still work

1. Navigate to each page via sidebar links:
   - Getting Started
   - Auto Mode
   - Configuration
   - Git Strategy
   - Troubleshooting
   - Working in Teams
2. **Expected:** All pages load with content. No 404s, no blank pages.

### 8. Internal links are not broken

1. Run `node scripts/check-links.mjs`
2. **Expected:** Output shows "720 internal links checked — 0 broken" (or similar count with 0 broken)

### 9. Prebuild exclusion is observable

1. Run `node scripts/prebuild.mjs 2>&1 | grep "Excluding" | wc -l`
2. **Expected:** Returns 109
3. Run `node scripts/prebuild.mjs 2>&1 | grep "Excluding" | head -5`
4. **Expected:** Lines show specific file paths being excluded (e.g., "Excluding what-is-pi/...")

### 10. Search indexes the walkthrough

1. On the live site, click the search icon (or press Ctrl/Cmd+K)
2. Type "developing with gsd"
3. **Expected:** The "Developing with GSD" walkthrough appears in search results
4. Type "cookmate"
5. **Expected:** The walkthrough appears (Pagefind indexes the page content including the example project name)

## Edge Cases

### Direct URL access to removed content

1. Try navigating to a removed page URL, e.g., `http://localhost:4321/gsd2-guide/what-is-pi/`
2. **Expected:** 404 page (not a blank page or build error). The content was removed — no redirect needed, but it shouldn't crash.

### Build from clean state

1. Run `rm -rf dist/ src/content/docs/.generated-manifest.json`
2. Run `npm run build`
3. **Expected:** Build succeeds. Prebuild regenerates content, exclusions apply, 27 pages built.

## Failure Signals

- Sidebar shows any of: "What Is Pi", "Building Coding Agents", "Context and Hooks", "Extending Pi", "Pi UI/TUI", "Proposals"
- "Developing with GSD" page is blank or shows only placeholder text ("This page will contain...")
- Mermaid diagrams render as raw text instead of SVG graphics
- Any sidebar link leads to a 404
- `npm run build` fails
- `node scripts/check-links.mjs` reports broken links
- Search returns no results for "developing with gsd"

## Requirements Proved By This UAT

- R026 — End-to-end walkthrough with real project, Mermaid diagrams, directory trees, terminal examples (test cases 3-6)
- R029 — Pi/agent content removed, sidebar GSD-focused (test cases 1-2, 8-9)
- R031 — Visual documentation pattern with Mermaid + trees + terminal output (test cases 4-5, partially — full validation needs S02/S03)
- R032 — Existing GSD guide pages remain accessible (test case 7)

## Not Proven By This UAT

- R027 — Per-command deep-dive pages (S02/S03 scope)
- R028 — Core workflow recipe pages (S04 scope)
- R031 — Full visual documentation coverage across command pages (S02/S03 scope)
- Walkthrough technical accuracy against latest GSD source code (requires someone who uses GSD to verify the phase descriptions match actual behavior)

## Notes for Tester

- The Mermaid diagrams use a dark terminal theme. If your browser has forced light mode or high-contrast accessibility settings, the diagrams may look odd — that's expected for this site's design aesthetic.
- The walkthrough describes GSD's internal behavior (state machine, prompt structure, etc.) based on source code reading. If any phase description seems wrong, flag it — this is the highest-value feedback.
- The Commands section currently has only the auto-generated "Commands Reference" page. The individual command deep-dive pages come in S02/S03. The section is intentionally sparse.
- Page count dropped from ~135 (M001) to 27. This is correct — 109 pi/agent pages were intentionally removed.
