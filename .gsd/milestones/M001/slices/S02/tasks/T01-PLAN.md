---
estimated_steps: 7
estimated_files: 6
---

# T01: Initialize Astro + Starlight with Minimal Running Dev Server

**Slice:** S02 — Astro site scaffold with custom design
**Milestone:** M001

## Description

Bootstrap the Astro 6 + Starlight 0.38 project into the existing repository. The repo already has a `package.json` with S01 extraction dependencies (`gray-matter`, `tar`) and scripts. This task adds Astro/Starlight as dependencies, creates the required config files and directory structure, and verifies the dev server starts. Does NOT apply custom design — that's T02.

The Mermaid plugin (`@pasqal-io/starlight-client-mermaid`) is installed here but verified in T04 with actual Mermaid content.

## Steps

1. **Install dependencies.** Run:
   ```bash
   npm install astro@^6.0 @astrojs/starlight@^0.38 @pasqal-io/starlight-client-mermaid sharp
   ```
   `sharp` is required by Astro for image optimization.

2. **Create `tsconfig.json`** extending Astro's strict preset:
   ```json
   {
     "extends": "astro/tsconfigs/strict",
     "compilerOptions": {
       "jsx": "preserve"
     }
   }
   ```

3. **Create `astro.config.mjs`** with Starlight integration:
   ```js
   import { defineConfig } from 'astro/config';
   import starlight from '@astrojs/starlight';
   import starlightClientMermaid from '@pasqal-io/starlight-client-mermaid';

   export default defineConfig({
     site: 'https://gsd-build.github.io',
     base: '/gsd2-guide',
     integrations: [
       starlight({
         title: 'GSD 2',
         plugins: [starlightClientMermaid()],
         sidebar: [
           { label: 'Home', link: '/' },
         ],
       }),
     ],
   });
   ```

4. **Create `src/content.config.ts`** with the content collection definition:
   ```ts
   import { defineCollection } from 'astro:content';
   import { docsLoader } from '@astrojs/starlight/loaders';
   import { docsSchema } from '@astrojs/starlight/schema';

   export const collections = {
     docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
   };
   ```

5. **Create `src/content/docs/index.mdx`** — minimal landing page:
   ```mdx
   ---
   title: GSD 2 Documentation
   description: The definitive documentation for GSD 2 — commands, skills, extensions, agents, and architecture.
   template: splash
   hero:
     title: GSD 2
     tagline: Build software with autonomous AI agents
   ---

   Welcome to the GSD 2 documentation site.
   ```

6. **Update `package.json` scripts** — add `dev`, `build`, and `preview`:
   ```json
   "dev": "astro dev",
   "build": "astro build",
   "preview": "astro preview"
   ```
   Keep the existing `"extract"` script.

7. **Update `.gitignore`** — add Astro build artifacts:
   ```
   .astro/
   dist/
   ```
   Note: `dist/` may already be there. `.astro/` is Astro's build cache directory.

## Must-Haves

- [ ] Astro 6.x and Starlight 0.38.x installed as dependencies
- [ ] `@pasqal-io/starlight-client-mermaid` installed
- [ ] `astro.config.mjs` exists with Starlight integration, site/base for GitHub Pages, and Mermaid plugin
- [ ] `src/content.config.ts` exists with docsLoader/docsSchema
- [ ] `src/content/docs/index.mdx` exists and has valid frontmatter
- [ ] `npm run dev` starts and serves on localhost without errors
- [ ] `npm run build` produces `dist/` directory without errors

## Verification

- `npm run build` completes with exit code 0
- `test -d dist` passes
- `find dist -name "*.html" | head -5` shows at least one HTML file
- `npm run dev` starts dev server (start it, check it responds, then stop it)

## Observability Impact

- **New signals:** `npm run dev` / `npm run build` / `npm run preview` scripts become available. Dev server emits startup URL to stdout. Build emits file counts and timing to stdout, errors to stderr.
- **Inspection surfaces:** `test -d dist` confirms build output exists. `find dist -name "*.html" | wc -l` counts rendered pages. `cat dist/index.html | head` confirms content renders.
- **Failure visibility:** Build failures surface in stderr with file path + error. Missing content collection files produce explicit "collection not found" errors. Invalid frontmatter produces schema validation errors with field-level detail.
- **Cache:** `.astro/` directory is Astro's build cache. Delete it to resolve stale-cache issues: `rm -rf .astro`.

## Inputs

- `package.json` — existing project config with S01 deps and `extract` script (must preserve)
- `.gitignore` — existing ignores (must append, not overwrite)

## Expected Output

- `astro.config.mjs` — Starlight config with site/base, Mermaid plugin, minimal sidebar
- `src/content.config.ts` — Content collection definition
- `src/content/docs/index.mdx` — Minimal landing page
- `tsconfig.json` — TypeScript config extending Astro strict
- `package.json` — Updated with Astro/Starlight deps and dev/build/preview scripts
- `.gitignore` — Updated with `.astro/` entry
- `dist/` — Build output (gitignored but proves the build works)
