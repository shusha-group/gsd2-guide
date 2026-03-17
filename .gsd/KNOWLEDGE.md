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
