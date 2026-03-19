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

## Generated pages — edit source in content/generated/docs/, not src/content/docs/

**Context:** Editing markdown content pages that are managed by the prebuild script.

Files listed in `src/content/docs/.generated-manifest.json` are overwritten by `scripts/prebuild.mjs` on every `npm run build` (and `npm run dev`). Edits to `src/content/docs/commands.md` (or any other generated file) will be silently lost. Always edit the source at `content/generated/docs/<same-path>` instead. Hand-authored files (like `.mdx` pages not in the manifest) can be edited directly in `src/content/docs/`.

## gsd-pi is globally installed — don't pass pkgPath to node_modules

**Context:** Tests calling `regeneratePage()` with a `pkgPath` override.

`resolvePackagePath()` in `extract-local.mjs` validates that the path has `src/resources/`. The gsd-pi package is installed globally (via `npm i -g gsd-pi`), not in the project's `node_modules/`. Passing `pkgPath: path.join(ROOT, "node_modules/gsd-pi")` fails because that directory doesn't have `src/resources/`. Omit `pkgPath` and let `resolvePackagePath` fall back to `npm root -g` to find the global install.

## ReleaseEntry.astro commandSlugs must stay in sync with manage-pages removals

**Context:** When `manage-pages.mjs` removes a command page (e.g., `config`, `pause`), the corresponding slug entry in `src/components/ReleaseEntry.astro`'s `commandSlugs` map must also be removed. Otherwise, the component generates dead links from changelog release notes (`/gsd config` → `/commands/config/`) that fail the link checker. The `page-map.test.mjs` `COMMAND_SLUGS` array and counts must also be updated.

## claude -p subprocess can delete target files instead of rewriting them

**Context:** Running `claude -p` to regenerate documentation pages.

When `claude -p` is given instructions like "Read the current page at X, then write the updated MDX to X", it occasionally deletes the target file as part of its tool use sequence (perhaps a delete-then-create pattern where the create step fails or is interrupted). This was observed with `reference/skills.mdx` during pipeline regeneration. The workaround is to check for file existence after subprocess completion and restore from git if needed. This is a known limitation of the claude subprocess tool-use behavior, not a bug in the pipeline code.

## "update gsd-guide" is a pre-approved end-to-end workflow

**Context:** User instruction for the gsd2-guide project.

When the user says "update gsd-guide", execute the full pipeline with no confirmation prompts: `npm run update` → commit changes → push to main → verify GitHub Actions deploy succeeds. This is a standing override of the "confirm before outward-facing GitHub actions" rule for this specific project and workflow. No PR needed — push directly to main.

## Git worktree merge to main — untracked file conflicts

**Context:** Merging a worktree branch (e.g., `milestone/M004`) into main when both have `.gsd/milestones/` files.

The worktree branch tracks files in `.gsd/milestones/M004/slices/` but the main checkout may have the same paths as untracked files (created by the GSD system during planning/research). Git refuses to merge when tracked files from the branch would overwrite untracked files on main. Fix: `rm -rf .gsd/milestones/M004/slices/` on main before merging. Also stash any dirty working tree state on main first, then discard the stash after merge since the branch versions supersede main's local changes.

## MDX curly-brace escaping for template variable strings in docs pages

**Context:** Authoring MDX pages that quote GSD prompt template syntax (e.g. `"Milestone {{milestoneId}} ready."`).

MDX treats `{expression}` as a JSX expression at render time. Double curly braces `{{foo}}` become `{foo}` after one level of escaping, which MDX still interprets as a JSX variable — causing a build-time `ReferenceError: foo is not defined`.

**Fix:** Wrap any `{{variable}}` literal in backticks so it renders as code: `` `{milestoneId}` `` or `` `"Milestone {milestoneId} ready."` ``. Alternatively use HTML entities `>/dev/null 2>&1 &#123;>/dev/null 2>&1 &#123;variable>/dev/null 2>&1 &#125;>/dev/null 2>&1 &#125;` for inline prose, though backtick wrapping is cleaner and more readable.

**Detection:** The error surfaces at `npm run build` time, not at MDX parse time, so the file passes lint/type checks. Look for `ReferenceError: X is not defined` in build output with a `.mjs` prerender chunk stack trace.
