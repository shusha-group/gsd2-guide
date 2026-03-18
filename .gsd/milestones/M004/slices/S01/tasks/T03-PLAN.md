---
estimated_steps: 6
estimated_files: 3
---

# T03: Wire update.mjs, remove SDK dependency, and run integration proof

**Slice:** S01 — Claude Code Regeneration Engine
**Milestone:** M004

## Description

Three closing tasks for the slice:

1. **Wire `update.mjs`**: Replace the `ANTHROPIC_API_KEY` guard in `runRegenerateStale()` with a `claude` CLI availability check using `findClaude()` from the rewritten `regenerate-page.mjs`.

2. **Remove `@anthropic-ai/sdk`**: Delete the dependency from `package.json` devDependencies and run `npm install` to update the lockfile.

3. **Integration proof**: Run `node scripts/lib/regenerate-page.mjs commands/capture.mdx` to regenerate a real documentation page via `claude -p`. Verify the output has correct frontmatter and all 6 required sections. Run `npm run build` to confirm the Astro build passes. This is the slice's proof — it demonstrates that `claude -p` can produce M002-quality documentation.

## Steps

1. **Replace the API key guard in `update.mjs`.** Open `scripts/update.mjs`. Find the `runRegenerateStale()` function (around line 134). Replace:
   ```js
   if (!process.env.ANTHROPIC_API_KEY) {
     console.log(`  ⚠ ${stalePages.length} stale page(s) found but ANTHROPIC_API_KEY not set — skipping regeneration.`);
   ```
   With a `findClaude()` check:
   ```js
   import { findClaude } from "./lib/regenerate-page.mjs";
   // ... inside runRegenerateStale():
   if (!findClaude()) {
     console.log(`  ⚠ ${stalePages.length} stale page(s) found but claude CLI not available — skipping regeneration.`);
   ```
   Keep the rest of the skip logic unchanged (listing stale pages and returning). Also remove any other `ANTHROPIC_API_KEY` references in the file.

2. **Remove `@anthropic-ai/sdk` from `package.json`.** Delete the line `"@anthropic-ai/sdk": "^0.79.0"` from `devDependencies`. Run `npm install` to regenerate `package-lock.json`. Verify with `grep -r "@anthropic-ai/sdk" package.json` → no matches.

3. **Full codebase SDK audit.** Run `grep -r "@anthropic-ai/sdk" scripts/ tests/ src/` to verify no remaining references to the SDK anywhere in the codebase. If any are found, remove them.

4. **Run the integration proof.** Execute:
   ```bash
   node scripts/lib/regenerate-page.mjs commands/capture.mdx
   ```
   This will spawn `claude -p` and regenerate the exemplar page. Wait for it to complete (up to 5 minutes). Check the output for:
   - Exit code 0
   - Console output showing `✓ commands/capture.mdx`
   - Model name and duration in the output

5. **Verify regenerated page quality.** After the integration proof completes, validate the regenerated page:
   ```bash
   node -e "
   const fs = require('fs');
   const f = fs.readFileSync('src/content/docs/commands/capture.mdx', 'utf8');
   // Frontmatter check
   if (!f.startsWith('---\\n')) { console.error('FAIL: missing frontmatter start'); process.exit(1); }
   if (f.indexOf('---\\n', 4) === -1) { console.error('FAIL: missing frontmatter end'); process.exit(1); }
   // Section check
   const sections = ['What It Does','Usage','How It Works','What Files It Touches','Examples','Related Commands'];
   const missing = sections.filter(s => !f.includes('## ' + s));
   if (missing.length > 0) { console.error('FAIL: missing sections:', missing.join(', ')); process.exit(1); }
   console.log('✓ Frontmatter: valid');
   console.log('✓ Sections: all 6 present');
   console.log('✓ Integration proof passed');
   "
   ```

6. **Run build and tests.** Execute:
   ```bash
   npm run build
   node --test tests/regenerate-page.test.mjs
   ```
   Both must pass. The build confirms the regenerated page is valid Astro/MDX. The tests confirm T02's tests still pass after the SDK removal.

## Must-Haves

- [ ] `update.mjs` uses `findClaude()` instead of `ANTHROPIC_API_KEY` check
- [ ] `@anthropic-ai/sdk` removed from `package.json` devDependencies
- [ ] `grep -r "@anthropic-ai/sdk" scripts/ tests/ package.json` returns nothing
- [ ] `node scripts/lib/regenerate-page.mjs commands/capture.mdx` completes successfully
- [ ] Regenerated `capture.mdx` has valid frontmatter and all 6 sections
- [ ] `npm run build` passes
- [ ] `node --test tests/regenerate-page.test.mjs` passes

## Verification

- `grep "ANTHROPIC_API_KEY" scripts/update.mjs` — returns nothing
- `grep "@anthropic-ai/sdk" package.json` — returns nothing
- `node -e "const f=require('fs').readFileSync('src/content/docs/commands/capture.mdx','utf8'); const ok=f.startsWith('---\\n') && ['What It Does','Usage','How It Works','What Files It Touches','Examples','Related Commands'].every(s=>f.includes('## '+s)); console.log(ok?'PASS':'FAIL'); if(!ok)process.exit(1)"` — prints PASS
- `npm run build` — exit code 0
- `node --test tests/regenerate-page.test.mjs` — all tests pass

## Observability Impact

- **Signal change:** `update.mjs` skip message changes from "ANTHROPIC_API_KEY not set" to "claude CLI not available" — any log-monitoring that greps for the old message must be updated.
- **Inspection:** `grep "findClaude\|claude CLI" scripts/update.mjs` confirms the new guard is in place.
- **Failure visibility:** When claude CLI is absent, the pipeline still logs each stale page it would regenerate and returns gracefully — same pattern as before, different guard condition.
- **SDK removal proof:** `grep -r "@anthropic-ai/sdk" package.json scripts/ tests/` must return empty after this task.
- **Integration proof artifact:** `src/content/docs/commands/capture.mdx` — regenerated page with valid frontmatter and 6 sections serves as the M004-S01 demo artifact.

## Inputs

- `scripts/lib/regenerate-page.mjs` — T01's rewritten module with exported `findClaude()`
- `scripts/update.mjs` — current pipeline orchestrator with `ANTHROPIC_API_KEY` guard at line 141
- `tests/regenerate-page.test.mjs` — T02's rewritten test suite
- `package.json` — contains `@anthropic-ai/sdk` in devDependencies at line 30

## Expected Output

- `scripts/update.mjs` — updated to use `findClaude()` instead of `ANTHROPIC_API_KEY` check
- `package.json` — `@anthropic-ai/sdk` removed from devDependencies
- `package-lock.json` — regenerated without `@anthropic-ai/sdk`
- `src/content/docs/commands/capture.mdx` — regenerated by `claude -p` with valid frontmatter and all 6 sections (integration proof artifact)
