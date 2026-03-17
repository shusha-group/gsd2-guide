---
estimated_steps: 5
estimated_files: 5
---

# T03: Add Header/Footer Component Overrides, Prebuild Script, and Mermaid Wiring

**Slice:** S02 — Astro site scaffold with custom design
**Milestone:** M001

## Description

This task wires three integration surfaces that downstream slices consume:

1. **Header override** — Custom Header with a version display slot (S05 wires the real version number, we provide placeholder "v0.0.0")
2. **Footer override** — Custom Footer for site branding
3. **Prebuild script** — The critical content bridge between S01's `content/generated/docs/` (126 markdown files with no frontmatter) and Starlight's required `src/content/docs/` (needs YAML frontmatter with at least a `title` field)

The prebuild script is the most complex piece. S01 extracted docs start with `# Title` and have no YAML frontmatter. Starlight requires `title` in frontmatter. If both frontmatter `title` and `# Title` exist, Starlight renders a duplicate heading. So the script must: extract the first `#` heading → set as frontmatter `title` → strip it from the markdown body.

**Important constraint:** The prebuild output goes into `src/content/docs/` but placeholder pages (created in T04) also live there. The prebuild script must only write into a clear subdirectory structure that mirrors `content/generated/docs/` and must NOT overwrite files that aren't from the generated source.

## Steps

1. **Create `src/components/Header.astro`** — Override Starlight's Header component:
   ```astro
   ---
   import type { Props } from '@astrojs/starlight/props';
   import Default from '@astrojs/starlight/components/Header.astro';
   ---
   <Default {...Astro.props}><slot /></Default>
   <div class="version-badge">
     <span>v0.0.0</span>
   </div>
   <style>
     .version-badge {
       /* Style to position in the header bar — adjacent to the title or in the right side */
       /* Use theme CSS variables for colors */
     }
   </style>
   ```
   The exact layout depends on how Starlight renders the header. The version badge should be visible but not dominant. S05 will replace the hardcoded "v0.0.0" with a dynamic value read from the extracted releases data.

2. **Create `src/components/Footer.astro`** — Custom footer:
   ```astro
   ---
   import type { Props } from '@astrojs/starlight/props';
   ---
   <footer class="site-footer">
     <p>Built with <a href="https://github.com/gsd-build/gsd2-guide">GSD</a> · Powered by <a href="https://starlight.astro.build">Starlight</a></p>
   </footer>
   <style>
     .site-footer {
       /* Terminal aesthetic: tight, monospace, muted colors */
       /* Use --sl-color-* variables */
     }
   </style>
   ```

3. **Register component overrides in `astro.config.mjs`:**
   ```js
   starlight({
     // ...existing config...
     components: {
       Header: './src/components/Header.astro',
       Footer: './src/components/Footer.astro',
     },
   })
   ```

4. **Create `scripts/prebuild.mjs`** — the content bridge script:
   ```js
   // Purpose: Copy content/generated/docs/ → src/content/docs/ with frontmatter injection
   //
   // For each .md file in content/generated/docs/:
   //   1. Read the file
   //   2. Extract the first line matching /^# (.+)$/ as the title
   //   3. Strip that first heading line from the body
   //   4. Prepend YAML frontmatter: ---\ntitle: "Extracted Title"\n---\n
   //   5. Write to src/content/docs/ preserving the relative directory structure
   //
   // Edge cases:
   //   - Files with no # heading: use the filename (sans extension, kebab-to-title-case) as title
   //   - Files that already have frontmatter (--- at line 1): skip injection, just copy
   //   - Create subdirectories (building-coding-agents/, context-and-hooks/, etc.) as needed
   //   - Clean the target directory of previously-generated files before copying (but don't delete placeholder/ dir)
   //
   // The script uses only Node.js built-ins (fs, path) — no dependencies needed.
   ```
   
   Key implementation details:
   - Use `fs.readdir` recursive to find all `.md` files in `content/generated/docs/`
   - Target directory: `src/content/docs/` — mirror the source structure
   - Before writing, remove previously generated files (track via a `.generated-manifest.json` in `src/content/docs/` listing files the prebuild created — so we only delete our own files, not placeholder pages)
   - Title extraction: first match of `/^#\s+(.+)$/m` — use captured group as title
   - Frontmatter template: `---\ntitle: "${title}"\n---\n\n` + remaining body
   - Handle special characters in titles (escape quotes in YAML)

5. **Update `package.json` scripts** to run prebuild before dev/build:
   ```json
   "prebuild": "node scripts/prebuild.mjs",
   "dev": "node scripts/prebuild.mjs && astro dev",
   "build": "node scripts/prebuild.mjs && astro build"
   ```

## Must-Haves

- [ ] `src/components/Header.astro` extends default Header and adds visible version badge
- [ ] `src/components/Footer.astro` renders custom footer content
- [ ] Both components registered in `astro.config.mjs` under `components`
- [ ] `scripts/prebuild.mjs` copies all 126 docs from `content/generated/docs/` to `src/content/docs/`
- [ ] Prebuild injects YAML frontmatter with `title` extracted from the first `#` heading
- [ ] Prebuild strips the first `#` heading from the body to prevent duplicate rendering
- [ ] Prebuild preserves subdirectory structure (building-coding-agents/, extending-pi/, etc.)
- [ ] Prebuild does NOT delete non-generated files (placeholder pages from T04)
- [ ] `npm run dev` works with prebuild wired in
- [ ] `npm run build` succeeds with all prebuild content

## Verification

- `node scripts/prebuild.mjs` completes without errors
- `find src/content/docs/ -name "*.md" | wc -l` returns ≥ 126 (generated docs present)
- `head -5 src/content/docs/getting-started.md` shows YAML frontmatter with title
- `grep -c "^# " src/content/docs/getting-started.md` returns 0 (first heading stripped) or heading count minus 1 vs original
- `npm run build` succeeds with the generated content pages
- Header shows version badge text on dev server
- Footer shows custom content on dev server

## Observability Impact

- **Prebuild script stdout:** `node scripts/prebuild.mjs` logs the count of files processed and any skipped/error files. Success: `Prebuild complete: N files processed`. Failure: non-zero exit code with error message to stderr.
- **Generated manifest:** `src/content/docs/.generated-manifest.json` lists every file the prebuild created — inspect this to verify coverage and diagnose missing pages.
- **Content collection errors:** Astro surfaces frontmatter validation errors at build time in stderr with file path + line detail. If prebuild injects malformed YAML, these errors will pinpoint the file.
- **Header version badge:** Visible in browser at top of every page — "v0.0.0" placeholder. Absence means component override registration failed in `astro.config.mjs`.
- **Footer branding:** Visible at bottom of every page. Absence means Footer override not registered.
- **Duplicate heading detection:** If a page shows two identical `<h1>` elements, the prebuild failed to strip the `#` heading from that file's body.

## Inputs

- `astro.config.mjs` — from T02 (add `components` config)
- `content/generated/docs/` — S01 output (126 markdown files, no frontmatter, organized in subdirectories)
- Working Astro/Starlight site from T01 + T02

## Expected Output

- `src/components/Header.astro` — Custom header with version display slot
- `src/components/Footer.astro` — Custom footer with site branding
- `scripts/prebuild.mjs` — Content bridge script
- `src/content/docs/*.md` — Generated content files with injected frontmatter (gitignored)
- `astro.config.mjs` — Updated with component overrides
- `package.json` — Updated scripts with prebuild step
