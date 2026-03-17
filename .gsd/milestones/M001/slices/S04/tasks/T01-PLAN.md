---
estimated_steps: 6
estimated_files: 1
---

# T01: Enhance prebuild with link rewriting and README→index renaming

**Slice:** S04 — Deep-dive documentation pages
**Milestone:** M001

## Description

The 126 extracted doc files have two structural problems that make them unusable in Starlight: (1) all internal links use `./page.md` format but Starlight routes pages as `/page/` — every relative `.md` link 404s, and (2) README.md files in subdirectories render as `/subdir/readme/` instead of section index pages.

The prebuild script (`scripts/prebuild.mjs`) is the sole transformation point between S01's extracted content and Starlight's content directory. This task adds link rewriting and README→index renaming to the existing frontmatter injection pipeline.

**Relevant skill:** None required — this is Node.js script enhancement work.

## Steps

1. **Add link rewriting to `processMarkdown` function** in `scripts/prebuild.mjs`. After frontmatter injection (existing logic), apply link transformations to the body content. The rewrite function must:
   - Match only markdown link syntax `](path.md)` and `](path.md#fragment)` — NOT occurrences of `.md` inside code blocks or inline code
   - Handle these patterns:
     - `](./file.md)` → `](../file/)` (root-level docs linking to siblings — after prebuild they're at `/file/` and need to go up one level)
     - `](./file.md#section)` → `](../file/#section)` (with hash fragments — trailing slash BEFORE hash)
     - `](file.md)` → `](../file/)` (bare references without `./` prefix, same behavior)
     - `](file.md#section)` → `](../file/#section)` (bare with hash)
     - For files inside subdirectories linking to siblings: `](./NN-page.md)` → `](../NN-page/)` (same pattern — always `../` because Starlight renders each page as `/page/index.html`)
   - Special cases for README links:
     - `](./subdir/README.md)` → `](../subdir/)` (cross-directory README links become directory index)
     - `](./README.md)` within a subdirectory → `](../)` or `](./)` (link to own directory index)
   - Leave external links (http/https) untouched
   - Leave the dead `](../native/README.md)` link as-is (content doesn't exist — only appears once in root README which is skipped anyway)
   - **Implementation approach:** Use a regex that matches `](` followed by a relative path ending in `.md` optionally followed by `#fragment` and `)`. Process the content line-by-line, skipping lines that are inside fenced code blocks (track ``` state). For inline code, the regex approach is safe since inline code uses backticks around the content, not markdown link syntax.

2. **Add a `rewriteLinks` function** that takes file content and the file's relative path (to determine if it's root-level or in a subdirectory). The function should:
   - Track fenced code block state (lines starting with ```) to skip those regions
   - Use regex: `/\]\((?!https?:\/\/|#)(\.\/|)([^)#]+?)\.md(#[^)]+)?\)/g`
   - For each match, determine the rewritten path based on whether the matched filename is `README.md` (→ directory path) or a regular file (→ `../filename/`)
   - Reconstruct the link as `](rewritten-path#fragment)` with trailing slash before any hash

3. **Add README→index renaming logic.** In the main file processing loop, when the source file is a `README.md` in a subdirectory (not the root-level `content/generated/docs/README.md`):
   - Change the target filename from `README.md` to `index.md`
   - In the frontmatter injection, add `sidebar:\n  order: 0` so the index page sorts before numbered pages like `01-work-decomposition.md`
   - The existing `processMarkdown` function extracts `# Heading` as the title — this still works for README files

4. **Skip root-level README.md entirely.** The root `content/generated/docs/README.md` is a table of links to all other docs — it's the GitHub repo's index page. It must NOT be copied to `src/content/docs/` because `index.mdx` (the hand-authored splash page) already exists there. Add a check: if `relPath === 'README.md'`, skip the file and log a message.

5. **Apply link rewriting AFTER frontmatter injection.** The `processMarkdown` function currently returns content with frontmatter prepended. Call `rewriteLinks(content, relPath)` on the body portion before prepending frontmatter, or on the full result (the YAML frontmatter won't match the link regex anyway).

6. **Test the changes manually.** Run `node scripts/prebuild.mjs` and verify:
   - Check file count logged is 125 (126 minus skipped root README)
   - Check `src/content/docs/building-coding-agents/index.md` exists and has `sidebar:\n  order: 0` in frontmatter
   - Check `src/content/docs/getting-started.md` contains `](../auto-mode/)` not `](./auto-mode.md)`
   - Check `src/content/docs/auto-mode.md` contains `](../git-strategy/)` and `](../token-optimization/#` (with trailing slash before hash)
   - Check `src/content/docs/building-coding-agents/index.md` contains `](../01-work-decomposition/)` not `](./01-work-decomposition.md)`
   - Check that NO file named `src/content/docs/README.md` exists (root README skipped)
   - Check `src/content/docs/configuration.md` for the `./token-optimization.md#complexity-based-task-routing` link rewritten correctly
   - Check that `src/content/docs/what-is-pi/09-the-customization-stack.md` external link `(https://agentskills.io)` is untouched

## Must-Haves

- [ ] All `](./file.md)` and `](file.md)` patterns rewritten to `](../file/)` format
- [ ] Hash fragment links include trailing slash before hash: `](../file/#section)`
- [ ] README.md in subdirectories renamed to index.md with `sidebar: { order: 0 }` frontmatter
- [ ] Root-level README.md is skipped (not copied to src/content/docs/)
- [ ] Links inside fenced code blocks are NOT rewritten
- [ ] External links (http/https) are NOT rewritten
- [ ] README.md link targets rewritten to directory paths (e.g., `./what-is-pi/README.md` → `../what-is-pi/`)
- [ ] Prebuild exits 0 with 125 files processed

## Verification

- `node scripts/prebuild.mjs` exits 0 and logs "125 files processed"
- `test -f src/content/docs/building-coding-agents/index.md && echo "PASS"` — README became index
- `grep -c 'order: 0' src/content/docs/building-coding-agents/index.md` returns 1
- `grep 'auto-mode' src/content/docs/getting-started.md` shows `](../auto-mode/)` not `](./auto-mode.md)`
- `grep 'token-optimization' src/content/docs/configuration.md | head -1` shows `](../token-optimization/#complexity-based-task-routing)` with trailing slash before hash
- `test ! -f src/content/docs/README.md && echo "PASS"` — root README skipped
- `grep -r '\.md)' src/content/docs/ --include="*.md" | grep -v 'native/README' | grep -v 'https' | grep -v '^\`' | wc -l` returns 0 or near-0 (only the dead `../native/README.md` link should remain, in the skipped root README)
- `grep 'agentskills.io' src/content/docs/what-is-pi/09-the-customization-stack.md` still shows the external URL untouched

## Inputs

- `scripts/prebuild.mjs` — existing prebuild script with frontmatter injection logic (read current implementation before modifying)
- `content/generated/docs/` — 126 extracted markdown files (S01 output, must exist before running)
- S01 summary insight: 126 docs across 6 subdirectories + root-level files. README.md exists in root and 5 subdirectories.
- S02 summary insight: Prebuild uses `.generated-manifest.json` to track generated files. Runs before `build` via npm lifecycle hook, before `dev` via explicit chain.

## Expected Output

- `scripts/prebuild.mjs` — enhanced with `rewriteLinks()` function, README→index renaming, root README skip logic
- `src/content/docs/*/index.md` — 5 index files (from subdirectory READMEs) with `sidebar: { order: 0 }` frontmatter
- `src/content/docs/getting-started.md`, `auto-mode.md`, etc. — all internal links rewritten to Starlight format
- 125 total generated files (126 minus skipped root README)
