---
estimated_steps: 6
estimated_files: 4
---

# T02: Quality verification — regenerate 3 pages and validate against M02 originals

**Slice:** S02 — LLM Page Regeneration
**Milestone:** M003

## Description

Run the regeneration module against 3 diverse command pages (capture, doctor, auto) to prove the Claude API produces output matching M02 quality. This is the risk-retirement step for the highest risk in M003 — if the API can't match Claude Code's documentation quality, the milestone's value proposition fails. Compare each regenerated page against its original for section structure, Mermaid diagram quality, link correctness, and content depth. Run the build + link checker to verify regenerated pages are valid. Record token usage and cost per page. If quality issues are found, tune the system prompt in `regenerate-page.mjs` and re-run.

**This task requires ANTHROPIC_API_KEY to be set.** If not available, use `secure_env_collect` to collect it before proceeding.

## Steps

1. **Ensure ANTHROPIC_API_KEY is set.** Check `echo $ANTHROPIC_API_KEY | head -c4`. If empty, use `secure_env_collect` with key `ANTHROPIC_API_KEY` (hint: "starts with sk-ant-") and destination `dotenv`. Then `source .env` or `export` it.

2. **Back up the 3 original pages.** Copy each to a `.bak` file:
   - `cp src/content/docs/commands/capture.mdx src/content/docs/commands/capture.mdx.bak`
   - `cp src/content/docs/commands/doctor.mdx src/content/docs/commands/doctor.mdx.bak`
   - `cp src/content/docs/commands/auto.mdx src/content/docs/commands/auto.mdx.bak`

3. **Regenerate the 3 pages sequentially.** Run each individually to observe per-page output:
   - `node scripts/lib/regenerate-page.mjs commands/capture.mdx` — light (5 deps, ~31K tokens)
   - `node scripts/lib/regenerate-page.mjs commands/doctor.mdx` — medium (7 deps)
   - `node scripts/lib/regenerate-page.mjs commands/auto.mdx` — heavy (11 deps, ~92K tokens)
   
   Record the token usage (inputTokens, outputTokens) and elapsed time from each run's output.

4. **Validate regenerated page structure.** For each of the 3 regenerated pages, verify:
   - **Frontmatter**: Starts with `---`, has `title:` and `description:` fields, closes with `---`
   - **Section order**: What It Does → Usage → How It Works → What Files It Touches → Examples → Related Commands (all present, in this order)
   - **Mermaid diagrams**: If the original had Mermaid blocks, the regenerated page should too. Check that Mermaid blocks use `flowchart TD` and the terminal-native color scheme (`fill:#0d180d,stroke:#39ff14,color:#39ff14` for decisions, `fill:#1a3a1a,stroke:#39ff14,color:#e8f4e8` for actions)
   - **Links**: All internal links use `../slug/` relative format
   - **Tables**: "What Files It Touches" section has tables with File + Purpose columns
   
   Use `diff` between original and regenerated to see what changed: `diff src/content/docs/commands/capture.mdx.bak src/content/docs/commands/capture.mdx`

5. **Run build and link check with regenerated pages.** Execute `npm run build && node scripts/check-links.mjs`. This verifies the regenerated MDX is valid (no Astro build errors) and all links resolve correctly. If the build fails, examine the error — likely frontmatter or Mermaid syntax issues. Fix the prompt in `regenerate-page.mjs` if systematic issues are found, then re-run the affected page(s).

6. **Restore originals and record results.** Copy backups back:
   - `cp src/content/docs/commands/capture.mdx.bak src/content/docs/commands/capture.mdx`
   - `cp src/content/docs/commands/doctor.mdx.bak src/content/docs/commands/doctor.mdx`
   - `cp src/content/docs/commands/auto.mdx.bak src/content/docs/commands/auto.mdx`
   - Remove `.bak` files
   
   The task summary should document: per-page token usage, per-page cost estimate, quality assessment (pass/fail per page with notes), and any prompt adjustments made.

## Must-Haves

- [ ] 3 command pages (capture, doctor, auto) successfully regenerated via Claude API
- [ ] All 3 regenerated pages pass `npm run build && node scripts/check-links.mjs`
- [ ] All 3 regenerated pages have correct section structure matching M02 format
- [ ] Token usage and cost documented for each page
- [ ] Original pages restored after verification
- [ ] Any prompt adjustments committed if quality issues required tuning

## Verification

- `npm run build && node scripts/check-links.mjs` passes with regenerated pages in place (run before restoring originals)
- Each regenerated page has all 6 required sections in correct order
- Mermaid diagrams (where present in originals) use terminal-native color scheme
- All internal links use `../slug/` format
- Per-page token usage and cost logged in CLI output

## Observability Impact

- Signals added/changed: Per-page regeneration cost data (inputTokens, outputTokens, elapsedMs) establishes the cost baseline for S04's reporting requirement
- How a future agent inspects this: Re-run `node scripts/lib/regenerate-page.mjs commands/capture.mdx` — CLI prints full diagnostics
- Failure state exposed: Build errors from invalid MDX, link checker failures from broken relative links, `stop_reason: 'max_tokens'` warnings from truncated output

## Inputs

- `scripts/lib/regenerate-page.mjs` — the regeneration module built in T01
- `content/generated/page-source-map.json` — maps pages to source deps (CLI uses this for single-page mode)
- `src/content/docs/commands/capture.mdx` — light command page (5 deps, exemplar)
- `src/content/docs/commands/doctor.mdx` — medium command page (7 deps)
- `src/content/docs/commands/auto.mdx` — heavy command page (11 deps)
- T01 task summary — confirms module works, any quirks discovered during testing

## Expected Output

- Quality verification results for 3 pages documented in task summary
- Token usage and cost data per page (for S04 consumption)
- Any prompt tuning changes committed to `scripts/lib/regenerate-page.mjs`
- Original pages restored to pre-verification state
- Build + link check confirmed passing with current (original) content
