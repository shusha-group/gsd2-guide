---
id: T01
parent: S02
milestone: M001
provides:
  - Running Astro 6 + Starlight 0.38 project with dev server and production build
  - Content collection definition with docsLoader/docsSchema
  - Minimal splash landing page at index
  - Mermaid plugin installed (verified in T04)
key_files:
  - astro.config.mjs
  - src/content.config.ts
  - src/content/docs/index.mdx
  - tsconfig.json
  - package.json
key_decisions:
  - "D016: npm override for @astrojs/internal-helpers@0.8.0 to resolve version conflict with starlight-client-mermaid"
patterns_established:
  - Astro config uses site + base for GitHub Pages at gsd-build.github.io/gsd2-guide
  - Content collection uses Starlight's docsLoader + docsSchema pattern
  - npm overrides used to resolve transitive dependency conflicts
observability_surfaces:
  - "npm run dev — starts dev server, emits localhost URL to stdout"
  - "npm run build — exit 0 with dist/ output, non-zero with stderr errors"
  - "test -d dist && find dist -name '*.html' | wc -l — confirms build output"
duration: ~8min
verification_result: passed
completed_at: 2026-03-17
blocker_discovered: false
---

# T01: Initialize Astro + Starlight with Minimal Running Dev Server

**Bootstrapped Astro 6.0.5 + Starlight 0.38.1 with Mermaid plugin, content collection, and working dev/build scripts.**

## What Happened

Installed Astro 6, Starlight 0.38, `@pasqal-io/starlight-client-mermaid`, and `sharp` into the existing repo. Created `astro.config.mjs` (Starlight integration with site/base for GitHub Pages, Mermaid plugin, minimal sidebar), `src/content.config.ts` (docsLoader + docsSchema), `src/content/docs/index.mdx` (splash template with hero), and `tsconfig.json` (Astro strict preset).

Hit a build-breaking version conflict: `@pasqal-io/starlight-client-mermaid@0.1.0` pulls `@astrojs/internal-helpers@0.7.6` via its `@astrojs/markdown-remark@6.x` dep, but Astro 6 needs 0.8.0 (for `collapseDuplicateLeadingSlashes`). npm hoisted 0.7.6, breaking the build. Fixed with `"overrides": { "@astrojs/internal-helpers": "0.8.0" }` in package.json (D016).

Updated `.gitignore` to include `.astro/` cache directory (`dist/` was already present). Added `dev`, `build`, and `preview` scripts while preserving the existing `extract` script.

## Verification

- `npm run build` — exit 0, completed in 4.6s, produced 2 pages
- `test -d dist` — PASS
- `find dist -name "*.html" | head -5` — `dist/index.html`, `dist/404.html`
- `test -f dist/sitemap-index.xml` — PASS
- `test -d dist/pagefind` — PASS
- `npm run dev` — started on localhost:4321, HTTP 200 on `/gsd2-guide/`
- Browser visual: Starlight splash page renders with "GSD 2" hero, search bar, theme selector
- Only network error: missing favicon.svg (expected for fresh project)

### Slice-Level Verification (T01 — intermediate)

| Check | Status | Notes |
|---|---|---|
| `npm run dev` starts | ✅ PASS | localhost:4321 |
| `npm run build` completes | ✅ PASS | exit 0 |
| `prebuild.mjs` runs | ⬜ N/A | T03 |
| HTML count > 10 | ⬜ Partial | 2 pages (index + 404), will grow in T03/T04 |
| sitemap exists | ✅ PASS | |
| Dark theme | ⬜ N/A | T02 |
| Mermaid SVG | ⬜ N/A | T04 |
| Pagefind index | ✅ PASS | |

## Diagnostics

- `npm run dev` emits startup URL to stdout — watch for `Local http://localhost:` as readiness signal
- `npm run build` emits build timing and page count to stdout, errors to stderr
- `.astro/` is build cache — delete to resolve stale-cache issues
- Content collection errors surface at build time in stderr with file path detail

## Deviations

- Added `"overrides": { "@astrojs/internal-helpers": "0.8.0" }` to package.json — not in original plan but required to fix transitive dependency conflict (D016)

## Known Issues

- Missing `favicon.svg` — causes 404 in dev server. Not a blocker; will be addressed when custom design is applied in T02.

## Files Created/Modified

- `astro.config.mjs` — Starlight config with site/base, Mermaid plugin, minimal sidebar
- `src/content.config.ts` — Content collection definition (docsLoader + docsSchema)
- `src/content/docs/index.mdx` — Minimal splash landing page with hero
- `tsconfig.json` — TypeScript config extending Astro strict preset
- `package.json` — Added Astro/Starlight deps, dev/build/preview scripts, npm override
- `.gitignore` — Added `.astro/` entry
- `.gsd/milestones/M001/slices/S02/S02-PLAN.md` — Added Observability / Diagnostics section
- `.gsd/milestones/M001/slices/S02/tasks/T01-PLAN.md` — Added Observability Impact section
- `.gsd/KNOWLEDGE.md` — Added npm override gotcha entry
