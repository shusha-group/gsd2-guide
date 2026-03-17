---
estimated_steps: 4
estimated_files: 1
---

# T03: Update commands landing page and final verification

**Slice:** S02 — Command deep-dives — session and execution commands
**Milestone:** M002

## Description

Update the existing commands reference page (`src/content/docs/commands.md`) to link each of the 9 session/execution commands to their new deep-dive pages. Run the full verification suite to confirm the slice is complete: build succeeds, all links resolve, Pagefind indexes the new pages, page count increases to 36.

## Steps

1. **Read `src/content/docs/commands.md`** to understand the current table structure.

2. **Update the commands reference tables** to add deep-dive links. For each command that now has a deep-dive page, add a link in the command name column. The 9 commands with deep-dives are: `/gsd`, `/gsd auto`, `/gsd stop`, `/gsd pause`, `/gsd next`, `/gsd quick`, `/gsd discuss`, `/gsd status`, `/gsd visualize`. The link format from `commands.md` (which renders at `/commands/`) to a deep-dive page at `/commands/auto/` is `[/gsd auto](auto/)` — the deep-dive pages are subdirectories of the commands page's URL path, so use relative links without `../`.

3. **Run `npm run build`** and verify:
   - Exit code 0
   - Build output shows 36 pages (was 27 in S01)
   - `ls dist/commands/*/index.html | wc -l` returns at least 9

4. **Run `node scripts/check-links.mjs`** and verify exit code 0. This catches any broken sidebar links, broken cross-links between command pages, and broken links from the commands landing page to deep-dives.

## Must-Haves

- [ ] Commands reference page links 9 session/execution commands to their deep-dive pages
- [ ] `npm run build` exits 0
- [ ] `node scripts/check-links.mjs` exits 0
- [ ] Build page count is 36

## Verification

- `npm run build` exits 0 with 36 pages
- `node scripts/check-links.mjs` exits 0
- `grep -c 'commands/auto\|commands/stop\|commands/pause\|commands/gsd\|commands/next\|commands/quick\|commands/discuss\|commands/status\|commands/visualize' src/content/docs/commands.md` returns 9
- `ls dist/commands/*/index.html | wc -l` ≥ 9

## Observability Impact

- **Link coverage in commands.md** — `grep -c 'commands/auto\|commands/stop\|commands/pause\|commands/gsd\|commands/next\|commands/quick\|commands/discuss\|commands/status\|commands/visualize' src/content/docs/commands.md` returns 9 confirms all deep-dive links are present. A lower count means a command was missed.
- **Build page count** — `npm run build` output shows total pages. Expect 36 (was 27 in S01). A count mismatch signals missing or broken pages.
- **Link checker** — `node scripts/check-links.mjs` exit 0 confirms all cross-links resolve, including new landing-page-to-deep-dive links. Non-zero exit = broken navigation.
- **Failure path: broken relative link** — If a link in `commands.md` uses `../auto/` instead of `auto/`, the link checker will report it as unresolved since `commands.md` renders at `/commands/` (not a subdirectory).

## Inputs

- `src/content/docs/commands.md` — existing commands reference page with tables
- 9 `.mdx` files in `src/content/docs/commands/` — created by T01 and T02
- `astro.config.mjs` — sidebar already has all 9 entries from T01/T02

## Expected Output

- `src/content/docs/commands.md` — updated with deep-dive links for 9 commands
- Verified: build passes, links pass, 36 pages, Pagefind indexes new content
