---
id: S05
parent: M005
milestone: M005
written: 2026-03-19
---

# S05: Pipeline integration — UAT

**Milestone:** M005
**Written:** 2026-03-19

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All deliverables are deterministic script outputs. Tests verify exact step counts, function exports, and file mutations. Stale detection is verified end-to-end by manipulating `page-versions.json` and observing `check-page-freshness.mjs` exit codes. No human UI judgment required.

## Preconditions

1. Working directory is `/Users/davidspence/dev/gsd2-guide/.gsd/worktrees/M005`
2. `node scripts/check-page-freshness.mjs` exits 0 before testing begins (all stamps current)
3. `content/generated/prompts.json` exists with 32 entries (S01 output)
4. `src/content/docs/prompts/` contains 32 `.mdx` files (S02/S03 output)
5. `page-versions.json` has 80 total entries (32 `prompts/` + 48 existing)

## Smoke Test

Run the manage-pages CLI in detect-only mode:

```
node scripts/lib/manage-pages.mjs
```

**Expected:** Exits 0. Prints "New prompts: (none)" and "Removed prompts: (none)" and "✓ All prompts in sync".

---

## Test Cases

### 1. manage-pages.mjs exports all 5 prompt functions

```bash
node -e "
import('./scripts/lib/manage-pages.mjs').then(m => {
  const fns = ['detectNewAndRemovedPrompts','addPromptSidebarEntry','removePromptSidebarEntry','createNewPromptPages','removePromptPages'];
  fns.forEach(f => console.log(f, typeof m[f]));
})
"
```

**Expected:** Each function name prints followed by `function`. Zero `undefined` values.

---

### 2. detectNewAndRemovedPrompts — in-sync state

```bash
node -e "import('./scripts/lib/manage-pages.mjs').then(m => m.detectNewAndRemovedPrompts().then(r => console.log(JSON.stringify(r))))"
```

**Expected:** `{"newPrompts":[],"removedPrompts":[]}` — both arrays empty.

---

### 3. detectNewAndRemovedPrompts — detects a new .md source with no matching .mdx page

```bash
# Create a fake prompt source file in a temp directory and a temp page dir with no matching page
node -e "
import { mkdtempSync, writeFileSync, mkdirSync } from 'fs';
import os from 'os';
import path from 'path';
import('./scripts/lib/manage-pages.mjs').then(async m => {
  const srcDir = mkdtempSync(path.join(os.tmpdir(), 'prompts-src-'));
  const pageDir = mkdtempSync(path.join(os.tmpdir(), 'prompts-pages-'));
  writeFileSync(path.join(srcDir, 'new-prompt.md'), '# new prompt');
  const result = await m.detectNewAndRemovedPrompts({
    promptsSourceDir: srcDir,
    promptsPageDir: pageDir
  });
  console.log(JSON.stringify(result));
});
"
```

**Expected:** `{"newPrompts":["new-prompt"],"removedPrompts":[]}` — `new-prompt` appears in `newPrompts`.

---

### 4. detectNewAndRemovedPrompts — detects a .mdx page with no matching .md source

```bash
node -e "
import { mkdtempSync, writeFileSync, mkdirSync } from 'fs';
import os from 'os';
import path from 'path';
import('./scripts/lib/manage-pages.mjs').then(async m => {
  const srcDir = mkdtempSync(path.join(os.tmpdir(), 'prompts-src-'));
  const pageDir = mkdtempSync(path.join(os.tmpdir(), 'prompts-pages-'));
  writeFileSync(path.join(pageDir, 'old-prompt.mdx'), '---\ntitle: old\n---');
  const result = await m.detectNewAndRemovedPrompts({
    promptsSourceDir: srcDir,
    promptsPageDir: pageDir
  });
  console.log(JSON.stringify(result));
});
"
```

**Expected:** `{"newPrompts":[],"removedPrompts":["old-prompt"]}` — `old-prompt` appears in `removedPrompts`.

---

### 5. update-pipeline step count and order

```bash
node --test tests/update-pipeline.test.mjs
```

**Expected:** Exit 0. Output includes:
- `tests 10`
- `pass 10`
- `fail 0`
- The pipeline step names test includes `manage prompts` in the expected array.

---

### 6. page-versions.json has 32 prompts/ stamps

```bash
python3 -c "import json; d=json.load(open('page-versions.json')); print(len([k for k in d if k.startswith('prompts/')]))"
```

**Expected:** `32`

---

### 7. check-page-freshness.mjs — all pages fresh

```bash
node scripts/check-page-freshness.mjs; echo "EXIT:$?"
```

**Expected:** Prints `[freshness] ✅ All pages are current with their source dependencies`. Exit code `0`.

---

### 8. Stale detection end-to-end — prompt page correctly flagged

```bash
# Step 1: Tamper one prompt page dep SHA
python3 -c "
import json
with open('page-versions.json') as f:
    d = json.load(f)
for k in d:
    if k.startswith('prompts/'):
        deps = d[k].get('deps', {})
        for dep_key in deps:
            deps[dep_key] = 'deadbeef'
            print(f'Tampered: {k} dep {dep_key}')
            break
        break
with open('page-versions.json', 'w') as f:
    json.dump(d, f, indent=2)
"

# Step 2: Run freshness check — expect stale report
node scripts/check-page-freshness.mjs; echo "EXIT:$?"
```

**Expected step 2:** Exit code `1`. Output includes a line like:
```
prompts/complete-milestone.mdx: complete-milestone.md
```
(exact page name matches the tampered key)

```bash
# Step 3: Re-stamp
node scripts/check-page-freshness.mjs --stamp

# Step 4: Confirm all-fresh again
node scripts/check-page-freshness.mjs; echo "EXIT:$?"
```

**Expected step 4:** Exit code `0`. Prints "All pages are current".

---

### 9. regenerate-page.mjs prompt dispatch — correct system prompt selected

```bash
grep -A 10 "startsWith.*prompts" scripts/lib/regenerate-page.mjs
```

**Expected:** Shows a conditional block where `pagePath.startsWith('prompts/')` leads to `buildPromptSystemPrompt` (or similar prompt-specific function), and an `else` branch uses the command system prompt.

---

### 10. npm run build — 0 errors with all prompt pages present

```bash
npm run build 2>&1 | tail -10
```

**Expected:** Output ends with `[build] Complete!`. Page count is ≥ 104. No error lines.

---

### 11. manage-pages test suite — all 54 tests pass

```bash
node --test tests/manage-pages.test.mjs
```

**Expected:** Exit 0. Output includes:
- `tests 54`
- `pass 54`
- `fail 0`

---

## Edge Cases

### headSha tampering does NOT trigger stale detection

```bash
python3 -c "
import json
with open('page-versions.json') as f:
    d = json.load(f)
# Tamper headSha only (metadata, not used for staleness)
for k in d:
    if k.startswith('prompts/'):
        d[k]['headSha'] = 'nottherealshaanymore'
        print(f'Tampered headSha for: {k}')
        break
with open('page-versions.json', 'w') as f:
    json.dump(d, f, indent=2)
"
node scripts/check-page-freshness.mjs; echo "EXIT:$?"
```

**Expected:** Exit code `0`. Stale detection ignores `headSha` entirely — only `deps[dep]` SHA values drive staleness. Re-stamp afterwards with `node scripts/check-page-freshness.mjs --stamp`.

---

### CLI with --prompts flag only runs prompt detection

```bash
node scripts/lib/manage-pages.mjs --prompts 2>&1
```

**Expected:** Output mentions prompts detection result ("New prompts: (none)" / "Removed prompts: (none)"). Exit 0.

---

### createNewPromptPages returns structured result on failure

If a prompt slug cannot be scaffolded (e.g., invalid directory), the return value includes `{ failed: N }` with a non-zero count, and each failed result has an `.error` field. This can be verified in unit tests rather than integration smoke tests.

---

## Failure Signals

- `node --test tests/manage-pages.test.mjs` → any `fail > 0` means a prompt function regressed
- `node --test tests/update-pipeline.test.mjs` → fail on step count or step name means pipeline wiring broke
- `node scripts/check-page-freshness.mjs` → exit 1 with stale `prompts/` pages (unexpected after stamping) means a dep hash conflict
- `npm run build` → error containing `ReferenceError: ... is not defined` in a `.mdx` file means a `{{variable}}` escaped incorrectly in a prompt page (MDX curly-brace issue)
- `node scripts/lib/manage-pages.mjs` → non-zero exit or unexpected output means sidebar detection regex broke

## Requirements Proved By This UAT

- R057 — prompt pages are lifecycle-managed: detect, scaffold, remove
- R058 — regeneration dispatches the correct 4-section system prompt for prompt pages
- R059 — stale detection covers all 32 prompt pages end-to-end
- R060 — `npm run update` is fully prompt-aware with a dedicated 10th step

## Not Proven By This UAT

- Full `npm run update` end-to-end execution (requires claude -p subprocess; this UAT proves all components but not the subprocess invocation itself)
- Quality of content produced by `buildPromptSystemPrompt()` during actual regeneration (subjective; proved in S03 for the exemplar page)
- Performance under large numbers of new/removed prompts simultaneously

## Notes for Tester

- The stale simulation in Test Case 8 deliberately tampers `page-versions.json`. Always re-stamp after the test (`node scripts/check-page-freshness.mjs --stamp`) to restore the clean state.
- Test Case 9 (headSha edge case) also modifies `page-versions.json` — re-stamp after.
- `buildPromptSystemPrompt()` reads `execute-task.mdx` at import time. If you've moved or deleted that file in testing, a warning will appear on stderr but the function still returns.
- The stale detection checks `recorded.deps[dep]` vs `manifest.files[dep]` — not `headSha`. This is counter-intuitive but confirmed by T02's investigation detour.
