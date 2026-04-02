# S01 Research: Homepage Nav Fix

## Summary

The homepage nav bug described in R084 ("homepage shows a stale/different sidebar to every other page") appears to be **already fixed**. Quick task 6 switched `index.mdx` from `template: splash` to `template: doc`, which restored the full sidebar. Structural analysis of the current build confirms the sidebars are identical.

## Recommendation

Verify the fix is complete, validate R084, and close this slice. The work is a verification task, not an implementation task.

## Implementation Landscape

### Current State
- `src/content/docs/index.mdx` uses `template: doc` (line 4) with a `hero:` frontmatter block
- Starlight renders `hasSidebar: true` for `template: doc` pages
- The homepage gets `data-has-hero` attribute (cosmetic, no CSS references it)
- Build output: both `dist/index.html` and `dist/getting-started/index.html` have identical sidebar HTML (38,859 chars each, 138 links, 20 `<details>` groups)
- The only diff between the two sidebar outputs is `aria-current="page"` on the homepage's own link — correct behaviour

### Root Cause (Already Resolved)
- The original bug was caused by `template: splash`, which sets `hasSidebar: false` in Starlight's routing (`node_modules/@astrojs/starlight/utils/routing/data.ts`)
- Quick task 6 (`.gsd/quick/6-the-version-chip-is-now-missing-and-on-t/6-SUMMARY.md`) switched to `template: doc`, restoring the sidebar
- No custom CSS targets the homepage sidebar differently (`src/styles/custom.css` has sidebar color overrides but nothing homepage-specific)
- No nav overrides exist in `index.mdx` — sidebar is purely from `astro.config.mjs`

### Key Files
| File | Role |
|------|------|
| `src/content/docs/index.mdx` | Homepage — `template: doc` with hero frontmatter |
| `astro.config.mjs` (line 20+) | Sidebar configuration, 262 lines |
| `src/styles/custom.css` | Custom theme styles, no homepage-specific sidebar rules |
| `src/components/Header.astro` | Custom header wrapper, no sidebar interference |

### Verification Plan
1. `npm run build` — exits 0, 148 pages built
2. Diff sidebar HTML between `dist/index.html` and any inner page — must be identical (excluding `aria-current`)
3. `npm run check-links` — 0 broken links
4. Visual check (optional): homepage sidebar visually matches inner page sidebar

### Risks
- **None identified.** The fix is already in place. This slice is verification-only.

## Requirement Coverage

| Req | Status | Finding |
|-----|--------|---------|
| R084 | Likely already satisfied | Homepage sidebar HTML matches inner pages exactly. `template: doc` ensures sidebar renders. |

## Skills Discovered

No new skills needed — this is Starlight/Astro config verification using established project patterns.
