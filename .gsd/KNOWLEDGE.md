# Knowledge Base

## gsd-pi extension tool registration patterns

**Context:** Extracting tool metadata from TypeScript extension source files.

Not all extensions use `pi.registerTool({ name: "...", description: "..." })` directly. Some (e.g., `async-jobs`) use factory functions that return `ToolDefinition` objects, then pass the result: `pi.registerTool(createAsyncBashTool(...))`. To capture these, also match `return { name: "...", description: ... }` blocks in files containing `ToolDefinition`.

Additionally, `gsd/index.ts` wraps base tools with dynamic overrides (`const dynamicBash = { ...baseBash, execute: ... }`; `pi.registerTool(dynamicBash as any)`). These inherit name/description from `createBashTool()` etc. and are NOT extractable via regex from the gsd extension source alone.

## gsd-pi extension directory structure

- 17 extension entries total (15 dirs + 2 single .ts files), excluding `shared/`
- `browser-tools` delegates tool registration to sub-files in `tools/` (47 tools across navigation.ts, screenshot.ts, interaction.ts, etc.)
- 4 extensions register 0 tools: `remote-questions`, `slash-commands`, `ttsr`, `voice` (they use commands, shortcuts, or hooks instead)
- 2 single-file extensions: `ask-user-questions.ts`, `get-secrets-from-user.ts`

## tar npm package v7 ESM import

**Context:** tar v7+ is a pure ESM package with no default export.

Use `import { extract } from "tar"` (named export), NOT `import tar from "tar"`. The latter fails with `SyntaxError: does not provide an export named 'default'`. Available named exports include: `extract`, `create`, `list`, `Pack`, `Unpack`, `Parser`, `Header`, etc.

## Astro 6 + @pasqal-io/starlight-client-mermaid npm override required

**Context:** `@pasqal-io/starlight-client-mermaid@0.1.0` depends on `@astrojs/markdown-remark@6.x` which pulls in `@astrojs/internal-helpers@0.7.6`. Astro 6 needs `@astrojs/internal-helpers@0.8.0` (has `collapseDuplicateLeadingSlashes`). npm hoists 0.7.6, breaking the build with: `The requested module '@astrojs/internal-helpers/path' does not provide an export named 'collapseDuplicateLeadingSlashes'`.

**Fix:** Add `"overrides": { "@astrojs/internal-helpers": "0.8.0" }` to `package.json` and re-run `npm install`.

## npm `prebuild` lifecycle hook — avoid double execution

**Context:** npm automatically runs a `prebuild` script (if present in `package.json`) before `npm run build`.

If `package.json` has `"prebuild": "node scripts/prebuild.mjs"` AND `"build": "node scripts/prebuild.mjs && astro build"`, the prebuild runs twice. Fix: rely on the lifecycle hook for `build` (`"build": "astro build"`) and only chain explicitly for `dev` (since `predev` is NOT a standard npm lifecycle hook).

Standard npm lifecycle hooks: `preinstall`/`postinstall`, `prebuild`/`postbuild`, `pretest`/`posttest`, `prestart`/`poststart`, `prepublishOnly`. There is no `predev`.

## Astro base path and dist directory structure

**Context:** When `base: '/gsd2-guide'` is set in `astro.config.mjs`, the `dist/` directory does NOT nest files under `dist/gsd2-guide/`. Pages live at `dist/placeholder/components/index.html`, not `dist/gsd2-guide/placeholder/components/index.html`. The base path is applied at serve/deploy time, not in the file system layout. Verification commands should always check `dist/placeholder/...` paths directly.

## Starlight available user components (v0.38)

**Context:** Components importable from `@astrojs/starlight/components` for use in MDX content pages.

Available: `Card`, `CardGrid`, `LinkCard`, `Badge`, `Tabs`, `TabItem`, `Steps`, `FileTree`, `Icon`, `LinkButton`. Aside/callout syntax uses `:::note`, `:::tip`, `:::caution`, `:::danger` directives (not imported components).

## Starlight component override pattern

**Context:** Overriding Starlight's built-in Header/Footer components.

Import the default from `@astrojs/starlight/components/Header.astro`, wrap it with `<Default {...Astro.props}><slot /></Default>`, then add custom markup around it. Register in `astro.config.mjs` under `starlight({ components: { Header: './src/components/Header.astro' } })`. The path must be relative to the project root with `./` prefix.

## grep -c vs grep -o for counting occurrences in minified HTML

**Context:** Verifying element counts in Astro build output.

`grep -c` counts the number of *lines* containing a match, not the number of occurrences. Astro's minified HTML often puts many elements on a single line, so `grep -c '<details'` may return 3 when there are actually 51 `<details` elements. Use `grep -o '<details' file.html | wc -l` to count actual occurrences. This applies to all element counting in `dist/` output.

## Starlight internal link format — always use ../ prefix

**Context:** Rewriting markdown `.md` links for Starlight compatibility.

Starlight renders each `.md` page as `/page/index.html`. This means a page at `/getting-started/index.html` linking to `/auto-mode/index.html` needs `](../auto-mode/)` — the `../` goes up from the page's own directory. This applies to ALL pages regardless of their nesting depth: root pages, subdirectory pages, and index pages all use `../sibling/` to link to siblings. README.md link targets should become directory paths (`./subdir/README.md` → `../subdir/`), not `../subdir/index/`. Hash fragments go AFTER the trailing slash: `](../file/#section)` not `](../file#section)`.

## Starlight adds its own `<details>` elements to build output

**Context:** Counting `<details>` elements in dist/ HTML for verification.

Starlight's sidebar sections use `<details>` for collapsible groups. A page with 48 custom `<details class="release-entry">` elements will show ~58 total `<details>` elements in `grep -o '<details'` output. Always scope the grep with the class name: `grep -o '<details class="release-entry"'` to get accurate counts of your own components.
