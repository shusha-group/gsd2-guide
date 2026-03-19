# S04: Command page backlinks — UAT

**Milestone:** M005
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S04 produces static MDX content. All correctness signals are observable from the built artifact — section presence, link format, link resolution. No runtime server state or user-facing interaction required beyond link traversal.

## Preconditions

1. Working directory is `/Users/davidspence/dev/gsd2-guide/.gsd/worktrees/M005`
2. `npm run build` has been run and `dist/` is populated (build takes ~6s)
3. No local edits to command MDX files in progress

## Smoke Test

```bash
grep -c "## Prompts Used" src/content/docs/commands/auto.mdx
```

**Expected:** `1` — the section exists exactly once in the auto command page.

## Test Cases

### 1. All 16 target command pages have a "Prompts Used" section

```bash
grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l
```

**Expected:** `16`

```bash
grep -L "## Prompts Used" src/content/docs/commands/*.mdx
```

**Expected:** empty output (no command files missing the section)

---

### 2. The section is positioned immediately before "Related Commands"

```bash
grep -n "## Prompts Used\|## Related Commands" src/content/docs/commands/auto.mdx
```

**Expected:** Two lines where `## Prompts Used` line number < `## Related Commands` line number, and they are adjacent (no other `##` heading between them).

```bash
grep -B1 "## Related Commands" src/content/docs/commands/discuss.mdx
```

**Expected:** The line immediately before `## Related Commands` is a blank line that follows the last prompt bullet, confirming insertion order. (`## Prompts Used` should appear ~3 lines above.)

---

### 3. Link format is correct (../../prompts/{slug}/ — two levels up)

```bash
grep "../../prompts/" src/content/docs/commands/auto.mdx | head -5
```

**Expected:** Lines like:
```
- [`complete-milestone`](../../prompts/complete-milestone/) — Closes out a milestone after all slices are done
```
Format must be: backtick-quoted slug as link text, `../../prompts/{slug}/` as href, ` — ` em-dash, short description.

---

### 4. Prompt link counts match expected per-command values

```bash
grep -c "../../prompts/" src/content/docs/commands/auto.mdx
grep -c "../../prompts/" src/content/docs/commands/gsd.mdx
```

**Expected:** `12` for auto, `10` for gsd.

```bash
grep -c "../../prompts/" src/content/docs/commands/discuss.mdx
grep -c "../../prompts/" src/content/docs/commands/doctor.mdx
grep -c "../../prompts/" src/content/docs/commands/migrate.mdx
```

**Expected:** `1` each — single-prompt commands.

---

### 5. Links are alphabetically sorted within each section

```bash
grep "../../prompts/" src/content/docs/commands/auto.mdx
```

**Expected:** The 12 prompt slugs appear in alphabetical order:
- complete-milestone
- complete-slice
- execute-task
- plan-milestone
- plan-slice
- reassess-roadmap
- replan-slice
- research-milestone
- research-slice
- rewrite-docs
- run-uat
- validate-milestone

---

### 6. Build succeeds at 104 pages with no errors

```bash
npm run build 2>&1 | tail -5
```

**Expected:**
```
[build] 104 page(s) built in Xs
[build] Complete!
```
Exit code 0. No `error` lines in output.

---

### 7. All cross-links (prompt↔command) resolve — 0 broken links

```bash
npm run check-links 2>&1
```

**Expected:**
```
[link-check] ✅ 10380 internal links checked — 0 broken
```
Exit code 0. No broken links mentioning `prompts/` in the output.

---

### 8. Non-target command pages are unmodified (no spurious sections)

```bash
grep -l "## Prompts Used" src/content/docs/commands/status.mdx \
     src/content/docs/commands/stop.mdx \
     src/content/docs/commands/next.mdx \
     src/content/docs/commands/update.mdx 2>/dev/null
```

**Expected:** empty — commands that don't invoke prompts should have no `## Prompts Used` section.

---

### 9. One-shot script has been deleted

```bash
ls scripts/add-prompt-backlinks.mjs 2>&1
```

**Expected:** `ls: scripts/add-prompt-backlinks.mjs: No such file or directory` (exit code 1).

---

### 10. Built HTML contains prompt links on command pages

```bash
grep -o 'href="/gsd2-guide/prompts/[^"]*"' dist/commands/auto/index.html | head -5
```

**Expected:** Lines like `href="/gsd2-guide/prompts/complete-milestone/"` — confirms the Astro build rendered the MDX links into working HTML hrefs with the correct base path.

## Edge Cases

### Commands with only 1 prompt link render correctly

```bash
grep -A 5 "## Prompts Used" src/content/docs/commands/discuss.mdx
```

**Expected:** Single bullet line with `[discuss](../../prompts/discuss/)` and a short description. Section ends cleanly before `## Related Commands`.

---

### Description truncation produces readable phrases

```bash
grep "../../prompts/rewrite-docs\|../../prompts/run-uat" src/content/docs/commands/auto.mdx
```

**Expected:** Both lines have non-empty descriptions after the em-dash. These prompts had no em-dash in their source description, so the fallback truncation (period-split or 80-char cap) was used. Descriptions should be meaningful, not empty or truncated mid-word.

---

### capture and triage both link to triage-captures

```bash
grep "triage-captures" src/content/docs/commands/capture.mdx src/content/docs/commands/triage.mdx
```

**Expected:** Both files contain a link to `../../prompts/triage-captures/` — confirming the reverse map correctly handles one prompt referenced by multiple commands.

## Failure Signals

- `grep -rl "## Prompts Used" src/content/docs/commands/*.mdx | wc -l` returns anything other than `16` → section missing from one or more files
- `grep -L "## Prompts Used" src/content/docs/commands/*.mdx` returns file names → identify which files are missing and re-run the insertion script
- `npm run build` fails with a link error mentioning `prompts/` → slug typo in a prompt link; inspect with `grep "../../prompts/" src/content/docs/commands/*.mdx | grep {bad-slug}`
- `npm run check-links` reports broken links → same diagnosis as above; the check-links output shows the exact URL and source page
- `## Prompts Used` appears after `## Related Commands` → insertion anchor logic failed; check `grep -n "## Prompts Used\|## Related Commands"` on the affected file
- `dist/commands/auto/index.html` has no `href="/gsd2-guide/prompts/` links → Astro didn't render the MDX links; check for frontmatter parse errors in the command file

## Requirements Proved By This UAT

- R057 (prompt reference section) — partially proved: command pages link to prompt pages. Full R057 validation requires the complete prompt reference section (all 32 pages, S05 pipeline) and is achieved at milestone completion.
- R058 (bidirectional links) — proved: prompt pages (S03) link to commands AND command pages (S04) link to prompts. Both directions are confirmed working by `npm run check-links`.

## Not Proven By This UAT

- That `npm run update` detects prompt page staleness and regenerates — this is S05's scope
- That all 32 prompt pages render correctly in a browser with Mermaid diagrams — S03's scope
- That the sidebar correctly groups prompts into 4 sections — S02's scope
- End-to-end pipeline integration (S05)

## Notes for Tester

- The 17 command pages that have no `## Prompts Used` section (status, stop, next, update, etc.) are correct — those commands don't invoke GSD prompts directly, so no backlinks apply. Don't interpret their absence as a bug.
- Link descriptions are deliberately short phrases, not full sentences — this is by design to keep the command page readable. Follow the link to the prompt page for the complete description.
- The `discuss` prompt appears in both `discuss.mdx` and `steer.mdx` — this is correct, as both commands invoke the discuss prompt.
- `system` prompt appears in both `config.mdx` and `knowledge.mdx` — also correct.
