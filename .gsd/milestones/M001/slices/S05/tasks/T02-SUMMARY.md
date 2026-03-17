---
id: T02
parent: S05
milestone: M001
provides:
  - Header version badge showing real latest release version (v2.22.0) from releases.json
  - Sidebar Changelog navigation entry
  - Home page Changelog LinkCard in Deep-Dive Guides section
  - Version badge links to /gsd2-guide/changelog/
key_files:
  - src/components/Header.astro
  - astro.config.mjs
  - src/content/docs/index.mdx
key_decisions:
  - Made version badge a clickable anchor linking to changelog (was a non-interactive div with pointer-events:none)
patterns_established:
  - Header.astro imports generated JSON data at build time — same pattern can be used for other generated content needing header display
observability_surfaces:
  - "grep 'v2.22.0' dist/index.html — confirms header wiring from releases.json"
  - "grep -c 'v0.0.0' dist/index.html — returns 0 confirms placeholder elimination"
  - "grep -i 'changelog' dist/index.html — confirms sidebar and home page links"
duration: 8m
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T02: Wire header version badge and add changelog navigation links

**Replaced hardcoded v0.0.0 header badge with live v2.22.0 from releases.json, added Changelog to sidebar and home page cards.**

## What Happened

Three files edited:

1. **Header.astro** — Added `import releases from '../../content/generated/releases.json'` and extracted `releases[0]?.tag_name ?? 'v0.0.0'` as the version. Changed the badge from a non-interactive `<div>` to a clickable `<a>` linking to `/gsd2-guide/changelog/`. Removed `pointer-events: none` and `user-select: none`, added `text-decoration: none` and hover opacity transition.

2. **astro.config.mjs** — Added `{ label: 'Changelog', link: '/changelog/' }` as a top-level sidebar entry immediately after Home.

3. **index.mdx** — Added a `<LinkCard>` for Changelog in the Deep-Dive Guides CardGrid with description "Release history — what's new, fixed, and changed in each version".

## Verification

All checks passed:

- `npm run build` — exits 0, 134 pages built
- `grep 'v2.22.0' dist/index.html` — **PASS** (version badge present)
- `grep -c 'v0.0.0' dist/index.html` — **PASS** (returns 0, placeholder eliminated)
- `grep -i 'changelog' dist/index.html` — **PASS** (changelog links present on home page)
- `grep -i 'changelog' dist/changelog/index.html` — **PASS** (sidebar entry on changelog page)
- Browser visual verification — version badge "v2.22.0" visible as link, "Changelog" in sidebar after Home

Slice-level verification (all checks):
- `npm run build` succeeds — **PASS** (134 pages, was 131)
- `grep -o '<details class="release-entry"' dist/changelog/index.html | wc -l` returns 48 — **PASS**
- `grep 'v2.22.0' dist/changelog/index.html` — **PASS**
- `grep 'v0.2.9' dist/changelog/index.html` — **PASS**
- `grep 'v2.22.0' dist/index.html` — **PASS**
- `grep -c 'v0.0.0' dist/index.html` returns 0 — **PASS**
- `grep 'changelog' dist/index.html` — **PASS**

## Diagnostics

- **Version badge:** `grep 'v2.22.0' dist/index.html` — confirms real version. If absent, check Header.astro import path to `../../content/generated/releases.json`.
- **Placeholder check:** `grep -c 'v0.0.0' dist/index.html` — must return 0. Non-zero means Header.astro fallback is being used (import returned undefined).
- **Changelog navigation:** `grep -i 'changelog' dist/index.html` — confirms both sidebar entry and home page LinkCard.
- **Build failure:** Missing releases.json or malformed JSON produces a clear Astro import error, not a silent fallback.

## Deviations

- Made the version badge a clickable `<a>` tag linking to the changelog page (plan said "optionally"). Changed CSS from `pointer-events: none` to interactive link with hover opacity transition. This enhances discoverability.

## Known Issues

None.

## Files Created/Modified

- `src/components/Header.astro` — imports releases.json, displays real version, badge is now a clickable link to changelog
- `astro.config.mjs` — added Changelog top-level sidebar entry after Home
- `src/content/docs/index.mdx` — added Changelog LinkCard in Deep-Dive Guides section
- `.gsd/milestones/M001/slices/S05/tasks/T02-PLAN.md` — added Observability Impact section (pre-flight fix)
