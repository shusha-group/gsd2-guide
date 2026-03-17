# S03: New/Removed Command Handling — UAT

**Milestone:** M003
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All verification runs against test fixtures and mock LLM clients. No live API calls or runtime servers needed. The module is pure ESM with filesystem operations verified in temp directories.

## Preconditions

- Node.js 20+ installed
- Working directory is the `gsd2-guide` project root
- `content/generated/commands.json`, `content/generated/page-source-map.json`, and `content/generated/manifest.json` exist (from S01 extraction)
- `astro.config.mjs` has the existing sidebar configuration with "Keyboard Shortcuts" entry in the Commands section

## Smoke Test

```bash
node --test tests/manage-pages.test.mjs
```
Expected: 31/31 tests pass, 0 failures.

## Test Cases

### 1. Module exports match S03→S04 boundary contract

1. Run: `node -e "import('./scripts/lib/manage-pages.mjs').then(m => console.log(Object.keys(m).sort().join(', ')))"`
2. **Expected:** Output contains exactly: `addSidebarEntry, addToPageMap, createNewPages, detectNewAndRemovedCommands, removeFromPageMap, removePages, removeSidebarEntry`

### 2. Detection identifies new commands correctly

1. Run the test suite: `node --test --test-name-pattern "detects a new command" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — a command in commands.json without a matching .mdx file appears in `newCommands` array.

### 3. Detection identifies removed commands correctly

1. Run the test suite: `node --test --test-name-pattern "detects a removed command" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — an .mdx file without a matching command in commands.json appears in `removedCommands` array.

### 4. Detection filters out non-command entries

1. Run: `node --test --test-name-pattern "filters" tests/manage-pages.test.mjs`
2. **Expected:** All filter tests pass — subcommands with arguments (`/gsd auto start`), non-gsd commands (`/plan`), keyboard shortcuts (`Cmd+G`), and CLI flags (`--verbose`) are excluded from detection.

### 5. Non-command pages never flagged for removal

1. Run: `node --test --test-name-pattern "never flags non-command" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — `keyboard-shortcuts.mdx`, `cli-flags.mdx`, and `headless.mdx` are protected even if they have no matching commands.json entry.

### 6. Sidebar entry added at correct position

1. Run: `node --test --test-name-pattern "inserts a line before" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — new entry appears immediately before the "Keyboard Shortcuts" line in astro.config.mjs.

### 7. Sidebar entry removed by link pattern

1. Run: `node --test --test-name-pattern "removes the /gsd auto line" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — the line containing `/commands/auto/` link is removed, all other lines preserved.

### 8. createNewPages with mock LLM creates page + updates sidebar + updates map

1. Run: `node --test --test-name-pattern "creates a page, updates sidebar and map" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — mock client called with correct args, .mdx file created in commands directory, sidebar entry added, page-source-map.json entry created with algorithmic deps.

### 9. removePages deletes file + cleans sidebar + cleans map

1. Run: `node --test --test-name-pattern "deletes file, removes sidebar" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — .mdx file deleted, sidebar entry removed, page-source-map.json entry removed.

### 10. Graceful degradation without API key

1. Run: `node --test --test-name-pattern "skip result when no API key" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — createNewPages returns skip result with `skipped > 0`, no files written, no sidebar/map changes.

### 11. Full round-trip integration test

1. Run: `node --test --test-name-pattern "detect → create" tests/manage-pages.test.mjs`
2. **Expected:** Test passes — detects new command → creates with mock client → verifies page+sidebar+map → removes command from JSON → detects as removed → removes → verifies clean state.

### 12. CLI detect-only mode against real data

1. Run: `node scripts/lib/manage-pages.mjs`
2. **Expected:** Prints detection results showing `config` and `pause` as removed commands (genuine orphans). No files modified.

### 13. CLI dry-run mode

1. Run: `node scripts/lib/manage-pages.mjs --dry-run`
2. **Expected:** Prints "DRY RUN" header, lists what would be removed (`config`, `pause`). No files modified.

## Edge Cases

### Excluded slugs

1. Run: `node --test --test-name-pattern "excludes /gsd help" tests/manage-pages.test.mjs`
2. **Expected:** `/gsd help` never appears in newCommands even if no help.mdx exists.

### Bare /gsd command mapping

1. Run: `node --test --test-name-pattern "maps the bare /gsd command" tests/manage-pages.test.mjs`
2. **Expected:** The bare `/gsd` command maps to slug `gsd`, not an empty string.

### Missing file during removal

1. Run: `node --test --test-name-pattern "handles missing file gracefully" tests/manage-pages.test.mjs`
2. **Expected:** removePages succeeds even when .mdx file doesn't exist — still cleans sidebar and map entries.

### Nonexistent sidebar/map entries

1. Run: `node --test --test-name-pattern "nonexistent" tests/manage-pages.test.mjs`
2. **Expected:** Both removeSidebarEntry and removeFromPageMap return `{ removed: false, reason: 'not found' }` without throwing.

## Failure Signals

- Any test in `tests/manage-pages.test.mjs` failing (especially the round-trip integration test)
- CLI modes printing errors or stack traces
- Module import failing or missing expected exports
- Sidebar entry appearing at wrong position (not before "Keyboard Shortcuts")
- Non-command pages (keyboard-shortcuts, cli-flags, headless) appearing in removedCommands
- createNewPages writing sidebar/map entries when regeneration was skipped or failed

## Requirements Proved By This UAT

- R040 — Test cases 2, 8, 11 prove new command detection and page generation with sidebar/map updates
- R041 — Test cases 3, 5, 9, 11 prove removed command detection, file deletion, and metadata cleanup
- R044 — Test cases 6, 7, 8, 9 prove sidebar entry addition at correct position and removal by link pattern

## Not Proven By This UAT

- Live Claude API regeneration for new commands (uses mock client — real API quality proven in S02)
- Build success after page addition/removal (S04 integration testing)
- Cross-reference link cleanup in other pages when a command is removed
- Full `npm run update` pipeline integration (S04 scope)

## Notes for Tester

- `config` and `pause` appearing as "removed commands" in CLI mode is correct behavior — they are genuine orphans where the .mdx page exists but no matching `/gsd <slug>` command exists in commands.json.
- The test suite uses temp directories for all file operations, so running tests never modifies real project files.
- The `createNewPages` integration tests use a mock Anthropic client — they do NOT make real API calls or cost anything.
