# S03: Quick-reference pages — UAT

**Milestone:** M001
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All reference pages are statically rendered at build time. The build output (dist/) contains the full HTML that can be verified structurally. Client-side filtering uses vanilla JS that can be tested in a browser dev server. No backend, no API calls, no runtime data fetching.

## Preconditions

- `npm run build` completes successfully with 137+ pages
- `dist/` directory contains built site output
- For browser tests: `npm run dev` running (or `npm run preview` for production build preview)

## Smoke Test

Run `npm run build` and confirm output shows "137 page(s) built" and "Found 137 HTML files" from Pagefind. Then verify `find dist/reference/ -name "*.html" | wc -l` returns 6.

## Test Cases

### 1. Commands page renders all 42 commands

1. Open `/gsd2-guide/reference/commands/` in browser
2. Count the visible expandable cards
3. **Expected:** 42 cards visible across 7 category headings: Session Commands, Configuration & Diagnostics, Git Commands, Session Management, Keyboard Shortcuts, CLI Flags, Getting Started

### 2. Category filter works on commands page

1. Open `/gsd2-guide/reference/commands/`
2. Click the "CLI Flags" filter button
3. Count visible cards
4. **Expected:** Only CLI Flags cards are visible (others hidden). The "CLI Flags" button shows pressed state. Other category headings may still be visible but their cards are hidden.
5. Click "CLI Flags" again (deselect)
6. **Expected:** All 42 cards visible again, no filter active

### 3. Command card expands with detail

1. Open `/gsd2-guide/reference/commands/`
2. Click on the `/gsd auto` card summary
3. **Expected:** Card expands to show description content. The triangle indicator (▸) rotates to point downward.
4. Click the same summary again
5. **Expected:** Card collapses back

### 4. Shortcuts page renders 4 shortcuts

1. Open `/gsd2-guide/reference/shortcuts/`
2. **Expected:** 4 expandable cards for keyboard shortcuts (no filter bar — too few items to need one)
3. Verify: `grep -o 'class="ref-card"' dist/reference/shortcuts/index.html | wc -l` returns 4

### 5. Skills page renders all 8 skills with sub-skill nesting

1. Open `/gsd2-guide/reference/skills/`
2. **Expected:** 8 skill cards: debug-like-expert, frontend-design, github-workflows, gh, lint, review, swiftui, test
3. Verify `gh` appears indented under `github-workflows` with a green left border and "Sub-skill of github-workflows" badge
4. Click `debug-like-expert` card to expand
5. **Expected:** Shows objective, arguments, and/or detection sections (only sections with data are shown)

### 6. Extensions page renders 17 extensions with tool lists

1. Open `/gsd2-guide/reference/extensions/`
2. **Expected:** 17 extension cards, sorted by tool count (highest first)
3. Filter bar shows "Has Tools" and "No Tools" categories
4. Click "No Tools" filter
5. **Expected:** Only 4 cards visible (remote-questions, slash-commands, ttsr, voice) — each shows "This extension uses hooks or commands instead of registered tools" instead of an empty tool list
6. Click "Has Tools" filter
7. **Expected:** 13 extension cards visible, each with a tool list showing tool names in monospace

### 7. Agents page renders all 5 agents

1. Open `/gsd2-guide/reference/agents/`
2. **Expected:** 5 agent cards: scout, researcher, worker, javascript-pro, typescript-pro
3. Expand `javascript-pro` card
4. **Expected:** Shows summary text, Model: sonnet, Memory: project
5. Expand `scout` card
6. **Expected:** Shows summary and Tools: read, grep, find, ls, bash (no Model or Memory — fields only shown when present)

### 8. Reference index overview page

1. Open `/gsd2-guide/reference/`
2. **Expected:** Overview page with 5 LinkCards showing: Commands (42), Skills (8), Extensions (17), Agents (5), Keyboard Shortcuts (4)
3. Click "Commands (42)" link
4. **Expected:** Navigates to `/gsd2-guide/reference/commands/`

### 9. Sidebar Quick Reference group

1. Open any page on the site
2. Inspect the sidebar navigation
3. **Expected:** "Quick Reference" group appears after "Home" and before "Placeholder". Contains 6 links: Overview, Commands, Skills, Extensions, Agents, Shortcuts
4. Click "Skills" in the sidebar
5. **Expected:** Navigates to `/gsd2-guide/reference/skills/`

### 10. Hero page links to reference section

1. Open the site root `/gsd2-guide/`
2. **Expected:** Primary CTA button says "Quick Reference" and links to `/gsd2-guide/reference/`
3. Content cards below show Commands, Skills, Extensions, Agents
4. Click the "Quick Reference" CTA
5. **Expected:** Navigates to reference index page

### 11. Pagefind search includes reference content

1. Open any page and activate the search (Ctrl+K or click search)
2. Type "browser-tools"
3. **Expected:** Search results include the Extensions reference page showing browser-tools extension
4. Type "debug-like-expert"
5. **Expected:** Search results include the Skills reference page

## Edge Cases

### View transition filter persistence

1. Open `/gsd2-guide/reference/commands/`
2. Click a category filter (e.g., "Git Commands")
3. Navigate to another page via sidebar
4. Navigate back to commands page
5. **Expected:** Filter state resets (all cards visible). The filter script re-initializes on `astro:after-swap`.

### Empty tool list handling

1. Open `/gsd2-guide/reference/extensions/`
2. Find an extension with 0 tools (e.g., voice, slash-commands)
3. Expand the card
4. **Expected:** Shows italicized fallback text instead of an empty `<ul>`. No empty bullet lists or broken layout.

### Minified HTML verification accuracy

1. Run `grep -c '<details' dist/reference/commands/index.html`
2. Run `grep -o '<details' dist/reference/commands/index.html | wc -l`
3. **Expected:** Second command returns ≥42 (actual occurrence count). First command may return a lower number due to minified HTML putting multiple elements on one line. Use `grep -o | wc -l` for accurate counts.

## Failure Signals

- Build fails with MODULE_NOT_FOUND → a JSON import path in an MDX file is wrong
- Build page count drops below 137 → a reference page failed to compile
- `grep -o 'class="ref-card"'` returns 0 for any reference page → component rendering is broken
- Category filter click does nothing → vanilla JS script failed to initialize (check for JS errors in console)
- Cards don't expand on click → `<details>/<summary>` structure is broken in the component
- "Quick Reference" not in sidebar → astro.config.mjs sidebar configuration is missing or malformed
- Search returns no results for reference content → Pagefind index excluded reference pages

## Requirements Proved By This UAT

- R003 — Quick-reference cheat sheets: 76 cards, filterable, expandable, searchable (tests 1-7, 11)
- R014 — Skill documentation: 8 skills with conditional sections and sub-skill nesting (test 5)
- R015 — Extension documentation: 17 extensions with tool lists and empty-state handling (test 6)
- R016 — Agent documentation: 5 agents with conditional info (test 7)

## Not Proven By This UAT

- Visual design quality (R006) — structural verification only, no visual regression testing
- Content accuracy — verifies that extraction data renders, not that the content itself is correct
- Mobile/tablet responsiveness — all tests assume desktop viewport
- Accessibility beyond aria-pressed on filter buttons — no screen reader or keyboard-only testing

## Notes for Tester

- Use `npm run preview` (not `npm run dev`) if you want to test the production build output including Pagefind search
- Category headings remain visible when their cards are filtered out — this is a known cosmetic issue, not a bug
- The `grep -o | wc -l` pattern is required for accurate element counting in minified HTML (see KNOWLEDGE.md)
- All reference pages are server-rendered — the only client JS is the category filter script in ReferenceGrid
