# S01 Research: Quick Reference + Decision Guide

## Summary

Straightforward content authoring. Two new hand-authored pages in `src/content/docs/` using established Starlight MD patterns, plus a sidebar entry addition. No pipeline integration, no component work, no risky unknowns.

**Requirements owned:** R075 (quick reference page), R077 (decision guide)

## Recommendation

Create two markdown files and add them to the sidebar config. Follow the existing voice from `solo-guide/why-gsd.mdx` — conversational, opinionated, Australian English. Both pages are hand-authored (not pipeline-managed), so they go directly in `src/content/docs/` and are NOT added to `.generated-manifest.json` or `page-source-map.json`.

## Implementation Landscape

### Existing Patterns

- **Page format:** Simple MD with YAML frontmatter (`title`, optional `description`). See `getting-started.md`, `cost-management.md` for examples.
- **Sidebar config:** `astro.config.mjs` lines 9–80+. Items are `{ label, link }` objects nested in groups. New pages need entries here.
- **Voice/tone:** Conversational, direct, opinionated. Australian English spelling. See `solo-guide/why-gsd.mdx` for the gold standard.
- **Internal links:** Use `../sibling/` format per KNOWLEDGE.md rule. Hash fragments after trailing slash: `../file/#section`.
- **Generated vs hand-authored:** `.generated-manifest.json` lists 27 pipeline-managed files. These two new pages are hand-authored — do NOT add them to the manifest or `page-source-map.json`.

### Quick Reference Page (R075)

**What it is:** A single curated page with the 10–15 most-used commands, each with a one-liner description and a usage snippet. NOT a duplicate of `commands.md` (which lists all 28+ commands in tables). The quick reference is opinionated — it tells you what to reach for first.

**Source for command selection:** The commands reference at `src/content/docs/commands.md` (309 lines) lists all commands in tables. The quick reference should curate from this, covering the core loop: `/gsd`, `/gsd auto`, `/gsd quick`, `/gsd status`, `/gsd discuss`, `/gsd stop`, `/gsd steer`, `/gsd capture`, `/gsd queue`, `/gsd next`, `/gsd triage`, `/gsd visualize`. Maybe 12–15 commands total.

**Suggested location:** `src/content/docs/quick-reference.md`

### Decision Guide Page (R077)

**What it is:** A "Is GSD right for me?" page that lets a potential user assess fit in ~30 seconds. Should cover: what GSD is good for (sustained multi-session projects, solo builders, brownfield), what it's NOT for (quick scripts, team workflows, vibe coding one-offs), and a simple decision matrix or checklist.

**Suggested location:** `src/content/docs/is-gsd-right-for-me.md`

### Sidebar Placement

Both pages should be added to the sidebar. Natural placement:
- Quick Reference: in the "Getting Started" group, after "Installation"
- Decision Guide: either as a top-level item near "Home", or first item in "Getting Started" group (before Installation)

The S05 slice handles full navigation restructure — for now, just add entries in reasonable positions that S05 can move later.

### File Inventory

| File | Action | Notes |
|------|--------|-------|
| `src/content/docs/quick-reference.md` | Create | ~80–120 lines, curated command list |
| `src/content/docs/is-gsd-right-for-me.md` | Create | ~60–100 lines, decision guide |
| `astro.config.mjs` | Edit | Add 2 sidebar entries |

### Verification

- `npm run build` exits 0
- `npm run check-links` exits 0
- Both pages render at `/gsd2-guide/quick-reference/` and `/gsd2-guide/is-gsd-right-for-me/`
- No existing URLs broken

### Task Seams

Two independent pages + one config edit. Natural decomposition:
1. **T01: Quick Reference page** — create the MD file, add sidebar entry, verify build
2. **T02: Decision Guide page** — create the MD file, add sidebar entry, verify build

Could also be a single task since both are small. Planner's call.

## Skills Discovered

No new skills needed. Astro/Starlight patterns are well-established in this codebase.
