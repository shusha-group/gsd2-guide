# S03: Command deep-dives — planning, maintenance, and utility commands — UAT

**Milestone:** M002
**Written:** 2026-03-17

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All deliverables are static MDX pages rendered into HTML at build time. Build success, link integrity, page presence, sidebar wiring, and Pagefind indexing collectively prove the slice works. No runtime behavior to test.

## Preconditions

- `npm run build` has completed successfully (dist/ directory populated)
- `node scripts/check-links.mjs` passes with 0 broken links

## Smoke Test

Navigate to the built site's commands sidebar section. Confirm there are 28 entries (27 command pages + 1 Commands Reference link). Click any S03 page (e.g., `/commands/doctor/`) and verify it renders with content, not a 404.

## Test Cases

### 1. All 18 new pages exist in dist/

1. Run `ls dist/commands/{queue,steer,capture,triage,knowledge,cleanup,doctor,forensics,prefs,mode,skill-health,config,hooks,run-hook,migrate,keyboard-shortcuts,cli-flags,headless}/index.html | wc -l`
2. **Expected:** 18

### 2. Total command page count is 27

1. Run `ls src/content/docs/commands/*.mdx | wc -l`
2. **Expected:** 27
3. Run `ls dist/commands/*/index.html | wc -l`
4. **Expected:** 27

### 3. Sidebar has 28 command entries

1. Run `grep "'/commands/" astro.config.mjs | wc -l`
2. **Expected:** 28 (27 pages + 1 Commands Reference link)

### 4. Commands landing page has deep-dive links for all S03 commands

1. Run `grep -c 'queue/\|steer/\|capture/\|triage/\|knowledge/\|cleanup/' content/generated/docs/commands.md`
2. **Expected:** ≥6 (T01 commands linked)
3. Run `grep -c 'doctor/\|forensics/\|prefs/\|mode/\|skill-health/\|config/' content/generated/docs/commands.md`
4. **Expected:** ≥6 (T02 commands linked)
5. Run `grep -c 'hooks/\|run-hook/\|migrate/\|keyboard-shortcuts/\|cli-flags/\|headless/' content/generated/docs/commands.md`
6. **Expected:** ≥6 (T03 commands linked)

### 5. Mermaid diagrams render for complex commands

1. Run `grep -l 'mermaid' src/content/docs/commands/{queue,steer,triage,doctor,forensics,prefs,skill-health,config,run-hook,migrate,headless}.mdx | wc -l`
2. **Expected:** 11 (all commands that should have Mermaid diagrams)

### 6. Simple commands use prose + tables instead of Mermaid

1. Run `grep -cL 'mermaid' src/content/docs/commands/{capture,knowledge,cleanup,hooks,mode,keyboard-shortcuts,cli-flags}.mdx | wc -l`
2. **Expected:** 7 (none of these should contain mermaid blocks)

### 7. Build produces 54 total pages

1. Run `npm run build 2>&1 | grep 'page(s) built'`
2. **Expected:** "54 page(s) built"

### 8. Pagefind indexes all pages

1. Run `npm run build 2>&1 | grep 'Found.*HTML files'`
2. **Expected:** "Found 54 HTML files."

### 9. Link integrity across all pages

1. Run `node scripts/check-links.mjs`
2. **Expected:** Exit 0, "0 broken" in output, 2880+ links checked

### 10. Doctor page has issue code reference

1. Run `grep -c 'issue code\|PROJ-\|MILE-\|SLICE-\|TASK-\|GIT-' src/content/docs/commands/doctor.mdx`
2. **Expected:** ≥10 (multiple issue code prefixes documented)

### 11. Headless page has exit code reference

1. Run `grep -c 'exit code\|Exit Code' src/content/docs/commands/headless.mdx`
2. **Expected:** ≥2

## Edge Cases

### Unlinked commands in landing page are intentional

1. Run `grep '| \x60/gsd' content/generated/docs/commands.md | grep -v '\['`
2. **Expected:** Only `/gsd help` and `/gsd parallel *` variants remain unlinked — these are intentional (help is inline text, parallel commands covered by parallel-orchestration page)

### Mermaid styling consistency

1. Run `grep -c 'fill:#1a3a1a' src/content/docs/commands/doctor.mdx`
2. **Expected:** ≥1 (uses dark terminal theme)
3. Run `grep -c 'stroke:#39ff14' src/content/docs/commands/doctor.mdx`
4. **Expected:** ≥1

### Cross-links use correct format

1. Run `grep -o '\.\./[a-z-]*/\)' src/content/docs/commands/doctor.mdx | head -5`
2. **Expected:** Links use `../sibling/` format (relative paths with trailing slash)

## Failure Signals

- `npm run build` fails or produces fewer than 54 pages — missing or broken MDX page
- `node scripts/check-links.mjs` reports broken links — cross-link format error
- Any `dist/commands/<name>/index.html` missing — sidebar entry exists but page doesn't build
- `grep "'/commands/" astro.config.mjs | wc -l` returns less than 28 — missing sidebar entries
- Pagefind indexes fewer than 54 pages — page not reachable by search

## Requirements Proved By This UAT

- R027 — Full command coverage verified by page count (27 MDX, 27 dist HTML) and sidebar wiring (28 entries)
- R030 — Lifecycle documentation verified by Mermaid diagram presence (11 complex commands) and page structure consistency
- R031 — Visual documentation approach verified by Mermaid styling consistency and diagram count across S03 pages

## Not Proven By This UAT

- Content accuracy of command internals (requires human review against GSD source code)
- Mermaid diagram visual rendering quality (requires visual inspection in a browser)
- Terminal example accuracy (requires comparison with actual GSD terminal output)
- R028 — Recipe pages are S04's scope, not S03

## Notes for Tester

- The commands landing page at `content/generated/docs/commands.md` is a generated file — edits go in `content/generated/docs/`, not `src/content/docs/`. The prebuild script copies it on build.
- Doctor is the most content-rich page. If you only have time to spot-check one page for quality, check doctor.
- Three "unlinked" commands in the landing page are intentional and documented — don't flag `/gsd help` or `/gsd parallel *` as missing.
