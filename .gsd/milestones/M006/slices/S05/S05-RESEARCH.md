# S05 (Section 3 — Brownfield Reality) — Research

**Date:** 2026-03-19

## Summary

This is a straightforward content-authoring slice following the established pattern from S02–S04. The brownfield section (`brownfield.mdx`) is a stub with valid frontmatter and needs to be replaced with substantive narrative content addressing R065: how to start GSD 2 on an existing codebase without burning it down.

The section has a clear scope boundary with the context-engineering section (S07/R067). Brownfield covers the *onboarding problem* — constraining GSD from restructuring things you don't want restructured, mapping existing issues to milestones, and writing a handoff spec that captures the project's current reality. Context-engineering (S07) covers the *ongoing practice* — how agent-instructions.md works, DECISIONS.md patterns, KNOWLEDGE.md for domain terms. Brownfield can reference agent-instructions.md but only from the "what to write when adopting GSD on existing code" angle — the mechanics are S07's territory.

The content should be ~120–180 lines to match peer sections (daily-mix: 129, first-project: 148, when-things-go-wrong: 183). The section is a narrative walkthrough, not a reference page, so it follows D072's `---` separator + `## Section` heading pattern established in `first-project.mdx` and `when-things-go-wrong.mdx`.

## Recommendation

Single-task slice. Replace the stub content in `brownfield.mdx` with a complete narrative section covering four topics from R065:

1. **The first discussion on existing code** — how `/gsd` works when `.gsd/` doesn't exist but the project directory already has code, and how that changes the discussion protocol
2. **Constraining GSD** — agent-instructions.md as boundary-setting ("don't restructure the database schema", "don't rewrite the auth layer"), KNOWLEDGE.md for recording existing patterns the agent should follow
3. **Mapping existing issues** — how to take a backlog of GitHub issues or mental TODO lists and express them as GSD milestones/requirements without trying to migrate everything at once
4. **The handoff spec approach** — writing a description of the project's current state as if briefing a new team member, which becomes the seed for the first discussion

Follow the inline citation format (D071), the `→ gsd2-guide:` cross-reference notation (D070), Australian spelling (R072), and `---` separators between major sections (D072).

## Implementation Landscape

### Key Files

- `src/content/docs/solo-guide/brownfield.mdx` — the only file to modify; replace stub content with full section narrative
- `src/content/docs/solo-guide/first-project.mdx` — reference for tone, structure, separator pattern, citation format, and cross-reference notation
- `src/content/docs/solo-guide/when-things-go-wrong.mdx` — reference for the quick-lookup table pattern and `---` separator usage
- `src/content/docs/solo-guide/daily-mix.mdx` — reference for H2 section structure without Phase N: numbering (brownfield isn't a walkthrough with ordered phases — it's topical sections)

### Build Order

Single task: write the full content of `brownfield.mdx`. No dependencies within the slice — S01 already created the file with valid frontmatter and the sidebar entry exists.

### Verification Approach

1. `npm run build 2>&1 | grep "pages"` — still 113 pages (no new pages added, just content replacement)
2. `npm run build 2>&1 | grep -A5 "solo-guide"` — no MDX parse errors
3. `wc -l src/content/docs/solo-guide/brownfield.mdx` — should be >100 lines
4. `npm run check-links` — exits 0 (all cross-references valid)
5. Grep for Australian spelling patterns: `behaviour`, `recognise`, `organisation` where applicable; no American spellings like `behavior`, `recognize`

## Constraints

- **Scope boundary with S07 (context-engineering):** Brownfield introduces agent-instructions.md and KNOWLEDGE.md only in the context of "what to put in them when onboarding an existing project." The mechanics of how they work, the context pipeline, and ongoing maintenance are S07's territory. Cross-reference forward to `../context-engineering/` for depth.
- **Scope boundary with S04 (first-project):** First-project covers starting from an empty directory. Brownfield covers starting from an existing codebase. The intro should acknowledge the reader may have read Section 2 and explain how brownfield differs.
- **No MDX curly-brace issues expected** — brownfield content describes workflow, not template syntax. But if any `{{variable}}` literals appear (e.g. quoting GSD prompt syntax), they must be wrapped in backticks per KNOWLEDGE.md.
- **Cross-reference links use `../../page/` format** — confirmed by existing sections. Links to sibling solo-guide pages use `../slug/`.

## Common Pitfalls

- **Over-explaining agent-instructions.md** — the temptation is to document the full format and mechanics, but that's S07's job. Brownfield should show *what a brownfield project's agent-instructions looks like* (2-3 example lines), then link to context-engineering for the full picture.
- **Making it too abstract** — R065 says "most solo builders aren't starting from zero." The content should use a concrete scenario (e.g., a half-built SaaS with a messy database and a pile of GitHub issues) rather than generic advice.

## Cross-References to Include

The following gsd2-guide pages should be linked from brownfield content using `→ gsd2-guide:` notation:

| Target Page | Link Format | What it covers |
|-------------|-------------|----------------|
| Discussing a Milestone | `../../user-guide/discussing-a-milestone/` | How discussion works (brownfield uses this with existing code) |
| Configuration | `../../configuration/` | Where agent-instructions.md and project prefs live |
| /gsd knowledge | `../../commands/knowledge/` | Adding rules/patterns/lessons to KNOWLEDGE.md |
| /gsd capture | `../../commands/capture/` | Capturing thoughts during first exploration |
| Fix a Bug recipe | `../../recipes/fix-a-bug/` | Using the full lifecycle on existing bugs |
| Section 2: First Project | `../first-project/` | Sibling cross-reference for the greenfield path |
| Section 5: Context Engineering | `../context-engineering/` | Forward reference for agent-instructions.md depth |
| Section 4: Daily Mix | `../daily-mix/` | Forward reference for ongoing workflow after onboarding |
