---
id: T03
parent: S03
milestone: M001
provides:
  - Skills reference page with 8 skills, conditional detail sections, sub-skill nesting
  - Extensions reference page with 17 extensions, ToolList, empty-tool fallback
  - Agents reference page with 5 agents, conditional model/memory/tools fields
key_files:
  - src/content/docs/reference/skills.mdx
  - src/content/docs/reference/extensions.mdx
  - src/content/docs/reference/agents.mdx
key_decisions:
  - Extensions sorted by tool count descending for quick scanning
  - Sub-skill nesting uses left border + indent with CSS, not a separate component
  - Used `white-space: pre-wrap` for multi-paragraph skill fields (objective, arguments, detection)
patterns_established:
  - Conditional rendering pattern for optional JSON fields in MDX — use `{field && <element>}` inside component slots
  - Sub-item visual nesting with border-left + padding-left in a wrapping div with class
observability_surfaces:
  - grep -o skill/extension/agent names in dist HTML to verify all items rendered
  - grep 'Sub-skill' to verify parent-child skill relationship
  - grep 'hooks or commands instead' to verify empty-tool fallback (4 matches expected)
duration: ~15m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T03: Create skills, extensions, and agents reference pages

**Built 3 reference pages rendering all 8 skills (with sub-skill nesting), 17 extensions (with ToolList and empty-tool fallback), and 5 agents (with conditional model/memory/tools fields).**

## What Happened

Created three MDX reference pages following the established T02 import pattern:

1. **Skills page** — Renders 7 top-level skills plus `gh` as a sub-skill of `github-workflows`. Top-level skills render with conditional Objective, Arguments, and Detection sections (using `white-space: pre-wrap` for multi-paragraph text). The `gh` sub-skill is visually nested with a green left border and indentation, plus a badge reading "Sub-skill of github-workflows".

2. **Extensions page** — Renders all 17 extensions sorted by tool count descending (browser-tools 47 → voice 0). Uses ReferenceGrid with "Has Tools" / "No Tools" filter categories. Extensions with tools show a ToolList component; the 4 extensions with 0 tools show an italic fallback message "This extension uses hooks or commands instead of registered tools." The 2 extensions with empty descriptions (slash-commands, voice) show "No description available" fallback text. Tool count badges show singular/plural ("1 tool" vs "3 tools").

3. **Agents page** — Renders all 5 agents with summary text and conditional Model, Memory, and Tools fields. javascript-pro and typescript-pro show Model+Memory; researcher and scout show Tools; worker shows summary only.

No MDX-breaking character issues — curly braces in tool descriptions are safely handled through Astro component props (not inline MDX expressions).

## Verification

- `npm run build` exits 0 — 136 pages built
- `find dist/reference/ -name "*.html" | wc -l` = 5 (commands, shortcuts, skills, extensions, agents)
- Skills: all 8 skill names present (`grep -o` returns debug-like-expert, frontend-design, gh, github-workflows, lint, review, swiftui, test)
- Skills: `grep 'Sub-skill of github-workflows'` matches — gh sub-skill visually linked
- Extensions: `grep -c 'browser-tools\|gsd\|mac-tools\|bg-shell\|...'` returns ≥8
- Extensions: `grep 'hooks or commands instead'` returns 4 matches — all zero-tool extensions handled
- Extensions: `grep 'No description available'` returns 2 matches — empty descriptions handled
- Agents: all 5 names present (javascript-pro, researcher, scout, typescript-pro, worker)
- Browser verification: expanded cards show correct conditional fields (Model/Memory for javascript-pro, Tools for researcher)
- Filter JS: clicking "No Tools" sets `aria-pressed="true"` and hides 13 cards (13 with tools)

### Slice-level checks status (T03 is 3rd of 4 tasks):
- ✅ `npm run build` exits 0 with 136 pages
- ✅ `find dist/reference/ -name "*.html" | wc -l` = 5 (will be 6 after T04 adds index)
- ✅ `grep -c '<details' dist/reference/commands/index.html` = 51 (≥42)
- ✅ `grep -c 'data-category' dist/reference/commands/index.html` ≥1
- ✅ `grep -l '/gsd auto' dist/reference/commands/index.html` succeeds
- ✅ Skills names ≥8
- ✅ Extensions names ≥4
- ✅ Agents = 5
- ⬜ `grep 'Quick Reference' dist/index.html` — T04 scope (hero/sidebar wiring)
- ⬜ Pagefind 137+ pages — currently 136, T04 adds reference index page
- ✅ No [ERROR] or [WARN] lines related to reference components

## Diagnostics

- **Skills content**: `grep -o 'debug-like-expert\|frontend-design\|lint\|review\|test\|swiftui\|github-workflows\|gh' dist/reference/skills/index.html | sort -u | wc -l` → 8
- **Sub-skill nesting**: `grep 'Sub-skill' dist/reference/skills/index.html` → matches
- **Extensions tool handling**: `grep -c 'hooks or commands instead' dist/reference/extensions/index.html` → 4
- **Extensions empty desc**: `grep -c 'No description available' dist/reference/extensions/index.html` → 2
- **Agents fields**: Expand javascript-pro card → shows Model: sonnet, Memory: project. Expand researcher → shows Tools: web_search, bash
- **Note on grep -c**: Minified HTML puts content on few lines, so `grep -c` (line count) may undercount. Use `grep -o 'pattern' | wc -l` for occurrence count.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/content/docs/reference/skills.mdx` — Skills reference page (8 skills, conditional sections, sub-skill nesting)
- `src/content/docs/reference/extensions.mdx` — Extensions reference page (17 extensions, ToolList, filter, empty-state handling)
- `src/content/docs/reference/agents.mdx` — Agents reference page (5 agents, conditional model/memory/tools)
- `.gsd/milestones/M001/slices/S03/tasks/T03-PLAN.md` — Added Observability Impact section
- `.gsd/milestones/M001/slices/S03/S03-PLAN.md` — Marked T03 as [x]
