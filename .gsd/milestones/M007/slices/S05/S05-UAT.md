# S05: Navigation Polish — UAT

**Milestone:** M007
**Written:** 2026-04-02T04:43:29.438Z

# S05: Navigation Polish — UAT

**Milestone:** M007
**Written:** 2026-04-02

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All deliverables are static sidebar configuration changes verified by build output and link checker. No runtime behavior involved.

## Preconditions

- Project built successfully (`npm run build`) with 148 pages and 0 errors.
- Link checker passes (`npm run check-links`) with 0 broken links.

## Smoke Test

Open the built site and confirm the sidebar shows Getting Started before Deep Dives.

## Test Cases

### 1. Getting Started appears before Solo Builder's Guide and Deep Dives

1. Run `grep -n "Getting Started\|Solo Builder\|Deep Dives" astro.config.mjs | head -20`
2. **Expected:** "Getting Started" label appears at a lower line number than "Solo Builder's Guide" and "Deep Dives".

### 2. Writing a Good Brief and Cost Examples appear in Getting Started

1. Run `grep -q 'writing-a-good-brief' astro.config.mjs && echo "found" || echo "missing"`
2. Run `grep -q 'cost-examples' astro.config.mjs && echo "found" || echo "missing"`
3. **Expected:** Both return "found".

### 3. Orphaned prompts removed from Commands group

1. Run the position check:
   ```
   node -e "const fs=require('fs'); const c=fs.readFileSync('astro.config.mjs','utf8'); const cmdIdx=c.indexOf(\"label: 'Commands'\"); const prIdx=c.indexOf(\"label: 'Prompts'\"); if(c.indexOf('gate-evaluate')>cmdIdx && c.indexOf('gate-evaluate')<prIdx) {console.error('gate-evaluate still in Commands'); process.exit(1)} console.log('All checks pass')"
   ```
2. **Expected:** Prints "All checks pass" with exit code 0.

### 4. gate-evaluate, reactive-execute, rethink present in Prompts > Auto-mode Pipeline

1. Run `grep -A 100 "Auto-mode Pipeline" astro.config.mjs | grep -E "gate-evaluate|reactive-execute|rethink"`
2. **Expected:** All three slugs appear in output.

### 5. Full build and link check

1. Run `npm run build`
2. **Expected:** 148 page(s) built, 0 errors.
3. Run `npm run check-links`
4. **Expected:** 0 broken links.

## Edge Cases

### No existing URLs broken

1. Run `npm run check-links` after restructure.
2. **Expected:** 0 broken links — sidebar reordering never changes page URLs in Starlight (only display order changes).

## Failure Signals

- Build errors or page count drop below 148 would indicate a sidebar config syntax error.
- Broken links would indicate a slug was added to the sidebar that doesn't have a corresponding content page.
- gate-evaluate appearing between Commands and Prompts in the config would indicate the move didn't take effect.

## Not Proven By This UAT

- Visual rendering in a browser (sidebar display order, indentation, expand/collapse state).
- Mobile sidebar behavior.

## Notes for Tester

Sidebar restructuring in Starlight only affects display order and grouping — it never changes URL paths. The link checker passing is strong evidence that no content was accidentally removed or renamed.
